// Opens today's contest card on a page and saves it as an image, for a look.
//   node shot-daily.mjs https://sable.primecircle.cloud/
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const base=process.argv[2];
const b=await puppeteer.launch({executablePath:exe,headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.goto(base+"#play",{waitUntil:"load"});
  await p.waitForFunction(()=>!document.getElementById("contest").hidden,{timeout:15000});
  await p.waitForFunction(()=>window.SABLE_ORRERY&&window.SABLE_ORRERY.today&&window.SABLE_ORRERY.today(),{timeout:15000}).catch(()=>{});
  await wait(1500);
  await p.click("#contest a[data-daily]");
  await p.waitForFunction(()=>window.__daily,{timeout:15000});
  await wait(800);
  const png=await p.evaluate(()=>document.getElementById("daily-cv").toDataURL("image/png"));
  const { writeFileSync } = await import("node:fs");
  writeFileSync("shots/daily-card.png", Buffer.from(png.split(",")[1], "base64"));
  console.log("card:", JSON.stringify(await p.evaluate(()=>({day:window.__daily.dayN,total:window.__daily.total,rows:window.__daily.rows.map(r=>r.name+" "+r.score),ends:window.__daily.ends,sentence:(window.__daily.sentence||"").slice(0,80),gw:window.__daily.gw,conf:window.__daily.conf}))));
  console.log("post:", decodeURIComponent(await p.$eval("#daily-x",a=>a.href)).slice(0,300));
}finally{ await b.close(); }
