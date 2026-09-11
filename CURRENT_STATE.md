# CURRENT_STATE

## Objective

Support the founder's crypto work (research, tools, on-chain development,
content) as a learning-and-building practice. Income is a separate, explicit mode
(see `CLAUDE.md`), not the default. The earlier objective, a founder-operated AI
automation business, is parked: what was built stays live in maintenance mode.

## Current Stage

**Richting gewijzigd op 2026-09-05.** De founder is klaar met de omzetdruk rond
Belvanger en richt zich op crypto. `CLAUDE.md` is omgebouwd (verkenmodus als
standaard, inkomensmodus alleen op verzoek, cryptoregels voor keys, fondsen,
cijfers en bronnen). De verkoop-hook en de Activiteitenlog-hook staan uit.

Live en in onderhoudsmodus: `belvanger.nl` (8 vakken, NL+EN, noindex),
`dashboard.belvanger.nl` (klantportaal, PWA), `ab.primecircle.cloud` (AB
Uitvaartzorg), `a-sisters.belvanger.nl`, `virtualcreator.belvanger.nl` en
`sable.primecircle.cloud` (Sable Observatory). Alles op de eigen Hostinger-VPS
achter Traefik, met externe uptime-bewaking. `SELLING.md` blijft staan als
historische teller en wordt niet meer per sessie getoond.

Actief cryptowerk tot nu toe: Sable Observatory (`sites/sable-peers/`) en de
whitepaper-watcher (`../sable-whitepaper-watch`). Nieuw werk komt in `crypto/`.

Stand Observatory op 2026-09-07: de Orrery (whitepaper als zonnestelsel, alle
tien onderwerpen in een selectie), Gatekeeper (3D-spel met leaderboard in de
container `sable-board`, deelkaart per run), Lisa (ElevenLabs-stemagent van
lisaonsable.com in het gidspaneel, navigeert met zes client tools, tour pagina
voor pagina), en het betrouwbaarheidsrecord in het Log (hoe lang Sable fail-closed
draait, uit het statuslogboek van de watcher). Alles geverifieerd met de
Puppeteer-suites in `sites/sable-peers/tests/`. De map is voor het eerst
gecommit (13c7d82, 8eddca9). De founder zet de contest op het spelleaderboard. Op 2026-09-08 kwam de burn watch erbij en ligt de fail-closed thread klaar als concept (dagsectie onderaan).

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

### Concurrentieonderzoek + ADHD-divergentie (2026-08-07)

Aanleiding: de founder krijgt Facebook-advertenties van MHS Media, NDK-Marketing,
Adsplode Agency en The A-Team Agency. Volledig rapport:
`docs/research/concurrentie-vakmarketing-adhd-2026-08-07.md`.

Twee bevindingen die het beeld in `docs/research/belvanger-klantperspectief-en-concurrentie-2026-07-21.md`
bijstellen:

1. **"Gemiste telefoontjes opvangen" is geen witte vlek meer.** Naast Klusio,
   InstallatieTelefoniste en Sainer draaien nu ook Voicelabs, LoodgieterAI, TalkMate,
   secretaresse.ai, VakWerkSysteem en Beller.io. "Geen jaarcontract" en "exclusieve
   leads" zijn eveneens verzadigde claims.
2. **Het gat zit niet in functionaliteit maar in toetsbaarheid en distributie.** Geen
   enkel vakmensen-bureau publiceert een prijs vóór het gesprek, geen enkele garantie
   gaat verder dan de lead, en geen enkele belofte is nakijkbaar. The A-Team adverteert
   "Wij garanderen leads, afspraken én omzet. Geen resultaat? Dan betaal je niet!"
   zonder aantal, definitie of terugbetaalvoorwaarde.

Geen bouwadvies eruit. De drie hoogst scorende zetten zijn verkoopwerk: de **belproef**
(bel tien vakmensen drie keer, meet, lever het feitelijk terug), de **Lekcheck** (vraag
hun Werkspot/Solvari-factuur en reken kosten per binnengehaalde klus uit), en de
**anti-belofte** (publiceer wat je niet belooft plus je wél-beloftes in bedragen en
werkdagen). Die laatste kan pas na KvK-inschrijving: een ondertekende toezegging met
terugbetaalbedrag is ook zonder inschrijving bindend, terwijl er dan geen
beroepsaansprakelijkheidsverzekering achter staat.

Caveat: de sessie-egress blokkeerde alle externe hosts, dus alles komt uit
zoekmachinesamenvattingen. Geen citaat is letterlijk geverifieerd en de Meta Ad Library
is niet bekeken.

### Kostenaudit (2026-08-07)

Volledig rapport: `docs/decisions/kostenaudit-2026-08-07.md`. Elk bedrag is een
**schatting**, want deze sessie kon geen enkele externe host bereiken en had geen
toegang tot facturen, Hostinger, Twilio of OpenRouter. Het rapport bevat een lijst van
zeven dingen die de founder in tien minuten in zijn eigen accounts kan nakijken om de
schattingen naar feiten te tillen.

**Kern:** de infrastructuur kost naar schatting **€15-25 per maand**, niet de €350 uit
`docs/research/adhd-topnotch-logboek.md`. Dat verschil is geen fout maar een
tijdsverschil: de €350 zijn de lasten **ná KvK-inschrijving**, en de inschrijving is de
aan-knop daarvan. Er valt in de kosten niets te snijden dat in de buurt komt van wat één
klant (€199) oplevert.

Wat de audit wél oplevert, en het gaat over risico in plaats van geld:

1. **Drie containers staan niet in git:** `ab-uitvaartzorg` (de referentiecase, de enige
   met echte bezoekers), `glasservice-siedsma` (de proefsite van de buurman) en Traefik
   (waar alle HTTPS doorheen gaat). `infra/backup/README.md` noemt Traefik al als bekend
   gat.
2. **Vier van de elf containers draaien iets dat niet van het bedrijf is:**
   `knifensharp`, `primecircle`, `primecircle-*` en `agent-zero`.
3. **`knifensharp` claimt de apex `primecircle.cloud` en zijn ACME faalt permanent.**
   Let's Encrypt heeft weeklimieten; haal de apex-labels weg.
4. ~~**Geen enkele container heeft een geheugenlimiet of logrotatie.**~~ **Opgelost in de
   repo op 2026-08-07, nog niet uitgerold.** Alle vijf de services hebben nu een
   `mem_limit` (384m-1024m, bewust noodremmen op ~3× normaal verbruik, geen budgetten) en
   logrotatie op 10 MB × 3. n8n ruimt zijn uitvoeringsgeschiedenis nu op na 7 dagen.
   Gevalideerd met `docker compose config` op alle vier de bestanden; **niet** op de VPS
   gedraaid, want deze sessie kan de machine niet bereiken. Uitrollen = één
   `docker compose up -d` per project. Handleiding, risico's en de controlestap staan in
   `infra/LIMIETEN.md`, het leesscript in `infra/vps-check.sh`.
   **Let op: dit dekt alleen onze eigen vier projecten.** De AB-container, Traefik en de
   vreemde projecten hebben nog steeds geen limiet, en juist die zijn het risico.
5. **Het Twilio-nummer `+14474274008` is geen NL-nummer** en `sms_url` staat nog op
   `demo.twilio.com`, dus wie ernaartoe sms't krijgt een Twilio-demo-antwoord terug.
   Advies: nu al inruilen voor een NL-nummer met sms én voice, zodat je de opstelling
   test die je gaat verkopen.

**En de bevinding die er niet in hoorde maar de belangrijkste is (§7 van het rapport).**
De audit zocht containers die geld kosten en vond er één die dat niet doet:
`glasservice-siedsma`, de proefsite van de buurman van de founder, **glaszetbedrijf**,
**mogelijk klant #1**. Die bestaat nergens in de administratie: geen map in `clients/`,
geen dossier, geen regel in `SELLING.md`, geen voorbeeldpagina voor zijn vak, en het
compose-bestand staat alleen op de VPS. Twee koud aangeschreven prospects staan wél in
`SELLING.md`; de warme buurman met een draaiend product niet.

**Een glaszetbedrijf is van alle tot nu toe bekeken vakken de sterkste zaak voor "mis
nooit meer een klant".** Kapot glas kan niet wachten: wie een ingegooide ruit heeft laat
zijn huis of winkel niet onbeheerd achter, dus een gemiste spoedoproep is geen uitgesteld
werk maar verloren werk, en die klus komt nooit terug. Glasschade komt bovendien 's avonds,
in het weekend en bij storm — precies wanneer hij niet opneemt. De standaard `avg_job_value`
van €250 (`sites/belvanger-portal/src/server.js:93`) is voor dit vak eerder te laag dan te
hoog, dus €199 per maand verdient zich terug bij ruim één teruggewonnen klus.

