// Gatekeeper, the 3D client. Loaded only when the visitor presses Play; three.js
// is fetched from jsdelivr at that moment. All rules live in core.js; this file
// only draws, listens and talks to the leaderboard.
import { createGame, autopilot, RUN_MS, SPAWN_Z } from "./core.js";
import { drawCard, wireShare } from "./share.js";

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";
let THREE = null;
const $ = (id) => document.getElementById(id);
const CY = 0x18bfff, CYS = 0x72dcff, MOON = 0xff7a59, TEXT = 0xe8f2f8, DIM = 0x8fa3b0;
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
function deviceId() {
  let d = store.get("sable-game-device");
  if (!d || !/^[A-Za-z0-9_-]{16,64}$/.test(d)) { const b = new Uint8Array(16); crypto.getRandomValues(b); d = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join(""); store.set("sable-game-device", d); }
  return d;
}
const snd = (k) => { try { if (window.SABLE_SOUND) window.SABLE_SOUND.tick(k); } catch { /* no sound */ } };

let R = null; // the running scene

export async function start(opts) {
  opts = opts || {};
  if (!THREE) THREE = await import(THREE_URL);
  if (R) R.dispose();
  R = build(opts);
  await R.begin();
  return R;
}

function build(opts) {
  const BOARD = opts.board || "/api/game";
  const stage = $("game-stage"), canvas = $("game-cv"), hud = $("game-hud"), startO = $("game-start"), endO = $("game-end"), msg = $("game-msg"), pops = $("game-pops");
  const el = { score: $("g-score"), mult: $("g-mult"), fill: $("g-budget-fill"), budget: $("g-budget"), wave: $("g-wave"), time: $("g-time"), attest: $("g-attest"), streak: $("g-streak") };
  const demo = !!opts.demo;
  const givenName = String(opts.name || "").trim(), givenHandle = String(opts.handle || "").trim();
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // renderer, scene, camera
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, 0.02);
  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 140);
  camera.position.set(0, 0.4, 9);
  camera.lookAt(0, 0, -30);
  scene.add(new THREE.AmbientLight(0x8fa3b0, 0.55));
  const key = new THREE.PointLight(CY, 40, 60, 1.6); key.position.set(0, 2, 3); scene.add(key);
  const back = new THREE.PointLight(MOON, 12, 90, 1.8); back.position.set(0, -3, -30); scene.add(back);

  // the door: the Prime Circle
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.1, 12, 96), new THREE.MeshBasicMaterial({ color: CY }));
  const ringGlow = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.28, 12, 96), new THREE.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.12 }));
  const door = new THREE.Group(); door.add(ring, ringGlow); scene.add(door);

  // stars for depth
  const sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) { sp[i * 3] = (Math.random() - 0.5) * 90; sp[i * 3 + 1] = (Math.random() - 0.5) * 60; sp[i * 3 + 2] = -110 + Math.random() * 115; }
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(sp, 3)), new THREE.PointsMaterial({ color: DIM, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
  scene.add(stars);

  // shared geometry and materials
  const gBody = new THREE.CapsuleGeometry(0.3, 0.75, 3, 10); gBody.rotateX(Math.PI / 2);
  const mBody = new THREE.MeshStandardMaterial({ color: 0x18242f, emissive: 0x08131b, roughness: 0.45, metalness: 0.35 });
  const mBodyLoop = new THREE.MeshStandardMaterial({ color: 0x1a2a36, emissive: 0x0a1a24, roughness: 0.45, metalness: 0.35 });
  const gSealFull = new THREE.TorusGeometry(0.44, 0.055, 8, 40);
  const sealGeoCache = new Map();
  const sealGeo = (gap) => { const k = Math.round(gap * 40); if (!sealGeoCache.has(k)) sealGeoCache.set(k, new THREE.TorusGeometry(0.44, 0.06, 8, 40, Math.PI * 2 * (1 - k / 40))); return sealGeoCache.get(k); };
  const gLink = new THREE.CylinderGeometry(0.03, 0.03, 1.7, 6); gLink.rotateX(Math.PI / 2);
  const mLink = new THREE.MeshBasicMaterial({ color: CYS, transparent: true, opacity: 0.45 });
  const gBurst = new THREE.SphereGeometry(0.07, 6, 6);

  const nodes = new Map();  // capsule id -> group
  const bursts = [];        // {mesh, vx, vy, vz, life}
  function nodeFor(c) {
    let g = nodes.get(c.id); if (g) return g;
    g = new THREE.Group();
    const body = new THREE.Mesh(gBody, c.kind === "loop" ? mBodyLoop : mBody); g.add(body);
    let seal;
    if (c.kind === "bad") {
      const gap = 0.12 + 0.28 * c.seal;
      const col = new THREE.Color(MOON).lerp(new THREE.Color(CYS), (1 - c.seal) * 0.6);
      seal = new THREE.Mesh(sealGeo(gap), new THREE.MeshBasicMaterial({ color: col }));
      seal.rotation.z = Math.random() * Math.PI * 2;
    } else {
      seal = new THREE.Mesh(gSealFull, new THREE.MeshBasicMaterial({ color: c.kind === "loop" ? 0x9fe8ff : CYS }));
    }
    seal.position.z = 0.55; g.add(seal);
    if (c.kind === "loop" && c.k > 0) { const link = new THREE.Mesh(gLink, mLink); link.position.z = -0.85; g.add(link); }
    g.userData = { seal, spin: (Math.random() - 0.5) * 0.02 };
    scene.add(g); nodes.set(c.id, g); return g;
  }
  function burst(x, y, z, color, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(gBurst, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
      m.position.set(x, y, z);
      bursts.push({ m, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, vz: (Math.random() - 0.5) * 6, life: 1 });
      scene.add(m);
    }
  }

  // sizing
  let W = 1, H = 1, camDist = 9;
  function size() {
    const r = stage.getBoundingClientRect(); W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
    renderer.setSize(W, H, false); camera.aspect = W / H;
    // the door (radius 4.2 plus glow) must fit the narrower axis of the view
    camDist = Math.max(9, 5.6 / (Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect)));
    camera.position.z = camDist; camera.lookAt(0, 0, -30); camera.updateProjectionMatrix();
  }
  size();
  const ro = "ResizeObserver" in window ? new ResizeObserver(size) : null; if (ro) ro.observe(stage);

  // game state
  let game = null, token = null, seed = null, running = false, raf = 0, last = 0, hudAt = 0, shake = 0, autoplayOn = demo, submitted = false;
  const device = deviceId();
  const v3 = new THREE.Vector3();
  function project(x, y, z) { v3.set(x, y, z).project(camera); return { x: (v3.x + 1) / 2 * W, y: (1 - v3.y) / 2 * H, front: v3.z < 1 }; }

  function pop(text, x, y, cls) {
    if (!pops) return;
    const d = document.createElement("div"); d.className = "g-pop " + (cls || ""); d.textContent = text;
    d.style.left = Math.max(8, Math.min(W - 8, x)) + "px"; d.style.top = Math.max(8, Math.min(H - 8, y)) + "px";
    pops.appendChild(d); setTimeout(() => d.remove(), 900);
  }
  let msgTimer = 0;
  function banner(text, cls) { if (!msg) return; msg.textContent = text; msg.className = "game-msg on " + (cls || ""); clearTimeout(msgTimer); msgTimer = setTimeout(() => { msg.className = "game-msg"; }, 1400); }

  function handle(events) {
    for (const e of events) {
      if (e.type === "receipt") { const p = project(e.x, e.y, 0); pop("+" + e.gain, p.x, p.y, "quiet"); snd("receipt"); }
      else if (e.type === "refused") { const p = project(e.x, e.y, e.z); pop("REFUSED  +" + e.gain, p.x, p.y, "good"); burst(e.x, e.y, e.z, MOON, 10); snd("refuse"); }
      else if (e.type === "loop") { const p = project(e.x, e.y, e.z); pop("LOOP CUT ×" + e.len + "  +" + e.gain, p.x, p.y, "loop"); burst(e.x, e.y, e.z, CYS, 16); snd("refuse"); banner("Refused at the cap · ×" + e.len, "loop"); }
      else if (e.type === "wrong") { const p = project(e.x, e.y, e.z); pop("SEALED. streak lost", p.x, p.y, "bad"); snd("tap"); }
      else if (e.type === "hit") { const p = project(e.x, e.y, 0); pop("−" + e.dmg + " budget", p.x, p.y, "bad"); shake = 1; stage.classList.add("hit"); setTimeout(() => stage.classList.remove("hit"), 260); snd("hit"); }
      else if (e.type === "clean") { banner("Clean wave  +" + e.gain, "clean"); snd("clean"); }
      else if (e.type === "wave") { banner("Wave " + e.wave); }
      else if (e.type === "attest") { stage.classList.add("slow"); setTimeout(() => stage.classList.remove("slow"), 1500); }
      else if (e.type === "over") { finish(); }
    }
  }

  function hudUpdate(force) {
    const s = game.state, now = performance.now();
    if (!force && now - hudAt < 90) return; hudAt = now;
    el.score.textContent = s.score.toLocaleString("en-US");
    el.mult.textContent = "×" + s.mult; el.mult.classList.toggle("hot", s.mult >= 3);
    el.streak.textContent = s.streak ? s.streak + " in a row" : "";
    el.fill.style.width = s.budget + "%"; el.budget.classList.toggle("low", s.budget <= 30);
    el.wave.textContent = "wave " + s.wave;
    const sec = Math.floor(s.t / 1000); el.time.textContent = sec >= 60 ? Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0") : sec + "s";
    el.attest.textContent = "Attest ·" + " ●".repeat(s.attest) + " ○".repeat(3 - s.attest);
    el.attest.disabled = s.attest === 0;
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(100, now - (last || now)); last = now;
    if (!document.hidden) {
      if (autoplayOn) autopilot(game);
      if (demo && !game.state.over && game.state.t >= 60000) game.input("end");
      game.step(dt);
      handle(game.drain());
      // sync meshes
      const alive = new Set();
      for (const c of game.state.caps) {
        alive.add(c.id);
        const g = nodeFor(c);
        g.position.set(c.x, c.y, c.z);
        g.rotation.z += g.userData.spin;
        if (c.kind === "bad") g.userData.seal.rotation.z += 0.03;
      }
      for (const [id, g] of nodes) { if (!alive.has(id)) { scene.remove(g); nodes.delete(id); } }
      for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.life -= dt / 380; if (b.life <= 0) { scene.remove(b.m); b.m.material.dispose(); bursts.splice(i, 1); continue; } b.m.position.x += b.vx * dt / 1000; b.m.position.y += b.vy * dt / 1000; b.m.position.z += b.vz * dt / 1000; b.m.material.opacity = b.life; }
      // camera and door feel
      const slow = game.state.slow > 0;
      ringGlow.material.opacity = slow ? 0.3 : 0.12 + 0.05 * Math.sin(now / 300);
      if (shake > 0) { shake = Math.max(0, shake - dt / 260); camera.position.x = (Math.random() - 0.5) * 0.25 * shake; camera.position.y = 0.4 + (Math.random() - 0.5) * 0.25 * shake; } else if (!reduce) { camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05; camera.position.y += (0.4 + pointer.y * 0.25 - camera.position.y) * 0.05; }
      stars.rotation.z += 0.00015 * dt;
      renderer.render(scene, camera);
      hudUpdate(false);
    }
    if (running) raf = requestAnimationFrame(frame);
  }

  // input
  const pointer = { x: 0, y: 0 };
  function pick(cx, cy) {
    if (!game || game.state.over) return;
    const radius = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ? 46 : 30;
    let best = null, bd = 1e9;
    for (const c of game.state.caps) {
      if (c.z < SPAWN_Z + 8) continue;
      const p = project(c.x, c.y, c.z); if (!p.front) continue;
      const d = Math.hypot(p.x - cx, p.y - cy) - (c.z > -20 ? 6 : 0);
      if (d < bd) { bd = d; best = c; }
    }
    if (best && bd <= radius) { game.input("refuse", best.id); handle(game.drain()); }
  }
  function onDown(e) { if (e.target.closest && e.target.closest("button,a,input")) return; const r = canvas.getBoundingClientRect(); pick(e.clientX - r.left, e.clientY - r.top); if (e.cancelable) e.preventDefault(); }
  function onMove(e) { const r = canvas.getBoundingClientRect(); pointer.x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1; pointer.y = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1); }
  function onKey(e) { if (e.code === "Space" && running && !e.repeat) { e.preventDefault(); attest(); } }
  function attest() { if (!game || game.state.over) return; const r = game.input("attest"); if (r && r.ok) { handle(game.drain()); hudUpdate(true); snd("fill"); } }
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  el.attest.addEventListener("click", attest);
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && running && !raf) { last = 0; raf = requestAnimationFrame(frame); } });

  // begin and end
  async function begin() {
    submitted = false; token = null; seed = new Date().toISOString().slice(0, 10) + ":offline";
    if (!demo) {
      try {
        const r = await fetch(BOARD + "/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ device }) });
        if (r.ok) { const j = await r.json(); token = j.token; seed = j.seed; }
      } catch { /* offline run */ }
    }
    game = createGame(seed);
    startO.hidden = true; endO.hidden = true; hud.hidden = false; stage.classList.add("live");
    const who = $("g-who"); if (who) who.textContent = demo ? "demo" : givenName ? "as " + givenName : "";
    hudUpdate(true); banner(demo ? "Demo · a patient player" : "Wave 1"); running = true; last = 0; snd("fill");
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function finish() {
    if (!running) return; running = false;
    const s = game.summary();
    setTimeout(() => {
      stage.classList.remove("live"); hud.hidden = true; endO.hidden = false;
      $("ge-score").textContent = s.score.toLocaleString("en-US");
      $("ge-why").textContent = s.reason === "budget" ? "Budget exhausted in wave " + s.wave + "." : s.reason === "time" ? "Full shift: ten minutes at the door. Wave " + s.wave + " reached." : "You left the door in wave " + s.wave + ".";
      $("ge-refused").textContent = s.refusedBad + " broken seal" + (s.refusedBad === 1 ? "" : "s") + ", " + s.refusedLoops + " loop" + (s.refusedLoops === 1 ? "" : "s") + " cut";
      $("ge-clean").textContent = s.cleanWaves + " clean wave" + (s.cleanWaves === 1 ? "" : "s");
      $("ge-leaked").textContent = s.leaked + " leaked, " + s.refusedGood + " sealed request" + (s.refusedGood === 1 ? "" : "s") + " wrongly refused";
      $("ge-receipts").textContent = s.receipts + " receipt" + (s.receipts === 1 ? "" : "s") + " · budget left " + Math.round(s.budget) + "%";
      const form = $("ge-form"), note = $("ge-note"), result = $("ge-result");
      const canSubmit = !!token && !demo && s.duration_ms >= 20000;
      note.textContent = demo ? "Demo run: not submitted." : !token ? "The leaderboard did not answer, so this run stays on your screen." : s.duration_ms < 20000 ? "Runs shorter than 20 seconds are not ranked." : "";
      result.className = "ge-result"; result.textContent = "";
      card({ s, rank: null });
      if (canSubmit && givenName.length >= 3) {
        // the name was given before the run: the score goes up by itself
        form.hidden = true; result.textContent = "sending to the board…";
        submit(givenName, givenHandle).then((j) => {
          if (j && j.ok) card({ s, rank: j.rank_today });
          document.dispatchEvent(new CustomEvent("sable-game-submitted", { detail: j }));
          if (!(j && j.ok)) { form.hidden = false; $("ge-name").value = givenName; $("ge-handle").value = givenHandle; $("ge-submit").disabled = false; }
        });
      } else {
        form.hidden = !canSubmit;
        if (canSubmit) { $("ge-name").value = store.get("sable-game-name") || ""; $("ge-handle").value = store.get("sable-game-handle") || ""; $("ge-submit").disabled = false; }
      }
    }, 650);
  }
  function card(o) {
    const box = $("ge-share"), cv = $("ge-card"); if (!box || !cv) return;
    const d = { score: o.s.score, wave: o.s.wave, refused: o.s.refused, refusedLoops: o.s.refusedLoops, leaked: o.s.leaked, cleanWaves: o.s.cleanWaves, seed, name: givenName || store.get("sable-game-name") || "", handle: givenHandle || store.get("sable-game-handle") || "", rank: o.rank };
    box.hidden = demo;
    if (demo) return;
    drawCard(cv, d).then(() => wireShare(cv, d, { share: $("ge-share-btn"), save: $("ge-save"), x: $("ge-x") })).catch(() => { box.hidden = true; });
  }
  async function submit(name, handle) {
    if (!game || running || !token || submitted) return { ok: false, error: "nothing to submit" };
    const s = game.summary();
    const body = { token, device, name, handle: handle || "", score: s.score, receipts: s.receipts, refused: s.refused, wave: s.wave, duration_ms: s.duration_ms, log_hash: s.log_hash, log: game.state.log };
    try {
      const r = await fetch(BOARD + "/score", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { submitted = true; store.set("sable-game-name", name); store.set("sable-game-handle", handle || ""); return j; }
      return { ok: false, error: j.error || ("http " + r.status) };
    } catch (e) { return { ok: false, error: "network" }; }
  }
  function end() { if (game && running) { game.input("end"); handle(game.drain()); } }
  function dispose() {
    running = false; if (raf) cancelAnimationFrame(raf); raf = 0;
    stage.removeEventListener("pointerdown", onDown); stage.removeEventListener("pointermove", onMove); el.attest.removeEventListener("click", attest); window.removeEventListener("keydown", onKey);
    if (ro) ro.disconnect(); for (const g of nodes.values()) scene.remove(g); nodes.clear(); renderer.dispose();
  }
  const api = { begin, end, submit, dispose, summary: () => game && game.summary(), running: () => running, token: () => token, seed: () => seed };
  // the hooks that can drive a run (the patient player, the game object) exist for the tests on a local
  // build and for the demo, never for a real run on the live page: one console line must not win a contest
  if (demo || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) Object.assign(api, { core: () => game, autoplay: (on) => { autoplayOn = !!on; }, debug: () => ({ W, H, camDist, aspect: camera.aspect, pos: [camera.position.x, camera.position.y, camera.position.z], dpr: renderer.getPixelRatio() }) });
  window.SABLE_GAME_RUN = api;
  return api;
}
