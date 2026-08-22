// Neemt alles op wat de verdelgerfilm nodig heeft BEHALVE act 1 (de gegenereerde
// shot). Levert: de simulatie als frame-reeks op 1080x1920, en de twee tekstkaarten
// als PNG. Zie docs/offers/belvanger-film-verdelger-2026-08-21.md.
//
// Draaien (vanuit de repo-wortel, node_modules met puppeteer-core staat daar):
//   node sites/belvanger/film/neem-verdelger-op.mjs [uitvoermap]
//
// Er wordt een eigen statische server gestart, dus je hoeft er niet zelf een naast
// te draaien. Dat scheelt de stap waar de vorige twee films telkens op struikelden:
// een script dat naar poort 18300 wijst terwijl daar niets luistert, hangt gewoon.
import puppeteer from "puppeteer-core";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HIER, "..", "site");
const UIT = path.resolve(process.argv[2] || path.join(HIER, "werkmap-verdelger"));
const SIM = path.join(UIT, "sim-frames");

const FPS = 25;
// Van "Gemiste oproep" (app.js: 3400ms) tot 1,0s na de laatste melding (12700ms).
// Het rinkelen zit al in act 1; daar nog een keer op knippen zou de film verdubbelen.
const SIM_MS = 10300;
const STEP = 1000 / FPS;

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  process.env.CHROME_PATH,
].filter(Boolean).find((p) => fs.existsSync(p));
if (!CHROME) { console.error("Geen Chrome of Edge gevonden. Zet CHROME_PATH."); process.exit(1); }

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".json": "application/json",
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const doel = path.join(SITE, rel);
  // Nooit buiten site/ serveren, ook niet met ../ in de URL.
  if (!doel.startsWith(SITE) || !fs.existsSync(doel) || fs.statSync(doel).isDirectory()) {
    res.writeHead(404).end("404");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(doel)] || "application/octet-stream" });
  fs.createReadStream(doel).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASIS = `http://127.0.0.1:${server.address().port}`;

fs.rmSync(UIT, { recursive: true, force: true });
fs.mkdirSync(SIM, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--force-device-scale-factor=1", "--hide-scrollbars"],
});
const fouten = [];

// ── 1. De simulatie, vak-variant ──────────────────────────────────────────────
const p = await browser.newPage();
p.on("pageerror", (e) => fouten.push("sim: " + e));
await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await p.goto(`${BASIS}/film-opnamepodium.html?vak=verdelger`, { waitUntil: "networkidle2" });

// Wachten op de INHOUD, niet op de pagina: bij een geladen pagina met een lege
// simulatie film je een skelet zonder het te merken.
await p.waitForFunction(
  () => document.querySelector('[data-step="4"]').textContent.includes("wespennest"),
  { timeout: 10000 },
);
await p.waitForFunction(
  () => document.querySelector("[data-phone]").getAttribute("data-state") === "missed",
  { timeout: 25000 },
);

const t0 = Date.now();
let n = 0;
while (Date.now() - t0 < SIM_MS) {
  const wacht = t0 + n * STEP - Date.now();
  if (wacht > 0) await new Promise((r) => setTimeout(r, wacht));
  await p.screenshot({
    path: path.join(SIM, `f${String(n).padStart(5, "0")}.jpg`),
    type: "jpeg", quality: 95, optimizeForSpeed: true,
  });
  n += 1;
}
const echteDuur = (Date.now() - t0) / 1000;
const eind = await p.evaluate(() => ({
  state: document.querySelector("[data-phone]").getAttribute("data-state"),
  laatsteMelding: document.querySelector('[data-step="9"]').classList.contains("is-in"),
  bedieningZichtbaar: getComputedStyle(document.querySelector(".simctl")).opacity !== "0",
  eerlijkheidsregel: document.querySelector(".phone-note").textContent.trim(),
}));
await p.close();

// ── 2. De twee tekstkaarten ───────────────────────────────────────────────────
for (const k of [1, 2]) {
  const kp = await browser.newPage();
  kp.on("pageerror", (e) => fouten.push(`kaart ${k}: ` + e));
  await kp.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await kp.goto(`${BASIS}/film-tekstkaarten.html?set=verdelger&kaart=${k}`, { waitUntil: "networkidle2" });
  // Webfonts: zonder deze wacht staat de kaart in Georgia/Arial op het frame.
  await kp.evaluateHandle("document.fonts.ready");
  await kp.screenshot({ path: path.join(UIT, `kaart-${k}.png`), type: "png" });
  await kp.close();
}

// ── 3. Plaatshouder voor act 1 ─────────────────────────────────────
// Act 1 is de enige shot die niet uit deze repo kan komen: die wordt gegenereerd.
// Zolang hij er niet is, monteert monteer-verdelger.sh dit kaartje op zijn plek, zodat
// het ritme van de rest wel te beoordelen is in plaats van te moeten wachten.
const slate = await browser.newPage();
await slate.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await slate.setContent(`<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Archivo; src: url('${BASIS}/fonts/archivo-standard.woff2') format('woff2'); }
  html,body { margin:0; height:100%; }
  body { background: radial-gradient(120% 80% at 50% 30%, #16232E 0%, #0E1A24 55%, #070C11 100%);
         color:#F4F2ED; font-family: Archivo, Arial, sans-serif;
         display:flex; flex-direction:column; justify-content:center; padding:0 110px; }
  .kop { font-size:52px; font-weight:800; letter-spacing:.02em; color:#FF5A1F; }
  p { font-size:44px; line-height:1.45; color:#B6BFC7; margin:34px 0 0; }
</style>
<div class="kop">ACT 1 ONTBREEKT</div>
<p>Hier komt het gegenereerde shot van 7,0 seconden:<br>de verdelger op de ladder, het nest in twee handen,<br>en de telefoon die blijft gaan.</p>
<p>Draaiboek en prompt: docs/offers/belvanger-film-verdelger-2026-08-21.md</p>`);
await slate.evaluateHandle("document.fonts.ready");
await slate.screenshot({ path: path.join(UIT, "act1-plaatshouder.png"), type: "png" });
await slate.close();

await browser.close();
server.close();

// De opname haalt de 25 fps niet: een screenshot kost tijd. Bij 237 frames over
// 10,33 seconden is de ECHTE invoersnelheid 22,9 fps, en die schrijven we op zodat
// de montage de simulatie op ware snelheid afspeelt in plaats van 8% te snel.
fs.writeFileSync(path.join(UIT, "opname.json"), JSON.stringify({
  frames: n, seconden: Number(echteDuur.toFixed(3)),
  invoerFps: Number((n / echteDuur).toFixed(3)),
}, null, 2));
// Dezelfde meting nog een keer, maar leesbaar voor de montage-shell. Een shellscript
// dat JSON moet parsen heeft daar een tweede taal voor nodig; dit is één regel.
fs.writeFileSync(path.join(UIT, "opname.env"), `SIM_FPS=${(n / echteDuur).toFixed(3)}
SIM_FRAMES=${n}
`);

console.log("frames:", n, "| beoogd:", Math.round(SIM_MS / STEP), "| wandklok:", echteDuur.toFixed(2), "s");
console.log("echte invoersnelheid:", (n / echteDuur).toFixed(2), "fps (in opname.json)");
console.log("filmduur van de simulatie bij 25fps:", (n / FPS).toFixed(2), "s");
console.log("eindstand:", JSON.stringify(eind));
console.log("console-fouten:", fouten.length ? fouten : "geen");
console.log("uitvoer:", UIT);
