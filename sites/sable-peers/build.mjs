// Wraps the artifact fragment (sable-peers.html: <title>, <link>, <style>, body
// content) into a complete standalone document for the live site, with the
// social-sharing meta tags the artifact host adds for us but nginx does not.
//
//   node build.mjs <path-to-fragment>   -> writes site/index.html
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src) { console.error("usage: node build.mjs <fragment.html>"); process.exit(1); }
const frag = readFileSync(src, "utf8");

const title = (frag.match(/<title>([^<]*)<\/title>/) || [, "Sable Among Peers"])[1];
const styleEnd = frag.indexOf("</style>");
if (styleEnd < 0) { console.error("no </style> in fragment"); process.exit(1); }
const head = frag.slice(0, styleEnd + "</style>".length).replace(/<title>[^<]*<\/title>\s*/, "");
let body = frag.slice(styleEnd + "</style>".length);

// The drifter in the background: Sable's robot when site/robot.png exists,
// otherwise Sable's moon mark. Decided here so the page never probes for a
// file and never logs a 404.
const drifter = existsSync(join(here, "site", "robot.png")) ? "robot.png" : "sable-mark.svg";
body = body.replace("'__DRIFTER__'", `'${drifter}'`);
console.log("drifter:", drifter);

// Content Security Policy without 'unsafe-inline' for scripts: every inline
// <script> block is lifted out of the page, in order, into site/app.js and
// loaded with defer. The artifact copy keeps its inline scripts (its host
// applies its own policy); only the live site is built this way.
const scripts = [];
body = body.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => { scripts.push(code.trim()); return ""; });
const appJs = scripts.map((s, i) => `/* block ${i + 1} */\n${s}`).join("\n\n");
body = body.trimEnd() + `\n<script src="app.js" defer></script>\n`;
console.log("scripts lifted into app.js:", scripts.length);

// Fonts served from this host, not from Google: no third-party request on
// page load. The woff2 files sit in site/fonts (latin subset, OFL licence).
const fontCss = `<style>
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:400;font-display:swap;src:url(fonts/ibm-plex-mono-400.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:500;font-display:swap;src:url(fonts/ibm-plex-mono-500.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-style:normal;font-weight:600;font-display:swap;src:url(fonts/ibm-plex-mono-600.woff2) format("woff2")}
</style>`;
const headLocal = existsSync(join(here, "site", "fonts", "ibm-plex-mono-400.woff2"))
  ? head.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/, fontCss + "\n")
  : head;
if (headLocal === head) console.log("fonts: Google (no local woff2 found)"); else console.log("fonts: self-hosted");

const url = "https://sable.primecircle.cloud/";
const desc = "An independent observatory of Sable Network: explained in plain words, a working model of the door you can try, a receipt verifier that runs in your browser, live status, the whitepaper watched hourly, and a sourced comparison against eight peers. By PrimeCircle, not run by Sable.";

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PrimeCircle">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}og.png">
<meta property="og:image:width" content="1320">
<meta property="og:image:height" content="900">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@0PTIMUS_ONE">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${url}og.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Observatory">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#05070A">
${headLocal}
</head>
<body>
${body}
</body>
</html>
`;

mkdirSync(join(here, "site"), { recursive: true });
writeFileSync(join(here, "site", "index.html"), doc);
writeFileSync(join(here, "site", "app.js"), appJs + "\n");
console.log("wrote site/index.html", doc.length, "bytes; site/app.js", appJs.length, "bytes; title:", title);
