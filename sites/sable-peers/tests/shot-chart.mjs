// Live capture of the chart section with the real proxies: prints the summary, the figures and
// the events, checks for page errors, and saves desktop and phone screenshots.
//   node shot-chart.mjs [base-url]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url));
const base=process.argv[2]||"https://sable.primecircle.cloud/";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
for(const [w,h] of [[1320,900],[390,844]]){
  const p=await b.newPage(); await p.setViewport({width:w,height:h,deviceScaleFactor:w>1000?2:1});
  p.on("pageerror",e=>errs.push(w+": "+e.message));
  const hosts=new Set(); p.on("request",r=>{try{hosts.add(new URL(r.url()).host)}catch(e){}});
  await p.goto(base+"#chart",{waitUntil:"load"});
  await p.waitForFunction(()=>!/reading the pool/.test(document.getElementById("chart-sum").textContent),{timeout:15000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,800));
  const sum=await p.$eval("#chart-sum",e=>e.textContent.replace(/\s+/g," ").trim());
  const facts=await p.$$eval("#chart-facts .rfact .v",l=>l.map(x=>x.textContent.trim()));
  const events=await p.$$eval("#chart-events li",l=>l.map(x=>x.textContent.replace(/\s+/g," ").trim()));
  ok(/Last close \$0\.\d+ at 20\d\d-\d\d-\d\d \d\d:\d\d UTC/.test(sum),w+": summary from live candles: "+sum);
  ok(facts.length===6,w+": six figures: "+facts.join(" | "));
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),w+": no horizontal overflow");
  const own=new URL(base).host; const foreign=[...hosts].filter(x=>x!==own);
  ok(foreign.length===0,w+": the page contacted only its own host: "+[...hosts].join(", "));
  await p.evaluate(()=>document.getElementById("chart").scrollIntoView()); await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:join(here,"shots",`chart-live-${w}.png`)});
  console.log(w+": "+sum); if(w>1000){console.log("figures:",facts.join(" | "));console.log("events (hour, 7d):",events.join(" || "));
    // day candles over 7 days must carry the same events, the first day of the window included
    await p.click('#chart button[data-tf="day"]'); await p.click('#chart button[data-range="7d"]'); await new Promise(r=>setTimeout(r,1500));
    const evDay=await p.$$eval("#chart-events li",l=>l.map(x=>x.textContent.replace(/\s+/g," ").trim()));
    const sumDay=await p.$eval("#chart-sum",e=>e.textContent.replace(/\s+/g," ").trim());
    console.log("day 7d:",sumDay); console.log("events (day, 7d):",evDay.join(" || "));
    ok(evDay.length>=events.length,w+": day 7d shows at least the events hour 7d shows ("+evDay.length+" vs "+events.length+")");
    await p.click('#chart button[data-tf="hour"]');}
  await p.close();
}
await b.close();
console.log("chart live fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
