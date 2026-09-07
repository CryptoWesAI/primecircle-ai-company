// Gatekeeper core. Deterministic: the same seed and the same inputs at the same
// ticks produce the same run, so a score can be replayed and checked later.
// No rendering, no clock, no DOM in this file.

export const TICK = 1000 / 60;
export const RUN_MS = 600000;                               // the hard cap: a full shift
export const WAVE_MS = 20000;
export const SPAWN_Z = -70;

export function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashLog(log) {
  let h = 2166136261 >>> 0;
  for (const [t, a, i] of log) {
    h = Math.imul(h ^ t, 16777619) >>> 0;
    h = Math.imul(h ^ (a === "refuse" ? 1 : a === "attest" ? 2 : 3), 16777619) >>> 0;
    h = Math.imul(h ^ (i | 0), 16777619) >>> 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function createGame(seed) {
  const rnd = mulberry32(hash32(String(seed)));
  const s = {
    seed: String(seed), tick: 0, t: 0, acc: 0, wave: 1, budget: 100, score: 0, streak: 0, mult: 1,
    receipts: 0, refusedBad: 0, refusedLoops: 0, refusedGood: 0, leaked: 0, waveLeaks: 0, cleanWaves: 0, attest: 3, slow: 0,
    nextSpawn: 900, nextId: 1, caps: [], events: [], log: [], over: false, reason: null,
  };
  const speed = () => Math.min(45, 15 + s.wave * 2);          // units per second toward the door, capped at wave 15
  const spawnInterval = () => Math.max(220, 800 - s.wave * 75); // a request every 220 ms from wave 8 on
  const setMult = () => { s.mult = Math.min(5, 1 + Math.floor(s.streak / 5)); };

  function spawn() {
    const r = rnd(), w = s.wave;
    const loopShare = Math.min(0.28, 0.08 + w * 0.015);
    const badShare = Math.min(0.42, 0.2 + w * 0.02);
    const x = (rnd() * 2 - 1) * 3.2, y = (rnd() * 2 - 1) * 2.0;
    if (r < loopShare) {
      const len = Math.min(10, 3 + Math.floor(w / 2) + Math.floor(rnd() * 2)), chain = s.nextId++;
      for (let k = 0; k < len; k++) {
        s.caps.push({ id: s.nextId++, kind: "loop", chain, len, k, x: x + (rnd() - 0.5) * 0.25, y: y + (rnd() - 0.5) * 0.25, z: SPAWN_Z - k * 1.7, seal: 1, born: s.t });
      }
    } else if (r < loopShare + badShare) {
      // seal = how visible the break is; it fades with the waves
      s.caps.push({ id: s.nextId++, kind: "bad", x, y, z: SPAWN_Z, seal: Math.max(0.22, 0.9 - w * 0.08), born: s.t });
    } else {
      s.caps.push({ id: s.nextId++, kind: "ok", x, y, z: SPAWN_Z, seal: 1, hue: rnd(), born: s.t });
    }
  }

  function stepOnce() {
    if (s.over) return;
    s.tick++;
    const dt = TICK * (s.slow > 0 ? 0.35 : 1);
    s.t += TICK;
    if (s.slow > 0) s.slow = Math.max(0, s.slow - TICK);
    const w = 1 + Math.floor(s.t / WAVE_MS);
    if (w !== s.wave) {
      // a wave defended without a single leak is worth more than any receipt
      // and it gives budget back: the patient player earns the length of the run
      if (s.waveLeaks === 0) { const g = 50 * s.wave; s.score += g; s.cleanWaves++; s.budget = Math.min(100, s.budget + 10); s.events.push({ t: s.t, type: "clean", wave: s.wave, gain: g }); }
      s.wave = w; s.waveLeaks = 0; s.events.push({ t: s.t, type: "wave", wave: w });
    }
    s.nextSpawn -= dt;
    if (s.nextSpawn <= 0) { spawn(); s.nextSpawn = spawnInterval(); }
    const v = speed() * dt / 1000, kept = [];
    for (const c of s.caps) {
      c.z += v;
      if (c.z >= 0) {
        // throughput is quiet: a receipt scores, but only refusals build the streak
        if (c.kind === "ok") { s.receipts++; const g = 10 * s.mult; s.score += g; s.events.push({ t: s.t, type: "receipt", id: c.id, x: c.x, y: c.y, gain: g }); }
        else if (c.kind === "bad") { s.budget -= 20; s.leaked++; s.waveLeaks++; s.streak = 0; setMult(); s.events.push({ t: s.t, type: "hit", id: c.id, x: c.x, y: c.y, dmg: 20 }); }
        else { s.budget -= 6; s.leaked++; s.waveLeaks++; s.streak = 0; setMult(); s.events.push({ t: s.t, type: "hit", id: c.id, x: c.x, y: c.y, dmg: 6, loop: true }); }
      } else kept.push(c);
    }
    s.caps = kept;
    if (s.budget <= 0) { s.budget = 0; s.over = true; s.reason = "budget"; s.events.push({ t: s.t, type: "over", reason: "budget" }); }
    else if (s.t >= RUN_MS) { s.over = true; s.reason = "time"; s.events.push({ t: s.t, type: "over", reason: "time" }); }
  }

  return {
    state: s,
    step(ms) {
      s.acc += ms;
      let n = 0;
      while (s.acc >= TICK - 1e-9 && n < 30 && !s.over) { s.acc -= TICK; stepOnce(); n++; }
      if (s.acc < 0) s.acc = 0;
    },
    input(action, id) {
      if (s.over) return null;
      id = id | 0;
      s.log.push([s.tick, action, id]);
      if (action === "attest") { if (s.attest <= 0) return { ok: false }; s.attest--; s.slow = 1500; s.events.push({ t: s.t, type: "attest" }); return { ok: true }; }
      if (action === "end") { s.over = true; s.reason = "quit"; s.events.push({ t: s.t, type: "over", reason: "quit" }); return { ok: true }; }
      if (action !== "refuse") return null;
      const c = s.caps.find((x) => x.id === id);
      if (!c) return { ok: false };
      if (c.kind === "ok") {
        s.caps = s.caps.filter((x) => x.id !== id); s.refusedGood++; s.streak = 0; setMult();
        s.events.push({ t: s.t, type: "wrong", id, x: c.x, y: c.y, z: c.z });
        return { ok: true, kind: "ok" };
      }
      if (c.kind === "bad") {
        s.caps = s.caps.filter((x) => x.id !== id); s.refusedBad++; s.streak++; setMult();
        const g = 15 * s.mult; s.score += g;
        s.events.push({ t: s.t, type: "refused", id, x: c.x, y: c.y, z: c.z, gain: g });
        return { ok: true, kind: "bad", gain: g };
      }
      const chain = s.caps.filter((x) => x.kind === "loop" && x.chain === c.chain);
      s.caps = s.caps.filter((x) => !(x.kind === "loop" && x.chain === c.chain));
      s.refusedLoops++; s.streak++; setMult();
      const g = 25 * chain.length; s.score += g;
      if (s.streak % 5 === 0 && s.attest < 3) s.attest++;
      s.events.push({ t: s.t, type: "loop", id, x: c.x, y: c.y, z: c.z, gain: g, len: chain.length, ids: chain.map((x) => x.id) });
      return { ok: true, kind: "loop", gain: g, len: chain.length };
    },
    drain() { const e = s.events; s.events = []; return e; },
    summary() {
      return { seed: s.seed, score: s.score, receipts: s.receipts, refused: s.refusedBad + s.refusedLoops, refusedBad: s.refusedBad, refusedLoops: s.refusedLoops, refusedGood: s.refusedGood, leaked: s.leaked, cleanWaves: s.cleanWaves, budget: s.budget, wave: s.wave, duration_ms: Math.round(s.t), reason: s.reason, ticks: s.tick, log_hash: hashLog(s.log) };
    },
  };
}

// Reproduce a run from its input log. Inputs recorded at tick n are applied
// before the step that produces tick n + 1, which is how the client applies
// them (between frames, at a tick boundary).
export function replay(seed, log) {
  const g = createGame(seed);
  let k = 0;
  while (!g.state.over && g.state.tick < 40000) {
    while (k < log.length && log[k][0] === g.state.tick) { g.input(log[k][1], log[k][2]); k++; }
    g.step(TICK);
  }
  return g.summary();
}

// A perfect, patient player: refuses every broken seal and every loop once it
// is close enough to judge, never touches a sealed request. Used by tests and
// by the demo mode.
export function autopilot(g, judgeZ = -32) {
  for (const c of g.state.caps) {
    if (c.z > judgeZ && (c.kind === "bad" || (c.kind === "loop" && c.k === 0))) { g.input("refuse", c.id); return true; }
  }
  return false;
}
