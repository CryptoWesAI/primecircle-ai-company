// The winner's page for a Gatekeeper contest. Everything on the page is
// rendered from the DATA object below: fill it in after the contest, set
// final to true, and the preview ribbon disappears. No network, no board
// call: a finished contest must not change when the board moves on.

const DATA = {
  final: false, // false shows the preview ribbon; true after the standings are frozen
  contest: {
    start: "2026-09-09",            // first UTC day that counted
    end: "2026-09-15",              // last UTC day that counted
    frozenAt: "2026-09-15T23:59:59Z",
    verified: "hash",               // "replay" once the board replays input logs; "hash" while it stores only the log hash
  },
  winner: {
    name: "0PTIMUS_ONE",            // sample: the board's top row while the contest is still to come
    handle: "0PTIMUS_ONE",
    score: 9830,
    wave: 6,
    duration_ms: 113533,
    refused: 48, loops: 9, leaked: 3, cleanWaves: 4, receipts: 102,
    day: "2026-09-07",              // the arena (UTC day) the winning run was played in
  },
  prizes: [                          // as announced; keep the wording of the announcement
    "Name on this page for good, the winner's card, and a post from PrimeCircle. [amount] SABL.",
    "Name on this page, and a post. [amount] SABL.",
    "Name on this page, and a post. [amount] SABL.",
  ],
  standings: [
    { name: "0PTIMUS_ONE", handle: "0PTIMUS_ONE", score: 9830, wave: 6, duration_ms: 113533, day: "2026-09-07" },
    { name: "AG ULTRA MAGNUS", handle: "_ULTRA__MAGNUS", score: 4480, wave: 4, duration_ms: 77800, day: "2026-09-07" },
    { name: "Third", handle: "", score: 3120, wave: 4, duration_ms: 71000, day: "2026-09-06" },
  ],
};

