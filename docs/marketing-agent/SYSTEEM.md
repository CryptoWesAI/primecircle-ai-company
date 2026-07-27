# Marketing-agent: het systeem

Van onderzoek tot betalende klant, en de lus die zichzelf verbetert. Gebaseerd op de
aflevering met Cody Schneider (Greg Isenberg), maar omgerekend naar jouw situatie: een
eenmanszaak, Nederlandse lokale vakbedrijven, €625 setup en €99 per maand.

> **Waarom dit bestand er is.** De video beschrijft een systeem dat is gebouwd voor
> bedrijven die al duizenden euro's per maand aan advertenties uitgeven. Alles erin is
> waar, maar de volgorde is voor jou verkeerd. Als je de infrastructuur eerst bouwt, heb
> je over drie weken een prachtige datapijplijn en nog steeds nul klanten. Dit document
> houdt dezelfde architectuur aan, maar zet er triggers bij: elke laag komt erbij als het
> geld dat erdoor stroomt de bouw rechtvaardigt.

---

## 1. De drie tests: wanneer is het een agent?

Uit de video, en het is een goede lat:

1. **Verenigde data.** Eén plek waar de hele keten zichtbaar is, van advertentie tot omzet.
2. **Beslissingen op een ritme.** Het loopt zonder jou, met een denkstap erin.
3. **Het leert van resultaat.** Het leest zijn eigen uitkomst terug en maakt meer van wat won.

Wat het *niet* is: een lineaire n8n- of Zapier-flow. En het hoeft ook geen AGI te zijn.
Cody zegt het scherp: *"An agent is just code under the hood. It's just a decision tree."*

**Eerlijke stand voor Belvanger vandaag:** je hebt (1) gedeeltelijk (leads komen binnen per
mail en in `leads.jsonl`, maar de bron staat er niet in), (2) niet, en (3) niet. Dat is geen
schande, het is de startpositie. De rest van dit document is de weg ernaartoe, met de
goedkoopste stap eerst.

---

## 2. De vier lagen

Elke marketing-agent, ongeacht kanaal, heeft dezelfde vier lagen. Bouw ze in deze volgorde
en elke laag levert al iets op vóór de volgende bestaat.

```
  [1] ONDERZOEK / DNA        →  [2] CREATIVE        →  [3] PUBLICEREN  →  [4] METEN & LEREN
  pijnpunten, uitkomsten,       statics + video,       Ads Manager,       kosten per lead
  concurrentieadvertenties      per hoek een brief     UTM per hoek       per hoek, en
  YouTube/podcast-inzichten                                              terugschrijven
        ↑                                                                        │
        └────────────────────────  de lus  ───────────────────────────────────────┘
```

**Laag 1 is waar de winst zit en waar iedereen te weinig tijd aan besteedt.** De creative is
uitvoering; de hoek is de strategie. Tien goede hoeken slaan honderd mooie plaatjes.

---

## 3. De twee wetten

**Wet 1: lezen doe je uit je eigen data, schrijven doe je via de API.**
Uit de video: accounts worden niet geblokkeerd omdat er een agent aan hangt, maar omdat
mensen honderden miljoenen rijen uit de Marketing API trekken. Dat is een
voorwaardenschending, geen agentprobleem.

> Marketing API = **alleen schrijven**: publiceren, pauzeren, budget verschuiven.
> Alle *cijfers* komen uit je eigen opslag, niet uit herhaalde API-vragen.

**Wet 2: los entropie op, of het systeem gaat zichzelf herhalen.**
Een agent die alleen zijn eigen output terugleest, gaat binnen twee weken dezelfde
advertentie in vijftig varianten maken. Nieuw DNA moet erin. Vier bronnen uit de video:

| Bron | Wat je eruit haalt | Voor jou |
|---|---|---|
| **Facebook Ad Library** | advertenties van concurrenten | Werkt in NL en is publiek. Zoek op branchegenoten en op bureaus die vakmensen bedienen. |
| **YouTube-transcripties** | inzichten uit vakkanalen | Beperkt voor NL-trades, maar er zijn dakdekker- en klus-kanalen. |
| **Podcasttranscripties** | zelfde spel, ander corpus | Nauwelijks NL-aanbod in deze niche. Overslaan. |
| **Virlo / TikTok-trends** | formats die nu werken | Later. Niet jouw doelgroep-eerste kanaal. |

