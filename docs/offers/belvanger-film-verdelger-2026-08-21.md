# Belvanger vakfilm "Je had je handen vol": draaiboek en montage

> **Status: af.**
> [`sites/belvanger/film/belvanger-verdelger-1080x1920.mp4`](../../sites/belvanger/film/belvanger-verdelger-1080x1920.mp4)
> 25,28 seconden, 1080x1920, 25 fps, h264 + aac, 6,9 MB. Gemeten: -15,9 LUFS,
> true peak -1,2 dBFS.
>
> Act 1 is gegenereerd en zit erin. Alles is met eigen ogen gecontroleerd op losse
> frames uit het eindbestand; de film is niet als film bekeken.

**Datum:** 2026-08-21
**Formaat:** 9:16 verticaal, 1080x1920, 25 fps, 25,28 seconden
**Kanaal:** Facebook/Instagram op het persoonlijke profiel, en 1-op-1 in een DM
**Geluid:** het geluid van de gegenereerde shot plus een gesynthetiseerde bodem, geen
muziekbed. Gemeten op het eindbestand: -15,9 LUFS integrated, true peak -1,2 dBFS.
**Kosten:** 6.405 credits, allemaal aan act 1. Uitsplitsing onderaan.

## Waarom deze film bestaat

De suggestie kwam van buiten: maak zoiets ook eens voor een verdelger. Er zit geen
concrete prospect achter, dus dit is materiaal voor de tijdlijn en geen toegespitst
verkoopstuk. Daarom ook **geen negende voorbeeldpagina** voor ongediertebestrijding:
die bouw je op het moment dat er een naam is die hem moet zien, niet ervoor.

Het is de derde film in dezelfde lijn:

| Film | Taak |
|---|---|
| `belvanger-promotiefilm-opgevangen-2026-07-25.md` | de probleemfilm: emotie, geen product |
| `belvanger-showcasefilm-elk-vak-2026-07-28.md` | de vakmanschapsfilm: wat je voor je geld krijgt |
| **deze** | de vakfilm: dezelfde belofte, maar in één herkenbaar beroep, met humor |

## Het idee, en hoe het twee keer is omgegooid

**Waar het op uitkwam.** Een verdelger staat met een wespennest in twee handen. Zijn
telefoon gaat, hij schrikt, het nest schiet los, en bij het opvangen komen de wespen
eraf. Ze kruipen over zijn gezicht en hij kan ze niet wegslaan, want zijn handen
zitten vol. Dan kijkt hij strak in de camera en zegt: **"Mooi."**

**Waar het begon.** Versie 1 was een pure hold: telefoon gaat, hij kijkt omlaag, er
gebeurt niets. Die keuze kwam uit de vakkenbatch van acht gegenereerde shots
(`.claude/skills/seedance-video/SKILL.md`), waar één harde regel uit kwam: elke
overlevende shot was een simpele hold of werk dat buiten beeld bleef, en elke
mislukking liet zichtbaar vakwerk zien. Die versie is ook echt gemaakt en staat nog in
de werkmap als `act1-rustige-versie-1080p.mp4`.

**Waarom hij eruit ging.** De founder keek hem en wilde meer: schrikken, bijna laten
vallen, wespen eraf, en een woord in de camera. Dat loopt bewust twee bekende
breekpunten in: een fysieke mislukking onder kracht, en een zwerm kleine snelle
objecten precies op het moment dat het gezicht leesbaar moet zijn. Allebei zijn ze
eerst voor 605 credits op 480p uitgeprobeerd en allebei hielden ze stand. **De regel
uit de skill blijft goed als vuistregel, maar hij is geen wet:** het is de moeite waard
om hem één keer goedkoop te toetsen in plaats van een idee te laten vallen.

Wat wél overeind bleef uit de oorspronkelijke redenering:

- **Beide handen blijven de hele shot aan het nest.** Dat is de motor van de grap
  (hij kan niet opnemen, en later kan hij ook niet slaan) én de reden dat het model
  niet hoeft te verzinnen wat zijn handen doen.
- **Geen zichtbaar vakwerk.** Er wordt niets vakkundig gedaan in beeld: hij houdt
  alleen iets vast. Het model rendert vakwerk dat er voor een leek plausibel uitziet
  en voor een vakman fout, en uitgelachen worden door je eigen markt is erger dan niet
  posten.
