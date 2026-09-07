// The Orrery: data, drawing, selection, search, motion rules, phone layout.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=process.argv[2]; const tag=process.argv[3]||"local";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function page(w,h,reduce){const p=await b.newPage();await p.setViewport({width:w,height:h});if(reduce)await p.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"reduce"}]);
  p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error"&&!(base.startsWith("file:")&&/sable-api|ERR_FAILED|ERR_FILE_NOT_FOUND|origin 'null'/.test(m.text())))errs.push(m.text())});return p;}
const painted=p=>p.evaluate(()=>{const c=document.getElementById("orr");const x=c.getContext("2d");const d=x.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4*7)if(d[i]>0)n++;return n;});
const text=(p,sel)=>p.$eval(sel,e=>e.textContent.trim());
const vis=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&getComputedStyle(e).display!=="none";},sel);

// desktop
let p=await page(1320,900);
await p.goto(base,{waitUntil:"load"});
await p.waitForFunction(()=>window.SABLE_ORRERY&&window.SABLE_ORRERY.ready(),{timeout:15000}).catch(()=>{});
await wait(800);
const ready=await p.evaluate(()=>window.SABLE_ORRERY.ready());
ok(ready,"whitepaper.json loaded");
const secs=await p.evaluate(()=>window.SABLE_ORRERY.sections());
ok(secs.length===14,"fourteen sections (13 + appendix): "+secs.length);
const d=await p.evaluate(()=>window.SABLE_ORRERY.data());
ok(d&&d.sentence_count>200&&d.sections[0].sentences.length>5,"sentences present: "+(d&&d.sentence_count));
ok((await painted(p))>400,"canvas is painted");
ok(/sentences/.test(await text(p,"#orr-live")),"hud describes the record: "+await text(p,"#orr-live"));
ok(await vis(p,"#orr-intro")&&!(await vis(p,"#orr-panel")),"intro shown, panel hidden by default");
ok(/tap a planet/.test(await text(p,"#orr-title")),"first visit: control row invites a tap");
ok(await vis(p,"#orr-today")&&(await text(p,"#orr-today-q")).length>30,"today's sentence shown: "+(await text(p,"#orr-today-n")));
const today=await p.evaluate(()=>window.SABLE_ORRERY.today());
await p.click("#orr-today-go"); await wait(300);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===today.i&&!!(await p.$("#orr-panel li.picked")),"today's sentence opens its section with the sentence picked");
await p.click("#orr-pnext"); await wait(200);
ok(await p.evaluate(i=>window.SABLE_ORRERY.selected()===(i+1)%15||window.SABLE_ORRERY.selected()===-2&&i===13,today.i),"panel arrows move to the next section");
await p.click("#orr-close"); await wait(150);
// arrows
await p.click("#orr-next"); await wait(250);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===0,"next selects the first section");
ok((await text(p,"#orr-title"))===secs[0].title,"control row shows the title");
ok(await vis(p,"#orr-panel")&&!(await vis(p,"#orr-intro")),"panel replaces the intro");
ok((await text(p,"#orr-panel .orr-their"))===d.sections[0].sentences[0].t,"panel quotes the section's first sentence verbatim");
ok(/In plain words/.test(await text(p,"#orr-panel .orr-ours")),"our line is labelled as ours");
const shown=await p.$$eval("#orr-panel .orr-sents li:not([hidden])",es=>es.length); ok(shown===6,"six sentences shown before Show all: "+shown);
await p.click("#orr-more"); await wait(100);
ok(await p.$$eval("#orr-panel .orr-sents li[data-i]:not([hidden])",es=>es.length)===d.sections[0].sentences.length,"Show all reveals every sentence");
await p.click("#orr-prev"); await wait(200);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===-2,"prev from the first section reaches the sun");
ok(/Compute you can prove/.test(await text(p,"#orr-panel h2")),"sun panel");
// close and tap a planet on the canvas: section 06, the changed one
await p.click("#orr-close"); await wait(150);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===-1&&await vis(p,"#orr-intro"),"close returns to the intro");
const i06=secs.findIndex(s=>s.n==="06"); ok(i06>=0&&!!secs[i06].changed,"section 06 is marked changed");
await p.evaluate(()=>window.scrollTo(0,0)); await wait(200);
const rect=await p.$eval("#orr",e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top}});
const pp=await p.evaluate(i=>window.SABLE_ORRERY.pos(i),i06);
await p.mouse.click(rect.x+pp.x,rect.y+pp.y); await wait(250);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===i06,"tapping the planet on the canvas selects it");
ok(await p.$eval("#orr-cur",e=>e.classList.contains("changed")),"control row marks the changed section");
ok(/changed 4 Sep 2026/.test(await text(p,"#orr-panel .orr-meta")),"panel dates the change");
const newCount=await p.$$eval("#orr-panel .orr-sents li.new",es=>es.length); ok(newCount===secs[i06].added,"added sentences carry the date tag: "+newCount+" vs "+secs[i06].added);
ok(await p.$$eval("#orr-panel .orr-sents li.ghost",es=>es.length)>0,"removed sentences listed as ghosts");
ok(!(await p.$("#orr-panel .orr-warn")),"no stale-summary warning when the summary postdates the change");
ok(await p.$eval("#orr-panel .orr-links a[href$='.diff']",a=>/diffs\//.test(a.href)),"diff link present");
ok(await p.evaluate(()=>document.querySelector("#orr-panel .orr-sents").translate===false&&document.querySelector("#orr-panel .orr-ours").translate===true),"quotes fixed, our words translatable");
// the topic row and the outer ring
const chipsT=await p.$$eval("#orr-topics button[data-topic]",es=>es.map(e=>e.getAttribute("data-topic"))); ok(chipsT.length===9&&chipsT.includes("check")&&chipsT.includes("play"),"nine topic chips");
ok(await p.$$eval("#orr-topics button",es=>es.every(e=>e.getBoundingClientRect().height>=36)),"chips are thumb sized");
ok(!(await p.$("a.tile")),"the old tile grid is gone");
await p.hover('#orr-topics button[data-topic="check"]'); await wait(200);
ok(/Verify · checks sections 07, 08/.test(await text(p,"#orr-live")),"hovering a chip previews it in the status line: "+await text(p,"#orr-live"));
ok(await p.$eval('#orr-topics button[data-topic="check"]',e=>e.classList.contains("lit")),"hovered chip lights up");
ok(await p.$eval('#orr-topics button[data-topic="check"]',e=>["ok","warn"].includes(e.getAttribute("data-state"))&&e.title.length>3),"verify chip mirrors the gateway badge: "+await p.$eval('#orr-topics button[data-topic="check"]',e=>e.getAttribute("data-state")+" · "+e.title));
await p.mouse.move(2,2); await wait(150);
await p.evaluate(()=>window.scrollTo(0,0)); await wait(200); const rect2=await p.$eval("#orr",e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top}});
const mkDoor=await p.evaluate(()=>window.SABLE_ORRERY.marker("door")); await p.mouse.click(rect2.x+mkDoor.x,rect2.y+mkDoor.y); await wait(500);
ok(await vis(p,"#door")&&!(await vis(p,"#hero")),"tapping a square on the outer ring opens that page");
await p.click('#rail a[data-topic="home"]'); await wait(600);
await p.click('#orr-topics button[data-topic="token"]'); await wait(500);
ok(await vis(p,"#token")&&!(await vis(p,"#hero")),"a chip opens its page");
await p.click('#rail a[data-topic="home"]'); await wait(600);
// the guide knows the map
const i05=secs.findIndex(s=>s.n==="05");
await p.evaluate(()=>window.SABLE_GUIDE_API.interpret("open section five")); await wait(400);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected())===i05&&/Metering/.test(await text(p,"#guide-cap")),"guide: 'section five' opens section 05 and says its title: "+await text(p,"#guide-cap"));
await p.evaluate(()=>window.SABLE_GUIDE_API.interpret("search receipt")); await wait(500);
ok(/Searched the whitepaper for receipt/.test(await text(p,"#guide-cap"))&&(await p.$$("#orr-qres button")).length>0,"guide: 'search receipt' searches the map");
await p.evaluate(()=>window.SABLE_GUIDE_API.interpret("today's sentence")); await wait(400);
ok(await p.evaluate(()=>window.SABLE_ORRERY.selected()===window.SABLE_ORRERY.today().i),"guide: 'today's sentence' opens its section");
await p.evaluate(()=>window.speechSynthesis&&window.speechSynthesis.cancel());
await p.focus("#orr-q"); await p.keyboard.press("Escape"); await wait(200); await p.click("#orr-close").catch(()=>{}); await wait(200);
// search
await p.type("#orr-q","receipt"); await wait(500);
ok(/receipt/.test(await text(p,"#orr-qres"))&&/sentences in/.test(await text(p,"#orr-qres")),"search summarises hits: "+await text(p,"#orr-qres"));
const chips=await p.$$("#orr-qres button"); ok(chips.length>3,"search lists sections with hits");
await chips[0].click(); await wait(250);
ok(await p.$$eval("#orr-panel .orr-sents mark",es=>es.length)>0,"filtered panel highlights the word");
ok(!!(await p.$("#orr-unfilter")),"filtered panel offers every sentence");
await p.click("#orr-unfilter"); await wait(150);
ok(!(await p.$("#orr-unfilter")),"unfilter restores the full list");
await p.focus("#orr-q"); await p.keyboard.press("Escape"); await wait(300);
ok((await text(p,"#orr-qres"))==="","escape clears the search");
// motion stops off screen, resumes on screen
await p.evaluate(()=>window.SABLE_ORRERY.select(-1));
await p.click('#rail a[data-topic="explained"]'); await wait(700);
const f1=await p.evaluate(()=>window.SABLE_ORRERY.frames()); await wait(900);
const f2=await p.evaluate(()=>window.SABLE_ORRERY.frames());
ok(f2===f1,"no frames drawn while another topic is open ("+f1+" -> "+f2+")");
await p.click('#rail a[data-topic="home"]'); await wait(900);
const f3=await p.evaluate(()=>window.SABLE_ORRERY.frames());
ok(f3>f2,"frames resume when the overview returns");
ok((await painted(p))>400,"map repainted at full size after returning");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow desktop");
await p.reload({waitUntil:"load"}); await p.waitForFunction(()=>window.SABLE_ORRERY&&window.SABLE_ORRERY.ready(),{timeout:15000}).catch(()=>{}); await wait(400);
ok(/since your visit/.test(await text(p,"#orr-title")),"second visit: control row reports what is new: "+await text(p,"#orr-title"));
await p.screenshot({path:`shots/${tag}-orrery-desktop.png`});
await p.evaluate(()=>window.SABLE_ORRERY.select(4)); await wait(300);
await p.screenshot({path:`shots/${tag}-orrery-desktop-open.png`});
await p.close();

