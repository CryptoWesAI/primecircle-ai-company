// Capture the "Every name on the list" section (Field topic) on desktop and phone, and check
// the basics: it shows inside the Field topic, 13 cards, no horizontal overflow, no page errors.
//   node shot-who.mjs [base-url]   (default: the local build via file://)
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url));
const base=process.argv[2]||pathToFileURL(join(here,"..","site","index.html")).href;
const b=await puppeteer.launch({executablePath:exe,headless:true});
const fails=[],errs=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
for(const [w,h] of [[1320,900],[390,844]]){
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  p.on("pageerror",e=>errs.push(w+": "+e.message));
  await p.goto(base+"#who",{waitUntil:"load"}); await new Promise(r=>setTimeout(r,1500));
  const m=await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:Math.round(r.top+scrollY),h:Math.round(r.height),shown:getComputedStyle(e).display!=="none"&&r.height>0};};
    return {field:q("#field"),who:q("#who"),token:q("#token"),cards:document.querySelectorAll("#who .who .card").length,items:document.querySelectorAll("#who-up li").length,
      names:[...document.querySelectorAll("#who .card h3 span[translate='no']")].length,cur:(document.getElementById("rail-cur")||{}).textContent,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,undef:document.body.textContent.includes("undefined")};});
  ok(m.field&&m.field.shown&&m.who&&m.who.shown,w+": #who opens with the Field topic: "+JSON.stringify({field:m.field,who:m.who}));
  ok(!(m.token&&m.token.shown),w+": the Token section stays hidden in compact mode");
  ok(m.cards===13&&m.names===13,w+": 13 cards with names marked translate=no ("+m.cards+", "+m.names+")");
  ok(m.items===7,w+": 7 items in what would move Sable ("+m.items+")");
  ok(!m.overflow,w+": no horizontal overflow");
  ok(!m.undef,w+": the page never says undefined");
  ok(String(m.cur).trim()==="The field",w+": the bar shows The field: "+m.cur);
  await p.evaluate(()=>document.getElementById("who").scrollIntoView());
  await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:join(here,"shots",`who-${w}.png`)});
  console.log(w+": cards "+m.cards+", who top "+(m.who&&m.who.top)+" h "+(m.who&&m.who.h));
  await p.close();
}
await b.close();
console.log("who fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
