// Gatekeeper leaderboard and the app's push notifications. Node 24, node:sqlite, web-push.
// Same-origin behind nginx at /api/game/. Never exposed to the host.
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import webpush from "web-push";
// the deterministic core: copied next to this file in the image, read from the site tree when run from the repo
const core = await import("./core.js").catch(() => import("../site/game/core.js"));
const { replay } = core;
const RULES = String(core.RULES || "");
// the rules before the current ones, for the hour after a deploy: a page loaded before the
// change plays the old rules and does not know to say so (it sends no rules field)
const corePrev = await import("./core-prev.js").catch(() => null);
const BOOT = Date.now(), GRACE_MS = 60 * 60 * 1000;

const PORT = Number(process.env.PORT || 8787);
const SECRET = process.env.BOARD_SECRET;
if (!SECRET || SECRET.length < 32) { console.error("BOARD_SECRET (32+ chars) is required"); process.exit(1); }
const DB_PATH = process.env.BOARD_DB || "/data/board.sqlite";
const MIN_MS = Number(process.env.BOARD_MIN_MS || 20000);      // shortest run that counts
// One line per refused or accepted score, so "my run is not on the board" can be answered. No IP, no device id.
function note(kind, err, body, extra) {
  const s = (v, n) => String(v == null ? "" : v).slice(0, n);
  const b = body && typeof body === "object" ? body : {};
  console.log(new Date().toISOString(), `score ${kind}: ${err}`, JSON.stringify({ name: s(b.name, 24), score: s(b.score, 12), wave: s(b.wave, 4), dur: s(b.duration_ms, 10), ...(extra || {}) }));
}
const MAX_AGE_MS = 45 * 60 * 1000;                              // a token is good for one run, with room for a phone call in the middle (a run is at most 10 minutes of play)
const ALLOW_ORIGIN = process.env.BOARD_ALLOW_ORIGIN || "";      // local testing only
const CONTEST = (() => { const m = String(process.env.BOARD_CONTEST || "").match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/); return m ? { start: m[1], end: m[2] } : null; })();
const MAX_LOG = 20000;                                          // inputs per run the board will replay
const MAX_TICKS = 120000;
// push notifications for the installed app: VAPID keys and a secret for the sender, from the environment
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || "", VAPID_PRIVATE = process.env.VAPID_PRIVATE || "", VAPID_SUBJECT = process.env.VAPID_SUBJECT || "https://sable.primecircle.cloud", PUSH_SECRET = process.env.PUSH_SECRET || "";
const PUSH_ON = !!(VAPID_PUBLIC && VAPID_PRIVATE);
if (PUSH_ON) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
const RECORD_URL = "https://raw.githubusercontent.com/CryptoWesAI/sable-whitepaper-watch/main/record.json";
const DENY = ["fuck", "shit", "cunt", "nigg", "fag", "hitler", "nazi", "rape", "porn", "cock", "dick", "pussy", "whore", "slut"];

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY, day TEXT NOT NULL, seed TEXT NOT NULL, name TEXT NOT NULL, handle TEXT,
    score INTEGER NOT NULL, receipts INTEGER NOT NULL, refused INTEGER NOT NULL, wave INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL, device TEXT NOT NULL, log_hash TEXT, created_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS scores_day ON scores(day, score DESC);
  CREATE INDEX IF NOT EXISTS scores_score ON scores(score DESC);
  CREATE TABLE IF NOT EXISTS used_tokens (sig TEXT PRIMARY KEY, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS push_subs (id INTEGER PRIMARY KEY, endpoint TEXT UNIQUE NOT NULL, sub TEXT NOT NULL, created_at TEXT NOT NULL);
`);
// rows from before 8 September 2026 carry no log and stay unverified
for (const col of ["verified INTEGER NOT NULL DEFAULT 0", "log TEXT", "flagged INTEGER NOT NULL DEFAULT 0", "src TEXT"]) { try { db.exec(`ALTER TABLE scores ADD COLUMN ${col}`); } catch { /* already there */ } }
const ins = db.prepare("INSERT INTO scores (day, seed, name, handle, score, receipts, refused, wave, duration_ms, device, log_hash, created_at, verified, log, flagged, src) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)");
const markToken = db.prepare("INSERT INTO used_tokens (sig, created_at) VALUES (?, ?)");
const seenToken = db.prepare("SELECT 1 FROM used_tokens WHERE sig = ?");
const topQ = db.prepare(`SELECT name, handle, MAX(score) AS score, receipts, refused, wave, day FROM scores WHERE day >= ? GROUP BY lower(name) ORDER BY score DESC, id ASC LIMIT ?`);
// same as topQ, filtered to one src tag: a tagged link's runs, visible on their own leaderboard tab
const topSrcQ = db.prepare(`SELECT name, handle, MAX(score) AS score, receipts, refused, wave, day FROM scores WHERE day >= ? AND src = ? GROUP BY lower(name) ORDER BY score DESC, id ASC LIMIT ?`);
const contestQ = db.prepare(`SELECT name, handle, MAX(score) AS score, receipts, refused, wave, day FROM scores WHERE day >= ? AND day <= ? AND flagged = 0 AND handle IS NOT NULL AND handle != '' GROUP BY lower(handle) ORDER BY score DESC, id ASC LIMIT ?`);
const rankQ = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT lower(name) AS k, MAX(score) AS s FROM scores WHERE day >= ? GROUP BY k) WHERE s > ?`);
// GET /src?tag=: a small dashboard for one event's tag, over its unflagged runs only
const srcStatsQ = db.prepare(`SELECT COUNT(*) AS runs, COUNT(DISTINCT CASE WHEN handle IS NOT NULL AND handle != '' THEN lower(handle) END) AS players, MIN(created_at) AS first, MAX(created_at) AS last FROM scores WHERE src = ? AND flagged = 0`);
const srcBestQ = db.prepare(`SELECT score, name, handle FROM scores WHERE src = ? AND flagged = 0 ORDER BY score DESC, id ASC LIMIT 1`);
const meQ = db.prepare("SELECT name, handle, score, receipts, wave, day FROM scores WHERE device = ? ORDER BY score DESC LIMIT 1");
const byId = db.prepare("SELECT id, day, seed, name, handle, score, receipts, refused, wave, duration_ms, flagged, verified, log, created_at FROM scores WHERE id = ?");
// The card code: printed on a share card once the board has accepted the run, checkable by
// anyone at GET /card/:id/:code. Eight characters from an HMAC over the row, in an alphabet
// without 0/O and 1/I/L, so a card that was never on the board cannot carry a code that checks out.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
function cardCode(id, day, name, score, wave) {
  const dig = createHmac("sha256", SECRET).update(`card|${id}|${day}|${name}|${score}|${wave}`).digest();
  let out = "";
  for (let i = 0; i < 8; i++) out += CODE_ALPHABET[dig[i] % CODE_ALPHABET.length];
  return out;
}
const countQ = db.prepare("SELECT COUNT(*) AS n FROM scores");
const delName = db.prepare("DELETE FROM scores WHERE lower(name) = lower(?)");
const insSub = db.prepare("INSERT OR IGNORE INTO push_subs (endpoint, sub, created_at) VALUES (?, ?, ?)");
const delSub = db.prepare("DELETE FROM push_subs WHERE endpoint = ?");
const allSubs = db.prepare("SELECT endpoint, sub FROM push_subs");
const countSubs = db.prepare("SELECT COUNT(*) AS n FROM push_subs");

