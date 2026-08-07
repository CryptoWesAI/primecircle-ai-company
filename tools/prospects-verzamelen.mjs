#!/usr/bin/env node
// Verzamelt vakbedrijven in een straal rond een punt uit OpenStreetMap (Overpass API)
// en schrijft ze als CSV weg. Nul dependencies, geen API-sleutel nodig.
//
//   node tools/prospects-verzamelen.mjs                       (standaard: Leeuwarden, 40 km)
//   node tools/prospects-verzamelen.mjs --plaats "Drachten" --straal 25
//   node tools/prospects-verzamelen.mjs --lat 53.2012 --lon 5.7999 --straal 40
//
// Let op, lees dit voordat je de uitkomst vertrouwt:
// OSM-dekking van Nederlandse ZZP-vakmensen is DUN en scheef. Bedrijven met een
// fysieke winkel of werkplaats staan erin, de loodgieter die vanuit zijn bus werkt
// vaak niet. Reken op tientallen treffers, niet op honderd. Dit is bron 1 van 3;
// de andere twee staan in docs/templates/belvanger-prospectlijst-en-websitekeuring.md.

import { writeFileSync } from 'node:fs'

const VAKKEN = {
  plumber: 'loodgieter',
  electrician: 'elektricien',
  painter: 'schilder',
  roofer: 'dakdekker',
  gardener: 'hovenier',
  carpenter: 'timmerman',
  hvac: 'installateur',
  builder: 'aannemer',
  handyman: 'klusbedrijf',
  tiler: 'tegelzetter',
  stonemason: 'stukadoor',
  window_construction: 'kozijnen',
  scaffolder: 'steigerbouw',
  insulation: 'isolatie',
  floorer: 'vloerenlegger',
  glaziery: 'glaszetter',
}

// Standaard: de eigen regio van de founder. Overschrijven met --plaats / --straal.
const STANDAARD_PLAATS = 'Leeuwarden'
const STANDAARD_STRAAL_KM = 40

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter', // terugval als de eerste plat ligt
]
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const UA = 'belvanger-prospects/1.0 (eigen onderzoek; info@belvanger.nl)'

function args() {
  const a = {}
  for (let i = 2; i < process.argv.length; i += 2) {
    a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1]
  }
  return a
}

async function plaatsNaarCoordinaat(plaats) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(plaats)}&countrycodes=nl&format=json&limit=1`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Nominatim gaf ${res.status}`)
  const [hit] = await res.json()
  if (!hit) throw new Error(`Plaats "${plaats}" niet gevonden`)
  return { lat: Number(hit.lat), lon: Number(hit.lon), naam: hit.display_name }
}

function bouwQuery(lat, lon, straalMeter) {
  const craft = Object.keys(VAKKEN).join('|')
  return `[out:json][timeout:180];
(
  nwr(around:${straalMeter},${lat},${lon})["craft"~"^(${craft})$"];
  nwr(around:${straalMeter},${lat},${lon})["shop"="trade"];
);
out center tags;`
}

async function haalOverpass(query) {
  let laatsteFout
  for (const endpoint of OVERPASS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: new URLSearchParams({ data: query }),
      })
      if (!res.ok) throw new Error(`${endpoint} gaf ${res.status}`)
      return await res.json()
    } catch (err) {
      laatsteFout = err
      console.error(`  ${endpoint} mislukt: ${err.message}, volgende proberen`)
    }
  }
  throw laatsteFout
}

// Een telefoonnummer is pas bruikbaar als je het kunt intoetsen. Normaliseer naar
// +31-notatie en gooi weg wat geen NL-nummer is; een half nummer kost je een belronde.
function normaliseerTelefoon(ruw) {
  if (!ruw) return ''
  const eerste = ruw.split(/[;,]/)[0].trim()
  const cijfers = eerste.replace(/[^\d+]/g, '')
  let n = cijfers
  if (n.startsWith('0031')) n = `+31${n.slice(4)}`
  else if (n.startsWith('00 31')) n = `+31${n.slice(5)}`
  else if (n.startsWith('0')) n = `+31${n.slice(1)}`
  if (!n.startsWith('+31')) return ''
  const rest = n.slice(3)
  if (rest.length !== 9) return '' // NL nationaal nummer is altijd 9 cijfers na +31
  return n
}

