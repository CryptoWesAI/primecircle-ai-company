# Google-reviews op klantsites: tonen én verzamelen

> Ontwerpbesluit, nog niet gebouwd. Datum: 2026-08-07. Aanleiding: de sterrenscore en het
> aantal reviews van de klant op zijn eigen site tonen, en die prominent maken bij een bezoek.
>
> **Waarschuwing over de bronnen.** De sessie waarin dit is geschreven had geen
> netwerktoegang, dus de exacte huidige voorwaarden van Google zijn **niet geverifieerd**.
> De vorm van de beperkingen hieronder is stabiel en al jaren gelijk, maar controleer de
> letterlijke regels op de Places API-documentatie en de richtlijnen voor reviewfragmenten
> vóór je dit bouwt. Publiceer niets op een klantsite op basis van dit document alleen.

## Drie landmijnen die het ontwerp bepalen

### 1. Reviews scrapen en herpubliceren mag niet

De legitieme route naar Google-reviews is de **Places API**, niet het van de pagina afhalen.
Die route geeft een beperkt aantal reviews terug, eist zichtbare Google-attributie, en stelt
grenzen aan hoe lang je de inhoud mag bewaren. Scrapen en in je eigen database zetten is in
strijd met de voorwaarden, en het is bovendien de kwetsbare route: één opmaakwijziging bij
Google en de sites van al je klanten tonen onzin.

**Gevolg voor het ontwerp:** de sterrenscore wordt **live opgehaald en kort gecachet**, nooit
overgetypt en nooit permanent opgeslagen.

### 2. Structured data voor reviews: waarschijnlijk niet toegestaan, en zeker niet gratis

Google staat `aggregateRating`-markup **niet** toe voor zelfbediende reviews, en evenmin voor
reviews die van een andere site zijn overgenomen en op de eigen site worden herpubliceerd om
sterren in de zoekresultaten te krijgen. Precies dat is wat "Google-reviews in JSON-LD op je
eigen site" is.

De verleiding is groot omdat sterren in de zoekresultaten mooi zijn. Het risico is een
handmatige maatregel op de site van een klant die net €595 heeft betaald.

**Gevolg voor het ontwerp:** **geen `aggregateRating` in de JSON-LD** op basis van
Google-reviews. Wel gewoon `LocalBusiness` met naam, adres, telefoon en openingstijden. De
sterren horen op het Google-profiel thuis, want daar rendeer je ze ook: ze verschijnen bij de
kaartweergave, en dat is waar de meeste lokale zoekers hem toch al vinden.

### 3. Nederlandse regels over consumentenreviews

Twee dingen die concreet gelden:

- **Een getoonde beoordeling moet actueel en juist zijn.** "4,9 sterren" die vorig kwartaal
  klopte en nu 4,2 is, is misleidend. Dit is precies waarom de zelfgerapporteerde getallen uit
  het intakeformulier niet publiceerbaar zijn.
- **Wie consumentenreviews toont, moet vertellen of en hoe hij controleert dat ze van echte
  klanten komen.** Bij Google-reviews is dat antwoord eenvoudig en sterk: *"Dit zijn de
  reviews op ons Google-profiel. Wij verzamelen ze niet zelf en kunnen ze niet aanpassen of
  verwijderen."* Eén zin, en hij is waar.

**Reviewernamen zijn persoonsgegevens.** Via de officiële API mét attributie en zonder eigen
opslag is dat verdedigbaar; overtypen in een eigen database is dat niet.

## Wat er op de site komt

Toepassing van de vijf-secondentest en van het principe "de verdienste is van hem":

**Wel:**
- Eén **badge** in de header of direct onder de hero: sterren, aantal, en de datum van
  ophalen. Klikbaar naar het echte profiel, in een nieuw tabblad. De klik naar de bron ís het
  bewijs; een carrousel met quotes zonder bron is decoratie.
- Maximaal **drie citaten**, letterlijk, met voornaam en maand, elk met dezelfde link.
- Een zin over herkomst: *"Deze reviews staan op ons Google-profiel. Wij kunnen ze niet
  aanpassen of verwijderen."*

**Niet:**
- Geen carrousel die automatisch doordraait. Bewegende sociale bewijsvoering leest als reclame.
- Geen sterren in de JSON-LD.
- Geen zelfgekozen "beste" reviews die een structureel ander beeld geven dan het gemiddelde.

