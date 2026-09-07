// Ask Lisa one thing by text on the live page and report which tools she called.
//   node lisa-ask.mjs https://sable.primecircle.cloud/ "Show me the game"
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const base=process.argv[2], ask=process.argv[3]||"Show me the game";
const b=await puppeteer.launch({executablePath:exe,headless:true,args:["--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream","--autoplay-policy=no-user-gesture-required"]});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
  const ctx=b.defaultBrowserContext(); await ctx.overridePermissions(new URL(base).origin,["microphone"]);
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.goto(base,{waitUntil:"load"}); await wait(1500);
  await p.click("#guide-btn"); await wait(600);
  await p.click("#lisa-call");
  await p.waitForFunction(()=>/listening|speaking|could not|ended/.test(document.getElementById("lisa-status").textContent),{timeout:25000}).catch(()=>{});
  await p.waitForFunction(()=>/listening/.test(document.getElementById("lisa-status").textContent),{timeout:20000}).catch(()=>{});
  console.log("mic muted for the test:",await p.evaluate(()=>window.SABLE_LISA.mute(true)));
  console.log("status:",await p.$eval("#lisa-status",e=>e.textContent),"| briefing chars:",await p.evaluate(()=>window.SABLE_LISA.briefing().length));
  console.log("asked:",ask,"| sent:",await p.evaluate(t=>window.SABLE_LISA.send(t),ask));
  await p.waitForFunction(()=>(window.__lisaCalls||[]).length>=1,{timeout:25000}).catch(()=>{});
  // her answer follows the tool result; wait for a caption that is more than a filler
  await p.waitForFunction(()=>{const t=document.getElementById("guide-cap").textContent;return /^Lisa: /.test(t)&&t.replace(/^Lisa: /,"").replace(/Mmm\.\.\. one moment\.?/,"").trim().length>40;},{timeout:30000}).catch(()=>{});
  await wait(2500);
  console.log("tool calls:",JSON.stringify(await p.evaluate(()=>(window.__lisaCalls||[]).map(c=>c[0]+" "+JSON.stringify(c[1])))));
  console.log("page now on:",await p.evaluate(()=>window.SABLE_SHELL.current()));
  console.log("reply:",(await p.$eval("#guide-cap",e=>e.textContent)).slice(0,600));
  await p.evaluate(()=>window.SABLE_LISA.end());
}finally{ await b.close(); }
