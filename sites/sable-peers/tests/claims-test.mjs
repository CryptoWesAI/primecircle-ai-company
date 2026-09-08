// The "Announced, then checked" panel in the Log, fed from record.json (through
// /ext/record on the live site, from the raw GitHub URL elsewhere). Serves the local
// build over HTTP, answers the record request itself with fixtures, and blocks every
// other outside read so the test is offline and fast: no claims key (the MCP row says
// so, nothing says "undefined"), an absent route, a reachable route plus a claim the
// HTML does not know (it gets its own row), and the SABL and confidential rows in
// both of their states.
//   node claims-test.mjs [port]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const root=join(dirname(fileURLToPath(import.meta.url)),"..","site");
const port=Number(process.argv[2]||8795);
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
const GH="https://github.com/CryptoWesAI/sable-whitepaper-watch/blob/main/";

const LAST={t:"2026-09-08T15:17:11Z",status:"degraded",uptime_24h:100,uptime_30d:100,conf_verified:false,conf_error:"measurement_mismatch",conf_failures:7791,conf_backends:"0/1",sandbox_ok:true,signer:"0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812",scheme:"secp256k1-eip191",models:25};
const SUP={mint:"DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump",rpc:"https://api.mainnet-beta.solana.com",method:"getTokenSupply",decimals:6,
  latest:{t:"2026-09-08T15:17:11Z",amount:"958374438918883",ui_amount:958374438.918883,slot:445337946},
  baseline:{t:"2026-09-08T08:41:02Z",amount:"958374438918883",ui_amount:958374438.918883,slot:445294305},
  change_since_baseline:{amount:"0",ui_amount:0},changes:0,last_change:null,falls:0,last_fall:null,total_fallen:{amount:"0",ui_amount:0},ledger:"status/supply.jsonl"};
const FALL={t:"2026-09-10T14:17:03Z",prev_amount:"958374438918883",amount:"958373204351883",delta:"-1234567000",ui_delta:-1234.567,slot:445400000};
const BASE={generated_at:"2026-09-08T15:17:12Z",cover:"v2.0, August 2026",entries:[{label:"2026-09-04",cover:"v2.0, August 2026",bytes:631953,sha256:"72514487",snapshot:"snapshots/whitepaper-2026-09-04.pdf",added:16,removed:7,diff:"diffs/2026-09-04.diff"},{label:"2026-08-29",cover:"v2.0, August 2026",bytes:801537,sha256:"eff47594",snapshot:"snapshots/whitepaper-2026-08-29.pdf",first:true}],last_check:LAST,sabl_supply:SUP};
const MCP={id:"mcp-gateway",title:"MCP Gateway",announced:"2026-09-08",announcement:"MCP Gateway is live on Sable. MCP tools, with budgets and policies around them. Every call is metered and receipted. Shipped.",source:"Sable on X, 8 September 2026",docs:"https://www.buildsable.com/docs/mcp-gateway",docs_say:"Register a third-party MCP server and get a proxy URL.",
  probes:["POST /v1/mcp-servers","POST /v1/mcp/servers/mcp_probe"],control:"GET /v1/mandates",first_checked:"2026-09-08T15:17:11Z",checks:1,
  latest:{t:"2026-09-08T15:17:11Z",state:"absent",http:{"POST /v1/mcp-servers":404,"POST /v1/mcp/servers/mcp_probe":404},control:401},state:"absent",state_since:"2026-09-08T15:17:11Z",reachable_since:null,changes:[],ledger:"status/claims.jsonl"};
const MCP_UP={...MCP,checks:43,latest:{t:"2026-09-10T09:17:03Z",state:"present",http:{"POST /v1/mcp-servers":401,"POST /v1/mcp/servers/mcp_probe":401},control:401},state:"present",state_since:"2026-09-10T09:17:03Z",reachable_since:"2026-09-10T09:17:03Z",
  changes:[{t:"2026-09-10T09:17:03Z",from:"absent",to:"present",http:{"POST /v1/mcp-servers":401,"POST /v1/mcp/servers/mcp_probe":401}}]};
