# Belvanger promotiefilm "Opgevangen" — draaiboek en montage

> **De film is af en gemonteerd:**
> [`sites/belvanger/film/belvanger-opgevangen-1080x1920.mp4`](../../sites/belvanger/film/belvanger-opgevangen-1080x1920.mp4)
> 31,0 seconden, 1080×1920, h264 + aac, 9,8 MB. Klaar om te versturen.
>
> Volledig automatisch reproduceerbaar met `sites/belvanger/film/monteer.sh` en
> `neem-simulatie-op.mjs`. Er is dus geen handmatige montage in CapCut nodig; die
> route staat onderaan nog beschreven als terugvaloptie.

**Datum:** 2026-07-25
**Formaat:** 9:16 verticaal, 1080×1920, 25 fps, 31 seconden
**Kanaal:** 1-op-1 in een DM naar een warm contact (WhatsApp/Messenger)
**Geen voice-over, geen muziekbed.** Regen, een rinkelende telefoon en de tekst dragen
de film. Luidheid genormaliseerd naar EBU R128 (-16 LUFS, true peak -1,5 dBTP), want
zonder dat klinkt hij op een telefoon veel te zacht.

## De uiteindelijke montage

| Filmtijd | Beeld | Geluid | Bron |
|---|---|---|---|
| 0 - 10s | Twee vieze handschoenen op de natte steigerbuis, regen, telefoon rinkelt buiten bereik op de plank. Rond de tiende seconde stopt het rinkelen | regen op metaal + ringtone | Seedance 2.0, 15s image2video **met geluid**, vanaf `frames/A2-a.png` |
| 10 - 21s | De simulatie vanaf "Gemiste oproep · 14:32" t/m "Je eigen website ving 'm mee op" | regenbed, zachter | frame-reeks van het opnamepodium, 1080×1920 |
| 21 - 25s | "Dat gesprek had je nooit gehad." | regenbed, uitfadend | `frames/tekstkaart-1.png` |
| 25 - 31s | "Opgevangen. Zonder dat je iets deed." + zachte vraag + woordmerk | stil aan het eind | `frames/tekstkaart-2.png` |

Het geluid loopt door over alle vier de delen, zodat de film als één geheel voelt. Het
rinkelen dat rond de tiende seconde stopt en overgaat in alleen regen ís de emotionele
beweging: dat is het moment waarop de klant zou zijn afgehaakt.

## De kernkeuze

Er zijn twee dingen die deze film moet doen, en ze hebben elk een andere bron nodig:

- **Het lichaam.** Laten voelen dat je niet kunt opnemen. Dat kan een browsermockup
  niet. Hiervoor zijn drie gegenereerde werkplaatsbeelden gemaakt.
- **Het bewijs.** Leesbare tijdstempels die aantonen dat het vangnet werkte. Dat kan AI
  niet: videomodellen renderen geen exacte tekst, dus `14:02:11` wordt onherroepelijk
  verhaspelde pseudo-tekst. Hiervoor wordt de **echte simulatie** van de homepage
  opgenomen.

Ze mogen elkaar niet beconcurreren. Te veel heen en weer knippen tussen die twee maakt
beide zwakker, dus act 1 is volledig lichaam en act 2 is volledig bewijs.

## Wat er klaar staat

| Onderdeel | Waar |
|---|---|
| **De gemonteerde film, 31s** | `sites/belvanger/film/belvanger-opgevangen-1080x1920.mp4` |
| Montagescript (ffmpeg), reproduceert de film | `sites/belvanger/film/monteer.sh` |
| Opnamescript voor de simulatie (frame-reeks, 1080×1920) | `sites/belvanger/film/neem-simulatie-op.mjs` |
| Opnamepodium voor de simulatie (9:16, schermvullend, geen sitechrome) | `sites/belvanger/site/film-opnamepodium.html` |
| Tekstkaarten-pagina (echte merkletters) | `sites/belvanger/site/film-tekstkaarten.html` |
| Storyboardframes, 1536×2752 | `sites/belvanger/film/frames/A1-a.png`, `A2-a.png`, `A3-a.png` (plus `-b` varianten) |
| Act 1, 15s **met geluid** | `sites/belvanger/film/clips/act1-steiger-15s-audio.mp4` |
| Act 2, de simulatie, 15s | `sites/belvanger/film/clips/act2-simulatie-15s.mp4` |
| Losse stille clips van 5s (niet in de eindmontage gebruikt) | `sites/belvanger/film/clips/clip-A1..A3*.mp4` |

