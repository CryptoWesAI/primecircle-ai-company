// Vergelijkt site/index.html (NL) met site/en/index.html (EN) op STRUCTUUR.
//
// Waarom dit bestaat: op 27 juli 2026 bleek de Engelse pagina achter te lopen op de
// Nederlandse. Niet alleen qua tekst, maar structureel: de NL-hero had twee extra
// meldingskaarten (data-step 8 en 9) die de EN-pagina miste. js/app.js is voor beide
// talen HETZELFDE bestand en doet op 11,2s hide(7) en show(8). Op de Engelse pagina
// bestond stap 8 niet, dus verdween de melding en kwam er niets terug: de animatie
// eindigde op een leeg vlak. Serverside onzichtbaar, want er is geen fout.
//
// Wat deze test WEL vindt: een blok dat in de ene taal is toegevoegd en in de andere
// vergeten, en verwijzingen die uit elkaar lopen.
// Wat deze test NIET vindt: of de woorden hetzelfde BEDOELEN. Als de NL-hero herschreven
// wordt en de EN blijft de oude tekst, dan is de structuur nog steeds gelijk. Dat blijft
// mensenwerk. Deze test dekt de fout die je niet ziet, niet de fout die je kunt lezen.
//
// Draaien:  node tests/taalpariteit.mjs      (vanuit sites/belvanger/)
// Exitcode: 0 = gelijk, 1 = verschil gevonden.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const NL = path.join(HIER, "..", "site", "index.html");
const EN = path.join(HIER, "..", "site", "en", "index.html");

const nl = fs.readFileSync(NL, "utf8");
const en = fs.readFileSync(EN, "utf8");

const fouten = [];
const gelukt = [];

function tel(html, patroon) {
  return (html.match(patroon) || []).length;
}

// ── 1. data-step: de stappen die js/app.js aanstuurt ──────────────────────────
// Dit is de belangrijkste check, want een missende stap laat de simulatie stilvallen
// zonder ook maar één foutmelding.
const stappen = (html) =>
  [...html.matchAll(/data-step="(\d+)"/g)].map((m) => Number(m[1])).sort((a, b) => a - b).join(",");

const stapNL = stappen(nl);
const stapEN = stappen(en);
if (stapNL !== stapEN) {
  fouten.push(`data-step loopt uiteen.\n    NL: ${stapNL}\n    EN: ${stapEN}\n` +
    "    js/app.js is voor beide talen hetzelfde bestand: een missende stap = een lege plek in de animatie.");
} else {
  gelukt.push(`data-step gelijk (${stapNL})`);
}

// ── 2. Herhaalde copyblokken: evenveel kaarten, vragen, sliders, opties ───────
const blokken = {
  "herken-kaarten (.herken__card)": /class="herken__card"/g,
  "statistieken (.stat)": /<div class="stat">/g,
  "wat-je-krijgt-kaarten (.card)": /<article class="card reveal">/g,
  "route-stappen (.route__step)": /class="route__step reveal"/g,
  "voorbeeldkaarten (.voorbeelden__card)": /class="voorbeelden__card"/g,
  "FAQ-vragen (details.qa)": /<details class="qa">/g,
  "prijs-vinkjes (.check li)": /<li>(?=[^<]*(?:€|Maandelijks|Maandbedrag|Cancel|Monthly|One-time|Eenmalige))/g,
  "rekenmachine-sliders (.field)": /<label class="field">/g,
  "formuliervelden (.ffield)": /<label class="ffield">/g,
  "vak-opties (select option)": /<option>/g,
  "meldingskaarten (.lead-toast)": /class="lead-toast[ "]/g,
  "vakken in de strip (.trades__list li)": /<svg class="trade-ico"/g,
  "microtrust-regels": /<li>(?=[^<]*(?:nummer|app|week|number|Free|Gratis|bellen|call))/g,
};
for (const [naam, patroon] of Object.entries(blokken)) {
  const a = tel(nl, patroon), b = tel(en, patroon);
  if (a !== b) fouten.push(`${naam}: NL heeft ${a}, EN heeft ${b}.`);
  else gelukt.push(`${naam}: ${a} in beide`);
}

