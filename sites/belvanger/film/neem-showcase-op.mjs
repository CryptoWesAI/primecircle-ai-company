// Neemt de showcase-film op: de ZEVEN echte voorbeeldpagina's plus de simulatie,
// als deterministische frame-reeksen op exact 1080x1920.
//
// Waarom frames en geen schermopname: de scroll wordt hier BESTUURD. Een mens die
// met zijn vinger scrollt levert schokkerige, onherhaalbare beweging; hier zit op
// elke shot een gekozen versnellingscurve en is de film opnieuw te maken door het
// script te draaien. Dat is ook het verschil tussen "een filmpje van een website"
// en montage.
//
// Vooraf: serveer de site op 18301
//   cd sites/belvanger/site && python -m http.server 18301 --bind 127.0.0.1
// Draaien:
//   node sites/belvanger/film/neem-showcase-op.mjs [uitvoermap]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
if (!chrome) throw new Error("Geen Chrome of Edge gevonden");

// 18302 en niet een kale statische server: de dashboard-demo haalt haar (fictieve)
// data op bij /dashboard-demo/api/*, en die routes zitten in de app-server. Op een
// python http.server toont het dashboard alleen een loginscherm met
// "Dashboard is tijdelijk niet bereikbaar".
const BASE = "http://127.0.0.1:18302";
const OUT = process.argv[2] || "./showcase-frames";
const FPS = 25;

// 432x768 CSS-pixels is 9:16 en valt binnen het mobiele breekpunt van de site, dus
// we filmen de layout die de klant op zijn telefoon ziet. deviceScaleFactor 2.5
// maakt daar een echte 1080x1920 render van: scherp, niet opgerekt.
const VW = 432, VH = 768, DSF = 2.5;

// De volgorde is een montagevolgorde, geen alfabetische. Teal, oranje, goud, indigo,
// groen, rood, violet: elke snede springt naar een andere kleurhoek, zodat zeven
// keer dezelfde compositie toch zeven keer nieuw voelt.
// De duur loopt AF (1,7s naar 0,9s) en de laatste landt weer langer. Versnellen
// bouwt spanning op, en de landing geeft het oog rust vlak voor de tekstkaart.
const VAKKEN = [
  { naam: "loodgieter", label: "Loodgieters", kleur: "#0E7490", sec: 1.44 },
  { naam: "dakdekker", label: "Dakdekkers", kleur: "#C2410C", sec: 1.32 },
  { naam: "elektricien", label: "Elektriciens", kleur: "#B7791F", sec: 1.20 },
  { naam: "installateur", label: "Installateurs", kleur: "#3949AB", sec: 1.08 },
  { naam: "hovenier", label: "Hoveniers", kleur: "#2F7D4F", sec: 0.96 },
  { naam: "klusbedrijf", label: "Klusbedrijven", kleur: "#9A2846", sec: 0.88 },
  { naam: "schilder", label: "Schilders", kleur: "#7E4A9E", sec: 1.40 },
];

// Het dashboard: het vierde ding dat de klant koopt, en tot nu toe alleen zichtbaar
// als melding in de simulatie. Scrollt van de besparing naar de opvolglijst. De
// oranje balk bovenin ("Voorbeelddata, geen echte klant of gegevens") is sticky en
// blijft dus de hele shot in beeld staan; dat is precies de bedoeling.
// Van de besparing bovenaan tot de tijdlijn "Laatste activiteit", want daar staan de
// sms, de gemiste oproep en de websiteaanvraag onder elkaar. Dat rijtje ís de claim
// van de film: alles komt op één plek binnen.
const DASHBOARD = { van: 0, tot: 1150, sec: 3.6 };

// Het formulier dat wordt ingevuld. De gegevens zijn NIET verzonnen: dit is exact de
// websiteaanvraag die even later in het dashboard staat (Sanne Bakker, zie de
// demo-data in product/chatbot/server.js). Zo is de film één doorlopend verhaal in
// plaats van twee losse schermen.
const FORMULIER = {
  pagina: "schilder",
  sec: 4.0,
  velden: [
    { sel: "#av-naam", tekst: "Sanne Bakker", van: 0.55, tot: 1.15 },
    { sel: "#av-tel", tekst: "06 - 34 56 78 90", van: 1.30, tot: 1.95 },
    { sel: "#av-vraag", tekst: "Buitenwerk van ons pand schilderen. Kunt u langskomen voor een prijs?", van: 2.10, tot: 3.35 },
  ],
};

