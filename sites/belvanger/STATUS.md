# Belvanger: status & TODO

PrimeCircle's eigen trades-demo/verkoopsite. Live (noindex), gehost op de VPS in
`/opt/belvanger` achter Traefik. **Deze map is sinds 2026-07-17 de bron-van-waarheid**
— deploy alleen hiervandaan (`bash deploy-to-vps.sh`).

## Homepage in industrieel brutalisme (2026-08-21), LIVE sinds 2026-08-22

De founder vond de site naar AI-slop neigen. Bij nakijken lag dat niet aan het palet
(werkblauw + hi-vis + eigen fonts was al eigen werk) maar aan de **grammatica**:
gecentreerde eyebrow-plus-titel, elf secties met exact hetzelfde ritme, en vier
identieke afgeronde kaarten met zachte schaduw. Richting gekozen uit Collect UI,
categorie `brutal-design`.

**Ongewijzigd, expliciet op verzoek:** alle merkkleuren en de logo-SVG. Ook de
WCAG-regel voor de oranje knop (donkere merkinkt erop, 5,18:1, hover moet LICHTER)
is een-op-een overgenomen.

**Nieuw:** `site/css/brutal.css`, op die dag **alleen geladen door `index.html`**, zodat
een proefstuk op de homepage de rest niet kon slopen. *(Achterhaald: sinds 2026-08-22
draaien er zes pagina's op; zie de tabel in de volgende sectie.)* Radii op 0, blur-schaduwen weg (er is er nog één: hard, zonder blur), 2px randen
doen het werk, rasters delen hun randen zodat kaarten cellen worden. Fraunces eruit,
**Anton** erin (18 kB latin-subset, self-hosted, geen externe call). Secties genummerd
via `data-nr` op de `.section-head`.

**Zeven dingen die pas op screenshots zichtbaar werden, niet in de code:**
`.slot__inner` had `margin-inline: 0` terwijl dat element zélf de `.wrap` is, waardoor
de hele slotsectie tegen de linkerschermrand schoof · de handmatige `<br>`'s in de koppen
waren op Fraunces afgestemd en lieten in Anton telkens één woord alleen achter
(`text-wrap: balance`) · het oranje blok achter "klant" stak 40px boven en onder de
letters uit omdat een top/bottom-inset de inline-box volgt en die bij Anton veel hoger is
dan de kapitalen · het accent van de É in "EÉN" reikte 16,6px boven de tekstbox
(regelhoogte .92 < fontgrootte) terwijl er 17,6px ruimte was, dus het raakte het oranje
label · "GEBOUWD" werd middenin afgekapt door een `max-width` in `ch` · op 390px viel
"ZIE HET VOOR JOUW BEDRIJF" over vier regels · de chatbubbel was na de restyle het enige
ronde ding op de pagina.

**Valkuil in het verificatieharnas zelf, hoort in `web-verify/verify.mjs`:** de site zet
`scroll-behavior: smooth`, dus `scrollIntoView` is een **animatie**. Over een lange pagina
duurt die langer dan de wachttijd en fotografeer je een sectie die je niet vroeg. Met
`behavior: "instant"` klopte het. Zet daarnaast de cookie-toestemming vooraf in
`localStorage` (`bv_cookie_consent`), anders dekt de melding de onderste 110px van elke
opname af.

**Geverifieerd** op localhost, 24 opnames op 1440px en 390px: geen horizontale overflow op
geen enkele opname, geen consolefouten behalve de 404 op `/api/config` (wordt door
`app/server.js` geserveerd, draaide lokaal niet, staat op zes pagina's, geen regressie).
`tests/taalpariteit.mjs` blijft groen; de structuur is niet veranderd.

**Uitgerold en live gezet op 2026-08-22, zie de volgende sectie.**

## Uitrol van de brutalistische stijl (2026-08-22), LIVE en geverifieerd

### Wat er nu op welke stylesheet draait

| Stylesheet | Pagina's |
| --- | --- |
| `css/brutal.css` | `index.html`, `en/index.html`, `aanbod.html`, `klantintake.html`, `404.html`, `en/404.html` |
| `css/juridisch.css` (nieuw) | `privacy.html`, `voorwaarden.html`, `en/privacy.html`, `en/terms.html` |
| `css/styles.css` (ongewijzigd) | de vier `film-*.html` |
| eigen inline stijl (ongewijzigd) | de acht `voorbeelden/*-premium.html`, `dashboard-demo/` |

### Twee dingen die met opzet NIET zijn omgezet

**De filmpagina's.** Die worden opgenomen. Een nieuwe stijl laat toekomstige opnames
afwijken van het materiaal dat er al ligt.

**De acht voorbeeldsites.** Elk vak heeft daar een eigen ontwerp. Ze allemaal in dezelfde
stijl zetten sloopt precies de belofte die de sectie erboven doet: *"een website per vak,
niet een sjabloon."*

### Waarom juridisch.css apart staat en niet gewoon brutal.css is

`brutal.css` zet `ul { list-style: none }` en een `body`-padding voor de mobiele belbalk.
Allebei fout in een juridische tekst met opsommingen en zonder belbalk. De vier pagina's
hadden elk hun eigen `<style>`-blok met net andere waarden; dat is nu één bestand.

### Drie fouten die er al zaten, gevonden tijdens het omzetten

- De gekozen keuze-pil op `klantintake.html` had wit op `#FF5C1A`: **3,09:1**, onder de
  AA-grens. Nu donkere merkinkt, 5,18:1, dezelfde regel als de primaire knop.
- `.offer-hero__badge` op `aanbod.html` was `#FF9152` op een doorschijnend oranje vlak op
  marine. Dun en slecht leesbaar. Nu massief.
- `user-select: none` zonder `-webkit-`-prefix, terwijl dit publiek op iPhones zit.

### De oranje markering: derde poging, en nu gemeten in plaats van geschat

Canvas `measureText` op Anton bij 112px: kapitaal-inkt **96px** boven de basislijn
(`.857em`, ik gokte `.73em`), inkt onder de basislijn **0**, font-descent **37px**
(`.3304em`). Daaruit volgt de CSS rechtstreeks: `bottom: .295em; height: .93em`. De twee
eerdere gokken zaten er 40px en 26px naast.

**Les:** bij een typografie-artefact eerst `measureText`, niet drie keer de CSS aanpassen
en opnieuw kijken.

### Valkuil bij elke pagina die je nog omzet

Anton heeft **één gewicht en geen breedte-as**. Elke `font-weight: 800/900` of
`font-stretch` op `var(--display)` die nog uit het Fraunces-tijdperk stamt, laat de browser
**nep-vet synthetiseren** en dat smeert een smalle letter dicht. Weggehaald op
`aanbod.html` en beide 404-pagina's; controleer het als je `film-*.html` ooit omzet.

Twee rasterfouten die alleen op een screenshot zichtbaar waren: zowel `.offer-why` als de
formulierkolom op `klantintake.html` stond gecentreerd op een smallere `.wrap` (780 resp.
760px), terwijl de kop erboven op de paginagoot van 100px begint. De leesbreedte hoort op
de **inhoud**, niet op de `.wrap`.

**Geverifieerd** per pagina op 1440px en 390px: geen horizontale overflow, geen
consolefouten behalve de bekende `/api/config`. `tests/taalpariteit.mjs` en
`tests/filmpaginas.mjs` allebei groen.

### Live sinds 2026-08-22

Gedeployed met `bash deploy-to-vps.sh` (backup vooraf op de VPS, `docker compose up -d
--build`). Cachebusters staan nu op de **inhoudshash** in plaats van een handmatig nummer:
`brutal.css?v=6f5ae7f5`, `juridisch.css?v=4f1b5e1e`. Zo hoef je er bij een volgende wijziging
niet meer aan te denken; herbereken 'm met `md5sum` en vervang overal.

**Geverifieerd op de echte site, niet op localhost:** alle tien de pagina's geven 200,
`css/brutal.css` (63,5 kB), `css/juridisch.css` (4,5 kB) en `fonts/anton.woff2` (18,6 kB)
worden geserveerd met het juiste content-type, en `/api/config` geeft 200 (op localhost was
dat de enige 404, die is dus inderdaad geen regressie). Screenshots van `/`, `/en/`,
`/aanbod.html`, `/klantintake.html`, `/privacy.html` en `/en/terms.html` op 1440px en 390px:
**geen horizontale overflow, geen consolefouten.**

De deploycheck gaf bij poging 1 nog een 404 en bij poging 2 een 200. Dat is het bekende
gedrag: Traefik geeft 404 zolang de container herstart en er geen backend is. Daarvoor zit
de herhaallus in het script.

**Blijft staan:** de site staat nog op `noindex`. Dat gaat er pas af als de echte KvK- en
telefoongegevens erin staan (zie de TODO-lijst verderop).

### Regelhoogte van de kop-font: `--lh-kop` (2026-08-22, LIVE)

De founder meldde dat de hero te dicht op elkaar plakte. Exact te onderbouwen: de
witruimte tussen twee regels **hoofdletters** is `line-height` min de **kapitaalhoogte**,
niet line-height min 1. Anton's kapitalen zijn gemeten `.857em`. De hero stond op `.86`,
dus `.003em` wit: een derde pixel. De regels raakten elkaar letterlijk. Sectiekoppen
(`.92`) hadden 3,9px, de slotkop (`.9`) 2,7px. Die waarden kwamen uit het
Fraunces-tijdperk, waar de kapitaalhoogte lager ligt en `.86` wél werkte.

Nu **één token** in plaats van tien losse getallen:

```css
--lh-kop: .99;   /* .99 − .857 = .133em wit */
```

Gebruik dit voor elke kop die over **meer dan één regel** kan lopen. Losse getallen (prijs,
percentages, "404") mogen strak blijven: die hebben geen buurregel om tegenaan te botsen.

**Val hier niet in:** `juridisch.css` gebruikte het token eerst zonder het te definiëren, en
die vier pagina's laden `brutal.css` níet. Een ongedefinieerde custom property maakt de hele
declaratie ongeldig, waarna `line-height` terugvalt op `normal` (bij Anton ruim 1,5). Het
token staat nu in **beide** bestanden; houd ze gelijk.

**Herzien op 2026-08-22 na een tweede meting, zie hieronder. De waarde is nu 1.12.**

### `--lh-kop` moest naar 1.12: een É is geen kapitaal (2026-08-22, LIVE)

`.99` klaarde de kapitaalhoogte maar niet het **accent**. Gemeten met canvas
`measureText` op Anton, inkt boven de basislijn in em:

| glyph | inkt boven basislijn |
| --- | --- |
| gewone kapitalen (`KLANT`) | 0.86 |
| `É` en `Í` | **1.11** |
| `Ë` | 1.06 |
| staart van `j` / `g` | 0.12 *onder* de basislijn |

Bij `.99` werd de witruimte onder een regel die met É begint dus **negatief** en dook
het accent de regel erboven in. Zichtbaar op de inlogpagina van het portaal:
"OP ÉÉN PLEK" onder "…NODIG HEEFT,".

`1.12` klaart de hoogste letter die het Nederlands hier gebruikt. Voor een kop zonder
accenten is dat iets ruimer dan strikt nodig, en dat is de goede kant om op te falen:
te veel lucht leest als een keuze, een accent dat door de regel erboven snijdt leest als
een fout. En **"één" staat overal in deze teksten**, dus krapper is geen optimalisatie
maar een tijdbom.

## Chatbot en dashboard in dezelfde stijl (2026-08-22), LIVE

### Chatbot: een `skin.css` per klant, niet het gedeelde product

`product/chatbot/public/widget.css` wordt gedeeld door **zes** klanten. Daar de
rondingen weghalen zou a-sisters, ab-uitvaartzorg, demo-bakkerij, virtualcreator en het
`_template` meesleuren. Het product heeft daar zijn eigen uitweg voor, en die was al in
gebruik door twee klanten: leg een `skin.css` in de klantmap, dan zet de server hem op
`/api/widget-skin.css` en laadt de widget hem zelf.

Nieuw: `product/chatbot/customers/belvanger/skin.css`. Vierkant, 2px randen, harde
schaduw, Anton in de kop, oranje knoppen met donkere merkinkt (5,18:1).
`config.json` wees bij `fontDisplay` nog naar Fraunces; dat is nu Anton.

De `!important`-noodgreep die hiervoor even in `brutal.css` en `juridisch.css` stond is
**verwijderd**. Die hoorde daar niet: hij werkte alleen op pagina's die dat stylesheet
laden, en de skin werkt overal.

### Dashboard: een laag achter `style.css`, geen herschrijving

`sites/belvanger-portal/public/style.css` is dichtbeschreven en stuurt veel toestanden
aan. In plaats van 216 regels herschrijven staat er nu een **brutalisme-laag** onderaan
die de tokens overschrijft (`--radius: 0`, harde schaduw, merkkleuren exact gelijk aan de
site) en daarna alleen de plekken waar een ronding of randdikte hardcoded stond. Wat daar
niet genoemd wordt is bewust ongemoeid.

Het portaal zat qua kleur net naast de site (`#0e1a24` vs `#16232E`, `#ff5a1f` vs
`#FF5C1A`): net genoeg om als twee producten te lezen. Nu gelijk.

`build-dashboard-demo.mjs` bouwt `/dashboard-demo` uit diezelfde bron, dus de demo
volgt automatisch.

### Twee echte fouten die hierbij boven kwamen

**1. De demo-fonts waren al maanden kapot.** `copyPatched` in
`build-dashboard-demo.mjs` las élk bestand als `utf8` en schreef het zo terug, ook de
`.woff2`-fonts. Een binair bestand door een utf8-ronde halen vervangt elke ongeldige
bytereeks door U+FFFD: `anton.woff2` ging van 18.612 naar 33.820 bytes, `archivo` van
90.104 naar 163.873. De woff2-kop bleef leesbaar (ASCII), dus **geen 404 en geen
consolefout** — de browser liet het font gewoon vallen en viel terug op een
systeemletter. Daarom is het nooit opgevallen. Gevonden doordat de live bestandsgrootte
niet klopte met de bron. Nu `fs.copyFileSync` als er geen patch is.

**2. Het buildscript had een hardgecodeerde fontlijst.** Drie bestanden bij naam, dus
`anton.woff2` werd stilzwijgend niet meegekopieerd. Precies de fout waar dat script
verderop zelf een poort tegen heeft voor asset-paden. Kopieert nu de hele `fonts/`-map.

### Opgeruimd

Fraunces is uit het portaal verdwenen: de twee `@font-face`-regels zijn weg en
`--display` wijst naar Anton. De canvas-labels in `app.js` stonden op
`700 12px "Fraunces"`; dat is nu Archivo, want Anton heeft één gewicht en zou op 12px
nep-vet worden en dichtsmeren. **De twee `fraunces*.woff2`-bestanden staan er nog** (82
kB, nergens meer naar verwezen); die mogen weg, ik mocht ze niet zelf verwijderen.

### Nep-vet: de fout die twee keer door de controle glipte (2026-08-22, LIVE)

Anton heeft **één gewicht** (400). Vraagt een regel om 600/800/900, dan tekent de browser
zelf een vette variant door de letter uit te smeren. Dat ziet er niet uit als een fout maar
als een lelijk font, en daarom is het twee keer blijven staan.

De tweede keer was in het dashboard. De brutalisme-laag had een **lijstje** van koppen die
Archivo kregen, terwijl Anton de default bleef uit het originele
`h2,h3{font-family:var(--display);font-weight:600}`. Alles wat niet in dat lijstje stond
kreeg dus Anton met gewicht 600. Zichtbaar op de Zichtbaarheid-pagina, waar de paneelkoppen
("Bezoekersverkeer", "Scrolldiepte", …) door `app.js` worden gemaakt en dus **per definitie
nooit in zo'n lijstje konden staan**.

Twee dingen veranderd, allebei nodig:

1. **De default is omgekeerd.** `h2, h3` staat nu op Archivo 800 uppercase; Anton moet je
   expliciet aanvragen. Wie een kop toevoegt krijgt iets leesbaars in plaats van iets kapots.
   `h4` blijft met rust: dat zijn de titels in het activiteitenlog en die zijn te lang voor
   hoofdletters.
2. **Een vangnet in alle drie de stylesheets:** `* { font-synthesis-weight: none; }`. De
   browser tekent dan het echte gewicht in plaats van een uitgesmeerde variant. Archivo is
   variabel (100–900) en verliest er niets bij. Bewust alleen `-weight`: `font-synthesis:
   none` zou ook de schuine variant van `<em>` uitzetten en die staat in de lopende tekst.

Er stonden nog twee plekken op gewicht 600 met Anton die niemand ooit ziet tenzij hij er
komt: `.reset-card h1` (wachtwoord-resetpagina) en `.push-card__text strong`. Gevonden door
álle `var(--display)`-regels na te lopen op hun `font-weight`. Doe dat opnieuw als je een
kop toevoegt:

```bash
grep -oE '[^{}]+\{[^}]*var\(--display\)[^}]*\}' style.css
```

**Geverifieerd** door alle negen dashboardweergaven langs te klikken en per kop het
*berekende* font en gewicht uit te lezen, niet door ernaar te kijken. Live en lokaal
identiek: paginatitels Anton 400, alle paneelkoppen Archivo 800, nergens nog Anton met een
gevraagd gewicht boven 400.

### Wat NIET is omgezet, en waarom

De vier `film-*.html` (opnamepodia) en de acht `voorbeelden/*-premium.html` (elk vak een
eigen ontwerp). Ook `product/chatbot/public/dashboard.html`: dat is de statistiekpagina
van het gedeelde chatbot-product, niet van Belvanger.

## Aanvraagformulier op alle zeven voorbeeldpagina's (2026-07-28)
De pagina's beloofden "automatische leadvangst" en lieten alleen een telefoonnummer zien.
Een bezoeker die niet wilde bellen kon dus niets. Nu staat er onderaan de contactsectie een
aanvraagformulier (naam, telefoon, waar gaat het om), in de eigen vakkleur van elk vak.

**Geen `<form>` en geen JavaScript.** De zeven pagina's draaien bewust op nul JS, en een
fictief voorbeeldbedrijf hoort niets te versturen. Losse velden met een
`button type="button"` zien er identiek uit en houden die regel intact. Eronder staat:
"Voorbeeldformulier, dit verstuurt niets. Op uw eigen website komt elke aanvraag direct
binnen in uw dashboard, met een melding op uw telefoon."

**LIVE sinds 2026-07-29** en geverifieerd op de echte site (niet op localhost): alle zeven
paginas hebben het formulier met drie velden, geen horizontale overflow op 432px en 1440px,
geen consolefouten, knopkleur per vak correct (petrol, oranje, goud, indigo, groen, rood,
violet).

**Bug gevonden bij het deployen:** `assemble.mjs` zette het chatwidget in
`film-showcase-kaarten.html` en `film-melding.html`, omdat alleen de twee oudere
filmpaginas in `AB_SITE_EXCLUDE_FILES` stonden. Een chatbubbel in de hoek belandt
regelrecht in de volgende filmopname. Lijst aangevuld met alle vier de filmpaginas en het
widget er weer uitgehaald. **Wie een nieuwe film-*.html maakt, zet hem meteen in die lijst.**

## Opvolglijst heropende niet bij een terugkerende klant (2026-07-29), GEFIXT en LIVE
Gevonden doordat de founder de hele keten testte: mail kwam aan, tijdlijn klopte,
pushmelding kwam binnen, maar "Nu aandacht nodig" bleef op nul staan.

Oorzaak in `upsertContact` in het portaal: bij een bestaand contact stond er
`status = CASE WHEN status = 'closed' THEN 'follow_up' ELSE status END`. Alleen een
AFGESLOTEN contact ging dus terug de opvolglijst in. Zijn eigen contact stond op
`contacted`, en dan blijft het daar staan.

Dat is precies de faalmodus die dit product hoort te voorkomen: **een klant die je al
eens gesproken hebt en die opnieuw aanklopt, verdwijnt uit beeld.** Juist die is warm.

Gerepareerd met een expliciete set `HEROPENT_OPVOLGING` (`call.missed`, `website.lead`,
`sms.inbound`, `email.inbound`, `chat.lead`): komt zo'n gebeurtenis binnen en staat het
contact niet al op `new` of `follow_up`, dan gaat hij naar `follow_up`. Ons eigen
verkeer (`sms.outbound`, `sms.status`) en handmatige dashboardacties doen dat niet, net
zoals bij `INBOUND_PUSH_KINDS`.

Geverifieerd voor de deploy met een read-only SELECT op de echte database: het contact
op `contacted` wordt `follow_up` bij een websiteaanvraag en blijft `contacted` bij een
uitgaande sms. Daarna gedeployed en gecontroleerd dat de nieuwe code in de draaiende
container zit.

**Let op:** bestaande contacten veranderen niet met terugwerkende kracht. Het contact
gaat pas naar de opvolglijst zodra er een NIEUWE gebeurtenis binnenkomt.

Bij het deployen bleek er geen deployscript voor het portaal te bestaan; dat werd
handmatig gedaan. `sites/belvanger-portal/deploy-to-vps.sh` staat er nu, naar het model
van dat van de site: back-up op de server vooraf, en achteraf echt controleren of
`/healthz` antwoordt in plaats van "klaar" printen.

## Websiteaanvraag naar dashboard + pushmelding (2026-07-29), LIVE
Getest door de founder: het formulier op belvanger.nl mailt hem netjes en stuurt de
aanvrager een bevestiging, maar er kwam niets in zijn dashboard en geen melding op zijn
telefoon. Terwijl de site en de film dat wel beloven.

De portaalkant was al compleet: `POST /api/ingest` met `eventType: "website.lead"` schrijft
het event, mailt de gebruikers van de tenant en stuurt een webpush. Alleen riep niemand hem
aan; de chatbot-server mailde en schreef een regel in `leads.jsonl`, meer niet.

Brug gebouwd in `product/chatbot/server.js` (functie `meldAanDashboard`), dus elke klant
krijgt hem:

- Na de mail gaat dezelfde aanvraag als `website.lead` naar het portaal, met de
  kanaalsleutel in de `x-ingest-key`-header.
- **Best-effort met een eigen try/catch en 8 seconden timeout.** De mail is dan al weg, dus
  de lead is binnen; een storing aan de portaalkant mag de bezoeker nooit een foutmelding
  geven. Mislukken wordt wel gelogd, anders valt deze koppeling stil zonder dat het opvalt.
- Dedupe-sleutel per minuut: een dubbelklik op verstuur levert een lead op in plaats van twee.
- **Env-gated** via `PORTAL_INGEST_URL` en `PORTAL_INGEST_KEY` (zie `.env.example`). Staan ze
  er niet, dan verandert er niets voor die klant.
- Getest tegen een nagebouwd ingest-eindpunt: het portaal ontvangt precies het verwachte
  event met de juiste bron, type, contactgegevens en preview.

**Welke sleutel:** er hoefde er geen aangemaakt te worden. Het portaal heeft een globale
`INGEST_KEY`, en voor een andere bron dan Twilio valt `resolveIngestTarget` terug op de
tenant uit `BOOTSTRAP_TENANT_SLUG` (op de VPS: `belvanger`). Die sleutel staat nu in
`sites/belvanger/.env` als `PORTAL_INGEST_KEY`. `docker-compose.yml` laadt het hele
`.env` via `env_file`, dus er hoefde daar niets bij.

**Live sinds 2026-07-29 en geverifieerd:** de container heeft beide variabelen, en een
aanroep vanuit de site-container naar het portaal met een opzettelijk foute sleutel geeft
netjes `401 Ongeldige ingest-sleutel`. DNS, TLS, route en eindpunt kloppen dus. Er is
bewust GEEN testevent in het echte dashboard geschreven; die laatste bevestiging is een
echte formulierinzending door de founder.

**Voor een echte klant straks niet deze globale sleutel gebruiken** maar de kanaalsleutel
uit het scherm "Nieuwe klant aanmaken". Bekend gat: die wordt maar een keer getoond en er
is geen scherm om hem opnieuw te bekijken of te vervangen. Dat moet er zijn voordat klant
nummer een live gaat.

De voorbeeldpagina's blijven bewust een dood formulier: dat zijn fictieve bedrijven, daar
hoort niets vandaan te komen. Op een echte klantsite is het hetzelfde formulier met de
sleutel van die klant.

## Vakfilm "Mooi" (2026-08-21), af
Derde film, en de eerste die zich op EEN vak richt en die gegenereerd beeld gebruikt.
Een verdelger met een wespennest in twee handen schrikt van zijn telefoon, het nest
schiet los, de wespen komen eraf en kruipen over zijn gezicht, hij kan ze niet
wegslaan want zijn handen zitten vol, en dan kijkt hij in de camera en zegt "Mooi".
Daarna de echte simulatie met een spoedklus, en de slotkaart. 25,28s, 9:16, 6,9 MB,
gemeten op -15,9 LUFS / -1,2 dBFS true peak. Act 1 kostte 6.405 credits, inclusief
1.600 aan een take die door een koerswijziging is vervallen.

Draaiboek, beide prompts, de kostenuitsplitsing en de gotchas:
`docs/offers/belvanger-film-verdelger-2026-08-21.md`.

- **De filmpagina's zijn vak-VARIABEL, niet gekopieerd.** `film-opnamepodium.html?vak=verdelger`
  en `film-tekstkaarten.html?set=verdelger` wisselen alleen de woorden die per vak anders
  horen te zijn. **Zonder parameter tonen ze exact wat ze altijd toonden**, want de eerste
  twee films zijn daarop gemonteerd. Dat is vastgelegd in `tests/filmpaginas.mjs`; draai die
  na elke wijziging aan een van beide pagina's.
- **De producttekst wisselt niet mee.** "Sorry, we misten je belletje!" is de echte tekst die
  het product verstuurt en hoort in elke film hetzelfde te zijn. Alleen de klantvraag, het
  antwoord, de meldingsregel en de hint op het belscherm zijn vakspecifiek.
- **Kaart 1 staat niet in deze montage.** Act 1 draagt de grap zelf; twee grappen achter
  elkaar verzwakken elkaar. Terug met `MET_KAART1=ja bash monteer-verdelger.sh`.
- **Meet, neem niet aan.** De opname haalt de 25 fps niet (225 tot 239 van de 258 frames),
  act 1 duurt niet altijd 7 seconden, en loudnorm in één doorgang zat er 1,2 LU naast met
  een true peak van -0,8 dBFS. Alle drie worden nu gemeten: `opname.env`, `ffprobe` en een
  tweetraps loudnorm.
- Er is bewust **geen negende voorbeeldpagina** voor ongediertebestrijding. Die hoort er pas
  als er een verdelger in beeld is die hem moet zien.

## Showcasefilm "Elk vak zijn eigen website" (2026-07-28), af en geverifieerd
Tweede promotiefilm naast `belvanger-opgevangen-1080x1920.mp4`, en met een andere taak:
Opgevangen is de probleemfilm, deze laat zien wat je krijgt. 29,7 seconden, 9:16, 14,9 MB,
nul credits. Elk beeld is een bestuurde opname van de site die nu draait.

Opbouw: hook over de verfscene, "Elk vak zijn eigen website", de zeven vakken, **het
formulier dat wordt ingevuld**, een shot van de rinkelende telefoon, "Alles komt op een
plek binnen", **het dashboard**, **de pushmeldingen op de telefoon**, slotkaart.

- **De sms-conversatie is eruit** (founder-verzoek). Het sterkste verhaal is de eigen
  website met formulier, en dat beide kanalen op een plek binnenkomen. Wat bleef is een
  shot van de rinkelende telefoon, zodat "een oproep die je miste" ergens over gaat.
- **De ingevulde gegevens zijn niet verzonnen**: Sanne Bakker is exact de websiteaanvraag
  die even later in het dashboard staat. Het typen wordt per frame uitgerekend in plaats
  van echt getypt, dus elke opname levert dezelfde film.
- **De pushteksten komen letterlijk uit `belvanger-portal/src/server.js`.** Verandert die
  tekst daar, verander `site/film-melding.html` mee.
- **Versie 1 was onbegrijpelijk en is herbouwd.** Hij opende 2,4s op een muur zonder tekst
  en legde pas op 11,6s uit waar het over ging. Oorzaak: het anti-reclame charter van
  "Opgevangen" is geschreven voor een DM aan een warm contact, waar de afzender zelf de
  introductie is. Zie `docs/LEARNINGS.md` 2026-07-28.
- De zeven vakpagina's hebben dezelfde opbouw en onderin dezelfde balk in hun eigen
  vakkleur. De **belknop is de rode draad** en landt zeven keer op dezelfde hoogte, omdat
  het opnamescript per pagina uitmeet waar `.hero a[href^="tel:"]` staat.
- **De omslag zit op 18,40s**: daar knipt de film weg van de rinkelende telefoon en valt
  het geluid stil. Bewust geen klap op die snede.
- Geluid gesynthetiseerd met de tonen uit `js/app.js`, plus toetsklikjes onder het
  formulier. Geen muziekbed. Gemeten op -16,2 LUFS / -1,4 dBTP.
- **Afwerking uit de scroll-film-studio skill**: vignet over alles, filmkorrel alleen op
  de gefilmde delen (korrel over de hele film maakte het bestand 135 MB), en een lichtveeg
  over de kop van elke tekstkaart. Bewust geen glitch of bloom.
- Twee compressieniveaus (foto CRF 26, tekst CRF 18) zodat het bestand onder de 16 MB van
  WhatsApp blijft zonder dat de kleine letters onscherp worden.
- Nieuw in deze map: `film/neem-showcase-op.mjs`, `film/maak-geluid.mjs`,
  `film/monteer-showcase.sh`, `site/film-showcase-kaarten.html`, `site/film-melding.html`.
- Volledig draaiboek, valkuilen en de begeleidende posttekst:
  `docs/offers/belvanger-showcasefilm-elk-vak-2026-07-28.md`.


## Schilders toegevoegd als zevende vak (2026-07-27), LIVE en geverifieerd
Aanleiding: de eerste échte prospect (Friesland Schilderwerken, via Georgina Tan) is schilder,
en dat vak stond niet tussen de zes op de site. Nu overal doorgevoerd, in beide talen:
vakkenstrip, het merk-ruggetje in de hero (7 segmenten), de vak-optie in het formulier, de
`audience` in de JSON-LD, en een eigen kaart in de voorbeelden-carrousel. Vakkleur violet
`#7E4A9E`, het enige vrije vak naast de zes bestaande kleuren.

**`voorbeelden/schilder-premium.html`** is bewust de meest uitgesproken van de zeven, want bij
een schilder is het werk zelf beweging:

- **De verfscène.** Een hoge sectie met een plakkende stage: je scrollt en de wand wordt
  geverfd. De gekleurde laag groeit in HOOGTE, en de kwastrand, de druppels en de roller zijn
  KINDEREN van die laag. Daardoor blijven ze automatisch op de verfrand zitten: één
  geanimeerde eigenschap, geen rekenwerk om dingen synchroon te houden.
- De roller strijkt ook zijwaarts terwijl hij zakt, want een roller die kaarsrecht naar
  beneden zakt is een lift. Die streek staat in `cqw` (containereenheden), niet in procenten:
  `translateX` in procenten rekent met de eigen breedte van de roller, waardoor hij op een
  telefoon te ver en op een groot scherm te kort zou strijken. Gemeten op 390, 1440 en 2560px:
  blijft overal binnen de wand.
- Plint en lichtschakelaar liggen bóven de verflaag, dus het lijkt of de roller er netjes
  omheen werkt in plaats van eroverheen.
- **Ons werk**: twee getekende panelen (kozijn en voordeur) die van verweerd naar geverfd
  gaan. Niet de hele achtergrond verschiet van kleur, alleen het HOUTWERK, want dat is wat een
  schilder doet. Twee identieke kopieën waarvan alleen `--hout` verschilt; het glas blijft dus
  glas. Plus hetzelfde eerlijke lege vak voor de echte projectfoto's van de klant.
- **Kleuradvies**: de proefwand verschiet echt van kleur tijdens het scrollen (`@property`
  met `syntax:"<color>"`, anders springt een custom property hard van waarde naar waarde).
- Alles in CSS, **nul JavaScript**, net als de andere zes voorbeeldpagina's.
- **De beginstand is de eindstand**: buiten `@media(prefers-reduced-motion:no-preference)` en
  `@supports(animation-timeline:view())` staat de wand al geverfd. Firefox en wie beweging uit
  heeft staan zien dus het afgeleverde werk, geen halve klus. Geverifieerd met
  `prefers-reduced-motion: reduce`: wand 100%, kleurenkaart open, panelen onclipped, tekst zichtbaar.
- Twee CSS-valkuilen kostten elk een ronde; ze staan uitgelegd in de code én in
  `docs/LEARNINGS.md`, want ze zien er in de stylesheet allebei correct uit.

**Foto's toegevoegd (2026-07-27, later die dag).** OpenArt is niet aangesloten op dit project
(`.claude.json` heeft alleen de zeven Hostinger-servers), dus de founder heeft de beelden zelf
in de OmniFrame-workspace gegenereerd. Zes stuks, aangeleverd op 1792x2400 en 1856x2304, door
mij gecropt naar de maten van de andere pagina's en omgezet naar webp:

| Bestand | Formaat | Plek |
|---|---|---|
| `thumb-schilder.webp` | 900x1200 | kaart in de carrousel (vervangt de gerenderde poster) |
| `schilder-hero.webp` | 1080x1350 | hero, rechterhelft |
| `schilder-werk-1-voor/-na.webp` | 760x950 | paneel 1, kozijn |
| `schilder-werk-2-voor/-na.webp` | 760x950 | paneel 2, voordeur |

Foto en tekenwerk zijn nu verdeeld naar waar ze sterker in zijn: **foto** waar het om
geloofwaardigheid gaat (hero, voor/na), **tekenwerk** waar het om beweging gaat (de verfscène,
want een foto kun je niet gaandeweg verven).

- **De voor/na-panelen zijn nu echte foto's** in plaats van getekende objecten, met dezelfde
  wipe. Dat de twee foto's exact samenvallen is **gemeten** met gradiëntcorrelatie (randen
  vergelijken, niet kleuren, want de kleur is juist wat verandert): optimum op dx=0, dy=0,
  schaal 1.00 voor beide paren. Vandaar dat het kozijn en de deurpanelen dwars door de verflijn
  doorlopen zonder sprong. Meet dit opnieuw voordat je ooit beelden vervangt.
- **De hero is nu split-screen**: tekstpaneel links met de verfstreek, foto rechts. De
  kleurenkaart is verhuisd naar de kleuradvies-sectie, want daar gaat het er ook echt over, en
  hij bestaat uit exact dezelfde vijf kleuren die daar als losse staaltjes stonden. Die
  staaltjes zijn dus vervangen, niet aangevuld. De kaart vouwt nu open op scroll in plaats van
  bij het laden: een openvouw-animatie die afloopt voordat je er bent, heb je nooit gezien.
- Mobiel gefixt: "Van Rijn Schilderwerken" is langer dan de namen op de andere pagina's en liep
  over de Offerte-knop. Onder 620px gaat die knop weg (de vaste belbalk heeft dezelfde functie),
  en het brandpunt van de foto ligt lager zodat de schilder onder de header uitkomt.
- **De rolsteiger in de hero is bewust geen ladder.** De founder haalde uit mijn eerste prompt
  dat een ladder niet tegen een kozijn kan; de tweede versie zette de vakman op een rolsteiger
  met leuningen, wielen en afdekzeil. Vakinhoudelijk klopt het beeld daarmee.

**Wat op alle zeven pagina's is gefixt:** de vaste VOORBEELD-badge dekte op een telefoon de
eerste regel van het eerlijkheidslabel af, precies de regel die vertelt dat het een fictief
voorbeeld is. Nu ruimte gemaakt. Gemeten op de echte tekstrechthoeken (Range, niet de
elementdoos): nul regels onder de badge, op alle zeven.

**Fictieve bedrijfsnaam: "Van Rijn Schilderwerken", regio Groningen.** Bewust NIET Friesland
Schilderwerken en bewust niet Leeuwarden, want dat is een echt bedrijf dat je net hebt
aangeschreven; een voorbeeldpagina mag niet op een prospect lijken.

**Live geverifieerd** (2026-07-27): GET en HEAD 200 op de pagina en de thumbnail
(`image/webp`), 7 vakken en 7 kaarten in beide talen, en in een echte browser op desktop én
mobiel de verfscène op vier scrollstanden: verf 0/31/64/100%, roller steeds op de rand,
0px overflow, geen JS-fouten, geen mislukte requests.

## EN-versie gelijkgetrokken met de NL (2026-07-27), LIVE en geverifieerd
De Engelse pagina liep achter op de Nederlandse. Niet alleen in tekst, ook structureel.

- **Kapot, nu gefixt:** `js/app.js` is voor beide talen hetzelfde bestand en doet op 11,2s
  `hide(7); show(8)`. De EN-pagina had `data-step` 8 en 9 nooit gekregen, dus verdween de
  meldingskaart en kwam er niets terug: **de hero-animatie eindigde op een leeg vlak**, precies
  waar het aanbod valt. Geen console-fout, HTTP 200. Stond er van 18 t/m 27 juli.
- **Copy bijgetrokken naar de NL:** hero-alinea (nu website + dashboard + vangnet, niet meer
  "we catch them automatically"), eyebrow (ontgenderd, net als NL), belief-regel
  ("You're on the job, not on the phone"), `aria-label` van de telefoon.
- **Interne inconsistentie in het Engels:** hetzelfde vak had drie namen: "Landscapers" in de
  strip, "Gardeners" bij de voorbeelden, "Landscaper" in het formulier (idem Handymen /
  Handyman firm). Nu overal één term.
- **NL-kant:** de voorbeelden-alinea stond in de u-vorm terwijl de hele site je/jij gebruikt →
  gelijkgetrokken. `og:locale:alternate` (en_GB) toegevoegd.
- **Legal:** EN privacy + terms zeiden "Last updated 18 July", NL 17 juli, bij identieke
  inhoud → op 17 juli gezet. "Chamber of Commerce (KvK)" nu ook in de EN terms.
- **Nieuw: `tests/taalpariteit.mjs`** vergelijkt NL↔EN op `data-step`, aantallen kaarten/
  vragen/velden/opties, prijzen en percentages, hreflang en `robots`. Draai dit na elke wijziging
  aan één van de twee pagina's. Geverifieerd: faalt op de oude bestanden (4 verschillen), slaagt
  op de nieuwe. Wat het NIET dekt: of de woorden hetzelfde bedoelen, dat blijft lezen.
- **Geverifieerd in een echte browser** (Chrome headless, beide talen tot het eind van de
  simulatie): EN eindigt nu net als NL op een zichtbare kaart, geen JS-fouten, geen mislukte
  requests, rekenmachine formatteert per taal (€ 3.900 / €3,900).
Meegenomen in dezelfde ronde, want ze waren allemaal onzichtbaar voor een gewone GET op de
homepage:

- **`404.html` werd nooit geserveerd.** De server gaf bij een onbekend pad kale tekst
  "Not found"; de volledig vormgegeven 404-pagina in `site/` was dode code. `serveStatic` in
  `product/chatbot/server.js` valt nu terug op `en/404.html` voor een pad onder `/en/`, anders
  op `404.html`, met een echte 404-status (geen soft-404). Een missend plaatje of css-bestand
  krijgt nog steeds kale tekst, want daar hoort geen HTML in. Heeft een site geen 404.html,
  dan blijft het gedrag precies zoals het was, dus AB verandert niet.
- **`site/en/404.html` bestond niet**, dus een Engelse bezoeker met een typefout kreeg
  Nederlands. Nu tweetalig, gekozen op het pad.
- Een 404-pagina wordt bij een **willekeurige** URL geserveerd, dus haar eigen verwijzingen
  moeten root-absoluut zijn. `apply.mjs` zette het chat-widget er relatief in, wat vanaf
  `/en/iets/diep/typefout` naar `/en/iets/diep/assets/` had gewezen. Nu `/assets/` voor
  404-pagina's. Live geverifieerd op drie niveaus diep: widget laadt.
- **`HEAD` gaf 405 op elke pagina, ook op `/`.** Elke uptime-monitor en linkchecker die HEAD
  gebruikt zou de site als kapot melden. Nu 200 met `Content-Length` en een leeg body.
  Gemeten dat HEAD géén bezoek meetelt (5x HEAD met browser-user-agent = 0 pageviews,
  1x GET = 1), anders verzint een monitor je bezoekcijfers. Zelfde fout als eerder in het
  portaal; dit was de site-kant.
- **Privacyverklaring beschreef een gegevensstroom die niet meer bestaat.** Er stond dat de
  aanvraag via WhatsApp verstuurd wordt; sinds 19 juli gaat hij via `POST /api/lead` naar de
  eigen server, die hem mailt naar info@belvanger.nl en de aanvrager een bevestiging stuurt.
  Ook ontbraken **naam en e-mailadres** in de opsomming terwijl het formulier die verplicht
  vraagt, en de **AI-chat** stond er helemaal niet in (berichten gaan naar OpenRouter → Google
  Gemini, mogelijk buiten de EER; berichttekst wordt niet bewaard, `LOG_QUESTIONS=false`).
  Beide talen herschreven op basis van wat de code werkelijk doet, met de verwerkers erin
  (Hostinger, OpenRouter, Clarity na toestemming, WhatsApp alleen als de bezoeker die link
  zelf gebruikt). Datum op 27 juli. **Blijft een concept: laat dit nalezen door iemand met
  juridische kennis voordat je gaat factureren.**
- De vier juridische pagina's hadden geen favicon-verwijzing, dus de browser vroeg een
  niet-bestaande `/favicon.ico` (404 in het netwerkpaneel). Toegevoegd.
- `assemble.mjs` zette het chat-widget ook in `film-opnamepodium.html` en
  `film-tekstkaarten.html`, waardoor er een chatbubbel in de volgende filmopname had gestaan.
  `apply.mjs` kent nu `AB_SITE_EXCLUDE_FILES`; die twee pagina's worden overgeslagen.
- De deploy uploadde **67 MB** `film/` (frames, clips, de mp4) die de container niet gebruikt,
  en `cp -a` kopieerde dat daarna in elke `pre-deploy`-backup. Bij 71 backups loopt dat hard
  op. `film/`, `tests/` en het rollbackscript zijn nu uitgesloten: tar van 71 MB naar 3,6 MB.
- Op de EN-pagina staat er nu bij dat de voorbeeldsites en het voorbeelddashboard **in het
  Nederlands** zijn. Die zeven pagina's vertalen is bouwen zonder koper; de verwachting
  managen kost één zin.

**Live geverifieerd na de deploy** (2026-07-27), niet aangenomen:
GET én HEAD op 7 pagina's + 3 foutpaden, taal per pad, geldig certificaat, en in een echte
browser NL+EN op desktop én mobiel helemaal tot het eind van de simulatie: stappen 1 t/m 9,
eindigt op de website-kaart, 0px horizontale overflow, geen JS-fouten, geen mislukte
requests, chat-widget met het juiste `data-lang` op elke pagina inclusief drie niveaus diep
op de Engelse 404.

## Domein-migratie → belvanger.nl (2026-07-18)
- Eigen domein **belvanger.nl** (geregistreerd 2026-07-18 via Hostinger). DNS: A `@` →
  VPS `31.97.123.34` (via Hostinger DNS). **MX/mail-records ongemoeid** (Hostinger-mail),
  dus **info@belvanger.nl** werkt zolang de mailbox in hPanel bestaat (Wesley: bevestigd).
- Traefik-router luistert nu op `belvanger.nl` + `www.belvanger.nl` + (behouden)
  `belvanger.primecircle.cloud`: alle drie → dezelfde container. Let's Encrypt-cert voor
  belvanger.nl komt **automatisch zodra de DNS wereldwijd is gepropageerd** (vers .nl-
  domein = paar uur). Tot dan blijft `belvanger.primecircle.cloud` de werkende URL.
- Alle site-URL's (canonical/OG/JSON-LD/sitemap/robots) → belvanger.nl. E-mail in footer.
- **LIVE + geverifieerd (2026-07-18):** `https://belvanger.nl`, `/en/` en `www` geven
  HTTP 200 met geldig Let's Encrypt-cert. Oud adres `belvanger.primecircle.cloud` werkt nog.

## Engelse versie (2026-07-18)
Volledige EN-site in `site/en/` (`index.html`, `privacy.html`, `terms.html`) — idiomatisch
vertaald, `noindex`, hreflang NL↔EN + x-default, taalwissel (NL|EN) in header + mobiel menu.
`app.js` is **taalbewust** (leest `<html lang>`: sim-labels, formulierfouten, WhatsApp-
bericht, euro-format per taal). CSS/JS gedeeld tussen beide talen. Visueel geverifieerd met
de `web-verify`-skill (desktop + mobiel). NL-legal (`privacy.html`, `voorwaarden.html`)
linken nu ook naar de EN-versies.

## Founding-offer-pagina + eigen subdomein (2026-07-19)
- **`aanbod.html`** toegevoegd: een aparte, aantrekkelijke offer-/verkooppagina in de
  Belvanger-huisstijl (hergebruikt `css/styles.css` + font). Toont het founding-aanbod:
  setup €1.250 doorgestreept → €625 (50%, eerste 10), €99/mnd levenslang vast, de belofte,
  "dit krijg je", ROI-band, CTA's naar `https://belvanger.nl/#gesprek` (absoluut, werkt ook
  vanaf het subdomein). Bron-offerte: `docs/offers/aanbod-belvanger-trades.md`.
