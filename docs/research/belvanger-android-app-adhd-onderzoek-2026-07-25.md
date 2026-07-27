# Belvanger klantdashboard naar een Android-app: onderzoek en keuze

**Datum:** 2026-07-25
**Vraag:** hoe zetten we het Belvanger klantdashboard in zijn volledigheid om van
webversie naar een echte Android-app die mensen via de Play Store kunnen downloaden?
**Methode:** ADHD-mode (`.claude/skills/adhd`), 6 geïsoleerde parallelle
ideatiebranches, daarna scoren, clusteren, valkuilen markeren en de top 3 uitdiepen.
**Uitkomst:** gebouwd. Route en stappen staan in `sites/belvanger-portal/ANDROID.md`.

## Het reframe dat het onderzoek opleverde

Dit is geen portingprobleem. Het zijn drie problemen die in de vraag door elkaar lopen,
en ze hebben elk een ander antwoord:

1. **Distributie** — een icoon en een vindbare listing.
2. **Levering** — de telefoon moet binnen seconden trillen.
3. **Onderhoudslast** — wie betaalt de verplichte `targetSdk`-tredmolen.

Wie alleen naar (1) kijkt, bouwt een app die niets toevoegt aan de website. Wie (3)
negeert, bouwt onbetaalde overhead in voor een founder die al 32 tot 40 uur per week
elders werkt.

## Geverifieerde feiten

Niet uit het hoofd, opgezocht omdat de aanbeveling er materieel van afhangt:

- **De 12-testersregel geldt niet voor organisaties.** Persoonlijke Play-accounts van na
  13 november 2023 moeten eerst een closed test doen met minimaal 12 testers, 14
  aaneengesloten dagen, voordat ze naar productie mogen (was 20, sinds december 2024
  12). Accounts die op een geregistreerde rechtspersoon staan zijn hiervan **volledig
  vrijgesteld**. Productie-toegang daarna kost doorgaans maximaal 7 dagen review.
- **Beleid 4.3 ("minimum functionality") keurt WebView-wrappers af, TWA niet.** Een app
  die niets meer doet dan een publieke website laden wordt afgewezen. Een Trusted Web
  Activity op een échte PWA is de compliant route, met Digital Asset Links en een
  redelijke Lighthouse-score. De geautomatiseerde handhaving hierop is in 2026 scherper
  geworden.
- **Web Push werkt binnen een TWA.** Een TWA draait de volledige Chrome-engine, niet een
  WebView, dus service workers, offline caching en push werken er gewoon.