// De verfscène van de schildersite: een plakkende stage die over 2304px scrollhoogte
// de wand laat verven. Dit is de koude opening van de film.
const VERFSCENE = { van: 1290, tot: 3120, sec: 3.0 };

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

const b = await puppeteer.launch({
  executablePath: chrome, headless: "new",
  protocolTimeout: 60000,
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb", "--disable-lcd-text"],
});
const p = await b.newPage();
await p.setViewport({ width: VW, height: VH, deviceScaleFactor: DSF });
const fouten = [];
p.on("pageerror", e => fouten.push(String(e)));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/** Laadt een pagina en dwingt lazy-loaded beeld en lettertypes af te laden.
 *  Zonder deze voorpas staat er een gat waar een foto hoort: `loading="lazy"`
 *  laadt pas bij het scrollen, en wij screenshotten direct na het scrollen. */
async function open(url) {
  await p.goto(url, { waitUntil: "networkidle2" });
  await p.evaluate(async () => {
    // Elke wacht krijgt een bovengrens. Een `loading="lazy"` afbeelding die na de
    // voorpas weer buiten beeld ligt, vuurt nooit meer load of error af: zonder
    // deze race blijft het script daar voorgoed hangen.
    const max = (belofte, ms) => Promise.race([belofte, new Promise(r => setTimeout(r, ms))]);
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
    await max(document.fonts.ready, 4000);
    await max(Promise.all([...document.images].filter(i => !i.complete)
      .map(i => new Promise(r => { i.onload = i.onerror = r; }))), 6000);
  });
  await new Promise(r => setTimeout(r, 700));
}

/** Neemt één shot op als frame-reeks: scrollt van `van` naar `tot` volgens een
 *  versnellingscurve en legt elk frame vast. */
async function shot(map, van, tot, sec, ease) {
  const dir = path.join(OUT, map);
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(sec * FPS);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    const y = Math.round(van + (tot - van) * ease(t));
    await p.evaluate(yy => window.scrollTo(0, yy), y);
    // Twee animatieframes wachten: de scroll-gedreven CSS-animaties (animation-timeline)
    // worden pas bij de volgende paint doorgerekend. Zonder deze wacht loopt het beeld
    // één frame achter op de scrollstand en trilt de beweging.
    await p.evaluate(() => Promise.race([
      new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))),
      new Promise(r => setTimeout(r, 250)),
    ]));
    await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 96, optimizeForSpeed: true });
  }
  console.log(`  ${map}: ${n} frames (${sec}s)`);
  return n;
}

// ── 1. Koude opening: de wand wordt geverfd ──────────────────────────────────
console.log("open (verfscene, schilder)");
await open(`${BASE}/voorbeelden/schilder-premium.html`);
await shot("00-open", VERFSCENE.van, VERFSCENE.tot, VERFSCENE.sec, easeInOutSine);

