# SELLING

De enige drie cijfers die bepalen of dit bedrijf bestaat. Alles in `CURRENT_STATE.md`
gaat over wat er gebouwd is; dit bestand gaat over wat er verkocht is.

> **Waarom dit bestand er is.** De founder heeft zelf vastgesteld dat hij liever bouwt
> dan verkoopt, en dat eerdere ondernemingen waarde weggaven. Op 27 juli 2026 stond er
> een werkende PWA met pushmeldingen, een gemonteerde promotiefilm, een live dashboard en
> een klantsite. Aantal betalende klanten: nul. Het validatiegesprek uit
> `CURRENT_STATE.md` was op dat moment al ruim een week de "eerstvolgende stap".
> Dit bestand is geen motivatie, het is een teller.

## De drie cijfers

Deze worden **afgeleid uit het grootboek onderaan**, niet hier ingetypt. Dat is bewust:
een cijfer verhogen zou dan een muisklik zijn, terwijl een regel toevoegen het verzinnen
van een mens vereist. Dat is een veel hogere drempel, en precies de drempel die deze
teller nuttig maakt.

Deze worden bij het starten van een sessie berekend en getoond door
`.claude/hooks/selling-status.mjs`. Ze staan hier niet meer als getal, juist omdat een
getal in een bestand te makkelijk klopt te maken is.

## De eerstvolgende actie

Eén actie, niet een lijst. Letterlijk overgenomen uit `CURRENT_STATE.md`:

> Een casual discovery-gesprek met een warm vakcontact (die overboekt is, dus gebruik hem
> als doorverwijsbrug naar hongerige prospects, niet als klant #1), en DAARNA MVP v0
> bouwen.

Praktisch: één spraakbericht van anderhalve minuut, met het geteste script uit
`docs/offers/belvanger-voice-memo-scripts-2026-07-24.md` (Script A). De tekst bestaat al
en is al geoefend. Er hoeft niets bedacht te worden.

De tweede film ("Elk vak zijn eigen website") staat sinds 29 juli 2026 op de eigen
tijdlijn. Dat verandert deze actie niet: een post is zichtbaarheid, en de teller
hieronder gaat pas lopen bij een bericht aan een mens. De post maakt dat bericht wel
makkelijker, want er is nu een aanleiding: "ik heb net laten zien wat ik gebouwd heb,
ken jij iemand voor wie dit zou schelen?"

Komt er een reactie met de vraag wat het kost, dan ligt het antwoord met de
risico-omkering klaar in `docs/offers/belvanger-promotiefilm-opgevangen-2026-07-25.md`.
Niet improviseren in het moment.

## Warme lijst

Vijf echte namen, niet meer. Vul ze zelf in; ik verzin geen mensen.

| # | Naam | Vak | Hoe je hem kent | Al benaderd |
|---|---|---|---|---|
| 1 | Marcel Bruinenberg | ? | getagd door Georgina Tan onder de Facebook-post | **ja, 27-07 17:21** |
| 2 | Friesland Schilderwerken | schilder | getagd door Georgina Tan onder de Facebook-post | **ja, 27-07 17:22** |
| 3 | _(de overboekte vriend)_ | | | nee |
| 4 | | | | nee |
| 5 | | | | nee |

**Doorverwijsbronnen.** Mensen die anderen naar je toe brengen. Los bijhouden, want dit
zijn je waardevolste contacten en het zijn geen prospects.

| Naam | Wat hij deed | Bedankt | "Ken je er nog meer?" gevraagd |
|---|---|---|---|
| Georgina Tan | tagde Marcel Bruinenberg en Friesland Schilderwerken onder de post | nog niet | **nog niet** |

## Grootboek

Eén regel per écht verstuurd bericht naar een écht mens. Geen post op een tijdlijn, geen
reactie in een groep: dat is zichtbaarheid, geen contact. Wie de definitie oprekt om de
nul weg te krijgen, heeft een mooier bestand en hetzelfde bedrijf.

Zet in de kolom Reactie letterlijk `GEBOEKT` zodra er een gesprek staat. Daar rekent de
teller op.

| Datum | Naam | Vak | Kanaal | Wat je zei | Reactie |
|---|---|---|---|---|---|
| 2026-07-27 | Marcel Bruinenberg | ? | Messenger | tag-opener + de vraag of hij belletjes mist | nog niets |
| 2026-07-27 | Friesland Schilderwerken | schilder | Messenger (bedrijfspagina) | zelfde, formeler geopend | nog niets |

## Facturen

Eén regel per factuur, met het bestand erbij. Dit cijfer hoort meetbaar te zijn en niet
zelfgerapporteerd.

| Datum | Klant | Bedrag | Bestand | Betaald |
|---|---|---|---|---|
| | | | | |

## De hook staat er nu wel

Hij was expliciet gegate op één echte regel in het grootboek. Op 27 juli 2026 om 17:21 en
17:22 kwamen er twee, dus de poort is open en de hook is gebouwd:
`.claude/hooks/selling-status.mjs`, aangeroepen via `SessionStart` in
`.claude/settings.json`.

Wat hij doet: bij het starten van een sessie de drie cijfers berekenen uit het grootboek
hieronder, plus het aantal dagen sinds het laatste contact en de eerstvolgende actie. Drie
regels, daarna houdt hij zijn mond.

De reden dat hij niet eerder is gebouwd staat er nog steeds, en blijft gelden: het bouwen
van dit soort machinerie is de vorm die uitstelgedrag hier aanneemt. Was de hook er vóór
het eerste bericht geweest, dan was de hook zelf het uitstel geweest.

Weghalen kan altijd: verwijder het `hooks`-blok uit `.claude/settings.json`.

## Wanneer dit bestand verdwijnt

Bij **drie betalende klanten**, of zodra de eerste €99 twee keer op rij is
binnengekomen, rotteren de drie cijfers naar: MRR tegen het inkomensvervangingsdoel uit
`CURRENT_STATE.md`, openstaande supportvragen, en opzeggingsrisico. De teller keert dan
om: hij beschermt bouw- en levertijd tegen onbetaalde supportvragen.

Een teller zonder einddatum wordt achtergrondschuld die je gaat negeren. Deze heeft een
finish, en die halen is de beloning.
