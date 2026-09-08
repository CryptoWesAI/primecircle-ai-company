// Does a genuine long run pass the board's checks? Starts the board locally with an
// in-memory database, takes a token, plays the deterministic core to wave 15 with the
// token's seed (the patient player, one broken seal let through every N refusals so the
// multiplier resets like a human's), waits until the wall clock has covered the run
// (the board refuses a run longer than its token's age), and submits it with the log.
//   node long-run-check.mjs [leakEvery=45] [ticks=17400]
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createGame, autopilot, TICK } from "../site/game/core.js";
const here = dirname(fileURLToPath(import.meta.url));
const PORT = 8791, BASE = `http://127.0.0.1:${PORT}`;
const leakEvery = Number(process.argv[2] || 45), ticks = Number(process.argv[3] || 17400);
const child = spawn(process.execPath, [join(here, "..", "leaderboard", "server.js")], { env: { ...process.env, PORT: String(PORT), BOARD_SECRET: "test-secret-test-secret-test-secret-1234", BOARD_DB: ":memory:", BOARD_MIN_MS: "20000", PUSH_ON: "0" }, cwd: join(here, "..", "leaderboard"), stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => child.stdout.once("data", r));
const post = async (p, body) => { const r = await fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
function play(seed) {
  const g = createGame(seed);
  let refusals = 0, skipId = null;
  for (let i = 0; i < ticks && !g.state.over; i++) {
    if (leakEvery > 0 && skipId === null && refusals > 0 && refusals % leakEvery === 0) { const bad = g.state.caps.find((c) => c.kind === "bad"); if (bad) skipId = bad.id; }
    if (skipId !== null) {
      const c = g.state.caps.find((c) => c.z > -32 && c.id !== skipId && (c.kind === "bad" || (c.kind === "loop" && c.k === 0)));
      if (c) { g.input("refuse", c.id); refusals++; }
      if (!g.state.caps.some((c) => c.id === skipId)) skipId = null;
    } else if (autopilot(g)) refusals++;
    g.step(TICK);
  }
  if (!g.state.over) g.input("end");
  const s = g.summary();
  return { score: s.score, receipts: s.receipts, refused: s.refused, wave: s.wave, duration_ms: s.duration_ms, log_hash: s.log_hash, log: g.state.log, leaked: s.leaked, refusedBad: s.refusedBad, refusedLoops: s.refusedLoops, cleanWaves: s.cleanWaves, reason: g.state.reason };
}
try {
  const dev = "device-test-0123456789abcdef";
  const t0 = Date.now();
  const st = await post("/start", { device: dev });
  if (st.status !== 200) throw new Error("start failed: " + JSON.stringify(st));
  const run = play(st.body.seed);
  console.log("run:", JSON.stringify({ seed: st.body.seed, score: run.score, wave: run.wave, duration_s: Math.round(run.duration_ms / 1000), refusedBad: run.refusedBad, loops: run.refusedLoops, receipts: run.receipts, leaked: run.leaked, clean: run.cleanWaves, reason: run.reason, inputs: run.log.length, bodyKB: Math.round(JSON.stringify(run.log).length / 1024) }));
  const waitMs = Math.max(0, run.duration_ms - (Date.now() - t0) + 500);
  console.log("waiting", Math.round(waitMs / 1000), "s so the run is not older than its token…");
  await new Promise((r) => setTimeout(r, waitMs));
  const { leaked, refusedBad, refusedLoops, cleanWaves, reason, ...fields } = run;
  const res = await post("/score", { token: st.body.token, device: dev, name: "Long Run Check", handle: "", ...fields });
  console.log("score ->", res.status, JSON.stringify(res.body));
  const top = await (await fetch(BASE + "/top?period=today&limit=5")).json();
  console.log("board:", JSON.stringify(top.rows.map((r) => [r.name, r.score, r.wave])));
  if (res.status !== 200) process.exitCode = 1;
} catch (e) { console.error("check failed:", e.message); process.exitCode = 1; }
finally { child.kill(); }