- **Live op `bvaanbod.primecircle.cloud`** (los van de hoofdsite). Geserveerd door de
  **belvanger-container** via een 2e Traefik-router; de root wordt via een redirectregex-
  middleware doorgestuurd naar `/aanbod.html`. DNS: A-record `bvaanbod` → 31.97.123.34
  (primecircle.cloud heeft **geen wildcard**, elk subdomein is een eigen A-record).
- Ook direct op `belvanger.nl/aanbod.html`. Geverifieerd: 302→200, geldig cert, css laadt,
  desktop + mobiel gecontroleerd.
- **Nog te doen (founder):** de prijzen (€625/€99) eerst valideren op een echte vakman
  voordat je de link rondstuurt.

## Golden Circle-herstructurering (2026-07-19)
Flow-review via Simon Sinek (Why → How → What):
- **Why toegevoegd**: navy belief-band net onder de hero: "Jij bent vakman, geen telefoniste.
  Je zou nooit een klant mogen verliezen door iets doms als een gemist belletje." Maakt de
  site inside-out (geloof → hoe → wat) i.p.v. alleen probleem-gedreven.
- **Herhaling weggehaald**: de "demonstratie"-sectie (bewijs) geschrapt; die vertelde de
  vangst-flow (= Route) nog eens én toonde €75-€5.000 dubbel. Het eerlijke zinnetje
  ("voorbeeld, geen echte klant") verplaatst naar een klein bijschrift onder de hero-telefoon.
