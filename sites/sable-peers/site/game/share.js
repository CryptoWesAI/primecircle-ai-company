// The share card: a run drawn as a 1200x675 image in the site's own style,
// on a canvas (no image URLs, so the content policy stays as it is), with
// Share on phones, Save everywhere, and a prefilled post on X.
const W = 1200, H = 675;
const MONO = '"IBM Plex Mono", "SF Mono", Consolas, ui-monospace, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
let robot = null, robotTried = false;

function loadRobot() {
  if (robotTried) return Promise.resolve(robot);
  robotTried = true;
  return new Promise((res) => { const im = new Image(); im.onload = () => { robot = im; res(im); }; im.onerror = () => res(null); im.src = "robot.png"; });
}
function day(seed) {
  const m = String(seed || "").match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return "";
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return parseInt(m[3], 10) + " " + M[parseInt(m[2], 10) - 1] + " " + m[1];
}
function fit(ctx, text, max) { while (text.length > 4 && ctx.measureText(text).width > max) text = text.slice(0, -2) + "…"; return text; }
function seeded(n) { let a = n | 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function shareText(d) {
  return "Gatekeeper on the Sable Observatory: " + d.score.toLocaleString("en-US") + " points in wave " + d.wave + ", " + d.refused + " refused, " + d.leaked + " leaked. Same arena for everyone today. Can you hold the door? sable.primecircle.cloud/#play @Sablenetwork";
}

export async function drawCard(canvas, d) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  try { await Promise.all([document.fonts.load('600 150px ' + MONO), document.fonts.load('500 28px ' + MONO)]); } catch { /* fallback fonts */ }
  const rob = await loadRobot();
  // ground
  ctx.fillStyle = "#05070A"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(880, 340, 20, 880, 340, 520); g.addColorStop(0, "rgba(24,191,255,.16)"); g.addColorStop(1, "rgba(5,7,10,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rnd = seeded(d.score * 7919 + d.wave);
  for (let i = 0; i < 140; i++) { const x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.3; ctx.fillStyle = "rgba(232,242,248," + (0.25 + rnd() * 0.5).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  // the door, right side
  const cx = 905, cy = 345, R = 205;
  ctx.save(); ctx.shadowColor = "rgba(24,191,255,.9)"; ctx.shadowBlur = 40; ctx.strokeStyle = "#18BFFF"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = "rgba(114,220,255,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R - 26, 0, Math.PI * 2); ctx.stroke();
  // a few requests: sealed inside, refused ones bursting outside
  const caps = [[cx - 60, cy - 40, 1], [cx + 40, cy + 20, 1], [cx - 10, cy + 90, 1], [cx + 280, cy - 150, 0], [cx - 250, cy + 170, 0], [cx + 250, cy + 190, 0]];
  for (const [x, y, okk] of caps) {
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = "#18242F"; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = okk ? "#72DCFF" : "#FF7A59"; ctx.beginPath(); ctx.arc(x, y, 18, 0, okk ? Math.PI * 2 : Math.PI * 1.55); ctx.stroke();
    if (!okk) { ctx.strokeStyle = "rgba(255,122,89,.5)"; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); ctx.lineTo(x + Math.cos(a) * 42, y + Math.sin(a) * 42); ctx.stroke(); } }
  }
  if (rob) { const h = 230, w = rob.width * (h / rob.height); ctx.globalAlpha = 0.9; ctx.drawImage(rob, W - w - 40, H - h - 28, w, h); ctx.globalAlpha = 1; }
  // words, left side
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = "#18BFFF"; ctx.font = "500 22px " + MONO; ctx.letterSpacing = "4px"; ctx.fillText("PRIME CIRCLE · SABLE OBSERVATORY", 70, 82);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 24px " + MONO; ctx.letterSpacing = "3px"; ctx.fillText("GATEKEEPER · ARENA " + day(d.seed).toUpperCase(), 70, 122);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#E8F2F8"; ctx.font = "600 156px " + MONO; ctx.fillText(d.score.toLocaleString("en-US"), 62, 300);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 30px " + MONO; ctx.fillText("points · wave " + d.wave + (d.rank ? " · #" + d.rank + " today" : ""), 74, 350);
  ctx.fillStyle = "#FF7A59"; ctx.font = "600 34px " + MONO; ctx.fillText(fit(ctx, d.refused + " refused" + (d.refusedLoops ? " · " + d.refusedLoops + " loop" + (d.refusedLoops === 1 ? "" : "s") + " cut" : ""), 620), 74, 420);
  ctx.fillStyle = "#E8F2F8"; ctx.font = "500 30px " + MONO; ctx.fillText(fit(ctx, d.leaked + " leaked · " + d.cleanWaves + " clean wave" + (d.cleanWaves === 1 ? "" : "s"), 620), 74, 468);
  const who = (d.name || "") + (d.handle ? " · @" + d.handle.replace(/^@/, "") : "");
  if (who) { ctx.fillStyle = "#72DCFF"; ctx.font = "600 34px " + SANS; ctx.fillText(fit(ctx, who, 620), 74, 530); }
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 26px " + SANS; ctx.fillText("Can you hold the door? Same arena for everyone today.", 74, 585);
  ctx.fillStyle = "#18BFFF"; ctx.font = "600 28px " + MONO; ctx.fillText("sable.primecircle.cloud/#play", 74, 630);
  return canvas;
}

export function wireShare(canvas, d, els) {
  const text = shareText(d);
  if (els.x) els.x.href = "https://x.com/intent/post?text=" + encodeURIComponent(text);
  const toBlob = () => new Promise((res) => canvas.toBlob(res, "image/png"));
  if (els.save) {
    els.save.onclick = async (e) => { e.preventDefault(); const b = await toBlob(); if (!b) return; const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "gatekeeper-" + (d.score || 0) + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); };
  }
  if (els.share) {
    const can = typeof navigator.canShare === "function";
    els.share.hidden = !can;
    els.share.onclick = async () => {
      const b = await toBlob(); if (!b) return;
      const file = new File([b], "gatekeeper.png", { type: "image/png" });
      try {
        if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Gatekeeper", text });
        else await navigator.share({ title: "Gatekeeper", text, url: "https://sable.primecircle.cloud/#play" });
      } catch { /* the visitor closed the sheet */ }
    };
  }
}
