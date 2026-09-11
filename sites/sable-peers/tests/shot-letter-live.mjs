import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = process.argv[2] || "tests/shots";
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const errs = [];
for (const [w, h, tag] of [[1320, 900, "desk"], [390, 844, "phone"]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h });
  p.on("pageerror", (e) => errs.push(tag + ": " + e.message));
  await p.goto("https://sable.primecircle.cloud/#letterbox", { waitUntil: "load" }); await sleep(2500);
  const info = await p.evaluate(() => ({
    status: document.getElementById("mail-status")?.textContent.trim(),
    letters: document.querySelectorAll("#mail-list article.letter").length,
    first: document.querySelector("#mail-list article.letter")?.innerText.replace(/\s+/g, " ").slice(0, 420),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    btn: !!document.querySelector("#mail-list article.letter button"),
  }));
  console.log(tag, JSON.stringify(info, null, 1));
  await p.screenshot({ path: out + "/letterbox-live-" + tag + ".png" });
  const btn = await p.$("#mail-list article.letter button");
  if (btn) { await btn.click(); await sleep(3500);
    console.log(tag, "after verify:", JSON.stringify(await p.evaluate(() => ({ hash: location.hash, vout: (document.getElementById("vout") || {}).innerText?.replace(/\s+/g, " ").slice(0, 300) }))));
    await p.screenshot({ path: out + "/letterbox-live-" + tag + "-verified.png" }); }
  await p.close();
}
await b.close(); console.log("page errors:", errs.length ? errs : "none");