- **Route-stap 1 ingekort** (herhaalde de pijn-sectie).
- Ritme hersteld: prijs-sectie op `--surface-2` nu de navy bewijs-sectie weg is.
- Geverifieerd desktop + mobiel + live.

## Conversie-review: pijn, positionering, garantie (2026-07-19)
Na review als designer/marketeer/copywriter (founder vroeg: wat mist er om klanten te brengen):
- **"Herken je dit?"-pijnblok** bovenaan de pijn-sectie: 3 herkenbare scenario's (schuine
  tekst, oranje accent) die de pijn laten vóélen, dan pas de cijfers (PAS-opbouw).
- **Eerlijke positionering** (site-bridge + chatbot): Belvanger is géén leadgeneratie- of
  marketingbureau. Wél: professionele uitstraling (website/info/chatbot) + voorkomen dat je
  leads verliest die je al bellen. Voorkomt verkeerde verwachtingen.
- **Garantie / risico-omkering** in de prijskaart: "je maandbedrag gaat pas lopen zodra
  Belvanger je eerste gemiste klant heeft opgevangen" (groene belofte-strip + checklist-item).
- Founder-blok bewust NIET gedaan (founder wil nog geen eigen gezicht; eerste klanten via
  mond-tot-mond).
- **Chatbot gelijkgetrokken**: NL-cijfers (Infopact i.p.v. Hiya), "gesprek" i.p.v. "demo",
  positionering + garantie, em-dash-verbod in system-prompt.