- **Geen kap voor zijn gezicht.** De kap van een imkerpak is een half doorzichtig vlak,
  en doorzichtige vlakken zijn geen grens voor dit model: bij de glaszetter gingen de
  handen dwars door het glas heen. De kap hangt daarom naar achteren op zijn schouders.
- **Het nest doet het werk dat tekst niet mag doen.** Een videomodel rendert geen
  betrouwbare Nederlandse tekst, dus een grap die afhangt van iets dat de kijker moet
  lézen, valt om. Een wespennest is op elke onscherpte herkenbaar.

## De montage

| Filmtijd | Duur | Beeld | Geluid |
|---|---|---|---|
| 0,00 - 10,55 | 10,55s | **Act 1, gegenereerd.** Rustig vasthouden, telefoon gaat op 1,5s, hij schrikt en het nest schiet los, bij het opvangen komen de wespen eraf, ze kruipen over zijn gezicht, hij geeft het op, kijkt in de camera en zegt "Mooi". De laatste halve seconde staat stil | het eigen geluid van de shot: tuin, de telefoon, het gezoem dat aanzwelt, en het gesproken woord op 9,3s |
| 10,55 - 20,87 | 10,32s | **De simulatie**, vanaf "Gemiste oproep · 14:32" tot en met "Je eigen website ving 'm mee op". De klant vraagt om spoed voor een wespennest onder de dakrand | de echte meldingstonen uit `js/app.js`, geen klap op de eerste snede |
| 20,87 - 25,28 | 4,40s | Slotkaart: "Opgevangen. Zonder dat je iets deed." + vraag + woordmerk + de eerlijkheidsregel | laatste klap, dan uitfaden |

**Kaart 1 is eruit.** "Je had je handen vol. Letterlijk." was de geschreven grap, en
act 1 draagt de grap nu zelf. Twee grappen achter elkaar verzwakken elkaar allebei, en
zonder die kaart komt de film precies uit in de 20 tot 25 seconden die het doel was.
Hij staat nog in `film-tekstkaarten.html?set=verdelger&kaart=1` en gaat er weer in met
`MET_KAART1=ja bash monteer-verdelger.sh`.

**De omslag zit op 10,55.** Na "Mooi" staat het beeld een halve seconde stil en valt
het geluid van de tuin weg; op die snede staat bewust géén klap. Dat gat is het moment
waarop de klant normaal weg was. Dezelfde beweging als in "Opgevangen", en het is het
enige stuk montage in de hele film dat echt iets doet.

## Act 1: hoe hij gemaakt is

Twee generaties, in deze volgorde. Eerst een stilstaand beeld, dan dat beeld animeren.
Dezelfde route als bij "Opgevangen" (storyboardframe naar image2video), en hij is
goedkoper en beter stuurbaar dan direct text2video, omdat je de compositie vastzet
vóór je voor beweging betaalt.

### 1. Het eerste frame

**GPT Image 2, `text2image`, 9:16, 2k, kwaliteit `high`, `autoEnhancePrompt` uit.**
170 credits. Zelfde recept als de vier glaszetterbeelden
(`docs/build/glaszetter-beelden.md`): fotorealistisch, documentaire vakfotografie,
Noordwest-Europese context, geen tekst en geen logo's.

```
Documentary trade photography, vertical 9:16 portrait.

A pest control technician stands three rungs up an aluminium ladder against the
brick facade of a Dutch terraced house, just below the roof eave. He cradles a
detached grey paper wasp nest, about the size of a football, in both gloved hands,
held slightly away from his chest. A few wasps crawl on the nest's surface.

He wears a plain grey-blue work polo and dark work trousers. His beekeeper veil
hood is pushed back and rests on his shoulders, so his face is fully visible:
calm, concentrated, looking at the nest. A smartphone sits in his chest pocket,
half out, screen dark.

Late afternoon: warm low side light from camera left, brick warm and textured,
soft green garden bokeh behind him, shallow depth of field, 50mm, eye level with
the subject.

No text, no logos, no readable brand marks, no watermark.
```

Het beeld staat als `werkmap-verdelger/act1-frame-v1.png` (1296x2304). Eén afwijking
van de brief is blijven staan: **hij staat naast de ladder en niet erop.** Dat kost
iets van het gevoel dat hij ook nog eens hoog staat, maar het levert stabiliteit
terug, want een balancerend persoon is voor een videomodel veel lastiger dan een
staand persoon. De grap hangt aan zijn handen, niet aan zijn voeten.