const $ = (id) => document.getElementById(id);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONO = '"IBM Plex Mono", "SF Mono", Consolas, ui-monospace, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const num = (n) => Number(n || 0).toLocaleString("en-US");
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
function dayLabel(iso, withYear) { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return ""; return parseInt(m[3], 10) + " " + MON[parseInt(m[2], 10) - 1] + (withYear ? " " + m[1] : ""); }
function span(a, b) { const ma = a.slice(0, 7), mb = b.slice(0, 7); return ma === mb ? parseInt(a.slice(8), 10) + " to " + dayLabel(b, true) : dayLabel(a) + " to " + dayLabel(b, true); }
function clock(ms) { const s = Math.floor(ms / 1000); return s >= 60 ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") : s + " s"; }
function fit(ctx, text, max) { while (text.length > 4 && ctx.measureText(text).width > max) text = text.slice(0, -2) + "…"; return text; }
function seeded(n) { let a = n | 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const handleOf = (h) => String(h || "").replace(/^@/, "");

/* words */
const W = DATA.winner, C = DATA.contest;
$("ribbon").hidden = !!DATA.final;
$("window").textContent = "Gatekeeper · contest week · " + span(C.start, C.end);
$("name").textContent = W.name;
$("score").textContent = num(W.score);
$("under").textContent = "points · wave " + W.wave + " · " + clock(W.duration_ms) + " at the door · arena " + dayLabel(W.day, true);
$("refused").textContent = plural(W.refused, "broken seal") + " refused · " + plural(W.loops, "loop") + " cut";
$("leaked").textContent = plural(W.leaked, "request") + " leaked · " + plural(W.cleanWaves, "clean wave") + " · " + plural(W.receipts, "receipt");
const who = $("who");
if (W.handle) { const a = document.createElement("a"); a.className = "pill"; a.href = "https://x.com/" + encodeURIComponent(handleOf(W.handle)); a.target = "_blank"; a.rel = "noopener"; a.textContent = "@" + handleOf(W.handle); who.appendChild(a); }
const back = document.createElement("a"); back.className = "pill"; back.href = "./#play"; back.textContent = "Play the arena"; who.appendChild(back);

/* facts */
const best = DATA.standings.length ? DATA.standings[0] : W;
const runnerUp = DATA.standings[1];
const margin = runnerUp ? W.score - runnerUp.score : 0;
$("facts").innerHTML = [
  ["margin", num(margin), "cyan", runnerUp ? "points ahead of " + esc(runnerUp.name) + " in second place." : "no second place recorded."],
  ["refused", num(W.refused + W.loops), "moon", "broken seals and loops turned away before the door. Only refusals build the streak."],
  ["held for", clock(W.duration_ms), "ok", "the length of the winning run, wave " + W.wave + " reached. A run ends when the budget is gone."],
].map(([k, v, cls, s]) => '<div class="fact"><span class="k">' + k + '</span><span class="v ' + cls + '">' + v + '</span><span class="s">' + s + "</span></div>").join("");

/* why */
$("why").innerHTML = "Gatekeeper rewards the same thing Sable's door does. A sealed request passes and becomes a receipt, but a receipt scores once and builds nothing. A <b>refusal</b> builds the streak, the streak raises the multiplier, and a wave held without a single leak pays more than any receipt. " +
  esc(W.name) + " won by turning away " + num(W.refused + W.loops) + " requests and letting " + num(W.receipts) + " through, with " + plural(W.leaked, "leak") + " in " + clock(W.duration_ms) + ". <b>That is the whole lesson:</b> a door that only measures throughput teaches the opposite of what a budget is for.";

/* podium */
$("podium").innerHTML = [0, 1, 2].map((i) => {
  const r = DATA.standings[i], place = ["1st · held the door", "2nd", "3rd"][i];
  return '<div class="fact' + (i === 0 ? " p1" : "") + '"><span class="k">' + place + "</span>" +
    (r ? '<span class="nm">' + esc(r.name) + (r.handle ? '<a href="https://x.com/' + encodeURIComponent(handleOf(r.handle)) + '" target="_blank" rel="noopener">@' + esc(handleOf(r.handle)) + "</a>" : "") + "</span><span class=\"s\">" + num(r.score) + " points · wave " + r.wave + " · " + clock(r.duration_ms) + "</span>" : '<span class="nm">no run recorded</span>') +
    (DATA.prizes[i] ? '<span class="pz">' + esc(DATA.prizes[i]) + "</span>" : "") + "</div>";
}).join("");

/* standings */
$("frozen").textContent = "Highest single run per player between " + dayLabel(C.start, true) + " and " + dayLabel(C.end, true) + " UTC, frozen at " + C.frozenAt.replace("T", " ").replace("Z", " UTC") + ". Later runs do not move this table.";
$("board").querySelector("tbody").innerHTML = DATA.standings.map((r, i) =>
  "<tr" + (i === 0 ? ' class="win"' : "") + '><td class="n">' + (i + 1) + '</td><td class="nm">' + esc(r.name) + '</td><td class="h">' + (r.handle ? '<a href="https://x.com/' + encodeURIComponent(handleOf(r.handle)) + '" target="_blank" rel="noopener">@' + esc(handleOf(r.handle)) + "</a>" : "") + '</td><td class="sc">' + num(r.score) + "</td><td>" + r.wave + "</td><td>" + clock(r.duration_ms) + "</td><td>" + dayLabel(r.day) + "</td></tr>").join("") || '<tr><td colspan="7">no runs recorded</td></tr>';
$("verified").textContent = C.verified === "replay"
  ? "Every run on this table was replayed by the board from its input log before it counted: the same seed and the same inputs at the same ticks give the same score, or the run is refused."
  : "Runs are checked for plausibility by the board and stored with a hash of their input log. The winning run was reviewed by hand before this page was published.";

/* the card */
let robot = null;
function loadRobot() { return new Promise((res) => { const im = new Image(); im.onload = () => { robot = im; res(im); }; im.onerror = () => res(null); im.src = "robot.png"; }); }
async function drawCard(canvas) {
  const CW = 1200, CH = 675; canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext("2d");
  try { await Promise.all([document.fonts.load("600 150px " + MONO), document.fonts.load("500 28px " + MONO)]); } catch { /* fallback fonts */ }
  await loadRobot();
  ctx.fillStyle = "#05070A"; ctx.fillRect(0, 0, CW, CH);
  const g = ctx.createRadialGradient(880, 340, 20, 880, 340, 520); g.addColorStop(0, "rgba(24,191,255,.18)"); g.addColorStop(1, "rgba(5,7,10,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  const rnd = seeded(W.score * 7919 + W.wave);
  for (let i = 0; i < 160; i++) { const x = rnd() * CW, y = rnd() * CH, r = rnd() * 1.6 + 0.3; ctx.fillStyle = "rgba(232,242,248," + (0.25 + rnd() * 0.5).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  const cx = 905, cy = 345, R = 205;
  ctx.save(); ctx.shadowColor = "rgba(24,191,255,.9)"; ctx.shadowBlur = 44; ctx.strokeStyle = "#18BFFF"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = "rgba(114,220,255,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R - 26, 0, Math.PI * 2); ctx.stroke();
  const caps = [[cx - 60, cy - 40, 1], [cx + 40, cy + 20, 1], [cx - 10, cy + 90, 1], [cx + 280, cy - 150, 0], [cx - 250, cy + 170, 0], [cx + 250, cy + 190, 0], [cx - 270, cy - 120, 0]];
  for (const [x, y, okk] of caps) {
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = "#18242F"; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = okk ? "#72DCFF" : "#FF7A59"; ctx.beginPath(); ctx.arc(x, y, 18, 0, okk ? Math.PI * 2 : Math.PI * 1.55); ctx.stroke();
    if (!okk) { ctx.strokeStyle = "rgba(255,122,89,.5)"; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); ctx.lineTo(x + Math.cos(a) * 34, y + Math.sin(a) * 34); ctx.stroke(); } }
  }
  if (robot) { const h = 230, w = robot.width * (h / robot.height); ctx.globalAlpha = 0.9; ctx.drawImage(robot, CW - w - 40, CH - h - 28, w, h); ctx.globalAlpha = 1; }
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = "#18BFFF"; ctx.font = "500 22px " + MONO; ctx.letterSpacing = "4px"; ctx.fillText("PRIME CIRCLE · SABLE OBSERVATORY", 70, 82);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 24px " + MONO; ctx.letterSpacing = "3px"; ctx.fillText(fit(ctx, ("GATEKEEPER · CONTEST " + span(C.start, C.end)).toUpperCase(), 1040), 70, 122);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#72DCFF"; ctx.font = "600 40px " + SANS; ctx.fillText(fit(ctx, W.name, 640), 70, 200);
  ctx.fillStyle = "#E8F2F8"; ctx.font = "600 150px " + MONO; ctx.fillText(num(W.score), 62, 340);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 30px " + MONO; ctx.fillText("points · wave " + W.wave + " · " + clock(W.duration_ms) + " at the door", 74, 392);
  ctx.fillStyle = "#FF7A59"; ctx.font = "600 34px " + MONO; ctx.fillText(fit(ctx, (W.refused + W.loops) + " refused · " + plural(W.leaked, "leak"), 620), 74, 460);
  ctx.fillStyle = "#E8F2F8"; ctx.font = "700 56px " + SANS; ctx.fillText("Held the door.", 70, 545);
  ctx.fillStyle = "#8FA3B0"; ctx.font = "500 24px " + SANS; ctx.fillText("sable.primecircle.cloud · the refusal is the feature", 74, 600);
}

const canvas = $("card");
const text = W.name + " held the door: " + num(W.score) + " points in wave " + W.wave + ", " + (W.refused + W.loops) + " refused, " + plural(W.leaked, "leak") + ". Winner of the Gatekeeper contest on the Sable Observatory.";
$("x-btn").href = "https://x.com/intent/post?text=" + encodeURIComponent(text + " https://sable.primecircle.cloud/winner.html");
drawCard(canvas).then(() => {
  const toBlob = () => new Promise((res) => canvas.toBlob(res, "image/png"));
  $("save-btn").addEventListener("click", async () => { const b = await toBlob(); if (!b) return; const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "gatekeeper-winner.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); });
  if (navigator.share) {
    toBlob().then((b) => { if (!b) return; const f = new File([b], "gatekeeper-winner.png", { type: "image/png" }); const withFile = navigator.canShare && navigator.canShare({ files: [f] }); const btn = $("share-btn"); btn.hidden = false; btn.addEventListener("click", () => navigator.share(withFile ? { files: [f], text } : { text, url: location.href }).catch(() => {})); });
  }
});

/* the sky: still stars, a slow drift, off when motion is reduced */
(function () {
  const cv = $("sky"); if (!cv) return; const ctx = cv.getContext("2d"); let stars = [], w = 0, h = 0, t0 = performance.now();
  function size() { w = cv.width = innerWidth; h = cv.height = innerHeight; const rnd = seeded(91); stars = Array.from({ length: Math.round(w * h / 9000) }, () => ({ x: rnd() * w, y: rnd() * h, r: rnd() * 1.3 + 0.2, a: 0.2 + rnd() * 0.5, p: rnd() * 6.3 })); }
  function frame(now) { const t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h); for (const s of stars) { ctx.globalAlpha = s.a * (0.75 + 0.25 * Math.sin(t * 0.6 + s.p)); ctx.fillStyle = "#E8F2F8"; ctx.beginPath(); ctx.arc((s.x + t * 2) % w, s.y, s.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; requestAnimationFrame(frame); }
  addEventListener("resize", size); size(); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, w, h); for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillStyle = "#E8F2F8"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); } }
})();
