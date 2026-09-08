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

## 2026-08-19 — virtualcreator.nl: de scroll-film staat (fase 2 af)

Herbouw van `virtualcreator.nl` (VA-praktijk van Wendy Wisman) als scroll-film
"RUIS → RUST". Alles in `sites/virtualcreator/`; `BUILD_PLAN.md` is de brief die
bij twijfel wint van de conversatie.

**Fase 2 is af: de film loopt.** Proloog, vier hoofdstukken en resolutie op één
master-timeline in `site/index.html` + `site/css/film.css` + `site/js/film.js`.
Rapport in `prototypes/FASE2_RESULTAAT.md`, screenshots in `prototypes/f2-shots/`.

Founder-beslissingen deze sessie: hoofdstuk 3 werd **Klantcontact** in plaats van
Social (dekt de categorie Communicatie, die geen eigen beat had), elk hoofdstuk
kreeg een ondertitel die de dienst noemt, "ontward" verviel ten gunste van
"ingepland" bij Agenda en "opgevangen" bij Klantcontact, Facturatie blijft
"betaald", en de ruis-copy noemt nu mensen en tijden in plaats van taken.

Twaalf defecten gevonden en gerepareerd (7 t/m 18 in het doorlopende register),
waarvan de duurste een `fromTo` zonder `immediateRender: false` was: die zette de
trim van de streek al bij het bouwen op 3%, waardoor de lijn de **hele film**
onzichtbaar was terwijl het testharnas nul problemen meldde. Geverifieerd:
systeem-check 12/12, beat-contract 5/5 op de echte film, 65 frames over vijf
viewports zonder overflow of consolefout, jank p95 5,7ms bij CPU 4x vertraagd.

**Daarna herzien op eis van de founder: "alles wat we ontwerpen moet voor zowel
desktop als mobile goed werken".** De film heeft nu twee kaders, smal 390x844 en
breed 1180x720, met de grens op 1000px. Eén choreografie (zelfde gebaren,
volgorde, ruis, timeline, beats), twee composities, allebei als data in
`site/js/film-data.js` onder `layouts`; alle absolute posities zijn uit de CSS
gehaald zodat er één bron is. Het brede kader is een eigen beeld: links het
hoofdstuk als titelkaart, midden het werk, rechts de stapel van wat er nog ligt.
De gebaren worden per kader uniform in een vak gepast, want een streek die in x
anders schaalt dan in y is geen penstreek meer. Nieuwe regressietest
`tests/kader-check.mjs` (9/9) bewaakt beide kaders én de wissel ertussen; die
vond meteen defect 19 (de scrubpositie sprong bij een kaderwissel van 72% naar
94%). Sweep uitgebreid naar 96 frames over acht viewports van 320 tot 1920,
inclusief 999 en 1000 om de grens te toetsen: schoon.

**Fase 3 is daarna ook af: er staat een complete website.** Alle inhoud van de
oude vijf pagina's staat er (Over Wendy, vier dienstcategorieën met alle 23
taken, de drie stappen, de drie tariefpakketten plus de tien voordelen, de drie
testimonials, een FAQ, contactformulier, footer), plus de twee juridische
teksten als eigen pagina's, plus robots.txt, sitemap.xml en een .htaccess met de
301-redirects van de oude paden. Zeven defecten gevonden en gerepareerd (20 t/m
26). Nieuwe test `tests/secties-check.mjs` (24/24) telt de inhoud en toetst dat
het formulier niets belooft wat het niet doet: het verzendadres is nog niet
gekozen (K4), dus het zegt dat en geeft het telefoonnummer als werkend
alternatief.

**Daarna een verhaalfout gevonden door de founder, en die zat dieper dan hij
leek** (defect 27). De ruis-items waren op VOLGORDE aan de regels van de
doelstructuur gekoppeld in plaats van op inhoud, waardoor in drie van de vier
hoofdstukken iets anders neerkwam dan er werd opgepakt: de nieuwsbrief werd
"Vraag van Mark", en de protagonist Factuur #1047 landde op de regel van #1045
terwijl de #1047-regel met de stempel "voldaan" uit het niets verscheen. De
payoff van de hele film klopte dus niet. Elk item wijst nu expliciet zijn regel
aan en elke regel heeft precies één herkomst. Nieuwe regressietest
`tests/verhaal-check.mjs` (34/34, geen browser nodig) dwingt af dat wat wordt
opgepakt en wat neerkomt minstens één betekenisvol woord delen. Les voor de
volgende keer: een fout die je alleen ziet tijdens het scrollen, vang je niet
met screenshots maar met een invariant op de data.