Waarom het gezicht wél in beeld staat, terwijl de acht voorbeeldpagina's bewust
gezichtloos zijn: daar riep een gezicht de vraag op wie dat dan is op een fictieve
bedrijfssite. Hier is het gezicht de clou. De regel uit de skill die hierbij hoort,
gaat over **echte** gezichten (nooit een selfie als referentie, en een herkenbaar
gezicht maakt van herkenbare content een advertentie). Deze man is anoniem en bestaat
niet, dus die regel raakt hem niet.

### 2. De beweging

**Model: `byte-plus-seedance-2-5` (Seedance 2.5), modus `image2video`, het beeld
hierboven als `startFrame`.** Duur 10s, resolutie 1080p, `generateAudio: true`,
`seed: 20260821`. 3.210 credits.

**Dit corrigeert de versieregel in de skill.** Die zegt: neem 2.0 als je resolutie
nodig hebt, want 2.5 zit op 720p vast. Dat klopt niet meer. Het formulier van
`byte-plus-seedance-2-5 / image2video`, opgevraagd op 2026-08-21, biedt 480p, 720p én
**1080p**, en gaat tot 30 seconden. Voor een shot met een gesproken woord is 2.5
daarmee gewoon de juiste keuze: lipsync is precies waarvoor die versie bestaat. Let op
één verschil: 2.5 heeft **geen `aspectRatio`-veld**, want de verhouding komt uit het
startframe. Dat frame moet dus al 9:16 zijn.

```
Subject:
The pest control technician from the reference image, unchanged: same face, same
grey-blue work polo, same gloves, veil hood pushed back on his shoulders, the grey
paper wasp nest cradled in both hands.

Action, as beats:
0-1.5s   He holds the nest steady in both hands, calm, eyes on the nest. Nothing
         else moves.
1.5-2.5s The phone in his chest pocket lights up and rings loudly. He flinches hard
         and the nest slips and tilts in his grip.
2.5-4s   He catches it against his forearms and chest with both hands. The jolt
         shakes the nest, and a dozen wasps lift off it in a loose fast swarm.
4-6.5s   The wasps swirl around his head and shoulders. Several land on his cheek,
         forehead and neck and crawl there. He winces and jerks his head, but both
         hands stay on the nest, so he cannot swat them away.
6.5-8s   He stops moving and gives up. He turns his head and looks straight into the
         camera, deadpan, wasps still crawling on his face and around him.
8-10s    Still looking into the camera, both hands still on the nest, he says one
         dry, quiet word in Dutch: "Mooi." Then he holds the look and does not move.

Scene and environment:
Brick facade of a Dutch terraced house, low roof eave directly above him, aluminium
ladder, hedge and garden behind him in soft focus. Late afternoon, warm low side
light from camera left.

Visual style:
Documentary trade photography. Natural skin tones, shallow depth of field, warm
practical light only.

Camera:
Medium shot, eye level, nearly locked off, with a very slight push-in that settles
as he turns to the camera.

Audio:
Diegetic only. Quiet garden ambience, a mobile phone ringing inside the chest pocket
muffled by fabric, the buzzing of the wasps rising sharply as they lift off the nest,
and one spoken Dutch word, "Mooi", in a calm northern Dutch accent, dry and
understated. No music of any kind. No other dialogue.

Constraints:
Both hands stay on the nest for the entire shot. The nest slips but never leaves his
hands and never falls, and he never reaches for the phone. His face stays visible,
lit and in focus at all times: the wasps crawl on his cheek, forehead and neck but
never cover his eyes or his mouth. Real wasps at real scale, not a dense cloud. No
subtitles, no captions, no text, no logos, no watermark anywhere in frame.
```

Vier dingen in die prompt doen het echte werk:

1. **"No music of any kind"** is geen stijlkeuze maar een faalregel. Seedance keurt de
   afgeronde video ná het rekenen, de credits zijn dan al op, de blokkade is
   deterministisch, en de trigger is dat het model zélf een muziekje verzint dat een
   fingerprint-matcher raakt. Een gesproken woord is onschuldig, muziek niet.
2. **"Real wasps at real scale, not a dense cloud"** houdt de zwerm klein genoeg om nog
   als losse wespen te renderen in plaats van als een vlek.
3. **"never cover his eyes or his mouth"** beschermt de clou: de wespen mogen over zijn
   gezicht lopen, maar het gezicht moet leesbaar blijven op het moment dat hij praat.
