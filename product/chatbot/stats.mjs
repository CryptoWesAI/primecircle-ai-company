// Vat de analytics samen. Draai: node stats.mjs
// Leest data/analytics.jsonl (of $DATA_DIR/analytics.jsonl).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const file = path.join(DATA_DIR, "analytics.jsonl");

if (!fs.existsSync(file)) {
  console.log("Nog geen analytics gevonden op:", file);
  process.exit(0);
}

const rows = fs
  .readFileSync(file, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter(Boolean);

const total = rows.length;
const byLang = {}, byDay = {}, byCustomer = {};
let referred = 0, ok = 0, msSum = 0;
const questions = new Map(); // lowerkey -> { text, count }

for (const r of rows) {
  byLang[r.lang] = (byLang[r.lang] || 0) + 1;
  byDay[(r.ts || "").slice(0, 10)] = (byDay[(r.ts || "").slice(0, 10)] || 0) + 1;
  byCustomer[r.customer] = (byCustomer[r.customer] || 0) + 1;
  if (r.referred) referred++;
  if (r.ok) ok++;
  if (r.ms) msSum += r.ms;
  if (r.question) {
    const k = r.question.trim().toLowerCase();
    const e = questions.get(k) || { text: r.question.trim(), count: 0 };
    e.count++;
    questions.set(k, e);
  }
}

const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
console.log(`Totaal gesprekken:        ${total}`);
console.log(`Geslaagd:                 ${ok}`);
console.log(`Doorverwezen naar bellen: ${referred} (${pct(referred)}%)`);
console.log(`Gem. reactietijd:         ${total ? Math.round(msSum / total) : 0} ms`);
console.log(`Per taal:`, byLang);
console.log(`Per klant:`, byCustomer);
console.log(`Per dag:`, byDay);

if (questions.size) {
  console.log(`\nVragen — FAQ-backlog (${questions.size} uniek):`);
  [...questions.values()]
    .sort((a, b) => b.count - a.count)
    .forEach((q) => console.log(`  ${q.count}×  ${q.text}`));
} else {
  console.log(`\n(Geen vraagteksten gelogd. Zet LOG_QUESTIONS=true om een FAQ-backlog op te bouwen — let op de privacy-afweging.)`);
}
