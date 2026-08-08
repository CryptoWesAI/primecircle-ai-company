---
name: ad-batch
description: >-
  Draai één volledige advertentiebatch van begin tot eind voor een van de eigen merken of
  een klant: pijnpuntonderzoek in echte bronnen, 10 tot 15 concurrerende hoeken, een
  OpenArt-brief per hoek (static en optioneel video), de naam- en UTM-conventie zodat elke
  lead zijn bron meedraagt, de publicatiechecklist voor Ads Manager, en na drie dagen de
  meting met kill/keep-besluit dat wordt teruggeschreven in de hoekendatabase. Gebruik bij
  "nieuwe advertentiebatch", "advertenties maken", "Facebook ads", "meta ads", "nieuwe
  hoeken", "campagne opzetten", of als een batch gemeten en opgeschoond moet worden. NIET
  voor organische social posts of voor een enkele losse afbeelding.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# ad-batch

Eén batch, van pijnpunt tot gemeten resultaat. Dit is de handmatige uitvoering van de lus uit
`docs/marketing-agent/SYSTEEM.md`. Zolang fase 3 er niet is, ben **ik** de agent: jij zegt
"nieuwe batch", ik draai stap 1 tot 7.

**Lees eerst** `docs/marketing-agent/SYSTEEM.md` §7 (het rekensommetje) en §5 (wat we bewust
niet uit de video overnemen). Zonder die twee ga je te veel betalen voor te weinig signaal.

---

## De wet van deze skill

> **De hoek is de strategie. De creative is uitvoering.**

Tien goede hoeken slaan honderd mooie plaatjes. Als je merkt dat je tijd in beeldkwaliteit
gaat zitten voordat er een winnende hoek is, ben je de verkeerde variabele aan het optimaliseren.

En: **na Andromeda is de creative de targeting.** Je vinkt geen doelgroep aan. Je schrijft het
pijnpunt en de uitkomst op, en Meta zoekt de mensen erbij. Dus elke hoek moet een pijn en een
uitkomst bevatten, of hij heeft geen instructie.

---

## STAP 0: Merk, aanbod, en het ene cijfer

Vraag dit één keer per merk en schrijf het op in `docs/marketing-agent/merken/<merk>.md`,
zodat een volgende batch het niet opnieuw hoeft te vragen.

1. **Merk en aanbod.** Wat verkoop je, aan wie, voor welke prijs?
2. **De landingspagina.** Welke URL, en klopt die met de hoeken? (Andromeda leest hem mee.)
3. **Het doel van deze batch.** Meestal: aanvragen. Soms: alleen leren welke hoek pakt.
4. **Het budget en het stopcriterium.** Bedrag per dag, en bij welke kosten per aanvraag je
   stopt. Uit `SYSTEEM.md` §7 volgt voor Belvanger: onder €42 is gezond, boven €85 is stoppen.
5. **Merkstijl.** Kleuren, letters, en de regels voor beeld (zie STAP 3).

"Bepaal jij maar" is een geldig antwoord op de creatieve punten. Op het budget en het
stopcriterium niet: dat is geld en dat is zijn beslissing.

---

## STAP 1: Onderzoek in echte bronnen

Niet verzinnen. Ophalen. Voor Nederlandse lokale vakbedrijven werkt in deze volgorde:

1. **Google-reviews van concurrenten in de regio.** De negatieve reviews zijn goud: daar staat
   letterlijk wat mensen aan een vakman frustreert, in hun eigen woorden.
2. **Facebook-groepen voor ZZP'ers, klussers en vakmensen.** Echt taalgebruik van de doelgroep
   zelf, niet van hun klanten.
3. **De Facebook Ad Library.** Publiek toegankelijk, ook voor NL. Zoek op branchegenoten en op
   bureaus die vakmensen bedienen. Dit is de "nieuw DNA"-bron uit de video.
4. **Eigen gespreksnotities en DM's.** Het duurst verkregen materiaal dat je hebt. Gebruik het.
5. **YouTube-transcripties** van vakkanalen. Beperkt aanbod in NL, maar niet nul.

Reddit is voor Cody's Amerikaanse B2B de beste bron; voor NL-trades is het te dun. Niet
forceren.

**Lever op:** een lijst pijnpunten en gewenste uitkomsten, geordend op hoe vaak ze voorkomen.
Citeer waar mogelijk letterlijk. Een letterlijk citaat is een betere advertentieregel dan
alles wat je zelf verzint.

---

## STAP 2: 10 tot 15 hoeken die elkaar niet overlappen

Per hoek precies dit, in `docs/marketing-agent/ANGLES.md`:

