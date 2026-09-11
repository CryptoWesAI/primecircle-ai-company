// Screenshots the listening room at desktop and phone width, for a look at the
// album row and the track cards with their covers.
//
//   node shot-listening.mjs http://127.0.0.1:8792/ local      (static-server.mjs first)
//   node shot-listening.mjs https://sable.primecircle.cloud/ live
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=(process.argv[2]||"http://127.0.0.1:8792/").replace(/\/?$/,"/"); const tag=process.argv[3]||"local";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage();
for(const [w,h,name] of [[1320,1400,"desktop"],[390,1500,"phone"]]){
  await p.setViewport({width:w,height:h});
  await p.goto(base+"#listening",{waitUntil:"load"});
  await new Promise(r=>setTimeout(r,1800));
  await p.screenshot({path:`shots/${tag}-listening-${name}.png`});
  console.log("shot",`shots/${tag}-listening-${name}.png`);
}
await b.close();
