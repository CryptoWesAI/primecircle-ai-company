// The listening room: turns the EP's tracks/*.md and audio/*.mp3 (in
// crypto/content/2026-09-11-sable-whitepaper-ep) into site/tracks/<slug>.html,
// one dark page per track in the Observatory's look: the player, the lyrics
// with every quoted line marked, the sources with sentence ids, the stamp.
// Copies the MP3s next to the pages and writes site/tracks/index.json for the
// list on the page and for the map (planets with a track carry a note).
//
//   node build-tracks.mjs            (run before build.mjs and deploy-to-vps.sh)
//
// The build FAILS when a line listed as a quote is not verbatim in the
// whitepaper text, or is listed but not sung. Same rule as check-quotes.mjs
// in the EP folder, enforced again here so the site can never ship a lyric
// that the paper does not contain.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS, esc, inline, pretty } from "./page-shell.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ep = join(here, "..", "..", "crypto", "content", "2026-09-11-sable-whitepaper-ep");
const watch = join(here, "..", "..", "..", "sable-whitepaper-watch");
const out = join(here, "site", "tracks");
mkdirSync(out, { recursive: true });

const ARTIST = "OG THE MOGI";
const PDF = "https://www.buildsable.com/sable-whitepaper.pdf";
const SITE = "https://sable.primecircle.cloud";

// the whitepaper, as the watcher holds it
const wpTextPath = join(watch, "whitepaper.txt");
if (!existsSync(wpTextPath)) { console.error("whitepaper.txt not found at", wpTextPath, "(the watcher repo must sit next to this one)"); process.exit(1); }
const norm = (s) => String(s).toLowerCase().replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"').replace(/[–—]/g, " ").replace(/[^a-z0-9']+/g, " ").replace(/\s+/g, " ").trim();
const wpText = norm(readFileSync(wpTextPath, "utf8"));
let wp = { cover: "v2.0, August 2026", latest: "2026-09-04", sentence_count: 254, sections: [] };
try { wp = { ...wp, ...JSON.parse(readFileSync(join(watch, "whitepaper.json"), "utf8")) }; } catch (e) { console.warn("whitepaper.json not read, using the fallback stamp"); }
const FALLBACK_TITLES = ["The delegation problem", "The control plane", "The privacy contract", "Architecture", "Metering, budgets & delegation", "Payment: prepaid USDT and x402", "Verifiable receipts", "Confidential execution & attestation", "Sandbox compute", "What is built, and what is not", "Direction: compute for rent", "Threat model & trust boundaries", "Conclusion", "Appendix: API surface"];
const sectionTitle = (n) => (Array.isArray(wp.sections) && wp.sections[n - 1] && wp.sections[n - 1].title) || FALLBACK_TITLES[n - 1] || `Section ${n}`;

function parse(text, file) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: no front matter`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) { const k = line.match(/^([a-z_]+):\s*(.*)$/); if (k) meta[k[1]] = k[2].trim().replace(/^"(.*)"$/, "$1"); }
  const body = m[2];
  const block = (name) => { const parts = body.split(new RegExp(`^## ${name}[^\\n]*\\n`, "m")); return parts[1] ? parts[1].split(/^## /m)[0] : ""; };
  const sources = [], notes = [];
  for (const line of block("Sources").split(/\r?\n/)) {
    const q = line.match(/^- \[(\d\d\.\d\d)\]\s+(.+)$/);
    if (q) sources.push({ id: q[1], text: q[2].trim() });
    else if (line.trim() && !/^Listen for/i.test(line.trim())) notes.push(line.trim());
  }
  return { meta, style: block("Style").trim(), lyrics: block("Lyrics").trim(), sources, notes };
}
function isoDate(d) { let m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d || ""); if (m) return `${m[3]}-${m[2]}-${m[1]}`; m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? m[0] : ""; }
function seconds(file) { try { return Math.round(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }))); } catch (e) { return null; } }
function mmss(s) { return s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : ""; }

function renderLyrics(lyrics, sources, section) {
  const qs = sources.map((s) => norm(s.text));
  return lyrics.split(/\r?\n/).map((line) => {
    if (!line.trim()) return `<span class="gap"></span>`;
    const t = line.match(/^\[([^\]]+)\]$/);
    if (t) return `<span class="tag">${esc(t[1])}</span>`;
    const n = norm(line);
    const q = n.length >= 6 && qs.some((x) => x.includes(n) || n.includes(x));
    return `<span class="line ${q ? "q" : "g"}"${q ? ` title="verbatim, whitepaper section ${section}"` : ""}>${esc(line)}</span>`;
  }).join("\n");
}

