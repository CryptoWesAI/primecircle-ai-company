// Rendert de PWA-iconen uit public/favicon.svg naar PNG, zonder rasterizer en zonder
// npm-dependency.
//
// Waarom niet gewoon de SVG gebruiken: Chrome's installability-eis wil raster-iconen
// van 192 en 512 px in het manifest, en Android's launcher wil een maskable variant
// met genoeg "safe zone" eromheen. Het merk is hier pure geometrie (donker vlak, witte
// boog, oranje stip), dus we kunnen het exact narekenen in plaats van een SVG-renderer
// te installeren.
//
//   node scripts/make-icons.mjs
//
// Herhaalbaar en idempotent: dezelfde invoer geeft byte-identieke PNG's, dus dit
// opnieuw draaien vervuilt de git-diff niet.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/icons");
const ANDROID_RES = path.resolve(__dirname, "../android/app/src/main/res");

const INK = [0x0e, 0x1a, 0x24];
const PAPER = [0xf4, 0xf2, 0xed];
const ORANGE = [0xff, 0x5a, 0x1f];

// Geometrie uit favicon.svg (viewBox 0 0 64 64):
//   rect rx=16, boog "M15 42 A24 24 0 0 1 49 20" stroke-width 7 met ronde uiteinden,
//   cirkel cx=49 cy=20 r=8.
// Het middelpunt van die boog volgt uit de twee eindpunten plus r=24; hieronder
// eenmalig uitgerekend zodat het bestand geen SVG-arc-parser hoeft te zijn.
const ARC = { cx: 39.0, cy: 41.82, r: 24, halfWidth: 3.5, from: 179.5, to: 294.7 };
const ARC_CAPS = [{ x: 15, y: 42 }, { x: 49, y: 20 }];
const DOT = { x: 49, y: 20, r: 8 };

const SS = 4; // supersampling per as, dus 16 samples per pixel

function roundedRectHit(x, y, size, radius) {
  const rx = Math.min(Math.max(x, radius), size - radius);
  const ry = Math.min(Math.max(y, radius), size - radius);
  return (x - rx) ** 2 + (y - ry) ** 2 <= radius ** 2;
}

function arcHit(x, y) {
  const dx = x - ARC.cx;
  const dy = y - ARC.cy;
  const dist = Math.hypot(dx, dy);
  if (Math.abs(dist - ARC.r) > ARC.halfWidth) return false;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return angle >= ARC.from && angle <= ARC.to;
}

function capHit(x, y) {
  return ARC_CAPS.some((cap) => Math.hypot(x - cap.x, y - cap.y) <= ARC.halfWidth);
}

/**
 * Kleur van één sample in het 64x64-ontwerpcoördinatenstelsel, of null als de sample
 * buiten het icoon valt.
 *
 * `scale` verkleint het merk binnen het doek. `shape` bepaalt de achtergrond:
 *   "rounded"     afgeronde vierkant, voor het gewone PWA- en launcher-icoon;
 *   "circle"      rond, voor android:roundIcon op launchers tot Android 7;
 *   "bleed"       full bleed, voor maskable (de launcher maakt zelf de vorm);
 *   "transparent" geen achtergrond, voor de adaptive-icon foreground-laag.
 */
function sampleColor(u, v, { scale, shape, offset = [0, 0] }) {
  if (shape === "rounded" && !roundedRectHit(u, v, 64, 16)) return null;
  if (shape === "circle" && Math.hypot(u - 32, v - 32) > 32) return null;

  // Zet de sample om naar merkcoördinaten, gecentreerd en geschaald. `offset`
  // verschuift het merk binnen het doek: het merk uit favicon.svg is niet
  // gecentreerd in zijn 64x64-box (de boog hangt links-onder, de stip rechts-boven),
  // wat bij het vierkante icoon precies goed is maar bij een adaptive icon scheef
  // staat omdat de launcher rond het MIDDEN knipt.
  const [ox, oy] = offset;
  const x = (u - 32 - ox) / scale + 32;
  const y = (v - 32 - oy) / scale + 32;
  if (Math.hypot(x - DOT.x, y - DOT.y) <= DOT.r) return ORANGE;
  if (arcHit(x, y) || capHit(x, y)) return PAPER;
  return shape === "transparent" ? null : INK;
}

/**
 * Rendert supersampled pixels. Met `alpha` wordt het RGBA (colorType 6), nodig voor
 * de adaptive-icon foreground die transparant moet zijn; zonder alpha RGB
 * (colorType 2), wat de bestanden kleiner houdt.
 */
