// Simulates a browser translating the page (Chrome style: every translatable text
// node rewritten and wrapped in <font> pairs), then checks that evidence stays
// untouched, the badges stay right, and the door, the verifier and navigation
// still work. rot13 is the "language": it changes every letter, so any code that
// matches English words off the DOM fails visibly.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const base=process.argv[2]; const tag=process.argv[3]||"local";
const b=await puppeteer.launch({executablePath:exe,headless:true});
const errs=[],fails=[]; const ok=(c,m)=>{if(!c)fails.push(m)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ROT=s=>s.replace(/[a-zA-Z]/g,c=>{const b=c<="Z"?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b)});
const MOCK=`(function(){function rot(s){return s.replace(/[a-zA-Z]/g,function(c){var b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b)})}
var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentElement;if(!p)return NodeFilter.FILTER_REJECT;if(/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName))return NodeFilter.FILTER_REJECT;if(p.tagName==='FONT'&&p.hasAttribute('data-mock'))return NodeFilter.FILTER_REJECT;if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;if(p.translate===false)return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
var nodes=[];while(w.nextNode())nodes.push(w.currentNode);
nodes.forEach(function(n){var f1=document.createElement('font');f1.setAttribute('data-mock','1');f1.style.verticalAlign='inherit';var f2=f1.cloneNode(false);f2.textContent=rot(n.nodeValue);f1.appendChild(f2);n.parentNode.replaceChild(f1,n);});
return nodes.length;})()`;
const p=await b.newPage(); await p.setViewport({width:1320,height:900});
p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{if(m.type()==="error"&&!(base.startsWith("file:")&&/sable-api|ERR_FAILED|ERR_FILE_NOT_FOUND|origin 'null'/.test(m.text())))errs.push(m.text())});
const mock=()=>p.evaluate(MOCK);
const text=sel=>p.$eval(sel,e=>e.textContent.trim());
const texts=sel=>p.$$eval(sel,es=>es.map(e=>e.textContent.trim()));
const cls=sel=>p.$eval(sel,e=>e.className);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const vis=id=>p.evaluate(id=>{const e=document.getElementById(id);return !!e&&getComputedStyle(e).display!=="none";},id);

await p.goto(base+"?view=full",{waitUntil:"load"}); await wait(4500);
ok(await p.evaluate(()=>document.documentElement.lang==="en"||location.protocol==="file:"),"html lang is en");
// 1. translate modes declared the way we want them
const flags=await p.evaluate(()=>{const q=s=>[...document.querySelectorAll(s)];const bad=[];
  const no=["#signer","#st-gw","#cipher","#receipt","#kept","#never",".ladder",".ladder .lab",".ladder .val","#ledger-table tbody","#wp-version","#rcpt","#sig","#exp","td.name > span"];
  const yes=["#explained h2","#record .corr li","#field th","td.name small","td.pc","#vout","#holdtxt","#st-conf","#wp-list","#t-verify","#guide-cap","#ledger-table th","#mc-stamp","#updates .corr li"];
  no.forEach(s=>{const es=q(s);if(!es.length)bad.push("missing "+s);es.forEach(e=>{if(e.translate!==false)bad.push("translatable but should not be: "+s)})});
  yes.forEach(s=>{const es=q(s);if(!es.length)bad.push("missing "+s);es.forEach(e=>{if(e.translate!==true)bad.push("blocked but should translate: "+s)})});
  return bad;});
