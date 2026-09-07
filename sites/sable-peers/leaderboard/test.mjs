// Starts the board on a test port with an in-memory database and exercises every rule,
// including the replay check: runs are played with the deterministic core and sent with
// their input log, and a forged score is refused.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createGame, autopilot, TICK } from "../site/game/core.js";
import { createServer } from "node:https";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import webpush from "web-push";
const VAPID = webpush.generateVAPIDKeys();
const here = dirname(fileURLToPath(import.meta.url));
const PORT = 8790, BASE = `http://127.0.0.1:${PORT}`;
const TODAY = new Date().toISOString().slice(0, 10);
const child = spawn(process.execPath, [join(here, "server.js")], { env: { ...process.env, PORT: String(PORT), BOARD_SECRET: "test-secret-test-secret-test-secret-1234", BOARD_DB: ":memory:", BOARD_MIN_MS: "300", BOARD_CONTEST: TODAY + "/" + TODAY, VAPID_PUBLIC: VAPID.publicKey, VAPID_PRIVATE: VAPID.privateKey, PUSH_SECRET: "push-secret-for-the-test", NODE_TLS_REJECT_UNAUTHORIZED: "0" }, stdio: ["ignore", "pipe", "pipe"] });
child.stderr.on("data", (d) => process.stderr.write(d));
await new Promise((r) => child.stdout.once("data", r));
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// a run cannot be older than its token: wait until the wall clock has covered the run
const settle = (run) => wait(Math.max(0, run.duration_ms - 1900));
const post = async (p, body, ip) => { const r = await fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(ip ? { "x-forwarded-for": ip } : {}) }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
const get = async (p) => { const r = await fetch(BASE + p); return { status: r.status, body: await r.json() }; };
// a patient player for `ticks` ticks, then off the door: the fields the client sends
function play(seed, ticks) {
  const g = createGame(seed);
  for (let i = 0; i < ticks && !g.state.over; i++) { autopilot(g); g.step(TICK); }
  if (!g.state.over) g.input("end");
  const s = g.summary();
  return { score: s.score, receipts: s.receipts, refused: s.refused, wave: s.wave, duration_ms: s.duration_ms, log_hash: s.log_hash, log: g.state.log };
}
try {
  const dev = "device-test-0123456789abcdef";
  const h = await get("/health"); ok(h.status === 200 && h.body.ok && /^\d{4}-\d{2}-\d{2}/.test(h.body.seed), "health with today's seed: " + JSON.stringify(h.body));
  ok((await post("/start", { device: "short" })).status === 400, "start rejects a bad device id");
  const st = await post("/start", { device: dev }); ok(st.status === 200 && st.body.token.includes("."), "start hands out a token");
  const seed = st.body.seed;
  const run = play(seed, 300); await settle(run);
  ok(run.score > 0 && run.log.length > 0, "the core produced a run with inputs: " + JSON.stringify({ score: run.score, inputs: run.log.length }));
  const base = { token: st.body.token, device: dev, name: "Optimus", handle: "@0PTIMUS_ONE", ...run };
  ok((await post("/score", { ...base, token: st.body.token + "x" })).status === 400, "tampered token refused");
  ok((await post("/score", { ...base, device: "device-other-0123456789abcdef" })).status === 400, "token bound to its device");
  ok((await post("/score", { ...base, name: "ab" })).status === 400, "name too short refused");
  ok((await post("/score", { ...base, name: "shithead" })).status === 400, "denylist name refused");
  ok((await post("/score", { ...base, handle: "not a handle" })).status === 400, "bad handle refused");
  ok((await post("/score", { ...base, score: 10 ** 6 })).status === 400, "implausible score refused");
  ok((await post("/score", { ...base, duration_ms: 100 })).status === 400, "too short a run refused");
  ok((await post("/score", { ...base, duration_ms: 99999 })).status === 400, "run longer than wall time refused");
  const forged = await post("/score", { ...base, score: base.score + 100 }); ok(forged.status === 400 && forged.body.error === "replay", "forged score refused by the replay: " + JSON.stringify(forged.body));
  const nolog = await post("/score", { ...base, log: undefined }); ok(nolog.status === 400 && nolog.body.error === "log", "score without a log refused: " + JSON.stringify(nolog.body));
  const badlog = await post("/score", { ...base, log: [[5, "refuse", 1], [3, "refuse", 2]] }); ok(badlog.status === 400, "log out of order refused: " + JSON.stringify(badlog.body));
  const good = await post("/score", base); ok(good.status === 200 && good.body.ok && good.body.rank_today === 1 && good.body.handle === "0PTIMUS_ONE", "replayed score accepted with rank: " + JSON.stringify(good.body));
  ok((await post("/score", base)).status === 409, "same token cannot submit twice");
  // second player, shorter run and no handle; then the same name with a longer run
  const dev2 = "device-two-0123456789abcdefgh";
  const st2 = await post("/start", { device: dev2 }); const run2 = play(st2.body.seed, 200); await settle(run2);
  ok((await post("/score", { token: st2.body.token, device: dev2, name: "Ada Lovelace", handle: "", ...run2 })).status === 200, "second player accepted");
  const st3 = await post("/start", { device: dev }); const run3 = play(st3.body.seed, 450); await settle(run3);
  ok(run3.score > run.score, "a longer patient run scores more: " + run3.score + " > " + run.score);
  const r3 = await post("/score", { ...base, token: st3.body.token, ...run3 }); ok(r3.status === 200, "same name again, higher score: " + JSON.stringify(r3.body) + " for " + JSON.stringify({ score: run3.score, dur: run3.duration_ms, wave: run3.wave, inputs: run3.log.length }));
  const top = await get("/top?period=today"); ok(top.status === 200 && top.body.rows.length === 2 && top.body.rows[0].name === "Optimus" && top.body.rows[0].score === run3.score && top.body.rows[1].name === "Ada Lovelace", "top shows best per name, ordered: " + JSON.stringify(top.body.rows.map((r) => [r.name, r.score])));
  const me = await get("/me?device=" + dev); ok(me.body.best && me.body.best.score === run3.score, "me returns the device's best");
  ok((await get("/top?period=all")).body.rows.length === 2 && (await get("/top?period=week")).body.rows.length === 2, "week and all periods");
  // the contest: window, status, and only verified runs with a handle
  const cw = await get("/contest"); ok(cw.status === 200 && cw.body.contest && cw.body.contest.status === "live" && cw.body.contest.start === TODAY, "contest window is live today: " + JSON.stringify(cw.body));
  const ct = await get("/top?period=contest"); ok(ct.body.rows.length === 1 && ct.body.rows[0].name === "Optimus" && ct.body.window.end === TODAY, "contest tab counts the run with a handle only: " + JSON.stringify(ct.body.rows.map((r) => r.name)));
  // the referee: a patient script's run is accepted, flagged, and kept out of the contest
  const devb = "device-bot-0123456789abcdefghij";
  const stb = await post("/start", { device: devb }); const runb = play(stb.body.seed, 1500); await settle(runb);
  const bot = await post("/score", { token: stb.body.token, device: devb, name: "Patient Script", handle: "@script", ...runb });
  ok(bot.status === 200 && bot.body.ok && bot.body.flagged === true, "patient script's run accepted but flagged: " + JSON.stringify(bot.body) + " refusals " + runb.refused);
  ok(good.body.flagged === false, "a short human-length run is not flagged");
  const ct2 = await get("/top?period=contest"); ok(ct2.body.rows.every((r) => r.name !== "Patient Script") && (await get("/top?period=today")).body.rows.some((r) => r.name === "Patient Script"), "flagged run is on the board but out of the contest");
  // notifications: a phone subscribes (here a fake push service on this machine), a notification is sent, the wrong secret is refused
  // push services only speak https, so the fake one here has a throwaway certificate (the board is told to accept it, in this test only)
  const dir = mkdtempSync(join(tmpdir(), "sable-push-")); execFileSync("openssl", ["req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:prime256v1", "-nodes", "-keyout", join(dir, "key.pem"), "-out", join(dir, "cert.pem"), "-subj", "/CN=127.0.0.1", "-days", "2"], { stdio: "ignore" });
  const hits = []; const fake = createServer({ key: readFileSync(join(dir, "key.pem")), cert: readFileSync(join(dir, "cert.pem")) }, (rq, rs) => { let n = 0; rq.on("data", (c) => { n += c.length; }); rq.on("end", () => { hits.push({ path: rq.url, bytes: n, enc: rq.headers["content-encoding"] }); rs.writeHead(201); rs.end(); }); });
  await new Promise((r) => fake.listen(8793, "127.0.0.1", r));
  const kp = generateKeyPairSync("ec", { namedCurve: "prime256v1" }); const spki = kp.publicKey.export({ type: "spki", format: "der" });
  const p256dh = spki.subarray(spki.length - 65).toString("base64url"), auth = randomBytes(16).toString("base64url");
  const key = await get("/push/key"); ok(key.status === 200 && key.body.key === VAPID.publicKey, "the app can read the VAPID public key");
  ok((await post("/push/subscribe", { subscription: { endpoint: "nope", keys: {} } })).status === 400, "a malformed subscription is refused");
  const subr = await post("/push/subscribe", { subscription: { endpoint: "https://127.0.0.1:8793/push/abc", keys: { p256dh, auth } } }); ok(subr.status === 200, "a subscription is stored: " + JSON.stringify(subr.body));
  ok((await get("/health")).body.subscribers === 1, "health counts the subscriber");
  const bad = await fetch(BASE + "/push/notify", { method: "POST", headers: { "content-type": "application/json", "x-push-secret": "wrong" }, body: JSON.stringify({ title: "x" }) }); ok(bad.status === 401, "notify with the wrong secret is refused");
  const sent = await fetch(BASE + "/push/notify", { method: "POST", headers: { "content-type": "application/json", "x-push-secret": "push-secret-for-the-test" }, body: JSON.stringify({ title: "Test", body: "hello", url: "/#log" }) }).then(async (r) => ({ status: r.status, body: await r.json() }));
  ok(sent.status === 200 && sent.body.sent === 1 && hits.length === 1 && hits[0].enc === "aes128gcm" && hits[0].bytes > 50, "a notification reached the push service, encrypted: " + JSON.stringify({ sent: sent.body, hit: hits[0] }));
  ok((await post("/push/unsubscribe", { endpoint: "https://127.0.0.1:8793/push/abc" })).status === 200 && (await get("/health")).body.subscribers === 0, "unsubscribe removes it");
  fake.close();
  ok((await get("/nope")).status === 404, "unknown route is 404");
  // rate limit: 30 scores per device per hour
  let limitedAt = -1;
  for (let i = 0; i < 32; i++) { const s = await post("/start", { device: dev }); const body = play(s.body.seed, 100 + i); await settle(body); const r = await post("/score", { ...base, token: s.body.token, ...body }); if (r.status === 429) { limitedAt = i; break; } }
  ok(limitedAt >= 0 && limitedAt <= 29, "device rate limit kicks in: " + limitedAt);
  const big = await fetch(BASE + "/score", { method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(400 * 1024) }).then((r) => r.status).catch(() => "closed");
  ok(big === 413 || big === "closed", "oversized body refused: " + big);
} finally { child.kill(); }
console.log("board:", "fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
