// The chart section (#chart, inside the Token topic): candles, the watcher's readings, the
// record's events, the figures row, the summary and the crosshair, all from fixtures served
// by this test so it runs offline. Cases: everything present with a recorded burn; no burn;
// the candle source failing while the figures still fill.
//   node chart-test.mjs [port]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url)), root=join(here,"..","site");
const port=Number(process.argv[2]||8797);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const srv=createServer(async(req,res)=>{
  const p=decodeURIComponent(new URL(req.url,"http://x").pathname);
  const file=normalize(join(root,p.endsWith("/")?p+"index.html":p));
  if(!file.startsWith(root)){res.writeHead(403);return res.end();}
  try{const data=await readFile(file);res.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream","Cache-Control":"no-store"});res.end(data);}
  catch{res.writeHead(404,{"Content-Type":"text/plain"});res.end("not found");}
});
await new Promise(r=>srv.listen(port,"127.0.0.1",r));
const base=`http://127.0.0.1:${port}/`;

// fixtures: 200 hour candles ending at a fixed time, 16 day candles, a slow drift with one spike
const END=Date.parse("2026-09-09T15:00:00Z")/1000;
// candles sit on their grid like the real ones: days at 00:00 UTC, hours at :00, 5-minute candles at :00/:05/...
function series(n,step){const out=[];let p=0.0005;const end=Math.floor(END/step)*step;for(let i=n-1;i>=0;i--){const t=end-i*step;const drift=Math.sin(i/9)*0.00004+(i===40?0.00012:0);const o=p,c=Math.max(0.0002,p+drift*(i%3===0?-1:1));const h=Math.max(o,c)*1.02,l=Math.min(o,c)*0.98;out.push([t,o,h,l,c,1500+((i*37)%900)]);p=c;}return out.reverse();}
const HOUR={data:{attributes:{ohlcv_list:series(200,3600)}}}, DAY={data:{attributes:{ohlcv_list:series(16,86400)}}}, MINUTE={data:{attributes:{ohlcv_list:series(400,300)}}};
// the same hour series with the last close a tenth higher: what a refresh should pick up
const HOUR2=JSON.parse(JSON.stringify(HOUR)); { const l=HOUR2.data.attributes.ohlcv_list[0]; l[4]=l[4]*1.1; l[2]=Math.max(l[2],l[4]); }
const SABL={pairs:[{chainId:"solana",dexId:"pumpswap",pairAddress:"7Y5pool",priceUsd:"0.0006021",marketCap:577046,fdv:577046,liquidity:{usd:75983.9},volume:{h24:41230.5},priceChange:{h24:4.2},pairCreatedAt:1787396790000,url:"https://dexscreener.com/solana/7Y5pool"}]};
const ledgerRows=[];for(let i=0;i<40;i++){const t=new Date((END-3600*(i*4))*1000).toISOString().replace(/\.\d{3}Z$/,"Z");ledgerRows.unshift(JSON.stringify({t,status:"degraded",conf_verified:false,token:{price_usd:0.00055+Math.sin(i/5)*0.00005,mcap:530000,liq_usd:70000}}));}
const LEDGER=ledgerRows.join("\n")+"\n";
const REC=(fall)=>({generated_at:"2026-09-09T15:00:00Z",cover:"v2.0, August 2026",entries:[],last_check:{t:"2026-09-09T14:52:27Z",status:"degraded",conf_verified:false,conf_failures:8300},
  sabl_supply:{decimals:6,latest:{t:"2026-09-09T14:52:27Z",amount:"958374438918883",ui_amount:958374438.918883,slot:445400000},baseline:{t:"2026-09-08T08:41:02Z",amount:"958374438918883",ui_amount:958374438.918883},changes:fall?1:0,falls:fall?1:0,
    last_fall:fall?{t:"2026-09-08T20:17:03Z",prev_amount:"958374438918883",amount:"958373204351883",delta:"-1234567000",ui_delta:-1234.567}:null,total_fallen:{amount:fall?"1234567000":"0",ui_amount:fall?1234.567:0},ledger:"status/supply.jsonl"},
  claims:[{id:"mcp-gateway",title:"MCP Gateway",announced:"2026-09-08",state:"absent",checks:3,first_checked:"2026-09-08T14:52:27Z",latest:{t:"2026-09-09T14:52:27Z",state:"absent",http:{"POST /v1/mcp-servers":404},control:401},changes:[]}]});
const cases=[
  {name:"all layers, a recorded burn",rec:REC(true),ohlcv:200,burn:true},
  {name:"no burn yet",rec:REC(false),ohlcv:200,burn:false},
  {name:"candles unreadable",rec:REC(false),ohlcv:500,burn:false},
];
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
const clean=s=>s.replace(/\s+/g," ").trim();
for(const c of cases){
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.setRequestInterception(true);
  const cors={"Access-Control-Allow-Origin":"*"};
  let hourCalls=0;
  p.on("request",r=>{const u=r.url();
    if(/ohlcv-hour|\/ohlcv\/hour/.test(u)){hourCalls++;return r.respond(c.ohlcv===200?{status:200,headers:cors,contentType:"application/json",body:JSON.stringify(hourCalls>1?HOUR2:HOUR)}:{status:500,headers:cors,contentType:"text/plain",body:"down"});}
    if(/ohlcv-minute|\/ohlcv\/minute/.test(u))return r.respond(c.ohlcv===200?{status:200,headers:cors,contentType:"application/json",body:JSON.stringify(MINUTE)}:{status:500,headers:cors,contentType:"text/plain",body:"down"});
    if(/ohlcv-day|\/ohlcv\/day/.test(u))return r.respond(c.ohlcv===200?{status:200,headers:cors,contentType:"application/json",body:JSON.stringify(DAY)}:{status:500,headers:cors,contentType:"text/plain",body:"down"});
    if(/\/ext\/sabl|dexscreener\.com/.test(u))return r.respond({status:200,headers:cors,contentType:"application/json",body:JSON.stringify(SABL)});
    if(/\/ext\/ledger|status\/log\.jsonl/.test(u))return r.respond({status:200,headers:cors,contentType:"text/plain",body:LEDGER});
    if(/\/ext\/record|record\.json/.test(u))return r.respond({status:200,headers:cors,contentType:"application/json",body:JSON.stringify(c.rec)});
    if(!u.startsWith(base))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"blocked in this test"});
    if(/\/ext\/|\/sable-api\/|\/api\//.test(u))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"no proxy in this test"});
    r.continue();});
  p.on("pageerror",e=>errs.push(c.name+": "+e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/404|500|Failed to load resource|sable-api|\/ext\/|\/api\/|blocked in this test|CORS policy/.test(m.text()))errs.push(c.name+": "+m.text())});
  // each case starts from the default choice: the page remembers the last one in localStorage
  await p.evaluateOnNewDocument((nowMs)=>{try{localStorage.removeItem("sable-chart")}catch(e){} window.__SABLE_NOW=nowMs;},END*1000);
  await p.goto(base+"#chart",{waitUntil:"load"});
  await p.waitForFunction(()=>!/reading the pool/.test(document.getElementById("chart-sum").textContent),{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,500));
  const shown=await p.evaluate(()=>{const e=document.getElementById("chart");const t=document.getElementById("token");return {chart:getComputedStyle(e).display!=="none"&&e.getBoundingClientRect().height>0,token:getComputedStyle(t).display!=="none"};});
  ok(shown.chart&&shown.token,c.name+": #chart opens inside the Token topic: "+JSON.stringify(shown));
  const sum=clean(await p.$eval("#chart-sum",e=>e.textContent));
  const facts=await p.$$eval("#chart-facts .rfact",l=>l.map(x=>x.textContent.replace(/\s+/g," ").trim()));
  ok(facts.length===6&&/price.*\$0\.0006021/i.test(facts[0])&&/liquidity.*\$75\.98K|\$76\.0K|\$75,984/i.test(facts.join(" "))&&/read \d\d:\d\d UTC/.test(facts.join(" ")),c.name+": six figures with a read time: "+facts.join(" | ").slice(0,300));
  if(c.ohlcv===200){
    ok(/Last close \$0\.\d+ at 2026-09-09 15:00 UTC/.test(sum),c.name+": summary names the last close and time: "+sum);
    ok(/7 days: high \$0\.\d+ \(\d+ Sep \d\d:\d\d\), low \$0\.\d+ \(\d+ Sep \d\d:\d\d\)/.test(sum),c.name+": summary names high and low with times: "+sum);
    ok(/169 candles/.test(sum),c.name+": 7 days back from now on hour candles is 169 candles, the overlapping first one included: "+sum);
    ok(/watcher: \d+ readings/.test(sum),c.name+": summary counts the watcher's readings: "+sum);
    // pixels in the candle colours
    const px=await p.evaluate(()=>{const cv=document.getElementById("chart-cv"),x=cv.getContext("2d"),d=x.getImageData(0,0,cv.width,cv.height).data;let up=0,down=0,cyan=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(r>120&&r<160&&g>190&&b>160&&b<200)up++;if(r>230&&g>100&&g<140&&b<110)down++;if(r>100&&r<125&&g>210&&b>240)cyan++;}return {up,down,cyan,w:cv.width,h:cv.height};});
    ok(px.up>200&&px.down>200,c.name+": candles drawn in both colours: "+JSON.stringify(px));
    ok(px.cyan>20,c.name+": the watcher's dotted line is drawn: "+JSON.stringify(px));
    // crosshair on pointer move
    const box=await p.$eval("#chart-cv",e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
    await p.mouse.move(box.x+box.w*0.6,box.y+box.h*0.4); await new Promise(r=>setTimeout(r,150));
    const tip=await p.$eval("#chart-tip",e=>({hidden:e.hidden,text:e.textContent.replace(/\s+/g," ").trim()}));
    ok(!tip.hidden&&/O \$0\.\d+ H \$0\.\d+ L \$0\.\d+ C \$0\.\d+/.test(tip.text)&&/UTC/.test(tip.text)&&/cap \$/.test(tip.text),c.name+": crosshair tooltip with OHLC, time and cap: "+tip.text);
    // live: a refresh fetches the series again and the summary follows the new close; the stamp says when
    const stamp0=clean(await p.$eval("#chart-stamp",e=>e.textContent));
    ok(/^live · updated \d\d:\d\d:\d\d UTC$/.test(stamp0),c.name+": stamp after the first read: "+stamp0);
    await p.evaluate(()=>window.SABLE_CHART.refreshNow()); await new Promise(r=>setTimeout(r,400));
    const sum2=clean(await p.$eval("#chart-sum",e=>e.textContent));
    const close1=(sum.match(/Last close (\$0\.\d+)/)||[])[1], close2=(sum2.match(/Last close (\$0\.\d+)/)||[])[1];
    ok(close1&&close2&&close1!==close2&&hourCalls>=2,c.name+": a refresh picked up the new close ("+close1+" -> "+close2+", "+hourCalls+" fetches)");
    ok((await p.evaluate(()=>window.SABLE_CHART.refreshMs()))===60000,c.name+": hour candles refresh every 60 s");
    // 5-minute candles: 24 h range is 288 of them, and the refresh cadence tightens to 30 s
    await p.click('#chart button[data-tf="minute"]'); await p.click('#chart button[data-range="24h"]'); await new Promise(r=>setTimeout(r,400));
    const sumM=clean(await p.$eval("#chart-sum",e=>e.textContent));
    ok(/289 candles of five minutes/.test(sumM)&&/24 hours: high/.test(sumM),c.name+": 24 hours of 5-minute candles: "+sumM);
    ok((await p.evaluate(()=>window.SABLE_CHART.refreshMs()))===30000,c.name+": 5-minute candles refresh every 30 s");
    // controls: day candles over 7 days, then all range
    await p.click('#chart button[data-tf="day"]'); await p.click('#chart button[data-range="7d"]'); await new Promise(r=>setTimeout(r,300));
    const sumDay=clean(await p.$eval("#chart-sum",e=>e.textContent));
    ok(/\b8 candles\b/.test(sumDay),c.name+": 7 days of day candles is 8 candles, today's partial one included: "+sumDay);
    // the founder's case: on day candles over 7 days, the 2 Sep event must still be on the chart
    const evDay=await p.$$eval("#chart-events li",l=>l.map(x=>x.textContent.replace(/\s+/g," ").trim()));
    ok(evDay.some(t=>/2 Sep 2026.*Whitepaper/.test(t))&&evDay.some(t=>/4 Sep 2026/.test(t))&&evDay.some(t=>/8 Sep 2026.*MCP/.test(t)),c.name+": day 7d lists the 2, 4 and 8 Sep events: "+evDay.join(" | ").slice(0,240));
    ok(evDay.length===(c.burn?4:3),c.name+": day 7d event count "+evDay.length+" (wanted "+(c.burn?4:3)+")");
    await p.click('#chart button[data-range="all"]'); await new Promise(r=>setTimeout(r,300));
    const sumAll=clean(await p.$eval("#chart-sum",e=>e.textContent));
    ok(/16 candles/.test(sumAll)&&/all: high/.test(sumAll),c.name+": all range shows every day candle: "+sumAll);
    const saved=await p.evaluate(()=>localStorage.getItem("sable-chart"));
    ok(/"tf":"day"/.test(saved||"")&&/"range":"all"/.test(saved||""),c.name+": choice remembered: "+saved);
    // events legend
    const ev=await p.$$eval("#chart-events li",l=>l.map(x=>x.textContent.replace(/\s+/g," ").trim()));
    ok(ev.some(t=>/25 Aug 2026.*pool/i.test(t))&&ev.some(t=>/8 Sep 2026.*MCP Gateway/i.test(t)),c.name+": static events listed: "+ev.join(" | ").slice(0,200));
    ok(ev.some(t=>/supply fell|burn/i.test(t))===c.burn,c.name+": burn marker "+(c.burn?"present":"absent")+": "+ev.join(" | ").slice(0,200));
  } else {
    ok(/candles not readable from here/.test(sum),c.name+": summary says candles are not readable: "+sum);
  }
  const all=clean(await p.$eval("#chart",e=>e.textContent));
  ok(!/undefined|NaN/.test(all),c.name+": no undefined or NaN in the section");
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),c.name+": no horizontal overflow");
  await p.evaluate(()=>document.getElementById("chart").scrollIntoView()); await new Promise(r=>setTimeout(r,200));
  await p.screenshot({path:join(here,"shots",`chart-${c.name.replace(/\W+/g,"-")}.png`)});
  await p.setViewport({width:390,height:844}); await new Promise(r=>setTimeout(r,400));
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),c.name+": no horizontal overflow at 390");
  const cvw=await p.$eval("#chart-cv",e=>e.getBoundingClientRect().width); ok(cvw>300&&cvw<=390,c.name+": canvas fits the phone: "+cvw);
  if(c.name==="all layers, a recorded burn"){await p.evaluate(()=>document.getElementById("chart").scrollIntoView());await p.screenshot({path:join(here,"shots","chart-phone.png")});}
  console.log(c.name+":",sum.slice(0,140));
  await p.close();
}
await b.close(); srv.close();
console.log("chart fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
