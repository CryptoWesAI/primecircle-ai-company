// PrimeCircle, uptime-controle.
//
// WAAROM DIT BESTAAT. Op 2026-08-28 lag de complete klantenportefeuille er
// minstens een half uur uit (Traefik kwam niet omhoog na een herstart) en niets
// gaf een signaal. Het kwam aan het licht doordat er toevallig een deploy
// klaarstond. Dit script is het signaal dat er toen niet was.
//
// TWEE ONTWERPBESLISSINGEN DIE ALLES BEPALEN.
//
//   1. HET DRAAIT NIET OP DE VPS. Een bewaker die op de machine staat die hij
//      bewaakt, gaat mee onderuit en zwijgt precies wanneer het ertoe doet.
//      Daarom draait dit in GitHub Actions; zie .github/workflows/uptime.yml.
//   2. STATUS 200 IS NIET GENOEG. Een lege pagina, een foutpagina van de proxy
//      of een half opgestarte container geeft ook 200. Daarom moet er per site
//      een stuk tekst op de pagina staan dat er hoort te staan.
//
// Geen afhankelijkheden, zodat het ook lokaal in één commando draait:
//
//   node tools/uptime/controleer.mjs            menselijke uitvoer
//   node tools/uptime/controleer.mjs --json     regel JSON, voor de workflow
//
// Afsluitcode 0 = alles in orde, 1 = er is iets stuk.
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
// Een andere lijst meegeven kan, en dat is niet voor de sier: zo is de bewaker
// zelf te toetsen met adressen die met opzet stuk zijn. Een bewaker die nog
// nooit alarm heeft geslagen, weet je niet of hij dat kan.
const LIJST = (process.argv.find((a) => a.startsWith('--sites=')) || '').slice(8) || 'sites.json';
const CFG = JSON.parse(fs.readFileSync(path.resolve(HIER, LIJST), 'utf8'));
const ALS_JSON = process.argv.includes('--json');

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

/* Het certificaat apart opvragen. Traefik vernieuwt via Let's Encrypt, en als
   die vernieuwing stilletjes stukgaat is elke site over negentig dagen
   onbereikbaar zonder dat er iets misgaat wat je nu al ziet. Twaalf dagen van
   tevoren waarschuwen geeft ruim tijd. */
function certificaat(host) {
  return new Promise((klaar) => {
    const sok = tls.connect({ host, port: 443, servername: host, timeout: 10000 }, () => {
      const c = sok.getPeerCertificate();
      sok.end();
      if (!c || !c.valid_to) return klaar(null);
      const dagen = Math.floor((new Date(c.valid_to) - new Date()) / 86400000);
      klaar({ dagen, tot: c.valid_to });
    });
    sok.on('error', () => klaar(null));
    sok.on('timeout', () => { sok.destroy(); klaar(null); });
  });
}

async function haal(url, timeout) {
  const stop = AbortSignal.timeout(timeout);
  const begin = Date.now();
  const antwoord = await fetch(url, {
    redirect: 'follow',
    signal: stop,
    headers: { 'user-agent': 'PrimeCircle-uptime/1 (+github actions)' }
  });
  const tekst = await antwoord.text();
  return { status: antwoord.status, ms: Date.now() - begin, tekst, eind: antwoord.url };
}

/* Een site wordt pas stuk genoemd na meerdere pogingen met pauze ertussen. Eén
   mislukte poging is bijna altijd een hik in het netwerk, en een bewaker die
   daarop meldt, leer je binnen een week negeren. */
async function controleer(site) {
  const uitkomst = { ...site, ok: false, reden: null, status: null, ms: null, pogingen: 0 };
  for (let p = 1; p <= CFG.pogingen; p++) {
    uitkomst.pogingen = p;
    try {
      const r = await haal(site.url, CFG.time_out_ms);
      uitkomst.status = r.status;
      uitkomst.ms = r.ms;
      if (r.status < 200 || r.status >= 400) {
        uitkomst.reden = `status ${r.status}`;
      } else if (site.bevat && !r.tekst.includes(site.bevat)) {
        // Dit is de vangst die een gewone pingcontrole mist.
        uitkomst.reden = `pagina antwoordt met ${r.status} maar mist "${site.bevat}"`;
      } else {
        uitkomst.ok = true;
        uitkomst.reden = null;
        break;
      }
    } catch (e) {
      uitkomst.status = null;
      uitkomst.reden = String(e && e.message ? e.message : e).slice(0, 120);
    }
    if (p < CFG.pogingen) await wacht(CFG.wacht_ms);
  }

  const host = new URL(site.url).hostname;
  const cert = await certificaat(host);
  if (cert) {
    uitkomst.cert_dagen = cert.dagen;
    if (cert.dagen <= CFG.tls_waarschuwing_dagen) {
      uitkomst.cert_waarschuwing = `certificaat verloopt over ${cert.dagen} dagen`;
    }
  }
  return uitkomst;
}

const resultaten = [];
for (const site of CFG.sites) resultaten.push(await controleer(site));

const stuk = resultaten.filter((r) => !r.ok);
const certWaarschuwingen = resultaten.filter((r) => r.cert_waarschuwing);
const klantStuk = stuk.filter((r) => r.klant);

if (ALS_JSON) {
  console.log(JSON.stringify({
    tijdstip: new Date().toISOString(),
    totaal: resultaten.length,
    stuk: stuk.length,
    klantStuk: klantStuk.length,
    certWaarschuwingen: certWaarschuwingen.length,
    resultaten
  }));
} else {
  for (const r of resultaten) {
    const merk = r.ok ? 'ok  ' : 'STUK';
    const extra = r.ok
      ? `${String(r.ms).padStart(5)}ms${r.cert_waarschuwing ? '   ' + r.cert_waarschuwing : ''}`
      : r.reden;
    console.log(`  ${merk}  ${r.wat.padEnd(28)} ${extra}`);
  }
  console.log('');
  if (stuk.length === 0 && certWaarschuwingen.length === 0) {
    console.log(`Alles in de lucht (${resultaten.length} adressen).`);
  } else {
    if (stuk.length) console.log(`${stuk.length} stuk, waarvan ${klantStuk.length} met een klant erachter.`);
    for (const r of certWaarschuwingen) console.log(`Let op: ${r.wat}, ${r.cert_waarschuwing}.`);
  }
}

process.exit(stuk.length ? 1 : 0);
