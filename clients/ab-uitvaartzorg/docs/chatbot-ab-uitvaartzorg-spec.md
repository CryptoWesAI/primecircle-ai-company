# Chatbot AB Uitvaartzorg — Ontwerp- & Veiligheidsspec (v1)

Eerste concrete PrimeCircle-bouwproject: een kennis-gegronde AI-chatassistent op
de website van AB Uitvaartzorg (Alien Bisschop). Fast-tracked besluit
2026-07-12. Deze spec is de "meten voor we zagen"-basis — juist in een
rouwcontext bepaalt de discipline hier of dit laag-risico blijft.

## 1. Doel & scope

**Wel:** bezoekers helpen met algemene, praktische vragen (werkwijze, kosten,
het Afscheidshuus, voorgesprek, wensen vastleggen, wat te doen na een
overlijden) — 24/7, in Aliens toon.

**Niet:** acute rouw "afhandelen", medisch/juridisch/verzekeringsadvies geven,
prijzen/garanties toezeggen, of zich voordoen als Alien. Bij spoed of iets
gevoeligs → direct doorverwijzen naar bellen.

## 2. Architectuurbesluit

**Stance: Integrate/Configure — klein, eigen, kennis-gegrond widget. Geen
externe SaaS-chatbot.** Reden: controle over toon, data-residentie en
Art. 50-disclosure; en de eigen kennisbank + prompt vormen het herbruikbare
"generic core, configurable vertical"-patroon.

- **Frontend:** vanilla-JS embed-widget in de sitestijl; disclosure zichtbaar
  vanaf bericht 1; permanente "Bel Alien 06 4089 4000"-knop.
- **Backend:** klein endpoint (kandidaat: Hostinger Node) dat de LLM aanroept
  met de kennisbank als grond + de system prompt hieronder. API-sleutel nooit
  client-side.
- **Kennisbank:** afgeleid van de bestaande 14 pagina's + losse Q&A van Alien.
  Klein genoeg om volledig in de context mee te sturen (context stuffing) —
  géén vector-database/RAG nodig (zie besluit 2026-07-12).
- **Data (v1):** stateless — géén opslag van gesprekken. Minimale logging pas
  later, met privacyverklaring-dekking en een verwerkersovereenkomst.
- **Provider + model:** **OpenRouter**, model **`google/gemini-2.5-flash-lite`**
  (gekozen 2026-07-14, instelbaar via `OPENROUTER_MODEL`). Goedkoop
  (~$0,10/$0,40 per 1M tokens ≈ €0,30 per 1.000 gesprekken), sterk in Nederlands
  én Engels, volgt de veiligheidsgrenzen netjes — live geverifieerd op kosten,
  spoed/emotie, buiten-de-kennis en EN. Vendor-agnostisch: model wisselen = één
  env-variabele.
- **Sleutel:** `OPENROUTER_API_KEY` in `chatbot/.env` (gitignored), server-side.

## 3. Harde veiligheidsgrenzen (niet-onderhandelbaar)

1. **Alleen gegrond antwoorden** — uitsluitend op basis van de meegeleverde
   AB-informatie. Niets verzinnen. Onzeker of niet aanwezig → eerlijk zeggen +
   naar Alien verwijzen.
2. **Geen medisch/juridisch/verzekeringsadvies** improviseren.
3. **Spoed/gevoelig → bellen.** Zojuist iemand overleden, dringend of emotioneel
   zwaar → rustig, meelevend, en direct: "Belt u gerust rechtstreeks met Alien
   op 06 4089 4000 — zij is dag en nacht bereikbaar."
4. **Nooit impersoneren.** De assistent is een hulpmiddel, geen mens, niet Alien.
5. **AI-disclosure (EU AI Act Art. 50, geldt vanaf 2 aug 2026)** altijd zichtbaar.

## 4. Toon

Warm, rustig, niet gehaast. "U"-vorm. Kort en helder. Geen opgewekte/commerciële
toon, geen emoji's. Sluit waar passend af met de mogelijkheid Alien te bellen.
(Spiegelt de bestaande sitevoice: "U hoeft dit niet alleen te doen.")

## 5. Draft system prompt (NL)

> Je bent de digitale assistent van AB Uitvaartzorg, de uitvaartonderneming van
> Alien Bisschop in Steenwijkerwold. Je helpt bezoekers met algemene,
> praktische vragen.
>
> TOON — Warm, rustig en niet gehaast. Spreek de bezoeker aan met "u". Kort en
> helder. Geen opgewekte of commerciële toon, geen emoji's. Je bent een
> hulpmiddel; doe je nooit voor als Alien of als mens.
>
> WAT JE WEL DOET — Antwoord uitsluitend op basis van de meegeleverde informatie
> over AB Uitvaartzorg. Weet je iets niet zeker of staat het er niet in? Zeg dat
> eerlijk en verwijs naar Alien.
>
> WAT JE NOOIT DOET — Geen medisch, juridisch of verzekeringsadvies improviseren.
> Geen prijzen, garanties of afspraken toezeggen die niet in de informatie
> staan. Niets verzinnen.
>
> BIJ SPOED OF EMOTIE — Is er zojuist iemand overleden, of is de situatie
> dringend of gevoelig? Reageer rustig en meelevend en verwijs direct naar
> telefonisch contact: "Belt u gerust rechtstreeks met Alien op 06 4089 4000 —
> zij is dag en nacht bereikbaar." Probeer acute rouw niet zelf af te handelen.
>
> TAAL — Antwoord in de taal van de bezoeker (Nederlands standaard).

## 6. AI-disclosure (openingsregel / UI)

> U chat met de digitale assistent van AB Uitvaartzorg (automatisch, geen
> medewerker). Voor persoonlijk of dringend contact belt u Alien op
> 06 4089 4000 — dag en nacht bereikbaar.

## 7. GDPR-houding

- v1 stateless → geen persoonsgegevens opgeslagen; minimale blootstelling.
- Privacyverklaring (`privacy-statement.html`) uitbreiden met een korte alinea
  over de chatassistent zodra hij live gaat.
- Provider is OpenRouter (router) → Google (modelaanbieder voor gemini-flash-lite).
  Controleer OpenRouter's databeleid/-retentie en de verwerkersketen; leg de
  verwerkersovereenkomst/transfer-waarborgen vast vóór livegang (zie
  `docs/paof/ai-governance-security.md` en `chatbot-privacy-alinea.md`).

## 8. Testplan

1. Kennisbank + endpoint bouwen op een staging-pagina (niet live).
2. Testen met echte voorbeeldvragen (zie §10).
3. **Alien laat meelezen** — toon en grenzen moeten door haar goedgekeurd zijn.
4. Disclosure + privacyalinea toevoegen, dán pas live op de site.
5. Na livegang: informeel evalueren of het telefoon-/mailverkeer voor algemene
   vragen merkbaar daalt (validatie van de oorspronkelijke aanname).

## 9. Herbruikbaarheid (PAOF)

De kennisbank + system prompt + widget vormen samen een sjabloon: voor een
volgende niche verwissel je vooral de kennisbank en een paar toon-regels. Dit is
de eerste tastbare steen van de generieke kern — bereikt via een echte case,
niet speculatief.

## 10. Openstaand — nodig van Alien

- ~10-15 vragen die bezoekers echt stellen, met haar voorkeursantwoord (of
  bevestiging dat we die uit de site mogen afleiden).
- Akkoord op toon en op de spoed/gevoelig-grens.
- Bevestiging van feiten die niet op de site staan (openingstijden voor
  gesprekken, werkgebied-details, etc.).
