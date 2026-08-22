// Bouwt het geluidsspoor van de verdelgerfilm als één WAV. Geen muziek.
//
// Waarom synthetiseren: de simulatie maakt haar tonen met de Web Audio API en die
// komen niet mee in een screenshot-reeks. Waarom geen muziekbed: bij deze doelgroep
// is dat het snelste signaal dat er een bureau aan te pas kwam. En bij Seedance is
// het ook nog een harde faalregel: het model laat een gegenereerde score door de
// audio-fingerprint vallen en blokkeert de hele render NA het rekenen.
// Zie .claude/skills/seedance-video/SKILL.md §3.
//
// Alle tonen komen letterlijk uit js/app.js: 480/620 Hz voor de tweetoons-beltoon,
// 880 Hz voor een bericht, 660+880 voor een binnenkomende lead. De film laat dus ook
// in geluid niets horen wat de site zelf niet doet.
//
//   node maak-geluid-verdelger.mjs <werkmap> [--zonder-rinkel]
//
// --zonder-rinkel laat de eerste zeven seconden leeg, voor als act 1 een echte
// gegenereerde shot MET eigen geluid is. Dan komt het rinkelen daaruit.
import fs from "node:fs";
import path from "node:path";

const WERKMAP = path.resolve(process.argv[2] || "werkmap-verdelger");
const ZONDER_RINKEL = process.argv.includes("--zonder-rinkel");
// Act 1 duurt niet altijd even lang: de eerste take was 7 seconden zonder tekst, de
// tweede 10 met een gesproken slotwoord. De montage meet de echte duur en geeft hem
// hier door, want alle simulatietonen erna schuiven mee.
const ACT1_ARG = process.argv.find((a) => a.startsWith("--act1="));
// Kaart 1 vervalt zodra act 1 de grap zelf draagt: twee grappen achter elkaar
// verzwakken elkaar. De montage geeft door welke kaarten er staan.
const ZONDER_KAART1 = process.argv.includes("--zonder-kaart1");

// De simulatieduur komt uit de opname zelf, niet uit een getal dat hier verzint hoe
// lang hij duurde. Loopt de opname anders, dan schuift het geluid vanzelf mee.
const opname = JSON.parse(fs.readFileSync(path.join(WERKMAP, "opname.json"), "utf8"));
const ACT1 = ACT1_ARG ? Number(ACT1_ARG.split("=")[1]) : 7.0;   // de gegenereerde shot
const SIM = opname.seconden;      // de simulatie op ware snelheid
const K1 = ZONDER_KAART1 ? 0 : 3.4, K2 = 4.4;                  // de tekstkaarten
const T_SIM = ACT1, T_K1 = ACT1 + SIM, T_K2 = T_K1 + K1;

const SR = 48000;
const DUUR = ACT1 + SIM + K1 + K2;
const N = Math.round(SR * DUUR);
const L = new Float64Array(N), R = new Float64Array(N);

const env = (i, n, aanslag, uitloop) => {
  const t = i / SR, T = n / SR;
  return Math.max(0, Math.min(1, t / aanslag) * Math.min(1, (T - t) / uitloop));
};

function toon(t, hz, dur, gain, vorm = "sine") {
  const start = Math.round(t * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const k = start + i;
    if (k < 0 || k >= N) continue;
    const f = (i / SR) * hz;
    const fase = f - Math.floor(f);
    const s = vorm === "triangle" ? 4 * Math.abs(fase - 0.5) - 1 : Math.sin(2 * Math.PI * f);
    const g = gain * env(i, n, 0.012, 0.08);
    L[k] += s * g; R[k] += s * g;
  }
}

/** Lage klap met snelle demping: de hartslag onder de montage. */
function klap(t, gain = 0.55, hz = 58) {
  const start = Math.round(t * SR), n = Math.round(0.34 * SR);
  for (let i = 0; i < n; i++) {
    const k = start + i;
    if (k < 0 || k >= N) continue;
    const tt = i / SR;
    const s = Math.sin(2 * Math.PI * (hz * tt - 6 * tt * tt));
    const g = gain * Math.exp(-tt * 11) * Math.min(1, tt / 0.004);
    L[k] += s * g; R[k] += s * g;
  }
}

