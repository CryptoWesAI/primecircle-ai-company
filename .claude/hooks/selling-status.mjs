// Toont bij het starten van een sessie de verkoopstand uit SELLING.md.
//
// De cijfers worden AFGELEID uit het grootboek, niet ergens ingetypt. Dat is het hele
// punt: een getal verhogen is een muisklik, een grootboekregel toevoegen vereist een
// echte naam en een echt kanaal. Wie de nul weg wil, moet iemand appen.
//
// Bewust kort: drie regels, en daarna zwijgt hij. Een hook die elke sessie een preek
// afdraait wordt binnen een week uitgezet, en dan meet je niets meer.
//
// Zelf uitproberen:  echo '{}' | node .claude/hooks/selling-status.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORTEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BESTAND = path.join(WORTEL, "SELLING.md");

// Faalt dit script, dan mag het NOOIT een sessie blokkeren. Exit 0 en stil zijn.
try {
  if (!fs.existsSync(BESTAND)) process.exit(0);
  const tekst = fs.readFileSync(BESTAND, "utf8");

  // Tabelrijen die met een datum beginnen. Zowel het grootboek als de facturentabel
  // starten zo; ze worden onderscheiden op het aantal kolommen.
  const rijen = tekst
    .split(/\r?\n/)
    .filter((r) => /^\|\s*20\d\d-\d\d-\d\d\s*\|/.test(r))
    .map((r) => r.split("|").slice(1, -1).map((c) => c.trim()));

  const contacten = rijen.filter((k) => k.length === 6);
  const facturen = rijen.filter((k) => k.length === 5);

  const nu = Date.now();
  const dagen = (d) => Math.floor((nu - Date.parse(d)) / 86400000);

  const dezeWeek = contacten.filter((k) => dagen(k[0]) <= 7).length;
  // "GEBOEKT" in de reactiekolom is de afspraak; zie SELLING.md.
  const geboekt = contacten.filter((k) => /GEBOEKT/i.test(k[5])).length;
  const euro = facturen
    .filter((k) => /ja/i.test(k[4]))
    .reduce((som, k) => som + (Number(String(k[2]).replace(/[^0-9,.]/g, "").replace(",", ".")) || 0), 0);

  const laatste = contacten.length
    ? Math.min(...contacten.map((k) => dagen(k[0])))
    : null;

  // Eerstvolgende actie: de eerste blockquote-regel onder die kop, zodat de tekst in
  // SELLING.md de bron blijft en niet hier gedupliceerd wordt.
  const actie = (tekst.split("## De eerstvolgende actie")[1] || "")
    .split("\n")
    .map((r) => r.trim())
    .find((r) => r.startsWith(">") && r.length > 3)
    ?.replace(/^>\s*/, "");

  const regels = [
    `VERKOOP  gesproken deze week: ${dezeWeek}   geboekt: ${geboekt}   gefactureerd: EUR ${euro}`,
    laatste === null
      ? "         laatste contact: nooit"
      : `         laatste contact: ${laatste === 0 ? "vandaag" : laatste + " dag(en) geleden"}   (${contacten.length} totaal)`,
  ];
  if (actie) regels.push(`         volgende: ${actie.slice(0, 110)}`);

  // Nul gesproken prospects deze week is het enige geval dat een duwtje verdient. Staat
  // de teller wel op gang, dan is stilte het juiste gedrag.
  if (dezeWeek === 0) {
    regels.push("         Er is deze week nog met niemand gesproken. Dat is de kleinste stap die nu telt.");
  }

  console.log(JSON.stringify({
    systemMessage: regels.join("\n"),
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        `Verkoopstand uit SELLING.md: ${dezeWeek} prospect(s) gesproken in de laatste 7 dagen, ` +
        `${geboekt} gesprek(ken) geboekt, EUR ${euro} gefactureerd, ${contacten.length} contacten totaal. ` +
        (dezeWeek === 0
          ? "Noem bij een bouwverzoek EEN KEER de kleinste verkoopactie en dat dit bouwen uitstel is, en doe daarna het gevraagde werk volledig. Niet herhalen binnen de sessie."
          : "De teller loopt, dus hier niet over beginnen tenzij ernaar gevraagd wordt."),
    },
  }));
} catch {
  process.exit(0);
}
