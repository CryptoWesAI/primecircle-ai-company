#!/usr/bin/env node
// Keurt de websites uit een prospect-CSV op de dingen die vertrouwen maken of breken
// bij een klant die op zijn telefoon staat. Nul dependencies.
//
//   node tools/website-keuren.mjs --in tools/prospects.csv --uit tools/prospects-gekeurd.csv
//
// WAT DIT WEL MEET: hygiëne. Bestaat de site, doet hij het op een telefoon, kun je het
// nummer aantikken, laadt hij snel, staan er vertrouwenssignalen op, is hij nog van dit jaar.
//
// WAT DIT NIET MEET: of de site mooi is. Een machine kan niet zien of een ontwerp
// "award winning" is, en dat is ook de verkeerde lat: prijzen winnen sites voor
// vakjury's, klanten haken af op een niet-klikbaar telefoonnummer. Doe de menselijke
// vijf-secondentest uit docs/templates/belvanger-prospectlijst-en-websitekeuring.md
// naast deze score. De score wijst je aan wélke sites je met je ogen moet bekijken.

import { readFileSync, writeFileSync } from 'node:fs'

const TIMEOUT_MS = 12000
const GELIJKTIJDIG = 4
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36'

function args() {
  const a = {}
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1]
  return a
}

// Kleine CSV-lezer die aanhalingstekens respecteert. Bewust geen dependency:
// dit bestand moet over twee jaar nog draaien zonder npm install.
function leesCsv(tekst) {
  const rijen = []
  let veld = ''
  let rij = []
  let inQuote = false
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i]
    if (inQuote) {
      if (c === '"') {
        if (tekst[i + 1] === '"') { veld += '"'; i++ } else inQuote = false
      } else veld += c
    } else if (c === '"') inQuote = true
    else if (c === ',') { rij.push(veld); veld = '' }
    else if (c === '\n') { rij.push(veld); rijen.push(rij); rij = []; veld = '' }
    else if (c !== '\r') veld += c
  }
  if (veld || rij.length) { rij.push(veld); rijen.push(rij) }
  const kop = rijen.shift()
  return rijen
    .filter((r) => r.some((v) => v !== ''))
    .map((r) => Object.fromEntries(kop.map((k, i) => [k, r[i] ?? ''])))
}

function csvVeld(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const NIETSZEGGENDE_TITELS = [
  'home', 'homepage', 'welkom', 'website', 'mijn website', 'nieuwe website',
  'untitled', 'index', 'wordpress site', 'een nieuwe wordpress site',
  'just another wordpress site', 'site is under construction', 'coming soon',
  'in aanbouw', 'onder constructie',
]

function isSociaalKanaal(url) {
  return /(facebook\.com|instagram\.com|linkedin\.com|nl\.linkedin)/i.test(url)
}
function isMarktplaatsProfiel(url) {
  return /(werkspot\.nl|solvari\.nl|slimster\.nl|trustoo\.nl|homedeal|zoofy|klussendirect|bobex)/i.test(url)
}

async function haal(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  const begin = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'nl-NL,nl;q=0.9' },
    })
    const html = await res.text()
    return { ok: true, status: res.status, url: res.url, html, ms: Date.now() - begin }
  } catch (err) {
    return { ok: false, fout: err.name === 'AbortError' ? 'timeout' : err.message, ms: Date.now() - begin }
  } finally {
    clearTimeout(t)
  }
}

