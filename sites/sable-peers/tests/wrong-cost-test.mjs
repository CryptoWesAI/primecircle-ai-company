// A customer sent away costs budget: refusing a sealed request takes WRONG_COST off the
// budget and resets the streak, so a player who taps everything dies early, while the
// patient player is untouched. Deterministic, no browser.
//   node wrong-cost-test.mjs
import { createGame, autopilot, TICK, RULES, WRONG_COST } from "../site/game/core.js";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const SEED = "2026-09-08:72514487a320";

ok(typeof RULES === "string" && /^\d{4}-\d{2}-\d{2}/.test(RULES), "RULES is a dated version string: " + RULES);
ok(WRONG_COST === 5, "a wrong refusal costs 5 budget");

// one wrong refusal: budget down by WRONG_COST, streak back to zero, no points
{
  const g = createGame(SEED);
  // build a streak first
  let steps = 0;
  while (g.state.streak < 6 && steps < 6000) { autopilot(g); g.step(TICK); steps++; }
  ok(g.state.streak >= 6, "the patient player built a streak: " + g.state.streak);
  // wait for a sealed request to be in reach, then refuse it
  let sealed = null; steps = 0;
  while (!sealed && steps < 6000) { sealed = g.state.caps.find((c) => c.kind === "ok" && c.z > -40); if (!sealed) { autopilot(g); g.step(TICK); steps++; } }
  ok(!!sealed, "a sealed request came into reach");
  const before = { budget: g.state.budget, score: g.state.score };
  const r = g.input("refuse", sealed.id);
  ok(r && r.ok && r.kind === "ok" && r.dmg === WRONG_COST, "the refusal reports the cost: " + JSON.stringify(r));
  ok(g.state.budget === before.budget - WRONG_COST, "budget fell by " + WRONG_COST + ": " + before.budget + " -> " + g.state.budget);
  ok(g.state.score === before.score, "no points for sending a customer away");
  ok(g.state.streak === 0 && g.state.mult === 1, "streak and multiplier reset");
  const ev = g.drain().filter((e) => e.type === "wrong");
  ok(ev.length === 1 && ev[0].dmg === WRONG_COST, "the wrong event carries the damage for the HUD");
}

// tapping everything: refuse every request in reach, sealed or not
function tapEverything(seed) {
  const g = createGame(seed);
  while (!g.state.over && g.state.tick < 120000) {
    const c = g.state.caps.find((x) => x.z > -32 && (x.kind !== "loop" || x.k === 0));
    if (c) g.input("refuse", c.id);
    g.step(TICK);
  }
  return g.summary();
}
const tap = tapEverything(SEED);
ok(tap.reason === "budget" && tap.wave <= 4, "tapping everything ends the shift by wave 4: " + JSON.stringify({ wave: tap.wave, score: tap.score, refusedGood: tap.refusedGood, duration_s: Math.round(tap.duration_ms / 1000) }));
ok(tap.refusedGood * WRONG_COST >= 100, "the budget went on customers sent away: " + tap.refusedGood + " wrong refusals");

// the patient player is untouched: no wrong refusals, so the same run as before the rule
{
  const g = createGame(SEED);
  while (!g.state.over && g.state.t < 100000) { autopilot(g); g.step(TICK); }
  const s = g.summary();
  ok(s.refusedGood === 0 && s.budget === 100 && s.wave === 6, "the patient player keeps a full budget through wave 5: " + JSON.stringify({ budget: s.budget, wave: s.wave, score: s.score }));
}

// determinism holds with the new rule: the replay of a tap-everything run reproduces it
{
  const g = createGame(SEED);
  while (!g.state.over && g.state.tick < 120000) { const c = g.state.caps.find((x) => x.z > -32 && (x.kind !== "loop" || x.k === 0)); if (c) g.input("refuse", c.id); g.step(TICK); }
  const a = g.summary();
  const { replay } = await import("../site/game/core.js");
  const b = replay(SEED, g.state.log);
  ok(a.score === b.score && a.wave === b.wave && a.duration_ms === b.duration_ms && a.refusedGood === b.refusedGood, "replay reproduces the run under the new rule");
}

console.log("tap-everything under the new rule:", JSON.stringify({ wave: tap.wave, score: tap.score, wrong: tap.refusedGood, duration_s: Math.round(tap.duration_ms / 1000) }));
console.log("wrong-cost fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
