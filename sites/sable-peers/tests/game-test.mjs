// Gatekeeper in the browser: the Play topic, a real-time run driven by the
// autopilot, a submitted score, the board, and the phone layout.
// Local: starts the board on 8791 with an in-memory database (the page's
// non-live board URL). Live: uses the site's own /api/game.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
let base=process.argv[2]; const tag=process.argv[3]||"local"; const live=!base.startsWith("file:");
const NAME="Test Bot "+tag;
let child=null,srv=null;
if(!live){
  // ES modules cannot load from file:// pages, so the built site is served over local HTTP
  child=spawn(process.execPath,[join(here,"..","leaderboard","server.js")],{env:{...process.env,PORT:"8791",BOARD_SECRET:"test-secret-test-secret-test-secret-1234",BOARD_DB:":memory:",BOARD_ALLOW_ORIGIN:"*",BOARD_CONTEST:new Date().toISOString().slice(0,10)+"/"+new Date().toISOString().slice(0,10)},stdio:["ignore","pipe","inherit"]});
  await new Promise(r=>child.stdout.once("data",r));
  srv=spawn(process.execPath,[join(here,"static-server.mjs"),"8792"],{stdio:["ignore","pipe","inherit"]});
  await new Promise(r=>srv.stdout.once("data",r));
  base="http://127.0.0.1:8792/index.html";
}
const b=await puppeteer.launch({executablePath:exe,headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function page(w,h){const p=await b.newPage();await p.setViewport({width:w,height:h});p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error"&&!(!live&&/sable-api|\/ext\/|ERR_FAILED|ERR_FILE_NOT_FOUND|origin 'null'|404/.test(m.text())))errs.push(m.text())});return p;}
const text=(p,sel)=>p.$eval(sel,e=>e.textContent.trim());
const vis=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&getComputedStyle(e).display!=="none";},sel);
try{
  let p=await page(1320,900);
  await p.goto(base+"#play",{waitUntil:"load"}); await wait(1500);
  ok(await vis(p,"#play")&&!(await vis(p,"#hero")),"Play topic opens alone from the hash");
  ok(await p.evaluate(()=>document.querySelector('#rail a[data-topic="play"]').getAttribute("aria-current")==="page"),"rail marks Play");
  ok(await vis(p,"#game-start")&&await vis(p,"#game-play"),"start card with Play button");
  await p.waitForFunction(()=>!/reading the board/.test(document.querySelector("#gb-table tbody").textContent),{timeout:10000}).catch(()=>{});
  const boardText=await text(p,"#gb-table tbody"); ok(!/did not answer|reading the board/.test(boardText),"board answers: "+boardText.slice(0,60));
  // play, with the name given up front
  await p.type("#gs-name",NAME); await p.type("#gs-handle","@0PTIMUS_ONE");
  await p.click("#game-play");
  await p.waitForFunction(()=>window.SABLE_GAME_RUN&&window.SABLE_GAME_RUN.running(),{timeout:30000}).catch(async()=>{throw new Error("game did not start: "+await text(p,"#game-fine"));});
  ok(await vis(p,"#game-hud")&&!(await vis(p,"#game-start")),"HUD shown, start card hidden");
  ok((await text(p,"#g-who"))==="as "+NAME,"HUD shows who is playing: "+await text(p,"#g-who"));
  ok(!!(await p.evaluate(()=>window.SABLE_GAME_RUN.token())),"run has a board token: seed "+await p.evaluate(()=>window.SABLE_GAME_RUN.seed()));
  await wait(1200);
  const t1=await p.evaluate(()=>window.SABLE_GAME_RUN.summary().ticks); ok(t1>40,"game advances in real time: "+t1+" ticks");
  ok(await p.evaluate(()=>{const c=document.getElementById("game-cv");return c.width>0&&c.height>0&&!!c.getContext("webgl2")||!!document.getElementById("game-cv").getContext("webgl");}),"WebGL canvas alive");
  if(!live){
    // local build: the test hooks exist and the patient player plays the rest of a short run, then leaves the door
    ok(await p.evaluate(()=>typeof window.SABLE_GAME_RUN.autoplay==="function"),"test hooks present on a local build");
    await p.evaluate(()=>window.SABLE_GAME_RUN.autoplay(true));
    await wait(21000);
    const mid=await p.evaluate(()=>window.SABLE_GAME_RUN.summary());
    ok(mid.refused>0&&mid.leaked===0&&mid.score>0,"the patient player refuses and never leaks: "+JSON.stringify({refused:mid.refused,leaked:mid.leaked,score:mid.score,wave:mid.wave}));
    ok(mid.refused<5||/×[2-5]/.test(await text(p,"#g-mult")),"refusals built the multiplier: "+await text(p,"#g-mult")+" after "+mid.refused+" refusals");
    await p.evaluate(()=>window.SABLE_GAME_RUN.end()); await wait(1000);
    ok(await vis(p,"#game-end")&&!(await vis(p,"#game-hud")),"end card after leaving the door");
    ok(/left the door/.test(await text(p,"#ge-why")),"end card says why: "+await text(p,"#ge-why"));
  }else{
    // live: a real run exposes no hook that could drive it; the door is left alone until the budget runs out
    ok(await p.evaluate(()=>!window.SABLE_GAME_RUN.autoplay&&!window.SABLE_GAME_RUN.core),"no autoplay or core hook on the live page");
    await p.waitForFunction(()=>!window.SABLE_GAME_RUN.running(),{timeout:26000}).catch(()=>{});
    if(await p.evaluate(()=>window.SABLE_GAME_RUN.running()))await p.evaluate(()=>window.SABLE_GAME_RUN.end());
    await wait(1000);
    ok(await vis(p,"#game-end")&&!(await vis(p,"#game-hud")),"end card after the run");
    ok(/Budget exhausted|left the door/.test(await text(p,"#ge-why")),"end card says why: "+await text(p,"#ge-why"));
  }
  ok(/broken seal/.test(await text(p,"#ge-refused"))&&/leaked/.test(await text(p,"#ge-leaked")),"end card leads with refusals");
  if(!live){
    await p.waitForFunction(()=>/On the board|Not accepted|not allowed|already/.test(document.getElementById("ge-result").textContent),{timeout:10000});
    const res=await text(p,"#ge-result"); ok(/On the board as .*: #\d+ today/.test(res),"score went up by itself with a rank: "+res);
    ok(/Card code \d+-[A-Z0-9]{8}\./.test(res),"the result names the card's check code: "+res);
    // the card was drawn after the verdict, with the code on it
    const cardInfo=await p.evaluate(()=>{const c=document.getElementById("ge-card");const x=c.getContext("2d");const d=x.getImageData(700,60,440,60).data;let lit=0;for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]>300)lit++;return {w:c.width,h:c.height,litTopRight:lit};});
    ok(cardInfo.w===1200&&cardInfo.h===675&&cardInfo.litTopRight>400,"the card carries the stamp top right: "+JSON.stringify(cardInfo));
    ok(!(await vis(p,"#ge-form")),"no form to fill after a named run");
  }else{ await wait(1500); console.log("live end note:",(await text(p,"#ge-note")).slice(0,100),"|",(await text(p,"#ge-result")).slice(0,100)); }
  console.log("contest strip:",(await vis(p,"#contest"))?(await text(p,"#contest")).slice(0,120):"hidden");
  if(!live){
    // the local board runs a contest that covers today: strip, countdown, tab, and the replayed run with a handle counts
    ok(await vis(p,"#contest")&&/ends in/.test(await text(p,"#contest")),"contest strip with countdown: "+(await text(p,"#contest")).slice(0,90));
    ok(await vis(p,'.gb-tabs button[data-period="contest"]'),"contest tab shown");
    await p.click('.gb-tabs button[data-period="contest"]'); await wait(800);
    // the patient player taps at one distance, so the referee flags this run: on the board, out of the contest
    ok(/Flagged/.test(await text(p,"#ge-result")),"end card says the referee flagged the patient run: "+(await text(p,"#ge-result")).slice(0,120));
    ok(!(await text(p,"#gb-table tbody")).includes(NAME),"flagged run stays out of the contest tab: "+(await text(p,"#gb-table tbody")).slice(0,80));
    await p.click('.gb-tabs button[data-period="today"]'); await wait(500);
    // today's card: drawn from the board and the page, with a prefilled post
    await p.click("#contest a[data-daily]"); await p.waitForFunction(()=>window.__daily,{timeout:15000}).catch(()=>{});
    ok(await vis(p,"#daily")&&!!(await p.evaluate(()=>window.__daily)),"today's card panel opens: "+JSON.stringify(await p.evaluate(()=>window.__daily&&{day:window.__daily.dayN,total:window.__daily.total,rows:window.__daily.rows.length,ends:window.__daily.ends})));
    ok(await p.evaluate(()=>{const c=document.getElementById("daily-cv");const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let lit=0;for(let i=0;i<d.length;i+=4*97)if(d[i]+d[i+1]+d[i+2]>90)lit++;return lit>200;}),"today's card is drawn");
    ok(await p.$eval("#daily-x",a=>/contest.*day 1 of 1/.test(decodeURIComponent(a.href))),"post on X is prefilled for the card: "+await p.$eval("#daily-x",a=>decodeURIComponent(a.href).slice(0,120)));
    await p.click("#daily-close"); await wait(200); ok(!(await vis(p,"#daily")),"card panel closes");
  }
  // the share card
  await wait(600);
  ok(await vis(p,"#ge-share"),"share card shown after a real run");
  ok(await p.evaluate(()=>{const c=document.getElementById("ge-card");const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let lit=0;for(let i=0;i<d.length;i+=4*97)if(d[i]+d[i+1]+d[i+2]>120)lit++;return c.width===1200&&c.height===675&&lit>300;}),"card is drawn");
  ok(await p.$eval("#ge-x",a=>/x\.com\/intent\/post\?text=.*Gatekeeper.*Sablenetwork/.test(decodeURIComponent(a.href))&&/ refused/.test(decodeURIComponent(a.href))),"post on X is prefilled with the run");
  ok(await p.$eval("#ge-x",a=>decodeURIComponent(a.href).includes(String(window.SABLE_GAME_RUN.summary().score))),"post text carries the score");
  const dl=await p.evaluate(()=>new Promise(r=>{const c=document.getElementById("ge-card");c.toBlob(b=>r(b?b.size:0),"image/png");})); ok(dl>20000,"card exports as a PNG of "+dl+" bytes");
  await wait(800);
  if(!live){
    ok((await text(p,"#gb-table tbody")).includes(NAME)&&(await text(p,"#gb-table tbody")).includes("@0PTIMUS_ONE"),"board shows the new row with the handle");
    ok(await p.$eval("#gb-table tbody tr.me",e=>!!e),"the player's row is highlighted");
    ok((await p.evaluate(()=>window.SABLE_GAME_RUN.submit("Someone Else","").then(j=>j.error)))==="nothing to submit","a run cannot be submitted twice");
  }
  // play again -> start card; demo mode runs without a token
  ok(await p.evaluate(()=>{const s=document.getElementById("game-stage").getBoundingClientRect();const d=document.getElementById("game-again").getBoundingClientRect();return d.width>0&&d.top>=s.top-1&&d.bottom<=s.bottom+1;}),"Play again sits inside the stage under the share card");
  await p.$eval("#game-again",b=>b.click()); await wait(300); ok(await vis(p,"#game-start"),"Play again returns to the start card");
  ok((await p.$eval("#gs-name",e=>e.value))===NAME,"the start card remembers the name");
  ok(await p.evaluate(()=>{const s=document.getElementById("game-stage").getBoundingClientRect();const d=document.getElementById("game-demo").getBoundingClientRect();return d.width>0&&d.top>=s.top-1&&d.bottom<=s.bottom+1;}),"demo button sits inside the stage after Play again");
  await p.$eval("#game-demo",b=>b.click()); await p.waitForFunction(()=>window.SABLE_GAME_RUN&&window.SABLE_GAME_RUN.running(),{timeout:15000}); await wait(1500);
  ok(!(await p.evaluate(()=>window.SABLE_GAME_RUN.token())),"demo run has no token");
  await p.evaluate(()=>window.SABLE_GAME_RUN.end()); await wait(1000);
  ok(/Demo run/.test(await text(p,"#ge-note"))&&!(await vis(p,"#ge-form")),"demo run is not submittable");
  ok(!(await vis(p,"#ge-share")),"no share card for a demo run");
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow desktop");
  await p.screenshot({path:`shots/${tag}-game-end.png`});
  // week and all tabs
  await p.click('.gb-tabs button[data-period="all"]'); await wait(800);
  if(!live)ok((await text(p,"#gb-table tbody")).includes(NAME),"all-time tab lists the row");
  await p.close();
  // phone
  p=await page(390,844);
  await p.goto(base+"#play",{waitUntil:"load"}); await wait(1200);
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow phone");
  const st=await p.$eval("#game-stage",e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}); ok(st[0]>=300&&st[1]>=st[0],"phone stage is tall: "+st.join("x"));
  ok(await p.$eval("#game-play",e=>e.getBoundingClientRect().height>=40&&e.getBoundingClientRect().right<=390),"Play button fits the phone");
  await p.screenshot({path:`shots/${tag}-game-phone.png`});
  await p.click("#game-play"); await p.waitForFunction(()=>window.SABLE_GAME_RUN&&window.SABLE_GAME_RUN.running(),{timeout:30000}); await wait(1500);
  ok(await p.$eval("#g-attest",e=>{const r=e.getBoundingClientRect();return r.height>=40&&r.right<=390}),"Attest button is thumb sized on the phone");
  await p.screenshot({path:`shots/${tag}-game-phone-live.png`});
  await p.close();
}finally{ await b.close(); if(child)child.kill(); if(srv)srv.kill(); }
console.log(tag,"fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
