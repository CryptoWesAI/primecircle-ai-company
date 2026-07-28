// Bouwt de publieke dashboard-demo (/dashboard-demo) voor prospects, uit de ECHTE
// dashboard-bestanden van sites/belvanger-portal/public/. Zelfde bron, dus nooit los van
// elkaar laten lopen: draai dit script opnieuw na elke wijziging aan die bestanden.
// Data komt uitsluitend van de fictieve /dashboard-demo/api/*-routes in product/chatbot/
// server.js — nooit een echte database, nooit een echte klant.
//
// Gebruik: node build-dashboard-demo.mjs   (wordt ook automatisch aangeroepen door assemble.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "belvanger-portal", "public");
const DEST = path.join(__dirname, "site", "dashboard-demo");

if (!fs.existsSync(SRC)) {
  console.error("Bron niet gevonden:", SRC);
  process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const DEMO_BANNER = `
  <div id="demoRibbon" style="position:sticky;top:0;z-index:999;background:#FF5C1A;color:#16232E;font:700 .82rem/1.4 system-ui,sans-serif;text-align:center;padding:.55rem 1rem;letter-spacing:.01em">
    Voorbeelddata — dit is hoe jouw eigen dashboard eruit kan zien. Geen echte klant of gegevens.
  </div>`;

function copyPatched(name, patch) {
  const from = path.join(SRC, name);
  if (!fs.existsSync(from)) { console.warn("overgeslagen (bestaat niet):", name); return; }
  let content = fs.readFileSync(from, "utf8");
  if (patch) content = patch(content);
  fs.mkdirSync(path.dirname(path.join(DEST, name)), { recursive: true });
  fs.writeFileSync(path.join(DEST, name), content);
  console.log("+ " + name);
}

// index.html: banner direct na <body>, en absolute asset-/exportpaden herschreven naar
// /dashboard-demo/... (het bestand leeft niet meer op de site-root, dus /style.css etc.
// zouden anders 404'en). Verder ongewijzigd.
copyPatched("index.html", (html) => {
  let uit = html
    .replace("<body>", "<body>" + DEMO_BANNER)
    // De demo is geen installeerbare app: geen manifest, geen service worker, geen push.
    // Die verwezen bovendien naar /icons/, /manifest.webmanifest en /push.js op de SITE-root,
    // waar ze niet bestaan, dus ze gaven drie 404's op een pagina die prospects te zien krijgen.
    .replace(/^.*rel="manifest".*$\n?/m, "")
    .replace(/^.*rel="apple-touch-icon".*$\n?/m, "")
    .replace(/^.*src="\/push\.js.*$\n?/m, "")
    // Alles wat vanaf de siteroot werd geladen moet naar de demomap wijzen.
    .replace(/(href|src)="\/(?!dashboard-demo\/)/g, '$1="/dashboard-demo/');

  // Poort in plaats van vertrouwen: blijft er een pad over dat naar de siteroot wijst, dan
  // is dit script achtergebleven bij het portaal en moet dat NU blijken, niet als een 404 op
  // de demo van een prospect. De vorige versie had een vaste lijst van vijf vervangingen en
  // miste er stilzwijgend drie zodra het portaal een asset toevoegde.
  const rest = [...uit.matchAll(/(?:href|src)="(\/(?!dashboard-demo\/)[^"]*)"/g)].map((m) => m[1]);
  if (rest.length) {
    console.error("FOUT: deze paden wijzen nog naar de siteroot en zouden 404 geven:\n  " + rest.join("\n  "));
    process.exit(1);
  }
  return uit;
});

// app.js: enige wijziging — elke API-aanroep via api() krijgt het /dashboard-demo-voorvoegsel,
// zodat dezelfde ongewijzigde applicatielogica tegen de fictieve routes praat.
copyPatched("app.js", (js) =>
  js.replace(
    'const response = await fetch(path, { credentials: "same-origin"',
    'const response = await fetch("/dashboard-demo" + path, { credentials: "same-origin"'
  )
);

copyPatched("style.css");
copyPatched("favicon.svg");
copyPatched(path.join("fonts", "fraunces.woff2"));
copyPatched(path.join("fonts", "fraunces-italic.woff2"));
copyPatched(path.join("fonts", "archivo-standard.woff2"));

console.log(`Dashboard-demo gebouwd in ${DEST}`);