| Veld | Regel |
|---|---|
| `id` | kort, uniek, gebruikt in de UTM. Bijvoorbeeld `fb-steiger-01`. |
| `pijn` | één zin, in de woorden van de doelgroep |
| `uitkomst` | wat er beter is als het probleem weg is |
| `openingsregel` | de eerste regel van de advertentie, dat is 80% van het werk |
| `bewijs` | het cijfer, de garantie of het voorbeeld dat de claim draagt |
| `waarom deze anders is` | in één zin, ten opzichte van de andere hoeken |

**De overlapcheck, en die is hard.** Twee hoeken die dezelfde claim anders formuleren zijn
één hoek en verspillen de helft van je budget. Test: kun je de openingsregels omwisselen
zonder dat de advertentie verandert? Dan is het dezelfde hoek.

**Neem minstens twee hoeken op die je zelf niet zou kiezen.** Dat is het punt van bord 1 uit
de video: de anti-Yoast-hoek is precies degene die je nooit had bedacht en die wel werkt. Voor
Belvanger is dat bijvoorbeeld de hoek die de dienst *afraadt* aan wie het niet nodig heeft.

**Verboden hoeken (Belvanger-specifiek).** De site zegt letterlijk: *"Belvanger haalt geen
nieuwe klanten voor je binnen, dat beloven we niet."* Een hoek die nieuwe klanten belooft
spreekt je eigen landingspagina tegen, en Andromeda leest die pagina mee. Dat is dus niet
alleen oneerlijk maar ook technisch dom.

---

## STAP 3: Een OpenArt-brief per hoek

OpenArt zit in de OmniFrame-workspace, niet hier. Ik lever dus de **brief**, jij genereert,
en ik meet en converteer. Dat is precies de werkwijze die op 27 juli werkte voor de
schilderpagina.

Per hoek:

```
Model     : nano-banana-2 of gpt-image-2 (statics), byte-plus-seedance-2 (video)
Verhouding: 4:5 portret voor de feed, 9:16 voor Reels en Stories
Prompt    : <scène die de PIJN toont, niet de dienst>
Negatief  : <het vaste blok hieronder>
```

**De vaste negatieve prompt** (uitgebreid met de vakregels die op 27 juli zijn vastgelegd
naar aanleiding van een ladder tegen een kozijn):

```
faces, people looking at camera, hands with wrong finger count, logos, brand names, text,
lettering, watermarks, studio lighting, flat even light, plastic skin, oversaturated colors,
HDR look, cartoon, illustration, 3D render, cgi, floating tools, warped straight edges,
ladder leaning against glass, ladder leaning against a window frame, ladder against freshly
painted work, standing on the top rungs, ladder feet on soft or sloping ground, worker
reaching far out to the side of the ladder
```

**Drie regels voor het beeld:**

1. **Geen tekst in het beeld laten genereren.** AI zet halve woorden in beeld en dat is de
   snelste weggever. Tekst komt in de advertentietekst, niet in de afbeelding.
2. **Vakinhoudelijk kloppend.** Jouw lezer is de expert. Een zesde vinger wordt vergeven, een
   verkeerde werkwijze diskwalificeert je. Laat elk beeld nakijken door iemand uit het vak
   voordat het live gaat. Zie `docs/LEARNINGS.md`, 2026-07-27.
3. **Toon de pijn, niet het product.** Je verkoopt geen software, je verkoopt "je bent de klus
   niet kwijt". Het beeld moet het moment vlak vóór de oplossing zijn.

---

## STAP 4, Naam en UTM: de rug van de meting

Zonder dit kun je niets meten en is de hele batch een gevoel.

```
Campagne : <merk>-<maand>-<doel>          bijv. belvanger-2026-08-aanvragen
Adset    : <merk>-<maand>-<batch>         bijv. belvanger-2026-08-b1
Ad       : <hoek-id>                      bijv. fb-steiger-01
Link     : https://belvanger.nl/?a=<hoek-id>
```

**Waarom `?a=` en niet de standaard utm-parameters:** kort, en het werkt vandaag zonder één
regel code. `js/app.js` stuurt `pagina: location.href` mee bij elke aanvraag, dus de tag staat
automatisch in de aanvraagmail. Attributie per advertentie kost dus niets.

Let op: `recordPageview` strípt de querystring, dus **de bron zit alleen in de lead**, niet in
de bezoekcijfers. Dat is voor deze fase genoeg.

---

## STAP 5: Publiceren (handmatig, en dat is bewust)

Bij minder dan ongeveer 50 advertenties per week is Ads Manager sneller dan een
API-integratie bouwen, en je loopt nul risico op een blokkade. Zie `SYSTEEM.md` §5.

Checklist:

- [ ] Eén campagne, één adset per batch, alle hoeken als losse advertenties erin
- [ ] **Geen interessetargeting.** Alleen land, taal en leeftijd. De creative doet de rest.
- [ ] Doel: kliks naar de landingspagina (fase 1, zonder pixel) of Lead (fase 2, met pixel)
- [ ] Budget op adsetniveau, het bedrag uit stap 0
- [ ] Elke advertentie heeft zijn eigen `?a=<hoek-id>`
- [ ] Alle advertenties tegelijk aan. Niet gefaseerd: dan vergelijk je verschillende dagen
- [ ] Datum en batch-id opschrijven in `ANGLES.md`

---

## STAP 6: Drie dagen niets doen, dan meten

**Niets doen is de stap.** Bord 3 uit de video: 2 tot 3 dagen laten lopen, niemand raakt ze
aan, wachten op echt signaal. Eerder ingrijpen is ruis optimaliseren.

Na drie dagen:

```bash
node tools/ad-rendement.mjs <meta-export.csv> [leads.jsonl]
```

Beslisregel:
- **Uit:** de slechtste helft op kosten per aanvraag. Geen aanvragen én meer dan 40 kliks:
  ook uit, die hoek is weerlegd.
- **Blijft staan:** de rest. Die gaan in de winnaarspool en concurreren om het budget.
- **Nieuwe batch:** varianten van de winnaars plus minstens drie volledig nieuwe hoeken. Die
  laatste drie zijn je oplossing voor entropie; zonder nieuw DNA loopt het systeem vast op
  zijn eigen smaak.

---

## STAP 7: Terugschrijven, of het was voor niets

Vul per hoek in `ANGLES.md` in: vertoningen, kliks, aanvragen, kosten per aanvraag, en het
besluit. Eén regel per hoek.

Dit is de handmatige versie van Cody's promptdatabase, en het is bewust een markdown-tabel en
geen database: het is beter een lijst te hebben die je invult dan een schema dat leeg blijft.
Na drie batches is deze tabel het waardevolste marketingbezit dat je hebt, want dan weet je
welke hoeken in dít land, bij dít vak, tegen dít budget werken. Dat kun je nergens kopen.

---

## Gotchas

- **Laat Seedance NOOIT zelf muziek genereren.** Vraag je in de prompt om muziek, dan
  keurt Seedance de video ná het renderen af met `1003: output_moderation_blocked`
  ("copyright restrictions") en zijn de credits al op. Bewezen met een test van vijf
  runs, zelfde seed, één variabele per keer: dialoog is onschuldig, muziek is de
  trigger, en het blijft mislukken als je het in gewoon proza vraagt in plaats van
  tussen haakjes. Het model leest de intentie, niet de formulering. Zet dus altijd
  `no music of any kind, diegetic sound only` in het negatieve blok en leg muziek er
  in de montage onder. Juist bij advertenties is dit de val, want daar wil je muziek.
  Volledige meting: `docs/build/seedance-2-5-best-practices.md` §7.
- **Kies de Seedance-versie op de klus, niet op het versienummer.** 2.5 levert lagere
  resolutie dan 2.0 maar wel 30s, native audio en 50 referenties. Zie §0 van hetzelfde
  document.
- **De querystring komt niet in de bezoekcijfers.** `serveStatic` strípt hem (`server.js`,
  regel ±1163). Alleen de aanvraag draagt de bron. Reken dus met aanvragen, niet met bezoeken.
- **`leads.jsonl` bewaart alleen `{ts, vak, taal}`.** De bron staat in de aanvraag*mail*. Bij
  meer dan ongeveer 20 leads per maand is dat handmatig te veel: dan de patch uit
  `SYSTEEM.md` §9 doorvoeren.
- **Geen Meta-pixel op de site.** Zonder pixel kun je niet op aanvragen optimaliseren, alleen
  op kliks. Dat is een bewuste keuze voor fase 1 (geen toestemmingsvraag, geen
  privacywijziging). Verwacht dus hogere kosten per aanvraag dan met pixel, en vergelijk
  batches alleen met elkaar, niet met cijfers van anderen.
- **Andromeda leest je landingspagina.** Een hoek die iets belooft wat de landingspagina
  tegenspreekt presteert slechter, niet beter. Controleer altijd of de belofte op de pagina
  terugkomt.
- **Alle advertenties tegelijk aanzetten.** Gefaseerd aanzetten maakt de vergelijking
  waardeloos, want Meta's leerfase en de dag van de week vervuilen het.
- **Beeld met tekst erin is de snelste weggever.** Laat het model geen letters maken.
- **Vakinhoudelijke fouten in beeld zijn de gevaarlijkste soort:** ze zien er voor ons prima
  uit en de doelgroep ziet ze meteen. De ladder-tegen-het-kozijn uit juli is het voorbeeld.
- **De laatste meter blijft een gesprek.** Deze skill levert aanvragen, geen klanten. Als de
  aanvragen niet worden gebeld, is elke euro advertentiebudget weggegooid.