// The day's seed: UTC date plus the whitepaper record's latest snapshot hash,
// refreshed every hour, so the arena changes when the paper does.
let recordSha = "";
async function refreshRecord() {
  try {
    const r = await fetch(RECORD_URL, { signal: AbortSignal.timeout(6000) });
    if (r.ok) { const j = await r.json(); const e = (j.entries || [])[0]; if (e && e.sha256) recordSha = String(e.sha256).slice(0, 12); }
  } catch { /* keep the last one */ }
}
// fetched before the board listens, so the day's seed is the same from the first request on
await refreshRecord(); setInterval(refreshRecord, 3600 * 1000).unref();
const today = () => new Date().toISOString().slice(0, 10);
const seedFor = (day) => day + (recordSha ? ":" + recordSha : "");

const b64u = (b) => Buffer.from(b).toString("base64url");
const sign = (payload) => createHmac("sha256", SECRET).update(payload).digest("base64url");
const devHash = (d) => createHash("sha256").update("dev:" + SECRET + ":" + d).digest("hex").slice(0, 24);
function makeToken(seed, device) {
  const payload = b64u(JSON.stringify({ seed, t0: Date.now(), d: device }));
  return payload + "." + sign(payload);
}
function readToken(token) {
  if (typeof token !== "string" || token.length > 600) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const want = sign(payload);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try { const j = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return { ...j, sig }; } catch { return null; }
}

