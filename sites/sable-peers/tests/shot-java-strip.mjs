// Screenshot of the contest strip and the Java strip on the play page, desktop width.
//   node shot-java-strip.mjs https://sable.primecircle.cloud/ out.png
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const base = (process.argv[2] || "https://sable.primecircle.cloud/").replace(/\/$/, "");
const out = process.argv[3] || "shots/java-strip.png";
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1240, height: 700, deviceScaleFactor: 1.5 });
await p.goto(base + "/#play", { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 3000));
await p.evaluate(() => { const h = document.querySelector("#play h2"); if (h) h.scrollIntoView({ block: "start" }); });
await new Promise((r) => setTimeout(r, 500));
const vis = await p.evaluate(() => { const el = document.getElementById("java-soon"); const r = el && el.getBoundingClientRect(); return el ? { hidden: el.hidden, text: el.textContent.trim(), h: Math.round(r.height) } : null; });
console.log("java-soon:", JSON.stringify(vis));
await p.screenshot({ path: out });
await b.close();
console.log("wrote", out);
