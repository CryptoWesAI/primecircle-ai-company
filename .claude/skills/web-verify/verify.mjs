// web-verify harness — observe your own web output instead of asserting it works.
// Screenshots a URL at multiple viewports/scroll positions using the SYSTEM browser
// (Chrome or Edge — no Chromium download), and reports console errors + horizontal
// overflow. Then Read the PNGs to actually LOOK at them.
//
// Setup (once, in any scratch dir):  npm i puppeteer-core
// Usage:  node verify.mjs <url> [outDir] [configJson]
//   config JSON = array of shots: [{ "name","w","h","wait","sel","y","fullPage" }]
//
// Requirements: Node + an installed Chrome or Edge. Uses the system browser via
// executablePath, so no big download. Windows/mac/linux paths auto-detected below.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
// Resolve puppeteer-core from the CURRENT WORKING DIR (waar je `npm i puppeteer-core`
// draaide), niet vanuit de skill-map.
const require = createRequire(path.join(process.cwd(), "noop.js"));
const puppeteer = require("puppeteer-core");

const URL = process.argv[2] || "http://localhost:3000/";
const OUT = process.argv[3] || "./shots";
const CFG = process.argv[4];

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/microsoft-edge",
];
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("Geen Chrome/Edge gevonden. Installeer er een, of pas CHROME_CANDIDATES aan.");
  process.exit(1);
}

const DEFAULT_SHOTS = [
  { name: "desktop-top", w: 1440, h: 900, wait: 3500 },
  { name: "desktop-full", w: 1440, h: 900, wait: 3500, fullPage: true },
  { name: "mobiel-top", w: 390, h: 844, wait: 3500 },
  { name: "mobiel-full", w: 390, h: 844, wait: 3500, fullPage: true },
];
const shots = CFG ? JSON.parse(fs.readFileSync(CFG, "utf8")) : DEFAULT_SHOTS;

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--hide-scrollbars"],
  });
  let problems = 0;
  for (const s of shots) {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    if (s.sel) await page.evaluate((x) => { const el = document.querySelector(x); if (el) el.scrollIntoView({ block: "center" }); }, s.sel);
    else if (s.y) await page.evaluate((y) => scrollTo(0, y), s.y);
    await new Promise((r) => setTimeout(r, s.wait || 2000));
    // check: horizontale overflow (body mag nooit horizontaal scrollen)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: !!s.fullPage });
    const flags = [];
    if (overflow > 1) { flags.push(`⚠ horizontale overflow +${overflow}px`); problems++; }
    if (errors.length) { flags.push(`⚠ ${errors.length} console-fout(en)`); problems++; }
    console.log(`  ${s.name} (${s.w}×${s.h})${flags.length ? "  " + flags.join(" · ") : "  ok"}`);
    errors.slice(0, 3).forEach((e) => console.log("      · " + e.slice(0, 120)));
    await page.close();
  }
  await browser.close();
  console.log(problems ? `\nKLAAR — ${problems} aandachtspunt(en). Bekijk de PNG's in ${OUT}/` : `\nKLAAR — geen overflow/console-fouten. Bekijk de PNG's in ${OUT}/`);
})().catch((e) => { console.error("FOUT:", e.message); process.exit(1); });