## Opnieuw maken of aanpassen

De film is volledig reproduceerbaar. Wil je een andere tekstkaart, een andere lengte of
een ander tempo: pas het bestand aan en draai het script opnieuw, in plaats van handmatig
te knippen.

```bash
# 1. Serveer de site lokaal (nodig voor de simulatie en de tekstkaarten)
cd sites/belvanger/site && python -m http.server 18300 --bind 127.0.0.1

# 2. Neem de simulatie op als frame-reeks (levert sim-frames/)
node sites/belvanger/film/neem-simulatie-op.mjs

# 3. Monteer alles tot de eindfilm
SP=<pad naar de map met de clips en frames> bash sites/belvanger/film/monteer.sh
```

`monteer.sh` verwacht ffmpeg in `$SP/ffmpeg/...`. Er is bewust niets op de machine
geïnstalleerd: een statische build in een tijdelijke map volstaat en laat de laptop
ongemoeid.

---

# Terugvalroute: handmatig monteren

> Alles hieronder is de **oorspronkelijke handmatige route**, voor het geval de scripts
> niet werken of je op een andere machine zit. De tijden in deze route horen bij een
> montage van drie losse clips van 5 seconden en wijken dus af van de tabel bovenaan.
> **De gemonteerde film hierboven is de geldende versie.**

## Stap 1: de simulatie opnemen

De simulatie **speelt zichzelf af** zodra hij in beeld komt, en dat gebeurt op het
opnamepodium direct bij het laden. Je hoeft dus geen knop in beeld aan te tikken.

1. Open `film-opnamepodium.html` op je telefoon.
2. Tik één keer ergens op de pagina. Dat is nodig om het geluid vrij te geven:
   browsers laten audio pas toe na een gebaar. Zonder die tik speelt hij stil.
3. Start de schermopname van je telefoon.
4. **Herlaad de pagina.** De simulatie begint na ongeveer 1 seconde vanzelf.
5. Stop de opname een paar seconden nadat "Je eigen website ving 'm mee op" staat.

De bedieningsbalk verdwijnt zodra de simulatie start en komt niet terug, dus hij staat
nooit in je opname. Wil je opnieuw opnemen: pagina herladen.

Met `?safe=1` achter de URL zie je de zones die Facebook en Instagram met hun interface
bedekken (bovenste 15%, onderste 20%). Handig om te controleren, en die overlay komt
nooit in een normale opname.

## Stap 2: de tijdlijn

Alle tijden hieronder zijn vanaf het moment dat de simulatie begint te rinkelen. Ze zijn
letterlijk uit `sites/belvanger/site/js/app.js` gehaald, dus dit klopt met wat je opneemt.

| Filmtijd | Beeld | Bron | Toelichting |
|---|---|---|---|
| 0,0 - 2,5s | Telefoon op de bestofte werkbank, scherm licht op | clip A1 | Het probleem in frame één. Geen logo, nooit een logo |
| 2,5 - 5,5s | Twee vieze handschoenen op de natte steigerbuis, telefoon buiten bereik op de plank | clip A2 | Dit is de "waarom hij niet opneemt" |
| 5,5 - 8,0s | Het scherm gaat uit | clip A3 | **De belangrijkste seconde van de film.** Dit is het verlies. Laat hem hangen, knip niet te snel weg |
| 8,0 - 21,0s | De simulatie, ononderbroken | schermopname | Niet knippen. De onthulling (14 woningen) doet het werk zonder één woord uitleg |
| 21,0 - 26,0s | Tekstkaart 1 | montage | "Dat gesprek had je nooit gehad." |
| 26,0 - 32,0s | Tekstkaart 2 + afsluiting | montage | "Opgevangen. Zonder dat je iets deed." |

**Het geluid van act 1 komt uit act 2.** De simulatie synthetiseert drie ringtonen bij
het begin. Trek die audio los in de montage en leg hem onder clips A1, A2 en A3. Je
hóórt de telefoon dan gaan terwijl je zíet dat hij niet kan opnemen, en op het moment
dat het scherm uitgaat valt het geluid weg. Dat is de hele emotionele beweging van de
film, in geluid.

## Stap 3: de tekstkaarten

Maak deze in de montage, niet met AI: AI rendert geen betrouwbare Nederlandse tekst.
Gebruik de merkletters (Fraunces voor de kop, Archivo voor de rest) op `#0E1A24`.

> **Dat gesprek had je nooit gehad.**

> **Opgevangen. Zonder dat je iets deed.**
>
> Ken je iemand die dit kan gebruiken? Stuur me een appje.

