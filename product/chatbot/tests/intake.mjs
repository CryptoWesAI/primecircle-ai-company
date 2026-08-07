// Regressietest voor de intakeketen: formulier -> server -> bouwprompt/kennisbank/mail.
//
// Waarom dit bestaat. Op 7 augustus 2026 zijn er zes velden aan het intakeformulier
// toegevoegd en zijn de generators fors verbouwd. Die verbouwing is met wegwerp-scripts
// getest, en die scripts zijn weg. In één sessie zijn er vier fouten gevonden die geen
// enkele bestaande controle zou hebben gevangen:
//
//   1. Een veld stond wel in het formulier maar werd nergens door de server gelezen, dus
//      de klant vulde het in en het verdween stil. (googleProfielUrl)
//   2. Een Nederlands bedrag "1.250,50" parste naar NaN, waardoor de ROI-rekensom die je
//      in een verkoopgesprek voorleest gewoon niet verscheen.
//   3. Een ontbrekend oprichtingsjaar drukte een losse "-" af in de prompt.
//   4. Een lege FAQ werd een losse "-" in plaats van een waarschuwing dat de chatbot dan
//      alleen kan doorverwijzen.
//
// Geen van vieren geeft een foutmelding. Ze produceren stille schade: een verkeerd bedrag
// op de site van een klant, of een antwoord dat nooit is aangekomen. Dat is precies het
// soort fout waar een test voor is.
//
// Wat deze test WEL vindt: velden die uit de keten vallen, harde gegevens die niet
// letterlijk worden doorgegeven, ontbrekende gegevens die stilzwijgend worden opgevuld,
// getalnotatie die stukloopt, en onveilige tekst die ongeescaped in de HTML-mail belandt.
// Wat deze test NIET vindt: of de gegenereerde site mooi is, of de teksten kloppen, en of
// de mail daadwerkelijk verstuurd wordt. Dat blijft mensenwerk en een echte testinzending.
//
// Draaien:  node tests/intake.mjs      (vanuit product/chatbot/)
// Exitcode: 0 = alles goed, 1 = er is iets stuk.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const FORM = path.resolve(hier, "../../../sites/belvanger/site/klantintake.html");
const SERVER = path.resolve(hier, "../server.js");

// INTAKE_TEST voorkomt dat het importeren van server.js een poort opent.
process.env.INTAKE_TEST = "1";
const M = await import(path.toNamespacedPath ? `file://${SERVER}` : SERVER);

let fouten = 0;
const ok = (naam) => console.log(`  ok   ${naam}`);
const fout = (naam, detail) => { fouten++; console.log(`  FOUT ${naam}\n       ${detail}`); };
const check = (naam, voorwaarde, detail) => (voorwaarde ? ok(naam) : fout(naam, detail));

// Een volledig ingevulde intake, zoals een goede klant hem oplevert.
const VOL = {
  vak: "loodgieter",
  bedrijfsnaam: "Jansen Loodgieters",
  handelsnaam: "Jansen Loodgieters",
  telefoon: "06 12345678",
  email: "jan@jansenloodgieters.nl",
  kvk: "12345678",
  btw: "NL001234567B01",
  werkgebied: "Zwolle en 20 km rondom",
  prijsmodel: "vaste prijs vooraf",
  spoedservice: "ja",
  spoedTijd: "binnen 2 uur",
  certificeringen: "Sterkin",
  actiefSinds: "2009",
  diensten: "Lekkage verhelpen\nCv-onderhoud",
  specialiteit: "lekkages",
  voorbeeldKlus: "Mevrouw belde dat het plafond nat was. Nieuwe koppeling, 185 euro.",
  zichtbaarResultaat: "de druppel is weg en de vloer is droog",
  nietDoen: "geen nieuwbouw",
  nietVoor: "wie alleen op de laagste prijs let",
  bezwaar: "of ik het echt dezelfde week kan doen",
  eigenOpeningsvraag: "Waar zit het, en staat er nu nog water?",
  veelgesteldeVragen: "Kom je ook 's avonds? - Ja, tot 20:00.\nWat kost voorrijden? - Binnen 15 km niks.",
  googleProfielUrl: "https://maps.app.goo.gl/abc123",
  googleSterren: "4,8",
  googleReviews: "63",
  belvolumeWeek: "25",
  gemistWeek: "6",
  klusWaarde: "340",
  terugbelgedrag: "binnen het uur",
  wieNeemtOp: "mijn vrouw",
};
// Een kale intake: alleen de verplichte velden.
const KAAL = { vak: "dakdekker", bedrijfsnaam: "Test", telefoon: "06 1", email: "a@b.nl", werkgebied: "Zwolle", diensten: "Daken" };