ok(!flags.length,"translate flags: "+flags.join("; "));
// 2. snapshots of what must survive
const sig0=await text("#signer"); ok(/^0x[0-9a-fA-F]{40}$/.test(sig0),"signer is an address before translation: "+sig0);
const names0=await texts('td.name > span'); ok(names0.length===8&&names0.includes("Sable")&&names0.includes("Phala"),"eight project names");
const syms0=await texts(".ladder .lab"); const vals0=await texts(".ladder .val");
const wpv0=await text("#wp-version"); const ledger0=await texts("#ledger-table tbody td");
const h2before=await text("#explained h2"); const th0=await text("#field th");
const tiles0={verify:await cls("#t-verify"),field:await text("#t-field"),token:await text("#t-token"),log:(await text("#t-log")).replace(/[a-zA-Z]/g,"")};
console.log("badges before:",JSON.stringify({verifyClass:tiles0.verify,field:tiles0.field,token:tiles0.token}));
// 3. translate
const n=await mock(); console.log("text nodes translated:",n); ok(n>300,"mock translated the page");
await wait(1500);
ok((await text("#field th"))===ROT(th0),"prose was translated (table header)");
ok((await text("#explained h2"))!==h2before,"prose was translated (explained heading)");
ok((await text("#signer"))===sig0,"signer untouched");
ok(same(await texts('td.name > span'),names0),"project names untouched");
ok(same(await texts(".ladder .lab"),syms0)&&same(await texts(".ladder .val"),vals0),"ladder untouched");
ok((await text("#wp-version"))===wpv0,"whitepaper cover text untouched");
ok(same(await texts("#ledger-table tbody td"),ledger0),"ledger rows untouched");
const tiles1={verify:await cls("#t-verify"),field:await text("#t-field"),token:await text("#t-token"),log:(await text("#t-log")).replace(/[a-zA-Z]/g,"")};
ok(tiles1.verify===tiles0.verify,"verify badge class unchanged: "+tiles0.verify+" -> "+tiles1.verify);
ok(tiles1.field===tiles0.field,"field badge unchanged: "+tiles0.field+" -> "+tiles1.field);
ok(tiles1.token===tiles0.token,"token badge unchanged: "+tiles0.token+" -> "+tiles1.token);
ok(tiles1.log===tiles0.log,"log badge date unchanged");
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),"no overflow after translation");
await p.screenshot({path:`shots/${tag}-translated.png`});
// 4. the door, after translation, then translated again (a browser translates new content too)
await p.click("#send"); await wait(3800); await p.waitForSelector("#verify",{timeout:8000});
const rv0=await texts("#receipt .v"); const cipher0=await text("#cipher"); const never0=await text("#never"); const kept0=await text("#kept");
ok(rv0.length>3&&cipher0.length>20,"door produced a receipt and a cipher");
await p.click("#verify"); await wait(700); ok(/valid/.test(await text("#vres")),"door receipt verifies");
await mock(); await wait(300);
ok(same(await texts("#receipt .v"),rv0),"receipt values untouched by a second translation");
ok((await text("#cipher"))===cipher0&&(await text("#never"))===never0&&(await text("#kept"))===kept0,"cipher, kept and never untouched");
ok((await text("#vres")).includes(ROT("valid")),"door verdict is translatable");
ok(await p.evaluate(()=>document.querySelector("#receipt .sig").translate===true&&document.querySelector("#receipt .v").translate===false),"receipt: values fixed, verdict row translatable");
// 5. the verifier, after translation
await p.click("#test-btn"); await p.click("#verify-btn"); await p.waitForFunction(()=>/valid|Could not/.test(document.getElementById("vout").textContent),{timeout:30000});
ok(/✓ signature valid/.test(await text("#vout")),"verifier passes the test receipt");
const pre0=await text("#vout pre"); const addr0=await text('#vout span[translate="no"]'); ok(/^0x[0-9a-fA-F]{40}$/.test(addr0),"verdict carries the address in a fixed span");
await mock(); await wait(300);
ok((await text("#vout pre"))===pre0,"decoded receipt untouched");
ok((await text('#vout span[translate="no"]'))===addr0,"recovered address untouched");
ok((await text("#vout .ok")).includes(ROT("signature valid")),"verdict sentence is translatable");
// 6. navigation and the guide still work on a translated page
await p.click("#mode-compact"); await wait(300); await p.click('#orr-topics button[data-topic="field"]'); await wait(500);
ok(await vis("field")&&!(await vis("home")),"tile navigation works after translation");
await p.click("#guide-btn"); await wait(300); ok(await p.evaluate(()=>!document.getElementById("guide-panel").hidden),"guide opens after translation");
await p.keyboard.press("Escape");
await p.close(); await b.close();
console.log(tag,"fails:",fails.length?fails:"none","| errors:",errs.length?errs:"none");
if(fails.length||errs.length)process.exit(1);
