// Starts the board on a test port with an in-memory database and exercises every rule.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const PORT = 8790, BASE = `http://127.0.0.1:${PORT}`;
const child = spawn(process.execPath, [join(here, "server.js")], { env: { ...process.env, PORT: String(PORT), BOARD_SECRET: "test-secret-test-secret-test-secret-1234", BOARD_DB: ":memory:", BOARD_MIN_MS: "300" }, stdio: ["ignore", "pipe", "pipe"] });
child.stderr.on("data", (d) => process.stderr.write(d));
await new Promise((r) => child.stdout.once("data", r));
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const post = async (p, body, ip) => { const r = await fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(ip ? { "x-forwarded-for": ip } : {}) }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
const get = async (p) => { const r = await fetch(BASE + p); return { status: r.status, body: await r.json() }; };
try {
  const dev = "device-test-0123456789abcdef";
  const h = await get("/health"); ok(h.status === 200 && h.body.ok && /^\d{4}-\d{2}-\d{2}/.test(h.body.seed), "health with today's seed: " + JSON.stringify(h.body));
  ok((await post("/start", { device: "short" })).status === 400, "start rejects a bad device id");
  const st = await post("/start", { device: dev }); ok(st.status === 200 && st.body.token.includes("."), "start hands out a token");
  const base = { token: st.body.token, device: dev, name: "Optimus", handle: "@0PTIMUS_ONE", score: 550, receipts: 8, refused: 12, wave: 2, duration_ms: 400, log_hash: "0badf00d" };
  await wait(450);
  ok((await post("/score", { ...base, token: st.body.token + "x" })).status === 400, "tampered token refused");
  ok((await post("/score", { ...base, device: "device-other-0123456789abcdef" })).status === 400, "token bound to its device");
  ok((await post("/score", { ...base, name: "ab" })).status === 400, "name too short refused");
  ok((await post("/score", { ...base, name: "shithead" })).status === 400, "denylist name refused");
  ok((await post("/score", { ...base, handle: "not a handle" })).status === 400, "bad handle refused");
  ok((await post("/score", { ...base, score: 10 ** 6 })).status === 400, "implausible score refused");
  ok((await post("/score", { ...base, duration_ms: 100 })).status === 400, "too short a run refused");
  ok((await post("/score", { ...base, duration_ms: 99999 })).status === 400, "run longer than wall time refused");
  const good = await post("/score", base); ok(good.status === 200 && good.body.ok && good.body.rank_today === 1 && good.body.handle === "0PTIMUS_ONE", "valid score accepted with rank: " + JSON.stringify(good.body));
  ok((await post("/score", base)).status === 409, "same token cannot submit twice");
  // second player, lower score, then the same name with a higher score
  const st2 = await post("/start", { device: "device-two-0123456789abcdefgh" }); await wait(450);
  ok((await post("/score", { ...base, token: st2.body.token, device: "device-two-0123456789abcdefgh", name: "Ada Lovelace", handle: "", score: 300 })).status === 200, "second player accepted");
  const st3 = await post("/start", { device: dev }); await wait(450);
  ok((await post("/score", { ...base, token: st3.body.token, score: 590 })).status === 200, "same name again, higher score");
  const top = await get("/top?period=today"); ok(top.status === 200 && top.body.rows.length === 2 && top.body.rows[0].name === "Optimus" && top.body.rows[0].score === 590 && top.body.rows[1].name === "Ada Lovelace", "top shows best per name, ordered: " + JSON.stringify(top.body.rows.map((r) => [r.name, r.score])));
  const me = await get("/me?device=" + dev); ok(me.body.best && me.body.best.score === 590, "me returns the device's best");
  ok((await get("/top?period=all")).body.rows.length === 2 && (await get("/top?period=week")).body.rows.length === 2, "week and all periods");
  ok((await get("/nope")).status === 404, "unknown route is 404");
  // rate limit: 30 scores per device per hour
  let limitedAt = -1;
  for (let i = 0; i < 32; i++) { const s = await post("/start", { device: dev }); await wait(320); const r = await post("/score", { ...base, token: s.body.token, score: 100 + i }); if (r.status === 429) { limitedAt = i; break; } }
  ok(limitedAt >= 0 && limitedAt <= 29, "device rate limit kicks in: " + limitedAt);
  const big = await fetch(BASE + "/score", { method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(9000) }).then((r) => r.status).catch(() => "closed");
  ok(big === 413 || big === "closed", "oversized body refused: " + big);
} finally { child.kill(); }
console.log("board:", "fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