function renderPixels(size, options) {
  const channels = options.alpha ? 4 : 3;
  const rows = [];
  for (let py = 0; py < size; py += 1) {
    const row = Buffer.alloc(1 + size * channels); // leidende filter-byte 0 (None)
    for (let px = 0; px < size; px += 1) {
      let r = 0, g = 0, b = 0, hits = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const u = ((px + (sx + 0.5) / SS) / size) * 64;
          const v = ((py + (sy + 0.5) / SS) / size) * 64;
          const color = sampleColor(u, v, options);
          if (color) { r += color[0]; g += color[1]; b += color[2]; hits += 1; }
        }
      }
      const total = SS * SS;
      const offset = 1 + px * channels;
      if (options.alpha) {
        // Kleur is het gemiddelde van ALLEEN de rakende samples, anders krijg je een
        // donkere rand rond het merk waar de transparantie inmengt.
        row[offset] = hits ? Math.round(r / hits) : 0;
        row[offset + 1] = hits ? Math.round(g / hits) : 0;
        row[offset + 2] = hits ? Math.round(b / hits) : 0;
        row[offset + 3] = Math.round((hits / total) * 255);
      } else {
        // Samples buiten het icoon (afgeronde hoek) mengen naar wit, zodat het
        // icoon op een lichte achtergrond niet in een zwart vierkant zit.
        const miss = total - hits;
        row[offset] = Math.round((r + miss * 255) / total);
        row[offset + 1] = Math.round((g + miss * 255) / total);
        row[offset + 2] = Math.round((b + miss * 255) / total);
      }
    }
    rows.push(row);
  }
  return Buffer.concat(rows);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels, alpha) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);              // bit depth
  ihdr.writeUInt8(alpha ? 6 : 2, 9);  // 6 = RGBA, 2 = truecolor RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(pixels, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// PWA-iconen: wat het manifest opsomt.
const WEB_TARGETS = [
  { file: "icon-192.png", size: 192, scale: 1, shape: "rounded" },
  { file: "icon-512.png", size: 512, scale: 1, shape: "rounded" },
  // Maskable: Android knipt tot 20% vanaf elke rand weg, dus het merk moet kleiner
  // en de achtergrond moet doorlopen tot de rand.
  { file: "icon-maskable-512.png", size: 512, scale: 0.68, shape: "bleed" },
];

// Android launcher-iconen voor de Trusted Web Activity. Twee sets naast elkaar,
// want beide worden nog gebruikt:
//   mipmap-<dichtheid>/ic_launcher.png   legacy, tot Android 7 (API 25);
//   ic_launcher_foreground.png           adaptive icon, Android 8+ (API 26+), waar de
//                                        launcher zelf de vorm bepaalt en de
//                                        achtergrond uit een kleur komt.
// De foreground is 108dp doek met het merk in de veilige 66dp binnencirkel, vandaar
// scale 0.55: groter en de launcher knipt de oranje stip eraf op een rond icoon.
const ANDROID_DENSITIES = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192],
];

const ANDROID_TARGETS = [
  ...ANDROID_DENSITIES.map(([dir, size]) => ({ dir, file: "ic_launcher.png", size, scale: 1, shape: "rounded" })),
  ...ANDROID_DENSITIES.map(([dir, size]) => ({ dir, file: "ic_launcher_round.png", size, scale: 1, shape: "circle" })),
  // offset centreert de bounding box van het merk (x 11,5..57 en y 12..45,5 in het
  // 64x64-ontwerp, dus middelpunt 34,25 / 28,75) op het midden van het doek.
  { dir: "mipmap-xxxhdpi", file: "ic_launcher_foreground.png", size: 432, scale: 0.55, shape: "transparent", alpha: true, offset: [-2.25 * 0.55, 3.25 * 0.55] },
];

function write(dir, target) {
  const png = encodePng(target.size, renderPixels(target.size, target), Boolean(target.alpha));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, target.file), png);
  const label = path.relative(path.resolve(__dirname, ".."), path.join(dir, target.file)).replace(/\\/g, "/");
  console.log(`${label.padEnd(52)} ${target.size}x${target.size}  ${(png.length / 1024).toFixed(1)} kB`);
}

console.log("PWA:");
for (const target of WEB_TARGETS) write(OUT_DIR, target);

// Alleen schrijven als het Android-project bestaat: dit script hoort ook te werken in
// een checkout waar alleen het dashboard nodig is.
if (fs.existsSync(path.dirname(ANDROID_RES))) {
  console.log("\nAndroid:");
  for (const target of ANDROID_TARGETS) write(path.join(ANDROID_RES, target.dir), target);
} else {
  console.log(`\nAndroid-project niet gevonden op ${ANDROID_RES}, launcher-iconen overgeslagen.`);
}
console.log("\nKlaar.");