// reduced motion: still
p=await page(1320,900,true);
await p.goto(base,{waitUntil:"load"}); await wait(1500);
const a1=await p.evaluate(()=>window.SABLE_ORRERY.pos(0)); await wait(1200);
const a2=await p.evaluate(()=>window.SABLE_ORRERY.pos(0));
ok(a1.x===a2.x&&a1.y===a2.y,"reduced motion freezes the orbits");
ok((await painted(p))>400,"reduced motion still paints the map");
await p.close();

// phone
p=await page(390,844);
await p.goto(base,{waitUntil:"load"});
await p.waitForFunction(()=>window.SABLE_ORRERY&&window.SABLE_ORRERY.ready(),{timeout:15000}).catch(()=>{});
await wait(800);
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow phone");
const cw=await p.$eval("#orr",e=>e.getBoundingClientRect().width); ok(cw>=300&&cw<=390,"canvas fills the phone width: "+Math.round(cw));
ok(await p.$eval("#orr-next",e=>e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().width>=44),"arrow buttons are thumb sized");
ok(await p.$eval("#orr-q",e=>e.getBoundingClientRect().height>=44),"search field is thumb sized");
await p.screenshot({path:`shots/${tag}-orrery-phone.png`});
await p.click("#orr-next"); await wait(600);
ok(await vis(p,"#orr-panel"),"phone: panel opens");
const pr=await p.$eval("#orr-panel",e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,right:r.right}});
ok(pr.right<=390&&pr.top<844,"phone: panel within the viewport width and reachable");
await p.screenshot({path:`shots/${tag}-orrery-phone-open.png`});
await p.setViewport({width:320,height:700}); await p.reload({waitUntil:"load"}); await wait(1200);
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow at 320");
await p.close(); await b.close();
console.log(tag,"fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
