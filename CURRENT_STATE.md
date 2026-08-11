# CURRENT_STATE

## Objective

Build a managed AI automation business that can initially be operated by one founder and later scale into a platform company.

## Current Stage

Belvanger is gebouwd en live; de eerste twee prospects zijn aangeschreven. Er is
nog geen betalende klant, en dat is de enige maat die nu telt.

Live: `belvanger.nl` (7 vakken, 7 voorbeeldpagina's, NL+EN, noindex),
`dashboard.belvanger.nl` (klantportaal, PWA met pushmeldingen),
`ab.primecircle.cloud` (AB Uitvaartzorg, de referentiecase). Alles op de eigen
Hostinger-VPS achter Traefik. Verkoopstand staat in `SELLING.md` en wordt elke
sessie via een hook getoond.

Wat hieronder staat over AB en de pivot blijft feitelijk juist maar is
voorgeschiedenis; het actuele werk staat in de dagsecties onderaan dit bestand.

First customer: AB Uitvaartzorg (founder's schoonmoeder, Alien Bisschop,
uitvaartonderneming in Steenwijkerwold). First build: a knowledge-grounded,
bilingual (NL+EN) AI chat assistant, embedded on all 27 pages of her website.
**Working end-to-end** via OpenRouter (`google/gemini-2.5-flash-lite`), live-tested:
grounded costs, safe escalation on grief input, no invented prices, EN steering.
**LIVE on HTTPS (2026-07-14):** the whole stack (NL+EN website + config-driven
chat + token dashboard) runs as one isolated non-root Docker container on the
founder's Hostinger VPS (`root@31.97.123.34`, `/opt/ab-uitvaartzorg`, restart
unless-stopped), served over **HTTPS at `https://ab.primecircle.cloud`** via the
VPS's existing Traefik (Let's Encrypt cert, HTTP→HTTPS redirect). Raw port 8091
is NOT published anymore; access is HTTPS-only. Staging domain `primecircle.cloud`
(free 1st year, claimed as VPS hostname; renews ~₹2536 on 2027-06-18, auto-renew
still ON, disabling it was blocked as a financial action, founder to toggle in
hPanel). Dashboard token rotated; value only in gitignored `.env`. Verified
end-to-end incl. live OpenRouter chat over HTTPS.
Since deploy (2026-07-15/16): **dashboard v2** live: website visitors + chatbot
usage, fully anonymized (no IP/UA; daily-rotating hashed visitor id; bot filter),
site-styled + auto-refresh + "In één oogopslag" summary. **EU AI Act Art. 50
disclosure baked into the shared widget** (opening notice + persistent "AI" badge +
clear styling; every customer inherits it, see `docs/compliance/ai-transparantie-art50.md`).
Alien's project pushed to **private `CryptoWesAI/ABUitvaart`** (66 files, secrets
excluded/verified). Domain auto-renew: founder set a WhatsApp reminder instead of
disabling (keeps the keep/stop choice open). Before pointing Alien's REAL domain at
it: Alien's sign-off on tone/boundaries, paste the privacy paragraph into the live
`privacy-statement.html`, OpenRouter data-policy check.
Note: the VPS's other project claims the apex `primecircle.cloud`/`www` in Traefik
and its ACME fails, not ours (we only use the `ab.` subdomain).
See `clients/ab-uitvaartzorg/deploy/README.md` and `docs/decisions/DECISIONS_LOG.md`.

## Strategic direction (pivot under validation, 2026-07-16)

