// Rendement per advertentiehoek: leest een Meta Ads Manager-export en zegt wat eruit moet.
//
// Waarom dit bestaat: de beslissing "welke hoek gaat uit" moet gemeten zijn, niet gevoeld.
// Bord 3 uit de video (docs/marketing-agent/video-notes.md): laat ze 2 tot 3 dagen lopen,
// raak ze niet aan, en haal dan de slechtste eruit op basis van cijfers uit je eigen opslag.
//
// Geen dependencies, net als de rest van dit project.
//
// Gebruik:
//   node tools/ad-rendement.mjs <meta-export.csv> [aanvragen.csv]
//
//   meta-export.csv  Export uit Ads Manager. Kolomnamen worden los herkend, dus NL en EN
//                    werken beide, en zowel komma- als puntkomma-gescheiden (Nederlandse
//                    Excel exporteert met puntkomma's).
//   aanvragen.csv    Optioneel, twee kolommen: hoek-id,aantal-aanvragen. Vul je in fase 1
//                    handmatig uit je mailbox, want de bron staat in de aanvraagmail en niet
//                    in leads.jsonl. Zie docs/marketing-agent/SYSTEEM.md §9.
//
// Zonder aanvragen.csv rekent het met kosten per klik en zegt dat er dan niets over
// AANVRAGEN geconcludeerd mag worden. Dat onderscheid is het hele punt: een klik van 20 cent
// waar niemand het formulier invult is duurder dan een klik van een euro die wel converteert.

import fs from "node:fs";

const [csvPad, aanvragenPad] = process.argv.slice(2);
if (!csvPad) {
  console.error("gebruik: node tools/ad-rendement.mjs <meta-export.csv> [aanvragen.csv]");
  process.exit(2);
}

// ── CSV lezen, met aanhalingstekens en beide scheidingstekens ────────────────────────────
function leesCsv(pad) {
  const tekst = fs.readFileSync(pad, "utf8").replace(/^﻿/, ""); // BOM van Excel eraf
  const eersteRegel = tekst.split(/\r?\n/)[0] || "";
  // Kies het scheidingsteken dat buiten aanhalingstekens het vaakst voorkomt.
  const scheider = (eersteRegel.split(";").length > eersteRegel.split(",").length) ? ";" : ",";
  const rijen = [];
  let veld = "", rij = [], inQuote = false;
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (inQuote) {
      if (c === '"' && tekst[i + 1] === '"') { veld += '"'; i++; }
      else if (c === '"') inQuote = false;
      else veld += c;
    } else if (c === '"') inQuote = true;
    else if (c === scheider) { rij.push(veld); veld = ""; }
    else if (c === "\n") { rij.push(veld); rijen.push(rij); rij = []; veld = ""; }
    else if (c !== "\r") veld += c;
  }
  if (veld || rij.length) { rij.push(veld); rijen.push(rij); }
  return rijen.filter((r) => r.some((v) => v.trim() !== ""));
}

