# Belvanger showcasefilm "Elk vak zijn eigen website": draaiboek en montage

> **De film is af en gemonteerd:**
> [`sites/belvanger/film/belvanger-showcase-1080x1920.mp4`](../../sites/belvanger/film/belvanger-showcase-1080x1920.mp4)
> 29,68 seconden, 1080x1920, 25 fps, h264 + aac, 14,9 MB.
>
> Volledig automatisch reproduceerbaar met `neem-showcase-op.mjs`, `maak-geluid.mjs`
> en `monteer-showcase.sh`. Er komt geen handmatige montage aan te pas.

**Datum:** 2026-07-28
**Formaat:** 9:16 verticaal, 1080x1920, 25 fps, 29,68 seconden
**Kanaal:** Facebook/Instagram en 1-op-1 in een DM
**Geluid:** gesynthetiseerd, geen muziekbed. Luidheid EBU R128 op -16,2 LUFS,
true peak -1,4 dBTP (gemeten, niet aangenomen).
**Kosten:** nul. Geen credits, geen gegenereerd beeld, geen stockmateriaal.

## Waarom deze film naast "Opgevangen" bestaat

`belvanger-promotiefilm-opgevangen-2026-07-25.md` is de **probleemfilm**: emotie,
geen product. Deze is de **vakmanschapsfilm**: hij laat zien wat iemand voor 625 euro
krijgt. Twee verschillende taken, dus twee films, en ze zijn bewust hetzelfde formaat
zodat ze als setje verstuurd kunnen worden: eerst het probleem, dan het bewijs.

De grondstof is honderd procent echt. Elk beeld in deze film is een opname van de
site die vandaag draait. Er is geen enkele shot die iets toont wat niet bestaat, en
dat is bij deze doelgroep (persona 2 is al eens door een bureau belazerd) het
verschil tussen geloofwaardig en weggeklikt.

## Het idee

De zeven voorbeeldpagina's hebben dezelfde opbouw en dezelfde vaste balk onderin,
maar elk in zijn eigen vakkleur. Dat is een cadeau voor een monteur: **zeven keer
dezelfde compositie, zeven verschillende werelden.** Op die herhaling kun je hard
snijden, en dan bouwt het ritme vanzelf op.

De rode draad is de **belknop**. Elke pagina eindigt in "Bel direct: 0xx ...". Zeven
keer die knop, en dan de omslag: de klant bélt ook echt, alleen sta jij op de steiger.
Daarmee zijn "mooie website" en "leadvangst" niet twee losse verkoopargumenten meer
maar één beweging.

## De montage

| Filmtijd | Duur | Beeld | Geluid |
|---|---|---|---|
| 0,00 - 2,44 | 2,44s | Opening: de verfscène van de schilderpagina. **Met de hooklaag eroverheen**: klein woordmerk plus "Dit is een website." / "Gebouwd voor een schilder." | ruimtetoon, twee zachte tikken |
| 2,44 - 4,52 | 2,08s | Kaart: "Elk vak zijn eigen website." + de zeven vakken bij naam | klap op de snede |
| 4,52 - 12,80 | 8,28s | De zeven vakken, elk landend op de gekleurde belknop | een lage klap op elke snede |
| 12,80 - 16,80 | 4,00s | **Het aanvraagformulier wordt ingevuld.** Naam, telefoonnummer, de vraag, en de knop wordt ingedrukt | toetsklikjes, dan een doffe tik op de knop |
| 16,80 - 18,40 | 1,60s | Inkomende oproep, "Jij staat op de steiger..." | de telefoon rinkelt twee keer |
| 18,40 - 20,40 | 2,00s | Kaart: "Alles komt op *één plek* binnen." / "Een ingevuld formulier, of een oproep die je miste." | **stilte**: het rinkelen is weg |
| 20,40 - 24,00 | 3,60s | **Het dashboard**, van "Deze periode bespaard: € 600" met de onderbouwing tot de tijdlijn waar de sms, de gemiste oproep en de websiteaanvraag onder elkaar staan | klap, dan twee tonen als de tijdlijn in beeld komt |
| 24,00 - 26,40 | 2,40s | **De telefoon met de pushmeldingen**: "Nieuwe aanvraag via je website" en "Je hebt een oproep gemist" | twee meldingstonen |
| 26,40 - 29,68 | 3,28s | Slotkaart: "Gemist. *Toch binnen.*" + woordmerk + de eerlijkheidsregel | laatste klap, dan uitfaden |

