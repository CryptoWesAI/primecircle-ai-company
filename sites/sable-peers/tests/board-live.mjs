// The live board's replay check and referee, through the API with the deterministic core:
// a patient script's run is accepted and flagged, a jittery human-like run is accepted and
// not flagged, a forged score is refused. Leaves two rows to delete afterwards:
//   docker exec sable-board node admin.js delete-name "Test Bot patient"
//   docker exec sable-board node admin.js delete-name "Test Bot human"
//   node board-live.mjs https://sable.primecircle.cloud/api/game
import { createGame, autopilot, TICK } from "../site/game/core.js";
const BASE = (process.argv[2] || "https://sable.primecircle.cloud/api/game").replace(/\/$/, "");
const dev = "device-livetest-" + Math.random().toString(36).slice(2, 12) + "0123456789";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const post = async (p, body) => { const r = await fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
const fields = (g) => { const s = g.summary(); return { score: s.score, receipts: s.receipts, refused: s.refused, wave: s.wave, duration_ms: s.duration_ms, log_hash: s.log_hash, log: g.state.log }; };
function patient(seed, ticks) { const g = createGame(seed); for (let i = 0; i < ticks && !g.state.over; i++) { autopilot(g); g.step(TICK); } if (!g.state.over) g.input("end"); return fields(g); }
function human(seed, ticks) {
  const g = createGame(seed); let r = 4242; const rnd = () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; const plan = new Map();
  for (let i = 0; i < ticks && !g.state.over; i++) {
    for (const c of g.state.caps) if ((c.kind === "bad" || (c.kind === "loop" && c.k === 0)) && !plan.has(c.id)) plan.set(c.id, rnd() < 0.85 ? -55 + rnd() * 49 : 99);
    for (const c of g.state.caps) { const at = plan.get(c.id); if (at != null && at < 99 && c.z > at) { g.input("refuse", c.id); plan.set(c.id, 99); break; } }
    g.step(TICK);
  }
  if (!g.state.over) g.input("end"); return fields(g);
}
const st = await post("/start", { device: dev }); ok(st.status === 200 && st.body.seed, "start: " + JSON.stringify(st.body).slice(0, 80));
const seed = st.body.seed, t0 = Date.now();
const runP = patient(seed, 1500), runH = human(seed, 1500);
console.log("seed", seed, "| patient:", runP.score, "pts,", runP.refused, "refused |", "human:", runH.score, "pts,", runH.refused, "refused");
await wait(Math.max(0, runP.duration_ms - (Date.now() - t0) + 400));
const forged = await post("/score", { token: st.body.token, device: dev, name: "Test Bot patient", handle: "@0PTIMUS_ONE", ...runP, score: runP.score + 50 });
ok(forged.status === 400 && forged.body.error === "replay", "forged score refused live: " + JSON.stringify(forged.body));
const rp = await post("/score", { token: st.body.token, device: dev, name: "Test Bot patient", handle: "@0PTIMUS_ONE", ...runP });
ok(rp.status === 200 && rp.body.ok && rp.body.flagged === true, "patient run accepted and flagged live: " + JSON.stringify(rp.body));
const st2 = await post("/start", { device: dev }); const t1 = Date.now();
const runH2 = human(st2.body.seed, 1500);
await wait(Math.max(0, runH2.duration_ms - (Date.now() - t1) + 400));
const rh = await post("/score", { token: st2.body.token, device: dev, name: "Test Bot human", handle: "@0PTIMUS_ONE", ...runH2 });
ok(rh.status === 200 && rh.body.ok && rh.body.flagged === false, "human-like run accepted and not flagged live: " + JSON.stringify(rh.body));
console.log("board-live:", "fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
