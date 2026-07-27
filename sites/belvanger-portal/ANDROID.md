# Belvanger als Android-app in de Play Store

> **Status: geparkeerd (besluit founder, 2026-07-25).** Het dashboard wordt geleverd als
> **geïnstalleerde PWA op het beginscherm**, niet als app in de Play Store. De PWA geeft
> de vakman 100% van de functionele waarde (icoon, volledig scherm, offline, meldingen)
> en dekt gratis ook iPhone-gebruikers; de store voegt alleen vindbaarheid toe tegen
> permanente onbetaalde onderhoudslast.
>
> Alles in dit document blijft geldig en compleet als een klant er ooit wél om vraagt.
> Het `android/`-project en `.github/workflows/belvanger-android.yml` staan er nog en
> kosten niets: die workflow start alleen handmatig, dus er gaat nooit per ongeluk iets
> naar Google. Wat je dan nog moet doen begint bij **stap 1**.
>
> **Belangrijk verschil dat een bookmark niet oplost:** iOS Safari geeft Web Push
> uitsluitend aan PWA's die op het beginscherm zijn geïnstalleerd. Op Android werkt push
> ook in een gewone tab, en is installeren winst op weergave en vindbaarheid. Leid
> klanten dus door "App installeren", niet door "bookmark maken".
>
> Wat je zonder de store nodig hebt is alleen **stap 2** (publiek HTTPS + VAPID-sleutels)
> en **stap 6** (testen op een echt toestel). De `TWA_*`-variabelen en de
> assetlinks-route mag je leeg laten; die geven dan netjes een 404.

Dit is de route van "het dashboard is een website" naar "de vakman heeft een icoon op
zijn beginscherm en krijgt binnen seconden een melding". Alles wat in code kon, is al
gebouwd en lokaal geverifieerd. Wat hieronder als **[jij]** staat, kan alleen de
founder doen: het raakt geld, DNS, sleutels of publicatie naar buiten.

## De gekozen route, en waarom

**Progressive Web App, daarna verpakt als Trusted Web Activity.** Het bestaande
dashboard is de app: er wordt geen frontend geport, geen tweede codebase onderhouden,
en geen framework toegevoegd.

Waarom niet een van de andere routes:

| Route | Waarom niet |
|---|---|
| WebView-wrapper (of een no-code "web naar app"-dienst) | Precies wat Google Play onder beleid 4.3 ("minimum functionality") afkeurt, en de geautomatiseerde handhaving daarop is in 2026 strenger geworden. Je kunt ook niet hotfixen wat je niet bezit. |
| Capacitor / React Native / Flutter | Alle drie vragen een build-stap, een dependencyboom en een tweede frontend om te onderhouden. Deze codebase heeft bewust geen bundler; dat is een feature, niet een gebrek. |
| Native Kotlin | Maandenwerk, en dan onderhoud je twee producten. |
| Firestore als mobiele databron | Tweede bron van waarheid. Botst frontaal met het uitgangspunt "one source of truth" en met de bestaande Postgres. |

Wat een TWA je geeft en een WebView niet: hij draait de **volledige Chrome-engine**,
dus service worker, Web Push en offline werken gewoon; hij heeft **geen adresbalk**
zolang Digital Asset Links klopt; en hij is aantoonbaar geen hergebruikte browserpagina.

**Het belangrijkste gevolg voor de onderhoudslast:** app-versie 1.0 blijft 1.0. Elke
wijziging aan het dashboard (tekst, tabblad, cijfer, kleur) gaat via de server mee,
zonder nieuwe upload en zonder reviewqueue. Je raakt het Android-project alleen aan
als Google de verplichte `targetSdk` optrekt, en dat is ongeveer één keer per jaar.

## Wat er al klaar is

| Onderdeel | Bestand | Status |
|---|---|---|
| Manifest | `public/manifest.webmanifest` | klaar |
| Service worker (offline, push, notificatie-tik) | `public/sw.js` | klaar |
| Meldingen-UI en subscription-beheer | `public/push.js`, kaart in `public/index.html`, opmaak in `public/style.css` | klaar, visueel geverifieerd op 390px en 1440px |
| Iconen, PWA en Android, uit één bron | `scripts/make-icons.mjs` | klaar, gegenereerd |
| Web Push-crypto zonder dependency | `src/webpush.js` | klaar, getest tegen RFC 8291 Appendix A |
| VAPID-routes en verzendhook op `call.missed` | `src/server.js` | klaar |
| `push_devices`-tabel | `src/schema.sql` | klaar, draait mee bij boot |
| assetlinks.json | `src/server.js` (`/.well-known/assetlinks.json`) | klaar, wacht op fingerprint |
| Android TWA-project | `android/` | klaar |
| Cloud-build naar `.aab` | `.github/workflows/belvanger-android.yml` | klaar, nog nooit gedraaid |

