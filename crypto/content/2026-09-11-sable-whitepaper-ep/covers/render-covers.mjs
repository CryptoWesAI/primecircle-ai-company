// Cover art for the whitepaper EP, drawn in code in the Observatory's own look:
// the Orrery (thirteen orbits around one bright point), the six planets that
// have a track lit, IBM Plex Mono for every word. One square 3000x3000 PNG per
// track and one for the album, rendered by the same headless browser the site's
// tests use. No image model involved, so a rerun gives the same pixels.
//
//   node covers/render-covers.mjs            (from the EP folder; writes covers/*.png)
//
// Text lives in COVER below (album title, artist); the track rows come from
// tracks/*.md. Change a string, rerun, done.
import puppeteer from "puppeteer-core";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ep = join(here, "..");
const fonts = join(ep, "..", "..", "..", "sites", "sable-peers", "site", "fonts");
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => existsSync(p));
mkdirSync(here, { recursive: true });

const COVER = {
  album: "Compute You Can Prove",
  sub: "The Sable whitepaper, sung · six sections",
  artist: "OG THE MOGI",
  line: "every quoted line the paper's own",
};
const SIZE = 3000;

const font = (w) => `url(data:font/woff2;base64,${readFileSync(join(fonts, `ibm-plex-mono-${w}.woff2`)).toString("base64")})`;
const tracks = readdirSync(join(ep, "tracks")).filter((f) => /^\d\d-.*\.md$/.test(f)).sort().map((f) => {
  const t = readFileSync(join(ep, "tracks", f), "utf8");
  const g = (k) => ((t.match(new RegExp(`^${k}:\\s*(.*)$`, "m")) || [])[1] || "").trim().replace(/^"(.*)"$/, "$1");
  return { track: Number(g("track")), slug: g("slug"), title: g("title"), section: Number(g("section")), planet: g("planet"), hook: g("hook") };
});

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:M;font-weight:400;src:${font(400)}}
@font-face{font-family:M;font-weight:500;src:${font(500)}}
@font-face{font-family:M;font-weight:600;src:${font(600)}}
html,body{margin:0;background:#05070A}canvas{display:block}
</style><canvas id="c" width="${SIZE}" height="${SIZE}"></canvas>
<script>
const S=${SIZE},c=document.getElementById('c'),x=c.getContext('2d');
const VOID='#05070A',INK='#0A1118',TEXT='#E8F2F8',DIM='#8FA3B0',DIM2='#4C6070',CYAN='#18BFFF',SOFT='#72DCFF',MOON='#FF7A59';
function rnd(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}}
function bg(seed){const g=x.createRadialGradient(S*.5,-S*.1,0,S*.5,-S*.1,S*1.25);g.addColorStop(0,'#0E1C28');g.addColorStop(.45,INK);g.addColorStop(1,VOID);x.fillStyle=g;x.fillRect(0,0,S,S);
  const r=rnd(seed);for(let i=0;i<900;i++){const px=r()*S,py=r()*S,a=.15+r()*.6,rad=r()<.08?2.2:1.2;x.fillStyle='rgba(232,242,248,'+a.toFixed(2)+')';x.beginPath();x.arc(px,py,rad,0,7);x.fill();}}
function sun(cx,cy,R){for(let i=6;i>=1;i--){x.fillStyle='rgba(24,191,255,'+(0.03*i).toFixed(3)+')';x.beginPath();x.arc(cx,cy,R*(1+i*.9),0,7);x.fill();}
  const g=x.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'#ffffff');g.addColorStop(.35,SOFT);g.addColorStop(1,CYAN);x.fillStyle=g;x.beginPath();x.arc(cx,cy,R,0,7);x.fill();}