console.log("\n1. Veldpariteit formulier <-> server");
{
  const html = fs.readFileSync(FORM, "utf8");
  const src = fs.readFileSync(SERVER, "utf8");
  const velden = new Set([...html.matchAll(/name="([a-zA-Z0-9_]+)"/g)].map((m) => m[1]));
  const gelezen = new Set([...src.matchAll(/\bd\.([a-zA-Z0-9_]+)/g)].map((m) => m[1]));
  // Bijlagen lopen via een eigen pad (FILE_FIELDS) en de honeypot hoort juist genegeerd te
  // worden; die tellen niet mee.
  const uitzonderingen = new Set(["website", "logoFile", "foto1", "foto2", "foto3", "viewport", "description", "theme-color", "robots"]);
  const verdwenen = [...velden].filter((v) => !gelezen.has(v) && !uitzonderingen.has(v));
  check("elk formulierveld wordt door de server gelezen", verdwenen.length === 0,
    `deze velden vallen stil weg: ${verdwenen.join(", ")}`);
}

console.log("\n2. Harde gegevens worden letterlijk doorgegeven");
{
  const p = M.buildDesignPrompt(VOL);
  for (const [naam, waarde] of [["telefoon", VOL.telefoon], ["KvK", VOL.kvk], ["BTW", VOL.btw], ["werkgebied", VOL.werkgebied]]) {
    check(`${naam} staat letterlijk in de prompt`, p.includes(waarde), `"${waarde}" niet gevonden`);
  }
  check("het blok HARDE GEGEVENS bestaat", p.includes("=== HARDE GEGEVENS, LETTERLIJK OVERNEMEN ==="), "blok ontbreekt");
}

console.log("\n3. Ontbrekende gegevens worden gemeld, niet opgevuld");
{
  const p = M.buildDesignPrompt(KAAL);
  check("ontbrekende harde velden worden opgesomd", p.includes("LET OP, NIET INGEVULD"), "geen waarschuwing bij ontbrekende KvK/BTW");
  check("placeholders worden expliciet verboden", /GEEN placeholder/.test(p), "verbod op placeholders ontbreekt");
  check("lege FAQ geeft een waarschuwing", p.includes("Veelgestelde vragen: NIET INGEVULD"), "lege FAQ meldt zichzelf niet");
}

console.log("\n4. Geen losse streepregels (cosmetische stille fout)");
{
  for (const [naam, d] of [["volledig", VOL], ["kaal", KAAL]]) {
    const regels = M.buildDesignPrompt(d).split("\n");
    const losse = regels.map((l, i) => [i, l]).filter(([, l]) => l.trim() === "-");
    check(`prompt (${naam}) bevat geen regel die alleen "-" is`, losse.length === 0,
      `regels ${losse.map(([i]) => i).join(", ")} zijn een losse streep`);
  }
}