**Daarna het merk erin gezet** (founder-verzoek): het echte logo van Virtual
Creator en beide foto's van Wendy, opgehaald van haar eigen site met een echte
browser (zelfde route als de contentsnapshot; de site geeft 403 op kale
fetchers). Ik had de naam eerst nagezet in de sitefont, maar naast het origineel
gelegd bleek dat kansloos: het is een rond, handgetekend lettertype. Het
beeldbestand is dus de bron. `tools/beeld.mjs` bouwt daaruit de assets (woordmerk
apart van het lockup, WebP met terugval, bijsnede gemeten in plaats van geraden).
In de balk staat alleen het woordmerk: de tagline "Creëert rust en ruimte" is de
slotregel van de film en hoort niet vooraf in de hoek. Opvallend meevallertje: op
beide foto's staan pampasgras en daglicht door een raam, precies de wereld die de
film met licht en schaduw schildert. Ook gerepareerd: "Over mij" ontbrak in de
menubalk terwijl de voet hem wel noemde; `secties-check` dwingt nu af dat balk en
voet het eens zijn en dat geen anker dood is.

**LIVE als voorbeeld op <https://virtualcreator.belvanger.nl>** (2026-08-19, op
verzoek van de founder om te kunnen delen met Wendy en familie). Dit is een
subdomein van ONS domein, niet virtualcreator.nl: dat blijft van Wendy en gaat
pas over na haar akkoord. Statische map achter nginx-unprivileged in een eigen
container op de VPS, met Traefik en Let's Encrypt. Eén DNS-wijziging: A-record
`virtualcreator` -> 31.97.123.34 in de zone van belvanger.nl; bestaande records
ongemoeid.

