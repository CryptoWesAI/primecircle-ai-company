// Gatekeeper leaderboard. Node 24, node:sqlite, no dependencies.
// Same-origin behind nginx at /api/game/. Never exposed to the host.
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
// the deterministic core: copied next to this file in the image, read from the site tree when run from the repo
const core = await import("./core.js").catch(() => import("../site/game/core.js"));
const { replay } = core;

const PORT = Number(process.env.PORT || 8787);
const SECRET = process.env.BOARD_SECRET;
if (!SECRET || SECRET.length < 32) { console.error("BOARD_SECRET (32+ chars) is required"); process.exit(1); }
const DB_PATH = process.env.BOARD_DB || "/data/board.sqlite";
const MIN_MS = Number(process.env.BOARD_MIN_MS || 20000);      // shortest run that counts
const MAX_AGE_MS = 15 * 60 * 1000;                              // a token is good for one run
const ALLOW_ORIGIN = process.env.BOARD_ALLOW_ORIGIN || "";      // local testing only
const CONTEST = (() => { const m = String(process.env.BOARD_CONTEST || "").match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/); return m ? { start: m[1], end: m[2] } : null; })();
const MAX_LOG = 20000;                                          // inputs per run the board will replay
const MAX_TICKS = 120000;
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
`);
// rows from before 8 September 2026 carry no log and stay unverified
for (const col of ["verified INTEGER NOT NULL DEFAULT 0", "log TEXT"]) { try { db.exec(`ALTER TABLE scores ADD COLUMN ${col}`); } catch { /* already there */ } }
const ins = db.prepare("INSERT INTO scores (day, seed, name, handle, score, receipts, refused, wave, duration_ms, device, log_hash, created_at, verified, log) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)");
const markToken = db.prepare("INSERT INTO used_tokens (sig, created_at) VALUES (?, ?)");
const seenToken = db.prepare("SELECT 1 FROM used_tokens WHERE sig = ?");
const topQ = db.prepare(`SELECT name, handle, MAX(score) AS score, receipts, refused, wave, day FROM scores WHERE day >= ? GROUP BY lower(name) ORDER BY score DESC, id ASC LIMIT ?`);
const contestQ = db.prepare(`SELECT name, handle, MAX(score) AS score, receipts, refused, wave, day FROM scores WHERE day >= ? AND day <= ? AND verified = 1 AND handle IS NOT NULL AND handle != '' GROUP BY lower(name) ORDER BY score DESC, id ASC LIMIT ?`);
const rankQ = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT lower(name) AS k, MAX(score) AS s FROM scores WHERE day >= ? GROUP BY k) WHERE s > ?`);
const meQ = db.prepare("SELECT name, handle, score, receipts, wave, day FROM scores WHERE device = ? ORDER BY score DESC LIMIT 1");
const countQ = db.prepare("SELECT COUNT(*) AS n FROM scores");
const delName = db.prepare("DELETE FROM scores WHERE lower(name) = lower(?)");

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
    if (req.method === "GET" && path === "/health") return json(res, 200, { ok: true, rows: countQ.get().n, seed: seedFor(today()) });
    if (req.method === "GET" && path === "/top") {
      const period = url.searchParams.get("period") || "today";
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 25)));
      if (period === "contest") return json(res, 200, { period, window: CONTEST, rows: CONTEST ? contestQ.all(CONTEST.start, CONTEST.end, limit) : [] });
      const since = period === "all" ? "0000-00-00" : period === "week" ? dayAgo(6) : today();
      return json(res, 200, { period, since, rows: topQ.all(since, limit) });
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
      return json(res, 200, { seed, token: makeToken(seed, d), run_ms: 600000, min_ms: MIN_MS });
    }
    if (req.method === "POST" && path === "/score") {
      const body = await readBody(req, 300 * 1024);
      const tok = readToken(body.token); if (!tok) return json(res, 400, { error: "token" });
      const d = cleanDevice(body.device); if (!d || d !== tok.d) return json(res, 400, { error: "device" });
      const age = Date.now() - Number(tok.t0);
      if (!(age >= 0 && age <= MAX_AGE_MS)) return json(res, 400, { error: "expired" });
      if (seenToken.get(tok.sig)) return json(res, 409, { error: "already submitted" });
      const name = cleanName(body.name); if (!name) return json(res, 400, { error: "name" });
      const handle = cleanHandle(body.handle); if (handle === undefined) return json(res, 400, { error: "handle" });
      const score = Number(body.score), receipts = Number(body.receipts), refused = Number(body.refused), wave = Number(body.wave), dur = Number(body.duration_ms);
      const ints = [score, receipts, refused, wave, dur].every((v) => Number.isInteger(v) && v >= 0);
      if (!ints) return json(res, 400, { error: "numbers" });
      const secs = dur / 1000;
      if (dur < MIN_MS) return json(res, 400, { error: "too short", min_ms: MIN_MS });
      if (dur > age + 2000 || dur > 600000 + 1000) return json(res, 400, { error: "duration" });
      if (score > 500 * secs + 500 || receipts > 4 * secs + 10 || wave > 1 + Math.floor(dur / 20000) + 1) return json(res, 400, { error: "implausible" });
      // the input log: every tap at its tick, in order
      const log = body.log;
      if (!Array.isArray(log) || log.length > MAX_LOG) return json(res, 400, { error: "log" });
      let lastTick = -1;
      for (const e of log) {
        if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || e[0] < lastTick || e[0] > MAX_TICKS || (e[1] !== "refuse" && e[1] !== "attest" && e[1] !== "end") || !Number.isInteger(e[2])) return json(res, 400, { error: "log" });
        lastTick = e[0];
      }
      const dh = devHash(d);
      if (limited("score:" + dh, 30) || limited("scoreip:" + ipOf(req), 120)) return json(res, 429, { error: "slow down" });
      // the proof: the same seed and the same inputs at the same ticks must give the same run
      const rp = replay(String(tok.seed), log);
      if (rp.score !== score || rp.receipts !== receipts || rp.refused !== refused || rp.wave !== wave || Math.abs(rp.duration_ms - dur) > 100) return json(res, 400, { error: "replay" });
      const now = new Date().toISOString(), day = now.slice(0, 10);
      markToken.run(tok.sig, now);
      ins.run(day, String(tok.seed), name, handle, score, receipts, refused, wave, dur, dh, rp.log_hash, now, JSON.stringify(log));
      const rankToday = rankQ.get(day, score).n + 1, rankAll = rankQ.get("0000-00-00", score).n + 1;
      return json(res, 200, { ok: true, rank_today: rankToday, rank_all: rankAll, name, handle });
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