// in-memory rate limits; nothing about visitors is persisted beyond the score row
const buckets = new Map();
function limited(key, max) {
  const now = Date.now(), win = 3600 * 1000;
  const arr = (buckets.get(key) || []).filter((t) => now - t < win);
  if (arr.length >= max) { buckets.set(key, arr); return true; }
  arr.push(now); buckets.set(key, arr); return false;
}
setInterval(() => { const now = Date.now(); for (const [k, arr] of buckets) { const a = arr.filter((t) => now - t < 3600 * 1000); if (a.length) buckets.set(k, a); else buckets.delete(k); } }, 600 * 1000).unref();

const NAME_RE = /^[\p{L}\p{N} _.\-]{3,20}$/u;
function cleanName(n) {
  if (typeof n !== "string") return null;
  n = n.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!NAME_RE.test(n)) return null;
  const low = n.toLowerCase().replace(/[^a-z]/g, "");
  if (DENY.some((w) => low.includes(w))) return null;
  return n;
}
function cleanHandle(h) {
  if (h == null || h === "") return null;
  if (typeof h !== "string") return undefined;
  h = h.trim().replace(/^@/, "");
  return /^[A-Za-z0-9_]{1,15}$/.test(h) ? h : undefined;
}
// the tag on a link like ?src=java: lowercased when it looks like a tag, otherwise null. A run
// is never rejected for a bad tag, so this has no undefined case: it only ever stores or drops it.
const SRC_RE = /^[a-z0-9-]{1,24}$/i;
function cleanSrc(v) {
  if (typeof v !== "string") return null;
  const s = v.toLowerCase();
  return SRC_RE.test(s) ? s : null;
}
const cleanDevice = (d) => (typeof d === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(d)) ? d : null;

