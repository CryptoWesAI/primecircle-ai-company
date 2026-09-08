// The Log topic after the shortening: the page log shows exactly its newest three entries
// and scrolls inside its box, the whitepaper watch sits beside it, the reliability record
// and the announcements start within two screens, and the reliability facts carry the
// "last check" figure. Serves the local build over HTTP and answers the ledger request
// with a fixture whose newest line is 16 minutes old, so the figure is deterministic.
//   node log-box-test.mjs [port]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,"..","site");
const port=Number(process.argv[2]||8796);
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

const now=Date.now();
const iso=ms=>new Date(ms).toISOString().replace(/\.\d{3}Z$/,"Z");
const row=(ms,fails)=>({t:iso(ms),status:"degraded",uptime_24h:100,uptime_30d:100,conf_verified:false,conf_error:"measurement_mismatch",conf_failures:fails,conf_backends:"0/1",sandbox_ok:true,nodes:["gateway:online","tee:tee:degraded","node-4c9141b63c8d:online"],third_party_nodes:1,signer:"0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812",scheme:"secp256k1-eip191",models:25});
// 4 days of checks, about 7 a day, the newest 16 minutes ago; 5 of them inside the last 24 hours
const rows=[];for(let d=4;d>=1;d--)for(let k=0;k<7;k++)rows.push(row(now-d*86400000+k*3*3600000,1000+rows.length*80));
rows.push(row(now-20*3600000,5000),row(now-15*3600000,5300),row(now-9*3600000,5700),row(now-4*3600000,6000),row(now-16*60000,6300));
const ledger=rows.map(r=>JSON.stringify(r)).join("\n")+"\n";

const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
const clean=s=>s.replace(/\s+/g," ").trim();
async function open(w,h){
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  await p.setRequestInterception(true);
  const cors={"Access-Control-Allow-Origin":"*"};
  p.on("request",r=>{const u=r.url();
    if(/\/ext\/ledger(\?|$)|\/status\/log\.jsonl(\?|$)/.test(u))return r.respond({status:200,headers:cors,contentType:"text/plain",body:ledger});
    if(!u.startsWith(base))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"blocked in this test"});
    if(/\/ext\/|\/sable-api\/|\/api\//.test(u))return r.respond({status:404,headers:cors,contentType:"text/plain",body:"no proxy in this test"});
    r.continue();});
  p.on("pageerror",e=>errs.push(w+": "+e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/404|Failed to load resource|sable-api|\/ext\/|\/api\/|blocked in this test|CORS policy/.test(m.text()))errs.push(w+": "+m.text())});
  await p.goto(base+"#log",{waitUntil:"load"});
  await p.waitForFunction(()=>document.querySelectorAll("#rfacts .rfact").length>=4,{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,400));
  return p;
}
for(const [w,h] of [[1320,900],[390,844]]){
  const p=await open(w,h);
  const m=await p.evaluate(()=>{
    const ul=document.getElementById("upd-list"),li=[...ul.children],r=ul.getBoundingClientRect();
    const tops=li.map(x=>Math.round(x.getBoundingClientRect().top-r.top));
    const q=s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();return {top:Math.round(b.top+scrollY),left:Math.round(b.left),height:Math.round(b.height)};};
    return {n:li.length,maxH:ul.style.maxHeight,box:Math.round(r.height),top4:tops[3],scrollable:ul.scrollHeight>ul.clientHeight+2,
      more:document.getElementById("upd-more").textContent,moreHidden:document.getElementById("upd-more").hidden,
      upd:q("#page-updates"),wp:q("#wp"),ledger:q("#ledger"),claims:q("#claims"),record:q("#record"),
      facts:[...document.querySelectorAll("#rfacts .rfact")].map(x=>x.textContent.replace(/\s+/g," ").trim()),
      doc:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
  });
  ok(m.n>3,w+": the log has more than three entries ("+m.n+")");
  ok(m.maxH===m.top4+"px",w+": box height is the top of the fourth entry: maxHeight="+m.maxH+" top4="+m.top4);
  ok(m.box===m.top4,w+": rendered box height "+m.box+" equals "+m.top4);
  ok(m.scrollable,w+": the box scrolls");
  ok(!m.moreHidden&&new RegExp("^The newest 3 of "+m.n+" entries\\. Scroll inside the box for the "+(m.n-3)+" earlier ones\\.$").test(clean(m.more)),w+": caption: "+m.more);
  if(w>=1320){ok(m.wp.top===m.upd.top&&m.wp.left>m.upd.left,w+": the whitepaper watch sits beside the log (upd "+JSON.stringify(m.upd)+" wp "+JSON.stringify(m.wp)+")");
    ok(m.ledger.top<2*h,w+": the reliability record starts within two screens ("+m.ledger.top+")");
    ok(m.claims.top<3.2*h,w+": the announcements start within about three screens ("+m.claims.top+")");}
  else ok(m.wp.top>m.upd.top&&m.wp.top<m.ledger.top,w+": phone order log, whitepaper, reliability");
  ok(m.facts.length===4,w+": four reliability facts ("+m.facts.length+")");
  const f4=m.facts[3]||"";
  ok(/^last check\s?16 min ago/.test(f4),w+": last check reads 16 min ago: "+f4.slice(0,60));
  const in24=rows.filter(r=>now-Date.parse(r.t)<=86400000).length,perDay=(rows.length/Math.max(1,(now-Date.parse(rows[0].t))/86400000)).toFixed(1);
  ok(new RegExp(in24+" checks in the last 24 hours, "+perDay.replace(".","\\.")+" a day on average since ").test(f4),w+": cadence figures (wanted "+in24+" in 24 h, "+perDay+" a day): "+f4.slice(0,200));
  ok(!m.overflow,w+": no horizontal overflow");
  ok(!(await p.evaluate(()=>document.body.textContent.includes("undefined"))),w+": the page never says undefined");
  // the box really scrolls: scroll it and see the fourth entry come into view
  const seen=await p.evaluate(()=>{const ul=document.getElementById("upd-list");ul.scrollTop=ul.scrollHeight;const r=ul.getBoundingClientRect(),li=ul.children[ul.children.length-1].getBoundingClientRect();return li.bottom<=r.bottom+2&&li.top>=r.top-2;});
  ok(seen,w+": after scrolling the box its last entry is inside the box");
  console.log(w+": entries "+m.n+", box "+m.box+"px, ledger top "+m.ledger.top+", claims top "+m.claims.top+", doc "+m.doc+" | "+f4.slice(0,80));
  await p.evaluate(()=>{document.getElementById("upd-list").scrollTop=0;scrollTo(0,0)});
  await p.screenshot({path:join(here,"shots",`log-box-${w}.png`)});
  await p.close();
}
await b.close(); srv.close();
console.log("log-box fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