- Design: route-sectie terug op `--surface-2` (ritme hersteld), diepere kaartschaduw,
  roadmap-stap 3 = "Jij houdt de regie" (theme-safe blauw) i.p.v. dubbele opsomming.
  Ampersands (&) in prijsblok → "en"/"and". Geverifieerd desktop + mobiel.

## Lead-formulier + e-mailbezorging (2026-07-19)
- "Demo" is **sitebreed vervangen door "gesprek"** (knoppen, kop, tekst, FAQ, privacy, EN,
  app.js). Alleen "demonstratie" (animatie-uitleg) blijft staan.
- Het #demo-blok is nu een **kennismakingsgesprek-aanvraag**: velden Naam\*, Bedrijfsnaam
  (optioneel), Je vak\*, Telefoonnummer\*, Je vraag (tekstvak, optioneel). Honeypot behouden.
- **Bezorging**: formulier → `POST /api/lead` (same-origin op de site-server) → e-mail naar
  info@belvanger.nl via een **zero-dep SMTP-client** (`node:tls`, poort 465, in
  `product/chatbot/server.js`). Env-gated: zonder SMTP_*-vars is het endpoint uit → **AB
  ongemoeid**. Terugval bij fout: melding met mailto/WhatsApp zodat een aanvraag nooit
  verloren gaat. Leads worden ook geteld in `data/leads.jsonl` (voor het klantdashboard later).
