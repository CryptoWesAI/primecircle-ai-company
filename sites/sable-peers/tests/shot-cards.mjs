// One PNG per peer card from the "Every name on the list" section, at 2x, for posts.
//   node shot-cards.mjs [base-url] [out-dir]
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url));
const base=process.argv[2]||pathToFileURL(join(here,"..","site","index.html")).href;
const out=process.argv[3]||join(here,"shots","cards"); mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); await p.setViewport({width:1320,height:900,deviceScaleFactor:2});
await p.goto(base+"#who",{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1500));
const cards=await p.$$("#who .who .card");
for(const c of cards){
  const name=await c.$eval("h3",e=>e.textContent.trim());
  const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  await c.evaluate(e=>e.scrollIntoView({block:"center"})); await new Promise(r=>setTimeout(r,150));
  await c.screenshot({path:join(out,slug+".png")});
  console.log(slug+".png");
}
const up=await p.$("#who-up"); if(up){await up.evaluate(e=>e.scrollIntoView({block:"start"}));await new Promise(r=>setTimeout(r,150));await up.screenshot({path:join(out,"what-would-move-sable.png")});console.log("what-would-move-sable.png");}
await b.close();