// ── 2. De zeven vakken: identieke kadrering, zeven werelden ──────────────────
// Elke shot duwt van de bovenkant 260px naar beneden. De melding "fictief
// voorbeeldbedrijf" staat in frame één en schuift eruit; de kop komt centraal te
// staan. Zelfde beweging, zelfde eindstand, andere wereld: dat is de match-cut.
for (let i = 0; i < VAKKEN.length; i++) {
  const v = VAKKEN[i];
  console.log(`vak ${i + 1}/7: ${v.naam}`);
  await open(`${BASE}/voorbeelden/${v.naam}-premium.html`);

  // De eindstand wordt gemeten, niet gekozen. Elke hero is anders hoog, dus een
  // vaste scrollafstand laat de belknop bij het ene vak netjes landen en bij het
  // andere buiten beeld vallen. Juist die knop is de rode draad van de film: hij
  // moet zeven keer op dezelfde hoogte staan, want dáár zit de match-cut.
  const eind = await p.evaluate(vh => {
    const knop = document.querySelector('.hero a[href^="tel:"]');
    if (!knop) return 260;
    const r = knop.getBoundingClientRect();
    const doel = r.top + window.scrollY + r.height / 2 - vh * 0.62;
    // Ondergrens van 190px: bij de lagere hero's staat de belknop al bijna goed bij
    // scrollstand 0, en dan zou de berekende duw nul worden. Een stilstaande shot
    // tussen zes bewegende shots leest als een hapering, dus er wordt altijd
    // geduwd. De melding "fictief voorbeeldbedrijf" schuift er dan ook netjes uit.
    return Math.max(190, Math.round(doel));
  }, VH);
  console.log(`  eindscroll ${eind}px`);
  await shot(`10-vak-${i + 1}-${v.naam}`, 0, eind, v.sec, easeOutCubic);
}

// ── 3. Het aanvraagformulier wordt ingevuld ──────────────────────────────────
// Dit is het hart van de film geworden: niet de gemiste oproep, maar de bezoeker die
// zijn gegevens achterlaat op je eigen site.
//
// Het typen wordt niet echt getypt maar per frame UITGEREKEND: op filmtijd t staat er
// het eerste n-de deel van de tekst. Echt typen met page.type() heeft een variabele
// snelheid en levert dus bij elke opname een andere film op; dit is deterministisch,
// en het scheelt bovendien dat er niets kan mislopen met toetsaanslagen die in het
// verkeerde veld belanden.
console.log("formulier");
await open(`${BASE}/voorbeelden/${FORMULIER.pagina}-premium.html`);
{
  // De kaart in het midden van beeld zetten en daar laten staan: de beweging in deze
  // shot is het invullen, niet de camera.
  const doel = await p.evaluate(vh => {
    const r = document.querySelector(".aanvraag__kaart").getBoundingClientRect();
    return Math.max(0, Math.round(r.top + window.scrollY + r.height / 2 - vh / 2));
  }, VH);
  await p.evaluate(y => window.scrollTo(0, y), doel);
  await new Promise(r => setTimeout(r, 500));

  const dir = path.join(OUT, "15-formulier");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(FORMULIER.sec * FPS);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    await p.evaluate((velden, t, laatste) => {
      let actief = null;
      for (const v of velden) {
        const el = document.querySelector(v.sel);
        const deel = t <= v.van ? 0 : t >= v.tot ? 1 : (t - v.van) / (v.tot - v.van);
        el.value = v.tekst.slice(0, Math.round(deel * v.tekst.length));
        if (t >= v.van && t < v.tot + 0.12) actief = el;
      }
      // De focusrand meeverplaatsen naar het veld dat "getypt" wordt. Zonder dit
      // gebeurt er tekst zonder dat iets aangeeft waar, en dat leest als een fout.
      if (actief) actief.focus(); else document.activeElement?.blur();
      const knop = document.querySelector(".aanvraag__knop");
      // Laatste frames: de knop staat ingedrukt. De snede naar het dashboard is de
      // verzending; een echt "verzonden"-scherm zou iets tonen wat deze
      // voorbeeldpagina niet doet.
      knop.style.boxShadow = laatste ? "0 0 0 7px rgba(255,255,255,.20)" : "";
      knop.style.transform = laatste ? "translateY(2px)" : "";
    }, FORMULIER.velden, t, i >= n - 11);
    await p.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 96, optimizeForSpeed: true });
  }
  console.log(`  15-formulier: ${n} frames (${FORMULIER.sec}s)`);
}

// ── 4. Het dashboard ─────────────────────────────────────────────────────────
// De simulatie belooft "meteen in je dashboard"; hier wordt die belofte ingelost.
console.log("dashboard");
await p.goto(`${BASE}/dashboard-demo/`, { waitUntil: "networkidle2" });
// Wachten op de DATA en niet op de pagina: het dashboard rendert eerst zijn skelet
// en vult daarna pas de cijfers uit /dashboard-demo/api/*. Screenshotten voor die
// tijd levert een leeg dashboard op, wat precies het tegenovergestelde bewijst van
// wat deze shot moet laten zien.
await p.waitForFunction(() => /€\s?\d/.test(document.body.innerText), { timeout: 20000 });
await new Promise(r => setTimeout(r, 900));
await shot("25-dashboard", DASHBOARD.van, DASHBOARD.tot, DASHBOARD.sec, easeInOutSine);