- SMTP-secret staat **alleen** in het gitignored `.env` (SMTP_HOST/PORT/USER/PASS/FROM, LEAD_TO);
  compose geeft ze via `env_file` door aan de container.
- Geverifieerd (2026-07-19): `POST /api/lead` → 200 op een echte test (Hostinger accepteerde
  de mail), honeypot → stil 200, ontbrekende naam → 400. Formulier visueel gecontroleerd.
  Test-mail door Wesley bevestigd ontvangen.
- **Autoreply (2026-07-19):** formulier heeft nu een verplicht **e-mailveld**; na verzending
  krijgt de aanvrager een **gebrande Belvanger-bevestigingsmail** (multipart HTML + tekst,
  geen em-dashes, NL/EN op basis van `taal`). `smtpSend` ondersteunt nu `html`
  (multipart/alternative). Best-effort: faalt de autoreply, dan is de lead nog steeds binnen.
- **Cijfers (2026-07-19):** internationale Hiya-cijfers vervangen door NL-bron **Infopact**
  (52% belt concurrent, 44% probeert niet opnieuw). Alle **em-dashes uit zichtbare tekst**
  gehaald (site + widget). Founder-voorkeur: geen em-dashes.
- **Openstaand:** Wesley bevestigt dat de gestylde autoreply er goed uitziet in de inbox.

