// The burn-watch line on the Token topic, fed from record.json (through /ext/record
// on the live site, from the raw GitHub URL elsewhere). Serves the local build over
// HTTP, answers the record request itself with three fixtures, and blocks every
// other outside read so the test is offline and fast: no supply key (the line must
// stay hidden, nothing says "undefined"), a baseline with no fall, a recorded fall.
//   node burn-watch-test.mjs [port]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const root=join(dirname(fileURLToPath(import.meta.url)),"..","site");
const port=Number(process.argv[2]||8794);
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

const BASE={generated_at:"2026-09-08T09:17:20Z",cover:"v2.0, August 2026",entries:[{label:"2026-09-04",cover:"v2.0, August 2026",bytes:631953,sha256:"72514487",snapshot:"snapshots/whitepaper-2026-09-04.pdf",added:16,removed:7,diff:"diffs/2026-09-04.diff"},{label:"2026-08-29",cover:"v2.0, August 2026",bytes:801537,sha256:"eff47594",snapshot:"snapshots/whitepaper-2026-08-29.pdf",first:true}],last_check:{t:"2026-09-08T09:17:19Z",status:"degraded",conf_verified:false}};
const SUP={mint:"DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump",rpc:"https://api.mainnet-beta.solana.com",method:"getTokenSupply",decimals:6,
  latest:{t:"2026-09-08T09:17:19Z",amount:"958374438918883",ui_amount:958374438.918883,slot:445300123},
  baseline:{t:"2026-09-08T08:41:02Z",amount:"958374438918883",ui_amount:958374438.918883,slot:445294305},
  change_since_baseline:{amount:"0",ui_amount:0},changes:0,last_change:null,falls:0,last_fall:null,total_fallen:{amount:"0",ui_amount:0},ledger:"status/supply.jsonl"};
const FALL={t:"2026-09-10T14:17:03Z",prev_amount:"958374438918883",amount:"958373204351883",delta:"-1234567000",ui_delta:-1234.567,slot:445400000};
const cases=[
  {name:"no supply key",rec:BASE,hidden:true},
  {name:"baseline, no fall",rec:{...BASE,sabl_supply:SUP},hidden:false,scen:/^Not yet: watched hourly since 2026-09-08, no fall seen\. Burn watch\.$/,must:[/958,374,438\.918883 SABL/,/2026-09-08 09:17 UTC/,/slot 445,300,123/,/No burn seen yet/,/since the watch began on 2026-09-08/,/status\/supply\.jsonl/]},
  {name:"a fall",rec:{...BASE,sabl_supply:{...SUP,latest:{t:"2026-09-10T15:17:19Z",amount:"958373204351883",ui_amount:958373204.351883,slot:445410000},change_since_baseline:{amount:"-1234567000",ui_amount:-1234.567},changes:1,last_change:FALL,falls:1,last_fall:FALL,total_fallen:{amount:"1234567000",ui_amount:1234.567}}},hidden:false,
   must:[/958,373,204\.351883 SABL/,/Supply fell by 1,234\.567 SABL on 2026-09-10 14:17 UTC/,/from 958,374,438\.918883 to 958,373,204\.351883/,/1 fall since the watch began on 2026-09-08/,/1,234\.567 SABL in total/],mustNot:[/No burn seen yet/],scen:/^Yes: the supply fell by 1,234\.567 SABL on 2026-09-10 14:17 UTC\. Burn watch\.$/},
];
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
let recordHits=0;
for(const c of cases){
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.setRequestInterception(true);
  const cors={"Access-Control-Allow-Origin":"*"};   // the record is read cross-origin from the raw GitHub URL when the page is not on its live host
  p.on("request",r=>{const u=r.url();
    if(/\/ext\/record(\?|$)|\/record\.json(\?|$)/.test(u)){recordHits++;return r.respond({status:200,headers:cors,contentType:"application/json",body:JSON.stringify(c.rec)});}
    if(!u.startsWith(base))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"blocked in this test"});
    if(/\/ext\/|\/sable-api\/|\/api\//.test(u))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"no proxy in this test"});
    r.continue();});
  p.on("pageerror",e=>errs.push(c.name+": "+e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/404|Failed to load resource|sable-api|\/ext\/|\/api\/|blocked in this test|CORS policy/.test(m.text()))errs.push(c.name+": "+m.text())});
  await p.goto(base+"#token",{waitUntil:"load"});
  await p.waitForFunction(()=>/\d|no change|not readable/.test(document.getElementById("wp-last").textContent),{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,400));
  const hidden=await p.$eval("#burn-watch",e=>e.hidden);
  const text=await p.$eval("#burn-watch",e=>e.textContent.replace(/\s+/g," ").trim());
  const shown=await p.$eval("#burn-watch",e=>getComputedStyle(e).display!=="none");
  ok(hidden===c.hidden&&shown===!c.hidden,c.name+": hidden="+hidden+" shown="+shown+" (wanted hidden="+c.hidden+")");
  ok(!/undefined|NaN|null/.test(text),c.name+": no undefined/NaN/null in the line: "+text);
  for(const re of c.must||[])ok(re.test(text),c.name+": expected "+re+" in: "+text);
  for(const re of c.mustNot||[])ok(!re.test(text),c.name+": did not expect "+re+" in: "+text);
  ok(!(await p.evaluate(()=>document.body.textContent.includes("undefined"))),c.name+": the page never says undefined");
  const href=await p.$eval("#burn-watch a",e=>e.getAttribute("href")).catch(()=>null);
  if(!c.hidden)ok(href==="https://github.com/CryptoWesAI/sable-whitepaper-watch/blob/main/status/supply.jsonl",c.name+": source link "+href);
  // the Scenarios condition "burn visible on-chain" carries the same answer
  const sHidden=await p.$eval("#scn-burn-live",e=>e.hidden), sText=await p.$eval("#scn-burn-live",e=>e.textContent.replace(/\s+/g," ").trim());
  ok(sHidden===c.hidden,c.name+": scenario indicator hidden="+sHidden+" (wanted "+c.hidden+")");
  ok(!/undefined|NaN|null/.test(sText),c.name+": no undefined/NaN/null in the scenario indicator: "+sText);
  if(c.scen)ok(c.scen.test(sText),c.name+": scenario indicator expected "+c.scen+" in: "+sText);
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),c.name+": no horizontal overflow");
  console.log(c.name+":",hidden?"(hidden)":text);
  await p.screenshot({path:`shots/burn-watch-${c.name.replace(/\W+/g,"-")}.png`});
  await p.close();
}
ok(recordHits>=cases.length,"the page asked for the record in every case: "+recordHits);
await b.close(); srv.close();
console.log("burn-watch fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