Bronnen: [Play Console Help over testeisen voor nieuwe persoonlijke
accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en),
[MobiLoud over PWA's publiceren in
2026](https://www.mobiloud.com/blog/publishing-pwa-app-store), [Median over
webview-apps en Play-goedkeuring](https://median.co/blog/will-google-play-approve-my-webview-app),
[Android Developers, Trusted Web Activities
quickstart](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2).

## De brede set

39 ideeën uit 6 frames (regulator, inversie, aanname-slopen, speedrunner, geen budget /
één uur, 3 uur 's nachts oproepdienst), geclusterd op onderliggende invalshoek.
Scores zijn `[N novelty V viability F fit]`, elk 0-10.

### Cluster A: krimp de app tot de store niet meer kan weigeren

Acht ideeën, uit alle zes de onafhankelijke frames. Dat is het sterkste signaal van de
hele run: als zes branches die elkaars output niet zien op hetzelfde uitkomen, is dat
convergentie en geen toeval.

- `[N7 V9 F9]` app = alleen push-ontvanger + pairing, de browser houdt de pixels
- `[N8 V9 F9]` stub-app rendert de leadkaart uit de push-payload zelf, dus zonder fetch en zonder login
- `[N7 V8 F7]` geen dashboard, het lead-detail zit ín de notificatie
- `[N7 V9 F9]` één bevroren native shell, de UI komt over de lijn
- `[N8 V8 F8]` doet alleen wat web niet kan: rinkelen als een telefoon, de lead voorlezen
- `[N6 V9 F9]` lead-inbox en niets anders, al het overige blijft web
- `[N7 V6 F7]` twee losse listings: klant-app en admin-app als aparte codebases
- `[N6 V9 F9]` dashboard blijft een bookmark achter één knop

### Cluster B: de app is het product niet, de trilling is het product

- `[N7 V9 F6]` nooit een app bouwen, sms/WhatsApp heeft 100% installed base
- `[N10 V6 F6]` de contactenlijst ís de UI: n8n schrijft elke lead als contact in zijn telefoonboek
- `[N9 V6 F5]` geen scherm: de lead belt hem op en leest zichzelf voor, "druk 1 om terug te bellen"
- `[N8 V8 F5]` Telegram-bot met inline "Bel terug"-knop, €0
- `[N7 V6 F6]` WhatsApp als kanaal, app alleen als instellingenschil

### Cluster C: maak de store een wandklokprobleem, geen engineeringprobleem

- `[N8 V9 F8]` koop het account en publiceer op dag één iets hols, zodat de timers parallel lopen aan het bouwen
- `[N8 V9 F9]` demobuild met fictieve data absorbeert reviews en fouten zonder klantrisico, en is tegelijk de salesdemo
- `[N6 V8 F8]` publiceer als organisatie op KvK, testerscohort = echte klanten
- `[N8 V8 F7]` store-uitval-runbook met webfallback en gesigneerde sideload-APK
- `[N8 V9 F8]` internal/closed track als permanente privédistributie

### Cluster D: auth door koppelen, niet door inloggen

- `[N7 V9 F10]` eenmalige QR of deeplink tijdens de done-for-you-onboarding, één extra kolom op `sessions`
- `[N6 V9 F9]` magic install link met een opaak toestel-token als Bearer
- `[N5 V8 F9]` toestelregister: elke ingelogde installatie opsombaar, intrekbaar, auditeerbaar

### Cluster E: een slechte release moet een non-event zijn

- `[N9 V8 F10]` twee parallelle pushpaden met een ACK-grootboek per lead
- `[N8 V9 F8]` server-side kill switch: forceer elke clientversie naar read-only browsermodus
- `[N7 V9 F9]` project één keer genereren, daarna CI en nooit meer Android Studio
- `[N4 V9 F8]` `/api/v1/` bevroren, buildnummer in elke request
- `[N3 V10 F7]` Play App Signing met de upload key in een offsite vault

### Cluster F: prijs de store als product, of koop hem

- `[N8 V9 F8]` niet de store in vóór een klant een expliciete app-regel heeft betaald
- `[N7 V6 F7]` `.aab` kopen bij een freelancer tegen een bevroren API-contract
- `[N9 V4 F6]` per-klant white-label via managed Google Play
- `[N8 V5 F4]` compliance-manifest als buildartefact bij elke release

## Wat gekozen is

**PWA-first, dan TWA.** Enige route die de letterlijke vraag haalt ("in zijn
volledigheid") zonder één regel frontend te porten, langs beleid 4.3 komt, zonder Mac of
Android Studio werkt, en waarbij app-versie 1.0 voor altijd 1.0 blijft omdat elke
UI-wijziging serverside meegaat. **Stance: Configure/Integrate.**

De inzichten uit cluster A zijn er bovenop gelegd in plaats van als alternatief: de app
bevat geen bedrijfslogica, dus er is niets in de `.aab` dat fout kan zijn.

Verder overgenomen:
- Uit cluster E: `push_devices.failure_count` en `last_success_at` als storingssignaal,
  en de bestaande e-mailmelding blijft als vangnet staan.
- Uit cluster C: het organisatie-account en de D-U-N-S-aanvraag als eerste stap, omdat
  het wandkloktijd is en geen founder-uren.
- Uit cluster F: de app-regel op de aanbieding vóór de eerste productie-upload.

## De valkuilen, en waarom

Aantrekkelijk maar niet doen:

| Idee | Waarom een valkuil |
|---|---|
| Firestore als mobiele databron | Tweede bron van waarheid, botst frontaal met "one source of truth" en met de bestaande Postgres |
| Per-klant white-label via managed Google Play | Vereist Google Workspace of een EMM bij de klant, en N× onderhoud voor N klanten |
| Server-driven UI met eigen widget-vocabulaire | Elegant, maar dan onderhoud je een UI-framework in plaats van een dashboard |
| No-code wrapper of een gekochte `.aab` | Exact wat de scherpere 4.3-handhaving target, en je kunt niet hotfixen wat je niet bezit |
| Contactenlijst als UI | Schrijft lead-PII in het Google-account van de klant: nieuwe verwerker, geen retentiecontrole, geen statusmodel |
| Telegram als kanaal | Verkeerd land. Nederlandse vakmensen zitten op WhatsApp |
| WhatsApp als primair kanaal | Template-approval, kosten per bericht, Meta als verwerker. Prima als terugval, niet als hoofdweg |
| Compliance-manifest bij elke build | Gold-plating vóór er omzet is |

## De uitgestelde tak: het ACK-grootboek

Hoogste gewogen score van de hele run (`[N9 V8 F10]`), en toch bewust niet gebouwd.

**Wat het is.** Push heeft géén afleverbewijs in het protocol: de push-dienst bevestigt
alleen dat hij het bericht heeft aangenomen. OEM-batterijbeheer op goedkope
Android-toestellen sloopt bezorging stil, en dat is precies de populatie waar dit product
voor bestaat. Het ontwerp: Postgres is de timer, niet Node en niet n8n. Een
`escalate_after`-timestamp in een rij overleeft een containerherstart; een
`setInterval`-sweep met `FOR UPDATE SKIP LOCKED` haalt op. De ACK komt uit de service
worker met een per-alert HMAC-token in de payload, dus zonder sessie en zonder login.
Twee tabellen: `lead_alerts` en `lead_alert_attempts`. `events` blijft ongemoeid, want
alarmering is muteerbare toestand en hoort niet in een append-only eventstroom.

**Waarom niet gebouwd.** Elke sms-terugval kost Twilio-geld per bericht. Dat is een
beslissing over klantkosten en dus founder-terrein, niet iets dat er 's nachts stil in
hoort te glijden.

**De scherpste bevinding erbij**, die het ontwerp verandert: de ACK loopt over exact
hetzelfde OEM-geknepen achtergrondpad als de push die hij moet bewijzen. Je meet dus niet
"push afgeleverd" maar "push plus retour binnen T", en die twee lopen juist uiteen op
goedkope Android. Serverside is "nooit afgeleverd" niet te onderscheiden van "afgeleverd
maar de ACK werd geknepen". Gevolg: systematische neiging tot over-escaleren, dus de
vakman krijgt push én sms op precies de toestellen die de functie het hardst nodig
hebben. De conclusie is niet "maak de ambiguïteit kleiner" maar **"maak dubbel
alarmeren zichtbaar onschadelijk"**. En 90 seconden is in beide richtingen fout:
bezorging is na ongeveer 30 seconden beslist, menselijke aandacht pas na een paar
minuten.

**Wat het zou ontsluiten**, mocht het er komen:
- Een dode-integratie-kanarie: een klant met nul alerts in 48 werkuren tegen zijn eigen
  4-weeks baseline heeft een kapotte Twilio-webhook of een dode n8n-workflow, geen
  rustige week. Dat is wat je contract kost, en nu is het niet te onderscheiden.
- Een verkoopbare bereikbaarheidsgarantie: met een audittrail per lead kun je een hard
  getal in het contract zetten en een uitkering ook echt beoordelen. Maximale exposure
  is één maand abonnement, kosten van voorkomen is een sms van een paar cent. Dat
  verkoopt de garantie in plaats van de software, wat beter past bij een founder die
  zichzelf zwak vindt in verkopen.
- Claim-routing voor tweemansploegen: eerste ACK claimt de lead, de andere toestellen
  krijgen "Jan pakt deze op". Lost een echt probleem op zonder nieuwe tabellen.

## Wat nu gebouwd en geverifieerd is

Zie `sites/belvanger-portal/ANDROID.md` voor de volledige tabel, de stappen naar Play en
de gotchas. Kort:

- PWA-laag op het bestaande dashboard: manifest, service worker, offline-pagina, iconen.
- Web Push zonder npm-dependency, getest tegen het testvector uit RFC 8291 Appendix A.
- Meldingen-UI met testknop, visueel geverifieerd op 390px en 1440px.
- `push_devices`-tabel, VAPID-routes, verzendhook op `call.missed` en `website.lead`.
- `/.well-known/assetlinks.json` uit env, wacht alleen nog op de fingerprint.
- Android TWA-project plus een cloud-build die een ondertekende `.aab` oplevert.

Eén bevinding uit het bouwen die het vermelden waard is omdat hij stil was: de
MIME-whitelist van `serveStatic` kende `.webmanifest` en `.png` niet, dus die gingen als
`application/octet-stream` de deur uit. Met `X-Content-Type-Options: nosniff` erbij
weigert Chrome dan zowel het manifest als de iconen, en is de PWA dus niet
installeerbaar, zonder enige foutmelding. Gemeten met `curl -w '%{content_type}'` op de
nog draaiende oude preview-server, dus dit was daadwerkelijk het geval en niet
theoretisch.

## De provocatie om nog in te duwen

**Dezelfde manifest en service worker geven iPhone-vakmensen gratis mee.** iOS Safari
16.4 en hoger geeft Web Push uitsluitend aan PWA's die op het beginscherm zijn
geïnstalleerd. Het werk dat er nu ligt dekt daarmee beide platforms, zonder Apple
Developer-account, zonder de jaarlijkse €99 en zonder Mac. De Play Store is dan alleen
nog vindbaarheid en een gevoel van legitimiteit, en de PWA op het beginscherm geeft de
vakman nu al 100 procent van de functionele waarde. Dat is het waard om te testen vóór
er een euro naar een store gaat: als niemand naar een app vraagt zodra hij het icoon op
zijn beginscherm heeft, is de hele storeroute gefalsifieerd voor de prijs van nul.