## Content-herziening: kanaal, prijs, cijfers (2026-07-18)
Grote inhoudelijke update na keuzes founder:
- **Kanaal neutraal**: overal "WhatsApp" als productmechanisme → "een (automatisch) bericht".
  Reden: de pilot draait op **sms met afzendernaam "Belvanger"** (bewezen werkend voor NL);
  WhatsApp pas na KvK. WhatsApp-*contactknoppen* (wa.me naar 06…) + de demo-aanvraag-handoff
  blijven — dat is contact naar Wesley, geen productclaim. Ook de **hero-animatie**
  is ge-de-WhatsApp't: navy header i.p.v. groen, blauwe sms-bubbels i.p.v. groene,
  dubbele vinkjes verwijderd (`--sms`-var in `styles.css`). Groen blijft alleen voor
  succes (lead-toast, call-accept, vinkjes in lijstjes).
- **Prijsmodel expliciet**: €99/mnd = draaien, onderhoud + dashboard met dagelijkse cijfers;
  **eenmalige setup** = website + AI-chatbot + automatisering (afgestemd/in demo). Harde
  €99 spreekt de FAQ niet meer tegen. "Wat je krijgt" nu 4 kaarten: website (+formulier),
  automatische leadvangst, AI-chatbot, eigen dashboard.
