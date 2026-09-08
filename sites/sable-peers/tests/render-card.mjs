// Re-draw a share card with the site's own card code, for comparing against a posted image.
// The starfield is seeded from score * 7919 + wave, so a card whose digits were edited
// carries the stars of the original score; a genuine card's stars match the re-draw.
//   node render-card.mjs '{"score":54045,"wave":15,"refused":569,"refusedLoops":216,"leaked":15,"cleanWaves":12,"name":"AlfinMzn","handle":"AlfinMzn123","seed":"2026-09-08:x"}' [more score variants, comma separated]
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const exe=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p=>existsSync(p));
const here=dirname(fileURLToPath(import.meta.url)), root=join(here,"..","site");
const d=JSON.parse(process.argv[2]);
const variants=[d.score,...(process.argv[3]?process.argv[3].split(",").map(Number):[])];
const port=8798;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".woff2":"font/woff2"};
const srv=createServer(async(req,res)=>{
  const p=decodeURIComponent(new URL(req.url,"http://x").pathname);
  if(p==="/card.html"){res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});return res.end(`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"IBM Plex Mono";font-weight:400;src:url(/fonts/ibm-plex-mono-400.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:500;src:url(/fonts/ibm-plex-mono-500.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:600;src:url(/fonts/ibm-plex-mono-600.woff2) format("woff2")}
body{margin:0;background:#000}canvas{display:block}</style><canvas id="c"></canvas>
<script type="module">window.draw=async(d)=>{const m=await import("/game/share.js");await m.drawCard(document.getElementById("c"),d);return true;};window.ready=true;</script>`);}
  const file=normalize(join(root,p));
  if(!file.startsWith(root)){res.writeHead(403);return res.end();}
  try{const data=await readFile(file);res.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream"});res.end(data);}
  catch{res.writeHead(404);res.end("not found");}
});
await new Promise(r=>srv.listen(port,"127.0.0.1",r));
const b=await puppeteer.launch({executablePath:exe,headless:true});
const p=await b.newPage(); await p.setViewport({width:1200,height:675,deviceScaleFactor:1});
p.on("pageerror",e=>console.error("page error:",e.message));
await p.goto(`http://127.0.0.1:${port}/card.html`,{waitUntil:"load"});
await p.waitForFunction(()=>window.ready===true);
for(const score of variants){
  await p.evaluate(async(dd)=>{await window.draw(dd);},{...d,score});
  await new Promise(r=>setTimeout(r,200));
  const out=join(here,"shots",`card-${score}.png`);
  const el=await p.$("#c"); await el.screenshot({path:out});
  console.log("wrote",out);
}
await b.close(); srv.close();
