# Belvanger: status & TODO

PrimeCircle's eigen trades-demo/verkoopsite. Live (noindex), gehost op de VPS in
`/opt/belvanger` achter Traefik. **Deze map is sinds 2026-07-17 de bron-van-waarheid**
— deploy alleen hiervandaan (`bash deploy-to-vps.sh`).

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