**De omslag zit op 18,40.** Daar knipt de film weg van de rinkelende telefoon en valt
het geluid stil. Er staat bewust géén klap op die snede: de stilte ís het moment waarop
de klant normaal weg was.

## Het formulier: eerst gebouwd, toen gefilmd

De film ging eerst over de sms-conversatie na een gemiste oproep. Dat is er nu uit,
want het sterkste verhaal is de eigen website mét een aanvraagformulier. Alleen: **dat
formulier bestond nog niet.** De zeven voorbeeldpagina's beloofden "automatische
leadvangst" en lieten alleen een telefoonnummer zien, dus een bezoeker die niet wilde
bellen had geen enkele manier om contact te leggen.

Dat is dus eerst gebouwd en pas daarna gefilmd. Op alle zeven pagina's, in de eigen
vakkleur, onderaan de contactsectie. **Geen `<form>` en geen JavaScript**: die pagina's
draaien bewust op nul JS, en een fictief voorbeeldbedrijf hoort niets te versturen. Losse
velden met een `button type="button"` zien er identiek uit en houden die regel intact.
Geverifieerd op 432px en 1440px: geen overflow, geen consolefouten, knop in de juiste
vakkleur op alle zeven.

Drie dingen maken de shot geloofwaardig:

- **Het typen wordt uitgerekend, niet getypt.** Op filmtijd t staat er het eerste n-de
  deel van de tekst. Echt typen met `page.type()` heeft een variabele snelheid en levert
  bij elke opname een andere film op.
- **De focusrand verhuist mee** naar het veld dat gevuld wordt. Zonder dat verschijnt er
  tekst zonder dat iets aangeeft waar, en dat leest als een storing.
- **De ingevulde gegevens zijn niet verzonnen.** Sanne Bakker is exact de websiteaanvraag
  die even later in het dashboard staat (zie de demo-data in `product/chatbot/server.js`).
  De film is daardoor één doorlopend verhaal: je ziet dezelfde aanvraag binnenkomen.

Er is bewust **geen "verzonden"-scherm**. De snede naar het dashboard ís de verzending;
een bevestigingsscherm zou iets tonen wat de voorbeeldpagina niet doet.

## De pushmelding