Nog **niet** gebouwd, bewust: de sms-terugval als een pushmelding niet aankomt. Dat
kost Twilio-geld per bericht en is dus een beslissing over klantkosten. De onderbouwing
en het ontwerp staan in
`docs/research/belvanger-android-app-adhd-onderzoek-2026-07-25.md`.

## De route naar Play

### Stap 1. Start de wandklok, vanavond nog **[jij]**

Deze stap kost geen bouwuren maar wel 1 tot 4 weken kalendertijd, dus hij moet als
eerste lopen, parallel aan al het andere.

1. Trek het KvK-uittreksel van de entiteit die het account gaat bezitten. Neem de
   **statutaire naam, het vestigingsadres en het KvK-nummer letterlijk** over.
2. Vraag een gratis **D-U-N-S-nummer** aan bij Altares (Dun & Bradstreet Benelux) met
   exact die strings. Geen afkortingen, geen handelsnaam.
3. Maak het Play Console-account **nog niet** aan. Dat vóór het D-U-N-S doen is precies
   wat de meerweekse correctielus veroorzaakt.

Waarom een **organisatie**-account en geen persoonlijk account: persoonlijke accounts
van na 13 november 2023 moeten eerst een closed test met **12 testers, 14 dagen
aaneengesloten** doorlopen voordat ze naar productie mogen. Organisatie-accounts op een
geregistreerde rechtspersoon zijn daar **volledig van vrijgesteld**. Dat is het verschil
tussen "twaalf mensen zoeken en overhalen" en "uploaden". Het houdt ook je privéadres
uit de publieke store-listing.

Dit is de balk waar alles op rust: als de verificatie faalt op een naam- of
adresmismatch, valt het account terug op de persoonlijke route en komt de
12-testersregel alsnog in beeld.

### Stap 2. Zet het dashboard publiek op HTTPS **[jij]**

Een TWA kan alleen bestaan als het domein publiek en op een geldig certificaat staat.
Nu luistert de staging op `127.0.0.1:8096`.

De Traefik-labels in `docker-compose.yml` staan al goed op
`Host(dashboard.belvanger.nl)` met Let's Encrypt. Wat nog moet:

1. DNS: een A-record `dashboard.belvanger.nl` naar `31.97.123.34`.
2. `.env` op de VPS aanvullen met de blokken uit `.env.example`
   (`VAPID_*`, `PUBLIC_BASE_URL`, `TWA_*`). Sleutels genereren met
   `node scripts/generate-vapid-keys.mjs`, en **alleen** in die `.env` zetten.
3. `docker compose up -d --build`.
4. Controleren, niet aannemen:
   ```bash
   curl -sI https://dashboard.belvanger.nl/manifest.webmanifest | grep -i content-type
   # moet application/manifest+json geven, niet application/octet-stream
   curl -s https://dashboard.belvanger.nl/.well-known/assetlinks.json
   # geeft nu nog 404: de fingerprint komt in stap 4
   ```

Let op: `COOKIE_SECURE: "true"` staat al in de compose-file. Zonder HTTPS werkt inloggen
dan niet, dus stap 2 is echt één geheel.

### Stap 3. Maak de signing key **[jij]**

Dit is de enige fout in de hele lijst die **onherstelbaar** is. Een kwijtgeraakte
upload key is met Play App Signing nog te resetten via Google; een kwijtgeraakte
keystore zonder Play App Signing betekent dat je nooit meer een update kunt publiceren.
Zet Play App Signing dus aan (standaard voor nieuwe apps) en bewaar de upload key in je
wachtwoordmanager, niet alleen op de laptop.

```bash
keytool -genkeypair -v \
  -keystore belvanger-upload.jks \
  -alias belvanger-upload \
  -keyalg RSA -keysize 4096 -validity 10000
```

Zet daarna in GitHub, onder Settings > Secrets and variables > Actions:

| Secret | Waarde |
|---|---|
| `BELVANGER_KEYSTORE_BASE64` | `base64 -w0 belvanger-upload.jks` |
| `BELVANGER_KEYSTORE_PASSWORD` | het store-wachtwoord |
| `BELVANGER_KEY_ALIAS` | `belvanger-upload` |
| `BELVANGER_KEY_PASSWORD` | het key-wachtwoord |

### Stap 4. Koppel het domein aan de app

