#!/usr/bin/env node
// Bouwt de glaszettersbeelden in zodra ze op schijf staan.
//
// WAAROM DIT SCRIPT BESTAAT
// De beelden zijn op 2026-08-07 met OpenArt gegenereerd, maar de sessie die ze maakte kon
// ze niet ophalen: de egress-policy blokkeert cdn.openart.ai (403 op CONNECT). De founder
// heeft ze daarom zelf gedownload en geüpload. Het INBOUWEN blijft foutgevoelig handwerk:
// de galerijkaart moet in NL én EN tegelijk (anders valt sites/belvanger/tests/taalpariteit.mjs
// om) en de voorbeeldpagina heeft drie invoegpunten. Dat doet dit script.
//
// GEBRUIK
//   node tools/glaszetter-beelden-inbouwen.mjs
//   node sites/belvanger/tests/taalpariteit.mjs
//
// Per beeld: staat het bestand er, dan wordt de bijbehorende bewerking gedaan; staat het er
// niet, dan blijft die plek zoals hij is. Dat kan veilig, want elke plek is zelfstandig af
// zonder foto — de voorbeeldpagina is met opzet zo gebouwd. Wat NIET veilig zou zijn is een
// img-tag plaatsen naar een bestand dat er niet is, en dat gebeurt hier dus nooit.
//
// Idempotent: twee keer draaien verandert niets extra.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "sites", "belvanger", "site");
const ASSETS = path.join(SITE, "assets", "voorbeelden");
const heeft = (n) => fs.existsSync(path.join(ASSETS, n));

const KAART_NL = `          <a class="voorbeelden__card" data-trade="glaszetter" style="--accent:#0F5FA8" href="voorbeelden/glaszetter-premium.html" target="_blank" rel="noopener">
            <img class="voorbeelden__img" src="assets/voorbeelden/thumb-glaszetter.webp" alt="Voorbeeldwebsite voor een glaszettersbedrijf" loading="lazy" />
            <span class="voorbeelden__scrim" aria-hidden="true"></span>
            <span class="voorbeelden__motif" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg></span>
            <span class="voorbeelden__label">Glaszetters<span class="voorbeelden__label-arrow" aria-hidden="true">&rarr;</span></span>
          </a>
`;

const KAART_EN = `          <a class="voorbeelden__card" data-trade="glaszetter" style="--accent:#0F5FA8" href="../voorbeelden/glaszetter-premium.html" target="_blank" rel="noopener">
            <img class="voorbeelden__img" src="../assets/voorbeelden/thumb-glaszetter.webp" alt="Example website for a glazier" loading="lazy" />
            <span class="voorbeelden__scrim" aria-hidden="true"></span>
            <span class="voorbeelden__motif" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg></span>
            <span class="voorbeelden__label">Glaziers<span class="voorbeelden__label-arrow" aria-hidden="true">&rarr;</span></span>
          </a>
`;

const VOORBEELD = path.join(SITE, "voorbeelden", "glaszetter-premium.html");