const EXTRA_CSS = `
.cover{display:block;width:100%;max-width:360px;height:auto;border-radius:12px;border:1px solid var(--edge);margin:4px 0 22px}
.player{margin:6px 0 30px}.player audio{width:100%;color-scheme:dark}
.legend{font-family:var(--mono);font-size:12px;color:var(--dim);line-height:1.7;margin:8px 0 0}
.lyrics{font-family:var(--mono);font-size:14px;line-height:1.7;margin:14px 0 8px}
.lyrics .tag{display:block;color:var(--cyan);font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin:14px 0 6px}
.lyrics .line{display:block;padding-left:12px;border-left:2px solid transparent}
.lyrics .gap{display:block;height:8px}
.lyrics .q{border-left-color:var(--cyan);color:var(--text)} .lyrics .g{color:var(--dim)}
.sources{font-size:14.5px} .sources li{margin:0 0 10px} .sources .id{font-family:var(--mono);color:var(--cyan);font-size:12px;margin-right:8px}
details{border:1px solid var(--edge);border-radius:10px;padding:12px 16px;margin:22px 0} details p{margin:12px 0 0;font-size:14.5px;color:var(--dim)}
summary{cursor:pointer;font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
`;

const files = readdirSync(join(ep, "tracks")).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const tracks = files.map((f) => ({ file: f, ...parse(readFileSync(join(ep, "tracks", f), "utf8"), f) }));
let failures = 0;
for (const t of tracks) {
  for (const k of ["title", "slug", "track", "section", "planet", "hook", "audio"]) if (!t.meta[k]) throw new Error(`${t.file}: missing ${k}`);
  if (!/^[a-z0-9-]+$/.test(t.meta.slug)) throw new Error(`${t.file}: bad slug`);
  if (!/^[0-9a-z-]+\.mp3$/.test(t.meta.audio)) throw new Error(`${t.file}: bad audio name`);
  if (!existsSync(join(ep, "audio", t.meta.audio))) throw new Error(`${t.file}: audio/${t.meta.audio} is missing`);
  const sung = norm(t.lyrics.replace(/^\[[^\]]+\]\s*$/gm, " "));
  for (const s of t.sources) {
    const q = norm(s.text);
    if (!wpText.includes(q)) { console.error(`FAIL ${t.file} ${s.id} not in the whitepaper: ${s.text.slice(0, 70)}`); failures++; }
    if (!sung.includes(q)) { console.error(`FAIL ${t.file} ${s.id} listed but not sung: ${s.text.slice(0, 70)}`); failures++; }
  }
}
if (failures) { console.error(failures, "quote check failure(s); nothing written"); process.exit(1); }

tracks.sort((a, b) => Number(a.meta.track) - Number(b.meta.track));
const index = [];
tracks.forEach((t, i) => {
  const m = t.meta, n = Number(m.section), title = sectionTitle(n);
  const secs = seconds(join(ep, "audio", m.audio));
  copyFileSync(join(ep, "audio", m.audio), join(out, m.audio));
  // the cover, drawn by covers/render-covers.mjs in the EP folder (1500 px JPEG next to the 3000 px master)
  const coverSrc = join(ep, "covers", "web", `${String(m.track).padStart(2, "0")}-${m.slug}.jpg`);
  const cover = existsSync(coverSrc) ? `${String(m.track).padStart(2, "0")}-${m.slug}.jpg` : "";
  if (cover) copyFileSync(coverSrc, join(out, cover));
  const suno = /^https:\/\/suno\.com\/[A-Za-z0-9/_-]+$/.test(m.suno_url || "") ? m.suno_url : "";
  const generated = isoDate(m.generated);
  const prev = tracks[i - 1], next = tracks[i + 1];
  const url = `${SITE}/tracks/${m.slug}.html`;
  const desc = `Section ${n} of the Sable whitepaper, “${title}”, rapped in its own words. Track ${m.track} of ${tracks.length} from the whitepaper EP by ${ARTIST}.`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)} · Sable Observatory</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="music.song">
