// End-to-end check of a source tag on the live site:
//   1. the page opened through ?src=<tag> stores the tag and shows the "from <tag>" tab;
//   2. a human-like run submitted with src=<tag> through the API lands under that tag;
//   3. /src?tag=<tag> counts it.
// Leaves one row to delete afterwards:
//   docker exec sable-board node admin.js delete-name "Smoke Java"
//   node java-tag-live.mjs https://sable.primecircle.cloud/ java
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createGame, TICK, RULES } from "../site/game/core.js";

const base = (process.argv[2] || "https://sable.primecircle.cloud/").replace(/\/$/, "");
const tag = process.argv[3] || "java";
const API = base + "/api/game";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? "ok   " : "FAIL ") + m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. the page
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.goto(`${base}/?src=${tag}#play`, { waitUntil: "load" });
await wait(2500);
const stored = await p.evaluate(() => { try { return localStorage.getItem("sable-game-src"); } catch { return null; } });
ok(stored === tag, `page stores the tag in localStorage: ${JSON.stringify(stored)}`);
const tabText = await p.evaluate((t) => { const els = [...document.querySelectorAll("button, a, [role=tab]")]; const hit = els.find((e) => new RegExp("from " + t, "i").test(e.textContent || "")); return hit ? hit.textContent.trim() : null; }, tag);
ok(!!tabText, `leaderboard shows a "from ${tag}" tab: ${JSON.stringify(tabText)}`);
await b.close();

// 2. a real run through the API, with the tag
const dev = "device-javatag-" + Math.random().toString(36).slice(2, 12) + "0123456789";
const post = async (path, body) => { const r = await fetch(API + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
const get = async (path) => { const r = await fetch(API + path); return { status: r.status, body: await r.json().catch(() => ({})) }; };
function human(seed, ticks) {
  const g = createGame(seed); let r = 4242; const rnd = () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; const plan = new Map();
  for (let i = 0; i < ticks && !g.state.over; i++) {
    for (const c of g.state.caps) if ((c.kind === "bad" || (c.kind === "loop" && c.k === 0)) && !plan.has(c.id)) plan.set(c.id, rnd() < 0.85 ? -55 + rnd() * 49 : 99);
    for (const c of g.state.caps) { const at = plan.get(c.id); if (at != null && at < 99 && c.z > at) { g.input("refuse", c.id); plan.set(c.id, 99); break; } }
    g.step(TICK);
  }
  if (!g.state.over) g.input("end");
  const s = g.summary(); return { score: s.score, receipts: s.receipts, refused: s.refused, wave: s.wave, duration_ms: s.duration_ms, log_hash: s.log_hash, log: g.state.log };
}
const before = await get(`/src?tag=${tag}`);
const st = await post("/start", { device: dev }); ok(st.status === 200 && !!st.body.seed, "start hands out a token");
const t0 = Date.now(); const run = human(st.body.seed, 1500);
await wait(Math.max(0, run.duration_ms - (Date.now() - t0) + 400));
const rs = await post("/score", { token: st.body.token, device: dev, name: "Smoke Java", handle: "", rules: RULES, src: tag, ...run });
ok(rs.status === 200 && rs.body.ok === true, `run accepted: ${JSON.stringify(rs.body).slice(0, 140)}`);

// 3. the count
const after = await get(`/src?tag=${tag}`);
ok(after.body.runs === (before.body.runs || 0) + 1, `/src?tag=${tag} counts it: before ${before.body.runs}, after ${after.body.runs}`);
const top = await get(`/top?src=${tag}`);
ok((top.body.rows || []).some((r) => r.name === "Smoke Java"), `/top?src=${tag} lists the run (${(top.body.rows || []).length} rows)`);
console.log("java-tag-live:", "fails:", fails.length ? fails : "none");
if (fails.length) process.exit(1);