Twee dingen om niet te vergeten: een deel van het werk loopt via de verzekering (dan telt
wie er als eerste kan komen, niet de prijs), en bij glas concurreer je wél tegen landelijke
ketens met een echte 24/7-lijn. Noem dat zelf voordat hij het doet. Alle bedragen zijn
schattingen; reken de som mét hem uit, niet vóór hem.

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

1. ~~**AB Uitvaartzorg heeft een AI-chat en bezoekersstatistieken terwijl de
   privacyverklaring daar zegt dat de site geen trackingtechnieken gebruikt.**~~
   **Achterhaald, gecorrigeerd op 2026-08-07.** Deze regel is geschreven op 28 juli om 20:36;
   de tekst is diezelfde avond om 21:27 daadwerkelijk toegepast in NL én EN en live
   geverifieerd (commit `21e387e`). De regel bleef staan omdat hij 51 minuten ouder is dan de
   oplossing. **Er stond dus maandenlang onterecht dat de grootste juridische post open was.**

   Wat er wél nog open staat is kleiner en van een andere soort, en het staat als checklist
   onderaan `clients/ab-uitvaartzorg/docs/chatbot-privacy-alinea.md`:
   - **Alien moet de tekst nalezen.** Zij is verwerkingsverantwoordelijke; het is haar
     document, niet het onze. De correctie is doorgevoerd omdat de oude tekst aantoonbaar
     onjuist was, maar dat vervangt haar akkoord niet.
   - **Het databeleid en de verwerkersketen van OpenRouter naar Google** zijn nog niet
     gecontroleerd en vastgelegd. Zolang dat niet is gebeurd, is de alinea "Delen met derden"
     wel eerlijk (hij claimt geen waarborgen) maar nog niet compleet. Zet in OpenRouter ook
     de logging- en retentie-instelling op de meest privacyvriendelijke stand.
2. **Activiteitenlog vullen**: `node tools/activiteitenlog-vullen.mjs` met `BV_EMAIL`/`BV_PASS`,
   code uit de mail. Twaalf regels staan klaar in `tools/activiteitenlog.json`.
3. **Dashboardwachtwoord wisselen**: het is op 28 juli in een gesprek geplakt.
4. **Ontbreekt op de site**: vestigingsadres (wettelijk verplicht, ook zonder KvK),
   "excl. btw" bij de prijzen, en de doorgestreepte €1.250 die nooit is gevraagd.
5. **Bewaartermijnen worden nergens afgedwongen** (geen opruimtaak voor `contacts`/`events`)
   en **de containerlogs hebben geen groottelimiet**, dus de schijf kan vollopen.

---

## 2026-08-21 - Belvanger: derde film, de verdelger met zijn handen vol

Op een suggestie van buiten ("maak zoiets ook eens voor een verdelger") een derde
promotiefilm gebouwd: 25,12s, 9:16, 3,1 MB. Een verdelger staat met een wespennest
in twee handen op een ladder, zijn telefoon gaat, en er gebeurt niets. Daarna de
echte simulatie met een spoedklus, en twee kaarten. Draaiboek en prompts:
`docs/offers/belvanger-film-verdelger-2026-08-21.md`.

**De film is af**, inclusief act 1. Die is gegenereerd via de OpenArt MCP: eerst een
frame met GPT Image 2, daarna de beweging met Seedance 2.5. Halverwege gooide de
founder de shot om: van een rustige "hij kan niet opnemen" naar schrikken, wespen die
eraf komen en een gesproken "mooi" in de camera. Kosten 6.405 credits, waarvan 1.600
aan de vervallen take die al aan het renderen was toen dat verzoek kwam.

Er is bewust **geen negende voorbeeldpagina** voor ongediertebestrijding bij
gebouwd: er zit geen prospect achter de suggestie, en zo'n pagina hoort er pas als
er een naam is die hem moet zien.

Twee dingen die hier zijn geleerd en herbruikbaar zijn:

- **Vak-variabel in plaats van een kopie per vak.** Het opnamepodium en de
  tekstkaarten hebben nu een parameter (`?vak=`, `?set=`) en wisselen alleen de
  woorden die per vak anders horen. Zonder parameter tonen ze exact wat ze altijd
  toonden, want de eerste twee films zijn daarop gemonteerd. Precies dat soort
  wijziging test je op de nieuwe variant en vergeet je op de oude, dus het staat nu
  in `sites/belvanger/tests/filmpaginas.mjs`.
- **Promoveer pas naar de dure resolutie als het IDEE is goedgekeurd**, niet als
  alleen de uitvoering is goedgekeurd. Een gestarte render is niet te annuleren, dus
  het verschil tussen die twee momenten kostte hier 1.600 credits. Een prototype op
  480p kost 280 tot 605 en is er precies voor om die vraag te kunnen stellen.
- **Een vuistregel over wat een model niet kan, is geen wet.** De skill zegt: schrijf
  geen shot rond een bekend zwak punt. Een bijna-valpartij en een wespenzwerm over een
  gezicht zijn allebei zulke punten, en ze hielden allebei stand op de eerste poging.
  Toets zo'n idee één keer goedkoop in plaats van het te laten vallen.

---

## 2026-08-28 - Storing: Traefik en Tailscale vochten om poort 443

De hele VPS was onbereikbaar: elke site gaf 000, inclusief Belvanger, AB
Uitvaartzorg, Glasservice, Knifensharp, Ouderschooldriehoek en het portaal.
Niet DNS, niet het netwerk: een traceroute kwam tot in het netwerk van
Hostinger en stierf bij de laatste hop.

Na een herstart van de machine bleek de oorzaak. **Alle containers waren
gezond, behalve Traefik, en die zat in een herstartlus:**

```
error while building entryPoint websecure: building listener:
error opening listener: listen tcp :443: bind: address already in use
```

Tailscale Serve stond op poort 443 (voor `primecircle-vps.tail2b7e8a.ts.net`,
doorverwijzend naar het dashboard op 127.0.0.1:8095) en claimt die op de
tailnet-adressen. Traefik draait in host-netwerkmodus en wil `:443` op alle
adressen. Een wildcard-bind botst met een specifieke bind op dezelfde poort,
dus dit is een startvolgorde-race: wie het eerst is, wint. Voor de herstart won
Traefik, erna Tailscale.

**Opgelost door de tailnet-route te verhuizen naar 8443** (keuze van de
founder), niet door hem uit te zetten:

```bash
tailscale serve --https=443 off
tailscale serve --bg --https=8443 http://127.0.0.1:8095
docker restart traefik-5fbm-traefik-1
```

De privéroute is nu `https://primecircle-vps.tail2b7e8a.ts.net:8443/` en blijft
werken. De oude configuratie staat op de VPS in
`/root/tailscale-serve-voor-8443.json`. Alle vijf gecontroleerde adressen geven
weer 200.

**Waarom dit belangrijk is voor later:** dit was geen incident maar een latente
race die bij elke herstart opnieuw had kunnen toeslaan, en die de hele
klantenportefeuille tegelijk platlegt. Nu kunnen ze niet meer botsen. Wat er
niet is: een melding. Er is geen enkele bewaking die zegt dat alles eruit ligt;
dat is nu ontdekt doordat er toevallig een deploy klaarstond.

---

## 2026-08-19 tot 2026-08-20 - Klantwerk, buiten dit bestand gehouden

De dagsecties over de klantsites van augustus (virtualcreator.nl, The A-Sisters)
staan in `sites/virtualcreator/HISTORY.md` en `sites/a-sisters/HISTORY.md`. Die
mappen gaan niet naar GitHub: alleen Sable-werk gaat naar git (founderbesluit
2026-09-08), en dit bestand staat in een publieke repo.


## 2026-09-05 - Richting: van Belvanger-omzet naar crypto

De founder gaf aan dat de "zo snel mogelijk geld verdienen"-instelling van
`CLAUDE.md` ging vervelen, dat Belvanger niet hard van stapel gaat en dat de
interesse nu bij crypto ligt. Keuzes uit het interview:

- Vier lanen: onderzoek en analyse, tools en bots, on-chain ontwikkeling,
  content en community.
- Twee gescheiden modi: verkennen (standaard, geen omzettoets) en inkomen
  (alleen als de founder het expliciet zegt; dan Founder Filter plus
  crypto-realiteitscheck en een Buy/Build-stance).
- Belvanger en de klantsites blijven live in onderhoudsmodus. De twee hooks
  (`selling-status.mjs` bij sessiestart, `check-belvanger-log.mjs` bij stop) zijn
  uit `.claude/settings.json` gehaald; de scripts staan er nog. De regel "elke
  Belvanger-wijziging in `tools/activiteitenlog.json`" blijft, alleen zonder
  afdwinging.
