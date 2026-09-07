// The rule set must be deterministic and must reward judgement.
import { createGame, replay, autopilot, TICK, RUN_MS } from "../site/game/core.js";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };

// idle run: nothing refused, the budget bleeds out before the clock
const idle = createGame("2026-09-06:test");
while (!idle.state.over) idle.step(TICK);
const si = idle.summary();
ok(si.reason === "budget" && si.duration_ms < RUN_MS, "idle run ends on budget: " + JSON.stringify(si));
ok(si.receipts >= 3, "sealed requests still become receipts when idle: " + si.receipts);
ok(si.score === si.receipts * 10, "throughput alone never raises the multiplier: " + si.score + " for " + si.receipts + " receipts");

// perfect run: the autopilot refuses every bad one and every loop
const perf = createGame("2026-09-06:test");
while (!perf.state.over) { autopilot(perf); perf.step(TICK); }
const sp = perf.summary();
ok(sp.reason === "time" && sp.leaked === 0, "perfect run reaches the clock with nothing leaked: " + JSON.stringify(sp));
ok(sp.score > si.score * 3, "judgement beats idling: " + sp.score + " vs " + si.score);
ok(sp.wave === 31, "the ten-minute cap spans 31 waves: " + sp.wave);
ok(sp.cleanWaves === 30, "a perfect run defends every completed wave cleanly: " + sp.cleanWaves);
ok(sp.budget === 100, "a perfect run keeps its budget: " + sp.budget);
ok(sp.refuse_z_n > 100 && sp.refuse_z_std < 1, "the patient player taps at one distance, which a referee can see: n " + sp.refuse_z_n + ", std " + sp.refuse_z_std);

// determinism: replaying the perfect run's log reproduces its summary
const rp = replay("2026-09-06:test", perf.state.log);
ok(rp.score === sp.score && rp.receipts === sp.receipts && rp.ticks === sp.ticks && rp.log_hash === sp.log_hash, "replay reproduces the run: " + rp.score + " vs " + sp.score);

// five correct refusals raise the multiplier to x2
const m5 = createGame("m"); let got = 0;
while (got < 5 && !m5.state.over) { const c = m5.state.caps.find((x) => x.kind === "bad" || (x.kind === "loop" && x.k === 0)); if (c) { m5.input("refuse", c.id); got++; if (got === 5) break; } m5.step(TICK); }
ok(m5.state.mult === 2 && m5.state.streak === 5, "five refusals give x2: " + m5.state.mult + " at streak " + m5.state.streak);

// a different seed is a different arena
const other = createGame("2026-09-07:test");
while (!other.state.over) { autopilot(other); other.step(TICK); }
ok(other.summary().score !== sp.score, "another seed, another score");

// wrong refusal resets the streak, does not hurt the budget
const w = createGame("x");
while (w.state.caps.length === 0) w.step(TICK);
const first = w.state.caps.find((c) => c.kind === "ok");
if (first) { w.state.streak = 9; w.state.mult = 2; const r = w.input("refuse", first.id); ok(r && r.kind === "ok" && w.state.streak === 0 && w.state.mult === 1 && w.state.budget === 100, "wrong refusal resets streak only"); }

// attest: three charges, slows time
const a = createGame("y");
ok(a.input("attest").ok && a.input("attest").ok && a.input("attest").ok && a.input("attest").ok === false, "three attest charges");
ok(a.state.slow > 0, "attest slows time");

// ending early keeps the score
const q = createGame("z");
for (let i = 0; i < 60 * 25; i++) { autopilot(q); q.step(TICK); }
const before = q.state.score; q.input("end");
ok(q.state.over && q.summary().reason === "quit" && q.summary().score === before, "quitting keeps the score");

// budget step: 30 ms frame advances at most two ticks; no runaway when a tab was hidden
const h = createGame("h"); h.step(5000);
ok(h.state.tick <= 30, "a long frame is capped at 30 ticks: " + h.state.tick);

console.log("core:", "perfect", sp.score, "idle", si.score, "| fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
