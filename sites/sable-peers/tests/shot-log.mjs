// Full-length capture of the Log topic, live or local, plus the vertical position of each panel.
//   node shot-log.mjs [base-url] [out.png]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=process.argv[2]||"https://sable.primecircle.cloud/";
const out=process.argv[3]||"shots/log-full.png";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); await p.setViewport({width:1320,height:900});
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
await p.goto(base+"#log",{waitUntil:"load"});
await new Promise(r=>setTimeout(r,3500));
const pos=await p.evaluate(()=>{
  const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:Math.round(r.top+scrollY),height:Math.round(r.height)};};
  return {viewport:innerHeight,doc:document.documentElement.scrollHeight,
    updates:q('#updates .panel:first-child'),updatesItems:document.querySelectorAll('#updates .panel:first-child .corr li').length,
    rel:q('#rfacts'),rgrid:q('#rgrid'),ledger:q('#ledger-table'),wp:q('#wp'),claims:q('#claims'),record:q('#record'),
    rfacts:[...document.querySelectorAll('#rfacts .rfact')].map(x=>x.textContent.replace(/\s+/g,' ').trim()),
    ledgerRows:document.querySelectorAll('#ledger-table tbody tr').length,
    ledgerFirst:(document.querySelector('#ledger-table tbody tr')||{}).textContent,
    ledgerLast:([...document.querySelectorAll('#ledger-table tbody tr')].pop()||{}).textContent,
    recordItems:[...document.querySelectorAll('#record .corr li .d')].map(x=>x.textContent)};
});
console.log(JSON.stringify(pos,null,1));
await p.screenshot({path:out,fullPage:true});
console.log("errors:",errs.length?errs:"none","->",out);
await b.close();
