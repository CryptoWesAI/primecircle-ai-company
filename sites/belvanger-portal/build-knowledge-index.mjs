// Bouwt de Kennisbank-index voor het platform_admin-tabblad: leest alle relevante
// markdown-documenten uit de repo en schrijft ze als één JSON-bestand naar
// src/knowledge-index.json (NIET naar public/, want dat wordt onbeveiligd
// statisch geserveerd — de Kennisbank moet alleen via het geauthenticeerde
// /api/admin/knowledge-endpoint bereikbaar zijn).
//
// Draai opnieuw zodra er documentatie is toegevoegd/gewijzigd, vóór de deploy:
//   node build-knowledge-index.mjs
//
// Zelfverdedigend buildpad — drie poorten ná elkaar, vóór er ooit iets wordt
// weggeschreven. Reden: een eerdere versie nam per ongeluk ~26 npm-dependency
// READMEs mee als "kennis" (geneste node_modules werd niet uitgesloten), en dat
// werd alleen gevonden omdat een mens toevallig de output doorlas. Deze poorten
// maken die klasse fouten hard en zichtbaar in plaats van stil en pas achteraf
// gevonden:
//   1) Allowlist  — een .md buiten de bekende contentmappen faalt de build.
//   2) Circuit breaker — te grote sprong t.o.v. de vorige goede index? Build
//      faalt, oude index blijft staan (serveert nooit halve/foute data).
//   3) Canary's   — auto-afgeleid uit knowledge-relationships.json (elke edge
//      kent al een bronvraag), getest tegen de nieuwe index vóór hij live gaat.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(__dirname, "src", "knowledge-index.json");
const RELATIONSHIPS = path.join(__dirname, "src", "knowledge-relationships.json");

// Poort 1 — Allowlist. Alleen deze mappen (en losse root-bestanden) mogen
// documenten leveren. Alles daarbuiten is per definitie onbekend/onbedoeld en
// faalt de build hard, in plaats van stilzwijgend mee te liften.
// Nieuw contentgebied toevoegen = hier één regel bij, niets anders.
const ALLOWED_DIR_PARTS = [
  path.join("docs"),
  path.join("roadmap"),
  path.join("workflow"),
  path.join(".claude", "skills"),
  path.join("product", "chatbot"),
  path.join("sites", "belvanger"),
  path.join("sites", "belvanger-portal"),
];
// Uitgesloten binnen die mappen: andere klanten, gegenereerde build-output.
const EXCLUDE_DIR_PARTS = [
  path.join("sites", "belvanger", "app"),
  path.join("product", "chatbot", "customers", "ab-uitvaartzorg"),
  path.join("product", "chatbot", "customers", "demo-bakkerij"),
  path.join("product", "chatbot", "customers", "_template"),
];
// Bekend en bewust NIET meegenomen (andere klanten, infra-interna, tooling-config)
// — dit is geen "onbekende locatie" zoals de allowlist bedoelt te vangen, dus deze
// worden stil overgeslagen in plaats van de build te blokkeren.
const KNOWN_EXCLUDED_ROOTS = [
  path.join("clients"),
  path.join("infra"),
  path.join(".github"),
];
const EXCLUDE_FILES = new Set([
  path.join("product", "chatbot", "customers", "README.md"),
  path.join("docs", "research", "uitvaartniche-marktonderzoek.md"),
  path.join("docs", "research", "niche-vergelijking-lokaal-mkb.md"),
  path.join("docs", "offers", "aanbod-uitvaartniche.md"),
]);
// Root-level .md bestanden (CLAUDE.md, CURRENT_STATE.md, etc.) zijn altijd
// toegestaan — vandaar de losse rel === "" check hieronder.
const ROOT_FILES_ALLOWED = true;

function isAllowed(rel) {
  if (rel.indexOf(path.sep) === -1) return ROOT_FILES_ALLOWED; // root-level bestand
  return ALLOWED_DIR_PARTS.some((part) => rel === part || rel.startsWith(part + path.sep));
}

