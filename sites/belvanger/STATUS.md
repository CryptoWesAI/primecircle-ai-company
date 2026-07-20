# Belvanger — status & TODO

PrimeCircle's eigen trades-demo/verkoopsite. Live (noindex), gehost op de VPS in
`/opt/belvanger` achter Traefik. **Deze map is sinds 2026-07-17 de bron-van-waarheid**
— deploy alleen hiervandaan (`bash deploy-to-vps.sh`).

## Domein-migratie → belvanger.nl (2026-07-18)
- Eigen domein **belvanger.nl** (geregistreerd 2026-07-18 via Hostinger). DNS: A `@` →
  VPS `31.97.123.34` (via Hostinger DNS). **MX/mail-records ongemoeid** (Hostinger-mail),
  dus **info@belvanger.nl** werkt zolang de mailbox in hPanel bestaat (Wesley: bevestigd).
- Traefik-router luistert nu op `belvanger.nl` + `www.belvanger.nl` + (behouden)
  `belvanger.primecircle.cloud` — alle drie → dezelfde container. Let's Encrypt-cert voor
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

## Content-herziening — kanaal, prijs, cijfers (2026-07-18)
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
  **Let op:** `assemble.mjs` herbouwt `app/` uit `product/chatbot` — de site-`app/`-kopie is
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
- [ ] **`noindex` eraf** (`index.html`, `privacy.html`, `voorwaarden.html`) pas als het
      bovenstaande klopt — anders indexeert Google onjuiste gegevens.
- [ ] Juridische pagina's laten nalezen door iemand met juridische kennis.
- [ ] Live-demo-loop (Twilio/n8n/WhatsApp) bouwen → pas dán mag "zie het live" terug.

## Backups op de VPS
`/opt/belvanger-backups/` — o.a. `pre-honestyfix-20260717-132634` (vóór alle fixes).
Het deploy-script maakt automatisch een `pre-deploy-*` backup bij elke deploy.
