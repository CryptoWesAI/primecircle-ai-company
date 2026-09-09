// Renders guide.html to guide.pdf (A4, page numbers in the footer).
//   node crypto/content/2026-09-10-java-street-kit/render-guide.mjs
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");

const b = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await b.newPage();
await page.goto(pathToFileURL(join(here, "guide.html")).href, { waitUntil: "networkidle0" });
await page.waitForFunction(() => window.__ready === true && document.fonts.status === "loaded");
await page.waitForFunction(() => document.querySelectorAll("[data-qr] img, [data-qr] canvas").length >= 1);
await new Promise((r) => setTimeout(r, 300));

const foot = `<div style="width:100%;font-family:'IBM Plex Mono',Consolas,monospace;font-size:7.5pt;color:#5B6B78;padding:0 16mm;display:flex;justify-content:space-between;">
  <span>Gatekeeper on the street · the guide · 10 Sep 2026</span><span>page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;
await page.pdf({ path: join(here, "guide.pdf"), format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: foot, margin: { top: "16mm", right: "16mm", bottom: "18mm", left: "16mm" } });
await b.close();
console.log("rendered guide.pdf in", here);