Objective niche analysis concluded the winnable funeral segment (solo/zzp) is too
LOW-VOLUME to sustain a high-value retainer (see `docs/research/uitvaartniche-marktonderzoek.md`).
**Leading direction: a done-for-you "mis nooit meer een klant" service for local
trades** (installateurs/loodgieters: huge TAM, cash-rich, poorly digitized; missed
call = lost €100-1200 job). Wedge = missed-call → text-back / 24-7 lead capture; the
pitch is ROI-arithmetic (suits the founder's selling weakness). AB Uitvaartzorg stays
a reusable chatbot **reference case**, not the growth market. Model = done-for-you
(build+run+maintain; sell outcome, not software). Financials + stack + MVP recipe:
`docs/research/niche-vergelijking-lokaal-mkb.md`, `docs/offers/aanbod-uitvaartniche.md`,
`docs/build/mvp-missed-call-textback.md`. **Current step: validate-before-build**: a
casual discovery conversation with a warm trade contact (who is overbooked → use as
referral bridge to hungry prospects, not customer #1), THEN build MVP v0.
(Fase B funeral supplier-ordering/invoicing app is deprioritized behind this.)

## Immediate Goal

Replace employment income through predictable recurring revenue.

## Principles

- Founder Time first.
- Business before perfection.
- Generic core, configurable verticals.
- Use existing platforms before building custom software.

## Candidate Stack

Oriented to the trades "never miss a lead" direction, EU-clean on the owned VPS
(Buy → Integrate → Configure → Automate → Build):

- **n8n**: orchestration/glue (self-host on VPS)
- **Bird (ex-MessageBird)**: NL telephony/SMS/WhatsApp, EU data (Twilio for the
  fastest throwaway MVP, native Studio flow + n8n node)
- **OpenRouter**: chatbot/LLM (lead capture; reuse existing config-driven widget)
- **NocoDB / Baserow**: CRM / lead store (self-host)
- **Retell AI**: Dutch voice agent (LATER, after validation)
- **Cal.com**: booking (optional); **Mollie**: payments (EU)
- VPS + Docker + Traefik (owned infra)
- Alternative "Buy" all-in-one: **GoHighLevel** (agency platform, missed-call-text-
  back built in), US-centric (A2P/GDPR/WhatsApp friction); steal its wedge, not the lock-in.

These are candidates, not final decisions.

## Next Milestone

- [x] Create GitHub repository: `github.com/CryptoWesAI/primecircle-ai-company`
- [x] Finalize PAOF structure: see `docs/`, `roadmap/LEARNING_ROADMAP.md`, `workflow/DEV_WORKFLOW.md`, `.claude/skills/`
- [x] First build live (AB Uitvaartzorg chatbot + dashboard, HTTPS, private repo, Art. 50 disclosure), reference case done
- [~] **Validate the trades wedge**, twee prospects aangeschreven op 2026-07-27 (zie `SELLING.md`), nul gesprekken geboekt. Blijft open tot er een gesprek is geweest. Oorspronkelijke opzet: one casual discovery conversation with a warm/hungry trade contact (crux: missed calls/week × job value × willingness-to-pay). Script ready. THEN build MVP v0 (`docs/build/mvp-missed-call-textback.md`). Use the `opportunity-check` skill for any further niche/offer decisions.

### Belvanger klantdashboard als Android-app (2026-07-25)

Route gekozen na ADHD-onderzoek (`docs/research/belvanger-android-app-adhd-onderzoek-2026-07-25.md`):
**PWA-first, dan Trusted Web Activity**. Geen frontend geport, geen framework of bundler
toegevoegd, en app-versie 1.0 blijft 1.0 omdat elke UI-wijziging serverside meegaat
zonder store-review. Geverifieerd: TWA-op-een-echte-PWA is Google's eigen route langs
beleid 4.3, waar een WebView-wrapper juist op wordt afgekeurd.

**Gebouwd en lokaal geverifieerd** in `sites/belvanger-portal/`: PWA-laag (manifest,
service worker, offline-pagina, iconen uit één generator), Web Push zonder
npm-dependency (`src/webpush.js`, getest tegen RFC 8291 Appendix A), meldingen-UI met
testknop (visueel geverifieerd op 390px en 1440px, geen overflow/consolefouten),
`push_devices`-tabel, VAPID-routes, verzendhook op `call.missed` en `website.lead`,
`/.well-known/assetlinks.json` uit env, het TWA-project in `android/`, en een
cloud-build (`.github/workflows/belvanger-android.yml`) die zonder Android Studio of Mac
een ondertekende `.aab` oplevert.

**Besluit founder, 2026-07-25: de Play Store is geparkeerd.** Leveringsmechanisme is de
**geïnstalleerde PWA op het beginscherm**, niet een app in de store. Reden: de PWA geeft
de vakman 100% van de functionele waarde en dekt gratis ook iPhone-gebruikers, terwijl de
store alleen vindbaarheid toevoegt tegen permanente onbetaalde onderhoudslast. Het
TWA-project en `.github/workflows/belvanger-android.yml` blijven staan als slapende
optie: die workflow start alleen handmatig, dus er gaat nooit per ongeluk iets naar
Google. Route staat compleet in `ANDROID.md` mocht een klant er ooit om vragen.

**Let op, dit lost een bookmark niet op:** iOS Safari geeft Web Push **uitsluitend** aan
PWA's die op het beginscherm zijn geïnstalleerd. Op Android werkt push ook in een gewone
tab, en is installeren winst op weergave (volledig scherm, eigen icoon, offline).
Klanten moeten dus door "App installeren" worden geleid, niet door "bookmark maken".

**LIVE sinds 2026-07-25** op `https://dashboard.belvanger.nl` (VPS `/opt/belvanger-portal`,
Traefik + Let's Encrypt). Geverifieerd na deploy: `manifest.webmanifest` met het juiste
content-type, `sw.js` met `no-cache` + `Service-Worker-Allowed`, iconen als `image/png`,
`push_devices`-tabel aangemaakt, en in een echte browser een **geactiveerde service
worker** op scope `/`. VAPID-sleutels staan in de gitignored `.env` op de VPS
(voor `PUSH_INCLUDE_CALLER` zie punt 3 hieronder). Tijdens de deploy nog een
latente bug gefixt: `serveStatic` gaf 404 op elk HEAD-verzoek, dus ook op `/`, wat elke
uptime-monitor als "site down" had gelezen.

**Bewezen op een echt toestel:**

1. **Testmelding aangekomen** (2026-07-25). Dat valideerde het grootste technische risico:
   de zelfgebouwde Web Push-crypto in `src/webpush.js` wordt niet alleen door het
   RFC 8291-testvector geaccepteerd maar ook door de echte push-dienst, en door de browser
   ontcijferd. Er is geen tweede implementatie die ons corrigeert, dus dit was de open vraag.
2. **Doze-test geslaagd** (2026-07-27). Na een uur met het scherm uit kwam de testmelding
   alsnog aan, dus OEM-batterijbeheer knijpt de bezorging op dit toestel niet. Nuance: dit is
   **een** toestel. Xiaomi, Oppo en Samsung knijpen agressiever, dus de Doze-test staat als
   verplichte stap in de koppelchecklist (`sites/belvanger-portal/n8n/README.md`). De
   sms-escalatieladder blijft nuttig maar is geen voorwaarde meer om te kunnen leveren.
3. **`PUSH_INCLUDE_CALLER=true` live** (founder-besluit 2026-07-25). De melding bevat het
   nummer van de beller plus een "Bel terug"-knop. Verdedigbaar omdat de payload
   end-to-end versleuteld is (RFC 8291) met sleutels die alleen het toestel van de klant
   heeft, en het de eigen leaddata van de klant naar zijn eigen toestel betreft.
   Terugdraaien is een regel in de VPS-`.env` plus een herstart.
4. **Installeer-affordance gebouwd, Android only** (2026-07-25), gedreven door
   `beforeinstallprompt`; alle drie de toestanden geverifieerd op 390px.
5. **Meldingen op inkomende reacties live** (2026-07-25): `sms.inbound`, `email.inbound` en
   `chat.lead`, met `tests/inbound-push.mjs` gedraaid tegen de gedeployde broncode.
6. **"Bel terug" werkt** (2026-07-27). Tik op de melding en de telefoonapp opent, met een
   eenmalige Android-bevestiging. Kostte zes testrondes; oorzaak alleen gevonden door de
   service worker zelf te laten rapporteren. Twee echte fouten plus een derde die ik zelf
   introduceerde, volledig uitgeschreven in `docs/decisions/DECISIONS_LOG.md`. De kern:
   het gebruikersgebaar van een `notificationclick` vervalt bij de eerste `await`, en de
   diagnostiek die dat moest meten wás die await.

**Nog open:**

- **De echte Chrome-installatieprompt is nog niet op een toestel gezien.**
- **iOS krijgt niets.** Safari geeft Web Push uitsluitend aan PWA's op het beginscherm en
  heeft geen installatie-API, dus de installeerkaart blijft daar verborgen. Een
  iPhone-vakman krijgt daardoor geen enkele melding. Bewust uitgesteld (founder-besluit).
- **De sms-keten klopt nog niet** (diagnose 2026-07-27). De automatische sms gaat uit vanaf
  een alfanumerieke afzender in plaats van vanaf het nummer, waardoor de beller niet kan
  antwoorden en het n8n-importfilter de sms stil overslaat. Bewust zo in de testopstelling;
  het echte NL-nummer komt met klant #1. Volledige diagnose in
  `docs/decisions/DECISIONS_LOG.md`, de stappen in de koppelchecklist.

**Bewust uitgesteld:** de sms-terugval als een pushmelding niet aankomt. Ontworpen, niet
gebouwd, omdat elke terugval Twilio-geld per bericht kost en dat een beslissing over
klantkosten is. `push_devices.failure_count`/`last_success_at` is er als storingssignaal, en
de e-mailmelding blijft als vangnet staan.

`TWA_*`-variabelen en de assetlinks-route zijn niet nodig zolang de Play Store geparkeerd
blijft (ze geven netjes 404 als ze leeg zijn).

### Engelse site gelijkgetrokken + drie stille serverfouten weg (2026-07-27, LIVE)

De Engelse versie van `belvanger.nl` liep achter op de Nederlandse, en bleek ook stuk: de
hero-animatie eindigde op een leeg vlak omdat het gedeelde `js/app.js` twee `data-step`-
knopen aanriep die alleen op de NL-pagina bestonden. Verder liepen hero, belief-regel en
vaktermen uiteen, en noemde de privacyverklaring in beide talen een gegevensstroom die
sinds 19 juli niet meer bestaat (WhatsApp in plaats van de eigen server) terwijl de
AI-chat er helemaal niet in stond.

Meegenomen in dezelfde ronde, alle drie onzichtbaar voor een GET-op-de-homepage:
`404.html` werd **nooit** geserveerd (kale tekst "Not found"), `HEAD` gaf **405 op elke
pagina** zodat een uptime-monitor de site als down zou melden, en de deploy uploadde 67 MB
filmmateriaal dat daarna in elke backup werd meegekopieerd.

Volledige lijst met wat er is aangepast en hoe het is geverifieerd: `sites/belvanger/STATUS.md`.
Nieuw vangnet: `sites/belvanger/tests/taalpariteit.mjs` (NL↔EN structuurvergelijking).
Les vastgelegd in `docs/LEARNINGS.md`.

### Veiligheid, contract, bewaking en back-up (2026-07-27/28, alles LIVE)

Vijf parallelle controles op de hele opzet (beveiliging, bedrijfsvoering, juridisch,
functioneel, samenhang). Wat daaruit kwam en is opgelost:

**Eén verzoek kon belvanger.nl uitzetten.** `serveStatic` riep `decodeURIComponent` aan
zonder vangnet, de handler had geen try/catch en er was geen process-handler, dus `GET /%`
beëindigde het proces en daarmee de site, de chat, `/api/lead` en `/api/intake`.
Gereproduceerd vóór de fix, live nagemeten erna. Drie lagen toegevoegd. In dezelfde ronde:
`X-Forwarded-For[0]` maakte de snelheidsbegrenzer waardeloos, de bevestigingsmail kon
iemands link namens ons domein bezorgen, en `ALLOWED_ORIGIN` stond op `*`.

**Exit-alinea staat in de voorwaarden** (§6, NL+EN): vijf werkdagen tot oplevering van
website, leads en kennisbank, dertig dagen tot verwijdering. **Verwerkersovereenkomst ligt
als concept** in `docs/juridisch/verwerkersovereenkomst-concept.md`. Nog niet tekenbaar:
de slotsectie "Wat nog niet waar is" noemt drie punten die de techniek niet nakomt
(bewaartermijnen worden nergens afgedwongen, geen KvK-nummer, en het back-upgat dat
inmiddels deels gedicht is).

**Systeemcheck mailt.** `collectHealth` is losgemaakt van de HTTP-route en draait om 07:00
via een timer, met `smtpSend` erachter. Fout of waarschuwing mailt meteen; alles groen
mailt alleen op maandag; dezelfde storing als gisteren mailt niet. Certificaatcontrole
erbij (waarschuwing onder 21 dagen). Het alarm is echt getest, niet alleen de gelukkige
route: met een nagespeelde storing kwam er een mail met "1 fout".

**Wachtwoord wijzigen** kon alleen bij de eerste keer inloggen. Nu een knop in de zijbalk,
huidig wachtwoord verplicht bij een vrijwillige wijziging, en na afloop vallen alle andere
sessies en vertrouwde apparaten eruit. Herstel via de mail bestond al.

**Back-up naar de eigen PC** (founder-keuze, niet naar een opslagdienst). Pull en geen push:
`infra/backup/maak-backup.sh` zet om 03:30 een pakket van 25 MB klaar op de VPS,
`infra/backup/haal-backup.ps1` haalt dat om 12:30 op naar `D:\Belvanger-backups` en
controleert de vingerafdrukken. Beide kanten melden terug in `system_state`, zodat de
ochtendmail waarschuwt als de keten stilvalt. Maandelijkse hersteltest draait vanzelf.
Volledige handleiding en de bekende zwakke plekken in `infra/backup/README.md`.

**`dcg` als hook geïnstalleerd** (founder-verzoek), met `containers.docker`,
`containers.compose`, `database.postgresql` en `database.sqlite` aan, want standaard lieten
die `docker volume rm belvanger-portal-db` en `DROP DATABASE portal` gewoon door. Config
als referentiekopie in `infra/dcg/config.toml`. Gevolg voor het werk: `docker rm -f`,
`git branch -D`, `rm -rf` en `Remove-Item -Recurse -Force` vragen nu om toestemming.

### Showcasefilm "Elk vak zijn eigen website" (2026-07-28, af)

Tweede promotiefilm, 30 seconden verticaal, 14,9 MB, **nul credits**: elk beeld is een
bestuurde opname van de site die nu draait. `sites/belvanger/film/belvanger-showcase-1080x1920.mp4`.

Opgevangen (25 juli) is de probleemfilm; deze laat zien wát je krijgt, en de twee zijn
bewust hetzelfde formaat zodat ze als setje te versturen zijn. Het idee komt uit het
materiaal zelf: de zeven voorbeeldpagina's hebben dezelfde opbouw en onderin dezelfde
balk in hun eigen vakkleur, dus zeven keer dezelfde compositie in zeven werelden. De
belknop is de rode draad en landt zeven keer op dezelfde hoogte omdat het script per
pagina uitmeet waar hij staat.

De film gaat over de eigen website **met een aanvraagformulier**: dat wordt in beeld
ingevuld, en komt daarna binnen in het dashboard en als pushmelding op de telefoon. De
sms-conversatie die er eerst in zat is eruit op verzoek van de founder. Het formulier
bestond nog niet en is daarom eerst op alle zeven voorbeeldpagina's gebouwd, zonder
`<form>` en zonder JavaScript zodat de nul-JS-regel van die pagina's intact blijft.

Reproduceerbaar met drie scripts (`neem-showcase-op.mjs`, `maak-geluid.mjs`,
`monteer-showcase.sh`); draaiboek en valkuilen in
`docs/offers/belvanger-showcasefilm-elk-vak-2026-07-28.md`.

**Volgende stap is verkoop, geen productie.** Er liggen nu twee films en er is nog geen
betalende klant; een derde film maken zou uitstelgedrag zijn.

**Nog open, en dit vraagt de founder:**

1. **AB Uitvaartzorg heeft een AI-chat en bezoekersstatistieken terwijl de
   privacyverklaring daar zegt dat de site geen trackingtechnieken gebruikt.** De juiste
   alinea ligt klaar in `clients/ab-uitvaartzorg/docs/chatbot-privacy-alinea.md`. Dit is de
   grootste juridische post en het is een live klantsite, dus founder-akkoord nodig.
2. **Activiteitenlog vullen**: `node tools/activiteitenlog-vullen.mjs` met `BV_EMAIL`/`BV_PASS`,
   code uit de mail. Twaalf regels staan klaar in `tools/activiteitenlog.json`.
3. **Dashboardwachtwoord wisselen**: het is op 28 juli in een gesprek geplakt.
4. **Ontbreekt op de site**: vestigingsadres (wettelijk verplicht, ook zonder KvK),
   "excl. btw" bij de prijzen, en de doorgestreepte €1.250 die nooit is gevraagd.
5. **Bewaartermijnen worden nergens afgedwongen** (geen opruimtaak voor `contacts`/`events`)
   en **de containerlogs hebben geen groottelimiet**, dus de schijf kan vollopen.
