// The page shell shared by the reading room (build-notes.mjs) and the
// listening room (build-tracks.mjs): the escaping and inline-markdown helpers,
// the small markdown renderer, the front matter parser, the date formatter
// and the CSS of a standalone dark page in the Observatory's look.
// Moved out of build-notes.mjs on 2026-09-12 without changing a byte of it.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/(^|[\s(])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<)]*)/gi, (m, pre, url) => `${pre}<a href="${url.startsWith("http") ? url : "https://" + url}" rel="noopener">${url}</a>`);
  return s;
}
function md2html(md) {
  const lines = md.split(/\r?\n/);
  const outLines = [];
  let para = [], list = null;
  const flushPara = () => { if (para.length) { outLines.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { outLines.push(`</${list}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { flushPara(); flushList(); const l = Math.min(6, m[1].length + 1); outLines.push(`<h${l}>${inline(m[2])}</h${l}>`); continue; }
    if (/^---+$/.test(line)) { flushPara(); flushList(); outLines.push("<hr>"); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { flushPara(); if (list !== "ul") { flushList(); outLines.push("<ul>"); list = "ul"; } outLines.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) { flushPara(); if (list !== "ol") { flushList(); outLines.push("<ol>"); list = "ol"; } outLines.push(`<li>${inline(m[1])}</li>`); continue; }
    if (list && /^\s{2,}\S/.test(raw)) { outLines[outLines.length - 1] = outLines[outLines.length - 1].replace(/<\/li>$/, " " + inline(line.trim()) + "</li>"); continue; }
    flushList(); para.push(line.trim());
  }
  flushPara(); flushList();
  return outLines.join("\n");
}
function frontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("no front matter");
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) { const k = line.match(/^([a-z]+):\s*(.*)$/); if (k) meta[k[1]] = k[2].trim(); }
  return { meta, body: m[2] };
}
function pretty(d) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); if (!m) return d; const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; return `${parseInt(m[3], 10)} ${M[parseInt(m[2], 10) - 1]} ${m[1]}`; }

const CSS = `
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/ibm-plex-mono-400.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/ibm-plex-mono-500.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:600;font-display:swap;src:url(/fonts/ibm-plex-mono-600.woff2) format("woff2")}
:root{--void:#05070A;--ink:#0A1118;--text:#E8F2F8;--dim:#8FA3B0;--dim2:#4C6070;--cyan:#18BFFF;--cyan-soft:#72DCFF;--moon:#FF7A59;--edge:rgba(114,220,255,.14);--edge2:rgba(114,220,255,.28);
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;--mono:"IBM Plex Mono","SF Mono","Roboto Mono",ui-monospace,monospace}
*{box-sizing:border-box}
html{background:var(--void)}
body{margin:0;background:radial-gradient(1200px 700px at 50% -10%,#0E1C28 0%,var(--ink) 45%,var(--void) 100%);color:var(--text);font-family:var(--sans);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--cyan-soft);overflow-wrap:anywhere} a:hover{color:var(--cyan)}
.paper{overflow-wrap:anywhere}
.top{display:flex;align-items:center;gap:18px;padding:18px 28px;border-bottom:1px solid var(--edge);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.top .brand{color:var(--text);text-decoration:none;letter-spacing:.24em;font-weight:600} .top .brand span{color:var(--cyan)}
.top .back{margin-left:auto;color:var(--cyan-soft);text-decoration:none;white-space:nowrap} .top .back:hover{text-decoration:underline}
.paper{max-width:76ch;margin:0 auto;padding:48px 28px 64px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--cyan);margin-bottom:18px}
h1{font-size:clamp(28px,4.2vw,40px);line-height:1.15;margin:0 0 22px;letter-spacing:-.01em}
h3{font-size:22px;margin:40px 0 12px;padding-top:22px;border-top:1px solid var(--edge)}
h4{font-size:18px;margin:26px 0 8px}
p{margin:0 0 16px}
.paper > p:first-of-type{color:var(--dim);font-size:15px}
.paper > p:first-of-type em{font-style:normal}
ul,ol{padding-left:24px;margin:0 0 18px} li{margin:0 0 8px} li::marker{color:var(--cyan);font-family:var(--mono)}
strong{color:var(--text)}
code{font-family:var(--mono);font-size:.85em;background:rgba(114,220,255,.08);border:1px solid var(--edge);border-radius:4px;padding:1px 5px;word-break:break-all}
hr{border:0;border-top:1px solid var(--edge);margin:32px 0}
.paper h3:last-of-type ~ ul{font-size:14px;color:var(--dim)} .paper h3:last-of-type ~ ul a{word-break:break-all}
.acts{display:flex;gap:12px;flex-wrap:wrap;margin:36px 0 0}
.pill{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;padding:12px 22px;border-radius:999px;border:1px solid var(--edge2);color:var(--text);background:rgba(5,7,10,.5);text-decoration:none}
.pill.fill{background:var(--cyan);color:#04121A;border-color:var(--cyan);font-weight:600} .pill:hover{border-color:var(--cyan-soft);text-decoration:none}
.foot{max-width:76ch;margin:0 auto;padding:22px 28px 48px;border-top:1px solid var(--edge);font-family:var(--mono);font-size:11.5px;color:var(--dim);line-height:1.7}
@media (max-width:640px){.top{padding:14px 16px;gap:10px;font-size:10px}.top .sub{display:none}.paper{padding:32px 18px 48px}body{font-size:16px}}
`;

export { esc, inline, md2html, frontMatter, pretty, CSS };
