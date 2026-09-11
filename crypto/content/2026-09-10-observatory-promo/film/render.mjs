// Render film.html frame by frame with headless Chrome.
//   node render.mjs <framesDir> [fps] [duration] [previewSeconds...]
// With previewSeconds given, only those timestamps are rendered (named by time), for a quick look.
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const exe = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].find((p) => existsSync(p));
const outDir = process.argv[2] || join(here, "frames");
const fps = Number(process.argv[3] || 30);
const duration = Number(process.argv[4] || 51.9);
// "from=<sec>" as the 5th argument re-renders only the frames from that time on (earlier frames stay).
const fromArg = process.argv[5] && process.argv[5].startsWith("from=") ? Number(process.argv[5].slice(5)) : null;
const previews = fromArg == null ? process.argv.slice(5).map(Number) : [];
mkdirSync(outDir, { recursive: true });

const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--hide-scrollbars", "--force-device-scale-factor=1"] });
const p = await b.newPage();
await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
p.on("pageerror", (e) => console.log("pageerror:", e.message));
p.on("console", (m) => { if (m.type() === "error") console.log("console:", m.text()); });
await p.goto(pathToFileURL(join(here, "film.html")).href, { waitUntil: "load" });
await p.waitForFunction(() => window.__ready === true, { timeout: 30000 });

const t0 = Date.now();
if (previews.length) {
  for (const t of previews) {
    await p.evaluate((tt) => window.draw(tt), t);
    await p.screenshot({ path: join(outDir, `preview-${t}.png`) });
  }
  console.log("previews", previews.length);
} else {
  const total = Math.round(duration * fps);
  for (let i = fromArg == null ? 0 : Math.floor(fromArg * fps); i < total; i++) {
    await p.evaluate((tt) => window.draw(tt), i / fps);
    await p.screenshot({ path: join(outDir, String(i).padStart(5, "0") + ".png") });
    if (i % 300 === 0) console.log("frame", i, "of", total, Math.round((Date.now() - t0) / 1000) + "s");
  }
  console.log("frames", total, "in", Math.round((Date.now() - t0) / 1000) + "s");
}
await b.close();
