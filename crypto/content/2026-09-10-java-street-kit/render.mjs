// Renders poster.html to poster.pdf (A4 poster + A4 sheet of four A6 flyers),
// poster.png and flyers.png. Run from the repo root:
//   node crypto/content/2026-09-10-java-street-kit/render.mjs
// Needs Chrome on this machine and network access for the font and the QR library.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");

const b = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await b.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 }); // A4 at 96 dpi, rendered at 2x
await page.goto(pathToFileURL(join(here, "poster.html")).href, { waitUntil: "networkidle0" });
await page.waitForFunction(() => window.__ready === true && document.fonts.status === "loaded");
await page.waitForFunction(() => document.querySelectorAll("[data-qr] img, [data-qr] canvas").length >= 5);
await new Promise((r) => setTimeout(r, 400));

await page.pdf({ path: join(here, "poster.pdf"), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
const poster = await page.$("#poster");
await poster.screenshot({ path: join(here, "poster.png") });
const flyers = await page.$("#flyers");
await flyers.screenshot({ path: join(here, "flyers.png") });
await b.close();
console.log("rendered poster.pdf, poster.png, flyers.png in", here);