const EXTRA={id:"agent-post",title:"Agent Post",announced:"2026-09-09",announcement:"Agent Post is live.",source:"Sable on X, 9 September 2026",docs:"https://www.buildsable.com/docs/agent-post",docs_say:"An agent can publish a post under its passport.",
  probes:["POST /v1/agent-post"],control:"GET /v1/mandates",first_checked:"2026-09-09T10:17:00Z",checks:2,latest:{t:"2026-09-10T09:17:03Z",state:"absent",http:{"POST /v1/agent-post":404},control:401},state:"absent",state_since:"2026-09-09T10:17:00Z",reachable_since:null,changes:[],ledger:"status/claims.jsonl"};
const UNREACH={...MCP,latest:{t:"2026-09-08T16:17:11Z",state:"unreachable",http:{"POST /v1/mcp-servers":"unreachable: URLError","POST /v1/mcp/servers/mcp_probe":"unreachable: URLError"},control:"unreachable: URLError"},state:"unreachable",state_since:null};

const cases=[
  {name:"no claims key",rec:BASE,
   mcp:/^not in the record yet: the watcher adds it at its next hourly run\.$/,
   sabl:/^not yet: the supply has not fallen since the watch began on 2026-09-08, last read 2026-09-08 15:17 UTC\. Burn watch\.$/,
   conf:/^refusing: failing closed at the last check, 2026-09-08 15:17 UTC, 7,791 consecutive refusals \(measurement_mismatch\)\. Reliability record\.$/,
   extra:false},
  {name:"absent route",rec:{...BASE,claims:[MCP]},
   mcp:/^not reachable from outside: POST \/v1\/mcp-servers 404, POST \/v1\/mcp\/servers\/mcp_probe 404 while GET \/v1\/mandates 401 at 2026-09-08 15:17 UTC; asked hourly since 2026-09-08 15:17 UTC, 1 check, every HTTP answer 404\. Ledger\.$/,
   ledger:true,extra:false},
  {name:"reachable route, a fall, a verified backend, an unknown claim",
   rec:{...BASE,last_check:{...LAST,t:"2026-09-10T09:17:03Z",conf_verified:true,conf_error:null,conf_failures:0,conf_backends:"1/1"},
        sabl_supply:{...SUP,latest:{t:"2026-09-10T09:17:03Z",amount:"958373204351883",ui_amount:958373204.351883,slot:445410000},changes:1,last_change:FALL,falls:1,last_fall:FALL,total_fallen:{amount:"1234567000",ui_amount:1234.567}},
        claims:[MCP_UP,EXTRA]},
   mcp:/^reachable: POST \/v1\/mcp-servers 401, POST \/v1\/mcp\/servers\/mcp_probe 401 while GET \/v1\/mandates 401 since 2026-09-10 09:17 UTC\. A route that answers exists on the public gateway; whether the feature works needs a key\. Ledger\.$/,
   sabl:/^live on-chain: the supply fell by 1,234\.567 SABL on 2026-09-10 14:17 UTC\. Burn watch\.$/,
   conf:/^serving: a verified backend at the last check, 2026-09-10 09:17 UTC\. Reliability record\.$/,
   ledger:true,extra:/^2026-09-09\s?Agent Post\. Agent Post is live\. \(Sable on X, 9 September 2026\.\) An agent can publish a post under its passport\. Docs\. The public API's answer: not reachable from outside: POST \/v1\/agent-post 404 while GET \/v1\/mandates 401 at 2026-09-10 09:17 UTC; asked hourly since 2026-09-09 10:17 UTC, 2 checks, every HTTP answer 404\. Ledger\.$/},
  {name:"gateway unreachable",rec:{...BASE,claims:[UNREACH]},
   mcp:/^the gateway did not answer at the last check, 2026-09-08 16:17 UTC\. Ledger\.$/,ledger:true,extra:false},
];
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
let recordHits=0;
const clean=s=>s.replace(/\s+/g," ").replace(/[“”]/g,"").trim();
for(const c of cases){
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.setRequestInterception(true);
  const cors={"Access-Control-Allow-Origin":"*"};
  p.on("request",r=>{const u=r.url();
    if(/\/ext\/record(\?|$)|\/record\.json(\?|$)/.test(u)){recordHits++;return r.respond({status:200,headers:cors,contentType:"application/json",body:JSON.stringify(c.rec)});}
    if(!u.startsWith(base))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"blocked in this test"});
    if(/\/ext\/|\/sable-api\/|\/api\//.test(u))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"no proxy in this test"});
    r.continue();});
  p.on("pageerror",e=>errs.push(c.name+": "+e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/404|Failed to load resource|sable-api|\/ext\/|\/api\/|blocked in this test|CORS policy/.test(m.text()))errs.push(c.name+": "+m.text())});
  await p.goto(base+"#log",{waitUntil:"load"});
  await p.waitForFunction(()=>!/reading the record/.test(document.getElementById("claim-mcp-gateway-live").textContent),{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,300));
  const shown=await p.$eval("#claims",e=>getComputedStyle(e).display!=="none"&&e.getBoundingClientRect().height>0);
  ok(shown,c.name+": the panel is visible in the Log");
  const get=async id=>clean(await p.$eval("#"+id,e=>e.textContent));
  const mcp=await get("claim-mcp-gateway-live"),sabl=await get("claim-sabl-live"),conf=await get("claim-conf-live");
  ok(c.mcp.test(mcp),c.name+": MCP answer expected "+c.mcp+" in: "+mcp);
  if(c.sabl)ok(c.sabl.test(sabl),c.name+": SABL answer expected "+c.sabl+" in: "+sabl);
  if(c.conf)ok(c.conf.test(conf),c.name+": confidential answer expected "+c.conf+" in: "+conf);
  const all=await get("claims");
  ok(!/undefined|NaN|null|\[object/.test(all),c.name+": no undefined/NaN/null in the panel: "+all.slice(0,200));
  if(c.ledger){const href=await p.$eval("#claim-mcp-gateway-live a[href*='claims']",e=>e.getAttribute("href")).catch(()=>null);
    ok(href===GH+"status/claims.jsonl",c.name+": ledger link "+href);}
  const extra=await p.$("#claim-agent-post");
  if(c.extra){ok(!!extra,c.name+": the unknown claim got a row");if(extra){const t=clean(await p.$eval("#claim-agent-post",e=>e.textContent));ok(c.extra.test(t),c.name+": unknown claim row expected "+c.extra+" in: "+t);
    const d=await p.$eval("#claim-agent-post a[href*='buildsable']",e=>e.getAttribute("href")).catch(()=>null);ok(d==="https://www.buildsable.com/docs/agent-post",c.name+": docs link "+d);}}
  else ok(!extra,c.name+": no stray row");
  ok((await p.$$eval("#claims-list > li",l=>l.length))===(c.extra?4:3),c.name+": row count");
  // the guide's live figures carry the MCP answer once it is in the record
  const live=await p.evaluate(()=>{try{return (window.SABLE_GUIDE_API&&window.SABLE_GUIDE_API.liveNow)?window.SABLE_GUIDE_API.liveNow():null}catch(e){return "err:"+e.message}});
  if(typeof live==="string"&&!live.startsWith("err:"))ok(/MCP Gateway, announced live by Sable on 8 September; the public API's answer: /.test(live)===!/not in the record yet/.test(mcp)||/MCP Gateway/.test(live),c.name+": guide live figures: "+live.slice(0,160));
  ok(!(await p.evaluate(()=>document.body.textContent.includes("undefined"))),c.name+": the page never says undefined");
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),c.name+": no horizontal overflow");
  console.log(c.name+":",mcp);
  await p.screenshot({path:join(dirname(fileURLToPath(import.meta.url)),"shots",`claims-${c.name.replace(/\W+/g,"-")}.png`)});
  // phone width: the rows must not clip
  await p.setViewport({width:390,height:844});await new Promise(r=>setTimeout(r,200));
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),c.name+": no horizontal overflow at 390");
  await p.close();
}
ok(recordHits>=cases.length,"the page asked for the record in every case: "+recordHits);
await b.close(); srv.close();
console.log("claims fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
