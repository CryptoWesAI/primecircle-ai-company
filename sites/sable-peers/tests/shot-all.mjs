// Every topic at desktop and phone width, full page, after the live reads have landed;
// plus full mode, the guide panel and the game's start card. Also sweeps the page for
// leftovers: "undefined", "NaN", "null", "[object", and read-states that never resolved.
//   node shot-all.mjs https://sable.primecircle.cloud/ qa
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const base=process.argv[2]; const tag=process.argv[3]||"qa";
const TOPICS=["home","explained","door","check","field","token","scenarios","play","log","community"];
const b=await puppeteer.launch({executablePath:exe,headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
mkdirSync("shots",{recursive:true});
const sweep=async(p)=>p.evaluate(()=>{
  const bad=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const n=walker.currentNode;const t=n.textContent;const el=n.parentElement;if(!el||!t.trim())continue;
    if(el.offsetParent===null&&getComputedStyle(el).position!=="fixed")continue;
    if(/\bundefined\b|\bNaN\b|\[object |\bnull\b/.test(t))bad.push("text: "+t.trim().slice(0,80)+" <"+el.tagName.toLowerCase()+(el.id?"#"+el.id:"")+">");
    if(/^(reading|loading|waiting|…)/i.test(t.trim())&&/…$|reading|loading/i.test(t.trim())&&!/waiting/.test(t))bad.push("still reading: "+t.trim().slice(0,60)+" <"+el.tagName.toLowerCase()+(el.id?"#"+el.id:"")+">");
  }
  return bad;});
const overflow=async(p)=>p.evaluate(()=>{const w=document.documentElement.clientWidth;const out=[];document.querySelectorAll("body *").forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.right>w+1&&getComputedStyle(e).position!=="fixed"){const o=e.closest(".tablewrap,.orr-stage,#orr,canvas,pre,.strip,.rgrid");if(!o)out.push((e.id?"#"+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==="string"?"."+e.className.split(" ")[0]:""))+" right="+Math.round(r.right));}});return {docWider:document.documentElement.scrollWidth>w,items:out.slice(0,8)};});
const report={};
try{
  for(const [w,h,dev] of [[1320,900,"desktop"],[390,844,"phone"]]){
    for(const t of TOPICS){
      const p=await b.newPage(); await p.setViewport({width:w,height:h});
      const errs=[]; p.on("pageerror",e=>errs.push(e.message.slice(0,120)));
      await p.goto(base+"#"+t,{waitUntil:"load"}); await p.evaluate(()=>window.SABLE_SHELL&&window.SABLE_SHELL.setMode("compact"));
      await p.evaluate(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});
      await p.waitForFunction(()=>!/reading/.test((document.getElementById("gb-table")||{textContent:""}).textContent)&&!/reading/.test((document.getElementById("rfacts")||{textContent:""}).textContent),{timeout:15000}).catch(()=>{});
      await wait(2500);
      await p.screenshot({path:`shots/${tag}-${dev}-${t}.png`,fullPage:true});
      report[`${dev}-${t}`]={sweep:await sweep(p),overflow:await overflow(p),errors:errs,height:await p.evaluate(()=>document.documentElement.scrollHeight)};
      if(t==="home"){ await p.click("#guide-btn"); await wait(500); await p.screenshot({path:`shots/${tag}-${dev}-guide.png`}); await p.keyboard.press("Escape"); }
      if(t==="check"){ await p.evaluate(()=>window.SABLE_SHELL&&window.SABLE_SHELL.setMode("full")); await wait(1500); await p.evaluate(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);}); await wait(2500); await p.screenshot({path:`shots/${tag}-${dev}-full.png`,fullPage:true}); report[`${dev}-full`]={sweep:await sweep(p),overflow:await overflow(p),height:await p.evaluate(()=>document.documentElement.scrollHeight)}; await p.evaluate(()=>window.SABLE_SHELL.setMode("compact")); }
      await p.close();
    }
  }
}finally{ await b.close(); }
for(const [k,v] of Object.entries(report)){ const flags=[...(v.sweep||[]),...((v.overflow&&v.overflow.items)||[]).map(x=>"overflow: "+x),...((v.errors||[]).map(x=>"error: "+x))]; console.log(k, "h="+v.height, v.overflow&&v.overflow.docWider?"PAGE WIDER THAN VIEWPORT":"", flags.length?"\n   "+flags.join("\n   "):"clean"); }
