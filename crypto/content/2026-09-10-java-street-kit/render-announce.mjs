// Renders announce.html to announce.png (1200x675, 2x).
//   node crypto/content/2026-09-10-java-street-kit/render-announce.mjs
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await b.newPage();
await page.setViewport({ width: 1200, height: 675, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(join(here, "announce.html")).href, { waitUntil: "networkidle0" });
await page.waitForFunction(() => window.__ready === true && document.fonts.status === "loaded");
await page.waitForFunction(() => document.querySelectorAll("[data-qr] img, [data-qr] canvas").length >= 1);
await new Promise((r) => setTimeout(r, 300));
const card = await page.$("#card");
await card.screenshot({ path: join(here, "announce.png") });
await b.close();
console.log("rendered announce.png in", here);
