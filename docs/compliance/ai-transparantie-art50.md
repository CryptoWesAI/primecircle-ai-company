# AI-transparantie (EU AI Act, Art. 50): standaard in de chatbot

**Status:** ingebouwd en live (2026-07-15). **Wettelijke deadline:** 2 augustus 2026.
Geen juridisch advies — laat de exacte teksten bij twijfel door een jurist nalezen.

## Wat de wet vraagt (kort)

Art. 50(1) EU AI Act: wie een AI-systeem inzet dat rechtstreeks met natuurlijke
personen communiceert (zoals een chatbot), moet die personen **duidelijk en tijdig**
informeren dat ze met een AI communiceren — uiterlijk bij de eerste interactie —
tenzij dat voor een redelijk oplettend persoon overduidelijk is. Voor PrimeCircle
behandelen we het als **verplicht en altijd aan**, voor elke klant.

## Hoe het is opgelost (design)

De disclosure zit in de **gedeelde widget** (`chatbot/public/widget.js` +
`widget.css`), niet in de per-klant `config.json`. Daarom erft **elke klant hem
automatisch** en kun je een chatbot niet per ongeluk zónder disclosure uitleveren.
Drie lagen, zodat het signaal niet kan wegvallen:

1. **Openingsbericht bij eerste interactie**: zodra het chatvenster opent, vóór de
   begroeting, verschijnt een notice: *"U chat met de digitale assistent van
   [naam] (automatisch, geen medewerker). Voor persoonlijk of dringend contact belt
   u …"* (NL) / *"You are chatting with [naam]'s digital assistant (automated, not a
   staff member)…"* (EN). Zie `strings()` → `disclosure`, getoond in `openPanel()`
   vóór `greeting`.
2. **Blijvende "AI"-badge in de header**: een pill die nooit wegscrollt, ook niet
   in een lang gesprek. Met gelokaliseerde tooltip (`badgeTitle`). Naast de
   subtitel "Digitale assistent".
3. **Duidelijke styling**: de notice heeft een eigen omkaderde stijl (`.ab-note`),
   niet weggemoffeld als grijs bijschrift → voldoet aan "duidelijk en onderscheidbaar".

De disclosure blijft ook staan als `/api/config` faalt (fallback-tekst zonder
telefoonnummer), zodat het AI-signaal nooit ontbreekt.

## Regels voor onderhoud (niet doen / wel doen)

- **NIET** de `disclosure`-notice, de `.ab-badge` of `.ab-note` verwijderen of
  onzichtbaar maken "voor een strakkere look".
- **NIET** de disclosure verplaatsen naar `config.json` als optioneel veld — hij
  moet standaard-aan en niet-uitschakelbaar blijven.
- **WEL** bij elke widget-wijziging opnieuw `assemble.mjs` draaien zodat de `?v=`
  cache-hash bumpt en bezoekers de juiste versie laden.
- Nieuwe talen toevoegen? Voeg dan óók `disclosure` + `badgeTitle` toe in `strings()`.

## Nog te doen vóór het publieke domein live gaat

- [ ] Privacy-alinea over de chat (en geanonimiseerde analytics) in de daadwerkelijke
  `privacy-statement.html` (NL+EN) plakken — tekst ligt klaar in
  `clients/ab-uitvaartzorg/docs/chatbot-privacy-alinea.md`.
- [ ] OpenRouter data-/retentiebeleid checken en vastleggen
  (`docs/paof/ai-governance-security.md`).
- [ ] Bij hoog-risico gebruik (HR, krediet, biometrie) geldt een strenger regime —
  niet van toepassing op deze informatieve assistent, maar wél de gate voor
  toekomstige use-cases. Zie `project-eu-ai-act-deadline` (geheugen).