<meta property="og:site_name" content="Sable Observatory">
<meta property="og:title" content="${esc(m.title)} · the whitepaper EP">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${cover ? `${SITE}/tracks/${cover}` : `${SITE}/og.png`}">
<meta property="og:audio" content="${SITE}/tracks/${m.audio}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@0PTIMUS_ONE">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#05070A">
<style>${CSS}${EXTRA_CSS}</style>
</head>
<body>
<header class="top"><a class="brand" href="/">PRIME <span>CIRCLE</span></a><span class="sub">Sable Observatory · independent</span><a class="back" href="/#listening">← The listening room</a></header>
<main class="paper">
<div class="eyebrow">The listening room · track ${esc(m.track)} of ${tracks.length} · planet ${esc(m.planet)}</div>
<h1>${inline(m.title)}</h1>
<p>Section ${n} of the Sable whitepaper, <em>${esc(title)}</em>, rapped in its own words by ${esc(ARTIST)}. The hook: “${esc(m.hook)}”.</p>
${cover ? `<img class="cover" src="/tracks/${cover}" width="1500" height="1500" alt="Cover of ${esc(m.title)}: planet ${esc(m.planet)} of the whitepaper's solar system">` : ""}
<div class="player"><audio controls preload="metadata" src="/tracks/${m.audio}" aria-label="${esc(m.title)}"></audio>
<p class="legend">${secs ? mmss(secs) + " · " : ""}composed with Suno${generated ? ", " + pretty(generated) : ""}${suno ? ` · <a href="${esc(suno)}" rel="noopener">open on Suno</a>` : ""} · <a href="/tracks/${m.audio}">the MP3</a></p></div>
<h3>Lyrics</h3>
<p class="legend">A line with a blue edge is a sentence of the whitepaper, verbatim, checked against the text when this page was built. A grey line is the author's glue.</p>
<div class="lyrics">${renderLyrics(t.lyrics, t.sources, n)}</div>
<h3>Sources</h3>
<p>Section ${n}, “${esc(title)}”, of the Sable whitepaper: cover ${esc(wp.cover)}, snapshot ${pretty(wp.latest)}, ${esc(String(wp.sentence_count))} sentences in the <a href="https://github.com/CryptoWesAI/sable-whitepaper-watch" rel="noopener">watcher's record</a>. An id is section.sentence in that record.</p>
<ol class="sources">
${t.sources.map((s) => `<li><span class="id">${esc(s.id)}</span>${esc(s.text)}</li>`).join("\n")}
</ol>
${t.notes.map((x) => `<p class="legend">${inline(x)}</p>`).join("\n")}
<details><summary>How it was made</summary>
<p>Lyrics assembled from the section's own sentences, with a few lines of glue, and checked by script (every quoted line must appear verbatim in the paper and in the song). Generated on Suno by the artist ${esc(ARTIST)}, two takes, the cleaner one kept. Remixing off.</p>
<p>Style prompt: ${esc(t.style)}</p>
</details>
<div class="acts"><a class="pill fill" href="/#listening">Back to the listening room</a>${prev ? `<a class="pill" href="/tracks/${prev.meta.slug}.html">← ${esc(prev.meta.title)}</a>` : ""}${next ? `<a class="pill" href="/tracks/${next.meta.slug}.html">${esc(next.meta.title)} →</a>` : ""}<a class="pill" href="${PDF}">The whitepaper</a></div>
</main>
<footer class="foot">Independent page by a community member. Not run by Sable Network. The author holds SABL. The music is generated with Suno; the quoted words are the whitepaper's own. Nothing here is investment advice. Corrections: reply on X to @0PTIMUS_ONE or in Sable's Telegram; they are logged with the date.</footer>
</body>
</html>
`;
  writeFileSync(join(out, `${m.slug}.html`), html);
  index.push({ track: Number(m.track), slug: m.slug, title: m.title, section: n, sectionTitle: title, planet: m.planet, hook: m.hook, audio: m.audio, cover, seconds: secs, suno, generated, artist: ARTIST });
  console.log("track:", m.track, m.slug, secs ? mmss(secs) : "(no ffprobe)", t.sources.length, "quotes verified");
});
writeFileSync(join(out, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log("wrote site/tracks/index.json with", index.length, "track(s)");
