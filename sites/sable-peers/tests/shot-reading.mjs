// Screenshots of the reading room and the first note, desktop and phone, plus checks.
//   node tests/static-server.mjs 8792 &   then   node tests/shot-reading.mjs http://127.0.0.1:8792 <outDir>
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const base = (process.argv[2] || "http://127.0.0.1:8792").replace(/\/$/, "");
const out = process.argv[3] || "tests/shots";
// optional: a local record.json served at /ext/record, so the counterfeit-watch line can be checked without nginx
const recordPath = process.argv[4] || "";
const recordJson = recordPath && existsSync(recordPath) ? readFileSync(recordPath, "utf8") : "";
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const errs = [], fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
async function page(w, h) { const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error" && !/sable-api|\/ext\/|api\/game|404|ERR_CONNECTION_REFUSED/.test(m.text())) errs.push(m.text()); });
  if (recordJson) { await p.setRequestInterception(true); p.on("request", (r) => { if (/\/ext\/record$/.test(r.url())) r.respond({ status: 200, contentType: "application/json", body: recordJson }); else r.continue(); }); }
  return p; }

for (const [w, h, tag] of [[1320, 900, "desk"], [390, 844, "phone"]]) {
  const p = await page(w, h);
  await p.goto(base + "/#reading", { waitUntil: "load" }); await sleep(2500);
  ok(await p.evaluate(() => { const e = document.getElementById("reading"); return !!e && getComputedStyle(e).display !== "none"; }), tag + ": reading section shown");
  ok(await p.evaluate(() => !document.getElementById("community") || getComputedStyle(document.getElementById("community")).display === "none"), tag + ": community hidden on reading");
  const cards = await p.evaluate(() => document.querySelectorAll("#notes-list article.note").length);
  ok(cards >= 1, tag + ": at least one note card (" + cards + ")");
  ok(await p.evaluate(() => document.querySelector('#rail a[data-topic="reading"]')?.getAttribute("aria-current") === "page"), tag + ": rail current=reading");
  ok(!(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), tag + ": no horizontal overflow on reading");
  const cfText = await p.evaluate(() => { const e = document.querySelector("#reading [data-cf-line]"); return e && !e.hidden ? e.textContent : ""; });
  if (recordJson || base.startsWith("https://sable.primecircle.cloud")) {
    const rec = recordJson ? JSON.parse(recordJson) : null;
    const expectHits = rec && rec.counterfeit_4663 ? rec.counterfeit_4663.hits.length : null;
    ok(/Counterfeit watch, Robinhood Chain \(chain 4663\)/.test(cfText), tag + ": counterfeit watch line rendered (" + cfText.slice(0, 60) + ")");
    if (expectHits != null) ok(expectHits ? new RegExp("^.*" + expectHits + " token").test(cfText) && /SABLE/.test(cfText) : /No token trading/.test(cfText), tag + ": counterfeit line matches the record (" + expectHits + " hit(s))");
    ok(await p.evaluate(() => { const e = document.querySelector("#token [data-cf-line]"); return !!e && !e.hidden && /chain 4663/.test(e.textContent); }), tag + ": the same line sits on the Token topic");
  }
  await p.screenshot({ path: join(out, `reading-${tag}.png`) });
  // the note page
  await p.goto(base + "/notes/robinhood-chain-bridge.html", { waitUntil: "load" }); await sleep(800);
  ok((await p.title()).startsWith("Should Sable bridge"), tag + ": note page title");
  ok(await p.evaluate(() => document.querySelectorAll("main.paper h3").length >= 6), tag + ": note page has its sections (## in markdown renders as h3 under the h1 title)");
  ok(!(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), tag + ": no horizontal overflow on the note");
  await p.screenshot({ path: join(out, `note-${tag}.png`) });
  await p.screenshot({ path: join(out, `note-${tag}-full.png`), fullPage: true });
  // the letterbox topic: shown alone, with a status line (closed, open, or not reachable), no overflow
  await p.goto(base + "/#letterbox", { waitUntil: "load" }); await sleep(1800);
  ok(await p.evaluate(() => { const e = document.getElementById("letterbox"); return !!e && getComputedStyle(e).display !== "none"; }), tag + ": letterbox section shown");
  ok(await p.evaluate(() => !document.getElementById("reading") || getComputedStyle(document.getElementById("reading")).display === "none"), tag + ": reading hidden on letterbox");
  const mailStatus = await p.evaluate(() => (document.getElementById("mail-status") || {}).textContent || "");
  ok(/letterbox|Handle/i.test(mailStatus) && !/Looking for/.test(mailStatus), tag + ": letterbox status resolved (" + mailStatus.slice(0, 70) + ")");
  ok(!(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), tag + ": no horizontal overflow on letterbox");
  await p.screenshot({ path: join(out, `letterbox-${tag}.png`) });
  // the guide lists the topic
  await p.goto(base + "/#home", { waitUntil: "load" }); await sleep(1500);
  ok(await p.evaluate(() => [...document.querySelectorAll("#guide-topics button")].some((b) => b.textContent.trim() === "Reading room")), tag + ": guide has a Reading room button");
  ok(await p.evaluate(() => !!document.querySelector('#orr-topics button[data-topic="reading"]')), tag + ": orrery chip present");
  await p.close();
}
await b.close();
console.log("page errors:", errs.length ? errs : "none");
console.log(fails.length ? "FAILED:\n- " + fails.join("\n- ") : "all checks passed");
process.exit(fails.length || errs.length ? 1 : 0);