**Omdat het een kopie is van de site van een echt bedrijf, staat de hele host op
noindex**: `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` op elk
antwoord (in nginx, niet in de HTML, zodat hij ook voor beelden en latere
pagina's geldt), `robots.txt` met `Disallow: /`, en `/sitemap.xml` geeft 404.
Zonder die maatregel zou Google een tweede Virtual Creator kunnen indexeren met
een formulier dat nog nergens heen gaat. Het deployscript weigert "klaar" te
melden als de header ontbreekt, en `secties-check` eist bij een uitsluitende
robots.txt ook de header. Details in `sites/virtualcreator/deploy/DEPLOY.md`.

**Sinds 2026-08-19 staat er ook een chat-assistent op** (founder-verzoek). Niet
nieuw gebouwd maar **geconfigureerd**: `product/chatbot` is config-driven, dus
dezelfde code draait voor elke klant en alleen
`customers/virtualcreator/` verschilt (config, systeemprompt, kennisbank, skin).
De kennisbank komt volledig uit haar eigen site en algemene voorwaarden; alles
daarbuiten wordt doorverwezen naar 085 060 1636 of info@virtualcreator.nl.

Drie dingen kwamen daarbij uit het echt draaien, niet uit de code lezen:
1. **"dag en nacht bereikbaar" en "24/7" zaten hardgecodeerd** in de gedeelde
   server en widget, omdat de eerste klant een uitvaartonderneming is. Voor een
   VA die op werkdagen van 09:00 tot 17:00 werkt is dat onwaar. Nu een
   configveld `availability`; AB's bestaande tekst is expliciet in hun config
   vastgelegd zodat hun live site niet stilletjes veranderde.
2. **De assistent beweerde dat Wendy in het Engels werkt**, puur omdat hij zelf
   Engels antwoordde. Dat staat nergens in de kennisbank. Systeemprompt
   aangescherpt: jouw kunnen is niet haar dienstverlening.
3. **Hij vulde "mailboxbeheer" aan** met categoriseren en archiveren. Ook dat
   belooft zij nergens.

Daarna gepersonaliseerd op verzoek van de founder, die terecht zag dat het
widget generiek oogde en twee keer "Digitale assistent" toonde. Dat laatste was
geen tekstfout maar een symptoom: **zonder endpoint viel het widget terug op een
generieke standaard** (beige, geen naam, geen chips, geen belknop). Precies wat
je ziet bij de statische preview en bij de pagina vanaf schijf, dus in twee van
de drie manieren waarop deze site bekeken kan worden.

Nieuw in het product, en dus herbruikbaar voor elke volgende klant:
- een optionele **`skin.css`** per klant, omdat vijf configkleuren wel de kleur
  regelen maar niet de vorm (radii, letterdikte, schaduwwetten);
- **alle zichtbare teksten configureerbaar** (`toggle`, `subtitle`, `greeting`,
  `placeholder`, `send`), per taal, want een assistent die bij iedere klant
  woordelijk hetzelfde zegt valt op;
- een **`logo`** in de kop in plaats van de naam als tekst;
- **`{groet}`** in de openingszin wordt Goedemorgen/Goedemiddag/Goedenavond;
- de **klantconfig wordt meegeleverd** achter het widgetbestand, zodat het
  widget er ook zonder endpoint uitziet zoals het hoort. Bewust een globale en
  geen los JSON-bestand: op file:// blokkeert de browser een fetch naar een
  lokaal bestand, en dat is nu juist het geval waarin er geen endpoint is.

**Te bekijken op drie manieren**, allemaal geverifieerd: via de preview-server op
`http://localhost:4173/site/index.html`, of door `sites/virtualcreator/site/index.html`
gewoon te openen (alle paden zijn relatief gemaakt).

**Fase 4 is ook af.** Kader van de founder: dit is een voorbeeld om aan Wendy te
laten zien, niet iets dat live gaat, maar het moet visueel af zijn. Gebouwd in de
volgorde waarin zij het tegenkomt: de intro-overlay (van leeg naar f(0) in ~3,3s,
afgebroken zodra zij scrolt), Lenis voor de vloeiendheid, de sectie-opkomst na de
film, het cursorspoor uit DESIGN_SYSTEM §8, het ambient onderhoud, het
reduced-motion tweeluik (uit dezelfde filmdata als de film, zodat het niet kan
uitlopen), de deelafbeelding als écht frame uit de film plus de Open Graph-set,
en haptiek van één tik per afgerond hoofdstuk. copy-gate exit 0.

Nog nodig vóór een eventuele livegang, allemaal beslissingen en geen bouwwerk:
het verzendadres van het formulier (K4), bevestiging dat de testimonials echt
zijn (K7), Wendy's akkoord op de geactualiseerde privacytekst, en toegang tot
hosting en domein. Voor een voorbeeld blokkeert daarvan niets.

**Dit blijft productie, geen verkoop.** Er is nog geen betalende klant. Wendy is
tegelijk de kortste verkoopactie die er ligt: haar de statics laten zien en
vragen wanneer zij 20 minuten heeft.

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

## 2026-08-20 (tweede ronde) — The A-Sisters: de scroll-film terug, nu met een drager die werkt

De founder zei dat de pennenstreken niet werkten. Daarop is de hele scroll-film
weggehaald en vervangen door een redactionele pagina. Dat was één stap te ver,
en hij zei dat ook: hij zocht een scroll-film-website. Het bezwaar ging over de
STREEK, niet over de FILM.

**De film is terug, bovenop de Atelier-vormgeving.** Hij heet De Kolommen. Uw
werk staat in één kolom; die kolom groeit sneller dan u bijhoudt; dan valt uw
ene assistent weg en staat alles stil terwijl de teller doorloopt; de kolom
splitst in drie met een naam boven elk, dezelfde twaalf regels verdeeld; en dan
valt er wéér één weg, maar nu schuift haar werk naar de twee kolommen ernaast
en stopt de stroom geen moment. Daar staat de enige zin die de film nodig heeft.

**Waarom deze drager wel werkt en de streek niet.** Het verschil tussen één
kolom en drie kolommen is op ELK stilstaand frame zichtbaar, ook op een
telefoon. De streek was bevroren niets meer dan een rode lijn, en zijn betekenis
kwam pas na de hele film. Bovendien toont deze film het enige echte
verkoopargument (er valt nooit iemand weg) in plaats van het te beweren: het is
twee keer dezelfde gebeurtenis met een andere afloop.

**Het concept is niet van mij.** Ik had drie concepten (vallende papieren, een
bureau dat leegloopt, een werkdag als klok) en heb ze laten aanvallen door een
strateeg die ze niet had geschreven en niet wist welke mijn voorkeur had. Die
sloopte alle drie, en van hem is de vierde: de kolommen. Zijn twee voorwaarden
zijn overgenomen: de prijs mag niet achter de film (het openingsscherm draagt
"Vanaf € 360 per maand, vanaf 6 uur" met een link naar de tarieven), en de film
moet leeg kunnen draaien.

**Baan A, pure code.** GSAP, ScrollTrigger en Lenis lokaal. Geen gegenereerde
video, geen credits, geen extern account. Baan B (echte Seedance-beelden) is een
latere upgrade en kost geld; dat vraagt eerst toestemming.

Gemeten op het live adres:
- Elke beat geschoten op 1440 en 390, alle elf, met wat er te zien hoort te
  zijn: één kolom bij de stapel, drie kolommen na de splitsing, alle twaalf
  regels blijven bestaan.
- Jank max 11ms op beide breedtes (grens 50ms), p95 5,6ms.
- De film is een pure functie van de scrollpositie: dezelfde progress geeft
  twee keer dezelfde staat.
- Zonder javascript: nul onzichtbare blokken, alle vier de dienstenpanelen
  open, alle zes FAQ-antwoorden zichtbaar. De film valt dan terug op een gewoon
  blok: een hero en een dinsdag verdeeld over drie mensen.
- Nul horizontale overflow op 320, 360, 390, 414 en 768.
- De copy-gate van de skill komt schoon door: de pagina beschrijft nergens zijn
  eigen mechaniek.

Eén meetfout onderweg is het vermelden waard, want hij kost anders een dag: de
determinisme-toets viel om op `getBoundingClientRect`. Die is viewport-relatief,
en de browser herstelt bij een tweede bezoek aan dezelfde URL de scrollpositie.
De film was altijd deterministisch; de meetlat niet. Nu meet hij de transform,
en dat is precies wat de tijdlijn schrijft.

**Na de eerste ronde nog twee dingen gerepareerd, allebei door de founder
gezien en allebei echt.**

*De fotoband in de hero stond scheef op de telefoon.* Niet door de uitsnede maar
door de uitlijning: `align-items: center` uit de desktop-grid werkte door op de
flex eronder, waardoor de band tot zijn eigen breedte kromp en zwevend midden
onder de tekst hing, uitgelijnd op niets. Nu deelt hij zijn linker- en
rechterrand met de kop en de knop.

*De film sloeg soms de animatie over bij heen en weer vegen.* Dat is
gereproduceerd en de oorzaak is aan te wijzen: met `start: 'top top'` en
`end: 'bottom bottom'` mat ScrollTrigger na een venstermaatwijziging de trigger
zonder de scrollpositie mee te rekenen. Start sprong van 55 naar -1971, waarna
de afbeelding van scroll naar film niet meer klopte en de tijdlijn op 0,61 bleef
staan terwijl de pagina bovenaan stond. Start en eind zijn nu functies op
`offsetTop`, met `invalidateOnRefresh`. Er is een harnas bij gekomen dat dit
vasthoudt: `tests/film-scrub.mjs` veegt grillig heen en weer, doet echte
touch-gebaren, laat de vensterhoogte wisselen, en toetst na elke rustpauze of de
tijdlijn nog op de plek staat die bij de scrollpositie hoort.

Onderweg bleek ook het devcontract zelf te liegen: `?p=1` scrolde een heel
venster te ver, waardoor het toneel al was weggeschoven en de landing buiten
beeld stond terwijl de film klopte. Dat is nu dezelfde formule als de
scrolltrigger. Een verificatieharnas dat op de verkeerde plek landt, is erger
dan geen harnas.

Live: <https://a-sisters.belvanger.nl> (noindex). Openstaand blijft ongewijzigd,
zie `sites/a-sisters/deploy/DEPLOY.md`.

---

## 2026-08-20 — The A-Sisters: homepage herbouwd en live op een voorbeeldadres

Live: <https://a-sisters.belvanger.nl> (noindex, A-record `a-sisters` op
belvanger.nl, container op poort 8094, chat-assistent same-origin). Zie
`sites/a-sisters/deploy/DEPLOY.md`.

