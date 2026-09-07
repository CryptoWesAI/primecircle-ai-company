// Why is the demo button not clickable after "Play again"? Prints what sits at its centre.
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
const srv = spawn(process.execPath, ["static-server.mjs", "8792"], { stdio: ["ignore", "pipe", "inherit"] }); await new Promise((r) => srv.stdout.once("data", r));
const bd = spawn(process.execPath, ["../leaderboard/server.js"], { env: { ...process.env, PORT: "8791", BOARD_SECRET: "test-secret-test-secret-test-secret-1234", BOARD_DB: ":memory:", BOARD_ALLOW_ORIGIN: "*" }, stdio: ["ignore", "pipe", "inherit"] }); await new Promise((r) => bd.stdout.once("data", r));
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const p = await b.newPage(); await p.setViewport({ width: 1320, height: 900 });
  await p.goto("http://127.0.0.1:8792/index.html#play", { waitUntil: "load" }); await new Promise((r) => setTimeout(r, 1000));
  await p.type("#gs-name", "Debug Bot"); await p.click("#game-play");
  await p.waitForFunction(() => window.SABLE_GAME_RUN && window.SABLE_GAME_RUN.running(), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500)); await p.evaluate(() => window.SABLE_GAME_RUN.end()); await new Promise((r) => setTimeout(r, 1500));
  await p.click("#game-again"); await new Promise((r) => setTimeout(r, 400));
  const info = await p.evaluate(() => {
    const d = document.getElementById("game-demo"), r = d.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const st = document.getElementById("game-stage").getBoundingClientRect();
    return { demo: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vh: innerHeight, vw: innerWidth, at: at && (at.tagName + "#" + at.id + "." + at.className), stage: [Math.round(st.top), Math.round(st.height)], startHidden: document.getElementById("game-start").hidden, endHidden: document.getElementById("game-end").hidden, shareHidden: document.getElementById("ge-share").hidden, hudHidden: document.getElementById("game-hud").hidden };
  });
  console.log(JSON.stringify(info));
  await p.screenshot({ path: "shots/debug-again.png" });
} finally { await b.close(); srv.kill(); bd.kill(); }