**Wat voor jou beter werkt dan alle vier:** Google-reviews van concurrenten in jouw regio,
Facebook-groepen voor ZZP'ers en klussers, en je eigen gespreksnotities. Dat is echt
Nederlands taalgebruik van echte vakmensen, en dat is precies wat Reddit voor Cody's
Amerikaanse B2B is.

---

## 4. Andromeda: de creative *is* de targeting

De belangrijkste verandering, en voor jou uitgesproken gunstig.

Meta's advertentiealgoritme leest nu de **creative zelf** (het beeld, de tekst in het beeld,
de video, het script) plus de **landingspagina**, en bepaalt daarmee wie de advertentie
ziet. Interessegericht targeten is dood: je hoeft niet meer "mensen met interesse in
dakbedekking" aan te vinken.

**Wat dat betekent voor jouw werk:**
- Je advertentie moet het **pijnpunt en de uitkomst** benoemen, niet de doelgroep.
  Niet *"voor dakdekkers"* maar *"je staat op het dak en de telefoon gaat drie keer"*.
- De **landingspagina moet matchen**. Jouw homepage doet dat al: dezelfde pijn, dezelfde
  cijfers, dezelfde belofte. Dat is geen toeval maar het is nu ook algoritmisch relevant.
- Het conversiedoel mag **dieper in de trechter**: niet "klik" maar "aanvraag verstuurd".
  Daarvoor heb je meting nodig, zie fase 2.

Cody's uitspraak *"Facebook has turned into the best B2B ads channel that exists right now"*
klinkt overdreven, maar de reden erachter is nuchter: het algoritme kan tien mensen in een
land vinden die precies dit probleem hebben. Voor een niche als "Nederlandse schilder die
belletjes mist" is dat precies het gereedschap dat je nodig hebt.

---

## 5. Wat ik NIET uit de video overneem, en waarom

Dit is het belangrijkste deel van dit document.

| Uit de video | Waarom niet nu |
|---|---|
| **"Duizend creatives, niet drie"** | Het principe blijft: breed testen, volume laat de winnaar zien. Het getal niet. Bij €10 per dag krijgt een advertentie nooit genoeg vertoningen om iets te bewijzen als je het budget over honderd stuks smeert. Voor jou: **10 tot 15 hoeken per batch**, niet 1000. |
| **Airbyte + ClickHouse** | Een datawarehouse verenigt bronnen die jij nog niet hebt. Je hebt geen Stripe, geen HubSpot, geen Google Analytics. Je hebt één leadstroom en één dashboard. Dit is het antwoord op een probleem dat je pas krijgt bij meerdere kanalen én meerdere klanten. Trigger staat in fase 3. |
| **Facebook Marketing API voor publiceren** | Bij 10 advertenties per week is handmatig in Ads Manager sneller dan de integratie bouwen, en je loopt geen enkel risico op een blokkade. De API wordt interessant vanaf ongeveer 50 advertenties per week. |
| **Agent in de cloud (Heroku/Railway)** | Een agent die elke dag draait heeft pas zin als er elke dag genoeg nieuwe data is om een andere beslissing te nemen. Bij €10 per dag is dat er niet. Tot dan ben **ik** de agent: jij zegt "nieuwe batch" en de lus draait. |
| **HeyGen AI-avatar UGC** | Kost een abonnement en het is nog niet nodig. Je hebt Seedance via OpenArt en dat is beter beeld. Statics eerst: die zijn goedkoper te testen en de hoek is wat je test, niet het formaat. |

**De rode draad:** neem de *architectuur* over, niet de *schaal*. Cody's systeem is juist,
en jouw versie ervan heeft in fase 1 nul nieuwe abonnementen en nul nieuwe code nodig.

---

## 6. De laag die in de video ontbreekt: de AVG

Cody zit in de VS. Jij niet, en jij verkoopt aan Nederlandse bedrijven wier klantgegevens
je verwerkt. Drie dingen:

**De Meta-pixel is niet gratis in juridische zin.** Zodra je een pixel plaatst, deel je
gedrag van bezoekers met Meta. Dat vraagt toestemming vóór het laden, precies zoals je
Microsoft Clarity nu al achter de cookiemelding hebt staan (`js/cookies.js`, `loadClarity()`).
Hetzelfde patroon werkt voor de pixel: één functie erbij, achter dezelfde gate.

**Zonder pixel kun je nog steeds meten, alleen niet optimaliseren.** Belangrijk verschil:
- **Jouw meting** (kosten per lead per hoek) kan volledig uit je eigen data. Geen pixel nodig.
- **Meta's optimalisatie** wordt zonder pixel gedaan op kliks in plaats van op aanvragen,
  en dat is meetbaar slechter. Daarom komt de pixel er in fase 2, met toestemming.

**De Conversions API is technisch netter en juridisch niet gratis.** Je zou de aanvraag
serverside naar Meta kunnen sturen (je hebt `/api/lead` al). Dat omzeilt adblockers, maar
het blijft persoonsgegevens naar Meta sturen en vraagt dus dezelfde grondslag. Niet eerder
dan fase 3, en pas na de verwerkersovereenkomst uit `docs/EIGENAARSCHAP_EN_OVERDRACHT.md`.

**Doe fase 1 dus zonder pixel.** Geen toestemmingsvraag, geen privacywijziging, geen risico.
Je meet zelf, en dat is genoeg om te weten welke hoek werkt.

---

## 7. Het rekensommetje: kán dit werken bij jouw prijs?

De video slaat dit over, en het is precies de vraag die bepaalt of je een euro mag uitgeven.

**Wat een klant je oplevert** (aannames expliciet, verander ze zodra je echte cijfers hebt):

| | |
|---|---|
| Setup | €625 eenmalig |
| Abonnement | €99 per maand |
| Aanname: gemiddelde looptijd | 12 maanden |
| Omzet per klant | €625 + €1.188 = **€1.813** |
| Aanname: brutomarge 70% (VPS, Twilio, OpenRouter, tooling) | **±€1.270 brutowinst** |

**Wat je dan mag betalen voor een lead:**

| Aanname: leads per klant | Maximale kosten per lead om quitte te spelen | Gezond doel (1/3 daarvan) |
|---|---|---|
| 5 leads → 1 klant | €254 | **onder €85** |
| 10 leads → 1 klant | €127 | **onder €42** |
| 20 leads → 1 klant | €63 | **onder €21** |

**De conclusie die dit oplevert:** met €10 per dag (€300 per maand) en €40 per lead haal je
ruim 7 leads per maand. Bij 1 op 10 is dat minder dan één klant per maand, en dan werkt het
nog steeds: die klant is €1.270 waard tegen €300 advertentiekosten.

**Waar het niet werkt:** als je kosten per lead boven de €85 blijft hangen én je conversie
onder 1 op 5 zit. Dat is je stopcriterium, en het is beter om dat nu op te schrijven dan het
later te voelen.

> **Vuistregel:** meet **kosten per aanvraag**, niet kosten per klik. Een klik van 20 cent
> waar niemand het formulier invult is duurder dan een klik van een euro die wel converteert.

---

## 8. De fasering, met een trigger per fase

Niet op datum, op gebeurtenis. Je gaat pas naar de volgende fase als de vorige iets bewijst.

### Fase 0: nu, nul euro
- Handmatig onderzoek naar pijnpunten in echte bronnen (zie laag 1).
- **10 hoeken** opschrijven in `ANGLES.md`, met per hoek de pijn en de uitkomst.
- Nog geen advertenties. Dit alleen kost je een uur en het maakt elk volgend uur beter.

**Trigger naar fase 1:** de hoeken staan er, en je hebt ze getoetst aan één echte vakman
(bijvoorbeeld in een DM: *"welke van deze twee zinnen raakt jou?"*).

### Fase 1: eerste batch, geen code, geen pixel
- Per hoek één static via OpenArt (Nano Banana Pro), volgens de brief uit de skill.
- Alles naar `belvanger.nl/?a=<hoek-id>`. Die tag komt automatisch mee in elke
  aanvraagmail, want `app.js` stuurt `pagina: location.href` mee.
