// What score range is possible for a run on a given arena with a given card? The seed
// fixes the order of requests, so the loop points (25 per capsule, no multiplier) are
// fixed once we know how many loops were cut; the rest depends on the multiplier.
//   node score-bounds.mjs <seed> <refusedBad> <loops> <leaked> <cleanWaves> <wave>
import { createGame, autopilot, TICK } from "../site/game/core.js";
const [seed, bad, loops, leaked, clean, wave] = [process.argv[2], ...process.argv.slice(3, 8).map(Number)];
const g = createGame(seed);
let loopPts = 0, loopsCut = 0, receiptsSeen = 0, badSeen = 0, chains = [];
while (!g.state.over && loopsCut < loops) {
  autopilot(g);
  for (const e of g.drain()) {
    if (e.type === "loop") { loopPts += e.gain; loopsCut++; chains.push(e.len); }
    if (e.type === "receipt") receiptsSeen++;
    if (e.type === "refused") badSeen++;
  }
  g.step(TICK);
}
const t = Math.round(g.state.t / 1000);
console.log(`at loop ${loops} (t=${t}s, wave ${g.state.wave}): bad refused so far ${badSeen} (card ${bad}), ok requests passed ${receiptsSeen}, mean loop length ${(chains.reduce((a, b) => a + b, 0) / chains.length).toFixed(2)}`);
// clean-wave points: 12 of the 14 completed waves; min if the two unclean waves were the two biggest, max if the smallest
const waves = Array.from({ length: wave - 1 }, (_, i) => i + 1);
const sumAll = waves.reduce((a, b) => a + b, 0), unclean = waves.length - clean;
const cleanMin = 50 * (sumAll - waves.slice(-unclean).reduce((a, b) => a + b, 0));
const cleanMax = 50 * (sumAll - waves.slice(0, unclean).reduce((a, b) => a + b, 0));
const badMin = 15 * bad, badMax = 75 * bad;
const recMax = 50 * receiptsSeen;   // every sealed request let through at multiplier 5
const floor = loopPts + badMin + cleanMin;            // multiplier 1 everywhere, no receipts at all (every sealed request wrongly refused)
const ceil = loopPts + badMax + recMax + cleanMax;
console.log(`loop points fixed by the arena: ${loopPts}`);
console.log(`possible score range for this card: ${floor} (multiplier never above 1, no receipts) to ${ceil} (multiplier 5 throughout, every sealed request a receipt)`);
console.log(`every gain is a multiple of 5, so a genuine score ends in 0 or 5`);
