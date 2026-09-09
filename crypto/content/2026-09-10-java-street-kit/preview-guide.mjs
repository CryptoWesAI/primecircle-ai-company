// Full-page PNG of guide.html in print media, to eyeball the layout without a PDF viewer.
//   node crypto/content/2026-09-10-java-street-kit/preview-guide.mjs [out.png]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || join(here, "guide-preview.png");
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
await p.setViewport({ width: 794, height: 1100, deviceScaleFactor: 1.5 });
await p.emulateMediaType("print");
await p.goto(pathToFileURL(join(here, "guide.html")).href, { waitUntil: "networkidle0" });
await p.waitForFunction(() => window.__ready === true && document.fonts.status === "loaded");
await new Promise((r) => setTimeout(r, 500));
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log("wrote", out);