Haal de SHA-256-fingerprint op. De CI-workflow print hem aan het eind van een
release-build, of lokaal:

```bash
keytool -list -v -keystore belvanger-upload.jks -alias belvanger-upload | grep SHA256
```

Zet die in `.env` op de VPS als `TWA_SHA256_FINGERPRINTS` en herstart de container.
Controleer daarna dat het bestand er echt staat:

```bash
curl -s https://dashboard.belvanger.nl/.well-known/assetlinks.json
```

**Na stap 7 moet je hier terugkomen.** Play App Signing ondertekent de app met een
*andere* sleutel dan je upload key. Die tweede fingerprint staat in de Play Console
onder Release > Setup > App integrity, en moet er komma-gescheiden bij. Vergeet je dat,
dan opent de app met een adresbalk en lijkt hij precies op de webview-wrapper die
beleid 4.3 afkeurt.

### Stap 5. Bouw de app

Zonder Android Studio, zonder Mac, zonder lokale SDK. In GitHub: Actions >
"Belvanger Android (TWA)" > Run workflow.

- `version_name` is wat de klant ziet, bijvoorbeeld `1.0.0`.
- `version_code` moet bij **elke** upload hoger zijn dan de vorige. Begin op `1`.
- `build_type`: `debug` geeft een `.apk` die je zelf op een telefoon kunt zetten,
  `release` geeft de ondertekende `.aab` voor Play.

Begin met `debug` en installeer die op je eigen telefoon. De app opent dan nog **met**
adresbalk, want de debug-build heeft een andere fingerprint dan die in assetlinks staat.
Dat is verwacht en geen fout.

### Stap 6. Test wat je niet kunt beredeneren

Op een echte telefoon, niet in een emulator, want het gaat juist om wat het toestel
zelf doet:

1. Log in, tik "Zet meldingen aan", accepteer het systeemvenster.
2. Tik "Stuur testmelding". Komt hij binnen tien seconden niet aan, dan blokkeert het
   batterijbeheer van dat toestel meldingen. Dat is geen bug maar de belangrijkste
   bevinding die je kunt doen, en de reden dat je dit bij elke klant tijdens de
   onboarding samen doet.
3. Zet het toestel een uur weg met het scherm uit en stuur dan opnieuw een test. Dit is
   de test die op Xiaomi, Oppo en Samsung faalt waar de eerste test slaagde.
4. Zet `PUSH_INCLUDE_CALLER=true` en controleer of de "Bel terug"-knop de telefoonapp
   met het juiste nummer opent.
5. Zet vliegtuigmodus aan en open de app: je hoort `offline.html` te zien, niet de dino.

### Stap 7. Play Console **[jij]**

1. Maak de app aan onder pakketnaam `nl.belvanger.dashboard`.
2. Upload de `.aab` eerst op de **internal testing**-track. Die kent geen
   beleidsreview, dus je leert de hele upload-, ondertekenings- en Data
   Safety-machinerie zonder risico.
3. Vul Data Safety eerlijk in. Wat deze app verzamelt: e-mailadres en naam (account),
   telefoonnummers en namen van de leads van de klant (app-functionaliteit), en een
   apparaat-identificator in de vorm van het push-endpoint. Niets daarvan wordt gedeeld
   met derden en niets wordt gebruikt voor advertenties of tracking.
4. Play eist een **account-verwijderroute**, ook buiten de app om. Dat is nu nog een
   openstaand punt: er is geen zelfservice-verwijdering in het dashboard. Voor de
   internal track is dat geen blokkade, voor productie wel.
5. Ga terug naar **stap 4** met de Play App Signing-fingerprint.
6. Installeer via de internal-track-link en controleer nu dat de app **zonder**
   adresbalk opent. Dat is het bewijs dat Digital Asset Links klopt.

### Stap 8. Pas naar productie als het betaald wordt **[jij]**

Store-onderhoud is permanent, onzichtbaar en niet achteraf te factureren: verplichte
`targetSdk`-verhogingen, jaarlijkse beleidswijzigingen, Data Safety opnieuw verklaren.
Dat is exact het soort onbetaalde overhead dat de bedoeling van dit hele project
ondermijnt.

Zet het daarom als eigen regel op de aanbieding voordat de eerste productie-upload
gebeurt, bijvoorbeeld een eenmalig bedrag voor publicatie en inrichting plus een klein
maandbedrag voor app-onderhoud en store-compliance. Koopt niemand die regel, dan is de
totale investering 25 dollar en een avond formulieren, en blijft de PWA op het
beginscherm gewoon werken. Die geeft de vakman namelijk al 100 procent van de waarde:
icoon, volledig scherm, offline en meldingen. De Play Store voegt daar alleen
vindbaarheid en een gevoel van legitimiteit aan toe.

