// Verifies the EP's lyrics against the whitepaper.
//
//   node check-quotes.mjs            (run from this folder, before any Suno credit is spent)
//
// For every tracks/NN-*.md it checks two things:
//   1. each "## Sources" line ("- [nn.nn] text") is found verbatim in the
//      whitepaper text (punctuation, case and dashes ignored, words exact);
//   2. each source line is actually sung: it appears in the "## Lyrics" block
//      (line breaks ignored), so a quote cannot be listed but left out.
// Exit code 1 on any failure. Prints a short table per track.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const wpPath = join(here, "..", "..", "..", "..", "sable-whitepaper-watch", "whitepaper.txt");

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, " ")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wp = norm(readFileSync(wpPath, "utf8"));
const dir = join(here, "tracks");
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
let failures = 0;

for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  const lyricsBlock = (text.split(/^## Lyrics[^\n]*\n/m)[1] || "").split(/^## /m)[0];
  const lyrics = norm(lyricsBlock.replace(/^\[[^\]]+\]\s*$/gm, " "));
  const sourcesBlock = (text.split(/^## Sources[^\n]*\n/m)[1] || "").split(/^\n(?=[A-Z])/m)[0];
  const sources = sourcesBlock
    .split("\n")
    .map((l) => l.match(/^- \[(\d\d\.\d\d)\]\s+(.+)$/))
    .filter(Boolean)
    .map((m) => ({ id: m[1], text: m[2] }));

  let ok = 0;
  const bad = [];
  for (const s of sources) {
    const q = norm(s.text);
    const inPaper = wp.includes(q);
    const inLyrics = lyrics.includes(q);
    if (inPaper && inLyrics) ok++;
    else bad.push(`${s.id} ${inPaper ? "" : "NOT IN PAPER "}${inLyrics ? "" : "NOT SUNG"}: ${s.text.slice(0, 70)}`);
  }
  const chars = lyricsBlock.trim().length;
  console.log(`${f}: ${ok}/${sources.length} quotes verified, lyrics ${chars} chars${chars > 3000 ? " (over 3,000: Suno may rush)" : ""}`);
  for (const b of bad) { console.log("   FAIL " + b); failures++; }
}
if (!files.length) { console.error("no track files found"); process.exit(1); }
process.exit(failures ? 1 : 0);
