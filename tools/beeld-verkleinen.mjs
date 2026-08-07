#!/usr/bin/env node
// Verkleint een afbeelding naar webp op een gegeven breedte, zonder ImageMagick of sharp.
//
// Waarom via de browser: de ffmpeg in sommige omgevingen is gebouwd zonder webp, en npm
// installeren kan achter een dichte egress niet. Een Chromium die er toch al staat kan
// allebei: webp lezen én webp schrijven (Page.captureScreenshot format:"webp").
//
// Gebruik:
//   node tools/beeld-verkleinen.mjs <in> <uit.webp> <breedte> [kwaliteit 0-100]
//
// Voorbeeld:
//   node tools/beeld-verkleinen.mjs hero.png site/assets/voorbeelden/glaszetter-hero.webp 1920 82
//
// De hoogte volgt uit de bronverhouding; er wordt niet bijgesneden. Wil je bijsnijden naar
// een vaste verhouding (zoals de 900x1200 van een galerij-thumbnail), geef dan ook een
// hoogte mee als "1920x1080" in plaats van alleen een breedte: dan wordt er wel gesneden,
// midden uitgelijnd.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , IN, UIT, MAAT, KWAL = "82"] = process.argv;
if (!IN || !UIT || !MAAT) {
  console.error("Gebruik: node tools/beeld-verkleinen.mjs <in> <uit.webp> <breedte|BxH> [kwaliteit]");
  process.exit(2);
}
if (!fs.existsSync(IN)) {
  console.error(`Bronbestand bestaat niet: ${IN}`);
  process.exit(1);
}

const [bStr, hStr] = String(MAAT).split("x");
const BREEDTE = Number(bStr);
const HOOGTE = hStr ? Number(hStr) : null;
if (!Number.isFinite(BREEDTE) || BREEDTE <= 0) {
  console.error(`Ongeldige maat: ${MAAT}`);
  process.exit(2);
}

// ── Browser zoeken ───────────────────────────────────────────────────────────
const KANDIDATEN = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const BROWSER = KANDIDATEN.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
if (!BROWSER) {
  console.error("Geen Chrome/Chromium/Edge gevonden. Zet CHROME_PATH naar het uitvoerbare bestand,");
  console.error("of gebruik ImageMagick:  magick in.png -resize 1920x -quality 82 uit.webp");
  process.exit(1);
}

// ── Pagina die de bron op ware grootte toont ─────────────────────────────────
// De afbeelding wordt als data-URI ingesloten: dan hoeft er geen webserver bij en raakt
// er niets aan een pad of aan een egress-regel.
const ext = path.extname(IN).toLowerCase().replace(".", "");
const mime = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif" }[ext];
if (!mime) { console.error(`Onbekende extensie: ${ext}`); process.exit(2); }
const dataUri = `data:${mime};base64,${fs.readFileSync(IN).toString("base64")}`;

const PORT = 9400 + (process.pid % 200);
const ch = spawn(BROWSER, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let list;
for (let i = 0; i < 60; i++) {
  try { list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (list.length) break; } catch {}
  await sleep(250);
}
if (!list?.length) { console.error("Browser startte niet."); ch.kill(); process.exit(1); }

const ws = new WebSocket(list[0].webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) pend.get(m.id)(m); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");

// Eerst de bronmaten opvragen, want daaruit volgt de doelhoogte.
await send("Emulation.setDeviceMetricsOverride", { width: 10, height: 10, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "about:blank" });
await sleep(200);
const meta = (await send("Runtime.evaluate", {
  awaitPromise: true, returnByValue: true,
  expression: `new Promise(res=>{const i=new Image();i.onload=()=>res({w:i.naturalWidth,h:i.naturalHeight});i.onerror=()=>res(null);i.src=${JSON.stringify(dataUri)}})`,
})).result?.result?.value;
if (!meta) { console.error("Kon het bronbeeld niet decoderen."); ch.kill(); process.exit(1); }

const doelH = HOOGTE ?? Math.round((meta.h / meta.w) * BREEDTE);
// object-fit:cover snijdt alleen als er een hoogte is opgegeven die niet met de bron klopt.
const html = `<!doctype html><meta charset=utf-8><style>
  html,body{margin:0;padding:0;background:#000;overflow:hidden}
  img{display:block;width:${BREEDTE}px;height:${doelH}px;object-fit:cover;object-position:center}
</style><img src="${dataUri}">`;

await send("Emulation.setDeviceMetricsOverride", { width: BREEDTE, height: doelH, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(html, "utf8").toString("base64") });
await sleep(1200);

const shot = await send("Page.captureScreenshot", {
  format: "webp", quality: Number(KWAL), captureBeyondViewport: false,
  clip: { x: 0, y: 0, width: BREEDTE, height: doelH, scale: 1 },
});
if (!shot.result?.data) { console.error("Opname mislukte."); ch.kill(); process.exit(1); }

fs.mkdirSync(path.dirname(path.resolve(UIT)), { recursive: true });
fs.writeFileSync(UIT, Buffer.from(shot.result.data, "base64"));
ch.kill();

const inKb = (fs.statSync(IN).size / 1024).toFixed(0);
const uitKb = (fs.statSync(UIT).size / 1024).toFixed(0);
console.log(`${IN}  ${meta.w}x${meta.h} ${inKb}kB  →  ${UIT}  ${BREEDTE}x${doelH} ${uitKb}kB  (kwaliteit ${KWAL})`);
process.exit(0);