## Terugvalplan als het misgaat

Play is een externe partij met een reviewqueue die je niet bestuurt. Voor een
done-for-you dienst met een founder met een baan ernaast moet dat vooraf geregeld zijn,
niet tijdens het incident:

- **Afkeuring of vertraagde review:** het dashboard blijft op
  `https://dashboard.belvanger.nl` werken en de PWA blijft installeerbaar. Er gaat geen
  enkele klantfunctie stuk.
- **Slechte release blijft dagen op toestellen staan:** dat kan hier bijna niet, want de
  app bevat geen bedrijfslogica. Alles wat fout kan zijn, zit op de server en is met
  één deploy te herstellen.
- **Meldingen vallen stil:** `push_devices.failure_count` en `last_success_at` maken dat
  zichtbaar. De e-mailmelding bij een gemiste oproep blijft als vangnet staan.
- **Account geschorst:** een ondertekende APK naast de Play-versie bewaren, zodat een
  klant hem desnoods handmatig kan installeren.

## Onderhoudsafspraken

Zet deze twee in de agenda, want ze komen niet vanzelf langs:

- **Jaarlijks, augustus:** controleer de nieuwe verplichte `targetSdk` van Play en werk
  `compileSdk`/`targetSdk` in `android/app/build.gradle` bij. Dit is de enige
  terugkerende reden om het Android-project aan te raken.
- **Bij elke sleutelrotatie:** VAPID-sleutels roteren maakt **elke** bestaande
  push-subscription ongeldig. Iedere klant moet dan opnieuw "Zet meldingen aan" tikken.
  Doe dit alleen als het echt moet, en licht klanten vooraf in.

## Na de deploy: log het

De Activiteitenlog is een databasetabel op de VPS en niet vanaf hier te vullen. Zet er
na de deploy deze regel in, via het Activiteitenlog-tabblad in het dashboard:

> Klantdashboard is nu ook een installeerbare app: PWA met pushmeldingen bij een
> gemiste oproep, plus een Android-project (Trusted Web Activity) en een cloud-build
> voor de Play Store. Het dashboard zelf is niet geport, de app draait de bestaande
> site, dus wijzigingen gaan zonder store-review mee.

## Gotchas

Alles hieronder is al een keer misgegaan of bijna misgegaan tijdens het bouwen. Voeg
hier bij elke correctie een regel toe.

- **`serveStatic` had een MIME-whitelist zonder `.webmanifest`, `.json` en `.png`.**
  Die gingen dus als `application/octet-stream` de deur uit, en omdat de server
  `X-Content-Type-Options: nosniff` zet, weigerde Chrome zowel het manifest als de
  iconen. Gevolg: de PWA is stil niet installeerbaar, zonder enige foutmelding. Dit was
  daadwerkelijk het geval en is gemeten met `curl -w '%{content_type}'` op de oude
  preview-server. Dezelfde map staat nu ook in `tests/preview-server.mjs`; loopt die uit
  de pas, dan verifieer je in de preview iets anders dan wat live gebeurt.
- **Cache Storage is per origin, niet per gebruiker.** Een gecachete `/api/summary` kan
  op een gedeelde telefoon de cijfers van klant A aan klant B tonen. `sw.js` doet daarom
  een harde early return op alles onder `/api/`, en de app gooit bij uitloggen alle
  caches weg via een `postMessage`.
- **Push-subscriptions overleven het uitloggen.** Zonder ingrijpen blijven lead-
  meldingen aankomen op een toestel dat geen geldige sessie meer heeft. `logout()`
  verwijdert daarom eerst de `push_devices`-rijen van die gebruiker en dan de sessie.
- **De sessie duurt 12 uur.** Een "app" die een laagdigitale vakman ongeveer dagelijks
  om een wachtwoord vraagt, wordt niet gebruikt. Dit is nog niet opgelost. De sessie
  simpelweg verlengen is géén oplossing: dat vergroot juist het risico hierboven. De
  goede richting is een toestelgebonden koppeling tijdens de onboarding, waarbij het
  toestel opsombaar en intrekbaar blijft.
- **ES256 in de VAPID-JWT wil een raw `r||s`-signature van 64 bytes.** Node levert
  standaard DER. Zonder `dsaEncoding: "ieee-p1363"` krijg je een 401 van de push-dienst
  zonder verdere uitleg.
