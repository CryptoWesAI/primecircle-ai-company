// Controleert de twee interne filmpagina's: het opnamepodium en de tekstkaarten.
//
// Waarom dit bestaat: op 21 augustus 2026 zijn allebei de pagina's vak-VARIABEL
// gemaakt (?vak=verdelger, ?set=verdelger) zodat er niet per vakfilm een kopie
// bijkomt. Dat is precies het soort wijziging waarbij je de nieuwe variant test en
// vergeet dat er twee eerdere films op de OUDE, parameterloze versie zijn gemonteerd.
// Die films zijn alleen reproduceerbaar zolang de pagina zonder parameter exact toont
// wat hij altijd toonde.
//
// Wat deze test WEL vindt: een variant die de standaard overschrijft, een variant die
// stilletjes niet aanslaat, en een producttekst die per vak is gaan afwijken terwijl
// dat de echte tekst uit het product is.
// Wat deze test NIET vindt: of het er goed uitziet. Daarvoor zijn de frames.
//
// Draaien:  node tests/filmpaginas.mjs      (vanuit sites/belvanger/)
// Exitcode: 0 = goed, 1 = er klopt iets niet.
import puppeteer from "puppeteer-core";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HIER, "..", "site");

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  process.env.CHROME_PATH,
].filter(Boolean).find((p) => fs.existsSync(p));
if (!CHROME) { console.error("Geen Chrome of Edge gevonden. Zet CHROME_PATH."); process.exit(1); }

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const doel = path.join(SITE, rel);
  if (!doel.startsWith(SITE) || !fs.existsSync(doel) || fs.statSync(doel).isDirectory()) {
    return res.writeHead(404).end("404");
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(doel)] || "application/octet-stream" });
  fs.createReadStream(doel).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASIS = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const fouten = [];
function check(naam, waar) {
  console.log(`  ${waar ? "ok  " : "FOUT"}  ${naam}`);
  if (!waar) fouten.push(naam);
}

console.log("Filmpagina's\n");

const GEVALLEN = [
  // [naam, url, moet bevatten, mag NIET bevatten]
  ["podium zonder ?vak= is onveranderd", "/film-opnamepodium.html", "14 woningen", "wespennest"],
  ["podium ?vak=verdelger toont de wespencasus", "/film-opnamepodium.html?vak=verdelger", "wespennest", "14 woningen"],
  ["kaart 1 zonder ?set= is onveranderd", "/film-tekstkaarten.html?kaart=1", "steiger", "handen vol"],
  ["kaart 1 ?set=verdelger toont de nieuwe tekst", "/film-tekstkaarten.html?set=verdelger&kaart=1", "handen vol", "steiger"],
  ["kaart 2 is voor elke film gelijk", "/film-tekstkaarten.html?set=verdelger&kaart=2", "Opgevangen", null],
];

for (const [naam, url, moet, magNiet] of GEVALLEN) {
  const p = await browser.newPage();
  const consolefouten = [];
  p.on("pageerror", (e) => consolefouten.push(String(e)));
  await p.setViewport({ width: 1080, height: 1920 });
  await p.goto(BASIS + url, { waitUntil: "networkidle2" });
  const tekst = await p.evaluate(() => document.body.innerText);
  check(naam, tekst.includes(moet));
  if (magNiet) check(`${naam}: geen resten van de andere variant`, !tekst.includes(magNiet));
  check(`${naam}: geen consolefouten`, consolefouten.length === 0);
  await p.close();
}

// De producttekst zelf mag NOOIT per vak verschillen: dat is de echte tekst die het
// product verstuurt, en een film die er iets anders van maakt belooft iets anders dan
// het product doet.
const p = await browser.newPage();
await p.goto(`${BASIS}/film-opnamepodium.html?vak=verdelger`, { waitUntil: "networkidle2" });
const t = await p.evaluate(() => document.body.innerText);
check("automatisch terugbericht is ongewijzigd", t.includes("Sorry, we misten je belletje!"));
check("eerlijkheidsregel staat in beeld", t.includes("Voorbeeld ter illustratie, geen echte klant"));
check("tijdstempel van de gemiste oproep staat er", t.includes("14:32"));
await p.close();

await browser.close();
server.close();
console.log(fouten.length ? `\n${fouten.length} probleem(en).` : "\nGeen problemen.");
process.exit(fouten.length ? 1 : 0);