4. **"one dry, quiet word in Dutch"** plus het benoemen van het accent. Het accent
   benoemen werkt beter dan de taal benoemen; laat je het weg, dan leidt het model de
   stem af uit het beeld, zelfverzekerd en vaak verkeerd.

### 3. De beat-audit vooraf

Loop elke beat langs de eigen randvoorwaarde. Met een nest in twee handen kan hij
schrikken (ja), het nest tegen zijn onderarmen vangen (ja), met zijn hoofd rukken (ja),
zijn hoofd draaien en praten (ja). Hij hoeft niets te pakken, niets neer te zetten en
niets open te maken. Dat is precies waar een eerdere shot op stukliep: die verbood twee
bezette handen en vroeg daarna om een zaklamp terug in de mond, waarna er een zaklamp
uit zichzelf terugvloog.

### 4. De kosten, en waar geld verloren ging

| Stap | Model en instelling | Credits |
|---|---|---|
| Eerste frame | GPT Image 2, 9:16, 2k, high | 170 |
| Prototype rustige versie | Seedance 2.0, 8s, 9:16, 480p | 280 |
| **Rustige versie definitief** | Seedance 2.0, 8s, 9:16, 1080p | **1.600** |
| Prototype "mooi", zonder wespen | Seedance 2.5, 9s, 480p | 540 |
| Prototype "mooi", mét wespen | Seedance 2.5, 10s, 480p | 605 |
| **Definitief** | Seedance 2.5, 10s, 1080p | **3.210** |
| | | **6.405** |

**Die 1.600 is de leerzame post.** De 1080p-versie van de rustige take stond al te
rekenen toen het verzoek kwam om er iets heel anders van te maken, en deze koppeling
heeft geen annuleerknop: een gestarte render is betaald. De les is niet "vraag vaker",
want dat kost founder-tijd, maar: **promoveer pas naar de dure resolutie als het IDEE
is goedgekeurd, niet als alleen de uitvoering is goedgekeurd.** Een prototype van 280
tot 605 credits is er precies voor om die vraag te kunnen stellen.

De rustige take is niet weggegooid en staat als
`clips/act1-verdelger-rustig-1080p.mp4`. Hij is bruikbaar als er ooit een versie zonder
gesproken tekst nodig is, bijvoorbeeld voor een kanaal waar niemand het geluid aanzet.

**Allebei de takes en het frame staan bewust in `clips/` en `frames/` en niet in de
werkmap**, want die is gitignored en wordt bij elke opname gewist. Dit is het enige
deel van de film dat geld heeft gekost en niet in een minuut opnieuw te maken is.

## De simulatie: dezelfde pagina, andere casus

Het opnamepodium is niet gekopieerd maar **vak-variabel** gemaakt:
`film-opnamepodium.html?vak=verdelger`. Structuur, tijden en `js/app.js` blijven
identiek; alleen de woorden in het voorbeeldgesprek wisselen. Zonder `?vak=` verandert
er niets, zodat de opnames van de eerste twee films reproduceerbaar blijven.

Wat er in deze variant staat:

| Plek | Tekst |
|---|---|
| belscherm | "Jij staat op de ladder…" |
| klant, 14:33 | "Goedemiddag! Er zit een groot wespennest onder onze dakrand, vlak bij de voordeur. Zaterdag hebben we visite. Kunnen jullie er deze week nog langs?" |
| Belvanger, 15:03 | "Vervelend, daar helpen we u snel vanaf. Deze week kunnen we langskomen. U wordt vandaag nog teruggebeld om een tijd af te spreken. Is dit nummer goed bereikbaar?" |
| melding | "Nieuwe lead binnen: wespennest onder de dakrand, deze week nog" |

Het automatische terugbericht ("Sorry, we misten je belletje!") is **niet** aangepast.
Dat is de echte producttekst en die hoort in elke film hetzelfde te zijn.

De casus is bewust een spoedklus met een datum erin. Bij een installateur is de
overtuiging het formaat van de klus (14 woningen); bij een verdelger is het de
**tijdsdruk**: wie zaterdag visite heeft en vandaag niemand te pakken krijgt, belt
binnen tien minuten de volgende. Dat is precies het verlies dat de film claimt.

## De kaarten

Eén bestand voor alle vakfilms: `film-tekstkaarten.html?set=verdelger&kaart=1|2`.
Kaart 2 is voor elke film hetzelfde, want de belofte verandert niet per vak. Kaart 1
verwijst naar wat je in act 1 hebt gezien en is dus wel vakspecifiek.

