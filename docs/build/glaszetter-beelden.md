# De vier beelden voor de glaszetterspagina

**Datum:** 2026-08-07 · **Status:** gegenereerd, verkleind, ingebouwd en visueel gecontroleerd.

---

## Wat er staat

| Bestand | Formaat | Grootte | Waar het staat |
|---|---|---|---|
| `thumb-glaszetter.webp` | 900×1200 | 78 kB | kaart in de galerij, NL + EN |
| `glaszetter-hero.webp` | 1920×1080 | 108 kB | achtergrond van de hero |
| `glaszetter-werk-1.webp` | 1200×1500 | 112 kB | eerste werkkader, "Winkelpui hersteld · Zwolle" |
| `glaszetter-werk-2.webp` | 1200×1500 | 50 kB | tweede werkkader, "HR++ geplaatst · Kampen" |

Alle vier in `sites/belvanger/site/assets/voorbeelden/`. Ter vergelijking: de bestaande
hero's van de andere vakken zitten tussen 45 en 205 kB, dus dit loopt in de pas.

## Hoe ze gemaakt zijn

**OpenArt, model GPT Image 2, `text2image`, 2k, kwaliteit `high`.** 150 credits per beeld,
600 in totaal. Medium kwaliteit kost 40 en is voor de twee werkkaders waarschijnlijk ruim
genoeg, want die worden klein afgebeeld.

Gemeenschappelijk in alle vier de prompts: fotorealistisch, documentaire vakfotografie,
Noordwest-Europese context, koel blauwgrijs kleurbeeld, **geen tekst, geen logo's, geen
gezichten**. Dat laatste is een keuze: een gezicht op een fictieve voorbeeldsite roept de
vraag op wie dat dan is, en de zeven oudere voorbeelden doen het ook zonder.

- **thumbnail** — gehandschoende handen met twee vacuümzuigers op een ruit, reflectie van
  een bakstenen gevel en bewolkte lucht in het glas, donkere bus erachter. Bewust hetzelfde
  register als `thumb-loodgieter.webp` (handen, gereedschap, ondiepe scherptediepte), zodat
  de kaart in het raster niet uit de toon valt.
- **hero** — glaszetter bij schemer die een ruit in een Nederlandse rijtjeswoning zet.
  **De linkerderde is expres donker en leeg gehouden**, want daar staat de kop overheen.
- **werk-1** — vervangen winkelpui bij schemer, smetteloos glas met Nederlandse gevels
  erin weerspiegeld, warm licht van binnen.
- **werk-2** — nieuw dubbelglas in een wit houten kozijn, van binnenuit, geen condens,
  afstandhouder zichtbaar, heg in de tuin.

## Hoe ze in de repo zijn gekomen, en waarom dat een omweg was

**De egress-policy van de bouwsessie blokkeert `cdn.openart.ai`** — 403 op CONNECT,
bevestigd via `$HTTPS_PROXY/__agentproxy/status`. Dat is een beleidsblokkade, geen storing,
en er is bewust niet omheen gewerkt. Het MCP-kanaal bood geen uitweg: `ListMcpResourcesTool`
geeft alleen UI-widgets terug, geen bestandsbytes.

**Oplossing: de founder heeft ze zelf gedownload en in de sessie geüpload.** Dat is de route
die blijft werken als dit vaker nodig is.

## Twee gereedschappen die hieruit zijn overgehouden

### `tools/beeld-verkleinen.mjs`

Verkleint een afbeelding naar webp zonder ImageMagick of sharp, via een Chromium die er toch
al staat. Reden: de ffmpeg in deze omgeving is gebouwd **zonder webp**, en npm installeren
kan achter een dichte egress niet.

```bash
node tools/beeld-verkleinen.mjs bron.webp doel.webp 1920 82      # breedte, hoogte volgt
node tools/beeld-verkleinen.mjs bron.webp doel.webp 900x1200 82  # vaste maat, snijdt bij
```

Zoekt zelf naar Chrome, Chromium of Edge; met `CHROME_PATH` wijs je hem aan.

### `tools/glaszetter-beelden-inbouwen.mjs`

Zet de beelden op hun plek in de HTML. Per beeld: staat het bestand er, dan wordt de
bijbehorende plek ingevuld; staat het er niet, dan blijft die plek zoals hij is. Idempotent.

Dat het een script is en geen instructielijst heeft een reden: de galerijkaart moet in **NL
én EN tegelijk**, anders valt `sites/belvanger/tests/taalpariteit.mjs` om, en de
voorbeeldpagina heeft drie invoegpunten.

## Gotchas

Opgeschreven op het moment dat ze gebeurden, zodat ze niet nog een keer gebeuren.

1. **Een script dat zijn eigen documentatie meeleest.** Het inbouwscript kijkt of het werk al
   gedaan is door in het bestand naar een markering te zoeken. Twee keer op rij matchte die
   markering een **HTML-commentaar** waarin stond hoe je het met de hand zou doen — dus sloeg
   het script de pagina stil over. Opgelost door de markering op een bestandspad te zetten
   én door alle klassenamen en paden uit die commentaren te halen. In die commentaren staat
   nu een waarschuwing waarom.
2. **`HR++` in een bijschrift.** Het bijschrift gaat letterlijk een `RegExp` in, en `+` is
   een metateken: "Nothing to repeat", script eruit. Er staat nu een `esc()`-functie in.
3. **Kaders worden herkend aan hun bijschrift, niet aan hun volgorde.** Anders zet een
   omgewisselde volgorde in de HTML de foto's stil bij het verkeerde bijschrift, en hangt
   "winkelpui" ineens bij een woonkamerraam.
4. **`git checkout --` gooit ongecommit werk weg.** Twee keer een net toegevoegde CSS-haak
   verloren door tussentijds terug te zetten naar de laatste commit. Commit tussenstappen,
   of gebruik `git stash`.
5. **`loading="lazy"` laadt niet bij een opname buiten beeld.** Een screenshot met
   `captureBeyondViewport` toont de werkkaders leeg, ook als er niets mis is. Wil je zien of
   een foto echt laadt, scroll er dan naartoe en controleer `img.complete` en
   `naturalWidth`.
6. **`--window-size` bepaalt niet de layout-viewport.** Een screenshot leek horizontale
   overflow te tonen die er niet was. Meet met `document.documentElement.scrollWidth` en zet
   de viewport via `Emulation.setDeviceMetricsOverride`, niet via een vlag.
7. **De `.reveal`-scrollanimatie staat op opacity 0 tot een element in beeld komt.** Bij een
   opname buiten beeld is de halve pagina onzichtbaar. Zet
   `prefers-reduced-motion: reduce` via `Emulation.setEmulatedMedia` om de eindtoestand te
   zien.
8. **Een 16:9-hero in een staande telefoonhero is een krappe uitsnede.** Op
   `object-position: 65%` viel de glaszetter volledig buiten beeld. Onder 860px staat hij nu
   op 80%.

## Als je een beeld niet mooi vindt

Alles staat hierboven: model, instellingen en de strekking van elke prompt. Opnieuw
genereren, downloaden, uploaden, dan:

```bash
node tools/beeld-verkleinen.mjs nieuw.webp sites/belvanger/site/assets/voorbeelden/<naam>.webp <maat> 82
```

De HTML hoeft niet aangepast: de bestandsnamen blijven gelijk.
