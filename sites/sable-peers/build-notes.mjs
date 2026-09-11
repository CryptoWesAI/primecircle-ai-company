// The reading room: turns notes/*.md into site/notes/<slug>.html (one dark page per piece,
// in the Observatory's look, no inline scripts so the CSP holds), copies each piece's PDF,
// and writes site/notes/index.json for the list on the page.
//
//   node build-notes.mjs            (run before build.mjs and deploy-to-vps.sh)
//
// A note is a markdown file with a small front matter block:
//   ---
//   title: ...
//   date: 2026-09-10
//   slug: robinhood-chain-bridge         (letters, digits, dashes; becomes /notes/<slug>.html)
//   summary: one or two sentences for the list
//   pdf: 2026-09-10-robinhood-chain-bridge.pdf   (optional, sits next to the .md)
//   ---
// followed by the body without the H1 (the title is rendered from the front matter).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, inline, md2html, frontMatter, pretty, CSS } from "./page-shell.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "notes");
const out = join(here, "site", "notes");
mkdirSync(out, { recursive: true });

const index = [];
for (const file of readdirSync(src).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
  const { meta, body } = frontMatter(readFileSync(join(src, file), "utf8"));
  for (const k of ["title", "date", "slug", "summary"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  if (!/^[a-z0-9-]+$/.test(meta.slug)) throw new Error(`${file}: bad slug`);
  const words = body.split(/\s+/).filter(Boolean).length;
  const pdf = meta.pdf && existsSync(join(src, meta.pdf)) ? meta.pdf : "";
  if (pdf) copyFileSync(join(src, pdf), join(out, pdf));
  const url = `https://sable.primecircle.cloud/notes/${meta.slug}.html`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)} · Sable Observatory</title>
<meta name="description" content="${esc(meta.summary)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Sable Observatory">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.summary)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://sable.primecircle.cloud/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@0PTIMUS_ONE">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#05070A">
<style>${CSS}</style>
</head>
<body>
<header class="top"><a class="brand" href="/">PRIME <span>CIRCLE</span></a><span class="sub">Sable Observatory · independent</span><a class="back" href="/#reading">← The reading room</a></header>
<main class="paper">
<div class="eyebrow">The reading room · ${pretty(meta.date)}</div>
<h1>${inline(meta.title)}</h1>
${md2html(body)}
<div class="acts"><a class="pill fill" href="/#reading">Back to the reading room</a>${pdf ? `<a class="pill" href="/notes/${pdf}" download>Download the PDF</a>` : ""}</div>
</main>
<footer class="foot">Independent page by a community member. Not run by Sable Network. The author holds SABL. Nothing here is investment advice. Corrections: reply on X to @0PTIMUS_ONE or in Sable's Telegram; they are logged on the page.</footer>
</body>
</html>
`;
  writeFileSync(join(out, `${meta.slug}.html`), html);
  index.push({ slug: meta.slug, title: meta.title, date: meta.date, summary: meta.summary, pdf, words });
  console.log("note:", meta.slug, words, "words", pdf ? "+ pdf" : "");
}
index.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(join(out, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log("wrote site/notes/index.json with", index.length, "piece(s)");
