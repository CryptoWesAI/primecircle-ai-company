// Zet de regels uit activiteitenlog.json in het Activiteitenlog van het dashboard.
//
// Waarom dit een script is dat JIJ draait en niet iets dat ik doe: de route
// POST /api/admin/activity vraagt een ingelogde platform_admin, en jouw wachtwoord hoort
// niet bij mij. Je geeft het hier bij het draaien mee via een omgevingsvariabele; het komt
// dus niet in een bestand, niet in git en niet in een gespreksgeschiedenis terecht.
//
// Gebruik (PowerShell):
//   $env:BV_EMAIL="jouw@email.nl"; $env:BV_PASS="..."; node tools/activiteitenlog-vullen.mjs
//
// Gebruik (Git Bash):
//   BV_EMAIL="jouw@email.nl" BV_PASS="..." node tools/activiteitenlog-vullen.mjs
//
// Eerst kijken zonder iets te schrijven:
//   ... node tools/activiteitenlog-vullen.mjs --dry-run
//
// Het script is IDEMPOTENT: het haalt eerst de bestaande regels op en slaat alles over wat
// al dezelfde datum en titel heeft. Twee keer draaien verdubbelt je log dus niet, en dat is
// belangrijk omdat de API zelf geen dubbelcheck doet.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const BASIS = process.env.BV_URL || "https://dashboard.belvanger.nl";
const TENANT = process.env.BV_TENANT || "belvanger";
const EMAIL = process.env.BV_EMAIL;
const PASS = process.env.BV_PASS;
const DROOG = process.argv.includes("--dry-run");
const BESTAND = path.join(HIER, "activiteitenlog.json");

if (!DROOG && (!EMAIL || !PASS)) {
  console.error("Zet BV_EMAIL en BV_PASS als omgevingsvariabele, of draai met --dry-run.");
  console.error('PowerShell:  $env:BV_EMAIL="..."; $env:BV_PASS="..."; node tools/activiteitenlog-vullen.mjs');
  process.exit(2);
}

const regels = JSON.parse(fs.readFileSync(BESTAND, "utf8"));
const CATEGORIEEN = ["beslissing", "bouwwerk", "fix", "test", "onderzoek", "infra"];

// ── Eerst zelf valideren, zodat een fout niet halverwege het schrijven opduikt ───────────
let fout = 0;
for (const [i, r] of regels.entries()) {
  const waar = `regel ${i + 1} (${r.title || "zonder titel"})`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.logDate || "")) { console.error(`${waar}: logDate moet JJJJ-MM-DD zijn`); fout++; }
  if (!CATEGORIEEN.includes(r.category)) { console.error(`${waar}: category moet een van ${CATEGORIEEN.join(", ")} zijn`); fout++; }
  if (!r.title || r.title.length > 200) { console.error(`${waar}: titel ontbreekt of is langer dan 200 tekens`); fout++; }
  if (!r.summary || r.summary.length > 2000) { console.error(`${waar}: samenvatting ontbreekt of is langer dan 2000 tekens (nu ${(r.summary || "").length})`); fout++; }
}
if (fout) { console.error(`\n${fout} probleem(en) in ${path.basename(BESTAND)}. Niets verstuurd.`); process.exit(1); }
console.log(`${regels.length} regel(s) gecontroleerd, alles geldig.`);

if (DROOG) {
  console.log("\n--dry-run: dit zou er ingezet worden\n");
  for (const r of regels) console.log(`  ${r.logDate}  [${r.category.padEnd(10)}] ${r.title}`);
  console.log("\nNiets verstuurd. Draai zonder --dry-run met BV_EMAIL en BV_PASS.");
  process.exit(0);
}

// ── Inloggen, met tweefactor ──────────────────────────────────────────────────────────────
// Het portaal heeft 2FA aan zolang SMTP is geconfigureerd: /api/login geeft dan GEEN sessie
// maar mailt een code van zes cijfers en geeft een `challenge` terug. Pas /api/verify-otp
// levert de sessiecookie. Daarom is dit script alleen door de eigenaar te draaien: zonder
// toegang tot die mailbox kom je er niet in, en dat hoort zo.
//
// Drie manieren:
//   (geen vlag)        inloggen, code interactief invullen. De normale werkwijze.
//   --login            inloggen en stoppen; de aanvraag wordt bewaard, de code komt per mail.
//   --code <6 cijfers> de bewaarde aanvraag afmaken. LOGT NIET OPNIEUW IN.
//
// Dat laatste is belangrijk en het ging hier eerst mis: elke login mailt een NIEUWE code bij
// een NIEUWE aanvraag. Als de codestap opnieuw inlogt, hoort de code die jij net kreeg bij
// een aanvraag die het script vervolgens weggooit, en dan klopt elke code "niet".
const koekjes = (res) =>
  (res.headers.getSetCookie?.() || [res.headers.get("set-cookie")])
    .filter(Boolean).map((c) => c.split(";")[0]).join("; ");

const vraag = (tekst) => new Promise((klaar) => {
  process.stdout.write(tekst);
  process.stdin.setEncoding("utf8");
  const luister = (d) => { process.stdin.pause(); process.stdin.off("data", luister); klaar(String(d).trim()); };
  process.stdin.resume();
  process.stdin.on("data", luister);
});

