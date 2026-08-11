// Bouwt de deploybare Belvanger-container: de chatbot-server (app/) + de bestaande
// site (site/) met het chat-widget SAME-ORIGIN ingebed. De site zelf leeft al in site/;
// dit script bouwt alleen app/ en embed het widget in de HTML.
//
// Draai vóór elke deploy:  node assemble.mjs   (daarna: bash deploy-to-vps.sh)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHATBOT = path.resolve(__dirname, "../../product/chatbot");
const APPLY = path.join(CHATBOT, "site-integration", "apply.mjs");
const APP = path.join(__dirname, "app");
const SITE = path.join(__dirname, "site");   // bestaande Belvanger-site (in place)
const CUSTOMER = "belvanger";

function reset(dir) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
function copyTree(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyTree(s, d); }
    else fs.copyFileSync(s, d);
  }
}

// 1. app/ ← chatbot-server + de gekozen klant-config
const CUSTOMER_SRC = path.join(CHATBOT, "customers", CUSTOMER);
if (!fs.existsSync(CUSTOMER_SRC)) { console.error("Klant niet gevonden:", CUSTOMER_SRC); process.exit(1); }
reset(APP);
fs.copyFileSync(path.join(CHATBOT, "server.js"), path.join(APP, "server.js"));
fs.copyFileSync(path.join(CHATBOT, "public", "dashboard.html"), path.join(APP, "dashboard.html"));
const CUSTOMER_DST = path.join(APP, "customers", CUSTOMER);
fs.mkdirSync(CUSTOMER_DST, { recursive: true });
copyTree(CUSTOMER_SRC, CUSTOMER_DST);
fs.writeFileSync(
  path.join(APP, "package.json"),
  JSON.stringify({ name: "belvanger-app", private: true, type: "module" }, null, 2) + "\n"
);
console.log(`app/ samengesteld uit product/chatbot (klant: ${CUSTOMER})`);

// 1b. dashboard-demo/ ← verse kopie van sites/belvanger-portal/public/, altijd opnieuw
// gebouwd zodat deze nooit los raakt van de echte dashboard-bestanden.
execFileSync("node", [path.join(__dirname, "build-dashboard-demo.mjs")], { stdio: "inherit" });

// 2. chat-widget same-origin in de site embedden (idempotent: eerst remove, dan add auto)
// voorbeelden/ en dashboard-demo/ = losstaande demopagina's die GEEN live Belvanger-
// chatwidget horen te krijgen (fictief ander bedrijf, resp. het dashboard-voorbeeld zelf).
// film-*.html = opnamepodia voor de promotiefilm. Een chatbubbel in beeld verpest de
// opname, dus die twee pagina's krijgen het widget niet.
const env = {
  ...process.env,
  AB_SITE_DIR: SITE,
  AB_SITE_EXCLUDE_DIRS: "voorbeelden,dashboard-demo",
  // Elke film-*.html hoort hierin. Het zijn opnamepodia, geen publieke pagina's, en
  // een chatbubbel in de hoek belandt regelrecht in de opname. Deze lijst is bij het
  // toevoegen van de showcase-film twee keer vergeten; wie een nieuwe filmpagina
  // maakt, zet hem hier meteen bij.
  AB_SITE_EXCLUDE_FILES: "film-opnamepodium.html,film-tekstkaarten.html,film-showcase-kaarten.html,film-melding.html",
};
execFileSync("node", [APPLY, "remove"], { env, stdio: "inherit" });
execFileSync("node", [APPLY, "add", "auto"], { env, stdio: "inherit" });

console.log("\nKlaar. app/ gebouwd + widget ingebed in site/ (same-origin).");