Een echte pushmelding komt op een fysiek toestel binnen en is niet headless op te nemen,
dus het vergrendelscherm is nagebouwd in `site/film-melding.html`. De **teksten zijn
niet verzonnen**: ze staan letterlijk zo in `sites/belvanger-portal/src/server.js`
("Nieuwe aanvraag via je website" / "Tik om de aanvraag te bekijken." en "Je hebt een
oproep gemist" / "Tik om te zien wie er belde en terug te bellen."). Verandert die tekst
daar, dan moet hij hier mee, anders belooft de film iets anders dan het product doet.

## Het dashboard

De klant koopt vier dingen: een website, leadvangst, een chatbot en een dashboard. De
shot loopt van de besparing bovenaan tot de tijdlijn "Laatste activiteit", waar de sms,
de gemiste oproep en de websiteaanvraag onder elkaar staan. Dat rijtje is het bewijs van
de kaart ervoor.

**De shot begint op de besparing mét de onderbouwing in beeld.** "€ 600" alleen zou een
claim zijn. Het dashboard zet er zelf onder: schatting op basis van 4 opgevangen gemiste
oproepen x € 250 indicatieve klus-waarde x 60% kans op een klus. Die regel is op
videoformaat gecontroleerd en leesbaar. De oranje balk "Voorbeelddata, geen echte klant
of gegevens" is sticky en staat de hele shot in beeld.

Om het dashboard te kunnen filmen moet de **app-server** draaien en niet alleen een
statische server: de demo haalt haar fictieve data op bij `/dashboard-demo/api/*`.

## Afwerking: vignet en filmkorrel

Uit de finishing-richtlijn van de `scroll-film-studio` skill: *film grain + vignette sell
the "one shot" feel*. Dat is hier precies het probleem, want dit zijn negentien aan
elkaar geplakte schermopnames en zonder die laag zien ze er ook zo uit.

- **Vignet over alles.** Kost vrijwel geen bitrate en het is het deel dat de losse
  opnames als één stuk laat voelen.
- **Korrel alleen op de gefilmde delen**: de verfscène en de zeven hero's. Dat is waar
  hij hoort; de simulatie, het dashboard en de tekstkaarten zijn schérmen, en een scherm
  heeft geen filmkorrel.
- **Een lichtveeg over de kop van elke tekstkaart**, één keer, op 22% sterkte.

Bewust géén glitch, bloom of chromatische aberratie. Alles wat naar bureau ruikt kost bij
deze doelgroep de kijker, en dat is precies de doelgroep die de film moet overtuigen.

## De eerste versie was onbegrijpelijk, en waarom

Versie 1 opende 2,4 seconden op een muur zonder tekst, zette de uitlegkaart NA de zeven
vakken op 11,6s, en toonde het merk pas op 22s. De founder keek hem en zei: geen flauw
idee waar dit over gaat. Terecht. Wat een koude kijker zag was een advertentie van een
schildersbedrijf die daarna zonder aanleiding overging in een loodgieter.

De oorzaak was een overgenomen regel. Het anti-reclame charter van "Opgevangen" (geen
logo, geen uitleg, laat het beeld het werk doen) is geschreven voor een **DM aan een warm
contact**, waar jij zelf de introductie bent. Koud in een tijdlijn is die introductie er
niet, en dan levert datzelfde charter een film over niets op. Drie reparaties:

1. **Een hooklaag over de openingsshot.** Twee regels die zeggen waar je naar kijkt,
   vanaf frame één. Geen woordspeling: gedempt en al scrollend wint direct het altijd
   van slim.
2. **Claim vóór bewijs.** De kaart "Elk vak zijn eigen website" staat nu vóór de zeven
   vakken in plaats van erna, met de vakkenlijst erbij zodat de kijker zichzelf herkent.
3. **Klein woordmerk vanaf frame één.** Geen merkintro over het hele scherm, wel genoeg
   dat duidelijk is wie er praat.

De regel die hieruit volgt: **weet de kijker binnen twee seconden wie er praat en waarom
hij kijkt?** Zie ook `docs/LEARNINGS.md`, 2026-07-28.

## De vijf keuzes die het verschil maken

**1. De scroll wordt bestuurd, niet gefilmd.** Een mens die met zijn vinger scrollt
levert schokkerige, onherhaalbare beweging. Hier zit op elke shot een gekozen
versnellingscurve (`easeOutCubic` voor de hero's, `easeInOutSine` voor de verfscène) en
is elk frame een aparte 1080x1920-render. Dat is het verschil tussen "een filmpje van
een website" en montage.

**2. De duur van de shots loopt terug.** 1,44s, 1,32s, 1,20s, 1,08s, 0,96s, 0,88s en
dan weer 1,40s. Versnellen bouwt spanning op; de laatste shot landt langer, zodat het
oog rust krijgt vlak voor de tekstkaart. De klappen in het geluid staan op dezelfde
sneden, dus het ritme is hoorbaar én zichtbaar.

**3. De eindstand van elke hero-shot wordt gemeten, niet gekozen.** Elke hero is anders
hoog. Een vaste scrollafstand laat de belknop bij het ene vak netjes landen en bij het
andere buiten beeld vallen. Het script meet per pagina waar `.hero a[href^="tel:"]`
staat en berekent de scroll die hem op 62% van de beeldhoogte zet. Met een ondergrens
van 190px, want een stilstaande shot tussen zes bewegende leest als een hapering.

**4. Harde sneden, geen overvloeiers.** Een kruisvervaging tussen twee websites leest
als een diavoorstelling. Een harde snede op dezelfde compositie leest als montage.

**5. Twee compressieniveaus.** Op één vaste CRF werd de film 20 MB, en boven ongeveer
16 MB hercodeert WhatsApp zelf. De hero's zijn bewegende foto's (CRF 26, daar ziet
niemand het), de simulatie en de kaarten zijn vlakke vlakken met kleine letters
(CRF 18). Het tijdstempel "14:32" is het enige harde bewijs in de film, dus dat krijgt
de bitrate. Geverifieerd op een uitsnede van het eindbestand: scherp.

## Wat er klaar staat

| Onderdeel | Waar |
|---|---|
| **De gemonteerde film, 25,96s** | `sites/belvanger/film/belvanger-showcase-1080x1920.mp4` |
| Opnamescript (7 sites + kaarten + simulatie) | `sites/belvanger/film/neem-showcase-op.mjs` |
| Geluidsscript (synthese, geen samples) | `sites/belvanger/film/maak-geluid.mjs` |
| Montagescript (ffmpeg) | `sites/belvanger/film/monteer-showcase.sh` |
| Kinetische tekstkaarten (scrubbaar) | `sites/belvanger/site/film-showcase-kaarten.html` |
| Opnamepodium voor de simulatie (bestond al) | `sites/belvanger/site/film-opnamepodium.html` |

## Opnieuw maken of aanpassen

```bash
# 1. Serveer de site lokaal
cd sites/belvanger/site && python -m http.server 18301 --bind 127.0.0.1

# 2. Neem alles op (in een lege werkmap met puppeteer-core geinstalleerd)
npm i puppeteer-core
node <pad>/sites/belvanger/film/neem-showcase-op.mjs ./showcase-frames

# 3. Monteer
bash <pad>/sites/belvanger/film/monteer-showcase.sh
```

Alleen een tekst gewijzigd? Neem dan alleen de kaarten opnieuw op in plaats van de
hele sessie; dat scheelt een paar minuten. De frames van de zeven sites blijven geldig
zolang die pagina's niet veranderen.

## Het geluid

Er is bewust **geen muziek**. Bij deze doelgroep is een muziekbed het snelste signaal
dat er een bureau aan te pas kwam. Wat er wel is:

- Een lage ruimtetoon (bruine ruis, zwaar afgevlakt). Zonder dit klinken de gaten
  tussen de tonen als een kapot bestand.
- Een lage klap op elke montagesnede. Dat is de hartslag onder de zeven vakken.
- De **echte** tonen uit `js/app.js`: 480/620 Hz voor de tweetoons-beltoon, 880 Hz
  voor een bericht, 660+880 voor een binnenkomende lead. De film laat dus ook in
  geluid niets horen wat de site niet doet.

De ringtone begint 0,66 seconde vóórdat je de telefoon ziet, onder de tekstkaart. Geluid
dat vooruitloopt op het beeld trekt de aandacht terug naar het scherm, en dat is precies
waar je hem wil hebben op het moment dat de gemiste oproep valt.

## De eerlijkheidsgrens

Twee dingen staan in beeld en blijven staan:

- De **VOORBEELD-badge** en de melding "fictief voorbeeldbedrijf" bovenaan elke
  voorbeeldpagina. Die zijn niet weggewerkt. Ze staan in frame één van elke vak-shot
  en schuiven er dan uit, precies zoals een bezoeker ze ook ziet.
- De regel onder de simulatie: "Voorbeeld ter illustratie, geen echte klant", plus
  dezelfde strekking op de slotkaart.

Zonder die twee is een gefilmd gesprek over een klus van 14 woningen een verzonnen
casus. Zodra er een echte klant met een echt opgevangen gesprek is, vervangt die
opname de simulatie en mag de disclaimer eraf. Dat is dan een aantoonbaar sterkere
film, en de reden om deze als versie 1 te behandelen.

## Begeleidende tekst

Dit is een **vervolgpost** binnen de lijn uit `belvanger-facebook-stappenplan-2026-07-24.md`:
persoonlijk profiel, bouwen in het openbaar, om doorverwijzing vragen in plaats van
verkopen.

**Versie A, aanbevolen:**

> Ik liet laatst zien wat er gebeurt als je een belletje mist.
>
> Dit is de andere helft: wat je er precies voor krijgt. Zeven vakken, zeven websites,
> en eronder het vangnet.
>
> De bedrijven in beeld zijn verzonnen voorbeelden. Bij jou draait het op je eigen naam
> en je eigen nummer.
>
> Ken je een schilder, loodgieter of installateur die dit kan gebruiken? Stuur me een
> appje.

**Versie B, korter:**

> Zeven vakken, zeven websites, geen sjabloon. En eronder iets dat je klanten opvangt
> als je niet kunt opnemen.
>
> 26 seconden, geluid aan. Voorbeelden zijn fictief.
>
> Ken je iemand voor wie dit zou schelen?

### Regels die bij deze post horen

- **"Geluid aan" hoort erin.** Facebook speelt gedempt af, en de beltoon die wegvalt is
  de kern van de film.
- **Geen prijs in de post.** Het bedrag geef je meteen zodra iemand ernaar vraagt, met
  de risico-omkering; het klaarliggende antwoord staat in
  `belvanger-promotiefilm-opgevangen-2026-07-25.md`.
- **Geen uitgaande link.** Facebook onderdrukt bereik van posts met een link, en het
  gesprek hoort in Messenger te blijven.
- **Native uploaden**, niet als YouTube-link.

## Gotchas

- **Videomodellen renderen geen leesbare tekst.** Elke Nederlandse regel in deze film
  komt uit een echte schermopname of uit een HTML-kaart met de merkletters. Dat is geen
  promptprobleem maar een eigenschap van de modellen.
- **Een `loading="lazy"` afbeelding die na de voorpas weer buiten beeld ligt, vuurt
  nooit meer `load` of `error` af.** Zonder een race met een tijdslimiet blijft het
  opnamescript daar voorgoed hangen. Hetzelfde geldt voor `requestAnimationFrame` in
  een headless venster.
- **`mktemp -d` geeft op Windows een MSYS-pad (`/tmp/...`) terug dat de native ffmpeg
  als `C:/tmp` leest.** De montage gebruikt daarom een werkmap naast de frames.
- **ffmpeg lost paden in een concat-lijst op ten opzichte van de lijst zelf**, niet ten
  opzichte van de werkmap. Kale bestandsnamen dus.
- **Loudnorm met `LRA=11` maakte het geluid vlak.** De beltoon stak dan nauwelijks boven
  de ruimtetoon uit en het stiltemoment verdween. Op `LRA=16`, met een veel zachtere
  ruimtetoon en hardere tonen, staat de golfvorm goed: gemeten met een venster van 0,25s
  over het eindbestand, niet op gehoor aangenomen.
- **De hero's van de zeven pagina's zijn niet even hoog.** Meet de belknop uit in plaats
  van een vaste scrollafstand te kiezen.
- **`omitBackground` in puppeteer maakt alleen de STANDAARD achtergrond doorzichtig.** Een
  expliciete achtergrond op `html` wordt gewoon geschilderd, en dan is de hele laag zwart.
  De overlay-stand zet de klasse daarom op `documentElement` én `body`.
- **Een zachte vervaging is niet genoeg als er tekst onder ligt.** Twee pogingen lang liep
  het eigen bijschrift van de pagina ("Daarna dekt het in één keer") dwars door de
  hooktekst. Pas bij een volledig dekkende loper vanaf 41% was het weg. Twee teksten over
  elkaar is erger dan geen tekst.
- **Kijk naar het bestand, niet naar het idee.** De laag zag er in de CSS correct uit en
  was dat ook, alleen niet dekkend genoeg. Dat bleek pas door de PNG los over een wit vlak
  te leggen en ernaar te kijken.
- **Filmkorrel is peperduur in h264.** Korrel over de hele film maakte het bestand 135 MB
  in plaats van 13,5 MB: de encoder probeert elk korreltje mee te coderen, en juist op
  vlakke vlakken (tekstkaarten, UI) kost dat het meest. Zet korrel alleen op de gefilmde
  delen, of laat hem weg.
- **Een lichtveeg per tekstREGEL wordt een rechthoek.** `.regel` heeft `overflow: hidden`
  voor de opkomende maskering, en die knipt de veeg af tot een blok met zichtbare randen.
  Zet hem op de hele `h1`.
- **De dashboard-demo heeft de app-server nodig.** Op een kale statische server toont hij
  alleen een loginscherm. Wacht bij het opnemen bovendien op de DATA (`waitForFunction` op
  een bedrag in beeld) en niet op de pagina, anders film je een leeg skelet.
- **Zes van de zeven voorbeeldpagina's staan in CRLF en schilder in LF.** Een script dat
  een regelanker met een harde newline zoekt, matcht dan alleen op schilder. Maak het
  wagenretour optioneel in de expressie.
- **Twee opnamescripts die dezelfde map vullen moeten dezelfde duur aanhouden.** Het losse
  kaartenscript stond nog op 1,6s voor kaart 2 terwijl het hoofdscript al 2,0s gebruikte,
  en overschreef daarmee stilletjes tien frames die de montage wél opvroeg.
- **De simulatie-opname loopt op de wandklok en haalt geen 25 fps.** 14 seconden leverde
  320 frames op in plaats van 350. Dat is 7% versnelling en niet zichtbaar, maar wie op
  een tijdstempel uit `app.js` wil knippen moet op frame-index rekenen en niet op tijd.