function json(res, code, body, extra = {}) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra };
  if (ALLOW_ORIGIN) { h["Access-Control-Allow-Origin"] = ALLOW_ORIGIN; h["Access-Control-Allow-Headers"] = "content-type"; h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"; }
  res.writeHead(code, h); res.end(JSON.stringify(body));
}
function readBody(req, max = 8192) {
  return new Promise((resolve, reject) => {
    if (Number(req.headers["content-length"] || 0) > max) return reject(new Error("too large"));
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > max) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(new Error("bad json")); } });
    req.on("error", reject);
  });
}
const ipOf = (req) => (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
const dayAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  try {
    if (req.method === "OPTIONS" && ALLOW_ORIGIN) return json(res, 204, {});
    if (req.method === "GET" && path === "/health") return json(res, 200, { ok: true, rows: countQ.get().n, seed: seedFor(today()), push: PUSH_ON, subscribers: countSubs.get().n });
    /* the app's notifications: a subscription is an endpoint at the phone's push service plus two keys; nothing else about the visitor */
    if (req.method === "GET" && path === "/push/key") return PUSH_ON ? json(res, 200, { key: VAPID_PUBLIC }) : json(res, 404, { error: "push off" });
    if (req.method === "POST" && path === "/push/subscribe") {
      if (!PUSH_ON) return json(res, 404, { error: "push off" });
      const body = await readBody(req); const sub = body.subscription;
      if (!sub || typeof sub.endpoint !== "string" || !/^https?:\/\/\S{10,500}$/.test(sub.endpoint) || !sub.keys || typeof sub.keys.p256dh !== "string" || typeof sub.keys.auth !== "string") return json(res, 400, { error: "subscription" });
      if (limited("sub:" + ipOf(req), 30)) return json(res, 429, { error: "slow down" });
      insSub.run(sub.endpoint, JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }), new Date().toISOString());
      return json(res, 200, { ok: true });
    }
    if (req.method === "POST" && path === "/push/unsubscribe") {
      const body = await readBody(req); if (typeof body.endpoint !== "string") return json(res, 400, { error: "endpoint" });
      delSub.run(body.endpoint); return json(res, 200, { ok: true });
    }
    if (req.method === "POST" && path === "/push/notify") {
      if (!PUSH_ON || !PUSH_SECRET) return json(res, 404, { error: "push off" });
      const given = String(req.headers["x-push-secret"] || "");
      if (given.length !== PUSH_SECRET.length || !timingSafeEqual(Buffer.from(given), Buffer.from(PUSH_SECRET))) return json(res, 401, { error: "secret" });
      const body = await readBody(req);
      const url = String(body.url || "/"); const safeUrl = /^\/[^\s]*$|^https:\/\/sable\.primecircle\.cloud(\/\S*)?$/.test(url) ? url : "/";
      const payload = JSON.stringify({ title: String(body.title || "Sable Observatory").slice(0, 80), body: String(body.body || "").slice(0, 200), url: safeUrl, tag: String(body.tag || "sable-observatory").slice(0, 40) });
      const subs = allSubs.all(); let sent = 0, failed = 0, removed = 0;
      await Promise.all(subs.map(async (row) => {
        try { await webpush.sendNotification(JSON.parse(row.sub), payload, { TTL: 86400 }); sent++; }
        catch (e) { const code = e && e.statusCode; if (code === 404 || code === 410) { delSub.run(row.endpoint); removed++; } else failed++; }
      }));
      return json(res, 200, { ok: true, sent, failed, removed, subscribers: countSubs.get().n });
    }
    const cm = req.method === "GET" ? path.match(/^\/card\/(\d{1,9})\/([A-Z0-9]{8})$/) : null;
    if (cm) {
      if (limited("cardip:" + ipOf(req), 300)) return json(res, 429, { error: "slow down" });
      const row = byId.get(Number(cm[1]));
      const want = row ? cardCode(row.id, row.day, row.name, row.score, row.wave) : "AAAAAAAA";
      if (!row || !timingSafeEqual(Buffer.from(cm[2]), Buffer.from(want))) return json(res, 404, { ok: false, error: "no such card" });
      // the details the card shows that the row does not store: replayed from the run's own log, under the rules it was played with
      let rp = null;
      try {
        const log = JSON.parse(row.log || "null");
        if (Array.isArray(log)) {
          let r = replay(String(row.seed), log);
          if (r.score !== row.score && corePrev) r = corePrev.replay(String(row.seed), log);
          if (r.score === row.score) rp = r;
        }
      } catch { rp = null; }
      return json(res, 200, { ok: true, run: {
        id: row.id, day: row.day, name: row.name, handle: row.handle, score: row.score, receipts: row.receipts, refused: row.refused, wave: row.wave, duration_ms: row.duration_ms,
        refused_loops: rp ? rp.refusedLoops : null, leaked: rp ? rp.leaked : null, clean_waves: rp ? rp.cleanWaves : null, wrong_refusals: rp ? rp.refusedGood : null,
        flagged: !!row.flagged, verified: !!row.verified, created_at: row.created_at, rank_today: rankQ.get(row.day, row.score).n + 1, code: want,
      } });
    }
    if (req.method === "GET" && path === "/top") {
      const srcTag = cleanSrc(url.searchParams.get("src"));
      // a tagged tab has no natural "today": an event's runs should stay visible after the day ends
      const period = url.searchParams.get("period") || (srcTag ? "all" : "today");
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 25)));
      if (period === "contest") return json(res, 200, { period, window: CONTEST, rows: CONTEST ? contestQ.all(CONTEST.start, CONTEST.end, limit) : [] });
      const since = period === "all" ? "0000-00-00" : period === "week" ? dayAgo(6) : today();
      const rows = srcTag ? topSrcQ.all(since, srcTag, limit) : topQ.all(since, limit);
      return json(res, 200, srcTag ? { period, since, src: srcTag, rows } : { period, since, rows });
    }
    if (req.method === "GET" && path === "/src") {
      const tag = cleanSrc(url.searchParams.get("tag")); if (!tag) return json(res, 400, { error: "tag" });
      if (limited("srcip:" + ipOf(req), 300)) return json(res, 429, { error: "slow down" });
      const stats = srcStatsQ.get(tag), best = srcBestQ.get(tag) || null;
      return json(res, 200, { tag, runs: stats.runs, players: stats.players, best, first: stats.first, last: stats.last });
    }
    if (req.method === "GET" && path === "/contest") {
      if (!CONTEST) return json(res, 200, { contest: null });
      const d = today();
      return json(res, 200, { contest: { ...CONTEST, status: d < CONTEST.start ? "before" : d > CONTEST.end ? "over" : "live", today: d } });
    }
    if (req.method === "GET" && path === "/me") {
      const d = cleanDevice(url.searchParams.get("device")); if (!d) return json(res, 400, { error: "device" });
      return json(res, 200, { best: meQ.get(devHash(d)) || null });
    }
    if (req.method === "POST" && path === "/start") {
      const body = await readBody(req);
      const d = cleanDevice(body.device); if (!d) return json(res, 400, { error: "device" });
      if (limited("start:" + devHash(d), 120) || limited("startip:" + ipOf(req), 400)) return json(res, 429, { error: "slow down" });
      const seed = seedFor(today());
      return json(res, 200, { seed, token: makeToken(seed, d), run_ms: 600000, min_ms: MIN_MS, rules: RULES });
    }
    if (req.method === "POST" && path === "/score") {
      const body = await readBody(req, 300 * 1024);
      const tok = readToken(body.token); if (!tok) { note("rejected", "token", body); return json(res, 400, { error: "token" }); }
      const d = cleanDevice(body.device); if (!d || d !== tok.d) { note("rejected", "device", body); return json(res, 400, { error: "device" }); }
      const age = Date.now() - Number(tok.t0);
      if (!(age >= 0 && age <= MAX_AGE_MS)) { note("rejected", "expired", body, { age_s: Math.round(age / 1000) }); return json(res, 400, { error: "expired" }); }
      // a client that loaded the page before a rules change would fail the replay; say so by name
      const oldClient = body.rules === undefined;
      const graced = oldClient && !!corePrev && Date.now() - BOOT < GRACE_MS;
      if ((!oldClient && String(body.rules) !== RULES) || (oldClient && !graced)) { note("rejected", "rules", body, { client: oldClient ? "none" : String(body.rules).slice(0, 24), server: RULES }); return json(res, 400, { error: "rules", rules: RULES }); }
      if (seenToken.get(tok.sig)) { note("rejected", "already submitted", body); return json(res, 409, { error: "already submitted" }); }
      const name = cleanName(body.name); if (!name) return json(res, 400, { error: "name" });
      const handle = cleanHandle(body.handle); if (handle === undefined) return json(res, 400, { error: "handle" });
      const src = cleanSrc(body.src); // a bad tag never fails the run, it just does not get a tab
      const score = Number(body.score), receipts = Number(body.receipts), refused = Number(body.refused), wave = Number(body.wave), dur = Number(body.duration_ms);
      const ints = [score, receipts, refused, wave, dur].every((v) => Number.isInteger(v) && v >= 0);
      if (!ints) return json(res, 400, { error: "numbers" });
      const secs = dur / 1000;
      if (dur < MIN_MS) { note("rejected", "too short", body); return json(res, 400, { error: "too short", min_ms: MIN_MS }); }
      if (dur > age + 2000 || dur > 600000 + 1000) { note("rejected", "duration", body, { age_s: Math.round(age / 1000) }); return json(res, 400, { error: "duration" }); }
      if (score > 500 * secs + 500 || receipts > 4 * secs + 10 || wave > 1 + Math.floor(dur / 20000) + 1) { note("rejected", "implausible", body, { receipts }); return json(res, 400, { error: "implausible" }); }
      // the input log: every tap at its tick, in order
      const log = body.log;
      if (!Array.isArray(log) || log.length > MAX_LOG) return json(res, 400, { error: "log" });
      let lastTick = -1;
      for (const e of log) {
        if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || e[0] < lastTick || e[0] > MAX_TICKS || (e[1] !== "refuse" && e[1] !== "attest" && e[1] !== "end") || !Number.isInteger(e[2])) return json(res, 400, { error: "log" });
        lastTick = e[0];
      }
      const dh = devHash(d);
      if (limited("score:" + dh, 30) || limited("scoreip:" + ipOf(req), 120)) { note("rejected", "slow down", body); return json(res, 429, { error: "slow down" }); }
      // the proof: the same seed and the same inputs at the same ticks must give the same run
      const rp = (graced ? corePrev.replay : replay)(String(tok.seed), log);
      if (rp.score !== score || rp.receipts !== receipts || rp.refused !== refused || rp.wave !== wave || Math.abs(rp.duration_ms - dur) > 100) {
        note("rejected", "replay", body, { replayed: { score: rp.score, receipts: rp.receipts, refused: rp.refused, wave: rp.wave, dur: rp.duration_ms }, inputs: log.length });
        return json(res, 400, { error: "replay" });
      }
      // the referee: a script taps every request at the same distance, a person never does; and a long
      // shift without one wrong tap or one leak is worth a look. Flagged runs stay on the board and out
      // of the contest until someone reads the log (admin.js flagged / unflag).
      const patient = rp.refuse_z_n >= 8 && rp.refuse_z_std < 2;
      const spotless = rp.leaked === 0 && rp.refusedGood === 0 && dur >= 150000;
      const flagged = patient || spotless ? 1 : 0;
      const now = new Date().toISOString(), day = now.slice(0, 10);
      markToken.run(tok.sig, now);
      const inserted = ins.run(day, String(tok.seed), name, handle, score, receipts, refused, wave, dur, dh, rp.log_hash, now, JSON.stringify(log), flagged, src);
      const id = Number(inserted.lastInsertRowid), code = cardCode(id, day, name, score, wave);
      const rankToday = rankQ.get(day, score).n + 1, rankAll = rankQ.get("0000-00-00", score).n + 1;
      note("accepted", (graced ? "previous rules, " : "") + (flagged ? "flagged" : "ok"), body, { rank_today: rankToday, id });
      return json(res, 200, { ok: true, rank_today: rankToday, rank_all: rankAll, name, handle, flagged: !!flagged, id, code });
    }
    return json(res, 404, { error: "not found" });
  } catch (e) {
    if (e.message === "too large") { json(res, 413, { error: "too large" }); return; }
    return json(res, 400, { error: "bad request" });
  }
});
server.requestTimeout = 10000;
server.headersTimeout = 8000;
server.listen(PORT, "0.0.0.0", () => console.log(`board listening on ${PORT}, db ${DB_PATH}, min run ${MIN_MS} ms`));

export { delName };