function orbits(cx,cy,r0,step,ey,n,lit,selN){for(let i=1;i<=n;i++){const rr=r0+step*i;x.strokeStyle=lit.has(String(i).padStart(2,'0'))?'rgba(24,191,255,.30)':'rgba(24,191,255,.10)';x.lineWidth=selN===i?4:2.2;x.beginPath();x.ellipse(cx,cy,rr,rr*ey,0,0,7);x.stroke();}}
function planetAt(cx,cy,r0,step,ey,i,ang){const rr=r0+step*i;return {x:cx+Math.cos(ang)*rr,y:cy+Math.sin(ang)*rr*ey};}
function label(t,px,py,size,w,col,align){x.font=(w||500)+' '+size+'px M';x.fillStyle=col;x.textAlign=align||'left';x.textBaseline='alphabetic';x.fillText(t,px,py);}
function upper(t,px,py,size,col,align,ls){x.font='500 '+size+'px M';x.fillStyle=col;x.textAlign=align||'left';x.textBaseline='alphabetic';const chars=t.toUpperCase().split('');let X=px;if(align==='right'){let w=0;for(const ch of chars)w+=x.measureText(ch).width+ls;X=px-w;}x.textAlign='left';for(const ch of chars){x.fillText(ch,X,py);X+=x.measureText(ch).width+ls;}}
function wrap(t,maxW,size,w){x.font=(w||600)+' '+size+'px M';const words=t.split(' '),lines=[];let cur='';for(const wd of words){const tst=cur?cur+' '+wd:wd;if(x.measureText(tst).width>maxW&&cur){lines.push(cur);cur=wd;}else cur=tst;}if(cur)lines.push(cur);return lines;}
const ANG={};for(let i=1;i<=13;i++)ANG[i]=(-1.15+i*0.93)%(Math.PI*2);
function albumCover(lit){bg(7);const cx=S*.5,cy=S*.40,r0=S*.04,step=S*.032,ey=.62;orbits(cx,cy,r0,step,ey,13,lit,0);
  for(let i=13;i>=1;i--){const n=String(i).padStart(2,'0'),p=planetAt(cx,cy,r0,step,ey,i,ANG[i]),on=lit.has(n),rad=on?22:12;
    if(on){x.fillStyle='rgba(24,191,255,.22)';x.beginPath();x.arc(p.x,p.y,rad*2.6,0,7);x.fill();}
    x.fillStyle=on?SOFT:'rgba(143,163,176,.55)';x.beginPath();x.arc(p.x,p.y,rad,0,7);x.fill();
    label(n,p.x+rad+14,p.y-rad-6,on?40:30,on?600:500,on?TEXT:'rgba(143,163,176,.7)');}
  sun(cx,cy,34);
  upper('The whitepaper EP  ·  Sable Observatory',S*.08,S*.735,44,CYAN,'left',10);
  const lines=wrap(${JSON.stringify(COVER.album)},S*.84,190,600);let y=S*.735+230;for(const l of lines){label(l,S*.08,y,190,600,TEXT);y+=205;}
  label(${JSON.stringify(COVER.sub)},S*.08,y+30,58,400,DIM);
  upper(${JSON.stringify(COVER.artist)},S*.92,S*.94,64,TEXT,'right',12);
  upper(${JSON.stringify(COVER.line)},S*.08,S*.94,36,DIM2,'left',7);}
function trackCover(t,lit){bg(100+t.track);const n=Number(t.planet),cx=S*.12,cy=S*.36,r0=S*.05,step=S*.055,ey=.9;
  orbits(cx,cy,r0,step,ey,13,lit,n);
  const p=planetAt(cx,cy,r0,step,ey,n,ANG[n]);const px=Math.min(Math.max(p.x,S*.55),S*.72),py=Math.min(Math.max(p.y,S*.30),S*.44);const R=S*.16;
  for(let i=5;i>=1;i--){x.fillStyle='rgba(24,191,255,'+(0.035*i).toFixed(3)+')';x.beginPath();x.arc(px,py,R*(1+i*.16),0,7);x.fill();}
  const g=x.createRadialGradient(px-R*.45,py-R*.45,R*.1,px,py,R);g.addColorStop(0,'#F4FAFF');g.addColorStop(.35,SOFT);g.addColorStop(.85,'#0B5C80');g.addColorStop(1,'#07364C');x.fillStyle=g;x.beginPath();x.arc(px,py,R,0,7);x.fill();
  const ma=1.2+t.track*.7,mx=px+Math.cos(ma)*R*1.45,my=py+Math.sin(ma)*R*1.45*.6;x.fillStyle=MOON;x.beginPath();x.arc(mx,my,R*.075,0,7);x.fill();
  x.font='600 '+Math.round(R*1.05)+'px M';x.fillStyle='rgba(5,7,10,.82)';x.textAlign='center';x.textBaseline='middle';x.fillText(t.planet,px,py+R*.04);
  sun(cx,cy,26);
  upper('Track '+t.track+' of 6  ·  planet '+t.planet+'  ·  section '+t.section,S*.08,S*.66,44,CYAN,'left',10);
  const lines=wrap(t.title,S*.84,175,600);let y=S*.66+225;for(const l of lines){label(l,S*.08,y,175,600,TEXT);y+=190;}
  const hl=wrap('\\u201c'+t.hook+'\\u201d',S*.84,54,400);y+=20;for(const l of hl){label(l,S*.08,y,54,400,DIM);y+=72;}
  upper(${JSON.stringify(COVER.artist)},S*.92,S*.94,64,TEXT,'right',12);
  upper(${JSON.stringify(COVER.album)}+'  ·  the whitepaper EP',S*.08,S*.94,36,DIM2,'left',7);}
window.draw=async function(job){await document.fonts.load('600 40px M');await document.fonts.load('500 40px M');await document.fonts.load('400 40px M');const lit=new Set(job.lit);if(job.kind==='album')albumCover(lit);else trackCover(job.track,lit);return c.toDataURL('image/png');};
</script>`;

const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
await p.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: "load" });
const lit = tracks.map((t) => t.planet);
const save = async (job, name) => { const url = await p.evaluate((j) => window.draw(j), job); writeFileSync(join(here, name), Buffer.from(url.split(",")[1], "base64")); console.log("cover:", name); };
await save({ kind: "album", lit }, "album.png");
for (const t of tracks) await save({ kind: "track", track: t, lit }, `${String(t.track).padStart(2, "0")}-${t.slug}.png`);
await b.close();