Geen prijs in beeld. Dat is bewust: het kanaal is een persoonlijke DM en jouw
voice-memo-script doet daar het echte verkoopwerk. Zie
`belvanger-voice-memo-scripts-2026-07-24.md`.

**Ingebrande ondertitels zijn niet optioneel.** Deze film wordt gedempt bekeken. Gebruik
niet de automatische ondertiteling van het platform: die is in het Nederlands
onbetrouwbaar en wordt afgekapt. En houd alle tekst weg uit de bovenste 15% en onderste
20% van het frame.

## Stap 4: monteren

Zonder ffmpeg op de werkmachine kan de montage niet geautomatiseerd worden. Doe hem in
CapCut op je telefoon, ongeveer een half uur:

1. Nieuw project, 9:16.
2. Clips A1, A2, A3 achter elkaar, ingekort tot de duur in de tabel.
3. Schermopname erachter, het begin eraf tot het moment dat "Gemiste oproep · 14:32"
   verschijnt.
4. Audio van de schermopname losmaken en het rinkel-deel onder A1/A2/A3 leggen.
5. Twee tekstkaarten aan het eind.
6. Exporteren op 1080×1920.

Optioneel: een zachte regen- of werkplaatsambience onder act 1 uit een gratis bibliotheek.
Bewust géén AI-audio gegenereerd, omdat die zou vechten met de ringtonen uit de simulatie.

## Het anti-reclame charter

Dit staat hier omdat het de reden is dat deze film werkt bij deze doelgroep. Persona 2
(Sanne-type) is al eens door een bureau belazerd; alles wat naar bureau ruikt kost je
haar in drie seconden. Elk gegenereerd beeld is op deze regels geprompt:

- **Nooit een gezicht.** Handen, onderarmen, ruggen. Gezichten zijn waar AI onheilspellend
  wordt en waar "stockmodel" gaat schreeuwen.
- **Alleen bestaand licht.** Grijs raamlicht, bewolkte lucht. Geen gouden uur, geen rimlicht.
- **Vuil is verplicht.** Stof, krassen, vingerafdrukken, plamuurspatten. Smerigheid is het
  sterkste anti-stocksignaal dat er is.
- **Camera staat vrijwel stil.** Geen dolly, kraan, drone of orbit.
- **Koel en ontzadigd.** Geen teal-oranje grade.
- **Geen logo tot de laatste seconden.** Een merkintro op 32 seconden kost ongeveer 40%
  van je kijkers.
- **`autoEnhancePrompt` uit.** Die maakt beelden juist gladder, precies het risico dat
  hier beheerst moet worden.

## De eerlijkheidsgrens

Onder de simulatie staat al, en dat blijft in beeld in de film:

> Voorbeeld ter illustratie, geen echte klant.

Dat is niet cosmetisch. Zonder die regel is een gefilmd gesprek over een klus van 14
woningen een verzonnen casus, en dat is precies wat bij deze doelgroep onherstelbaar is.
Om dezelfde reden is er **geen** gegenereerde vakman gemaakt die de dienst aanbeveelt:
dat zou een verzonnen aanbeveling zijn. De gegenereerde beelden tonen alleen een
situatie, nooit een persoon die iets beweert.

Zodra er een echte klant met een echt opgevangen gesprek is, vervangt die opname de
simulatie en mag de disclaimer eraf. Dat is dan een aantoonbaar sterkere film, en het is
de reden om deze versie als versie 1 te behandelen en niet als eindpunt.

## Gotchas

- **Videomodellen renderen geen leesbare tekst.** Elk tijdstempel en elke Nederlandse
  UI-tekst moet uit een echte schermopname of uit de montage komen. Dit is geen
  promptprobleem.
- **De simulatie speelt automatisch af bij in beeld komen.** Tijdens het verifiëren bleek
  een klik op de startknop een no-op omdat er al een afspeelbeurt liep (`if (playing) return`).
  Wie de timing meet vanaf zijn eigen klik, meet fout.
- **`app.js` haalt aan het EIND `is-live` weer van de bedieningsbalk**, waardoor de knop
  precies terugkomt in het slotframe: het beeld dat je wil gebruiken. Het opnamepodium
  latcht daarom op de afspeelstatus en houdt de balk permanent weg.
- **Gebruik `zoom` en niet `transform: scale()`** om de simulatie op te schalen. Met een
  transform kan de browser de kleine versie rasteren en daarna oprekken, en dan is
  precies het enige wat deze film moet bewijzen onleesbaar.