**In deze montage staat alleen kaart 2:**

> **Opgevangen.** Zonder dat je iets deed.
> Ken je iemand die dit kan gebruiken? Stuur me een appje.
> Voorbeeld ter illustratie, geen echte klant.

Kaart 1 bestaat nog wel en staat klaar voor een vakfilm waarin act 1 geen clou draagt:

> **Je had je handen vol.**
> Letterlijk. En je telefoon bleef maar gaan.

Waarom hij er nu uit is: act 1 eindigt op "Mooi", en dat is de grap. Er daarna nog een
geschreven grap achteraan zetten haalt allebei de klappen onderuit, en het maakt de
film drie en een halve seconde langer dan het doel. Terugzetten kan met
`MET_KAART1=ja bash monteer-verdelger.sh`; het geluidsscript krijgt dat automatisch
door en verschuift zijn klappen mee.

## Het geluid

Geen muziek, om twee onafhankelijke redenen: bij deze doelgroep is een muziekbed het
snelste signaal dat er een bureau aan te pas kwam, en bij Seedance blokkeert het de
render.

Het geluid van act 1 komt **uit de gegenereerde shot zelf**: de tuin, de telefoon in
zijn borstzak, het gezoem dat aanzwelt als de wespen loskomen, en het woord "Mooi" op
9,3 seconden. Daaronder en daarna ligt een gesynthetiseerde laag uit
`maak-geluid-verdelger.mjs`:

- Een lage ruimtetoon (bruine ruis, zwaar afgevlakt) onder de hele film. Zonder dit
  klinken de gaten tussen de tonen als een kapot bestand.
- De **echte** tonen uit `js/app.js`, op de tijden waarop de simulatie ze zelf speelt:
  880 Hz voor een bericht, 660+880 voor een binnenkomende lead. De film laat dus ook
  in geluid niets horen wat de site niet doet.
- Een lage klap op de snede naar de slotkaart. Niet op de snede naar de simulatie: dat
  gat is het punt.
- De gesynthetiseerde beltoon voor act 1 ligt klaar in hetzelfde script, maar staat uit
  (`--zonder-rinkel`) zodra er een echte shot met eigen geluid ligt. Hij is alleen
  nodig als act 1 nog een plaatshouder is.

Gemeten op het eindbestand met `ebur128`: **-15,9 LUFS integrated, true peak
-1,2 dBFS.** Dat is op een tiende na het doel en het sluit aan op de vorige twee films
(-16,0 en -16,2).

Dat het klopt, is niet vanzelf gegaan. Loudnorm in één doorgang schatte er 1,2 LU
naast en liet de true peak op -0,8 dBFS staan, en dat is te dicht op nul om de
hercodering van Facebook veilig te overleven. De montage meet nu eerst en normaliseert
daarna, met de gemeten waarden als invoer.

## De eerlijkheidsgrens

- De regel "Voorbeeld ter illustratie, geen echte klant" staat de volle 10,3 seconden
  van de simulatie onderin beeld, en nog een keer op de slotkaart.
- Er staat geen bedrijfsnaam, geen telefoonnummer en geen review in beeld. Er is nog
  geen betalende klant, dus er valt niets te tonen dat echt is.
- Het gesprek is fictief, de techniek eronder niet: elk beeld van de telefoon is een
  opname van de echte simulatie die op belvanger.nl draait, met dezelfde tijden en
  dezelfde tonen.

Zodra er een echte klant met een echt opgevangen gesprek is, vervangt die opname de
simulatie en mag de disclaimer eraf. Dat is dan een aantoonbaar sterkere film.

## Begeleidende tekst

Persoonlijk profiel, in de lijn van `belvanger-facebook-stappenplan-2026-07-24.md`:
bouwen in het openbaar, om een doorverwijzing vragen in plaats van verkopen.

**Versie A, aanbevolen:**

> Iemand vroeg me of ik zoiets ook voor een verdelger kon maken.
>
> Dus: je hebt een wespennest in twee handen en je telefoon gaat. Je schrikt, en dan
> zit je met de gevolgen. Opnemen kan sowieso niet.
>
> En die klant belt vijf minuten later gewoon de volgende.
>
> Tenzij er iets is dat dat gesprek voor je opvangt terwijl jij je handen vol hebt.
>
> 25 seconden, geluid aan (er wordt iets gezegd). Het voorbeeld in beeld is fictief.
>
> Ken je iemand voor wie dit zou schelen? Stuur me een appje.

