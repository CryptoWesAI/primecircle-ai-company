// Simulate Gatekeeper runs with the core rules, to judge whether a claimed score is reachable.
//   node sim-run.mjs <seed> [judgeZ] [leakEvery]
// The autopilot refuses every broken seal and every loop once it is closer than judgeZ.
// leakEvery > 0 lets one bad request through every N refusals, to model a human who
// misses some and loses the multiplier; prints the state at every wave.
import { createGame, autopilot, TICK, WAVE_MS } from "../site/game/core.js";
const seed = process.argv[2] || "seed";
const judgeZ = Number(process.argv[3] || -32);
const leakEvery = Number(process.argv[4] || 0);
const g = createGame(seed);
let lastWave = 1, refusals = 0, skipId = null;
while (!g.state.over && g.state.tick < 120000) {
  if (leakEvery > 0 && skipId === null && refusals > 0 && refusals % leakEvery === 0) {
    const bad = g.state.caps.find(c => c.kind === "bad");
    if (bad) skipId = bad.id;
  }
  if (skipId !== null) {
    // refuse everything except the one we let through
    const c = g.state.caps.find(c => c.z > judgeZ && c.id !== skipId && (c.kind === "bad" || (c.kind === "loop" && c.k === 0)));
    if (c) { g.input("refuse", c.id); refusals++; }
    if (!g.state.caps.some(c => c.id === skipId)) skipId = null;
  } else if (autopilot(g, judgeZ)) refusals++;
  g.step(TICK);
  if (g.state.wave !== lastWave) {
    lastWave = g.state.wave;
    const s = g.state;
    console.log(`wave ${String(s.wave).padStart(2)} at ${Math.round(s.t / 1000)}s: score ${s.score} refusedBad ${s.refusedBad} loops ${s.refusedLoops} receipts ${s.receipts} leaked ${s.leaked} clean ${s.cleanWaves} budget ${s.budget} mult ${s.mult}`);
  }
}
const sum = g.summary();
console.log("end:", g.state.reason, JSON.stringify(sum));
