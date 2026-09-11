// The listening room's track pages: each /tracks/<slug>.html renders without
// page errors, has one player with a source that is served, marks at least as
// many verbatim lines as the track lists sources, shows the stamp and the
// disclosure, and does not overflow at phone width. Also checks index.json.
//
//   node tracks-test.mjs http://127.0.0.1:8792/ local      (static-server.mjs first)
//   node tracks-test.mjs https://sable.primecircle.cloud/ live
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=(process.argv[2]||"http://127.0.0.1:8792/").replace(/\/?$/,"/"); const tag=process.argv[3]||"local";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const fails=[],errs=[];
function ok(c,m){if(!c)fails.push(m);}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const p=await b.newPage(); p.on("pageerror",e=>errs.push(e.message));
const idx=await (await fetch(base+"tracks/index.json")).json();
ok(Array.isArray(idx)&&idx.length===6,"index.json lists six tracks");
ok(idx.every(t=>/^[a-z0-9-]+$/.test(t.slug)&&/^\d\d-[a-z0-9-]+\.mp3$/.test(t.audio)&&t.planet&&t.hook),"every index row has slug, audio, planet, hook");
ok(idx.map(t=>t.planet).join(",")==="01,03,05,07,08,13","planets 01, 03, 05, 07, 08, 13 in order");
for(const t of idx){
  await p.setViewport({width:1320,height:900}); await p.goto(base+"tracks/"+t.slug+".html",{waitUntil:"load"}); await wait(300);
  const r=await p.evaluate(()=>({
    h1:document.querySelector("h1")?.textContent.trim(),
    audio:document.querySelectorAll("audio").length, src:document.querySelector("audio")?.getAttribute("src"),
    quotes:document.querySelectorAll(".lyrics .q").length, glue:document.querySelectorAll(".lyrics .g").length, tags:document.querySelectorAll(".lyrics .tag").length,
    sources:document.querySelectorAll("ol.sources li").length,
    stamp:/snapshot 4 Sep 2026/.test(document.body.textContent), holds:/The author holds SABL/.test(document.body.textContent),
    suno:!!document.querySelector('a[href^="https://suno.com/"]'), back:!!document.querySelector('a.back[href="/#listening"]')}));
  ok(r.h1===t.title,t.slug+": title "+r.h1);
  ok(r.audio===1&&r.src==="/tracks/"+t.audio,t.slug+": one player with the right source");
  ok(r.quotes>=r.sources&&r.sources>=7,t.slug+": quotes marked ("+r.quotes+") at least as many as sources ("+r.sources+")");
  ok(r.glue>0&&r.tags>=5,t.slug+": glue lines and section tags present");
  ok(r.stamp&&r.holds&&r.suno&&r.back,t.slug+": stamp, disclosure, Suno link and back link");
  const head=await fetch(base+"tracks/"+t.audio,{method:"HEAD"}); ok(head.ok,t.slug+": MP3 served ("+head.status+")");
  await p.setViewport({width:390,height:844}); await p.reload({waitUntil:"load"}); await wait(300);
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),t.slug+": no overflow at 390");
  if(t.track===1){await p.screenshot({path:`shots/${tag}-track-1-mobile.png`,fullPage:false});await p.setViewport({width:1320,height:900});await p.reload({waitUntil:"load"});await wait(300);await p.screenshot({path:`shots/${tag}-track-1.png`});}
}
await p.close(); await b.close();
console.log(tag,"tracks fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