**Wat er weg is.** De founder zei dat de penstreken niet werkten en dat het
onduidelijk was wat ze waren. Dat klopte, en de reden is te benoemen: de streek
zweefde los onderin het scherm zonder iets aan te raken, hij was het enige
verzadigde ding op een pagina van linnen en bruin, zijn betekenis (drie handen)
zat in de film en niet in het beeld, en de A viel in de ontknoping over het
woord "dag." heen. Weg is dus: de scroll-film, `lijn.js`, de debris, het
cursorspoor, GSAP, ScrollTrigger en Lenis. Alles staat in
`sites/a-sisters/archief/film-2026-08/`, niet verwijderd.

**Wat ervoor in de plaats staat.** Eerst zijn er drie complete stijlrichtingen
gebouwd en gescreenshot (`design/richtingen/`), elk met dezelfde inhoud en
dezelfde kop zodat alleen de vormgeving verschilt. Gekozen en gebouwd is
richting 1, Atelier: warm papier, Instrument Serif als displayletter, haarlijnen
in plaats van kaarten, geen ronde hoeken, geen schaduwen, en één donker
hoofdstuk voor de tarieven. Persoonlijkheidsdrager is nu de fotografie plus de
stem van de letter, niet een getekend teken. Het beeldmerk is dezelfde gedachte
in een betere uitvoering: nog steeds drie halen en één letter, maar gezet in
plaats van getekend, met een strak kader en op de basislijn van het woordmerk
(`tools/merk.mjs`, 17 kB werd 400 byte).

