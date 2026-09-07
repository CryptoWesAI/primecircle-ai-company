// Captures the game's start and end cards on two phone sizes with a filled
// board, and reports widths, so the cards can be checked by eye.
//   node phone-cards.mjs <base url>
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const base=process.argv[2];
const b=await puppeteer.launch({executablePath:exe,headless:true});
try{
  for(const [w,h] of [[390,844],[360,740]]){
    const p=await b.newPage(); await p.setViewport({width:w,height:h,deviceScaleFactor:1});
    await p.goto(base+"#play",{waitUntil:"load"}); await new Promise(r=>setTimeout(r,900));
    await p.evaluate(()=>{
      const rows=[["Optimus Prime Circle","0PTIMUS_ONE",3080,6],["Ada Lovelace","",2145,4],["A very long name here","somehandle_12345",990,2]];
      document.querySelector("#gb-table tbody").innerHTML=rows.map((r,i)=>'<tr'+(i===0?' class="me"':'')+'><td class="n">'+(i+1)+'</td><td class="nm" translate="no">'+r[0]+(r[1]?' <a href="https://x.com/'+r[1]+'">@'+r[1]+'</a>':'')+'</td><td class="s">'+r[2].toLocaleString("en-US")+'</td><td class="n">'+r[3]+'</td><td class="n gb-day">2026-09-07</td></tr>').join("");
    });
    const m=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.width),Math.round(r.height)]};return {game:g(".game"),stage:g("#game-stage"),card:g("#game-start .g-card"),table:g("#gb-table"),overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth}});
    console.log(w+"x"+h,JSON.stringify(m));
    await p.evaluate(()=>document.getElementById("game-stage").scrollIntoView({block:"start"})); await new Promise(r=>setTimeout(r,200));
    await p.screenshot({path:`shots/phone-start-${w}.png`});
    await p.evaluate(()=>{document.getElementById("game-start").hidden=true;const e=document.getElementById("game-end");e.hidden=false;
      const t=(id,v)=>{document.getElementById(id).textContent=v;};
      t("ge-why","Budget exhausted in wave 3.");t("ge-score","2,145");t("ge-refused","9 broken seals, 3 loops cut");t("ge-clean","1 clean wave");t("ge-leaked","6 leaked, 2 sealed requests wrongly refused");t("ge-receipts","41 receipts · budget left 0%");t("ge-result","On the board as Optimus: #1 today, #1 all time.");
      document.getElementById("game-stage").scrollIntoView({block:"start"});});
    await new Promise(r=>setTimeout(r,200));
    const e=await p.evaluate(()=>{const r=document.getElementById("game-stage").getBoundingClientRect();const c=document.querySelector("#game-end .g-card").getBoundingClientRect();return {stageH:Math.round(r.height),cardH:Math.round(c.height),cardRight:Math.round(c.right)}});
    console.log(w+"x"+h,"end card",JSON.stringify(e));
    await p.screenshot({path:`shots/phone-end-${w}.png`});
    await p.close();
  }
}finally{ await b.close(); }
