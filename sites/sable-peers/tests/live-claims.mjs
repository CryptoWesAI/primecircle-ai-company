// Live capture: what the "Announced, then checked" panel says on sable.primecircle.cloud,
// and whether the record behind /ext/record carries the claims key yet.
//   node live-claims.mjs [screenshot.png]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const rec=await fetch("https://sable.primecircle.cloud/ext/record",{cache:"no-store"}).then(r=>r.json());
console.log("record generated_at:",rec.generated_at,"| claims:",Array.isArray(rec.claims)?rec.claims.map(c=>c.id+" "+c.state+" checks="+c.checks+" since="+c.state_since).join("; "):"(no key yet)");
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); await p.setViewport({width:1320,height:900});
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
await p.goto("https://sable.primecircle.cloud/#log",{waitUntil:"load"});
await p.waitForFunction(()=>!/reading the record/.test(document.getElementById("claim-mcp-gateway-live").textContent),{timeout:15000}).catch(()=>{});
for(const id of ["claim-sabl-live","claim-conf-live","claim-mcp-gateway-live"])console.log(id+":",await p.$eval("#"+id,e=>e.textContent.replace(/\s+/g," ").trim()));
console.log("rows:",await p.$$eval("#claims-list > li",l=>l.length),"| page errors:",errs.length?errs:"none");
if(process.argv[2]){await p.evaluate(()=>document.getElementById("claims").scrollIntoView());await new Promise(r=>setTimeout(r,300));await p.screenshot({path:process.argv[2]});}
await b.close();
