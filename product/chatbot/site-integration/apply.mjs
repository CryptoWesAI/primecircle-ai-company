// Sluit het AB-chat widget aan op (of los van) de bestaande website.
// Het widget wordt MEEGELEVERD in de site (assets/ab-chat.js + ab-chat.css), zodat
// de knop altijd verschijnt — ook zonder draaiend endpoint. Alleen het chatten
// zelf gebruikt het endpoint (en valt anders netjes terug op bellen).
//
// De website-map is GEEN geldige git-repo, dus dit script is je aan/uit-knop.
//
// Gebruik:
//   node apply.mjs add            # kopieert assets (host = http://localhost:3100) + sluit alle pagina's aan
//   node apply.mjs add https://<endpoint-host>   # met productie-host
//   node apply.mjs remove         # verwijdert de embed + de gekopieerde assets weer
//
// Website-map: standaard C:/Users/wfvis/Documents/PrimeCircle,
// te overschrijven met de omgevingsvariabele AB_SITE_DIR.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public"); // canonieke bron
const SITE = process.env.AB_SITE_DIR || "C:/Users/wfvis/Documents/PrimeCircle";
const ASSETS = path.join(SITE, "assets");
const MODE = process.argv[2] || "add";
const HOST = (process.argv[3] || "http://localhost:3100").replace(/\/$/, "");
// Optioneel: komma-gescheiden mapnamen die dit script volledig moet negeren (bv.
// losstaande voorbeeld-/demopagina's die geen live chat-widget horen te krijgen).
const EXCLUDE_DIRS = (process.env.AB_SITE_EXCLUDE_DIRS || "").split(",").map((s) => s.trim()).filter(Boolean);
// Idem voor losse BESTANDEN. Nodig omdat niet elke uit te sluiten pagina in een eigen map
// staat: de opnamepodia voor de promotiefilm liggen naast de echte pagina's, en een
// chatbubbel in beeld verpest de opname. 'remove' haalt de tag overal weg, 'add' slaat
// deze bestanden over, dus zetten en weghalen blijft idempotent.
const EXCLUDE_FILES = (process.env.AB_SITE_EXCLUDE_FILES || "").split(",").map((s) => s.trim()).filter(Boolean);

const MARKER = "data-ab-chat";
const JS_NAME = "ab-chat.js";
const CSS_NAME = "ab-chat.css";
// Matcht de embed-regel ongeacht bestandsnaam of taal (voor 'remove').
const TAG_RE = /\s*<script src="[^"]*" data-ab-chat data-lang="[a-z]+" defer><\/script>/g;

function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".") || EXCLUDE_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function assetPrefix(file) {
  // Een 404-pagina wordt geserveerd bij een WILLEKEURIGE URL, dus er bestaat geen goed
  // relatief pad: vanaf /en/typefout zou "assets/..." naar /en/assets/ wijzen en zelf 404'en.
  // Root-absoluut is de enige juiste vorm. 404.html verwijst om diezelfde reden al met
  // /css/ en /fonts/ naar zijn andere bestanden.
  if (path.basename(file).toLowerCase() === "404.html") return "/assets";
  // URL-pad van de pagina naar de assets-map (bv. "assets" of "../assets").
  const rel = path.relative(path.dirname(file), ASSETS).replace(/\\/g, "/");
  return rel === "" ? "." : rel;
}

if (!fs.existsSync(SITE)) {
  console.error("Website-map niet gevonden:", SITE);
  process.exit(1);
}

const files = walk(SITE);
let changed = 0,
  skipped = 0;

if (MODE === "remove") {
  for (const file of files) {
    let html = fs.readFileSync(file, "utf8");
    if (!html.includes(MARKER)) {
      skipped++;
      continue;
    }
    fs.writeFileSync(file, html.replace(TAG_RE, ""));
    changed++;
    console.log("- verwijderd:", path.relative(SITE, file));
  }
  for (const name of [JS_NAME, CSS_NAME]) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log("- verwijderd asset:", "assets/" + name);
    }
  }
  console.log(`\nKlaar (remove). Pagina's gewijzigd: ${changed}, overgeslagen: ${skipped}`);
  process.exit(0);
}

// MODE === "add"
// 1. Widget-bestanden meeleveren in de site.
//    host "auto" → placeholder laten staan; het widget gebruikt dan de eigen
//    origin (voor als site én endpoint vanaf hetzelfde adres draaien, bv. in de
//    Docker-container). Anders wordt de opgegeven host ingebakken.
if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS, { recursive: true });
const raw = fs.readFileSync(path.join(PUBLIC, "widget.js"), "utf8");
const css = fs.readFileSync(path.join(PUBLIC, "widget.css"), "utf8");
const js = HOST === "auto" ? raw : raw.replaceAll("__AB_CHAT_API__", HOST);
fs.writeFileSync(path.join(ASSETS, JS_NAME), js);
fs.writeFileSync(path.join(ASSETS, CSS_NAME), css);
// Versie-hash op de inhoud → cache-busting: de browser laadt vanzelf de nieuwe
// versie zodra het widget (js of css) verandert.
const VER = createHash("sha1").update(js + css).digest("hex").slice(0, 8);
console.log(`assets bijgewerkt: assets/${JS_NAME} + assets/${CSS_NAME} (${HOST === "auto" ? "zelfde origin" : "endpoint: " + HOST}, v=${VER})`);

// 2. Eén embed-regel per pagina, met correct relatief pad en taal.
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const rel = path.relative(SITE, file);
  if (html.includes(MARKER)) {
    skipped++;
    continue;
  }
  if (EXCLUDE_FILES.includes(path.basename(file))) {
    console.log(`= uitgesloten  ${rel}`);
    skipped++;
    continue;
  }
  // Padsegment-check (niet substring): een map als "voorbeelden/" eindigt toevallig
  // op "en" maar is geen en/-taalmap.
  const lang = rel.replace(/\\/g, "/").split("/").slice(0, -1).includes("en") ? "en" : "nl";
  const tag = `<script src="${assetPrefix(file)}/${JS_NAME}?v=${VER}" ${MARKER} data-lang="${lang}" defer></script>`;
  const idx = html.lastIndexOf("</body>");
  if (idx === -1) {
    console.log("GEEN </body> — overgeslagen:", rel);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, html.slice(0, idx) + tag + html.slice(idx));
  changed++;
  console.log(`+ ${lang}  ${rel}`);
}

console.log(`\nKlaar (add). Pagina's aangesloten: ${changed}, overgeslagen (al aanwezig): ${skipped}, endpoint: ${HOST}`);
