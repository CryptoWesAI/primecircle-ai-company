// Captures the game mid-play at phone size from the live site, for the poster.
//   node crypto/content/2026-09-10-java-street-kit/capture-game.mjs [base]
// Writes game-phone.png (whole phone screen) and game-stage.png (the stage only).
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] || "https://sable.primecircle.cloud/";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await p.goto(base + "#play", { waitUntil: "load" });
await wait(2500);
await p.waitForSelector("#game-demo", { visible: true, timeout: 20000 });
await p.$eval("#game-demo", (el) => el.click());
await p.waitForFunction(() => window.SABLE_GAME_RUN && window.SABLE_GAME_RUN.running(), { timeout: 30000 });
await wait(Number(process.argv[3] || 14000));
await p.evaluate(() => {
  for (const id of ["contest", "install-offer", "guide", "bell"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
  const w = document.getElementById("g-who"); if (w) w.textContent = "";
  const s = document.getElementById("game-stage"); s.scrollIntoView({ block: "start" }); window.scrollBy(0, -12);
});
await wait(400);
await p.screenshot({ path: join(here, "game-phone.png") });
const stage = await p.$("#game-stage");
await stage.screenshot({ path: join(here, "game-stage.png") });
await b.close();
console.log("wrote game-phone.png and game-stage.png");
