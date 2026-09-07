// The day's contest card: the standings, the countdown, today's sentence from the
// whitepaper and the gateway's state, drawn as one 1200x675 image in the site's
// style. Nothing posts by itself: a person presses Share, Save or Post on X.
const W = 1200, H = 675;
const MONO = '"IBM Plex Mono", "SF Mono", Consolas, ui-monospace, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let robot = null, robotTried = false;
function loadRobot() {
  if (robotTried) return Promise.resolve(robot);
  robotTried = true;
  return new Promise((res) => { const im = new Image(); im.onload = () => { robot = im; res(im); }; im.onerror = () => res(null); im.src = "robot.png"; });
}
function seeded(n) { let a = n | 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function fit(ctx, text, max) { while (text.length > 4 && ctx.measureText(text).width > max) text = text.slice(0, -2) + "…"; return text; }
function wrap(ctx, text, max, lines) {
  const words = String(text).split(/\s+/), out = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; if (out.length === lines) break; }
  if (out.length < lines && line) out.push(line);
  if (out.length === lines && words.join(" ").length > out.join(" ").length) out[lines - 1] = fit(ctx, out[lines - 1] + "…", max);
  return out;
}
function fmtDay(iso) { const d = new Date(iso + "T00:00:00Z"); return d.getUTCDate() + " " + MON[d.getUTCMonth()]; }
function left(ms) { const m = Math.max(0, Math.round(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60; return d ? d + " d " + h + " h" : h ? h + " h " + mm + " min" : mm + " min"; }
const num = (n) => Number(n || 0).toLocaleString("en-US");

export async function gather(o) {
  const contest = o.contest;
  const top = await fetch(o.board + "/top?period=contest&limit=5", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { rows: [] })).catch(() => ({ rows: [] }));
  const rows = (top.rows || []).slice(0, 5);
  const now = Date.now(), start = Date.parse(contest.start + "T00:00:00Z"), end = Date.parse(contest.end + "T23:59:59Z");
  const total = Math.round((Date.parse(contest.end + "T00:00:00Z") - start) / 86400000) + 1;
  const dayN = Math.min(total, Math.max(1, Math.floor((now - start) / 86400000) + 1));
  const O = window.SABLE_ORRERY, td = O && typeof O.today === "function" ? O.today() : null;
  const q = document.getElementById("orr-today-q");
  const sentence = td && q ? q.textContent.trim() : "";
  const sec = td && O.sections ? O.sections()[td.i] : null;
  const gw = ((document.getElementById("st-gw") || {}).textContent || "").trim(), conf = ((document.getElementById("st-conf") || {}).textContent || "").trim().split(" · ")[0];
  return { rows, dayN, total, ends: now > end ? "over" : "ends in " + left(end - now), span: fmtDay(contest.start) + " to " + fmtDay(contest.end), sentence, secN: sec ? sec.n : "", gw, conf };
}

export async function draw(canvas, d) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  try { await Promise.all([document.fonts.load("600 72px " + MONO), document.fonts.load("500 24px " + MONO)]); } catch { /* fallback fonts */ }
  const rob = await loadRobot();
  ctx.fillStyle = "#05070A"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(900, 330, 20, 900, 330, 520); g.addColorStop(0, "rgba(24,191,255,.16)"); g.addColorStop(1, "rgba(5,7,10,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rnd = seeded(d.dayN * 7919 + 17);
  for (let i = 0; i < 150; i++) { const x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.3; ctx.fillStyle = "rgba(232,242,248," + (0.25 + rnd() * 0.5).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  // the door, right side, further out so the standings have room
  const cx = 960, cy = 300, R = 170;
  ctx.save(); ctx.shadowColor = "rgba(24,191,255,.9)"; ctx.shadowBlur = 36; ctx.strokeStyle = "#18BFFF"; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = "rgba(114,220,255,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R - 22, 0, Math.PI * 2); ctx.stroke();
  for (const [x, y, okk] of [[cx - 50, cy - 30, 1], [cx + 35, cy + 25, 1], [cx + 215, cy - 130, 0], [cx - 205, cy + 150, 0]]) {
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = "#18242F"; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = okk ? "#72DCFF" : "#FF7A59"; ctx.beginPath(); ctx.arc(x, y, 16, 0, okk ? Math.PI * 2 : Math.PI * 1.55); ctx.stroke();
  }
  if (rob) { const h = 190, w = rob.width * (h / rob.height); ctx.globalAlpha = 0.9; ctx.drawImage(rob, W - w - 36, H - h - 24, w, h); ctx.globalAlpha = 1; }
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = "#18BFFF"; ctx.font = "500 22px " + MONO; ctx.letterSpacing = "4px"; ctx.fillText("PRIME CIRCLE · SABLE OBSERVATORY", 70, 78);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 22px " + MONO; ctx.letterSpacing = "3px"; ctx.fillText(("GATEKEEPER · CONTEST · " + d.span + " UTC").toUpperCase(), 70, 114);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#E8F2F8"; ctx.font = "700 66px " + SANS; ctx.fillText("Day " + d.dayN + " of " + d.total, 66, 190);
  ctx.fillStyle = "#E0BE72"; ctx.font = "600 26px " + MONO; ctx.fillText(d.ends, 70, 232);
  // standings
  const colors = ["#18BFFF", "#E8F2F8", "#FF7A59"];
  let y = 285;
  if (!d.rows.length) { ctx.fillStyle = "#8FA3B0"; ctx.font = "500 24px " + SANS; ctx.fillText("No runs with a handle on the board yet. Be the first.", 70, y + 10); y += 40; }
  d.rows.forEach((r, i) => {
    const c = colors[i] || "#4C6070";
    ctx.beginPath(); ctx.arc(86, y - 9, 15, 0, Math.PI * 2); ctx.fillStyle = i < 3 ? c : "#18242F"; ctx.fill();
    if (i === 0) { ctx.save(); ctx.shadowColor = "rgba(24,191,255,.9)"; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(86, y - 9, 15, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.restore(); }
    ctx.fillStyle = i < 3 ? (i === 2 ? "#1A0A05" : "#04121A") : "#8FA3B0"; ctx.font = "600 15px " + MONO; ctx.textAlign = "center"; ctx.fillText(String(i + 1), 86, y - 3); ctx.textAlign = "left";
    ctx.fillStyle = i < 3 ? "#E8F2F8" : "#8FA3B0"; ctx.font = (i < 3 ? "600" : "500") + " 26px " + SANS; ctx.fillText(fit(ctx, r.name + (r.handle ? "  @" + r.handle : ""), 430), 116, y);
    ctx.fillStyle = i < 3 ? c : "#8FA3B0"; ctx.font = "600 26px " + MONO; ctx.textAlign = "right"; ctx.fillText(num(r.score), 660, y); ctx.textAlign = "left";
    y += 38;
  });
  // today's sentence
  if (d.sentence) {
    const yy = Math.max(y + 22, 500);
    ctx.fillStyle = "#8FA3B0"; ctx.font = "500 16px " + MONO; ctx.letterSpacing = "3px"; ctx.fillText("TODAY'S SENTENCE" + (d.secN ? " · SECTION " + d.secN : ""), 70, yy); ctx.letterSpacing = "0px";
    ctx.fillStyle = "#E8F2F8"; ctx.font = "italic 500 21px " + SANS;
    wrap(ctx, "“" + d.sentence + "”", 600, 2).forEach((ln, i) => ctx.fillText(ln, 70, yy + 32 + i * 28));
  }
  // the gateway, and the footer
  const ok = /attested|serving/.test(d.conf) && !/failing/.test(d.conf);
  if (d.gw) { ctx.fillStyle = ok ? "#8FD0B8" : "#E0BE72"; ctx.font = "500 19px " + MONO; ctx.fillText(fit(ctx, "Sable right now: gateway " + d.gw + (d.conf ? " · " + d.conf : ""), 640), 70, 618); }
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 19px " + SANS; ctx.fillText("sable.primecircle.cloud/#play · post your card, tag @Sablenetwork", 70, 650);
}

export function text(d) {
  const top = d.rows.slice(0, 3).map((r, i) => (i + 1) + ". " + r.name + " " + num(r.score)).join(" · ");
  return "Gatekeeper contest on the Sable Observatory, day " + d.dayN + " of " + d.total + ". " + (top ? "Standings: " + top + ". " : "") + (d.ends === "over" ? "The window is closed." : "It " + d.ends + ".") + " Play, post your card, tag @Sablenetwork. sable.primecircle.cloud/#play";
}

export function wire(canvas, d, els) {
  const t = text(d);
  if (els.x) els.x.href = "https://x.com/intent/post?text=" + encodeURIComponent(t);
  const toBlob = () => new Promise((res) => canvas.toBlob(res, "image/png"));
  if (els.save) els.save.onclick = async (e) => { e.preventDefault(); const b = await toBlob(); if (!b) return; const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "gatekeeper-contest-day-" + d.dayN + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); };
  if (els.share) {
    const can = typeof navigator.canShare === "function"; els.share.hidden = !can;
    els.share.onclick = async () => { const b = await toBlob(); if (!b) return; const f = new File([b], "gatekeeper-contest.png", { type: "image/png" }); try { if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: "Gatekeeper contest", text: t }); else await navigator.share({ title: "Gatekeeper contest", text: t }); } catch { /* dismissed */ } };
  }
}

export async function open(o) {
  const d = await gather(o);
  await draw(o.canvas, d);
  wire(o.canvas, d, o.els || {});
  return d;
}