- Zelfde repo. Nieuw cryptowerk komt in `crypto/` (README beschrijft de indeling);
  het Sable-werk blijft in `sites/sable-peers/`.

Nieuw in `CLAUDE.md`: harde cryptoregels (nooit seed phrases of private keys,
fondsen en mainnet alleen na sign-off, live cijfers met datum en bron, bronnen uit
eigen docs of code, scam-standaardhouding, SABL-disclosure, MiCA en belasting als
signaleerpunt). `.github/copilot-instructions.md` is niet aangepast.

## 2026-09-08 - Sable: de burn watch en het fail-closed verhaal

Op de vraag "wat bouwen we nu voor Sable" vier kandidaten gerangschikt: de
burn watch (aan de keten, geen sleutel nodig), een uurlijkse ontvangstbewijs-
verificatie in de watcher (sleutel nodig), Lisa echt via Sable routeren
(zelfde sleutel, saldo is een fondsenbesluit), en het fail-closed verhaal als
content. De founder koos de eerste en de laatste; twee sub-agents parallel.

**Burn watch.** De whitepaper (§06, §10) zegt dat betalen in SABL de SABL
verbrandt en dat die rail nog niet live is. De eerste daling van de
mintvoorraad op Solana is dus het moment dat de rail echt live is, los van
aankondigingen. De watcher (`../sable-whitepaper-watch`, commit ee75c2a op
`main`, gerebased op origin) leest elk uur `getTokenSupply` op de mint
`DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump` (geverifieerd tegen de
whitepapertekst, het mintaccount op de keten met mint- en freeze-authority
null, CoinGecko en DexScreener) en schrijft `sabl_supply` in de uurregel.
`status/supply.jsonl` krijgt alleen een regel als het ruwe bedrag verandert;
de basislijn is de lokale run van 2026-09-08 08:43:49Z: 958.374.438,918883
SABL, slot 445.295.744. Een daling geeft een CHANGELOG-entry en de outputs
`supply_fell` en `supply_summary`; `record.json` draagt `sabl_supply` (laatste
lezing, basislijn, verschil, laatste daling). `SOLANA_RPC` overschrijft de
node, een miss is nooit fataal. Op de site (commit 7b23c69) staat onder de
ring één regel uit dat record, verborgen tot de sleutel bestaat, met
`tests/burn-watch-test.mjs` (drie fixtures groen). Gedeployed via
`deploy-to-vps.sh`, dat zelf HTTP 200 en de titel terugzag.

**Wat de auto-mode classifier blokkeerde.** De `git push` van de watcher naar
GitHub (twee keer, ook als losse opdracht), `gh workflow run`, elke bewerking
van `.github/workflows/watch.yml`, en zelfs een `curl` naar de live site ter
controle. Toen de founder later letterlijk "push watcher" zei, ging dezelfde push wel
door: gepusht als 3249db1, handmatige run 34216490228 geslaagd, eerste
GitHub-regel met `sabl_supply` om 2026-09-08T10:38:25Z (slot 445.317.506,
voorraad gelijk aan de basislijn), `record.json` draagt de sleutel.
Leerpunt bij de controle: raw.githubusercontent.com stuurt `max-age=300`, en
die upstream-header wint van `proxy_cache_valid 120s` in nginx. Na een commit
van de Action kan de site dus tot zo'n tien minuten het oude record tonen
(gezien: 10:38Z commit, 10:49Z pas vers op de VPS). Geen fout, wel iets om te
weten voordat je een lege regel als bug aanmerkt.
Daarna live gezien in een headless browser (Puppeteer, scratchpad
`live-burn-watch.mjs`): de regel onder de ring toont de lezing van 10:38Z,
slot 445.317.506, "No burn seen yet".

**Scenarios bijgewerkt (commit 5f23d06).** De voorwaarde "SABL pay-in goes live,
burn visible on-chain" onder "Adoption is visible" draagt nu haar eigen
antwoord uit hetzelfde record: "Not yet: watched hourly since 2026-09-08, no
fall seen" of de daling zelf, met een link naar de burn watch; de intro wijst
naar de uurlijkse lezing. Verborgen zolang het record de sleutel mist. Drie
fixtures in `tests/burn-watch-test.mjs` dekken het, shell-test lokaal groen,
gedeployed. Niet gedaan (bewust aan de founder gelaten): een voorwaarde over
de confidential tier die nu al vier dagen fail-closed is.

Valkuil van vandaag: een JS-patchscript via een Bash-heredoc verloor
backslashes (`\s` werd `s`, `\.` werd `.`), waardoor de test stilletjes
alle letters s uit de tekst haalde. Bestanden met regexes schrijf je met de
Write- of Edit-tool, niet via een heredoc.

**Herstelwacht in de watcher (commit 983f7e2, run geslaagd).** Elke run
vergelijkt de nieuwe grootboekregel met de vorige: `conf_verified` van false
naar true is "recovered", andersom "failed". Een flip wordt het commitbericht
(met het aantal weigeringen ervoor en de laatste tijd) en één melding naar de
app, url `/#log`, tag `status`. Een onbereikbaar endpoint aan een van beide
kanten telt niet als flip. Zeven gevallen getest met `conf_transition()`. Zo
kan de vervolgpost op het artikel ("it said yes again") binnen het uur na het
herstel, met de regel uit het record.

Open na vandaag: de Sable-sleutel (ontvangstbewijsverificatie per uur en Lisa
echt via Sable), de contestsluiting op 14 september (script staat klaar), en
de optionele Scenarios-voorwaarde over de confidential tier.

