import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=process.argv[2]; const tag=process.argv[3]||"local";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[];
function ok(c,m){if(!c)fails.push(m);}
const vis=async(p,id)=>p.evaluate(id=>{const e=document.getElementById(id);return !!e&&getComputedStyle(e).display!=="none";},id);
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const window_h=h=>h;
async function page(w,h){const p=await b.newPage();await p.setViewport({width:w,height:h});p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error"&&!(base.startsWith("file:")&&/sable-api|ERR_FAILED|ERR_FILE_NOT_FOUND|origin 'null'/.test(m.text())))errs.push(m.text())});return p;}
// desktop
let p=await page(1320,900);
await p.goto(base,{waitUntil:"load"}); await wait(2500);
ok(await p.evaluate(()=>document.body.classList.contains("compact")),"default mode compact");
ok(await vis(p,"hero")&&await p.$eval("#orr-topics",e=>getComputedStyle(e).display!=="none"),"hero and topic row visible");
ok(!(await vis(p,"door"))&&!(await vis(p,"field"))&&!(await vis(p,"updates")),"other sections hidden on home");
ok(await p.evaluate(()=>getComputedStyle(document.querySelector("section.always")).display!=="none"),"footer always visible");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow desktop home");
const topBox=await p.$eval("#orr-topics",e=>Math.round(e.getBoundingClientRect().bottom)); ok(topBox<=900,"topic row on the first screen at 1320x900 (bottom "+topBox+")");
await p.setViewport({width:1366,height:768}); await p.reload({waitUntil:"load"}); await wait(1200);
const topBox2=await p.$eval("#orr-topics",e=>Math.round(e.getBoundingClientRect().bottom)); ok(topBox2<=768,"topic row on the first screen of a 768px laptop (bottom "+topBox2+")");
const fill=await p.evaluate(()=>{const h=document.getElementById("hero").getBoundingClientRect();const st=document.getElementById("orr-stage").getBoundingClientRect();return {heroBottom:Math.round(h.bottom),stageH:Math.round(st.height),vh:innerHeight}});
ok(Math.abs(fill.heroBottom-fill.vh)<=4&&fill.stageH>=380,"overview fills the first screen at 1366x768 (hero bottom "+fill.heroBottom+" of "+fill.vh+", map "+fill.stageH+"px tall)");
await p.setViewport({width:1320,height:900}); await p.reload({waitUntil:"load"}); await wait(1500);
await p.screenshot({path:`shots/${tag}-shell-home.png`});
// open door via tile
await p.click('#orr-topics button[data-topic="door"]'); await wait(500);
ok(await vis(p,"door")&&!(await vis(p,"home"))&&!(await vis(p,"hero")),"door shown alone");
ok(await p.evaluate(()=>document.querySelector('#rail a[data-topic="door"]').getAttribute("aria-current")==="page"),"rail current=door");
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("back")).display!=="none"),"back link visible");
ok(await p.evaluate(()=>document.activeElement&&document.activeElement.tagName==="H2"),"focus moved to h2");
await p.click("#send"); await wait(3800); await p.waitForSelector("#verify",{timeout:8000}); await p.click("#verify"); await wait(600);
ok(/valid/.test(await p.$eval("#vres",e=>e.textContent)),"door works inside shell");
await p.screenshot({path:`shots/${tag}-shell-door.png`});
// log topic via rail
await p.click('#rail a[data-topic="log"]'); await wait(400);
ok(await vis(p,"updates")&&await vis(p,"record")&&!(await vis(p,"door")),"log topic shows updates+record");
// full mode
await p.click("#mode-full"); await wait(400);
ok(await p.evaluate(()=>document.body.classList.contains("full")),"full mode set");
ok(await vis(p,"door")&&await vis(p,"field")&&await vis(p,"token")&&!(await vis(p,"home")),"full shows all, hides tiles");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow desktop full");
await p.reload({waitUntil:"load"}); await wait(800);
ok(await p.evaluate(()=>document.body.classList.contains("full")),"mode persisted after reload");
await p.click("#mode-compact"); await wait(300);
ok(await p.evaluate(()=>document.body.classList.contains("compact")),"back to compact");
// button sound
ok(await p.evaluate(()=>!!window.SABLE_SOUND&&window.SABLE_SOUND.enabled()===true),"sound on by default");
ok(await p.evaluate(()=>document.getElementById("sound-btn").getAttribute("aria-pressed")==="true"),"sound toggle shows on");
const sndSupported=await p.evaluate(()=>window.SABLE_SOUND.supported()); console.log("web audio in this browser:",sndSupported);
const played0=await p.evaluate(()=>window.SABLE_SOUND.played());
await p.click('#rail a[data-topic="explained"]'); await wait(300);
ok(!sndSupported||await p.evaluate(b=>window.SABLE_SOUND.played()>b,played0),"a click plays a tick");
await p.click("#sound-btn"); await wait(200);
ok(await p.evaluate(()=>window.SABLE_SOUND.enabled()===false&&document.getElementById("sound-btn").getAttribute("aria-pressed")==="false"),"toggle turns sound off");
const played1=await p.evaluate(()=>window.SABLE_SOUND.played());
await p.click('#rail a[data-topic="token"]'); await wait(300);
ok(await p.evaluate(b=>window.SABLE_SOUND.played()===b,played1),"no tick while off");
await p.reload({waitUntil:"load"}); await wait(800);
ok(await p.evaluate(()=>window.SABLE_SOUND.enabled()===false),"sound preference persists");
await p.evaluate(()=>window.SABLE_SOUND.set(true));
// direct hash load
await p.goto(base+"#check",{waitUntil:"load"}); await wait(2500);
ok(await vis(p,"check")&&!(await vis(p,"home")),"direct #check opens verify");
await p.click("#test-btn"); await p.click("#verify-btn"); await p.waitForFunction(()=>/valid|Could not/.test(document.getElementById("vout").textContent),{timeout:30000});
ok(/✓ signature valid/.test(await p.$eval("#vout",e=>e.textContent)),"verifier works inside shell");
const tv=await p.$eval("#t-verify",e=>e.textContent); const tt=await p.$eval("#t-token",e=>e.textContent); console.log("tiles:",tv,"|",tt);
// the guide
await p.goto(base,{waitUntil:"load"}); await wait(1500);
await p.waitForFunction(()=>document.querySelectorAll("#rfacts .rfact").length===4,{timeout:15000}).catch(()=>{});
ok(await p.evaluate(()=>document.querySelectorAll("#rfacts .rfact").length===4),"reliability facts rendered");
ok(await p.evaluate(()=>document.querySelectorAll("#rgrid .rc").length>=24&&document.querySelectorAll("#rgrid .rc.ok,#rgrid .rc.warn,#rgrid .rc.off").length>=1),"reliability grid has checks");
console.log("reliability:",await p.evaluate(()=>[...document.querySelectorAll("#rfacts .v")].map(e=>e.textContent).join(" | ")));
if(!base.startsWith("file:")){
  await p.waitForFunction(()=>/\d/.test(document.getElementById("ring-n").textContent)&&/\d/.test(document.getElementById("ring-burned").textContent),{timeout:15000}).catch(()=>{});
  ok(/^\d{1,3}(,\d{3})+$/.test(await p.$eval("#ring-n",e=>e.textContent)),"the ring reads the supply from the chain: "+await p.$eval("#ring-n",e=>e.textContent));
  ok(/none|yes/.test(await p.$eval("#ring-mint",e=>e.textContent)),"the ring reads the mint authority: "+await p.$eval("#ring-mint",e=>e.textContent));
  ok(/\$/.test(await p.$eval("#ring-mcap",e=>e.textContent)),"the ring reads the market cap: "+await p.$eval("#ring-mcap",e=>e.textContent));
  console.log("ring:",await p.$eval("#ring-n",e=>e.textContent),"|",await p.$eval("#ring-burned",e=>e.textContent),"burned |",await p.$eval("#ring-mcap-s",e=>e.textContent.slice(0,80)));
  await p.waitForFunction(()=>!/reading the listing/.test(document.querySelector("#supply-table tbody").textContent),{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>document.querySelectorAll("#supply-table tbody tr").length>=2),"supply listing shows Sable's machines: "+(await p.$eval("#supply-table tbody",e=>e.textContent.replace(/\s+/g," ").slice(0,120))));
  ok(/traffic: \d+/.test(await p.$eval("#supply-third",e=>e.textContent)),"third-party count is a number: "+await p.$eval("#supply-third",e=>e.textContent));
  // the app: a service worker, a manifest with icons, the bell, a push key from the board
  await p.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>!!r),{timeout:15000}).catch(()=>{});
  ok(await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>!!r&&r.scope.endsWith("/"))),"service worker registered at the root");
  const man=await p.evaluate(()=>fetch("/manifest.webmanifest").then(r=>r.ok?r.json():null).catch(()=>null)); ok(!!man&&man.name==="Sable Observatory"&&man.icons.length>=3&&man.display==="standalone","manifest answers with icons: "+JSON.stringify(man&&{name:man.name,icons:man.icons.length}));
  ok(await p.evaluate(async()=>{for(const u of ["/icons/icon-192.png","/icons/icon-512.png","/icons/maskable-512.png","/icons/badge-96.png"]){const r=await fetch(u);if(!r.ok||!/image\/png/.test(r.headers.get("content-type")||""))return false;}return true;}),"icons served as png");
  ok(await vis(p,"bell"),"the bell shows where push is supported");
  const pk=await p.evaluate(()=>fetch("/api/game/push/key").then(r=>r.json()).catch(()=>null)); ok(!!pk&&typeof pk.key==="string"&&pk.key.length>40,"the board hands out a push key");
}
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("guide-btn")).display!=="none"),"guide button visible");
ok(await p.evaluate(()=>document.getElementById("guide-panel").hidden),"guide panel hidden by default");
await p.click("#guide-btn"); await wait(300);
ok(await p.evaluate(()=>!document.getElementById("guide-panel").hidden),"guide panel opens");
ok(await p.evaluate(()=>document.querySelectorAll("#guide-topics button").length===10),"guide lists ten topics");
await p.click("#guide-start");
await p.waitForFunction(()=>/Welcome to the Sable Observatory/.test(document.getElementById("guide-cap").textContent),{timeout:12000}).catch(()=>{});
ok(/Welcome to the Sable Observatory/.test(await p.$eval("#guide-cap",e=>e.textContent)),"tour captions first step");
ok(await p.evaluate(()=>!document.getElementById("guide-stop").hidden),"stop button shown during tour");
await p.click("#guide-stop"); await wait(200);
await p.click('#guide-topics button[data-go="token"]'); await wait(600);
ok(await vis(p,"token")&&!(await vis(p,"home")),"guide opens token alone");
ok(/Where the token sits/.test(await p.$eval("#guide-cap",e=>e.textContent)),"guide captions the token orientation");
await p.screenshot({path:`shots/${tag}-shell-guide.png`});
await p.keyboard.press("Escape"); await wait(200);
ok(await p.evaluate(()=>document.getElementById("guide-panel").hidden),"escape closes guide");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow with guide");
await p.close();
// mobile
p=await page(390,844);
await p.goto(base,{waitUntil:"load"}); await wait(2500);
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow mobile home");
await p.screenshot({path:`shots/${tag}-shell-mob-home.png`});
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("rail")).display==="none"),"mobile menu closed by default");
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("rail-toggle")).display!=="none"),"mobile toggle visible");
const headerFits=()=>p.evaluate(()=>{const t=document.querySelector(".top").getBoundingClientRect();const r=id=>document.getElementById(id).getBoundingClientRect();const b=r("sound-btn"),bl=r("bell");const ipr={width:0,right:0};const br=document.querySelector(".top .brand").getBoundingClientRect();const inDrawer=!!document.querySelector(".rail-mode .mode");const m=document.querySelector(".mode").getBoundingClientRect();return b.width>=28&&b.right<=t.right-8&&bl.right<=t.right-8&&(ipr.width===0||ipr.right<=t.right-8)&&(inDrawer||(m.right<=t.right-8&&(m.left>br.right||m.top>=br.bottom)))&&(b.left>br.right||b.top>=br.bottom);});
ok(await headerFits(),"mode switch and sound toggle fit the phone header at 390");
for(const w of [360,320]){await p.setViewport({width:w,height:844});await p.reload({waitUntil:"load"});await wait(600);
  ok(await headerFits(),"header controls fit at "+w);
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow at "+w);
  await p.screenshot({path:`shots/${tag}-shell-mob-${w}.png`});}
await p.setViewport({width:390,height:844}); await p.reload({waitUntil:"load"}); await wait(800);
await p.click("#rail-toggle"); await wait(300);
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("rail")).display!=="none"),"menu opens");
ok(await p.evaluate(()=>[...document.querySelectorAll('#rail a')].filter(a=>a.getBoundingClientRect().height>0).length===10),"all ten topics visible in menu");
await p.screenshot({path:`shots/${tag}-shell-mob-menu.png`});
await p.click('#rail a[data-topic="field"]'); await wait(500);
ok(await vis(p,"field")&&!(await vis(p,"home")),"mobile menu opens field");
ok(await p.evaluate(()=>getComputedStyle(document.getElementById("rail")).display==="none"),"menu closes after choosing");
ok((await p.$eval("#rail-cur",e=>e.textContent.trim()))==="The field","bar shows current topic");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow mobile field");
await p.screenshot({path:`shots/${tag}-shell-mob-field.png`});
await p.close(); await b.close();
console.log(tag,"fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