const challengePad = path.join(process.env.TEMP || process.env.TMPDIR || "/tmp", "bv-activity-challenge");
const codeIndex = process.argv.indexOf("--code");
const codeArg = codeIndex !== -1 ? process.argv[codeIndex + 1] : null;
const MODUS = process.argv.includes("--login") ? "login" : (codeIndex !== -1 ? "code" : "interactief");

let cookie = "";
let klaarNaLogin = false;

if (MODUS === "code") {
  // Alleen afmaken. Geen login, dus geen nieuwe mail en geen weggegooide aanvraag.
  if (!/^\d{6}$/.test(codeArg || "")) { console.error("Gebruik: --code <6 cijfers>"); process.exit(2); }
  if (!fs.existsSync(challengePad)) {
    console.error("Geen bewaarde aanvraag gevonden. Draai eerst: node tools/activiteitenlog-vullen.mjs --login");
    process.exit(1);
  }
  const challenge = fs.readFileSync(challengePad, "utf8").trim();
  const verify = await fetch(`${BASIS}/api/verify-otp`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge, code: codeArg, remember: false }),
  });
  if (!verify.ok) {
    const t = await verify.text().catch(() => "");
    console.error(`Code afgekeurd (HTTP ${verify.status}). ${t.slice(0, 200)}`);
    console.error("Codes zijn eenmalig en kort geldig. Draai --login voor een nieuwe.");
    process.exit(1);
  }
  cookie = koekjes(verify);
  try { fs.unlinkSync(challengePad); } catch { /* al weg */ }
} else {
  const login = await fetch(`${BASIS}/api/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS, tenant: TENANT }),
  });
  if (!login.ok) {
    const t = await login.text().catch(() => "");
    console.error(`Inloggen mislukt (HTTP ${login.status}). ${t.slice(0, 200)}`);
    process.exit(1);
  }
  const loginBody = await login.json().catch(() => ({}));
  cookie = koekjes(login);

  if (loginBody.otpRequired) {
    if (MODUS === "login") {
      fs.writeFileSync(challengePad, loginBody.challenge, { mode: 0o600 });
      console.log(`
Tweefactor staat aan. Er is EEN code van 6 cijfers gemaild naar ${EMAIL}.`);
      console.log("Maak af met:  node tools/activiteitenlog-vullen.mjs --code <die-6-cijfers>");
      console.log("Let op: draai NIET nog een keer --login, dan komt er een nieuwe code en vervalt deze.");
      klaarNaLogin = true;
    } else {
      console.log(`
Tweefactor staat aan. Er is een code gemaild naar ${EMAIL}.`);
      const code = process.env.BV_CODE || await vraag("Code (6 cijfers): ");
      const verify = await fetch(`${BASIS}/api/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge: loginBody.challenge, code, remember: false }),
      });
      if (!verify.ok) {
        const t = await verify.text().catch(() => "");
        console.error(`Code afgekeurd (HTTP ${verify.status}). ${t.slice(0, 200)}`);
        process.exit(1);
      }
      cookie = koekjes(verify);
    }
  }
}

// Bij --login is het werk hier klaar: de code is gemaild en de aanvraag staat opzij.
if (!klaarNaLogin) {
  if (!cookie) { console.error("Geen sessiecookie ontvangen. Inloggen is niet gelukt."); process.exit(1); }
  console.log("Ingelogd.");

  // ── Bestaande regels ophalen, zodat we niet dubbel schrijven ─────────────────────────────
  const bestaandRes = await fetch(`${BASIS}/api/admin/activity`, { headers: { cookie } });
  if (bestaandRes.status === 403) {
    console.error("Deze gebruiker is geen platform_admin, dus het Activiteitenlog is niet beschikbaar.");
    process.exit(1);
  }
  if (!bestaandRes.ok) { console.error(`Ophalen mislukt (HTTP ${bestaandRes.status}).`); process.exit(1); }
  const bestaand = await bestaandRes.json();
  const lijst = Array.isArray(bestaand) ? bestaand : (bestaand.items || bestaand.activity || []);
  const alAanwezig = new Set(lijst.map((r) => `${r.log_date}|${(r.title || "").trim()}`));
  console.log(`${lijst.length} bestaande regel(s) in het log.`);

  // ── Schrijven ────────────────────────────────────────────────────────────────────────────
  let nieuw = 0, over = 0;
  for (const r of regels) {
    if (alAanwezig.has(`${r.logDate}|${r.title.trim()}`)) {
      console.log(`  = staat er al   ${r.logDate}  ${r.title}`);
      over++;
      continue;
    }
    const res = await fetch(`${BASIS}/api/admin/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ ...r, createdBy: r.createdBy || "claude" }),
    });
    if (res.status === 201) { console.log(`  + toegevoegd    ${r.logDate}  ${r.title}`); nieuw++; }
    else {
      const t = await res.text().catch(() => "");
      console.error(`  ! MISLUKT (${res.status})  ${r.title}  ${t.slice(0, 160)}`);
    }
  }

  console.log(`\nKlaar. ${nieuw} toegevoegd, ${over} overgeslagen omdat ze er al stonden.`);
  console.log(`Nakijken: ${BASIS} → tabblad Activiteitenlog.`);
}
