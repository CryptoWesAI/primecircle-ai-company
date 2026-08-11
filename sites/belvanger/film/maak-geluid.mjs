// Bouwt het geluidsspoor van de showcase-film als één WAV, zonder muziekbed.
//
// Waarom zelf synthetiseren en niet opnemen: de simulatie maakt haar tonen met de
// Web Audio API, en die komen niet mee in een screenshot-reeks. En waarom geen
// muziek: bij deze doelgroep is een muziekbed het snelste signaal dat er een
// bureau aan te pas kwam. Wat er wél is: een lage ruimtetoon, een klap op elke
// montagesnede, en de ECHTE tweetoons-ringtone en meldingstonen uit js/app.js
// (480/620 Hz voor de bel, 880 Hz voor een bericht, 660+880 voor een binnenkomende
// lead). De film laat daardoor ook in geluid niets horen wat de site niet doet.
//
// De belangrijkste beweging zit in wat WEGVALT: de telefoon rinkelt door over de
// tekstkaart heen, en stopt precies op het frame waarin "Gemiste oproep 14:32"
// verschijnt. Dat gat is het moment waarop de klant normaal weg was.
import fs from "node:fs";

const SR = 48000;
const DUUR = 29.68;
const N = Math.round(SR * DUUR);
const L = new Float64Array(N), R = new Float64Array(N);

const env = (i, n, aanslag, uitloop) => {
  const t = i / SR, T = n / SR;
  const a = Math.min(1, t / aanslag);
  const u = Math.min(1, (T - t) / uitloop);
  return Math.max(0, a * u);
};

/** Schrijft een toon met aanslag en uitloop op tijdstip t. */
function toon(t, hz, dur, gain, vorm = "sine") {
  const start = Math.round(t * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const k = start + i;
    if (k < 0 || k >= N) continue;
    const f = (i / SR) * hz;
    const fase = f - Math.floor(f);
    // Driehoek klinkt als een meldingstoon, sinus als een beltoon. Dat is precies
    // het onderscheid dat app.js ook maakt.
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
    // Toonhoogte zakt licht weg, anders klinkt het als een pieptoon in plaats van
    // als een klap.
    const s = Math.sin(2 * Math.PI * (hz * tt - 6 * tt * tt));
    const g = gain * Math.exp(-tt * 11) * Math.min(1, tt / 0.004);
    L[k] += s * g; R[k] += s * g;
  }
}

// De tweetoons-ringtone uit app.js: 480 Hz, en 260 ms later 620 Hz.
const bel = t => { toon(t, 480, 0.35, 0.32); toon(t + 0.26, 620, 0.35, 0.32); };
// De meldingstoon van een bericht.
const plop = t => toon(t, 880, 0.18, 0.17, "triangle");
// De twee tonen die app.js speelt als er een lead binnenkomt.
const vangst = t => { toon(t, 660, 0.15, 0.19, "triangle"); toon(t + 0.13, 880, 0.20, 0.19, "triangle"); };

/** Toetsklikje: heel kort, hoog en zacht. Onder het invullen van het formulier.
 *  Zonder dit is de langste shot van de film volledig stil terwijl er wel iets
 *  gebeurt, en dan leest hij als een haperend bestand in plaats van als een handeling. */
function tik(t) {
  const start = Math.round(t * SR), n = Math.round(0.028 * SR);
  for (let i = 0; i < n; i++) {
    const k = start + i;
    if (k < 0 || k >= N) continue;
    const tt = i / SR;
    const s2 = (Math.random() * 2 - 1) * Math.exp(-tt * 210);
    const g = 0.13 * Math.min(1, tt / 0.001);
    L[k] += s2 * g; R[k] += s2 * g;
  }
}

// ── Ruimtetoon ───────────────────────────────────────────────────────────────
// Bruine ruis (geintegreerde witte ruis) zwaar afgevlakt, plus een zeer lage
// sinus. Samen geeft dat "een ruimte" in plaats van digitale stilte. Zonder dit
// klinken de gaten tussen de tonen als een kapot bestand.
let vorige = 0, traag = 0;
for (let i = 0; i < N; i++) {
  const wit = Math.random() * 2 - 1;
  vorige = (vorige + 0.02 * wit) / 1.02;
  traag += (vorige - traag) * 0.0016;          // eenpolige laagdoorlaat
  const laag = Math.sin(2 * Math.PI * 47 * (i / SR)) * 0.004;
  const bed = traag * 5.5 * 0.085 + laag;
  L[i] += bed; R[i] += bed;
}

// ── De montage ───────────────────────────────────────────────────────────────
// Twee zachte tikken onder de twee tekstregels van de opening. De film begint
// daardoor niet in het niets, en het oog wordt naar de tekst getrokken op precies
// het moment dat die verschijnt.
klap(0.30, 0.22, 66); klap(1.20, 0.20, 62);

klap(2.44, 0.62);    // de snede naar tekstkaart 1: de claim

// Klap op elke snede tussen de vakken. De afstanden lopen terug (1,44s naar
// 0,88s), dus het ritme versnelt vanzelf mee met het beeld.
[4.52, 5.96, 7.28, 8.48, 9.56, 10.52, 11.40].forEach((t, i) => klap(t, 0.48 + i * 0.03));

// 12,80: het formulier. Toetsklikjes precies over de drie invulvensters uit
// neem-showcase-op.mjs, plus een doffe tik op de knop.
klap(12.80, 0.62);
for (const [van, tot] of [[13.35, 13.95], [14.10, 14.75], [14.90, 16.15]]) {
  for (let t = van; t < tot; t += 0.072) tik(t);
}
klap(16.36, 0.30, 70);   // de knop wordt ingedrukt

// 16,80: de telefoon gaat. Twee keer, en dan stopt het: op 18,40 knipt de film weg
// van de rinkelende telefoon en is er alleen nog stilte. Dat gat is het moment waarop
// de klant normaal weg was, en het is de reden dat er hier GEEN klap op de snede staat.
bel(16.85); bel(17.75);   // de laatste eindigt op 18,36

klap(20.40, 0.58);       // de snede naar het dashboard
vangst(22.20);           // de tijdlijn komt in beeld: de aanvraag staat er
vangst(23.05);           // en de gemiste oproep ook

// 24,00: de telefoon met de meldingen. De tonen staan op dezelfde tijden als waarop
// de twee meldingen binnenschuiven (0,35s en 1,15s na het begin van de shot).
vangst(24.35);
plop(25.15);

klap(26.40, 0.56, 52);   // de slotkaart landt

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
// Ruim onder 0 dBFS blijven: loudnorm in de montage doet de echte luidheid, en
// dat werkt alleen goed als er hier nog kop overblijft.
const schaal = piek > 0 ? 0.82 / piek : 1;
for (let i = 0; i < N; i++) {
  const f = Math.min(1, i / inFade) * Math.min(1, (N - i) / uitFade);
  for (const [kan, off] of [[L, 0], [R, 2]]) {
    const v = Math.max(-1, Math.min(1, kan[i] * schaal * f));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + off);
  }
}
const uit = process.argv[2] || "film-geluid.wav";
fs.writeFileSync(uit, buf);
console.log(`${uit}: ${DUUR}s, ${SR} Hz stereo, piek voor schaling ${piek.toFixed(2)}`);
