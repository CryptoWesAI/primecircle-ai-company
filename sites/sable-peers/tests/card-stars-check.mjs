// Is a posted Gatekeeper share card genuine, or were its digits edited? The card's
// 140 background stars are drawn from a random generator seeded with score * 7919 + wave,
// so the star pattern is a fingerprint of the score the card was drawn with. This tool
// reads a posted image (PNG or the JPEG that X makes of it), samples the brightness at
// the star positions every candidate score would produce, and ranks the candidates:
// the score the card was really drawn with lights up, an edited one does not, and the
// original score of an edited card usually shows up among the single-digit variants.
//   node card-stars-check.mjs <image> '{"score":54045,"wave":15,"refused":569,"refusedLoops":216,"leaked":15,"cleanWaves":12,"name":"...","handle":"...","seed":"2026-09-08:x"}'
//   node card-stars-check.mjs --selftest '<same json>'      (draws the card itself, JPEG-compresses it, and checks it)
import puppeteer from "puppeteer-core";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url)), root=join(here,"..","site");
const imgPath=process.argv[2], d=JSON.parse(process.argv[3]||"{}");
const selftest=imgPath==="--selftest";
if(!imgPath||typeof d.score!=="number"){console.error("usage: node card-stars-check.mjs <image|--selftest> '<card json>'");process.exit(2);}