**De pagina is opgebouwd als waarom, hoe, wat.** Eerst de overtuiging (de kop
en de drie beloften), dan hoe er gewerkt wordt (wie welk werk doet, drie
stappen), en pas daarna wat er te koop is (diensten, tarieven, bewijs, vragen,
contact). Dat is de volgorde van de pagina en van de secties in de CSS.

**Vier vakgenoten hebben het beoordeeld en elkaar tegengesproken.** Marketing,
verkoop, grafisch ontwerp en gebruik plus toegankelijkheid, eerst apart en
daarna in een tweede ronde op elkaars punten. Wat daaruit is gebouwd:

- De pagina werkte niet zonder javascript: 22 blokken stonden op opacity 0, dus
  wie geen JS had zag leeg papier. Nu verbergt alleen de `js`-klasse, en er
  wordt gemeten (`tests/nojs-check.mjs`: 0 onzichtbare blokken, alle vier de
  dienstenpanelen open, alle zes FAQ-antwoorden zichtbaar).
- Het eerste bedrag stond op de telefoon op scherm 9,0 van 15 zonder enige
  route ernaartoe. Nu staat het op scherm 1,2, is de feitenstrook een link naar
  de tarieven, en staat er onderaan een vaste balk met bellen en kennismaken.
- Het labelkleur haalde 3,45:1 en droeg elk label op de pagina. De hele
  contrastladder is verzet (`--nevel` 4,59:1, `--grafiet` 6,38:1), de
  invoervelden hebben een eigen lijnkleur die 3:1 haalt, en de tikdoelen zijn
  44px.
- Er stonden twee bodymaten naast elkaar zonder regel, waarvan de kleinste
  13,5px was voor een doelgroep van veertigplussers. Nu: de maat volgt de
  leeslengte, en op de telefoon is er één leesmaat.
- Het formulier meldde onvoorwaardelijk "uw mailprogramma is geopend", ook als
  er niets openging. Nu is het een instructie met een kopieerknop en het
  telefoonnummer ernaast.

**Wat er niet is gebouwd en waarom.** Een echt formulier-endpoint. Dat is de
grootste conversiewinst die er ligt en het is een halve avond werk, maar het
verwerkt naam, e-mail en vrije tekst: menselijke validatiezone. Staat als eerste
punt in `deploy/DEPLOY.md` onder Openstaand, samen met het eigen e-mailadres,
de toestemming voor de drie klantcitaten en de btw-status van de pakketprijzen.
Dat laatste is bewust niet ingevuld in plaats van gegokt.

**De teksten van Fleur en Melanie zijn plaatstekst.** Op verzoek van de founder
ingevuld met iets passends, expliciet gemarkeerd in `content/VERHAAL.md` §3, en
zo geschreven dat er geen controleerbare bewering in staat.

**Dit blijft productie, geen verkoop.** SELLING.md staat nog steeds op nul
gesprekken. De kortste verkoopactie is nog altijd Wendy dit adres laten zien en
vragen wanneer zij twintig minuten heeft.

---

## 2026-08-19 — The A-Sisters: merk gebouwd, film moet nog volgen