**Versie B, korter:**

> Handen vol, telefoon gaat. Elke vakman kent het, alleen zelden zo letterlijk.
>
> Geluid aan, anders mis je het laatste woord.
>
> Voorbeeld is fictief. Ken je iemand die dit kan gebruiken?

### Regels die bij deze post horen

- **"Geluid aan" hoort erin, en nu dubbel.** Facebook speelt gedempt af, en de clou is
  een gesproken woord. Zonder geluid eindigt de film op een man die in de camera kijkt
  en niets zegt.
- **Geen prijs in de post.** Het bedrag geef je zodra iemand ernaar vraagt, met de
  risico-omkering; dat antwoord ligt klaar in
  `belvanger-promotiefilm-opgevangen-2026-07-25.md`.
- **Geen uitgaande link** (Facebook onderdrukt het bereik) en **native uploaden**,
  niet als YouTube-link.

## Wat er klaar staat

| Onderdeel | Waar |
|---|---|
| **De gemonteerde film, 25,28s** | `sites/belvanger/film/belvanger-verdelger-1080x1920.mp4` |
| Act 1, de gebruikte take (34 MB, HEVC) | `sites/belvanger/film/clips/act1-verdelger-mooi-1080p.mp4` |
| Act 1, de rustige take zonder tekst | `sites/belvanger/film/clips/act1-verdelger-rustig-1080p.mp4` |
| Het eerste frame | `sites/belvanger/film/frames/act1-verdelger-frame.png` |
| Opnamescript (simulatie + kaarten + plaatshouder, start zijn eigen server) | `sites/belvanger/film/neem-verdelger-op.mjs` |
| Geluidsscript (synthese, geen samples) | `sites/belvanger/film/maak-geluid-verdelger.mjs` |
| Montagescript (ffmpeg) | `sites/belvanger/film/monteer-verdelger.sh` |
| Opnamepodium, vak-variabel | `sites/belvanger/site/film-opnamepodium.html?vak=verdelger` |
| Tekstkaarten, vak-variabel | `sites/belvanger/site/film-tekstkaarten.html?set=verdelger` |

## Opnieuw maken of aanpassen

```bash
# Alles opnieuw opnemen en monteren (duurt ongeveer een minuut):
node sites/belvanger/film/neem-verdelger-op.mjs
bash sites/belvanger/film/monteer-verdelger.sh
```

Er hoeft geen server naast te draaien: het opnamescript start er zelf een op een vrije
poort en zet hem daarna weer uit. `ffmpeg` moet in het PATH staan, of zet `FF=` naar
een eigen build.

Alleen een kaarttekst gewijzigd? Dan nog steeds allebei de commando's: de opname duurt
tien seconden langer dan strikt nodig, en dat is goedkoper dan uitzoeken welke frames
verouderd zijn.

## Gotchas

Opgeschreven op het moment dat ze gebeurden.

### Over het genereren

- **Seedance 2.5 zit niet meer op 720p vast.** De skill zegt van wel, en die regel is
  hier achterhaald: het formulier bood op 2026-08-21 gewoon 1080p aan, tot 30 seconden.
  Kijk in `openart_model_form_get` voordat je op een onthouden versieregel afgaat.
- **2.5 heeft geen `aspectRatio`.** De verhouding komt uit het startframe. Lever dus een
  9:16 frame aan, anders krijg je 9:16 nooit.
- **Prijzen lopen niet lineair met de resolutie, wel met de duur.** Bij 2.0 op 8s kost
  1080p 1.600 en 720p 640, een factor 2,5. Bij 2.5 op 10s kost 1080p 3.210 en 480p 605,
  een factor 5,3. Een geschatte prijs was hier 60% te laag; vraag `openart_model_cost`
  op met de exacte configuratie in plaats van te rekenen met ratio's uit een skill.
- **Een gestarte render kan niet geannuleerd worden.** Deze koppeling heeft er geen
  gereedschap voor. Promoveer dus pas naar de dure resolutie als het IDEE is
  goedgekeurd, niet als alleen de uitvoering is goedgekeurd. Dat kostte hier 1.600
  credits.
