// Screenshot one panel at desktop and phone width, for a look before deploying.
//   node shot-panel.mjs <url> <hash-topic> <css-selector> <name>
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const [base,topic,sel,name]=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:exe,headless:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
  for(const [w,h,tag] of [[1320,900,"desktop"],[390,844,"phone"]]){
    const p=await b.newPage(); await p.setViewport({width:w,height:h,deviceScaleFactor:1});
    await p.goto(base+"#"+topic,{waitUntil:"load"});
    await p.waitForFunction(s=>{const e=document.querySelector(s);return e&&!/reading/.test(e.textContent);},{timeout:15000},sel).catch(()=>{});
    await wait(800);
    const el=await p.$(sel); await el.scrollIntoView();
    await el.screenshot({path:`shots/${name}-${tag}.png`});
    console.log(tag, JSON.stringify(await el.boundingBox()), (await p.$eval(sel,e=>e.textContent)).replace(/\s+/g," ").slice(0,900));
    await p.close();
  }
}finally{ await b.close(); }
