# Hoekendatabase

Elke advertentiehoek die is bedacht, gedraaid en gemeten. Eén regel per hoek, en na de meting
vul je het resultaat aan.

> **Waarom dit een markdown-tabel is en geen database.** In de video is dit een promptdatabase
> die een agent terugleest. Dat is de eindvorm. Maar een lijst die je invult is meer waard dan
> een schema dat leeg blijft, en na drie batches is dit het waardevolste marketingbezit dat je
> hebt: je weet dan welke hoeken in Nederland, bij dít vak, tegen dít budget werken. Dat kun je
> nergens kopen.

**Werkwijze staat in** `.claude/skills/ad-batch/SKILL.md`. **Het rekensommetje** (wat mag een
aanvraag kosten) staat in `SYSTEEM.md` §7: onder €42 gezond, boven €85 stoppen.

---

## Batch 1: Belvanger, nog niet gedraaid

Doel: uitvinden welke pijn het hardst raakt. Niet: zo veel mogelijk aanvragen.
Budget: te bepalen. Landingspagina: `belvanger.nl/?a=<id>`.

De hoeken zijn afgeleid van materiaal dat al op de site staat en dus al klopt met de
landingspagina. Dat is niet luiheid: Andromeda leest die pagina mee, dus een hoek die de
pagina tegenspreekt presteert slechter.

| id | pijn | uitkomst | openingsregel | bewijs | waarom deze anders is |
|---|---|---|---|---|---|
| `fb-steiger-01` | Je staat op de steiger en kunt niet opnemen | Je verliest de klus niet meer | "Je staat op de steiger. De telefoon gaat drie keer." | 52% belt een concurrent als je niet opneemt | De fysieke onmogelijkheid. Geen verwijt, alleen erkenning. |
| `fb-voicemail-02` | Je hoort de voicemail pas 's avonds | Je reageert binnen een minuut, automatisch | "Je hoort de voicemail om acht uur 's avonds. De klus is al vergeven." | 44% probeert het daarna niet nog een keer | Het tijdsverloop. Niet dát je hem miste, maar hoe laat je het merkte. |
| `fb-onbekendnummer-03` | Gemist nummer, je weet nooit wat het was | Je weet altijd waar het over ging | "Onbekend nummer gemist. Was dat die grote opdracht, of reclame?" | De beller krijgt automatisch een bericht en antwoordt | De onzekerheid als pijn, niet het verlies. Anders van soort. |
| `fb-eigennummer-04` | Angst dat je je nummer moet veranderen | Niets verandert aan je nummer | "Je eigen nummer blijft je eigen nummer." | Alleen de gemiste oproep wordt doorgeschakeld | Ruimt een bezwaar op in plaats van een pijn. |
| `fb-eenklus-05` | Twijfel of het de kosten waard is | Eén klus betaalt het terug | "Eén extra klus per maand betaalt het ruim terug." | €99/mnd tegen een gemiddelde klus van honderden euro's | Rekenkundig in plaats van emotioneel. |
| `fb-eerstwerken-06` | Angst om vooruit te betalen voor niets | Je betaalt pas als het werkt | "Je maandbedrag gaat pas lopen als we je eerste gemiste klant hebben opgevangen." | De belofte staat op de prijskaart | Risico-omkering. De sterkste hoek op papier, dus meten of dat ook zo is. |
| `fb-geenrobot-07` | Weerstand tegen "AI die met mijn klanten praat" | Jij blijft degene die terugbelt | "Wij bellen je klanten niet terug. Dat doe jij." | Geen robot die je werk overneemt, wel een vangnet | Tegen de stroom in: verkoopt door minder te beloven. |
| `fb-bureau-08` | Betaalt een bureau dat niet reageert | Alles in één hand, wel bereikbaar | "Je betaalt je bureau elke maand en je krijgt geen antwoord op je mail." | Website, chatbot en opvang bij één partij | Vergelijkt met de huidige oplossing in plaats van met niets. |
| `fb-weekend-09` | Belletjes in het weekend en 's avonds | Ook buiten werktijd opgevangen | "Zaterdagochtend, half negen. Je slaapt uit. Er wordt gebeld." | Opvang staat dag en nacht aan | Ander moment, andere doelgroepstemming. |
| `fb-schilder-10` | Vakspecifiek: schilder met verweerd werk | Zichtbaar bewijs van je vakwerk | "Je klanten zien het verschil pas als je het ze laat zien." | De voor-en-na op de schilderpagina | Vak-specifiek en beeldgedreven. Test of specialisatie beter werkt dan algemeen. |

### Hoeken die ik zelf niet zou kiezen (bord 1: test ze juist wél)

| id | pijn | uitkomst | openingsregel | bewijs | waarom deze anders is |
|---|---|---|---|---|---|
| `fb-afraden-11` | Wordt altijd iets verkocht | Iemand die eerlijk zegt dat het niet hoeft | "Neem je altijd zelf op? Dan heb je dit niet nodig." | Diskwalificeert actief een deel van de markt | Verkoopt door af te raden. Vaak de best presterende hoek en bijna nooit de gekozene. |
| `fb-website-12` | Heeft een website die niets doet | Een site die klanten binnenhaalt | "Een website die geen klanten oplevert is duurder dan geen website." | Site gemaakt om klanten binnen te halen, niet om mooi te staan | Valt de eigen categorie aan. Ongemakkelijk en daarom interessant. |

### Verboden hoeken

- **"Wij halen nieuwe klanten voor je binnen."** De landingspagina zegt letterlijk het
  tegenovergestelde: *"Belvanger haalt geen nieuwe klanten voor je binnen, dat beloven we
  niet."* Andromeda leest die pagina mee, dus dit is niet alleen oneerlijk maar ook technisch
  dom. Bovendien is het het eerste wat een teleurgestelde klant citeert bij opzegging.
- **Alles met een resultaatgarantie in aantallen.** `voorwaarden.html` §4 sluit dat expliciet uit.
- **Nagemaakte reviews of klantnamen.** Er is nog geen betalende klant. Verzin er geen.

---

## Resultaten

Vul dit in na elke meting met `node tools/ad-rendement.mjs`. Zonder deze tabel leert het
systeem niets en draai je over drie maanden dezelfde hoeken opnieuw.

| batch | id | van | tot | besteed | vertoningen | kliks | aanvragen | kosten p/aanvraag | besluit |
|---|---|---|---|---|---|---|---|---|---|
| _(nog geen batch gedraaid)_ | | | | | | | | | |

### Wat we tot nu toe weten over dit kanaal

Nog niets, en dat is precies waarom batch 1 bestaat. Eén datapunt dat er al ligt en dat geen
advertentie is: de doorverwijzing van Georgina Tan op 27 juli kwam uit een **organische**
Facebook-post onder je eigen naam. Dat is zwak bewijs dat je doelgroep op Facebook zit en
reageert, en het is de beste reden om juist dit kanaal eerst te testen.