- **In een `notificationclick` mag je NIETS awaiten voordat je een venster opent.** Het
  gebruikersgebaar van de tik vervalt bij de eerste `await`, waarna Chrome weigert met
  `InvalidAccessError: Not allowed to open a window` en er zichtbaar niets gebeurt.
  `clients.openWindow(...)` hoort dus de eerste regel van de handler te zijn; al het
  andere (logging, `matchAll`, terugvalroutes) komt erna. Dit heeft zes testrondes gekost
  omdat de fout stil is: de server meldt netjes dat de push is aangenomen.
- **Diagnostiek kan de storing veroorzaken die ze meet.** De `await diag(...)` die was
  toegevoegd om dit probleem te meten, was zelf de `await` die het gebruikersgebaar
  opsoupeerde. Meet in een notificationclick dus zonder te awaiten, of meet erna.
- **`clients.openWindow()` neemt geen `tel:`-schema aan.** Chrome behandelt het als gewone
  pagina en opent een browsertab MET `tel:+31...` in de adresbalk in plaats van de
  telefoonapp. De telefoonapp start je vanuit de pagina met `location.href`. Android vraagt
  daarbij eenmalig om bevestiging ("naar je telefoonapp?"), en dat is normaal
  browsergedrag, geen fout.
- **Verberg een terugvalknop nooit op `visibilitychange`.** Dat event vuurt ook bij het
  dichtklappen van het meldingenpaneel, waardoor de belknop kon verdwijnen voordat hij
  ooit gezien was.
- **Een vastgelopen service worker is serverside onzichtbaar.** Daarom staat de
  SW-versie nu uitgelezen in de meldingenkaart, met een knop "Meldingen opnieuw
  instellen" die registratie, subscription en caches hard weggooit. Zonder die uitlezing
  is niet vast te stellen of een deploy het toestel van een klant heeft bereikt.
- **`clients.openWindow()` met een `tel:`-URL is niet betrouwbaar** over Android-versies
  en Chrome-varianten heen. De "Bel terug"-knop opent daarom `/?call=<nummer>` op de
  eigen site, waarna `push.js` de telefoonapp start.
- **Het merk uit `favicon.svg` staat niet gecentreerd in zijn 64x64-box.** Bij het
  vierkante icoon is dat precies goed, maar een adaptive icon wordt rond het midden
  geknipt, dus daar staat het scheef. `make-icons.mjs` compenseert met een `offset` op
  de bounding box van het merk. Gecontroleerd met een safe-zone-overlay.
- **Melding-iconen op Android worden getint.** Een gekleurd icoon wordt een witte blob.
  `ic_notification.xml` is daarom een wit silhouet zonder achtergrond.
- **Play App Signing gebruikt een andere sleutel dan je upload key.** Beide
  fingerprints moeten in `assetlinks.json`. Alleen de upload key erin zetten is de
  klassieke reden dat een TWA een adresbalk houdt.

## Installeren zonder de Play Store

Sinds de store geparkeerd is, is de installeerkaart in het dashboard de enige weg naar
het icoon op het beginscherm. Die zit in `public/push.js` en de kaart staat in
`public/index.html` onder de meldingenkaart.

Hoe het werkt: Chrome vuurt `beforeinstallprompt` zodra de PWA installeerbaar is
(manifest + actieve service worker + HTTPS). Wij onderdrukken Chrome's eigen
installatiebalkje en bewaren het event, zodat één tik op onze knop de échte
systeemprompt opent. De kaart verdwijnt bij `appinstalled` en verschijnt nooit als de
app al in standalone draait.

Twee dingen om te weten:

- **Het event komt maar één keer per paginalading.** Weigert de klant, dan is de knop
  daarna dood. Daarom verdwijnt de knop bij weigeren en verschijnt in plaats daarvan de
  handmatige route (Chrome-menu, drie puntjes, "App installeren"). Een knop laten staan
  die niets meer doet is erger dan geen knop.
- **De listener moet vroeg hangen.** Hij staat bovenaan `push.js` en niet ergens in een
  callback: te laat aanhangen en het event is al voorbij.

**iOS is bewust niet meegenomen** (founder-besluit 2026-07-25). Safari heeft geen enkele
API om installatie aan te bieden; daar is het het Deel-menu, drie stappen diep. Op iOS
blijft de kaart dus verborgen. Het gevolg is niet cosmetisch: **iOS geeft Web Push
uitsluitend aan PWA's die op het beginscherm staan**, dus een iPhone-vakman krijgt geen
enkele melding tot dit wordt opgepakt. Op Android werkt push ook in een gewone tab, dus
daar is installeren winst op weergave en vindbaarheid, geen voorwaarde.