function isExcluded(rel) {
  return EXCLUDE_DIR_PARTS.some((part) => rel === part || rel.startsWith(part + path.sep)) ||
    KNOWN_EXCLUDED_ROOTS.some((part) => rel === part || rel.startsWith(part + path.sep));
}

const violations = [];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // node_modules en .git nooit meenemen, ongeacht diepte.
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(REPO_ROOT, full);
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) { walk(full, out); continue; }
    if (!entry.name.toLowerCase().endsWith(".md")) continue;
    if (EXCLUDE_FILES.has(rel)) continue;
    if (!isAllowed(rel)) { violations.push(rel); continue; }
    out.push(full);
  }
  return out;
}

// Simpele, voorspelbare padregel — geen inhoud-analyse, zodat waar iets terechtkomt
// altijd te herleiden is uit het pad zelf.
function categorize(rel) {
  const norm = rel.replace(/\\/g, "/");
  if (norm.startsWith(".claude/skills/")) return "Skills";
  if (norm.toLowerCase().includes("belvanger")) return "Belvanger";
  if (norm.startsWith("product/chatbot/")) return "Chatbot-product";
  return "PrimeCircle — bedrijfsbreed";
}

function extractTitle(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function fail(reason, details) {
  console.error(`\n✕ BUILD GEBLOKKEERD: ${reason}`);
  if (details) console.error(details);
  console.error("\nDe vorige goede src/knowledge-index.json blijft ongewijzigd staan.\n");
  process.exit(1);
}

// --- Poort 1: allowlist -----------------------------------------------------
const files = walk(REPO_ROOT, []);
if (violations.length) {
  fail(
    `${violations.length} markdown-bestand(en) buiten de toegestane mappen gevonden.`,
    violations.map((v) => `  - ${v}`).join("\n") +
      "\n\nAls dit bewust nieuwe content is: voeg de map toe aan ALLOWED_DIR_PARTS in build-knowledge-index.mjs."
  );
}

// Let op: deze allowlist bepaalt alleen wélke mappen een build-integriteitsgevaar
// zijn (poort 1 hierboven) — dat is een ANDER vraagstuk dan wat de Kennisbank-
// FEATURE inhoudelijk mag tonen. Dat laatste wordt hieronder apart geregeld: de
// Kennisbank is Belvanger's eigen klantportaal, dus die toont uitsluitend
// Belvanger-content, geen PrimeCircle-bedrijfsbrede documentatie/skills/roadmap —
// ook al mogen die mappen best gescand worden voor de allowlist-check zelf.
const ONLY_CATEGORY = "Belvanger";

const entries = files.map((full) => {
  const rel = path.relative(REPO_ROOT, full).replace(/\\/g, "/");
  const content = fs.readFileSync(full, "utf8");
  return {
    path: rel,
    category: categorize(rel),
    title: extractTitle(content, path.basename(rel, ".md")),
    content,
    updatedAt: fs.statSync(full).mtime.toISOString(),
  };
}).filter((e) => e.category === ONLY_CATEGORY)
  .sort((a, b) => a.title.localeCompare(b.title));

// --- Poort 2: circuit breaker t.o.v. de vorige goede index ------------------
// Eerste maand bewust in warn-only mode (niet blokkerend): eerst vertrouwen
// opbouwen in de drempel voordat hij echt content mag tegenhouden — anders is
// het risico dat de founder de poort onder tijdsdruk gewoon uitzet.
const BREAKER_BLOCKING = false;
const BREAKER_THRESHOLD = 0.20; // 20% sprong in documentaantal
let previous = null;
try { previous = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
if (previous && previous.entries.length > 0) {
  const prevCount = previous.entries.length;
  const newCount = entries.length;
  const delta = Math.abs(newCount - prevCount) / prevCount;
  const prevPaths = new Set(previous.entries.map((e) => e.path));
  const newPaths = new Set(entries.map((e) => e.path));
  const removed = [...prevPaths].filter((p) => !newPaths.has(p));
  const added = [...newPaths].filter((p) => !prevPaths.has(p));
  if (delta > BREAKER_THRESHOLD) {
    const msg = `Documentaantal sprong van ${prevCount} naar ${newCount} (${(delta * 100).toFixed(0)}%). ` +
      `Verwijderd: ${removed.length ? removed.join(", ") : "-"}. Nieuw: ${added.length ? added.join(", ") : "-"}.`;
    if (BREAKER_BLOCKING) fail("Circuit breaker: te grote sprong t.o.v. de vorige index.", msg);
    console.warn(`\n⚠ CIRCUIT BREAKER (warn-only): ${msg}\n`);
  }
}

// --- Poort 3: canary-vragen, auto-afgeleid uit de relatiedataset -----------
// Elke edge kent al een bron-vraag: "reason" legt uit waarom `from` en `to` bij
// elkaar horen, dus `from` moet vindbaar zijn op een kernterm uit die reason.
// Dit test de belofte "kun je het terugvinden", niet alleen "bestaat het bestand".
function buildCanaries(relationships, entryByPath) {
  const stopwords = new Set(["deze","dat","dit","voor","naar","door","zoals","waar","wordt","werd","noemt","expliciet","zegt","voort","bouwen","gebruikt","letterlijk","script","bestand","merkt","nooit","bevat","staat","gaat","over","heeft","wordt","alinea"]);
  const canaries = [];
  for (const rel of relationships) {
    const entry = entryByPath.get(rel.from);
    if (!entry) continue;
    // Alleen woorden die al écht in het bron-document staan tellen mee — de reason
    // is een parafrase van een analist, geen letterlijk citaat, dus die kan een
    // canary niet blindelings op baseren. Een canary test "blijft dit waar", niet
    // "verzin ik hier iets bij".
    const contentLower = entry.content.toLowerCase();
    const words = (rel.reason || "").toLowerCase().match(/[a-zà-ÿ][a-zà-ÿ0-9-]{5,}/g) || [];
    const keyword = words.find((w) => !stopwords.has(w) && contentLower.includes(w));
    if (!keyword) continue;
    canaries.push({ expectDoc: rel.from, keyword });
  }
  // Cap op ~15 zoals bedacht: neem een gespreide steekproef i.p.v. de eerste N.
  const step = Math.max(1, Math.floor(canaries.length / 15));
  return canaries.filter((_, i) => i % step === 0).slice(0, 15);
}

let relationships = [];
try { relationships = JSON.parse(fs.readFileSync(RELATIONSHIPS, "utf8")); } catch {}
const entryByPath = new Map(entries.map((e) => [e.path, e]));
const canaries = buildCanaries(relationships, entryByPath);
const canaryFailures = [];
for (const c of canaries) {
  const entry = entryByPath.get(c.expectDoc);
  const hit = entry.content.toLowerCase().includes(c.keyword);
  if (!hit) canaryFailures.push(c);
}
if (canaryFailures.length) {
  fail(
    `${canaryFailures.length}/${canaries.length} canary-vragen faalden — een document is niet meer vindbaar op een term uit zijn eigen relatie-omschrijving.`,
    canaryFailures.map((c) => `  - verwacht "${c.keyword}" in ${c.expectDoc}`).join("\n")
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), entries }));

const byCategory = {};
for (const e of entries) byCategory[e.category] = (byCategory[e.category] || 0) + 1;
console.log(`✓ Kennisbank-index gebouwd: ${entries.length} documenten → ${path.relative(__dirname, OUT)}`);
for (const [cat, count] of Object.entries(byCategory)) console.log(`  ${cat}: ${count}`);
console.log(`✓ Circuit breaker: ok (${previous ? "vergeleken met vorige index" : "geen vorige index, eerste run"})`);
console.log(`✓ Canary's: ${canaries.length - canaryFailures.length}/${canaries.length} geslaagd`);