Wendy krijgt gezelschap. Zij, Fleur en Melanie (zussen; Melanie is de vriendin
van de founder) beginnen samen **The A-Sisters**, digitale assistenten. De A
staat voor Assistants. Alles in `sites/a-sisters/`, een fork van
`sites/virtualcreator/`. Virtual Creator blijft staan: dat is Wendy's eigen
ZZP-site en het voorbeeld dat aan haar getoond is.

Founder-beslissingen: nieuwe site naast VC, gelijkwaardig trio met Wendy als
gezicht, palet volledig uit hun eigen foto's, de A staat voor Assistants.

**Af:** het palet (gemeten uit vijf bronfoto's, 20 contrasteisen groen), de
tokens omgezet en 13 hardgecodeerde kleuren opgeruimd, het beeldmerk (een A uit
drie penstreken, getekend met dezelfde pen als de film), en het verhaal in
`content/VERHAAL.md`.

**De film is nu een trio.** Hij draaide om één penstreek, en die streek was
Wendy; bij een gelijkwaardig trio klopte dat niet meer. Nu werkt er per
hoofdstuk precies één hand en komen de andere twee er onderweg bij (Mailbox
hand 0, Agenda hand 0 met de komst van hand 1, Klantcontact hand 1 met de komst
van hand 2, Facturatie hand 2). De ontknoping schrijft het logo: de drie handen
schrijven na elkaar ieder één streek van de A.

Er maakt altijd precies één hand een groot gebaar. Drie tegelijk bewegende
streken zijn ruis, en die vecht met het onderwerp van de film. Wat de film
daardoor vertelt is niet "wij zijn met z'n drieën" maar "het werk wordt
overgedragen en er valt niets", en dat is precies wat ze verkopen.

**De site is nu The A-Sisters.** Teksten in de wij-vorm, Over ons met het
oprichtingsverhaal en drie gelijke kaarten, de klantcitaten expliciet aan Wendy
toegeschreven ("Klant van Wendy", met een regel eronder), hun eigen fotoshoot
erop, het beeldteken plus de naam als tekst in de balk en de voet, een nieuw
favicon, en een eigen chatbot-klantmap.

De juridische teksten zijn NIET herdoopt: dat is een echte overeenkomst met
Wendy's KvK, en er een andere partij boven zetten zou een rechtspersoon
verzinnen die niet bestaat. Beide subpagina's en de voet leggen uit dat de
overeenkomst tot nader order via Virtual Creator loopt.

**Wat nog moet:** de deploy naar een voorbeeldadres, en wat alleen van de zussen
zelf kan komen (zie `sites/a-sisters/content/VERHAAL.md` §6).

Twee dingen die hier zijn geleerd en herbruikbaar zijn:

- **Fotopixels zijn geen merkkleuren.** Belichting en witbalans verschuiven ze,
  en chroma leest sterker naarmate het vlak groter wordt: wat als klein monster
  warm hout is, is als kaartvulling abrikoos. Neem de tinthoek over, kies de
  lichtheid zelf, en toets elk paar. Werkwijze en gereedschap in
  `sites/a-sisters/tools/`.
- **Toen ik geen beelden meer kon bekijken, werd de test het oog.** Halverwege
  de filmverbouwing weigerde de API verdere afbeeldingen. In plaats van op goed
  vertrouwen door te bouwen is `tests/handen-check.mjs` geschreven, die de
  MEETKUNDE van de letter narekent uit de echt getekende paden: raken de benen
  elkaar, staan ze even hoog, hangt de balk in het midden, klopt de verhouding.
  Dat vangt meer dan kijken zou hebben gevangen, want drie streken die uit
  elkaar vallen zien er op een los frame uit als "drie streken".
- **Een standaardpad naar een ander project is een stille valstrik.**
  `verhaal-check.mjs` had als standaardbron `sites/virtualcreator/...`. Vanaf de
  repo-wortel bestaat dat pad ook in de KOPIE, dus de a-sisters-test stond
  groen over de film van Virtual Creator. Standaarden wijzen nu naast het
  script; een argument overrulet de standaard, nooit andersom. Hetzelfde
  gerepareerd in `tools/beeld.mjs` en in het bronproject.
- **Een hardgecodeerde kleur buiten de tokens is een tijdbom.** De canvaskleuren
  van de film stonden als vaste bytes in `film.js`. Na het omzetten van het
  palet stond de hele pagina in het nieuwe merk en de film nog in het oude, en
  geen enkele test zag dat: het contrast klopte namelijk allebei.

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
