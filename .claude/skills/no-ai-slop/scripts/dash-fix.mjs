// Vervangt em-dashes door leestekens die er wel horen, maar ALLEEN in de vormen waar dat
// zonder betekenisverlies kan.
//
// Waarom niet gewoon alles vervangen: een em-dash midden in een zin kan een komma, een dubbele
// punt of een punt moeten worden, en dat hangt af van wat erachter staat. Een blinde
// vervanging maakt daar komma-splitsingen van. Die gevallen worden hier dus NIET aangeraakt,
// alleen gemeld, zodat een mens ze leest.
//
// Wat wel automatisch gaat, want het is altijd een label gevolgd door een uitleg:
//   # Kop — ondertitel            ->  # Kop: ondertitel
//   - **Term** — uitleg           ->  - **Term**: uitleg
//   - `pad/` — uitleg             ->  - `pad/`: uitleg
//   - Korte term — uitleg         ->  - Korte term: uitleg
//
// Gebruik:
//   node dash-fix.mjs --dry-run <bestand> [...]
//   node dash-fix.mjs --schrijf  <bestand> [...]

import fs from "node:fs";

const schrijf = process.argv.includes("--schrijf");
const bestanden = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!bestanden.length) {
  console.error("gebruik: node dash-fix.mjs [--dry-run|--schrijf] <bestand> [...]");
  process.exit(2);
}

let gewijzigd = 0, overgeslagen = 0, bestandenGeraakt = 0;
const rest = [];

for (const pad of bestanden) {
  if (!fs.existsSync(pad)) continue;
  const origineel = fs.readFileSync(pad, "utf8");
  const regels = origineel.split("\n");
  let inCode = false;
  let raak = false;

  const nieuw = regels.map((r, idx) => {
    if (/^\s*```/.test(r)) { inCode = !inCode; return r; }
    if (inCode || !r.includes("—")) return r;

    let uit = r;

    // Een dubbele punt mag alleen als er verderop in de regel nog GEEN dubbele punt staat.
    // Zonder deze controle werd "bestand — live status: stage, milestone" tot
    // "bestand: live status: stage, milestone". Twee dubbele punten in een regel lezen
    // slechter dan de dash die je wilde weghalen, dus dan wordt het een komma.
    // Dit is bij de eerste proefronde echt misgegaan op docs/README.md, vandaar de regel.
    const scheider = (achterstuk) => (achterstuk.includes(":") ? ", " : ": ");

    // Kop: alleen de EERSTE dash wordt een dubbele punt, de rest een komma. Een kop met twee
    // dubbele punten leest als een foutje, en dat gebeurde echt bij
    // "# Blueprint — Trades-landingssite (PrimeCircle) — Mis nooit meer een klant".
    if (/^\s*#{1,6}\s/.test(uit)) {
      let eerste = true;
      uit = uit.replace(/\s+—\s+/g, (m, i, hele) => {
        const s = eerste ? scheider(hele.slice(i + m.length)) : ", ";
        eerste = false;
        return s;
      });
    }
    // Label gevolgd door uitleg. De dash moet direct achter de afsluiting van het label staan.
    uit = uit.replace(/(\*\*)\s+—\s+/g, (m, p1, i, hele) => p1 + scheider(hele.slice(i + m.length)));
    uit = uit.replace(/(`)\s+—\s+/g, (m, p1, i, hele) => p1 + scheider(hele.slice(i + m.length)));
    // Opsomming die begint met een korte term en dan een dash.
    uit = uit.replace(/^(\s*[-*]\s+(?:\[[ x~]\]\s+)?[^—\n]{1,55}?)\s+—\s+/, (m, p1, i, hele) => p1 + scheider(hele.slice(i + m.length)));

    if (uit !== r) { gewijzigd += (r.match(/—/g) || []).length - (uit.match(/—/g) || []).length; raak = true; }
    const over = (uit.match(/—/g) || []).length;
    if (over) {
      overgeslagen += over;
      rest.push(`${pad}:${idx + 1}  ${uit.trim().slice(0, 96)}`);
    }
    return uit;
  }).join("\n");

  if (raak) {
    bestandenGeraakt++;
    if (schrijf) fs.writeFileSync(pad, nieuw);
  }
}

console.log(`${gewijzigd} em-dash(es) vervangen in ${bestandenGeraakt} bestand(en)${schrijf ? "" : "  (PROEF, er is niets geschreven)"}`);
console.log(`${overgeslagen} blijven staan: die zitten midden in een zin en moeten met de hand.`);
if (rest.length) {
  console.log("\nNog met de hand te doen:");
  for (const r of rest.slice(0, 40)) console.log("  " + r);
  if (rest.length > 40) console.log(`  ... en nog ${rest.length - 40}`);
}