- **Statistieken eerlijk + bron**: 62%/85% bleken vooral vendor-marketing (VS). Nu 80% "laat
  geen voicemail achter" (bron: **Hiya, State of the Call**) + bronregel onder de stats;
  cijfers gemarkeerd als indicatief/internationaal.
- Doorgevoerd in: NL + EN `index.html`, `css/styles.css` (`.stats__source`), én de
  chatbot-bron `product/chatbot/customers/belvanger/{knowledge-base.md,system-prompt.txt}`.
  **Let op:** `assemble.mjs` herbouwt `app/` uit `product/chatbot`: de site-`app/`-kopie is
  een build-artefact, bewerk altijd de bron in `product/chatbot`.
- Lokaal visueel geverifieerd (NL+EN, desktop+mobiel) via puppeteer/`file://`.
- **Nog doen:** `assets/og-image.png` opnieuw genereren (SVG-bron staat goed; PNG zegt nog
  "via WhatsApp" — alleen zichtbaar bij link-delen, site is noindex). Nog niet gedeployed.

## Waarom deze map bestaat
De site was oorspronkelijk elders gebouwd en ging live met meerdere **onware claims**.
Een onafhankelijke review vond 8 defecten; een aparte controle nog een paar meer. Alles
is gefixt op de VPS en die gecorrigeerde versie is hierheen gehaald, zodat een volgende
deploy de fouten niet terugzet. **Let op:** als er nog een óude buildmap van belvanger
bestaat, gooi die weg of overschrijf 'm met deze — anders republiceer je de valse claims.

