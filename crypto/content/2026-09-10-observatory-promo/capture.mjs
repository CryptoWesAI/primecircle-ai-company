// Capture the promo shots for the Sable Observatory promo video.
//   node capture.mjs <outDir> [baseUrl]
// Writes NN-name.png at 1920x1080 CSS px, device scale 2 (3840x2160), and
// positions.json with the CSS-px centre of every element that was clicked.
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const exe = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
const outDir = process.argv[2] || "shots";
const base = (process.argv[3] || "https://sable.primecircle.cloud/").replace(/[/]$/, "");
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
p.on("pageerror", (e) => console.log("pageerror:", e.message));

const positions = {};
let n = 0;
async function shot(name) {
  n += 1;
  const file = join(outDir, String(n).padStart(2, "0") + "-" + name + ".png");
  await p.screenshot({ path: file });
  console.log("shot", file);
}
async function centre(sel) {
  return p.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
  }, sel);
}
async function click(key, sel, wait) {
  const c = await centre(sel);
  if (!c) { console.log("MISSING", sel); return; }
  positions[key] = c;
  await p.mouse.move(c.x, c.y);
  await p.mouse.click(c.x, c.y);
  await sleep(wait);
  console.log("clicked", key, JSON.stringify(c));
}

await p.goto(base + "/", { waitUntil: "load" });
await sleep(5000);
await shot("overview");

await click("explained", '#rail a[data-topic="explained"]', 2500);
await shot("explained");

await click("door", '#rail a[data-topic="door"]', 2500);
await shot("door");
await click("send", "#send", 4500);
await shot("door-sent");
await click("loop", "#loop", 1000);
for (let i = 0; i < 60; i++) {
  const refused = await p.evaluate(() => { const el = document.getElementById("refused"); return !!el && !el.hidden; });
  if (refused) break;
  await sleep(500);
}
await sleep(800);
await shot("door-loop");

await click("check", '#rail a[data-topic="check"]', 3500);
await shot("verify");

await click("token", '#rail a[data-topic="token"]', 4000);
await shot("token");

await click("play", '#rail a[data-topic="play"]', 4000);
await shot("play");

await click("log", '#rail a[data-topic="log"]', 3500);
await shot("log");

await click("community", '#rail a[data-topic="community"]', 2500);
await shot("community");
await click("guide", "#guide-btn", 2000);
await shot("guide");

writeFileSync(join(outDir, "positions.json"), JSON.stringify(positions, null, 2));
await b.close();
console.log("positions", JSON.stringify(positions));
