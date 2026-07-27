// Neemt de hero-simulatie op als frame-reeks op exact 1080x1920.
// Waarom een frame-reeks en geen screencast: dit is deterministisch en verliesvrij,
// en elk frame is een echte 1080x1920 render. Een telefoon-schermopname zou
// herschalen en comprimeren, en juist de tijdstempels zijn wat leesbaar moet blijven.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
const OUT = "./sim-frames";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const FPS = 25;               // 25 is genoeg: er beweegt alleen UI, geen echte beweging
const DURATION_MS = 15000;    // simulatie is 13,5s, plus rust aan het eind
const STEP = 1000 / FPS;

const b = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox", "--force-device-scale-factor=1", "--hide-scrollbars"] });
const p = await b.newPage();
const errors = []; p.on("pageerror", e => errors.push(String(e)));
await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

// Klok bevriezen zou de CSS-animaties stilzetten, dus we laten hem echt lopen en
// leggen frames vast op de wandklok. Kleine jitter is onzichtbaar bij UI-beweging.
await p.goto("http://127.0.0.1:18300/film-opnamepodium.html", { waitUntil: "networkidle2" });
await p.waitForFunction(() => document.querySelector("[data-phone]").getAttribute("data-state") === "ringing", { timeout: 20000 });

const t0 = Date.now();
let n = 0;
while (Date.now() - t0 < DURATION_MS) {
  const target = t0 + n * STEP;
  const wait = target - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  await p.screenshot({ path: `${OUT}/f${String(n).padStart(5, "0")}.jpg`, type: "jpeg", quality: 95, optimizeForSpeed: true });
  n += 1;
}
console.log("frames:", n, "| beoogd:", Math.round(DURATION_MS / STEP), "| duur:", ((Date.now()-t0)/1000).toFixed(1), "s");
console.log("eindstand:", JSON.stringify(await p.evaluate(() => ({
  state: document.querySelector("[data-phone]").getAttribute("data-state"),
  bedieningZichtbaar: getComputedStyle(document.querySelector(".simctl")).opacity !== "0",
}))));
console.log("console-fouten:", errors.length ? errors : "geen");
await b.close();