## Wat is gefixt (2026-07-17)
- Valse live-demo-claim + "100%"-statistiek → eerlijke "dit is een demonstratie".
- Nep-telefoonnummer (085-000-0000) op 4 plekken + in de JSON-LD → verwijderd.
- "AVG-proof" (checklist, FAQ, JSON-LD) → feitelijke gegevensbeschrijving.
- Nep-KvK (00000000) + dode Privacy/Voorwaarden-links → verwijderd/echt gemaakt.
- Harde €99-prijs in structured data (sprak de zichtbare FAQ tegen) → verwijderd.
- Demo-formulier loog "gelukt" zonder iets te versturen → nu **WhatsApp-handoff** naar
  06 4673 3277 (lead komt écht binnen bij versturen).
- Progressive enhancement: content standaard zichtbaar (`.reveal` pas verborgen ná
  `reveal-ready` van app.js) — JS geblokkeerd = pagina blijft leesbaar.
- CTA-contrast → WCAG AA (donkere tekst op oranje, 5,18:1; hover lichter).
- Telefoonvalidatie eist echte cijfers (8–15); aria-koppeling van foutmeldingen.
- Privacyverklaring + Voorwaarden toegevoegd (op naam **Wesley Visser**, testfase-eerlijk).
- Hele site + juridische pagina's op `noindex`.
- Deploy-script: SSH-hostverificatie aan (`accept-new`), auto-backup vóór deploy.

## TODO vóór dit een echt bedrijf/publiek wordt (Wesley)
- [ ] **Echt telefoonnummer** kiezen (nu je persoonlijke 06 4673 3277 — evt. apart zakelijk).
- [x] ~~Werkende mailbox~~ → **info@belvanger.nl** aangemaakt + in de footer (2026-07-18).
- [ ] **KvK-inschrijving** zodra je gaat factureren; daarna privacy/voorwaarden bijwerken
      met bedrijfsnaam + KvK-nummer, en de contactPoint + prijs terug in de JSON-LD.
- [ ] **`noindex` eraf** pas als het bovenstaande klopt, anders indexeert Google onjuiste
      gegevens. Het moet dan van **zes** bestanden af, niet drie: `index.html`, `privacy.html`,
      `voorwaarden.html` én `en/index.html`, `en/privacy.html`, `en/terms.html`. Vergeet je de
      EN-helft, dan indexeert Google één taal en de hreflang-verwijzing ernaartoe loopt dood.
      (`404.html`, `aanbod.html`, `klantintake.html` en de twee `film-*.html` blijven bewust op
      `noindex` staan, die horen niet in Google.)
      `tests/taalpariteit.mjs` waarschuwt als de twee homepages hierin uiteenlopen.
- [ ] Juridische pagina's laten nalezen door iemand met juridische kennis.
- [ ] Live-demo-loop (Twilio/n8n/WhatsApp) bouwen → pas dán mag "zie het live" terug.

## Backups op de VPS
`/opt/belvanger-backups/`: o.a. `pre-honestyfix-20260717-132634` (vóór alle fixes).
Het deploy-script maakt automatisch een `pre-deploy-*` backup bij elke deploy.