console.log("\n5. Nederlandse getalnotatie");
{
  const gevallen = [["340", 340], ["1.250,50", 1250.5], ["1.250", 1250], ["1,5", 1.5], ["EUR 340", 340], ["6 stuks", 6], ["2.5", 2.5]];
  for (const [in_, uit] of gevallen) {
    check(`nlGetal("${in_}") = ${uit}`, M.nlGetal(in_) === uit, `kreeg ${M.nlGetal(in_)}`);
  }
  check("onzin levert NaN", Number.isNaN(M.nlGetal("abc")), "abc parste naar een getal");
}

console.log("\n6. De rekensom");
{
  check("rekensom verschijnt bij ingevulde cijfers", /26 gemiste bellers/.test(M.misgelopenPerMaand(VOL)), "geen rekensom");
  check("nul gemist is een antwoord, geen lege invoer",
    /NUL gemiste oproepen/.test(M.misgelopenPerMaand({ gemistWeek: "0", klusWaarde: "340" })), "nul werd als ontbrekend behandeld");
  check("ontbrekende cijfers melden zichzelf",
    /niet te maken/.test(M.misgelopenPerMaand({})), "lege invoer gaf geen melding");
}

console.log("\n7. Diskwalificerend antwoord valt op");
{
  const tekst = M.intakeEmailText({ ...VOL, terugbelgedrag: "niet altijd" }, "x", 0);
  check("'niet altijd terugbellen' wordt gemarkeerd", /LET OP: dit is de diskwalificerende vraag/.test(tekst),
    "het antwoord dat een prospect diskwalificeert glipt er ongemerkt doorheen");
}

console.log("\n8. De stem van de klant komt in de prompt");
{
  const p = M.buildDesignPrompt(VOL);
  check("blok STEM VAN DE KLANT bestaat", p.includes("=== DE STEM VAN DE KLANT"), "blok ontbreekt");
  check("het klusverhaal staat erin", p.includes(VOL.voorbeeldKlus), "voorbeeldklus ontbreekt");
  check("de signatuur-animatie is afgeleid van zijn eigen zin", p.includes(VOL.zichtbaarResultaat), "zichtbaar resultaat ontbreekt");
  const sys = M.buildChatbotSystemPromptDraft(VOL);
  check("chatbot opent met zijn eigen vraag", sys.includes(VOL.eigenOpeningsvraag), "openingsvraag niet woordelijk overgenomen");
  check("chatbot kent wat hij niet aanneemt", sys.includes(VOL.nietDoen), "weigergedrag ontbreekt");
  const kb = M.buildChatbotKnowledgeBaseDraft(VOL);
  check("kennisbank bevat de echte FAQ", kb.includes("Wat kost voorrijden?"), "FAQ niet doorgegeven");
}

console.log("\n9. HTML-mail escapet klantinvoer");
{
  const kwaad = '<script>alert(1)</script>';
  const html = M.intakeEmailHtml({ ...VOL, voorbeeldKlus: kwaad, bezwaar: kwaad, nietDoen: kwaad }, "prompt", 0);
  check("geen ongeescapete <script> in de HTML-mail", !html.includes(kwaad),
    "klantinvoer belandt onbewerkt in de mail-HTML");
  check("wel als geescapete tekst zichtbaar", html.includes("&lt;script&gt;"), "invoer is helemaal verdwenen in plaats van geescaped");
}

console.log("\n10. Galerijstatus");
{
  const g = JSON.parse(fs.readFileSync(path.resolve(hier, "../galerij.json"), "utf8"));
  check("galerij.json is geldige JSON met een vergeven-lijst", Array.isArray(g.vergeven), "structuur klopt niet");
  const p = M.buildDesignPrompt(VOL);
  check("de prompt noemt wat al vergeven is", /Al vergeven|galerij\.json is nog niet bijgewerkt/.test(p),
    "layout-instructie is weer onuitvoerbaar geworden");
}

console.log(`\n${fouten === 0 ? "Alles goed." : `${fouten} fout(en) gevonden.`}\n`);
process.exit(fouten === 0 ? 0 : 1);