// Bijschriften gaan letterlijk een RegExp in, en "HR++ geplaatst" bevat twee plussen.
// Zonder escapen is dat "Nothing to repeat" en klapt het script eruit.
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Elke bewerking noemt zelf welk beeld hij nodig heeft, welke marker bewijst dat hij al
// gedaan is, en hoe hij zichzelf uitvoert.
const bewerkingen = [
  {
    naam: "galerijkaart NL",
    nodig: ["thumb-glaszetter.webp"],
    bestand: path.join(SITE, "index.html"),
    gedaan: 'data-trade="glaszetter"',
    // De kaart komt VOOR de "staat jouw vak er niet bij"-kaart: die hoort als laatste te
    // blijven staan, want hij vangt de bezoeker op die geen van de vakken herkent.
    doe: (s) => {
      const anker = "          <!-- Achtste kaart, en geen vak.";
      return s.includes(anker) ? s.replace(anker, KAART_NL + anker) : null;
    },
  },
  {
    naam: "galerijkaart EN",
    nodig: ["thumb-glaszetter.webp"],
    bestand: path.join(SITE, "en", "index.html"),
    gedaan: 'data-trade="glaszetter"',
    doe: (s) => {
      const anker = "          <!-- Eighth card, and not a trade.";
      return s.includes(anker) ? s.replace(anker, KAART_EN + anker) : null;
    },
  },
  {
    naam: "herofoto",
    nodig: ["glaszetter-hero.webp"],
    bestand: VOORBEELD,
    // Marker op het PAD en niet op de klassenaam: `class="hero__photo"` staat ook in het
    // toelichtingscommentaar, waardoor het script dacht dat het al klaar was.
    gedaan: 'src="../assets/voorbeelden/glaszetter-hero.webp"',
    doe: (s) => {
      const anker = '    <div class="hero__bg"></div>';
      if (!s.includes(anker)) return null;
      return s.replace(
        anker,
        anker +
          '\n    <img class="hero__photo" src="../assets/voorbeelden/glaszetter-hero.webp" alt="Glaszetter plaatst een ruit in een woning bij schemer" fetchpriority="high" decoding="async" />' +
          '\n    <div class="hero__scrim"></div>'
      );
    },
  },
  ...[
    { n: 1, alt: "Herstelde winkelpui", tag: "Winkelpui hersteld" },
    { n: 2, alt: "Nieuw isolatieglas geplaatst", tag: "HR++ geplaatst" },
  ].map((k) => ({
    naam: `werkkader ${k.n}`,
    nodig: [`glaszetter-werk-${k.n}.webp`],
    bestand: VOORBEELD,
    gedaan: `src="../assets/voorbeelden/glaszetter-werk-${k.n}.webp"`,
    // Het kader wordt herkend aan zijn BIJSCHRIFT, niet aan zijn volgorde. Zonder dat zou
    // een omgewisselde volgorde in de HTML de foto's stil bij het verkeerde bijschrift
    // zetten, en dan klopt "winkelpui" ineens bij een woonkamerraam.
    doe: (s) => {
      const re = new RegExp(
        `<div class="werk-frame werk-frame--glas"><div class="werk-frame__sheen"></div>(<div class="werk-frame__grain"></div><span class="werk-frame__tag">${esc(k.tag)}[^<]*</span></div>)`
      );
      if (!re.test(s)) return null;
      return s.replace(
        re,
        `<div class="werk-frame"><img class="werk-frame__img" src="../assets/voorbeelden/glaszetter-werk-${k.n}.webp" alt="${k.alt}" loading="lazy" />$1`
      );
    },
  })),
];

// ── Uitvoeren ────────────────────────────────────────────────────────────────
let gedaan = 0, overgeslagen = 0, gewacht = 0;
for (const b of bewerkingen) {
  const kort = path.relative(ROOT, b.bestand);
  const mist = b.nodig.filter((n) => !heeft(n));
  if (mist.length) {
    console.log(`wacht op     ${b.naam.padEnd(16)} — ${mist.join(", ")} ontbreekt in assets/voorbeelden/`);
    gewacht++;
    continue;
  }
  if (!fs.existsSync(b.bestand)) {
    console.error(`FOUT         ${b.naam.padEnd(16)} — ${kort} bestaat niet`);
    process.exitCode = 1;
    continue;
  }
  const s = fs.readFileSync(b.bestand, "utf8");
  if (s.includes(b.gedaan)) {
    console.log(`overgeslagen ${b.naam.padEnd(16)} — al ingebouwd`);
    overgeslagen++;
    continue;
  }
  const uit = b.doe(s);
  if (uit === null || uit === s) {
    console.error(`FOUT         ${b.naam.padEnd(16)} — ankerpunt niet gevonden in ${kort}.`);
    console.error(`             Het bestand is veranderd sinds dit script is geschreven.`);
    process.exitCode = 1;
    continue;
  }
  fs.writeFileSync(b.bestand, uit);
  console.log(`ingebouwd    ${b.naam.padEnd(16)} — ${kort}`);
  gedaan++;
}

console.log(`\n${gedaan} ingebouwd, ${overgeslagen} al gedaan, ${gewacht} wacht nog op een bestand.`);
if (gedaan) {
  console.log("Draai nu:  node sites/belvanger/tests/taalpariteit.mjs");
  console.log("Zodra de thumbnail er is, moet die 8 voorbeeldkaarten in beide talen melden.");
}
