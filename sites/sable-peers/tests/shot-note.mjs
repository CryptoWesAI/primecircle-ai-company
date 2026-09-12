// Screenshots and checks for one reading-room note page, desktop and phone.
//   node tests/shot-note.mjs <base> <slug> <outDir>
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const base = (process.argv[2] || "http://127.0.0.1:8792").replace(/\/$/, ""), slug = process.argv[3] || "sabl-migration", out = process.argv[4] || "tests/shots";
mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const fails = [], errs = []; const ok = (c, m) => { if (!c) fails.push(m); };
for (const [w, h, tag] of [[1320, 900, "desk"], [390, 844, "phone"]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h });
  p.on("pageerror", (e) => errs.push(e.message));
  const r = await p.goto(base + "/notes/" + slug + ".html", { waitUntil: "load" });
  ok(r.status() === 200, tag + ": note page 200 (" + r.status() + ")");
  await new Promise((s) => setTimeout(s, 600));
  const info = await p.evaluate(() => ({ title: document.title, h3: document.querySelectorAll("main.paper h3").length, ol: document.querySelectorAll("main.paper ol li").length, pdf: !!document.querySelector('a[href$=".pdf"]'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, dash: /\u2014/.test(document.body.innerText) }));
  ok(/SABL moves to Robinhood Chain/.test(info.title), tag + ": title");
  ok(info.h3 >= 6, tag + ": sections (" + info.h3 + ")");
  ok(info.ol >= 10, tag + ": the ten steps (" + info.ol + ")");
  ok(info.pdf, tag + ": PDF link present");
  ok(!info.overflow, tag + ": no horizontal overflow");
  ok(!info.dash, tag + ": no em-dash in the text");
  await p.screenshot({ path: out + "/note-" + slug + "-" + tag + ".png" });
  await p.screenshot({ path: out + "/note-" + slug + "-" + tag + "-full.png", fullPage: true });
  // the list shows the new piece first
  await p.goto(base + "/#reading", { waitUntil: "load" }); await new Promise((s) => setTimeout(s, 2000));
  const first = await p.evaluate(() => (document.querySelector("#notes-list article.note") || {}).innerText || "");
  ok(/SABL moves to Robinhood Chain/.test(first), tag + ": new piece listed first (" + first.slice(0, 50).replace(/\s+/g, " ") + ")");
  const pdfRes = await p.evaluate(async (u) => { const r = await fetch(u); const buf = await r.arrayBuffer(); return { status: r.status, type: r.headers.get("content-type") || "", magic: String.fromCharCode(...new Uint8Array(buf.slice(0, 5))) }; }, base + "/notes/2026-09-12-" + slug + ".pdf");
  ok(pdfRes.status === 200 && pdfRes.magic === "%PDF-", tag + ": PDF served (" + pdfRes.status + " " + pdfRes.type + " " + pdfRes.magic + ")");
  await p.close();
}
await b.close();
console.log("page errors:", errs.length ? errs : "none");
console.log(fails.length ? "FAILED:\n- " + fails.join("\n- ") : "note: all checks passed");
process.exit(fails.length || errs.length ? 1 : 0);