- **De twee "onmogelijke" dingen bleken mogelijk.** Een bijna-valpartij (kracht) en een
  zwerm wespen over een gezicht (kleine snelle objecten op de plek waar het gezicht
  leesbaar moet blijven) zijn allebei klassen waar dit model volgens eerdere ervaring
  op breekt. Allebei hielden ze stand op de eerste poging. De vuistregel blijft goed,
  maar toets hem één keer voor 605 credits in plaats van het idee te laten vallen.
- **2.5 levert HEVC 10-bit terug**, geen h264. De montage rekent dat om naar
  `yuv420p` h264; ga er niet van uit dat je het bestand ergens rechtstreeks in kunt
  plakken.
- **Het gesproken woord landt aan het eind van de gevraagde duur.** "Mooi" viel op
  9,3s van 10s, met 0,3s over. Vraag een seconde meer aan dan je nodig denkt te hebben,
  of laat de montage het laatste frame een halve seconde bevriezen, zoals hier.

### Over de montage

- **De opname haalt de 25 fps niet.** Een screenshot kost tijd: 258 beoogde frames
  werden er 225 tot 239, afhankelijk van hoe druk de machine het had. Zonder correctie
  speelt de simulatie 8 tot 13% te snel. Het opnamescript **meet** daarom de echte
  invoersnelheid en schrijft hem naar `opname.env`; de montage leest die en zet hem op
  `-framerate`. Nooit een vaste 25 aannemen.
- **Meet ook de duur van act 1.** De eerste take was 7 seconden, de tweede 10. Een
  vaste `-t 7` in de montage had het gesproken slotwoord er zonder waarschuwing
  afgeknipt. De montage vraagt de duur nu op met `ffprobe`.
- **`loudnorm` in één doorgang schat, en die schatting was hier 1,2 LU mis met een true
  peak van -0,8 dBFS.** Te dicht op nul voor de hercodering van Facebook. Meet eerst
  (`print_format=json`), voer de gemeten waarden terug in, en normaliseer dan pas.
- **`loudnorm` schakelt zelf naar 192 kHz**, waardoor er een bestand van 96 kHz
  uitrolt. Zet `-ar 48000` expliciet.
- **`amix` halveert standaard elk kanaal.** Zonder `normalize=0` zakt de hele film weg
  zodra het geluid van act 1 erbij gemengd wordt.
- **Een shellscript dat JSON moet lezen, heeft daar een tweede taal voor nodig.** Het
  opnamescript schrijft daarom naast `opname.json` ook een `opname.env` met dezelfde
  meting, zodat de montage kan volstaan met `. ./opname.env`.
- **Bash rekent niet met kommagetallen.** Voor 10,048 + 0,5 is `awk` nodig.

### Over de opname

- **Wacht op de INHOUD, niet op de pagina.** Het script wacht tot het woord
  "wespennest" echt in de bubbel staat. Wacht je alleen op `networkidle2`, dan film je
  vrolijk de installateurs-casus als de vakvariant stilletjes niet aanslaat.
- **Webfonts laden na het screenshot.** `document.fonts.ready` afwachten, anders staat
  de kaart in Georgia en Arial op het frame en zie je dat pas in de gemonteerde film.
- **De site staat in CRLF.** Een script dat met een anker vol `\n` zoekt, vindt niets
  en meldt geen fout. Normaliseer eerst en zet de regeleindes daarna terug.

## Nog te doen in een ander bestand

`.claude/skills/seedance-video/SKILL.md` staat op de branch
`claude/seedance-2.5-research-jffb6p` en niet in deze werkmap, dus de correcties uit
deze film staan er nog niet in. Als die branch samengevoegd wordt, horen er drie
dingen bij:

1. De versieregel klopt niet meer: 2.5 biedt 1080p en gaat tot 30 seconden.
2. De prijsratio's in de skill zijn te grof. Vraag de exacte configuratie op.
3. De regel "schrijf geen shot rond een bekend zwak punt" is een vuistregel en geen
   wet. Een fysieke mislukking en een wespenzwerm over een gezicht hielden allebei
   stand. Toets zo'n idee één keer op 480p in plaats van het te laten vallen.

## Open beslissing

Er is bewust **geen negende voorbeeldpagina** voor ongediertebestrijding gebouwd. Komt
er een verdelger in beeld die dit echt gaat zien, dan is dat het moment: dan ziet hij
zichzelf terug in een eigen vakkleur, en dan pas verdient die pagina zijn plek in de
galerij en in de vakkenstrip op de homepage.
