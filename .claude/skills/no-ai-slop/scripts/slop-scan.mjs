// Scant markdown op de patronen uit SKILL.md, in het Nederlands EN het Engels.
//
// Waarom dit bestaat naast de skill: de skill is bedoeld voor één draft die je plakt. Voor een
// audit over tientallen bestanden wil je bewijs per regel, niet een oordeel over het geheel.
// Dat sluit ook aan bij wat de skill zelf zegt: benoemde patronen zijn bewijs dat je kunt
// nakijken, in tegenstelling tot een detector die gokt.
//
// Waarom Nederlandse patronen erbij: de woordenlijsten van de auteur zijn volledig Engels.
// Precies dezelfde fout zat in copy-gate.js, die daardoor op Nederlandse pagina's niets ving.
//
// Gebruik:
//   node .claude/skills/no-ai-slop/scripts/slop-scan.mjs <bestand-of-map> [...]
//   node .claude/skills/no-ai-slop/scripts/slop-scan.mjs --alles

import fs from "node:fs";
import path from "node:path";

const PATRONEN = [
  // Harde regel in dit project: nul em-dashes. De founder wil ze niet zien.
  { naam: "em-dash", uitleg: "gebruik komma, dubbele punt of punt", re: /—/g },
  // Alleen de en-dash TUSSEN WOORDEN. Tussen getallen is hij juist correcte typografie voor
  // een bereik ("€249 – 499", "10 – 15 hoeken"), en die werden eerst onterecht gemeld.
  { naam: "en-dash als koppelteken", uitleg: "gebruik een gewoon koppelteken of een komma", re: /(?<![\d.,])\s–\s(?![\d€$])/g },

  { naam: "verboden woord (EN)", uitleg: "zeg het gewoon", re: /\b(delve|foster|leverage|utilize|facilitate|empower|streamline|robust|cutting-edge|paradigm shift|game changer|tapestry|realm|beacon|multifaceted|meticulous|intricate|paramount|transformative|elevate|embark|supercharge|harness|ever-evolving)\b/gi },
  { naam: "verboden woord (NL)", uitleg: "zeg het gewoon", re: /\b(naadloos|baanbrekend|revolutionair|state-of-the-art|toonaangevend|ongekend|krachtige oplossing|in een notendop|met gemak|moeiteloos)\b/gi },

  { naam: "lege frase (EN)", uitleg: "schrappen, het vertraagt de zin", re: /\b(it'?s worth noting|it'?s important to note|at the end of the day|when it comes to|at its core|in today'?s world|in the age of|the reality is|the truth is|going forward|let'?s dive in)\b/gi },
  { naam: "lege frase (NL)", uitleg: "schrappen, het vertraagt de zin", re: /\b(het is belangrijk om op te merken|het is goed om te weten dat|aan het eind van de dag|als het aankomt op|in de wereld van|in het huidige (?:tijdperk|landschap)|de realiteit is dat|de waarheid is dat|laten we (?:eens )?(?:duiken|kijken) in)\b/gi },

  { naam: "binaire tegenstelling (EN)", uitleg: "zeg Y direct", re: /\b(?:it'?s|this is|that'?s) not (?:just )?[^.,;!?]{2,40}[,.] (?:it'?s|but) /gi },
  { naam: "binaire tegenstelling (NL)", uitleg: "zeg Y direct", re: /\b(?:het|dat|dit) is niet (?:alleen |zozeer )?[^.,;!?]{2,40}, (?:het|dat|dit|maar) is\b|\bde vraag is niet [^.,;!?]{2,40}, maar\b|\bniet [^.,;!?]{2,30}, maar juist\b/gi },

  { naam: "keelschrapen (EN)", uitleg: "schrap de aanloop, begin bij het punt", re: /(?:^|\n)[ \t]*(?:here'?s the thing|here'?s what I mean|let me be clear|I'?ll be honest|the uncomfortable truth is)(?![\w])/gi },
  { naam: "keelschrapen (NL)", uitleg: "schrap de aanloop, begin bij het punt", re: /(?:^|\n)[ \t]*(?:kijk,|het punt is dit|laat ik eerlijk zijn|om eerlijk te zijn,|even eerlijk:|de ongemakkelijke waarheid is)(?![\w])/gi },

  { naam: "quasi-inzicht (EN)", uitleg: "laat de bewering op eigen benen staan", re: /\b(this is the part most people skip|what most people get wrong|here'?s what nobody tells you|the part everyone misses)\b/gi },
  { naam: "quasi-inzicht (NL)", uitleg: "laat de bewering op eigen benen staan", re: /\b(wat de meeste mensen (?:niet weten|missen|verkeerd doen)|dit is het deel dat (?:iedereen|bijna niemand) overslaat|wat niemand je vertelt|en dat is precies wat bijna niemand ziet)\b/gi },

  { naam: "belang-opklopperij (EN)", uitleg: "noem het feit, laat de lezer wegen", re: /\b(stands as a testament|marks a pivotal moment|plays a vital role|solidifies its position|underscores its significance)\b/gi },
  { naam: "belang-opklopperij (NL)", uitleg: "noem het feit, laat de lezer wegen", re: /\b(een mijlpaal in|onderstreept (?:het|de) (?:belang|significantie)|speelt een (?:cruciale|vitale) rol|van (?:essentieel|onschatbaar) belang|getuigt van)\b/gi },

  { naam: "vage bronvermelding (EN)", uitleg: "noem de bron of schrap de claim", re: /\b(experts agree|industry reports suggest|many argue|widely regarded as|studies show)\b/gi },
  { naam: "vage bronvermelding (NL)", uitleg: "noem de bron of schrap de claim", re: /\b(experts zijn het erover eens|uit onderzoek blijkt|men zegt dat|het wordt algemeen (?:gezien|beschouwd)|studies tonen aan)\b/gi },

  { naam: "samenvattend slot (EN)", uitleg: "eindig op het laatste concrete punt", re: /(?:^|\n)[ \t]*(?:#+[ \t]*)?(?:in conclusion|ultimately|overall|to sum up|in summary)\b/gi },
  { naam: "samenvattend slot (NL)", uitleg: "eindig op het laatste concrete punt", re: /(?:^|\n)[ \t]*(?:#+[ \t]*)?(?:kortom|samengevat|tot slot|al met al|concluderend|uiteindelijk kunnen we stellen)\b/gi },

  { naam: "dramatische fragmentatie", uitleg: "maak er een hele zin van", re: /\b(that'?s it\. that'?s the whole thing|dat is het\. dat is alles|meer is het niet\.)/gi },

  { naam: "emoji in kop", uitleg: "opmaak volgt de inhoud, niet andersom", re: /^#{1,6} .*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gmu },
];

// Dubbelepunt-onthulling: zelfstandig naamwoord, dubbele punt, dan een dramatische kleine
// letter. Apart omdat het alleen buiten koppen, lijsten en tabellen telt; daar is een dubbele
// punt gewoon een label.
const DUBBELE_PUNT = /(?:^|(?<=[.!?]\s))([A-Z][^.!?:\n]{8,70}): ([a-z][^.\n]{10,})/gm;

function stripCode(tekst) {
  // Codeblokken, inline code, tabellen en links eruit: daar hoort de tekst letterlijk te zijn
  // en een treffer daar is per definitie vals.
  return tekst
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length))
    .replace(/^\s*\|.*\|\s*$/gm, (m) => " ".repeat(m.length))
    .replace(/\]\([^)]*\)/g, (m) => " ".repeat(m.length));
}

function scanBestand(pad) {
  const ruw = fs.readFileSync(pad, "utf8");
  const tekst = stripCode(ruw);
  const regels = ruw.split("\n");
  const posNaarRegel = (i) => ruw.slice(0, i).split("\n").length;
  const treffers = [];

  for (const p of PATRONEN) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(tekst)) !== null) {
      const start = m.index + Math.max(0, m[0].search(/\S/));
      treffers.push({ regel: posNaarRegel(start), patroon: p.naam, uitleg: p.uitleg, tekst: m[0].trim().slice(0, 70) });
      if (m.index === p.re.lastIndex) p.re.lastIndex++;
    }
  }
  DUBBELE_PUNT.lastIndex = 0;
  let d;
  while ((d = DUBBELE_PUNT.exec(tekst)) !== null) {
    const r = posNaarRegel(d.index);
    const regelTekst = regels[r - 1] || "";
    if (/^\s*[-*|>#]/.test(regelTekst)) continue; // lijst, tabel, citaat of kop
    treffers.push({ regel: r, patroon: "dubbelepunt-onthulling", uitleg: "maak er een gewone zin van", tekst: d[0].trim().slice(0, 70) });
  }
  return treffers.sort((a, b) => a.regel - b.regel);
}

function verzamel(doelen) {
  const uit = [];
  const negeer = /node_modules|[\\/]\.git[\\/]|no-ai-slop|CHANGELOG/;
  const loop = (p) => {
    const st = fs.statSync(p);
    if (st.isDirectory()) { for (const k of fs.readdirSync(p)) loop(path.join(p, k)); return; }
    if (p.endsWith(".md") && !negeer.test(p)) uit.push(p);
  };
  for (const d of doelen) loop(d);
  return uit;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("gebruik: node slop-scan.mjs <bestand-of-map> [...]   of   --alles");
  process.exit(2);
}
const doelen = args[0] === "--alles" ? ["."] : args;
const bestanden = verzamel(doelen);

let totaal = 0;
const perPatroon = new Map();
for (const b of bestanden) {
  const t = scanBestand(b);
  if (!t.length) continue;
  console.log(`\n${b}`);
  for (const x of t) {
    console.log(`  regel ${String(x.regel).padStart(4)}  ${x.patroon.padEnd(28)} ${x.tekst}`);
    perPatroon.set(x.patroon, (perPatroon.get(x.patroon) || 0) + 1);
    totaal++;
  }
}

console.log(`\n${bestanden.length} bestand(en) gescand, ${totaal} treffer(s).`);
if (totaal) {
  console.log("\nPer patroon:");
  for (const [p, n] of [...perPatroon].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}x  ${p}`);
  console.log("\nElke treffer is een AANWIJZING, geen oordeel. Lees de regel voordat je hem wijzigt:");
  console.log("citaten, logregels en voorbeelden horen soms juist letterlijk te blijven.");
}