- Handmatig publiceren in Ads Manager. €10 per dag, één campagne, doel: **kliks** naar de
  landingspagina (zonder pixel kun je niet op aanvragen optimaliseren).
- Na 3 dagen: slechtste helft uit, winnaars laten staan.
- Resultaat per hoek terugschrijven in `ANGLES.md`.

**Trigger naar fase 2:** twee batches gedraaid, en minstens één hoek met aantoonbaar lagere
kosten per aanvraag dan de rest. Dan weet je dat het kanaal werkt en is meten de bottleneck.

### Fase 2: meten wordt echt, pixel erbij
- Meta-pixel achter de cookiemelding, in hetzelfde patroon als Clarity.
- Privacyverklaring bijwerken (Meta als verwerker, doel, grondslag toestemming).
- Conversiedoel in Ads Manager naar **Lead** in plaats van kliks.
- `leads.jsonl` legt de bron vast, zodat de rendementsberekening geautomatiseerd is
  (patch staat klaar, zie §9).
- Video erbij: Seedance via OpenArt, 9 seconden per clip, dezelfde hoeken.

**Trigger naar fase 3:** meer dan één kanaal of meer dan drie klanten waarvoor je dit doet.
Pas dan is "alle bronnen in één plek" een echt probleem.

### Fase 3: de agent zoals in de video
- Datapijplijn (Airbyte) en warehouse (ClickHouse of gewoon Postgres, die heb je al staan
  voor het portaal) om advertentie aan omzet te koppelen.
- Marketing API voor **alleen schrijven**: publiceren, pauzeren, budget verschuiven.
- Agent in de cloud, dagelijks ritme, met de eliminatiestructuur uit de video:
  10 advertenties per dag, 2 tot 3 dagen laten lopen, slechtste uit, winnaars in een pool
  die om het budget vecht.
- Promptdatabase: elke JSON-prompt en elk script bewaren met zijn resultaat, zodat de agent
  leest wat won. Jouw `ANGLES.md` is hier de handmatige voorloper van, en dat is bewust:
  het is beter een lijst te hebben die je invult dan een database die leeg blijft.

---

## 9. Het enige gat in de meetlus, en de patch ervoor

De aanvraagmail bevat de bron (de volledige URL met `?a=<hoek>`). `leads.jsonl` bevat alleen
`{ts, vak, taal}`. Dus je kunt het per hoek wél nalezen in je mailbox, maar niet berekenen.

Voor fase 1 is de mailbox genoeg (bij 7 leads per maand tel je op je hand). Voor fase 2 is de
patch: de campagnetag meelogen in `leads.jsonl`. Dat is geen persoonsgegeven en het maakt
`tools/ad-rendement.mjs` bruikbaar zonder je mailbox te openen.

---

## 10. Wat je maandag doet

1. `.claude/skills/ad-batch/` openen en de eerste batch draaien. De skill vraagt om je merk,
   je aanbod en je doelgroep, en levert 10 hoeken plus een OpenArt-brief per hoek.
2. Beelden genereren, aanleveren, en ik meet, converteer en lever de advertentieset op.
3. €10 per dag, drie dagen, en dan meten.

En eerlijk over de reikwijdte: **dit brengt bezoekers, geen klanten.** De laatste meter blijft
een gesprek. Je eigen `SELLING.md` zegt het al, en advertenties veranderen dat niet: ze zorgen
dat er meer mensen zijn om te bellen, niet dat het bellen wordt overgenomen.

---

## Bronnen en verwijzingen

- Aflevering: Cody Schneider bij Greg Isenberg, over marketing-agents en de AI-voor-WordPress
  kans. Negen schermafbeeldingen uit de video staan in `docs/marketing-agent/video-notes.md`.
- `docs/EIGENAARSCHAP_EN_OVERDRACHT.md` — verwerkersovereenkomst, nodig vóór fase 3.
- `docs/compliance/ai-transparantie-art50.md` — AI-disclosure, raakt de chatbot op de
  landingspagina waar advertenties naartoe leiden.
- `SELLING.md` — de teller die bepaalt of dit bouwen of uitstellen is.
