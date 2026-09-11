// Lists every request the page makes that fails, with the reason: which resource a
// console error like "Failed to load resource: net::ERR_CONNECTION_REFUSED" points at.
//   node tests/failed-requests.mjs <url-or-file> [#hash]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const url = (process.argv[2] || "") + (process.argv[3] || "");
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1320, height: 900 });
const failed = [];
p.on("requestfailed", (r) => failed.push((r.failure() || {}).errorText + "  " + r.method() + " " + r.url().slice(0, 120)));
p.on("response", (r) => { if (r.status() >= 400) failed.push("HTTP " + r.status() + "  " + r.request().method() + " " + r.url().slice(0, 120)); });
await p.goto(url, { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 3500));
console.log(failed.length ? failed.join("\n") : "no failed requests");
await b.close();