const bel = (t) => { toon(t, 480, 0.35, 0.32); toon(t + 0.26, 620, 0.35, 0.32); };
const plop = (t) => toon(t, 880, 0.18, 0.17, "triangle");
const vangst = (t) => { toon(t, 660, 0.15, 0.19, "triangle"); toon(t + 0.13, 880, 0.20, 0.19, "triangle"); };

// ── Ruimtetoon ───────────────────────────────────────────────────────────────
// Zonder dit klinken de gaten tussen de tonen als een kapot bestand.
let vorige = 0, traag = 0;
for (let i = 0; i < N; i++) {
  vorige = (vorige + 0.02 * (Math.random() * 2 - 1)) / 1.02;
  traag += (vorige - traag) * 0.0016;
  const bed = traag * 5.5 * 0.085 + Math.sin(2 * Math.PI * 47 * (i / SR)) * 0.004;
  L[i] += bed; R[i] += bed;
}

// ── Act 1: de telefoon gaat, en houdt dan op ─────────────────────────────────
// Vier keer, en de laatste eindigt bijna een seconde vóór de snede. Die stilte is
// het moment waarop de klant normaal weg was; daarom staat er ook GEEN klap op de
// snede naar de simulatie. Het gat ís de montage.
if (!ZONDER_RINKEL) [1.60, 2.90, 4.20, 5.50].forEach(bel);

// ── De simulatie ─────────────────────────────────────────────────────────────
// Tijden uit js/app.js, verschoven: de opname begint op de gemiste oproep (3,4s in
// app.js), en die valt op T_SIM in de film.
const sim = (appT) => T_SIM + (appT - 3.4);
plop(sim(3.4));      // Gemiste oproep 14:32
plop(sim(4.3));      // Belvanger appt automatisch terug
plop(sim(6.4));      // de klant antwoordt
plop(sim(8.5));      // Belvanger houdt de lead binnen
vangst(sim(9.5));    // Nieuwe lead binnen
plop(sim(11.2));     // meteen in je dashboard
vangst(sim(12.7));   // je eigen website ving 'm mee op

// ── De twee kaarten ──────────────────────────────────────────────────────────
if (!ZONDER_KAART1) klap(T_K1, 0.58);   // "Je had je handen vol."
klap(T_K2, 0.56, 52);                  // "Opgevangen."

// ── Uitvoer ──────────────────────────────────────────────────────────────────
const inFade = Math.round(0.4 * SR), uitFade = Math.round(1.4 * SR);
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);

let piek = 0;
for (let i = 0; i < N; i++) piek = Math.max(piek, Math.abs(L[i]), Math.abs(R[i]));
// Kop overhouden: loudnorm in de montage doet de echte luidheid en heeft ruimte nodig.
const schaal = piek > 0 ? 0.82 / piek : 1;
for (let i = 0; i < N; i++) {
  const f = Math.min(1, i / inFade) * Math.min(1, (N - i) / uitFade);
  for (const [kan, off] of [[L, 0], [R, 2]]) {
    const v = Math.max(-1, Math.min(1, kan[i] * schaal * f));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + off);
  }
}
const uit = path.join(WERKMAP, "film-geluid.wav");
fs.writeFileSync(uit, buf);
console.log(`${uit}: ${DUUR.toFixed(2)}s (act1 ${ACT1} + sim ${SIM.toFixed(2)} + kaarten ${K1}+${K2})`);
if (ZONDER_KAART1) console.log("kaart 1 staat niet in deze montage: act 1 draagt de grap zelf");
console.log(`rinkel in act 1: ${ZONDER_RINKEL ? "nee, komt uit de gegenereerde shot" : "ja, gesynthetiseerd"}`);
