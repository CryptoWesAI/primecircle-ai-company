// A sharp image of the first letter's card on the live Letterbox topic, for sharing.
//   node tests/shot-letter-card.mjs <outDir>
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = process.argv[2] || "tests/shots"; mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1320, height: 900, deviceScaleFactor: 2 });
await p.goto("https://sable.primecircle.cloud/#letterbox", { waitUntil: "load" }); await sleep(2500);
const card = await p.$("#mail-list article.letter");
if (!card) { console.log("no letter card"); process.exit(1); }
await card.screenshot({ path: out + "/letter-card.png" });
// the card with its status line and the intro above it
const sec = await p.$("#letterbox");
await sec.screenshot({ path: out + "/letterbox-section.png" });
// after Verify: the verifier's answer
await (await p.$("#mail-list article.letter button")).click(); await sleep(3000);
const vout = await p.$("#vout"); if (vout) await vout.screenshot({ path: out + "/verify-answer.png" });
console.log("saved", out);
await b.close();