// the same generator as share.js
function seeded(n){let a=n|0||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function stars(score,wave){const r=seeded(score*7919+wave),out=[];for(let i=0;i<140;i++){const x=r()*1200,y=r()*675;r();r();out.push([Math.round(x),Math.round(y)]);}return out;}
// candidates: the displayed score, every single-digit edit of it, the neighbouring waves, and a few unrelated scores as a floor
const shown=String(d.score), cands=new Map();
cands.set(`${d.score} w${d.wave}`,[d.score,d.wave]);
for(let i=0;i<shown.length;i++)for(let g=0;g<=9;g++){const s=Number(shown.slice(0,i)+g+shown.slice(i+1));if(s!==d.score&&s>0)cands.set(`${s} w${d.wave}`,[s,d.wave]);}
for(const w of [d.wave-1,d.wave+1])if(w>0)cands.set(`${d.score} w${w}`,[d.score,w]);
for(const s of [12345,99990,31415,27180])cands.set(`${s} w${d.wave} (unrelated)`,[s,d.wave]);
const controls=(()=>{const r=seeded(987654);const out=[];for(let i=0;i<600;i++)out.push([Math.round(r()*1200),Math.round(r()*675)]);return out;})();

const types={".js":"text/javascript; charset=utf-8",".png":"image/png",".woff2":"font/woff2"};
const port=8799;
const srv=createServer(async(req,res)=>{
  const p=decodeURIComponent(new URL(req.url,"http://x").pathname);
  if(p==="/check.html"){res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});return res.end(`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"IBM Plex Mono";font-weight:400;src:url(/fonts/ibm-plex-mono-400.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:500;src:url(/fonts/ibm-plex-mono-500.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:600;src:url(/fonts/ibm-plex-mono-600.woff2) format("woff2")}</style>
<script type="module">
const W=1200,H=675,lum=(d,j)=>0.2126*d[j]+0.7152*d[j+1]+0.0722*d[j+2];
async function draw(dd){const m=await import("/game/share.js");const c=document.createElement("canvas");await m.drawCard(c,dd);return c;}
window.api={
  // everything that is not a star and not background: identical in two cards drawn with different scores and brighter than the ground
  async mask(dA,dB){const a=(await draw(dA)).getContext("2d").getImageData(0,0,W,H).data,b=(await draw(dB)).getContext("2d").getImageData(0,0,W,H).data;const m=new Uint8Array(W*H);let n=0;
    for(let i=0;i<m.length;i++){const j=i*4;if(a[j]===b[j]&&a[j+1]===b[j+1]&&a[j+2]===b[j+2]&&lum(a,j)>34){m[i]=1;n++;}}window._mask=m;return n;},
  async selfimage(dd,q){const c=await draw(dd);return c.toDataURL("image/jpeg",q);},
  async load(url){const im=new Image();await new Promise((r,e)=>{im.onload=r;im.onerror=e;im.src=url;});const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(im,0,0,W,H);window._img=x.getImageData(0,0,W,H).data;return {w:im.naturalWidth,h:im.naturalHeight};},
  // brightest pixel in a 5x5 window around each point; null where the window touches drawn content or the score digits
  sample(points){const d=window._img,m=window._mask,out=[];for(const [x,y] of points){let best=-1,bad=false;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H){bad=true;continue;}const i=yy*W+xx;if(m[i])bad=true;const l=lum(d,i*4);if(l>best)best=l;}
    out.push(bad||(x>=50&&x<=650&&y>=165&&y<=315)?null:best);}return out;}
};window.ready=true;</script>`);}
  const file=normalize(join(root,p));if(!file.startsWith(root)){res.writeHead(403);return res.end();}
  try{const data=await readFile(file);res.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream"});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>srv.listen(port,"127.0.0.1",r));
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); p.on("pageerror",e=>console.error("page error:",e.message));
await p.goto(`http://127.0.0.1:${port}/check.html`,{waitUntil:"load"}); await p.waitForFunction(()=>window.ready===true);
const masked=await p.evaluate(dd=>window.api.mask({...dd,score:11111},{...dd,score:22222}),d);
let src;
if(selftest){src=await p.evaluate((dd)=>window.api.selfimage(dd,0.7),d);console.log("self-test: the card drawn here, JPEG quality 0.7");}
else{const buf=readFileSync(imgPath);const mime=/\.png$/i.test(imgPath)?"image/png":/\.webp$/i.test(imgPath)?"image/webp":"image/jpeg";src=`data:${mime};base64,${buf.toString("base64")}`;}
const size=await p.evaluate(u=>window.api.load(u),src);
console.log(`image ${size.w}x${size.h} (analysed at 1200x675), static content masked: ${masked} px`);
const ctrl=(await p.evaluate(pts=>window.api.sample(pts),controls)).filter(v=>v!==null).sort((a,b)=>a-b);
const q=f=>ctrl[Math.min(ctrl.length-1,Math.floor(f*ctrl.length))];
const thr=q(0.9), ctrlMean=ctrl.reduce((a,b)=>a+b,0)/ctrl.length;
console.log(`background at random points: median ${q(0.5).toFixed(1)}, 90th percentile ${thr.toFixed(1)} (n=${ctrl.length}); a star must beat the 90th percentile`);
const rows=[];
for(const [label,[s,w]] of cands){const pts=stars(s,w);const v=(await p.evaluate(pts=>window.api.sample(pts),pts));const ok=v.filter(x=>x!==null);const hits=ok.filter(x=>x>thr).length;const mean=ok.reduce((a,b)=>a+b,0)/Math.max(1,ok.length);rows.push({label,usable:ok.length,hits,rate:ok.length?hits/ok.length:0,lift:mean-ctrlMean});}
rows.sort((a,b)=>b.rate-a.rate||b.lift-a.lift);
console.log("candidate            usable stars  lit   rate   brightness lift");
for(const r of rows.slice(0,8))console.log(`${r.label.padEnd(22)}${String(r.usable).padStart(6)}      ${String(r.hits).padStart(3)}  ${(100*r.rate).toFixed(0).padStart(4)}%   ${r.lift>=0?"+":""}${r.lift.toFixed(1)}`);
const top=rows[0], second=rows[1], shownRow=rows.find(r=>r.label===`${d.score} w${d.wave}`);
console.log("…");
console.log(`chance level (unrelated scores): ${rows.filter(r=>/unrelated/.test(r.label)).map(r=>(100*r.rate).toFixed(0)+"%").join(", ")}`);
if(top===shownRow&&top.rate>=0.6&&top.rate>=2*second.rate)console.log(`VERDICT: the stars match the score on the card (${d.score}); the card was drawn with this score. No sign of edited digits.`);
else if(top!==shownRow&&top.rate>=0.6)console.log(`VERDICT: the stars match ${top.label}, not the score on the card. The digits were changed after the card was drawn.`);
else console.log("VERDICT: no candidate lights up clearly. The image may be cropped, rescaled or heavily recompressed, or it is not a card drawn by this site's code.");
await b.close(); srv.close();
