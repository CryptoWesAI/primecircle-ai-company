# Eigenaarschap en overdracht

Wat is van de klant, wat is van jou, en wat gebeurt er als hij weggaat.

> **Waarom dit bestand er is.** Belvanger draait op je eigen VPS, met je eigen code, je
> eigen sleutels en jouw beheer. Dat is goed voor je marge en je snelheid, maar het maakt
> jou tot het enige punt waar alles doorheen loopt. Een vakman die daar niet over nadenkt
> koopt gerust. Een vakman die er wél over nadenkt, vraagt ernaar, en dan wil je het
> antwoord al klaar hebben liggen in plaats van het ter plekke te verzinnen.
>
> Dit document is de bron voor drie dingen: de exit-alinea in de voorwaarden, de
> overdrachtchecklist, en het antwoord in het verkoopgesprek.

## Het uitgangspunt in één regel

> **De setup koop je. De maandelijkse dienst huur je.**

Dat is niet gemarketingde taal, het is precies hoe je prijs al in elkaar zit: €625 eenmalig
voor de website, €99 per maand voor het draaien, onderhouden en meten. Dus:

- Wat met de **setup** is gemaakt (website, teksten, beeld, kleuren, structuur) is **van de
  klant**, ook na opzegging.
- Wat de **maandelijkse dienst** is (de server, de leadvangst, de automatisering, het
  dashboard, de AI-chat) is **een dienst**. Die stopt als hij stopt betalen, en dat is geen
  gijzeling maar het einde van een abonnement.

Zeg dat in het gesprek in die twee zinnen. Het verschil tussen een leverancier en een
lock-in is niet de techniek, het is of dit vóóraf is opgeschreven.

## Wie is waarvan eigenaar

| Wat | Van wie | Bij opzegging |
|---|---|---|
| **Domeinnaam** | **Altijd de klant.** Zet hem nooit op jouw naam als eigenaar. | Blijft van hem. Jij haalt alleen de DNS-verwijzing weg. |
| **Website: HTML, CSS, beeld, teksten** | Klant (betaald met de setup) | Krijgt hij als map met bestanden. Werkt op elke hosting. |
| **Zijn eigen telefoonnummer** | Klant | Blijft van hem. Doorschakeling gaat eraf, klaar. |
| **Eigen projectfoto's, logo, merk** | Klant | Blijft van hem, ook de originelen. |
| **Leads en klantgegevens in het dashboard** | **Klant** (hij is verantwoordelijke, jij verwerker) | Export als CSV, daarna verwijderen. Wettelijk verplicht. |
| Hosting op jouw VPS, Traefik, certificaten | Jij | Stopt. |
| Het dashboard zelf (de software) | Jij | Stopt. Hij krijgt zijn data, niet het programma. |
| De n8n-automatisering en de flows | Jij | Stopt. |
| Belvanger-telefoonnummer (Twilio) | Jij | Blijft van jou. Zie de regel hieronder. |
| De AI-chatbot en de OpenRouter-sleutel | Jij | Stopt. |
| De generieke productcode (`product/chatbot`) | Jij | Blijft van jou. Dit is jouw product, niet zijn maatwerk. |

## Vijf regels die het probleem vóór zijn

**1. De domeinnaam staat altijd op naam van de klant.**
Gratis, kost je niets, en het haalt in één keer de grootste angst weg. Registreer je hem
voor hem, dan is hij de eigenaar en geef je de verhuiscode zodra hij erom vraagt, zonder
tegenprestatie. Een domein op jouw naam is de klassieke manier waarop bureaus een slechte
naam hebben gekregen.

**2. De klant adverteert nooit met een nummer dat niet van hem is.**
Dit is de scherpste val en bijna niemand ziet hem. Zet je een Belvanger-nummer op zijn
bus, zijn website en zijn Google-profiel, dan is dat nummer bij vertrek een gijzelaar en
verliest hij bereikbaarheid. Jouw huidige ontwerp is al goed: zijn eigen nummer blijft het
nummer, en alleen de gemiste oproep wordt doorgeschakeld. Houd dat zo, en zeg het in het
gesprek: *"je eigen nummer blijft je eigen nummer."*

**3. De site is statisch, en dat is een verkoopargument.**
Er zit geen build-stap, geen framework en geen database in de website. Het zijn HTML, CSS,
een klein JS-bestand en zelf-gehoste lettertypes. Je kunt hem letterlijk als zip
overhandigen en hij werkt op elke hosting ter wereld. Dat kan een Wix- of Squarespace-site
niet: daar exporteer je geen werkende site. Noem dat.
Wat er bij overdracht wél wegvalt: het contactformulier (`/api/lead`) en de AI-chat draaien
op jouw server. Zeg vooraf wat er dan gebeurt: het formulier valt terug op mailen of
WhatsApp, en de chat verdwijnt. Eerlijk en simpel.

**4. Het dashboard is een dienst, geen product dat je overdraagt.**
Dat is volkomen normaal en het wordt alleen een ruzie als je het niet vooraf zegt. Hij
krijgt zijn gegevens, niet de software. Vergelijk het met een boekhouder: je krijgt je
administratie mee, niet zijn boekhoudpakket.

**5. Alles wat je belooft heeft een termijn.**
"Je krijgt je website mee" is een gunst. "Je krijgt binnen vijf werkdagen na opzegging je
website als bestanden en je leads als CSV" is een afspraak. Zet er een getal bij.

## De overdrachtchecklist

Bij opzegging, binnen vijf werkdagen:

- [ ] **Website als bestanden.** Zip van de statische site: HTML, CSS, JS, beeld,
      lettertypes. Plus één A4 met "zo zet je dit online" en de mededeling dat het
      formulier en de chat op onze server draaiden en dus vervangen moeten worden.