// Alles wat je zonder één netwerkverzoek al kunt vaststellen. Scheelt tijd en,
// belangrijker, het zijn precies de drie gevallen met de hoogste kans.
function keurZonderFetch(rij) {
  const ruw = (rij.website || '').trim()

  if (!ruw) {
    return {
      score: 0,
      oordeel: 'geen website',
      kans: 'hoog',
      bevindingen: 'geen website gevonden in de bron',
      gespreksopener: 'Hij heeft geen site. Dit is je makkelijkste gesprek: laat de voorbeeldsite van zijn vak zien.',
    }
  }
  if (isSociaalKanaal(ruw)) {
    return {
      score: 5,
      oordeel: 'alleen een Facebook-pagina',
      kans: 'hoog',
      bevindingen: 'de "website" is een socialmediapagina, geen eigen site',
      gespreksopener: 'Zijn hele hebben en houden staat op een platform dat hij niet bezit. Eigendom is hier het argument, niet design.',
    }
  }
  if (isMarktplaatsProfiel(ruw)) {
    return {
      score: 5,
      oordeel: 'alleen een marktplaatsprofiel',
      kans: 'hoog',
      bevindingen: 'de "website" is een profiel op een leadmarktplaats',
      gespreksopener: 'Hij betaalt vrijwel zeker per lead. Dit is de Lekcheck-prospect bij uitstek: vraag naar zijn factuur.',
    }
  }

  return { url: /^https?:\/\//i.test(ruw) ? ruw : `https://${ruw}` }
}

async function keurLive(rij) {
  const voor = keurZonderFetch(rij)
  if (voor.oordeel) return voor // geen site, social of marktplaats: klaar zonder fetch

  const res = await haal(voor.url)
  const punten = []
  const gemist = []
  let score = 0
  const add = (p, label) => { score += p; punten.push(label) }
  const mis = (label) => gemist.push(label)

  if (!res.ok) {
    return {
      score: 0,
      oordeel: res.fout === 'timeout' ? 'site reageert niet (timeout)' : `site onbereikbaar (${res.fout})`,
      kans: 'hoog',
      bevindingen: `${voor.url} laadde niet binnen ${TIMEOUT_MS / 1000}s`,
      gespreksopener: 'Zijn site doet het niet. Dat is geen verkooppraatje maar een feit dat hij zelf niet weet.',
    }
  }
  if (res.status >= 400) {
    return {
      score: 0,
      oordeel: `site geeft HTTP ${res.status}`,
      kans: 'hoog',
      bevindingen: `${voor.url} gaf status ${res.status}`,
      gespreksopener: 'Zijn site geeft een foutpagina. Meld dat gewoon, zonder aanbod erachteraan.',
    }
  }

  const html = res.html
  const laag = html.toLowerCase()
  const bytes = Buffer.byteLength(html, 'utf8')

  // 1. HTTPS. Een browser die "niet veilig" toont bij een loodgieter is direct verlies.
  if (res.url.startsWith('https://')) add(10, 'https')
  else mis('GEEN https, browser toont "niet veilig"')

  // 2. Mobiel. Zwaarst gewogen: de klant van een vakman staat vrijwel altijd op zijn telefoon.
  if (/<meta[^>]+name=["']viewport["']/i.test(html)) add(15, 'mobiel geschikt')
  else mis('GEEN mobiele weergave, onleesbaar op een telefoon')

  // 3. Klikbaar nummer. Dit is letterlijk de Belvanger-these: een nummer dat je niet
  //    kunt aantikken is een gesprek dat niet gevoerd wordt.
  if (/href=["']tel:/i.test(html)) add(15, 'nummer aantikbaar')
  else mis('nummer NIET aantikbaar (geen tel:-link)')

  // 4. Snelheid en gewicht.
  if (res.ms < 2500 && bytes < 2_000_000) add(10, `snel (${res.ms}ms)`)
  else if (res.ms < 5000) add(5, `matig (${res.ms}ms)`)
  else mis(`traag: ${res.ms}ms`)

  // 5. Titel.
  const titel = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '').trim()
  if (titel && !NIETSZEGGENDE_TITELS.includes(titel.toLowerCase()) && titel.length > 5) add(10, 'zinvolle titel')
  else mis(`nietszeggende titel: "${titel || 'ontbreekt'}"`)

  // 6. Nog van dit jaar? Een copyright uit 2019 vertelt een klant dat er niemand thuis is.
  const jaren = [...html.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,20}(20\d{2})/gi)].map((m) => Number(m[1]))
  const nu = new Date().getFullYear()
  const jongste = jaren.length ? Math.max(...jaren) : null
  if (jongste && jongste >= nu - 1) add(10, `actueel (${jongste})`)
  else if (jongste) mis(`copyright staat nog op ${jongste}`)
  else mis('geen jaartal/copyright gevonden')

  // 7. Vertrouwenssignalen. Dit is wat een klant echt geruststelt, meer dan het ontwerp.
  let vertrouwen = 0
  const heeftKvk = /\bkvk[\s.:-]*\d{8}\b/i.test(laag) || /kamer van koophandel/i.test(laag)
  const heeftAdres = /\b\d{4}\s?[a-z]{2}\b/i.test(html) // NL postcode
  const heeftReviews = /(review|beoordeling|klanten vertellen|referenti|google\s*review)/i.test(laag)
  if (heeftKvk) vertrouwen += 5
  if (heeftAdres) vertrouwen += 5
  if (heeftReviews) vertrouwen += 5
  add(vertrouwen, `vertrouwenssignalen ${vertrouwen}/15`)
  if (!heeftKvk) mis('geen KvK-nummer zichtbaar')
  if (!heeftAdres) mis('geen adres/postcode zichtbaar')
  if (!heeftReviews) mis('geen reviews of referenties')

  // 8. Contactmogelijkheid naast bellen.
  if (/<form/i.test(html) || /href=["']mailto:/i.test(html)) add(5, 'formulier of e-mail')
  else mis('geen formulier en geen e-mailadres')

  // 9. Parkeerpagina of bouwput.
  const parked = /(under construction|coming soon|binnenkort online|in aanbouw|domein te koop|this domain)/i.test(laag)
  if (parked) {
    return {
      score: 0,
      oordeel: 'parkeerpagina / in aanbouw',
      kans: 'hoog',
      bevindingen: 'de pagina is een bouwput of parkeerpagina',
      gespreksopener: 'Er staat een bouwput waar zijn visitekaartje hoort. Dat is een concreet feit om mee te openen.',
    }
  }

  const kans = score < 45 ? 'hoog' : score < 70 ? 'midden' : 'laag'
  const oordeel = score < 30 ? 'slecht' : score < 45 ? 'zwak' : score < 70 ? 'redelijk' : score < 85 ? 'goed' : 'sterk'

  return {
    score,
    oordeel,
    kans,
    bevindingen: gemist.length ? gemist.join(' | ') : `in orde: ${punten.join(', ')}`,
    gespreksopener:
      kans === 'hoog'
        ? 'Noem één concreet gebrek, geen lijst. Eén feit landt, vijf feiten voelen als een aanval.'
        : kans === 'midden'
        ? 'De site is niet het probleem. Ga hier op de bereikbaarheid zitten, niet op het ontwerp.'
        : 'Site is op orde. Verkoop hier alleen het vangnet, en zeg er eerlijk bij dat zijn site prima is.',
  }
}

async function main() {
  const a = args()
  const bron = a.in ?? 'tools/prospects.csv'
  const uit = a.uit ?? 'tools/prospects-gekeurd.csv'

  const rijen = leesCsv(readFileSync(bron, 'utf8'))
  if (!rijen.length) {
    console.error(`${bron} bevat geen rijen. Draai eerst prospects-verzamelen.mjs.`)
    process.exit(1)
  }
  console.error(`${rijen.length} rijen gelezen uit ${bron}, keuren met ${GELIJKTIJDIG} tegelijk\n`)

  const uitkomsten = new Array(rijen.length)
  let volgende = 0
  let klaar = 0

  async function werker() {
    while (volgende < rijen.length) {
      const i = volgende++
      uitkomsten[i] = await keurLive(rijen[i])
      klaar++
      process.stderr.write(`\r  ${klaar}/${rijen.length}`)
    }
  }
  await Promise.all(Array.from({ length: GELIJKTIJDIG }, werker))
  process.stderr.write('\n')

  const kop = [...Object.keys(rijen[0] ?? {}), 'score', 'oordeel', 'kans', 'bevindingen', 'gespreksopener']
  const regels = rijen.map((r, i) => {
    const u = uitkomsten[i]
    return kop.map((k) => csvVeld(k in r ? r[k] : u[k])).join(',')
  })

  // Hoogste kans bovenaan: daar begint je belronde.
  const rang = { hoog: 0, midden: 1, laag: 2 }
  const gesorteerd = regels
    .map((regel, i) => ({ regel, u: uitkomsten[i] }))
    .sort((x, y) => rang[x.u.kans] - rang[y.u.kans] || x.u.score - y.u.score)
    .map((x) => x.regel)

  writeFileSync(uit, `${[kop.join(','), ...gesorteerd].join('\n')}\n`)

  const tel = (k) => uitkomsten.filter((u) => u.kans === k).length
  console.error(`\nWeggeschreven naar ${uit}`)
  console.error(`  kans hoog:   ${tel('hoog')}  <- hier begin je met bellen`)
  console.error(`  kans midden: ${tel('midden')}`)
  console.error(`  kans laag:   ${tel('laag')}`)
  console.error(`\nDe score meet hygiëne, niet schoonheid. Bekijk de top van de lijst met je`)
  console.error(`eigen ogen via de vijf-secondentest voordat je belt.`)
}

main().catch((err) => {
  console.error(`\nMislukt: ${err.message}`)
  process.exit(1)
})