// ── 3. Losse elementen die er in beide talen hoort te staan ───────────────────
const eenmalig = [
  'class="hero__sub"', 'class="belief__text reveal"', 'class="herken__bridge reveal"',
  'class="pijn__transition reveal"', 'class="stats__source reveal"', 'id="rekenmachine"',
  'class="krijgt__foot reveal"', 'class="voorbeelden__note"', 'class="voorbeelden__dashboard-text"',
  'class="pricecard__promise"', 'class="pricecard__fine"', 'class="phone-note"',
  'class="slot__sub"', 'class="footer__tag"', 'class="hero__spine"',
  'data-cookie-settings', 'data-callbar', 'dashboard.belvanger.nl',
];
for (const naald of eenmalig) {
  const inNL = nl.includes(naald), inEN = en.includes(naald);
  if (inNL !== inEN) fouten.push(`"${naald}" staat ${inNL ? "alleen in NL" : "alleen in EN"}.`);
}
if (!fouten.some((f) => f.includes("staat alleen in"))) gelukt.push(`${eenmalig.length} losse elementen in beide aanwezig`);

// ── 4. Cijfers moeten identiek zijn: prijzen en statistieken ──────────────────
// Een prijs die in één taal is bijgewerkt is erger dan een slechte vertaling.
const cijfers = (html) => {
  const set = new Set();
  for (const m of html.matchAll(/data-count="(\d+)"/g)) set.add("count:" + m[1]);
  // €625 / €1.250 / €1,250 / €99 → punt en komma weg, zodat NL en EN vergelijkbaar zijn
  for (const m of html.matchAll(/€\s?([\d.,]+)/g)) set.add("euro:" + m[1].replace(/[.,]/g, ""));
  for (const m of html.matchAll(/(\d+)%/g)) set.add("pct:" + m[1]);
  return [...set].sort().join(" ");
};
if (cijfers(nl) !== cijfers(en)) {
  fouten.push(`Cijfers lopen uiteen.\n    NL: ${cijfers(nl)}\n    EN: ${cijfers(en)}`);
} else {
  gelukt.push("alle prijzen, percentages en tellers identiek");
}

// ── 5. Vaktermen consequent binnen het Engels ────────────────────────────────
// Hetzelfde vak mag niet drie namen hebben op één pagina. Dat overkwam ons:
// "Landscapers" in de strip, "Gardeners" bij de voorbeelden, "Landscaper" in het
// formulier. Voor een bezoeker lijken dat drie verschillende diensten.
const varianten = [["Gardener", "Landscaper"], ["Handymen", "Handyman firm"]];
for (const [fout, goed] of varianten) {
  if (new RegExp(fout).test(en) && new RegExp(goed).test(en)) {
    fouten.push(`EN gebruikt zowel "${fout}" als "${goed}" voor hetzelfde vak. Kies er één.`);
  }
}
gelukt.push("vaktermen binnen het Engels consequent");

// ── 6. Kruisverwijzingen tussen de talen ─────────────────────────────────────
if (!nl.includes('href="en/"')) fouten.push("NL verwijst niet naar en/.");
if (!en.includes('href="../"')) fouten.push("EN verwijst niet terug naar de NL-versie.");
for (const [naam, html] of [["NL", nl], ["EN", en]]) {
  for (const tag of ['hreflang="nl"', 'hreflang="en"', 'hreflang="x-default"']) {
    if (!html.includes(tag)) fouten.push(`${naam} mist ${tag}.`);
  }
}
// Google indexeert anders de ene taal wel en de andere niet.
const noindexNL = /name="robots" content="noindex/.test(nl);
const noindexEN = /name="robots" content="noindex/.test(en);
if (noindexNL !== noindexEN) {
  fouten.push(`robots-noindex staat ${noindexNL ? "alleen op NL" : "alleen op EN"}. Zet beide talen samen om.`);
} else {
  gelukt.push(`robots gelijk (noindex: ${noindexNL})`);
}

// ── Uitslag ──────────────────────────────────────────────────────────────────
console.log("Taalpariteit NL ↔ EN\n");
for (const g of gelukt) console.log("  ok    " + g);
if (fouten.length) {
  console.log("");
  for (const f of fouten) console.log("  FOUT  " + f);
  console.log(`\n${fouten.length} verschil(len) gevonden.`);
  process.exit(1);
}
console.log("\nGeen structurele verschillen.");