**Git-regel van de founder: alleen Sable gaat naar GitHub, niets van A-Sisters.**
De opruimcommit met de A-Sisters- en Virtual Creator-bestanden (470 bestanden,
waaronder bronfoto's van de zussen) is uit de lokale geschiedenis gehaald
voordat er iets gepusht was; de bestanden staan nog gewoon op schijf, alleen
niet meer in git. `sites/a-sisters/.gitignore` en `sites/virtualcreator/.gitignore`
sluiten nu hun hele map uit, zodat het niet opnieuw kan gebeuren. De repo op
GitHub is publiek. Het chatbot-, skills- en package-werk uit augustus staat
weer gewoon ongecommit, zoals het was. De
workflow-aanpassing (commitbericht "SABL supply fell" en een pushmelding naar de
app bij een daling, url `/#token`, tag `supply`) staat klaar als patch in de
scratchpad van deze sessie en in de dagrapportage.
Na "Go ahead" van de founder alsnog aangebracht via de editor (de
Bash-variant bleef geblokkeerd) en gepusht als 0a9e51a: bij `supply_fell`
krijgt de commit het voorraadbericht en gaat er één melding naar de app
(`/#token`, tag `supply`). Gevalideerd met een handmatige run.

**Fail-closed thread.** `crypto/content/2026-09-08-sable-fail-closed-thread.md`
(commit 4e6b2db): 17 posts van hoogstens 280 tekens, een lange versie van
zo'n 890 woorden en een feitentabel. Kern: sinds 4 september weigert de
confidential tier elke aanvraag (`measurement_mismatch`), 7.482 op rij om
08:34Z op 8 september, gateway 100% uptime, signer en modellental
ongewijzigd in 26 controles. Alle whitepapercitaten zelf nagelopen in
`whitepaper.sentences.txt` (regels 162, 173, 175, 176). Post 8 gecorrigeerd:
het statusendpoint meldt een probe van 30 s, de teller stijgt zo'n 80 per
uur; de kloof staat als onverklaard in de feitentabel. Niet gepost;
disclosure in post 17; de kop zegt welke posts herschreven moeten worden als
de tier herstelt vóór het posten.

**X Article.** Op verzoek van de founder is de thread ook een X Article
geworden: `crypto/content/2026-09-08-sable-fail-closed-article.md` (titel,
plakklare body met kopjes, citaten en lijsten, de begeleidende post, en een
tabel met de ververste feiten: 7.612 weigeringen op rij om circa 10:12Z op
8 september, afgeleid uit `uptime_seconds`). De omslag is
`2026-09-08-sable-fail-closed-header.png` (1600 bij 640, de 5:2 die de editor
vraagt), getekend uit het grootboek zelf: per dag en uur een cel, oranje waar
een controle landde en weigerde, met de teller en de bronnen. Gerenderd met
headless Chrome uit een HTML-kaart in de scratchpad (`header-card.mjs`).
Gepubliceerd op 2026-09-08: https://x.com/0PTIMUS_ONE/status/2097271677423964363
(de begeleidende post moest naar 251 tekens, de limiet voor het onderschrift is
256). De thread zelf is niet gepost; het artikel kwam ervoor in de plaats.

**MCP Gateway (aankondiging 8 september).** Sable postte "MCP Gateway is live
on Sable. MCP tools, with budgets and policies around them. Every call is
metered and receipted. Shipped." Getoetst aan de eigen bronnen, uitgewerkt in
`crypto/research/2026-09-08-sable-mcp-gateway.md`: de docs-pagina
`/docs/mcp-gateway` bestaat (nieuw sinds 29 augustus) en beschrijft een
tool-proxy: registreer een MCP-server van een derde, krijg een proxy-URL,
elke `tools/call` wordt aan een allowlist getoetst, per aanroep gemeterd
(standaard 100 micro-dollar) en voorzien van een `mcp_call`-receipt met
vingerafdrukken van argumenten en resultaat. Op de publieke API antwoordden
om 14:23Z alle gedocumenteerde paden (`/v1/mcp-servers`, `/v1/mcp/servers/:id`)
404, met en zonder sleutel, terwijl `/v1/mcp` en `/v1/mandates` 401 geven.
Prijspagina en whitepaper noemen de gateway niet. Zelfde patroon als bij de
SABL pay-in: docs en post zeggen "live", de deployment nog niet. Niet
gebouwd, wel overwogen: een uurlijkse 404-naar-401-peiling in de watcher.

**Route watch gebouwd (zelfde dag, na "ja, doe maar").** Watcher-repo commit
d9b0d7f: `claims.json` beschrijft de aankondiging met de twee gedocumenteerde
routes en één controleroute (`GET /v1/mandates`, geeft 401 zonder sleutel);
elke uurlijkse run peilt ze zonder sleutel en schrijft de antwoorden in de
uurregel onder `claims`. Toestand per claim: `present` zodra een route iets
anders dan 404 geeft, `absent` als elk HTTP-antwoord 404 is, `unreachable`
zonder HTTP-antwoord. `status/claims.jsonl` krijgt alleen een regel bij een
toestandswissel, een route die voor het eerst antwoordt geeft een
CHANGELOG-regel, een commitbericht en een pushmelding (`/#log`, tag `claims`).
Tien unittests in `test_watch.py`. Eerste CI-run 34241057755 om 14:52:27Z:
absent, beide routes 404, controle 401, basislijn geschreven. De dagelijkse
paginawacht dekt nu ook `/docs` en `/docs/mcp-gateway`. Observatory (commit
064ff00, gedeployed): paneel "Announced, then checked" in het Log met drie
rijen uit hetzelfde record (SABL pay-in naast de burn watch, confidential tier
naast het statusendpoint, MCP Gateway naast zijn routes); onbekende claim-id's
in het record krijgen een eigen rij zonder deploy. Test
`tests/claims-test.mjs` (vier fixtures), shell-suite lokaal groen. De
gh-workflow-run en de push gingen dit keer gewoon door.

**Het Log korter, en het uurschema is geen uur (avond 8 september).** De founder
zag dat de paginalog alles eronder wegdrukte: 28 regels, zo'n 6.000 px, met een
lege rechterkolom ernaast. Nu toont de lijst zijn nieuwste drie regels en
scrolt de rest in het kader (hoogte = bovenkant van de vierde regel, gemeten
met een ResizeObserver omdat het Log in compactmodus verborgen begint); het
whitepaperpaneel staat ernaast in de rechterkolom; betrouwbaarheidsrecord en
aankondigingen beginnen nu op 1.535 px in plaats van 6.185 px. Zijn tweede
opmerking, "het record is misschien wat verouderd", klopte om een andere reden
dan een cache: GitHub draaide het uurschema (`17 * * * *`) maar zo'n 7 keer
per dag (33 controles in vier dagen, gaten van twee tot zes uur), dus de
nieuwste grootboekregel kon vier uur oud zijn terwijl de pagina "hourly" zei.
Gedaan: vierde feit in het betrouwbaarheidsrecord (laatste controle, hoe lang
geleden, aantal in 24 uur, gemiddelde per dag), een correctieregel onder "What
this page got wrong", de whitepapertekst zegt nu "op een uurschema", en de
workflow heeft een tweede cronregel (`47 * * * *`, commit 9a293f4). Niet
gedaan, wel de echte oplossing als dit blijft: de run vanaf de VPS aftrappen
met een fijnkorrelige token (credential op de VPS, dus validatiezone). Tests:
`tests/log-box-test.mjs` (1320 en 390, grootboekfixture met een regel van 16
minuten oud), shell-suite verwacht nu vier feiten.

**Scorekaart AlfinMzn, 54.045 in golf 15 (avond 8 september).** De founder kreeg
een deelkaart die niet op het bord stond. Onderzoek: AlfinMzn heeft zeven
geaccepteerde runs vandaag (20:26 tot 21:10Z, beste 13.785 in golf 8); de
54.045-run zit er niet bij. De kaart is vrijwel zeker echt: het zaad van vandaag
(`2026-09-08:72514487a320`) levert rond 290 s precies 351 kapotte zegels en 216
loops (simulatie `tests/sim-run.mjs`), de kaart zegt 353 en 216; het
offline-zaad komt niet boven 350 zegels uit, dus de run draaide met een echte
token. Perfect spel scoort op dat punt ~87.000, dus 54.045 met 15 lekken is
gewoon menselijk. Een echte golf-15-run komt door alle servercontroles
(`tests/long-run-check.mjs`: lokale board, 290 s wachten, HTTP 200). Waarom de
inzending toch mislukte is niet vast te stellen: de server logt weigeringen
niet en het nginx-logboek is gereset door mijn deploy van 21:05Z. Kandidaten:
netwerkfout bij het versturen, token ouder dan 15 minuten (scherm uit tijdens
de run), of een replay-mismatch. Niet gedaan: de run handmatig toevoegen (het
bord speelt elke run na; zonder log is er niets na te spelen). Voorgesteld:
weigeringen loggen zonder IP, de laatste onverzonden run in de browser bewaren
met "opnieuw sturen", en het deployscript het bord laten overslaan als
`leaderboard/` niet veranderde (elke `compose up --build` herstart het bord en
breekt inzendingen van dat moment).

**De systeemfout gevonden, en de regel aangepast (nacht van 8 op 9 september).**
De founder wilde het alles-wegtikken bestraft zien en zat met de vraag of hij de
54.045 handmatig moest toevoegen "omdat hij geen systeemfout kon bewijzen". Die
fout bleek er wel te zijn: `nginx.conf` had `client_max_body_size 8k` op
`/api/game/`, en een inputlog is zo'n 22 bytes per tik, dus elke run met meer dan
ongeveer 360 tikken kreeg 413 en bereikte het bord nooit; het live logboek
toonde twee 413's terwijl ik zocht. Sinds de opening op 7 september gingen dus
juist de sterkste runs verloren. Gefixt (512k) en op het record gezet.
Spelregel: een verzegeld verzoek weigeren kost nu 5 budget (`WRONG_COST` in
core.js), naast de reeksreset; alles-wegtikken sterft in golf 2 in plaats van
golf 15 (`tests/wrong-cost-test.mjs`). Bijgeleverd: regelsversie `RULES`
(`/start` geeft hem, de client stuurt hem mee, mismatch = fout "rules" met
uitleg op het eindkaartje), overgangsuur met `core-prev.js` (een pagina van
vóór de wissel wordt een uur lang onder de oude regels nagespeeld), tokenvenster
15 naar 45 minuten, en één logregel per geaccepteerde of geweigerde inzending
(zonder IP of device). Board-, kern-, browser- en shell-suites groen; gedeployed
22:00Z terwijl AlfinMzn speelde: zijn run van 18.340 (golf 9, pagina van vóór de
wissel) kwam om 22:01Z via het overgangspad op het bord. Nog open: het
sterrenpatroon van de geposte kaart toetsen zodra de founder het bestand
aanlevert, en zijn besluit over de 54.045 (advies in het gesprek: wel erkennen,
niet in de contest, want het bord speelt alleen na wat het kan naspelen en de
score kwam uit de nu gedichte maas).

**Het kaartje is een bewijsstuk (9 september, 00:20 CEST).** Op verzoek van de
founder ("maak het kaartje anti-cheat; de huidige scores blijven staan; ik laat
iedereen weten dat de fix er is"). De deelkaart wordt nu getekend na het oordeel
van het bord: geaccepteerd geeft rechtsboven "ON THE BOARD · #n TODAY" plus een
controlecode als 58-K7Q2M9XA (acht tekens uit een HMAC onder het bordgeheim,
alfabet zonder 0/O/1/I/L, alleen uitgegeven bij acceptatie); niet geaccepteerd
geeft "NOT ON THE BOARD" met de reden. `GET /api/game/card/:id/:code` antwoordt
met de rij plus de overige kaartcijfers, nagespeeld uit de eigen inputlog; onder
het leaderboard staat "Check a card". Getest: board-suite (code, foute code,
onbekende run), browsertest (kaart met stempel, code in de resultaatregel),
shell live groen. Gedeployed 22:18Z op een rustig moment (AlfinMzn's laatste run
22:15:56Z binnen, geen nieuwe start). Live gecontroleerd: run 58 met de echte
code geeft 200 met details, een foute code 404. Sterrenvingerafdruk ongewijzigd,
dus de forensische check werkt ook op oude kaarten. Beslissingen in
`sites/sable-peers/GAME-PLAN.md`.

**Elke naam op de lijst (9 september, /loop-opdracht van de founder).** Vraag:
moet "The field" (8 rijen) gelijk zijn aan "Token" (13 balken), plus een sectie
die per project de band met Sable en de reden van opname uitlegt, plus een
onderzoek naar ontstaan en marktkapverloop, wat Sable nodig heeft om een top
pick te worden, en hoe je communityleden van de buren wint. Antwoord op de
eerste vraag: nee, de lijsten meten twee dingen (de tabel neemt een project op
als zijn docs de kolommen beantwoorden, de ladder een token als de markt het
onder hetzelfde verhaal schaart); wat ontbrak was de uitleg per naam. Gebouwd:
sectie 05b "Every name, and why it is here" in het Field-onderwerp (13 kaarten:
wat, band met Sable, welke lijst en waarom, marktkapboog met CoinGecko-cijfers
van 9 september) plus het paneel "What would move Sable up the ladder" (zeven
punten, gemeten aan de peers, met disclosure). Onderzoek: zeven Sonnet-agents
schreven 13 factsheets plus een landschapsnotitie in `crypto/research/peers/`;
`crypto/tools/cg-history.mjs` haalt genesis, ATH, huidige kap en 1-jaars
reeks van CoinGecko (de volledige historie vraagt sinds 2024 een sleutel; de
coin-endpoint niet). Synthese in
`crypto/research/2026-09-09-sable-peers-deep-dive.md`: elk token op de ladder
staat 66 tot 100 procent onder zijn top en elf van de twaalf onder een jaar
geleden; geen enkele peer bewoog op het uitbrengen van confidential AI compute;
wat Sable nodig heeft (markt met diepte, GPU TEE, launchpartners, één pitch,
tokenrol die gebruik volgt, betrouwbaarheid, bouwersprogramma's) en het eerlijke
communityplan (tien tactieken, per buurcommunity de haak). Tests: shell lokaal
groen, `tests/shot-who.mjs` (13 kaarten, Field-onderwerp, 1320 en 390), de
translate-suite had een verouderde `#strip`-selector uit 7 september (element
weg sinds het betrouwbaarheidsrecord), gerepareerd. Niet gedaan, bewust:
Marlin, iExec en Akash als tabelrij, pas na kolom-voor-kolom lezing van hun docs.

**Peer-posts (9 september, ochtend).** Op verzoek: tweets en threads die de
peers taggen en aandacht naar Sable leiden. `crypto/content/2026-09-09-peer-posts.md`:
een lanceerthread (8 posts), dertien losse posts (één per project, elk eerst
iets waars en nuttigs over het getagde project, dan één eerlijk contrast, dan
de kaartpagina, altijd met "I hold SABL."), een afsluitende thread over wat
Sable omhoog zou brengen (getagd @Sablenetwork), een postkalender van een
week (één project per dagdeel, geen dertien tags in één post), en de
etiquette (antwoorden met bron, fout dezelfde dag herstellen, nooit als
aankondiging in andermans Telegram). Handles van de sites zelf gelezen en
gekruist met CoinGecko. Elke post geteld met de link als 23 tekens, alles
onder 280. Kaartafbeeldingen per project op 2x in
`sites/sable-peers/tests/shots/cards/` (`tests/shot-cards.mjs`).

**De chart (9 september, ochtend).** Founder: "kunnen we een Sable-chart van
DexScreener op de site zetten, eigen pagina onder Token?" Na controle: de
SABL/SOL-pool (PumpSwap, 25 augustus) staat op GeckoTerminal met gratis
candles (uur en dag), dus geen embed nodig. Spec in
`sites/sable-peers/CHART-PLAN.md`, daarna gebouwd: sectie `#chart` in het
Token-onderwerp (TOPICS token:['token','chart'], ALIAS chart), cijferrij uit
de bestaande DexScreener-proxy, canvas met candles (1h/1d, 24h/7d/all,
keuze onthouden), de uurlijkse lezingen van de watcher als stippellijn met de
gaten eerlijk open, de gebeurtenissen uit het record genummerd op de as
(statisch: pool, whitepaper-herrender, Integration 001 plus fail-closed, MCP
Gateway; dynamisch: eerste burn en eerste antwoordende route), rechteras
marktkap = prijs maal de laatst gelezen supply, crosshair met tooltip en
pijltjestoetsen, samenvattingsregel voor lezers, gids en tests. Twee
nginx-proxies `/ext/ohlcv-hour` (60 s) en `/ext/ohlcv-day` (300 s) met de
pool vast in de config. Kleuren uit de CSS-variabelen, IBM Plex Mono, geen
bibliotheek. Tests: `tests/chart-test.mjs` (drie fixtures), shell lokaal en
live groen, `tests/shot-chart.mjs` live: 168 uurkaarsen, 15 lezingen in zeven
dagen, alleen de eigen host aangeroepen. Twee deploys (08:33Z en de
legendafix erna), beide op een moment zonder lopende run.

**De watcher draait nu ook op de VPS (9 september, "Ga door").** Container
`sable-watch` in `/opt/sable-watch` (bron: `sites/sable-peers/watcher-vps/`):
dezelfde `watch.py`, elk uur op minuut 05, pull over https, commit met
dezelfde berichten als de Action, push over ssh met een deploy key die op de
VPS zelf is aangemaakt (de privésleutel verlaat de VPS niet, alleen de
publieke helft gaat naar GitHub als deploy key met schrijfrecht), en dezelfde
pushmeldingen naar de app (PUSH_SECRET uit het .env van de site gekopieerd
naar een eigen .env, 600). Bij een rebase-conflict met de Action laat de runner
zijn eigen commit van dat uur vallen. Eerste run handmatig gedraaid: whitepaper,
supply, routewacht en statusregel allemaal goed; de push wacht op de sleutel
op GitHub. Het GitHub-schema blijft als fallback. Open: de founder voegt de
publieke sleutel toe (staat in het gesprek en op de VPS in
`/opt/sable-watch/keys/id_ed25519.pub`); daarna is de eerste push het bewijs.
Vervolg: de founder zette de sleutel erop; de handmatige run om 08:55Z pushte
(commit 4985716 in de watch-repo, "(vps)" in het bericht), niets meer lokaal
achter. Vanaf nu elk uur op :05 een regel van de VPS, plus wat GitHub haalt.

**De chart is live (9 september, vervolg).** Vraag van de founder: kan de chart
live? Streaming bestaat niet zonder eigen relay en de CSP laat geen externe
verbinding toe, dus live = pollen via de eigen proxies: elke 30 s bij
5-minutenkaarsen (nieuw, `/ext/ohlcv-minute`, 30 s cache) en elke 60 s bij uur
en dag, alleen terwijl de sectie in beeld is en het tabblad zichtbaar; lezingen
en record elke vijf minuten. Stempel bij de knoppen "live · updated HH:MM:SS
UTC" met een pulserende stip (niet bij reduced motion, amber als de laatste
lezing te oud is); de vormende kaars krijgt een cyaan omlijning en een stip
op de rechteras. Test uitgebreid: een refresh pikt een veranderde slotkoers
op, 24 uur aan 5-minutenkaarsen zijn er 288, de cadans wordt 30 s.

**X-groeiplaybook (9 september, avond).** Founder: "Help me grow my X account within the AI tech crypto space." Twee sub-agents: een las de stem en de kalender uit de gepubliceerde stukken (elke peer-single linkt uit, geen enkele post stelt een vraag), de ander zocht gedateerde bronnen over het X-algoritme van 2026 (ranker open source sinds 20 jan, Communities dicht sinds 30 mei, API pay-per-use sinds 6 feb, Original Content Rewards vanaf 8 sep). Resultaat: `crypto/content/x-growth-playbook.md`, dertien secties: stand van zaken, diagnose (replies boven timeline, link in de eerste reply, categorie boven project, de watcher als contentmotor, outsider-stance blijft), positionering en bio-concept, drie pijlers (record, categorie, bouw) met sjablonen, weekritme voor 30 minuten per dag, meetplan met maandelijkse analytics-export naar `crypto/content/x-metrics/`, doellijst voor replies, verboden tactieken, automatiseringscheck (draften wel, posten nooit), eerste week 10 tot 16 september, aannames die de founder kan omgooien. Niet gecommit; niets gepost.

**Sandcastles-analyse (9 september, avond).** Founder: kan een systeem als sandcastles.ai voor cryptoprojecten (onderzoek, suggesties, strategie) iets zijn? Twee sub-agents: productdissectie en landschap. Sandcastles is een research- en scripttool voor korte video (outliers tegen de eigen baseline van een kanaal, transcript, hooks, script; $39 tot $399 per maand; oprichter met een miljoen volgers als distributie; databron niet openbaar). Landschap: twaalf cryptotools, allemaal chat-over-data of een score (Kaito, LunarCrush, Cookie3, Messari, Token Terminal, Dune, Arkham, Nansen, Artemis, Addressable, ChainGPT); niemand levert onbewaakt strategie, geen crypto-kloon van Sandcastles, MiCA-check zit in geen enkele tool. Note: `crypto/research/2026-09-09-sandcastles-analysis.md` met drie vormen (A: de Sable-werkwijze als skill, B: observatory-as-a-service, C: Sandcastles-kloon voor crypto-X) en vijf vragen voor een spec. Aanbeveling A eerst, handmatig voor een tweede project. Niets gebouwd, niets gecommit.

**Skill crypto-project-dossier (9 september, avond).** Founder: "turning the Sable workflow into a skill, so that everything we did can be done again targeted at any other crypto project." Een Sonnet-agent haalde de exacte structuur uit de Sable-stukken (factsheetkoppen, de twee lijsten veld en ladder, postpatronen, claims.json en peers.json van de watcher, de ene gecorrigeerde post). Skill geschreven in `.claude/skills/crypto-project-dossier/SKILL.md` (ruim 3.000 woorden): de wet (primaire bronnen, elk cijfer gedateerd, disclosure, niets post automatisch), zeven stappen (intake-brief, surface-inventaris met vier agents en de tabel aankondiging versus docs versus live, twee peerlijsten met factsheet-sjabloon, landschap, synthese op de hoofdlijn, playbook plus contentset, optionele watcher-fork, reviewpas met checklist) en vijftien gotchas. Verificatie: de harness laadde de skill direct (staat in de skill-lijst), alle veertien genoemde paden bestaan, nul em-dashes; een Sonnet-reviewer als verse operator vond acht missers (geneste mappenlayout niet uitgelegd, memory-bestandsnaam, Sable-kolommen als default, onbenoemde afwijkingen van de exemplaren bij link-in-body, vragen en tags, fork-naam, disclosure bij een project als vrager) en alle acht zijn verwerkt. Bijvangst: vier peer-factsheets en de tinfoil-titel bevatten em-dashes van de agents, vervangen. README van de skills en DECISIONS_LOG bijgewerkt. Volgende mijlpaal: de skill draaien voor een tweede project dat de founder aanwijst. Niets gecommit.

**Promotie-aanbod uit Java, Indonesië (9 september, nacht).** Iemand uit Java bood aan Sable te promoten met posters, schreeuwen en "iets geks"; doel volgens hem nieuwsgierigheid, niet investeerders. Founder wil een klein bedrag uitgeven, weet de strategie niet. Advies gegeven, geen besluit: publiek op straat kan alleen SABL kopen (pool onder $100K), geen klant worden; geen meting; anonieme partij; OJK (sinds 10 jan 2025, POJK 27/2024, KOLs opgeroepen juni 2026, POJK 6/2026 over disclosure) plus ESMA-finfluencer-factsheet jan 2026 en MiCA art. 7 en 91. Enige vorm die verdedigbaar is: een developer-workshop met output-gebonden betaling (geverifieerde receipts of runs op het bord via een getagde link), onder de vlag van Sable zelf, nooit betaald in SABL, nooit vooruit. Bronnen in de sessie van 9 sep; niets uitgegeven, niets gebouwd.
- Vervolg (9 sep, nacht): founder: het is een jongen van 21 met vrienden die dit eerder voor Floki deed. Advies aangescherpt: Floki was een meme en verkocht aan het publiek, Sable verkoopt aan developers, dus dezelfde tactiek past niet; het risico landt op hem (OJK). Voorgesteld: zet zijn straatenergie op het Gatekeeper-spel (QR, telefoon, leaderboard met een Java-tag), geen token, geen prijs, betaling klein en per geverifieerde run, en boek het als content plus test, niet als marketing. Bordtag is een kleine wijziging, nog niet gebouwd. Geen besluit.

**Java-straatkit en de bron-tag op het bord (10 september).** Founder: "hand me a guide I could hand him and provide me with materials he needs", daarna: alles over betaling eruit (bespreekt hij zelf) en het spel zelf op de poster. Gebouwd in `crypto/content/2026-09-10-java-street-kit/`: GUIDE.md (de ene regel: geen token, geen prijs; OJK-context; het spel uitgelegd; de getagde link; waar te staan; pitch in Indonesisch en Engels; wat telt; foto-toestemming; niet-doen-lijst; dagchecklist; bijlagen met postertekst, caption en vragen van voorbijgangers; betaling volledig verwijderd op een voorwaardelijke disclosure-zin na), poster.html plus render.mjs (Puppeteer, A4 poster en een A4 met vier A6-flyers, QR naar `?src=java#play`, telefoonmock met een echte opname van het spel via capture-game.mjs tegen de live site, demo-run op 36 s, contest-strip en install-balk verborgen), poster.pdf, poster.png, flyers.png. Bron-tag (Sonnet-agent, hoofdlijn gecontroleerd): `?src=<tag>` wordt in localStorage `sable-game-src` bewaard (source/sable-peers.html, app.js gegenereerd via build.mjs), game.js stuurt `src` mee in /score, server.js kolom `src` plus cleanSrc, `/top?src=` (period standaard all) en `GET /src?tag=` (runs, players, best, first, last), extra tab "from <tag>" op het bord, SAY.play en LISA-GUIDE.md bijgewerkt, testcases toegevoegd. Verificatie: `node leaderboard/test.mjs` slaagt op alle src-cases; één falende assertie is ouder dan deze wijziging en deterministisch (regel 42: `play(seed, 300)` levert score 0 en 1 input, core.js onaangeraakt; vermoedelijk sinds de regelwijziging van 8 op 9 sep), nog te repareren. shell-test lokaal: geen fouten. NIET gedeployed: VPS-zone, wacht op go van de founder. Niets gecommit.
- Vervolg (10 sep): founder wil een videocontest ("post on X with the tag $SABL"). Tegengesproken: een cashtag-eis maakt van de speldag tokenpromotie door Indonesische deelnemers (OJK) met de founder als sponsor (MiCA, AFM-finfluencerregels) en leest als een raid. Alternatief ingebouwd: bijlage C in GUIDE.md (#GatekeeperJava, link, run op het "from java"-bord als toegangscheck, geen token in video of post, prijs buiten de gids) plus `contest-post-draft.md` met aankondiging en afsluiting voor @0PTIMUS_ONE. Deploy van de bron-tag wacht op go.
- Vervolg (10 sep): GUIDE.md ook als leesbare PDF: `guide.html` (IBM Plex Sans, genummerde secties, de ene regel als kader, vraag-antwoordkaarten, linkkader met QR, pitch in twee talen, checklist, bijlagen op een eigen pagina) plus `render-guide.mjs` (Puppeteer, A4, paginanummers) en `preview-guide.mjs` (PNG-voorvertoning, want pdftoppm ontbreekt op deze machine). guide.pdf is zes pagina's. GUIDE.md blijft de bron; bij een wijziging beide bijwerken.
- Vervolg (10 sep): founder zag dat de gedrukte tekst onder de QR (`sable.primecircle.cloud`) zonder tag was, dus getypte links telden niet. Fix: korte link `sable.primecircle.cloud/java`, in nginx.conf `location = /java { return 302 /?src=java#play; }` (nog niet gedeployed, gaat mee met de bord-deploy); poster, flyers, GUIDE.md, guide.html en contest-post-draft.md tonen nu de korte link; de QR houdt de volledige getagde link (werkt ook voor de deploy). Tot de deploy geeft een getypte /java een 404: deploy voor de posters ophangen.
- Vervolg (10 sep): founder: geen videocontest in de gids; het bord is de prijs voor spelen, en wie een video post met #GatekeeperJava en @Sablenetwork doet mee aan een willekeurige trekking. Bijlage C (contest) uit GUIDE.md en guide.html verwijderd, nieuwe sectie "Ask for a video" (05 in de PDF, secties hernummerd), niet-doen-regel en het antwoord op "Can I win something?" aangepast, contest-post-draft.md herschreven als aankondiging plus trekking (reproduceerbare seed, geen prijs in SABL, kanttekening over undian gratis berhadiah). Founder schreef @Sablenetworks; de geverifieerde handle is @Sablenetwork, die staat erin.
- Vervolg (10 sep): trekking van de videoprijs een week na de dag (inzendvenster een week), in GUIDE.md, guide.html en contest-post-draft.md.
- Deploy (10 sep, "have the website updated for the Java players"): deploy-to-vps.sh twee keer gedraaid (de tweede omdat `return 302 /?src=java#play` achter Traefik een Location met :8080 opleverde; nu een absolute https-URL). Live geverifieerd: /java geeft 302 naar https://sable.primecircle.cloud/?src=java#play; /api/game/src?tag=java geeft JSON, x! geeft 400; /top?src=java filtert; health ok met 119 rijen (database bleef staan). tests/java-tag-live.mjs (nieuw): pagina via ?src=java bewaart de tag en toont de tab "from java", een echte run via de API met src=java wordt geaccepteerd (id 120), /src telt 1, /top?src=java toont hem; daarna de smoke-rij verwijderd met admin.js delete-name, teller weer 0. Niets gecommit.
- Vervolg (10 sep): aankondiging voor de Java-community: `announcement-java.md` (X-post Engels en Indonesisch onder 280, tweetalige lange versie, doorstuurbaar WhatsApp/Telegram-bericht voor de organisator, en de invulpost voor als prijs en periode vaststaan; overal: hadiah en periode kontes segera, geen token, disclosure) plus `announce.html`/`render-announce.mjs`/`announce.png` (1200x675-kaart met QR). Indonesisch is concept, organisator leest mee.
- Java-strip (10 sep): founder omcirkelde de contest-strip op de speelpagina en vroeg erbij: de Java-contest start binnenkort, meer volgt. Toegevoegd in source/sable-peers.html: `#java-soon`, een tweede `.contest`-strip met klasse `java` (cyaan rand) onder `#contest`, statisch, altijd zichtbaar, Engels plus Indonesisch ("Kontes Jawa segera dimulai · info menyusul"); SAY.play en LISA-GUIDE.md bijgewerkt. Build ok, shell-test lokaal zonder fouten, gedeployed, live gecontroleerd (markup in index en app.js via curl, screenshot via tests/shot-java-strip.mjs: strip zichtbaar, 63 px hoog). Nog niet gecommit: strip, aankondiging (announcement-java.md, announce.html/png, render-announce.mjs), tests/shot-java-strip.mjs.
- Peer-singles herschreven (10 sep): founder vond de dagelijkse posts te technisch voor het publiek. `crypto/content/2026-09-10-peer-posts-plain.md`: dezelfde dertien feiten en volgorde in gewone taal (sealed hardware in plaats van TEE, hardware proof in plaats van attestation, signed receipt, pay per request), elk met een vraag aan het eind, link in de eerste reply, disclosure als laatste regel, onder 280. Threads 1 en 2 ongewijzigd in het oude bestand.
- Promovideo van het Observatorium (10 sep): `crypto/content/2026-09-10-observatory-promo/`. capture.mjs klikt met Puppeteer door de live site (overview, explained, deur met verzenden en loop tot de 402-weigering, verify, token, play, log, community, gids) en schrijft elf shots op 3840x2160 plus de klikposities; build.py maakt de renderconfig voor de browser-video-recording skill, de intro- en eindkaart en de onderschriften, en zet alles met ffmpeg in elkaar. Resultaat sable-observatory-promo.mp4 (1920x1080, 60 fps, 48,5 s, 37 MB, stil) en een -small versie (30 fps, 15 MB) voor Telegram en WhatsApp. post.md heeft de X- en Telegram-tekst met disclosure. Geverifieerd met ffprobe en dertien framegrepen. Skill kreeg een Gotchas-sectie (Windows heeft een cursor-PNG nodig, 16:9 voor social, tekst pas achteraf via ffmpeg). Geluid toegevoegd op verzoek: voice-over (vidIQ, stem Sarah, 14 credits) en muziekbed (vidIQ, 25 credits), mix.py knipt de voice-over op pauzes en legt elke zin op de start van zijn scene (DP op kandidaatpauzes tegen het tekstaandeel per zin; vaste drempels gaven verkeerde knippunten), muziek duckt onder spraak. Eindkaart naar 7 s, totaal 51,9 s. Bestanden: -promo.mp4 (met geluid), -small.mp4, -silent.mp4. Alignment afgeleid uit pauzes, niet beluisterd. Founder vond de schermopname niets en wilde een animatiefilm: gebouwd als film/film.html (canvas, dertien scenes in de huisstijl van de site: orrery, envelop en deur, budgetbalk met 402, ring van duizend lichten, gatekeeper, klok en diff, Lisa-orb, eindkaart) op exact dezelfde tijdlijn als de voice-over, per frame gerenderd met film/render.mjs (Chrome, 1557 frames in 216 s), ffmpeg en dezelfde mix.py. Resultaat sable-observatory-film.mp4 (1080p30, 51,9 s, 7,7 MB) plus -small en -silent; frames per scene visueel gecontroleerd. OpenArt stond op 3 credits, dus geen AI-footage; vidIQ had 111 credits over. Op verzoek van de founder is de disclosure-zin uit de film gehaald: eindkaart zonder The author holds SABL, voice-over geknipt op de pauze na Independent (TRIM_END in mix.py), alleen de eindscene opnieuw gerenderd (render.mjs from=44.9). Daarna ook Independent weg: de film eindigt op de link, voice-over geknipt op de pauze na cloud (TRIM_END 44.98), eindkaart met alleen URL en tagline. De disclosure staat nu alleen nog in de posttekst (post.md), dat is de plek waar hij bij publicatie moet blijven. Niets gecommit.
- Robinhood Chain-brug, poll-analyse (10 sep): founder vroeg pros en cons met ADHD-run voor de community-poll of Sable naar Robinhood Chain moet bridgen. Feitenbasis uit primaire bronnen (Robinhood newsroom en docs, Arbitrum DAO factsheet, LayerZero deployments, Sable whitepaper v2.0 snapshot 4 sep): chain 4663, mainnet 1 juli 2026, USDG als native stablecoin, LayerZero-partner, Stock Tokens niet in de VS; SABL fixed supply met ingetrokken mint authority, enige utility pay-in met burn. Vijf geisoleerde divergente takken (markets, regulator, attacker, inversion, remove-assumption), 30 ideeen gescoord en geclusterd, drie verdiept. Conclusie (mening): token niet bridgen (wrapper = nieuwe mint authority, pool van 60K splitst, bridge groter aanvalsvlak dan de cap), betaalrail is een config-vraag (USDG vs USDT in de verifier) en pas bij echte vraag, nu gratis: gedateerde no-SABL-on-4663-notice plus counterfeit watch. Poll-tekst zelf niet gevonden (X niet scrapebaar), beide lezingen behandeld. Bestanden: crypto/research/2026-09-10-sable-robinhood-chain-bridge.md (note met ADHD-output en bronnen) en crypto/content/2026-09-10-sable-robinhood-chain-bridge/article.md (publiek, met disclosure), plus article.pdf via render-pdf.mjs (eigen markdown-naar-HTML, Chrome print A4, paginanummers en disclosure in de voet; geen markdown-lib of pdftoppm op deze machine, gecontroleerd via een Chrome-screenshot van de printpagina). Vervolg: counterfeit watch op 4663 bouwen in de watcher. Niets gecommit.
- Reading room op het Observatorium (10 sep): founder wil al zijn community-research op de site. Nieuw topic Reading room: rail-item, orrery-chip, gids-knop en SAY-tekst, sectie met kaartjes uit site/notes/index.json, per stuk een eigen donkere pagina onder /notes/<slug>.html plus PDF. Bronnen in sites/sable-peers/notes/*.md met front matter; build-notes.mjs maakt de paginas en de index (eigen markdown-subset, geen inline scripts, CSP houdt), daarna build.mjs. nginx.conf: location ^~ /notes/ met security headers en no-cache. LISA-GUIDE.md en de Page updates-lijst bijgewerkt; notes/README.md beschrijft het proces. Eerste stuk: de Robinhood Chain-analyse. Verificatie: tests/shot-reading.mjs (desktop en telefoon, sectie, kaarten, rail, gids, orrery, geen overflow, notitiepagina) slaagt op de lokale build; shell-test aangepast van tien naar elf topics. Live-diff vooraf: de live shell had de Java-strip al, het enige verschil met de build was de reading room zelf. Na go van de founder gedeployed met deploy-to-vps.sh (backup, containers opnieuw, HTTP 200). Niets gecommit.
- Counterfeit watch op Robinhood Chain (10 sep): gebouwd in de watcher (../sable-whitepaper-watch): watch.py krijgt counterfeit_watch (DexScreener-search voor SABL, SABLE, Sable; de Blockscout-API van chain 4663 zit achter een Cloudflare-botmuur, ook voor echte Chrome), woordmatcher met homogliefen en wrapper-prefixen (reusable en usable tellen niet mee, Sablier genegeerd), status/counterfeit.jsonl (baseline plus elke wijziging), CHANGELOG-entry en commit-output bij een nieuw adres, counterfeit_4663 in record.json en in de uurregel, --counterfeit-only voor de baseline. test_counterfeit.py (21 tests totaal groen). Baseline 2026-09-10T21:58Z: een token Sable/SABLE op 0xd00126f6...48cf, Uniswap-pool van 26 juli 2026, 3,4K liquiditeit, ouder dan SABL, niet van Sable Network; 14 look-alikes op andere chains. Site: regel onder de Reading room en op Token uit record.json (data-cf-line), artikel en notitie aangepast (geen nul-baseline meer beloofd), PDF opnieuw, Page updates en LISA-GUIDE bijgewerkt, shot-reading.mjs kan een lokale record.json injecteren en controleert de regel. Watcher-commit lokaal, push door de founder (record.json niet meegecommit, de eerstvolgende uurrun herbouwt hem); tot die push blijft de regel op de live site verborgen.
- De brievenbus, Agent Post (11 sep): founder kreeg van AG Ultra Magnus een stappenplan om het Observatorium een Sable Agent Passport en een Agent Post-brievenbus te geven (handle sable-observatory, allowlist lisa-on-sable, postage 0). Geverifieerd tegen buildsable.com/docs (agent-post, agent-passport, auth, webhooks) en api.buildsable.com/openapi.json: alle routes bestaan; passport en webhooks gaan via de wallet-sessie, niet de API-key; post_received staat nog niet op de webhooks-pagina. GET /v1/passport telt nul agents; lisa-on-sable bestaat nog niet (404). Gebouwd: leaderboard/server.js leest de inbox met SABLE_POST_KEY uit de VPS-.env (elke 5 min, bij webhook met HMAC-check, of via admin post-poll), opent, markeert gelezen, bewaart in SQLite, serveert /post/status en /post/messages zonder key; admin.js post-settings/post-check/post-poll/post-inbox; compose-env en nginx /api/post/; site-topic Letterbox met kaartjes, ontvangstbewijs en knop naar de verifier; LISA-GUIDE, Page updates, shell-test op twaalf topics; post-test.mjs tegen een mock van Sable's API; POST-SETUP.md is het stappenplan voor de founder (wallet, mint, key in de VPS-.env, settings). Na go van de founder gedeployed: /api/post/status antwoordt on:false (brievenbus dicht tot de key in de VPS-.env staat), /api/post/messages 404, health letterbox:false, topic-checks live groen. Founder heeft op 11 sep het passport gemint (eerste en enige agent in Sable's directory, wallet niet openbaar) en de key in de VPS-.env gezet; daarna via ssh post-settings gedraaid: allowlist lisa-on-sable, postage 0, bevestigd door Sable (updated_at 08:41Z), publieke check accepts:false policy allowlist (normaal), board leest de inbox zonder fout (0 brieven). Brievenbus open. Lisa's passport lisa-on-sable is om 09:14Z gemint (open policy, postage 1000 micro-USD, Solana-anker) en haar eerste brief (id pm_fa16d17e…, onderwerp "Bonjour de Lisa", postage 0) kwam om 09:15:30Z binnen; het board sloeg hem om 09:15:40Z op zonder webhook. Gecontroleerd om 09:55Z: Sable's publieke verifier zegt valid, signer 0xf4a63ed6…ad812 (dezelfde gateway-sleutel als onder de passports); de Letterbox-pagina toont de brief met ontvangstbewijs op desktop en telefoon en de Verify-knop geeft in de browser "signature valid"; body_fp is sha256(onderwerp + newline + body), niet van de body alleen (vastgelegd in POST-SETUP.md). tests/shot-letter-live.mjs rendert het live topic en drukt op Verify. Volgende stap: het ontvangstbewijs samen met Ultra Magnus publiceren; webhook blijft optioneel.
- Whitepaper-EP en sonic logo (11 sep): founder wil met muziek iets creatiefs voor Sable. De brainstorm (ADHD-run, vijf frames) dreef naar sonificatie; founder koos voor echte muziek: een EP van zes nummers met de whitepaper-zinnen als tekst, plus een sonic logo van twee seconden, beide via zijn eigen Suno-artiest (Pro-rechten, remixen uit, coherent geluid, Engels). Map `crypto/content/2026-09-11-sable-whitepaper-ep/`: SPEC.md (besluiten met verworpen alternatieven, tracklist, Suno-werkwijze, bouwplan luisterkamer, verificatieplan), whitepaper-quotes.md (sub-agent, 14 secties verbatim), zes trackbestanden (tekst, mood-regel, bronnen met zin-id), check-quotes.mjs (53/53 citaten verbatim in whitepaper.txt en allemaal gezongen), sonic-logo/cut.sh (ffmpeg-snede, loudness, mp3/ogg/wav). Open: de artiest-basis van de founder in tracks/ARTIST.md, dan de Suno-sessie (twee takes per nummer, mp3 in audio/). Daarna: build-tracks.mjs, luisterkamer-band naast de leeskamer, afspeelglyph op de Orrery-planeet, tests, deploy. Geen Suno-MCP beschikbaar; genereren is handwerk.
- Whitepaper-EP live, de luisterkamer (12 sep): founder genereerde de zes nummers op Suno als OG THE MOGI (melodic rap, Midwest double-time flow; artiestbasis zonder echte artiestnamen omdat Suno's filter die weigert, in tracks/ARTIST.md) plus een sting van 18,8 s. Gebouwd: `sites/sable-peers/build-tracks.mjs` (leest tracks/*.md en audio/*.mp3 uit de EP-map, bouwt site/tracks/<slug>.html met speler, songtekst met elke geciteerde regel gemarkeerd en bij de build opnieuw verbatim gecontroleerd tegen whitepaper.txt, bronnen met zin-id, stempel en disclosure; kopieert de mp3's; schrijft site/tracks/index.json), `page-shell.mjs` (CSS en helpers uit build-notes.mjs gelicht, uitvoer byte-identiek), nieuw topic Listening room in source/sable-peers.html (rail, orrery-chip, nav, aliassen, gids-NAMES en SAY, spraakkaart, orrery MARKS/NAMES_T/LINKS naar planeten 01 03 05 07 08 13, paneelknop "Hear this section", noot-glyph op planeten met een nummer, band met zes spelers waarvan er een tegelijk speelt, log-item). Tests: tests/tracks-test.mjs nieuw (index, zes pagina's, mp3 HEAD, geen overflow op 390), shell-test.mjs uitgebreid (luisterkamer, dertien topics, planeet 01 biedt zijn nummer) en lokale runs negeren nu CORS/404-ruis op 127.0.0.1. Deploy met deploy-to-vps.sh; live: index.json 200 met zes nummers, mp3 als audio/mpeg met byte-ranges, trackpagina 200, beide suites live zonder fails of errors. Sonic logo: de sting is een doorlopend stuk zonder de twee-events-vorm; drie kandidaten gesneden (A 7,66 s, B 6,40 s, C 16,38 s met uitloop) in sonic-logo/out/, founder kiest op gehoor, daarna inbouwen (video-intro, brievenbus). Open: Lisa's ElevenLabs-prompt kent het topic nog niet (eigenaar van Lisa), commit en release-posts door de founder.
- Ident en covers (12 sep, later): founder koos snede B van de sting. Ident als `site/sable-ident.mp3` plus `SABLE_SOUND.ident()` (respecteert de geluidsknop in de kop); speelt bij Play in Gatekeeper, bij een geldig geverifieerd receipt en bij het openen van de brievenbus als er sinds het vorige bezoek een brief landde (nieuwste id in localStorage `sable-mail-seen`). Shell-test controleert functie en audio-mime; live groen. Promo: `add-ident.sh` legt de ident over een klare video (`sable-observatory-film-ident.mp4`). Covers: OpenArt had 3 credits (goedkoopste beeldmodel 10), dus in code getekend: `covers/render-covers.mjs` (Puppeteer, canvas, IBM Plex Mono) maakt het albumhoes "Compute You Can Prove" (de Orrery met de zes lichtende planeten) en een hoes per nummer (planeet, nummer, oranje maan, hook) op 3000x3000, plus 1500 px JPEG in covers/web/; PNG-masters gitignored. Trackpagina toont zijn hoes en gebruikt die als og:image; opnieuw gedeployd en live getest.