function isMobiel(tel) {
  return tel.startsWith('+316')
}

function csvVeld(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  const a = args()
  const straal = Number(a.straal ?? STANDAARD_STRAAL_KM) * 1000
  const uit = a.uit ?? 'tools/prospects.csv'

  let lat = Number(a.lat)
  let lon = Number(a.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const plaats = a.plaats ?? STANDAARD_PLAATS
    console.error(`Plaats opzoeken: ${plaats}`)
    const punt = await plaatsNaarCoordinaat(plaats)
    lat = punt.lat
    lon = punt.lon
    console.error(`  gevonden: ${punt.naam} (${lat}, ${lon})`)
  }

  console.error(`Overpass bevragen, straal ${straal / 1000} km rond ${lat},${lon}`)
  const data = await haalOverpass(bouwQuery(lat, lon, straal))

  const rijen = []
  const gezien = new Set()
  for (const el of data.elements ?? []) {
    const t = el.tags ?? {}
    const naam = t.name || t.operator || ''
    if (!naam) continue // zonder naam kun je niemand aanspreken

    const tel = normaliseerTelefoon(t.phone || t['contact:phone'] || t['contact:mobile'] || t.mobile)
    const site = (t.website || t['contact:website'] || t.url || '').split(/[;,]/)[0].trim()

    // Ontdubbel op naam plus nummer: dezelfde zaak staat vaak als node én als way in OSM.
    const sleutel = `${naam.toLowerCase()}|${tel}`
    if (gezien.has(sleutel)) continue
    gezien.add(sleutel)

    rijen.push({
      naam,
      vak: VAKKEN[t.craft] ?? (t.shop === 'trade' ? 'bouwhandel' : t.craft ?? ''),
      telefoon: tel,
      mobiel: tel ? (isMobiel(tel) ? 'ja' : 'nee') : '',
      website: site,
      plaats: t['addr:city'] ?? '',
      straat: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '),
      email: (t.email || t['contact:email'] || '').split(/[;,]/)[0].trim(),
      osm: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    })
  }

  // Belbaar eerst: een prospect zonder nummer kun je niet testen, en een mobiel
  // nummer is bij een ZZP'er vrijwel altijd het nummer dat een klant ook belt.
  rijen.sort((x, y) => {
    const score = (r) => (r.telefoon ? (r.mobiel === 'ja' ? 2 : 1) : 0)
    return score(y) - score(x) || x.naam.localeCompare(y.naam)
  })

  const kop = ['naam', 'vak', 'telefoon', 'mobiel', 'website', 'plaats', 'straat', 'email', 'osm']
  const csv = [kop.join(','), ...rijen.map((r) => kop.map((k) => csvVeld(r[k])).join(','))].join('\n')
  writeFileSync(uit, `${csv}\n`)

  const metTel = rijen.filter((r) => r.telefoon).length
  const metSite = rijen.filter((r) => r.website).length
  console.error(`\n${rijen.length} bedrijven weggeschreven naar ${uit}`)
  console.error(`  met bruikbaar telefoonnummer: ${metTel}`)
  console.error(`  met eigen website:            ${metSite}`)
  if (rijen.length < 40) {
    console.error(`\nMinder dan 40 treffers. Dat is normaal: OSM kent de vakman-zonder-winkel`)
    console.error(`slecht. Vul aan via bron 2 en 3 uit docs/templates/belvanger-prospectlijst-en-websitekeuring.md`)
    console.error(`of vergroot de straal (--straal 40).`)
  }
}

main().catch((err) => {
  console.error(`\nMislukt: ${err.message}`)
  process.exit(1)
})
