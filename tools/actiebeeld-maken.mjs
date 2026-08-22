#!/usr/bin/env node
// Schiet een actiebeeld-HTML af als PNG, op ware grootte, met de echte lettertypen en het
// echte logo uit de repo.
//
// Waarom dit bestaat: een beeldmodel kan het Belvanger-logo niet reproduceren en spelt
// Nederlandse tekst geregeld verkeerd. Een verkeerd logo of een typefout op een publieke
// actiepost is erger dan geen beeld. Wat hier uit komt klopt per definitie, en een
// tekstwijziging kost seconden in plaats van 150 credits.
//
// Gebruik:
//   node tools/actiebeeld-maken.mjs                                  # standaard: weggeefactie
//   node tools/actiebeeld-maken.mjs <html> <uit.png> [breedte] [hoogte]
//
// 1080x1350 is 4:5 en dat is het staande formaat dat Facebook en Instagram in de tijdlijn
// het grootst tonen. Wil je vierkant, geef dan 1080 1080 mee en controleer of de kop nog past.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const HTML = process.argv[2] || "docs/offers/actiebeeld-weggeefactie.html";
const UIT = process.argv[3] || "docs/offers/actiebeeld-weggeefactie.png";
const B = Number(process.argv[4] || 1080);
const H = Number(process.argv[5] || 1350);

const bron = path.resolve(ROOT, HTML);
if (!fs.existsSync(bron)) { console.error(`Bestaat niet: ${HTML}`); process.exit(1); }

const KANDIDATEN = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const BROWSER = KANDIDATEN.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
if (!BROWSER) { console.error("Geen Chrome/Chromium/Edge gevonden. Zet CHROME_PATH."); process.exit(1); }

// Eigen webserver op de repo-root. Nodig omdat de lettertypen met een relatief pad worden
// geladen; via file:// weigert de browser die op te halen en val je stil terug op een
// systeemletter, waarna het beeld er anders uitziet dan de site.
const TYPES = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript",
  ".woff2":"font/woff2", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const PORT = 4400 + (process.pid % 300);
const { createServer } = await import("node:http");
const server = createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT)) { s.writeHead(403); return s.end("nee"); }
  // Eerst lezen, dan pas de header schrijven. Andersom stuurt een ontbrekend bestand eerst
  // een 200 en daarna een 404, en dat is geen 404 maar een crash.
  let data;
  try { data = fs.readFileSync(f); }
  catch { s.writeHead(404, { "content-type": "text/plain" }); return s.end("niet gevonden: " + q.url); }
  s.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  s.end(data);
});
await new Promise((r) => server.listen(PORT, r));

const DP = 9500 + (process.pid % 300);
const ch = spawn(BROWSER, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${DP}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let list;
for (let i = 0; i < 60; i++) {
  try { list = await (await fetch(`http://127.0.0.1:${DP}/json/list`)).json(); if (list.length) break; } catch {}
  await sleep(250);
}
if (!list?.length) { console.error("Browser startte niet."); ch.kill(); server.close(); process.exit(1); }

const ws = new WebSocket(list[0].webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) pend.get(m.id)(m); };
const send = (m, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: B, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/${HTML}` });
await sleep(1200);

// Wachten tot de eigen lettertypen echt geladen zijn. Zonder dit schiet je soms een frame
// af waarin de systeemletter nog staat, en dan klopt de regelval niet met de site.
await send("Runtime.evaluate", { awaitPromise: true, expression: "document.fonts.ready" });
await sleep(400);

const gebruikt = (await send("Runtime.evaluate", { returnByValue: true, expression:
  `[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).join(', ') || 'GEEN eigen lettertype geladen'` }))
  .result?.result?.value;

const shot = await send("Page.captureScreenshot", { format: "png",
  clip: { x: 0, y: 0, width: B, height: H, scale: 1 } });

fs.mkdirSync(path.dirname(path.resolve(ROOT, UIT)), { recursive: true });
fs.writeFileSync(path.resolve(ROOT, UIT), Buffer.from(shot.result.data, "base64"));
ch.kill(); server.close();

const kb = (fs.statSync(path.resolve(ROOT, UIT)).size / 1024).toFixed(0);
console.log(`${UIT}  ${B}x${H}  ${kb} kB`);
console.log(`lettertypen: ${gebruikt}`);
process.exit(0);