// ── 4. De kinetische tekstkaarten ────────────────────────────────────────────
// Deze worden GESCRUBD, niet op de wandklok opgenomen: film-showcase-kaarten.html
// zet zijn animaties op `paused` en rekent de stand terug uit de filmtijd. Twee
// keer draaien levert daardoor exact dezelfde frames, en er zit geen jitter in de
// letters (waar je dat nu juist het beste ziet).
// De hook is geen kaart maar een LAAG: doorzichtige PNG's die in de montage over de
// verfscene worden gelegd. Daarom png en `omitBackground`, waar de andere kaarten
// gewoon jpg zijn.
const KAARTEN = [
  { nr: "hook", map: "30-hook", sec: 2.44, laag: true },
  { nr: 1, map: "31-kaart-1", sec: 2.4 },
  { nr: 2, map: "32-kaart-2", sec: 2.0 },
  { nr: 3, map: "33-kaart-3", sec: 3.6 },
  // De pushmelding op het vergrendelscherm. Zelfde scrub-machine, andere pagina.
  { nr: null, map: "35-melding", sec: 2.4, pagina: "film-melding.html" },
];
await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
for (const k of KAARTEN) {
  console.log(`kaart ${k.nr ?? k.pagina}`);
  await p.goto(k.pagina ? `${BASE}/${k.pagina}` : `${BASE}/film-showcase-kaarten.html?kaart=${k.nr}`, { waitUntil: "networkidle2" });
  await p.evaluate(() => document.fonts.ready);
  const dir = path.join(OUT, k.map);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(k.sec * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.setTijd(t), i / FPS);
    const naam = `f${String(i).padStart(4, "0")}.${k.laag ? "png" : "jpg"}`;
    await p.screenshot(k.laag
      ? { path: path.join(dir, naam), type: "png", omitBackground: true }
      : { path: path.join(dir, naam), type: "jpeg", quality: 96, optimizeForSpeed: true });
  }
  console.log(`  ${n} frames (${k.sec}s)`);
}

// ── 4. De simulatie: het vangnet dat de gemiste oproep opvangt ───────────────
// Hergebruikt het bestaande opnamepodium, dat de ECHTE hero-simulatie
// schermvullend afspeelt. De film kan daardoor niets tonen wat de site niet doet.
console.log("simulatie (opnamepodium)");
await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await p.goto(`${BASE}/film-opnamepodium.html`, { waitUntil: "networkidle2" });
await p.waitForFunction(() => document.querySelector("[data-phone]")?.getAttribute("data-state") === "ringing", { timeout: 20000 });
{
  const dir = path.join(OUT, "20-sim");
  fs.mkdirSync(dir, { recursive: true });
  // Hier wordt NIET gescrolld: de simulatie loopt op de wandklok. Frames worden op
  // vaste tijdstippen gepakt zodat filmtijd en simulatietijd één op één lopen en de
  // montage op de gebeurtenissen uit app.js kan knippen.
  const t0 = Date.now(), DUUR = 14000, STAP = 1000 / FPS;
  let n = 0;
  while (Date.now() - t0 < DUUR) {
    const wacht = t0 + n * STAP - Date.now();
    if (wacht > 0) await new Promise(r => setTimeout(r, wacht));
    await p.screenshot({ path: path.join(dir, `f${String(n).padStart(4, "0")}.jpg`), type: "jpeg", quality: 96, optimizeForSpeed: true });
    n++;
  }
  console.log(`  20-sim: ${n} frames`);
  console.log("  eindstand:", await p.evaluate(() => document.querySelector("[data-phone]").getAttribute("data-state")));
}

console.log("console-fouten:", fouten.length ? fouten : "geen");
await b.close();
