// Renders article.md to article.pdf (A4, print stylesheet in the Observatory's look, page numbers).
//   node render-pdf.mjs
// The markdown subset used by the article is converted here (headings, paragraphs, lists,
// bold, italics, inline code, links, rules); no markdown library is installed in this workspace.
import puppeteer from "puppeteer-core";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
if (!exe) throw new Error("Chrome not found");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // bare domains and urls in the sources list become links
  s = s.replace(/(^|[\s(])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<)]*)/gi, (m, pre, url) => `${pre}<a href="${url.startsWith("http") ? url : "https://" + url}">${url}</a>`);
  return s;
}
function md2html(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let para = [], list = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { flushPara(); flushList(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if (/^---+$/.test(line)) { flushPara(); flushList(); out.push("<hr>"); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { flushPara(); if (list !== "ul") { flushList(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) { flushPara(); if (list !== "ol") { flushList(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    if (list && /^\s{2,}\S/.test(raw)) { out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, " " + inline(line.trim()) + "</li>"); continue; }
    flushList(); para.push(line.trim());
  }
  flushPara(); flushList();
  return out.join("\n");
}

const md = readFileSync(join(here, "article.md"), "utf8");
const body = md2html(md);
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Should Sable bridge to Robinhood Chain?</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --ink: #0A1118; --cyan: #0E8FBF; --dim: #5B6B78; --line: #D6DEE4; --soft: #EEF6FA; }
  html, body { margin: 0; background: #fff; color: var(--ink); font-family: "IBM Plex Sans", Inter, system-ui, sans-serif; font-size: 10.6pt; line-height: 1.52; }
  .eyebrow { font-family: "IBM Plex Mono", Consolas, monospace; font-size: 8.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--cyan); margin: 0 0 6mm; }
  h1 { font-size: 24pt; line-height: 1.12; font-weight: 600; margin: 0 0 4mm; letter-spacing: -0.01em; }
  h2 { font-size: 14pt; font-weight: 600; margin: 8mm 0 2.5mm; padding-top: 3mm; border-top: 1px solid var(--line); break-after: avoid; }
  h3 { font-size: 11.5pt; font-weight: 600; margin: 5mm 0 2mm; break-after: avoid; }
  p { margin: 0 0 3mm; }
  p:first-of-type em { color: var(--dim); }
  ul, ol { margin: 0 0 3.5mm; padding-left: 6mm; }
  li { margin: 0 0 1.6mm; break-inside: avoid; }
  li::marker { color: var(--cyan); font-family: "IBM Plex Mono", Consolas, monospace; font-size: 9.5pt; }
  strong { font-weight: 600; }
  code { font-family: "IBM Plex Mono", Consolas, monospace; font-size: 9pt; background: var(--soft); padding: 0 3px; border-radius: 3px; word-break: break-all; }
  a { color: var(--cyan); text-decoration: none; word-break: break-all; }
  hr { border: 0; border-top: 1px solid var(--line); margin: 6mm 0; }
  .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid var(--ink); padding-bottom: 3mm; margin-bottom: 7mm; font-family: "IBM Plex Mono", Consolas, monospace; font-size: 8.5pt; color: var(--dim); }
  .head b { color: var(--cyan); letter-spacing: 0.16em; }
  .sources p, .sources li { font-size: 9pt; color: var(--dim); }
  h2:last-of-type ~ ul li { font-size: 9pt; color: var(--dim); }
  @page { size: A4; }
</style></head>
<body>
<div class="head"><span><b>PRIME CIRCLE</b>&nbsp;&nbsp;Sable Observatory · independent</span><span>sable.primecircle.cloud · 10 Sep 2026</span></div>
<div class="eyebrow">Analysis · the Robinhood Chain poll</div>
${body}
<script>document.fonts.ready.then(() => { window.__ready = true; });</script>
</body></html>`;
writeFileSync(join(here, "article.html"), html);

const b = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await b.newPage();
await page.goto(pathToFileURL(join(here, "article.html")).href, { waitUntil: "networkidle0" });
await page.waitForFunction(() => window.__ready === true && document.fonts.status === "loaded", { timeout: 20000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 300));
if (process.env.SHOT) { await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 }); await page.screenshot({ path: process.env.SHOT, fullPage: true }); }
const foot =`<div style="width:100%;font-family:'IBM Plex Mono',Consolas,monospace;font-size:7.5pt;color:#5B6B78;padding:0 16mm;display:flex;justify-content:space-between;">
  <span>Should Sable bridge to Robinhood Chain? · independent analysis · the author holds SABL · 10 Sep 2026</span><span>page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;
await page.pdf({ path: join(here, "article.pdf"), format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: foot, margin: { top: "16mm", right: "17mm", bottom: "18mm", left: "17mm" } });
await b.close();
console.log("rendered article.pdf in", here);
