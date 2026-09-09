// Crops for the peer threads, from the live page at 2x: the field table, the token ladder,
// the ring with the burn watch, the reliability record, the section intro.
//   node shot-thread.mjs [base-url] [out-dir]
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url));
const base=process.argv[2]||"https://sable.primecircle.cloud/";
const out=process.argv[3]||join(here,"shots","thread"); mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); await p.setViewport({width:1320,height:900,deviceScaleFactor:2});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function shot(hash,sel,name,settle=2500){
  await p.goto(base+hash,{waitUntil:"load"}); await wait(settle);
  const el=await p.$(sel); if(!el){console.log("missing",sel);return;}
  await el.evaluate(e=>e.scrollIntoView({block:"start"})); await wait(400);
  await el.screenshot({path:join(out,name)}); console.log(name);
}
await shot("#field","#field .tablewrap","field-table.png",4000);
await shot("#field","#field",  "field-section-top.png",4000);
await shot("#token","#token .ladder","token-ladder.png",4000);
await shot("#token","#token .ring-stage, #token .ring-wrap, #ring","token-ring.png",4000);
await shot("#token","#burn-watch","burn-watch.png",4000);
await shot("#log","#rfacts","reliability-facts.png",4000);
await shot("#log","#rgrid","reliability-grid.png",4000);
await shot("#log","#claims","announced-then-checked.png",4000);
await shot("#who","#who > .sub, #who .sub","who-intro.png",2000);
await b.close();