- **De `serveStatic`-MIME-map moet `.png` en `.webmanifest` kennen** (geldt voor het
  dashboard, niet voor deze statische site). Zie `sites/belvanger-portal/ANDROID.md`.
- **Seedance `startFrame` eist volledige metadata inclusief `file_size_bytes`.** Een
  CDN-URL doorgeven is niet genoeg; haal de referentie op met
  `openart_upload_metadata_get` en geef die door.

## Begeleidende Facebook-tekst (vervolgpost)

Er is al een eerste bericht over Belvanger geplaatst, dus dit is een **vervolgpost**:
kort, en zonder opnieuw uit te leggen wat Belvanger is. Past binnen de vastgelegde lijn
uit `belvanger-facebook-stappenplan-2026-07-24.md`: persoonlijk profiel, bouwen in het
openbaar, vragen om doorverwijzingen in plaats van verkopen.

**Versie A, aanbevolen** (legt de verbinding met de vorige post, en dat is wat
bouwen-in-het-openbaar verkoopt):

> Ik zei dat ik iets aan het bouwen was voor vakmensen die belletjes mislopen.
>
> Dit is het, in 30 seconden. Geluid aan.
>
> Voorbeeld ter illustratie, geen echte klant. Bij jou draait het op je eigen nummer.
>
> Ken je een loodgieter, dakdekker of installateur die dit kan gebruiken? Stuur me even
> een appje.

**Versie B**, sterkere hook maar leest meer als een losse advertentie:

> Zo ziet het eruit als je een klant mist en hem toch niet kwijt bent.
>
> 30 seconden, geluid aan.
>
> Voorbeeld ter illustratie, geen echte klant.
>
> Ken je iemand voor wie dit zou schelen? Appje is genoeg.

**Versie C**, kortst:

> Beloofd is beloofd: Belvanger in 30 seconden. Geluid aan.
>
> Voorbeeld ter illustratie, geen echte klant.
>
> Ken je een vakman die dit kan gebruiken? Laat het me weten.

### Regels die bij deze post horen

- **"Geluid aan" hoort erin.** Facebook speelt gedempt af, en het geluid draagt deze
  film: het rinkelen dat rond de tiende seconde stopt en overgaat in alleen regen ís het
  moment van verlies.
- **Geen prijs in de post.** Filtert scherper dan je wil terwijl het doel doorverwijzing
  is. Het bedrag geef je meteen zodra iemand ernaar vraagt, met de risico-omkering; zie
  het antwoord hieronder.
- **Geen uitgaande link.** Facebook onderdrukt bereik van posts met een link, en het
  gesprek hoort in Messenger te blijven waar het voice-memo-script het werk doet.
- **Video native uploaden**, niet als YouTube-link.
- **De disclaimer blijft staan, ook in de korte versie.** Zonder die regel maakt de post
  de claim die de film zorgvuldig vermijdt: een gefilmd gesprek over 14 woningen kan
  anders als echte casus gelezen worden.

### Klaarliggend antwoord op "wat kost het?"

Letterlijk de getallen uit het geteste script
(`belvanger-voice-memo-scripts-2026-07-24.md`), zodat er niet in het moment
geïmproviseerd hoeft te worden:

> Eenmalig vanaf 625 euro om alles op te zetten, dat is de founding-prijs voor de eerste
> bedrijven, normaal 1.250. Daarna 99 per maand, voor jou levenslang vast. En het
> belangrijkste: die eerste maand betaal je pas zodra het systeem echt een gemiste
> oproep heeft opgevangen. Dus niet eerst betalen en hopen dat het werkt. Eerst werken,
> dan pas betalen. Dat kan ik ook aantonen, je ziet het met tijdstempel terug in je
> eigen overzicht.

### Niet in vakgroepen plaatsen

In de meeste ondernemers- en vakgroepen wordt een video over je eigen dienst verwijderd
of genegeerd. Daar werkt eerst nuttig zijn. Plaats daar zonder video en zonder aanbod:

> Vraag aan de vakmensen hier: hoeveel klanten denk je dat je per maand misloopt omdat
> je simpelweg niet kon opnemen? En doe je daar iets mee, of neem je het erbij?
>
> Ik vraag het omdat ik hier iets voor aan het bouwen ben en wil weten of ik het
> probleem goed zie, of dat het meevalt.

Dat levert gesprekken en inzicht op in plaats van een verwijderde post, en het is
tegelijk het validatiegesprek dat volgens `CURRENT_STATE.md` nog open staat.