// ── Kolommen zoeken op woorden, niet op exacte naam ─────────────────────────────────────
// Ads Manager verandert kolomnamen per versie en per taal. Exact matchen breekt dan stil,
// en een meetscript dat stil breekt is erger dan geen meetscript.
function vindKolom(koppen, varianten, verplicht = true) {
  const genormaliseerd = koppen.map((k) => k.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
  for (const v of varianten) {
    const i = genormaliseerd.findIndex((k) => k.includes(v));
    if (i !== -1) return i;
  }
  if (verplicht) {
    console.error(`\nFOUT: geen kolom gevonden voor ${varianten[0]}.`);
    console.error("Gevonden kolommen:\n  " + koppen.join("\n  "));
    console.error("\nExporteer uit Ads Manager met minstens: advertentienaam, besteed bedrag,");
    console.error("vertoningen en linkklikken. Of pas de varianten in dit script aan.");
    process.exit(1);
  }
  return -1;
}

// Getallen uit een export die zowel Nederlands als Engels geformatteerd kan zijn.
// Dit is de plek waar zulke scripts stil kapot gaan: "1.842" is in NL 1842 en in EN 1,842.
// Een testrun met een Nederlandse export gaf een CTR van 2186% en dat was het alarm.
const getal = (s) => {
  if (s == null) return 0;
  let t = String(s).replace(/[^\d.,-]/g, "").trim();
  if (!t) return 0;
  const komma = t.lastIndexOf(","), punt = t.lastIndexOf(".");
  if (komma !== -1 && punt !== -1) {
    // Beide aanwezig: de LAATSTE is het decimaalteken, de andere is het duizendteken.
    if (komma > punt) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(/,/g, "");
  } else if (komma !== -1 || punt !== -1) {
    // Eén scheidingsteken: gevolgd door precies 3 cijfers met cijfers ervoor is een
    // DUIZENDTEKEN (1.842 / 1,842 = 1842). Anders is het een decimaalteken (12,40 = 12.4).
    const i = komma !== -1 ? komma : punt;
    const achter = t.length - i - 1;
    const duizendteken = achter === 3 && i > 0;
    t = duizendteken ? t.slice(0, i) + t.slice(i + 1) : t.replace(",", ".");
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
};

const rijen = leesCsv(csvPad);
if (rijen.length < 2) { console.error("De export bevat geen datarijen."); process.exit(1); }
const koppen = rijen[0].map((k) => k.trim());

const kNaam = vindKolom(koppen, ["ad name", "advertentienaam", "naam advertentie", "advertentie"]);
const kSpend = vindKolom(koppen, ["amount spent", "besteed", "uitgaven", "bedrag besteed", "spend"]);
const kImpr = vindKolom(koppen, ["impressions", "vertoningen", "weergaven"], false);
const kKlik = vindKolom(koppen, ["link clicks", "linkklikken", "klikken op link", "clicks", "klikken"], false);
const kResult = vindKolom(koppen, ["results", "resultaten", "leads", "conversies"], false);

// ── Aanvragen per hoek, optioneel ────────────────────────────────────────────────────────
const aanvragenPerHoek = new Map();
let aanvragenBron = null;
if (aanvragenPad && fs.existsSync(aanvragenPad)) {
  for (const r of leesCsv(aanvragenPad).slice(0)) {
    const id = (r[0] || "").trim();
    if (!id || /^(hoek|id|angle)/i.test(id)) continue;   // kopregel overslaan
    aanvragenPerHoek.set(id, (aanvragenPerHoek.get(id) || 0) + getal(r[1]));
  }
  aanvragenBron = `${aanvragenPad} (${aanvragenPerHoek.size} hoeken)`;
}

// ── Optellen per advertentie ─────────────────────────────────────────────────────────────
const perAd = new Map();
for (const r of rijen.slice(1)) {
  const naam = (r[kNaam] || "").trim();
  if (!naam) continue;
  const a = perAd.get(naam) || { naam, spend: 0, impr: 0, klik: 0, result: 0 };
  a.spend += getal(r[kSpend]);
  if (kImpr !== -1) a.impr += getal(r[kImpr]);
  if (kKlik !== -1) a.klik += getal(r[kKlik]);
  if (kResult !== -1) a.result += getal(r[kResult]);
  perAd.set(naam, a);
}

const ads = [...perAd.values()].map((a) => {
  // Aanvragen: eerst het handmatige bestand (dat is de waarheid uit je mailbox), anders de
  // kolom uit de export als die er staat.
  const aanvragen = aanvragenPerHoek.has(a.naam) ? aanvragenPerHoek.get(a.naam) : a.result;
  return {
    ...a,
    aanvragen,
    cpa: aanvragen > 0 ? a.spend / aanvragen : null,
    cpc: a.klik > 0 ? a.spend / a.klik : null,
    ctr: a.impr > 0 ? (a.klik / a.impr) * 100 : null,
  };
});

const totaal = ads.reduce((t, a) => ({
  spend: t.spend + a.spend, klik: t.klik + a.klik, impr: t.impr + a.impr,
  aanvragen: t.aanvragen + a.aanvragen,
}), { spend: 0, klik: 0, impr: 0, aanvragen: 0 });

const heeftAanvragen = totaal.aanvragen > 0;

// Sorteren op de maatstaf die telt: aanvragen als die er zijn, anders kliks.
ads.sort((x, y) => {
  const a = heeftAanvragen ? x.cpa : x.cpc, b = heeftAanvragen ? y.cpa : y.cpc;
  if (a == null && b == null) return y.spend - x.spend;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
});

// ── Beslisregel uit de skill ─────────────────────────────────────────────────────────────
// Uit: de slechtste helft op de maatstaf die telt. En apart: geen aanvragen ondanks meer dan
// 40 kliks is een weerlegde hoek, ongeacht waar hij in de rangschikking staat.
const helft = Math.floor(ads.length / 2);
for (const [i, a] of ads.entries()) {
  const weerlegd = heeftAanvragen && a.aanvragen === 0 && a.klik >= 40;
  a.besluit = weerlegd ? "UIT (weerlegd)" : (i >= ads.length - helft ? "uit" : "blijft");
}

// ── Uitvoer ──────────────────────────────────────────────────────────────────────────────
const eur = (n) => n == null ? "     -" : "€" + n.toFixed(2).padStart(6);
const maatstaf = heeftAanvragen ? "per aanvraag" : "per klik";

console.log(`\nRendement per hoek  (${csvPad})`);
console.log(`Aanvragen uit: ${aanvragenBron || (kResult !== -1 ? "resultatenkolom in de export" : "NIET BEKEND")}`);
console.log(`Gerangschikt op kosten ${maatstaf}. ${ads.length} advertentie(s).\n`);

const kop = ["hoek", "besteed", "vert.", "klik", "CTR", "aanvr.", "kosten " + maatstaf, "besluit"];
const breed = [26, 10, 9, 7, 8, 8, 21, 15];
// Elke cel wordt AFGEKAPT en dan opgevuld. Zonder het afkappen schuift één lange waarde de
// hele tabel scheef en is hij onleesbaar, precies wanneer je hem nodig hebt.
const cel = (v, b) => String(v).slice(0, b - 1).padEnd(b);
console.log(kop.map((k, i) => cel(k, breed[i])).join(""));
console.log(breed.map((b) => "-".repeat(b - 1)).join(" "));
for (const a of ads) {
  console.log([
    a.naam,
    eur(a.spend),
    a.impr ? a.impr.toLocaleString("nl-NL") : "-",
    a.klik || "-",
    a.ctr != null ? a.ctr.toFixed(2) + "%" : "-",
    a.aanvragen || "-",
    heeftAanvragen ? eur(a.cpa) : eur(a.cpc),
    a.besluit,
  ].map((v, i) => cel(v, breed[i])).join(""));
}

console.log("\n" + "-".repeat(78));
console.log(`Totaal: ${eur(totaal.spend)} besteed, ${totaal.klik} klikken, ${totaal.aanvragen} aanvragen`);
if (heeftAanvragen) {
  const cpa = totaal.spend / totaal.aanvragen;
  console.log(`Gemiddeld ${eur(cpa)} per aanvraag.`);
  // Grenzen uit docs/marketing-agent/SYSTEEM.md §7, voor Belvanger.
  if (cpa <= 42) console.log("Dat is binnen de gezonde grens (onder €42). Doorgaan en opschalen.");
  else if (cpa <= 85) console.log("Dat is tussen €42 en €85: het kan uit, maar krap. Hoeken verbeteren voor je opschaalt.");
  else console.log("Dat is boven €85. Volgens het stopcriterium: niet opschalen, eerst de hoeken herzien.");
} else {
  console.log("\nLET OP: er zijn geen aanvragen bekend, dus dit zegt alleen iets over KLIKKEN.");
  console.log("Een goedkope klik die niet converteert is geen goede advertentie. Vul een");
  console.log("aanvragen.csv (hoek-id,aantal) uit je mailbox en draai dit opnieuw voordat je");
  console.log("hoeken uitzet op basis van deze cijfers.");
}
console.log("\nVergeet stap 7 niet: schrijf het besluit per hoek terug in");
console.log("docs/marketing-agent/ANGLES.md, anders leert het systeem niets.\n");