**De drempel, en die is belangrijk.** Onder ongeveer **tien reviews of onder 4,0 sterren doet
het blok meer kwaad dan goed.** Toon dan niets over reviews en zet er iets anders neer dat wél
waar is: sinds welk jaar hij bestaat, zijn certificeringen, of het aantal klussen van dit jaar.
Dit moet een schakelaar in `klant.json` worden, geen beslissing per klant in het hoofd van de
founder.

**Faalgedrag.** Is de API onbereikbaar of het profiel verdwenen, dan toont de site **de laatst
opgehaalde waarde met datum**, of helemaal niets. Nooit een placeholder, nooit een verzonnen
getal. Zelfde regel als overal: liever een leeg vak dan een onware claim.

## De grotere prijs: reviews verzamelen in plaats van tonen

Tonen is een trust-signaal. **Verzamelen is een bezit dat samengesteld groeit**, en Belvanger
heeft daar al de hele infrastructuur voor liggen: het weet wanneer een gemiste beller is
opgevangen, het heeft het nummer, en het kan sms'en.

Het mechanisme dat werkt is bekend en saai: **twee tot drie dagen na een afgeronde klus één
sms met een directe link naar het reviewformulier.** Niet naar het profiel, naar het formulier,
want elke extra tik halveert de opbrengst.

Drie ontwerpregels die deze specifiek maken voor dit product:

1. **De vakman drukt op de knop, niet het systeem.** Alleen hij weet of de klus goed is
   afgelopen. Een automatisch reviewverzoek na een ruzie is schade. Dit is de augment-versie:
   het systeem stelt voor ("klus bij mevrouw De Wit is afgerond, reviewverzoek sturen? JA"),
   de mens beslist.
2. **Nooit filteren op tevredenheid vooraf.** Eerst vragen of iemand tevreden is en alleen de
   tevredenen doorsturen naar Google, heet review gating en is in strijd met het beleid van
   Google. Bovendien is het precies het soort trucje waar deze doelgroep bureaus om wantrouwt.
3. **De teller is van hem.** *"Sinds je bij ons zit: 14 reviews erbij, van 4,3 naar 4,7."* Dat
   is het maandbericht uit iteratie 8, met een cijfer waar hij trots op is en dat hij uit
   zichzelf noemt.

Dit is bovendien het antwoord op een gat uit het concurrentieonderzoek: automatische
reviewverzoeken zijn **vrijwel universeel aanwezig** bij de onderzochte concurrenten en
ontbreken hier. Het hergebruikt de al gebouwde sms-keten, dus de bouwkost is laag.

## Volgorde

| Wanneer | Wat |
|---|---|
| Nu | Alleen dit besluit. De intake vraagt vanaf nu om de **profiel-link** in plaats van alleen om overgetypte getallen. |
| Bij klant 1 | Badge met live opgehaalde score plus bronlink. Geen JSON-LD-sterren. Drempel handmatig beoordelen. |
| Bij klant 1 | Reviewverzoek per sms, met de vakman als knopdrukker. Handmatig getriggerd, niet geautomatiseerd. |
| Bij klant 3 | Drempel als schakelaar in `klant.json`, en de reviewteller in het maandbericht. |
| Later | Automatisch voorstel tot reviewverzoek bij een afgeronde klus. |

## Openstaand, te verifiëren vóór de bouw

1. Exacte voorwaarden van de Places API: hoeveel reviews, welke attributie, welke bewaartermijn.
2. Of `aggregateRating` op basis van Google-reviews echt is uitgesloten, en waar dat staat.
3. Kosten per API-verzoek bij twintig klantsites, en of caching die kosten binnen de perken houdt.
4. Of de vakman zijn Google-profiel überhaupt beheert. Veel vakmensen hebben een profiel dat
   ooit automatisch is aangemaakt en dat ze nooit hebben geclaimd. **Dat claimen is op zichzelf
   al waarde die je in het eerste gesprek gratis kunt leveren**, en het is een uitstekende reden
   om terug te bellen.

**Stance: Configure de intake nu (profiel-link in plaats van overgetypte score). Delay de bouw
tot klant 1. Build daarna eerst het verzamelen, dan pas het tonen** — want tien nieuwe reviews
zijn meer waard dan een mooiere weergave van de vier die er staan.
