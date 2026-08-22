// Herinnering: als Belvanger-bestanden zijn gewijzigd sinds de laatste entry in
// tools/activiteitenlog.json, blokkeer het einde van de beurt totdat er een nieuwe
// entry is toegevoegd (of expliciet is uitgelegd waarom dat hier niet hoeft).
//
// Waarom een hook en niet alleen een geheugennotitie: die notitie bestond al
// ("log elke Belvanger-wijziging ongevraagd, geen toestemming nodig") en werd
// toch een hele sessie lang niet toegepast. Vergelijkt bestands-mtimes, geen git
// nodig: werkt ongeacht wanneer er gecommit wordt, en reset vanzelf zodra de log
// wordt bijgewerkt.
//
// Zelf uitproberen:  echo '{}' | node .claude/hooks/check-belvanger-log.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const WORTEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOG = path.join(WORTEL, "tools", "activiteitenlog.json");
const DOELEN = [
  "sites/belvanger",
  "sites/belvanger-portal",
  "product/chatbot/customers/belvanger",
].map((p) => path.join(WORTEL, p));

function alleBestanden(dir) {
  let out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(alleBestanden(p));
    else out.push(p);
  }
  return out;
}

// sites/belvanger/app/, dashboard-demo/ en assets/ab-chat.* zijn gegenereerde bestanden
// (assemble.mjs bouwt ze bij elke deploy opnieuw) en staan daarom in .gitignore. Zonder
// dit filter zou de hook bij ELKE deploy afgaan, ook als er geen bronbestand wijzigde.
function filterGenegeerd(paden) {
  if (!paden.length) return new Set();
  const relPaden = paden.map((p) => path.relative(WORTEL, p).replace(/\\/g, "/"));
  try {
    const out = execFileSync("git", ["check-ignore", "--stdin"], {
      cwd: WORTEL,
      input: relPaden.join("\n") + "\n",
      encoding: "utf8",
    });
    return new Set(out.split(/\r?\n/).filter(Boolean));
  } catch (e) {
    // exitcode 1 = geen van de paden genegeerd, dat is geen fout
    return e.status === 1 ? new Set() : new Set();
  }
}

// Faalt dit script onverwacht, dan mag het NOOIT een sessie blokkeren. Exit 0 en stil.
try {
  if (!fs.existsSync(LOG)) process.exit(0);
  const logTijd = fs.statSync(LOG).mtimeMs;

  const kandidaten = [];
  for (const dir of DOELEN) {
    for (const bestand of alleBestanden(dir)) {
      if (fs.statSync(bestand).mtimeMs > logTijd) kandidaten.push(bestand);
    }
  }
  const genegeerd = filterGenegeerd(kandidaten);
  let nieuwer = kandidaten
    .map((p) => path.relative(WORTEL, p).replace(/\\/g, "/"))
    .filter((rel) => !genegeerd.has(rel));

  // ── Blinde vlek, gerepareerd op 2026-08-22 ──────────────────────────────────
  // De hook vergeleek alleen mtimes. STATUS.md is zelf een KENNISOPSLAG, geen
  // wijziging die gelogd moet worden: je werkt 'm bij als onderdeel van hetzelfde
  // werk. Schrijf je eerst de logregel en dan STATUS.md (de natuurlijke volgorde,
  // want je logt de gebeurtenis en beschrijft daarna de nieuwe staat), dan is
  // STATUS.md nieuwer dan het logboek en blokkeerde de hook. Dat is niet te
  // ontsnappen behalve met een tweede, overbodige logregel: precies de ruis die
  // dit logboek onbruikbaar maakt.
  //
  // BEWUST SMAL GEHOUDEN. De uitzondering geldt alleen als:
  //   1. het ENIGE wat nieuwer is een STATUS.md is, en
  //   2. het logboek al een entry heeft met de datum van vandaag.
  // Wijzigt er ook maar één ander bestand, of is er vandaag nog niet gelogd, dan
  // blokkeert hij gewoon. Een echte code- of contentwijziging glipt er dus niet
  // doorheen; alleen het bijwerken van de statusdocumentatie zelf.
  const alleenStatusdoc =
    nieuwer.length > 0 && nieuwer.every((rel) => rel.endsWith("/STATUS.md"));
  if (alleenStatusdoc) {
    let gelogdVandaag = false;
    try {
      const entries = JSON.parse(fs.readFileSync(LOG, "utf8"));
      const vandaag = new Date().toISOString().slice(0, 10);
      gelogdVandaag =
        Array.isArray(entries) && entries.some((e) => e && e.logDate === vandaag);
    } catch {
      gelogdVandaag = false; // onleesbaar logboek = niet stilletjes doorlaten
    }
    if (gelogdVandaag) nieuwer = [];
  }

  if (nieuwer.length) {
    const voorbeeld = nieuwer.slice(0, 5).join(", ");
    console.log(JSON.stringify({
      decision: "block",
      reason:
        `Belvanger-bestanden zijn gewijzigd sinds de laatste entry in tools/activiteitenlog.json ` +
        `(${nieuwer.length} bestand(en), o.a.: ${voorbeeld}). Voeg eerst een entry toe aan het ` +
        `logboek voordat je stopt, tenzij deze wijziging geen logregel verdient (bijv. een test ` +
        `die je zelf net hebt gedraaid) — zeg dat dan expliciet in plaats van de melding te negeren.`,
    }));
  }
} catch {
  process.exit(0);
}
