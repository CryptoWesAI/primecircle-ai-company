// Lisa on the live page: does the ElevenLabs widget load under the site's
// policy, and does a call open a websocket to ElevenLabs? Uses a fake
// microphone; the call lasts a few seconds and is then closed.
//   node lisa-smoke.mjs https://sable.primecircle.cloud/
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p=>existsSync(p));
const base=process.argv[2];
const b=await puppeteer.launch({executablePath:exe,headless:true,args:["--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream","--autoplay-policy=no-user-gesture-required"]});
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const ok2=(k,v)=>console.log(k+":",v);
const errs=[],failed=[],sockets=[],frames=[];
try{
  const ctx=b.defaultBrowserContext(); await ctx.overridePermissions(new URL(base).origin,["microphone"]);
  const p=await b.newPage(); await p.setViewport({width:1320,height:900});
  await p.evaluateOnNewDocument(()=>{window.__csp=[];document.addEventListener("securitypolicyviolation",e=>window.__csp.push(e.violatedDirective+" -> "+e.blockedURI));});
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text().slice(0,200));});
  p.on("requestfailed",r=>failed.push(r.url().slice(0,120)+" ("+(r.failure()&&r.failure().errorText)+")"));
  const cdp=await p.createCDPSession(); await cdp.send("Network.enable");
  cdp.on("Network.webSocketCreated",e=>sockets.push(e.url)); cdp.on("Network.webSocketFrameReceived",e=>{if(frames.length<6)frames.push(String(e.response.payloadData).slice(0,80));});
  await p.goto(base,{waitUntil:"load"}); await wait(1500);
  await p.click("#guide-btn"); await wait(600);
  const head=await p.$eval("#guide-name",e=>e.textContent)+" · "+await p.$eval("#guide-sub",e=>e.textContent);
  console.log("panel:",head);
  ok2("Talk button", await p.$eval("#lisa-call", e => e.textContent));
  ok2("Tour button", await p.$eval("#guide-start", e => e.textContent));
  // Hear the tour outside a call: she is called, briefed, and asked for the tour after her greeting
  await p.click("#guide-start");
  await p.waitForFunction(() => /listening|speaking|could not|ended|browser voice/.test(document.getElementById("lisa-status").textContent), { timeout: 25000 }).catch(() => {});
  await wait(2000);
  console.log("status:", await p.$eval("#lisa-status", e => e.textContent), "| caption:", (await p.$eval("#guide-cap", e => e.textContent)).slice(0, 160));
  await p.waitForFunction(() => (window.__lisaCalls || []).filter(c => c[0] === "navigate").length >= 1, { timeout: 40000 }).catch(() => {});
  await wait(14000);
  // one page, then she waits: still one navigate call after fourteen seconds
  console.log("tour calls after first page:", JSON.stringify(await p.evaluate(() => (window.__lisaCalls || []).map(c => c[0] + " " + JSON.stringify(c[1])))), "| button:", await p.$eval("#guide-start", e => e.textContent), "| status:", await p.$eval("#lisa-status", e => e.textContent));
  console.log("tour caption:", (await p.$eval("#guide-cap", e => e.textContent)).slice(0, 220));
  await p.click("#guide-start");
  await p.waitForFunction(() => (window.__lisaCalls || []).filter(c => c[0] === "navigate").length >= 2, { timeout: 30000 }).catch(() => {});
  await wait(3000);
  console.log("tour calls after Next page:", JSON.stringify(await p.evaluate(() => (window.__lisaCalls || []).map(c => c[0] + " " + JSON.stringify(c[1])))));
  // typed request: does the agent call a tool?
  const sent = await p.evaluate(() => window.SABLE_LISA.send("Show me the token page, then open section five of the whitepaper."));
  console.log("typed request sent:", sent);
  await p.waitForFunction(() => (window.__lisaCalls || []).some(c => c[0] === "open_section"), { timeout: 25000 }).catch(() => {});
  await wait(4000);
  console.log("tool calls:", JSON.stringify(await p.evaluate(() => (window.__lisaCalls || []).map(c => c[0] + " " + JSON.stringify(c[1])))));
  console.log("page now on:", await p.evaluate(() => window.SABLE_SHELL.current()), "| section selected:", await p.evaluate(() => window.SABLE_ORRERY.selected()));
  console.log("reply caption:", (await p.$eval("#guide-cap", e => e.textContent)).slice(0, 220));
  console.log("floating widget present:", await p.evaluate(() => !!document.querySelector("elevenlabs-convai")));
  console.log("elevenlabs requests:",JSON.stringify(await p.evaluate(()=>performance.getEntriesByType("resource").filter(e=>/elevenlabs/.test(e.name)).map(e=>e.name.replace(/^https?:\/\//,"").slice(0,90)+" "+(e.responseStatus||"")))));
  console.log("csp violations:",JSON.stringify(await p.evaluate(()=>window.__csp)));
  console.log("websockets:",JSON.stringify(sockets.map(u=>u.slice(0,90))));
  console.log("frames:",JSON.stringify(frames));
  console.log("failed requests:",JSON.stringify(failed));
  console.log("console errors:",JSON.stringify(errs));
  await p.screenshot({path:"shots/lisa-live.png"});
}finally{ await b.close(); }