- [ ] **Leads exporteren.** Alle contacten en berichten als CSV. Dit is niet optioneel:
      hij is verantwoordelijke voor die gegevens en heeft recht op overdracht.
- [ ] **Doorschakeling eraf.** Zijn nummer schakelt niet meer door. Bevestig schriftelijk
      dat het gedaan is, met datum en tijd.
- [ ] **DNS.** Domein wijst niet meer naar onze VPS. Als het domein op zijn naam staat,
      geef je hem de verhuiscode als hij die wil.
- [ ] **n8n-flow uit**, Twilio-nummer vrijgeven of hergebruiken.
- [ ] **Gegevens verwijderen** na de export, binnen een afgesproken termijn (bijvoorbeeld
      30 dagen als bedenktijd), en dat schriftelijk bevestigen.
- [ ] **Chatbot-configuratie** en kennisbank meegeven als tekstbestand. Dat is zijn
      bedrijfsinformatie, niet jouw eigendom.
- [ ] **Laatste factuur** en einddatum bevestigen, zodat er geen open eind is.

Bewaar per klant een ingevuld exemplaar. Een afgevinkte lijst is je bewijs dat je netjes
bent geweest, en dat is precies wat een volgende klant wil horen van de vorige.

## Twee dingen die vóór klant #1 geregeld moeten zijn

**1. Een verwerkersovereenkomst. Dit is geen nice-to-have.**
Je verwerkt persoonsgegevens van de klanten van je klant: telefoonnummers, namen, wat de
klus is, chatberichten. Daarmee is de vakman **verwerkingsverantwoordelijke** en ben jij
**verwerker**, en dan eist de AVG (artikel 28) een schriftelijke overeenkomst. Daarin staat
onder andere: wat je mag verwerken, dat je het niet voor iets anders gebruikt, welke
subverwerkers je gebruikt (Hostinger, Twilio, OpenRouter, Microsoft Clarity), hoe je met een
datalek omgaat, en dat je de gegevens **teruggeeft of verwijdert** als de opdracht eindigt.
Dat laatste is precies het antwoord op zijn overdrachtvraag, en het is toevallig ook wettelijk
verplicht. Twee vogels.

> **Let op, dit is niet hypothetisch.** AB Uitvaartzorg is sinds 14 juli live met chatbot en
> bezoekersstatistieken, en in je eigen spec (`clients/ab-uitvaartzorg/docs/chatbot-ab-uitvaartzorg-spec.md`)
> staat dat de verwerkersovereenkomst vóór livegang vast moest liggen. Die is er niet. Dat
> is een openstaand punt bij een lopende klant, niet bij een toekomstige.

**2. Een exit-alinea in de voorwaarden.**
`voorwaarden.html` zegt nu alleen "maandelijks opzegbaar" en verder niets over wat je
teruggeeft. Voeg toe wat er bij opzegging gebeurt, met de termijn van vijf werkdagen en de
lijst hierboven in twee zinnen. Dat is het verschil tussen een klant die durft en een klant
die het er nog even over wil hebben met zijn zwager.

Laat beide teksten nalezen door iemand met juridische kennis voordat je ze gebruikt, net
zoals de privacyverklaring en de voorwaarden.

## Het risico waar de klant terecht naar vraagt

**"En als jou iets gebeurt?"** Bij een eenmanszaak met eigen hosting is dat een faire vraag,
en het eerlijke antwoord mag niet "dat komt goed" zijn.

- **De backups staan nu alle 71 op dezelfde VPS die ze moeten beschermen.** Dat is een
  kopie, geen backup. Gaat die machine stuk of wordt het account gesloten, dan is alles weg,
  inclusief de backups. Dit is het grootste technische gat in de hele opzet en het is met een
  wekelijkse kopie naar buiten de VPS op te lossen.
- **Documenteer het herstel** en test het één keer echt. Een ongetest herstel is een aanname.
  (`rollback-to-vps.sh` is er en is getest; een herstel op een NIEUWE machine is dat niet.)
- **Zorg dat één vertrouwd persoon** weet waar de toegang ligt en wat er moet gebeuren. Dat
  hoeft geen constructie te zijn; een verzegelde envelop met instructies is al oneindig veel
  meer dan niets.

## Waarom je het niet als andere bureaus doet, en waarom dat goed is

Veel bureaus bouwen op Wix, Squarespace of Webflow. Voordeel: de klant kan het account
overgedragen krijgen en de leverancier is uitwisselbaar. Nadelen: je betaalt per site mee aan
het platform, je bent gebonden aan wat het platform kan, en je kunt geen leadvangst,
dashboard en automatisering onder één dak leveren. Dat laatste is precies je product.

Jouw keuze voor eigen hosting is dus niet fout, hij vraagt alleen dat je de exit expliciet
regelt in plaats van hem impliciet te laten. Bureaus krijgen geen slechte naam omdat ze eigen
hosting hebben, maar omdat vertrekken duur en vaag is. Maak vertrekken **goedkoop en
opgeschreven**, dan is eigen hosting alleen nog een voordeel.

En zeg dat in het gesprek. Niet defensief, maar als bewijs dat je het serieus neemt:

> *"De website is van jou, ook als je stopt. Je domein staat op jouw naam, je eigen nummer
> blijft je eigen nummer, en als je opzegt krijg je binnen vijf werkdagen de site als
> bestanden en je leads als bestand. Het dashboard en de automatisering zijn de dienst, die
> stoppen dan. Dat staat allemaal in de voorwaarden, dus je hoeft mij daarvoor niet te
> vertrouwen."*

Dat laatste zinnetje doet het werk. Vertrouwen vragen is zwak; verifieerbaar zijn is sterk.
