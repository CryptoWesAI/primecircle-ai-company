# ADHD-logboek: "het bedrijf waar zzp'ers om smeken"

> Doorlopende divergentie-analyse, één oppervlak per iteratie. Doel van de founder:
> belvanger.nl moet het bedrijf zijn waar zzp'ers om smeken, en website, dashboard,
> services, automatiseringen en backend moeten top notch, makkelijk te gebruiken en
> makkelijk te beheren zijn.
>
> **Waarom dit bestand bestaat.** De `adhd`-skill waarschuwt zelf: stop met divergeren
> zodra nieuwe kandidaten de vorm van bestaande herhalen. Twintig tot vijftig ronden op
> hetzelfde probleem levert decoratie, geen breedte. Dit logboek dwingt elke ronde naar
> een onbezocht oppervlak met onbezochte frames, en houdt bij wat al is afgelegd.
>
> **Leesvolgorde.** Sectie per iteratie, nieuwste onderaan. De synthese staat bovenaan
> en wordt na elke ronde bijgewerkt.

## Stand van zaken

| | |
|---|---|
| Iteraties gedraaid | 5 |
| Oppervlakken gedekt | 5 van 15 |
| Fase | divergentie |

**Sterkste vondst tot nu toe:** bel-de-demo (iteratie 1). Twee onafhankelijke frames
kwamen er los van elkaar op uit, en het lost in één zet drie problemen tegelijk op:
geen bewijs, geen verkoopgesprekken, en een site die het product beschrijft in plaats
van laat ondergaan. **Blokkade:** kan pas live met een NL sms-nummer als afzender in
plaats van de alfanumerieke naam "Belvanger", want anders kan de ontvanger niet
antwoorden en bewijst de demo precies het tegenovergestelde.

## De harde randvoorwaarde die boven alles staat

Uit `docs/research/concurrentie-vakmarketing-adhd-2026-08-07.md`: Belvanger heeft nul
betalende klanten en nul gevoerde gesprekken. Elk idee in dit logboek is daarom een
**hypothese over wat een vakman wil**, niet een bevinding. Zodra er één betalende klant
is, vervangt zijn gedrag elke aanname hieronder. Tot die tijd geldt: ideeën die alleen
werken bij tien klanten worden gemarkeerd als **[wacht op klanten]** en niet gebouwd.

## Oppervlakken-wachtrij

Elke iteratie pakt het bovenste onbezochte oppervlak. Founder mag de volgorde omgooien.

| # | Oppervlak | Status |
|---|---|---|
| 1 | Website belvanger.nl: vertrouwen en conversie | **gedaan, iteratie 1** |
| 2 | Klantdashboard: het dagelijkse gebruik door de vakman | **gedaan, iteratie 2** |
| 3 | Onboarding: van "ja" tot live | **gedaan, iteratie 3** |
| 4 | De automatiseringen: n8n, sms, push, chat | **gedaan, iteratie 4** |
| 5 | Backend-stack: Twilio/Bird, OpenRouter, NocoDB, Cal.com, Mollie | **gedaan, iteratie 5** |
| 6 | Beheer: hoe één persoon 25 klanten draait zonder te verzuipen | open |
| 7 | Storing en support: wat er gebeurt als het stukgaat | open |
| 8 | Prijs- en pakketstructuur | open |
| 9 | Retentie: waarom een klant na maand 6 blijft | open |
| 10 | De wow: wat een vakman ongevraagd aan een collega vertelt | open |
| 11 | De AI-laag: chat, spraak, triage, tegenover de concurrentie | open |
| 12 | Data en AVG als product in plaats van als plicht | open |
| 13 | Het iOS-gat en mobiele levering | open |
| 14 | Offboarding en eigendom | open |
| 15 | Meetbaarheid: aan welk cijfer leest de klant zijn waarde af | open |

Daarna verschuift de loop van divergentie naar **synthese en snoeien**: tegenspraken
tussen oppervlakken oplossen, dubbelingen samenvoegen, en de lijst terugbrengen tot wat
één persoon naast een baan daadwerkelijk kan bouwen en onderhouden.

---

## Iteratie 1 — Website: vertrouwen en conversie

Frames: tienjarig kind · game designer · dragende aanname weghalen · geen budget en één
uur. Vier geïsoleerde takken, 24 ideeën. Scores zijn novelty / viability / fit.

### Clusters

**Het product als demo in plaats van als beschrijving** (de rijkste cluster)
- Echt nummer bovenaan: bel, laat overgaan, hang op, en krijg de sms die je klant krijgt `[N9 V9 F10]`
- Bel Wesley zelf en zie of hij binnen twee keer overgaan opneemt, met weekcijfer inclusief missers `[N10 V7 F9]`
- Praat met de chatbot als een sollicitatiegesprek met de telefoniste die je overweegt `[N9 V8 F9]`
- Eén telefoonnummer als heel product: bel, spreek je vak in, tien minuten later staat je site live `[N10 V5 F9]`
- Gratis losstaande tool die een week lang je gemiste oproepen opvangt, niets te koop op die pagina `[N9 V5 F9]`
- Vervang de site door één pagina met een nummer dat de founder zelf opneemt `[N8 V8 F7]`

**De site personaliseert zichzelf**
- Typ naam en vak, en binnen negentig seconden staat je eigen homepage op een deelbare URL die zeven dagen leeft `[N8 V7 F9]`
- Vakkeuze als personagekeuze: één klik verandert teksten, bedragen en voorbeelden permanent `[N7 V8 F8]`
- Knop "ik sta nu op een dak": de site wordt drie enorme knoppen en verder niets `[N9 V8 F6]`
- Duizend voorgebouwde persoonlijke pagina's, per brief aangeboden `[N10 V4 F8]` **trap**

**Bewijs dat zichzelf produceert**
- Groeiende publieke lijst van teruggebelde mensen, begint leeg met "wees de eerste" `[N8 V8 F8]`
- Vergrendeld dashboard achter glas: tikbaar, "ontgrendelt bij je eerste gemiste oproep", inlogknop ernaast `[N8 V7 F8]`
- Live kanaal: elke opgevangen oproep binnen een minuut geanonimiseerd op de homepage `[N9 V6 F8]` **[wacht op klanten]**

**Minder in plaats van meer**
- Zes van de zeven voorbeeldpagina's weg `[N7 V9 F5]` **trap**
- Engelse versie en taalpariteitstest weg `[N7 V9 F5]` **trap**
- Scroll-hero en rekenmachine naar een `/showcase`-URL, publieke homepage kaal `[N8 V8 F7]`
- Geen dashboard bouwen, wekelijkse WhatsApp beloven `[N6 V8 F3]` — premisse verouderd, het dashboard draait al

**Risico-omkering en zichtbaarheid**
- Noindex eraf plus "ik bouw jouw pagina live in 48 uur, je betaalt pas als je hem mooi vindt" `[N7 V8 F10]`
- De site als openbaar bouwlogboek met gezicht, KvK en omzet (nul) `[N7 V8 F6]` — founder wil zijn gezicht nog niet

### Traps

- **Zes voorbeeldpagina's weggooien.** De bouwkosten zijn al gemaakt; wat je wint is
  onderhoud, wat je verliest is het enige dat in een verkoopgesprek onmiddellijk
  overtuigt. Verplaatsen naar `/showcase` levert dezelfde winst zonder het verlies.
- **Engelse versie weggooien.** Idem, en de taalpariteitstest bestaat juist om regressies
  te vangen. Weggooien maakt de site brozer, niet lichter.
- **Duizend voorgebouwde pagina's.** Portokosten, doorway-pagina-risico bij Google, en
  spec-werk op schaal voor een eenmansbedrijf.

### Uitgediept: bel-de-demo

**Schets.** Bovenaan de site geen video maar een instructie in drie regels: *"Bel [nummer].
Laat het twee keer overgaan. Hang op."* Daaronder klein: *"Wij nemen expres niet op.
Binnen 20 seconden krijg je op je eigen telefoon precies de sms die jouw klant krijgt als
jij hem mist."* Plus een statusbolletje uit een heartbeat: *"Demo werkt, laatste test 4
min geleden geslaagd."*

Technisch: de voice-webhook van het Twilio-nummer wijst naar een n8n-endpoint dat
onmiddellijk `<Reject>` teruggeeft. De beller hoort een echte overgaande toon, niemand
neemt op, en Twilio rekent een geweigerd gesprek niet af, dus de belkant kost nul. In
dezelfde run gaat het nummer door een guard en daarna naar de Messaging Service. De
bezoeker krijgt twee sms'jes: eerst de echte klantsms, vijf seconden later de onthulling
*"(Dit was de demo van Belvanger. Je was net even je eigen gemiste klant.)"* Schrijft hij
terug, dan neemt de bestaande OpenRouter-chatbot het over, stelt maximaal twee vragen, en
stuurt daadwerkelijk een pushmelding naar het PWA-dashboard, zodat de hele keten in één
demo wordt bewezen. Na vier antwoorden stopt de bot, zodat één demo nooit meer dan zes
sms'jes kost (~€0,50).

**Dragend risico.** Je maakt de belofte publiek toetsbaar op infrastructuur van één man
met een onbegrensde kostenkant. Elke storing is dan geen gemiste conversie maar live
bewijs van het tegendeel. Vier lagen:

1. **Afzender, en dit is een blokkade.** De huidige opstelling verstuurt vanaf de
   alfanumerieke naam "Belvanger", en daar kán niet op geantwoord worden. Dat maakt de
   demo eenrichtingsverkeer en bewijst het verkeerde. De demo gaat pas live met een NL
   sms-nummer als afzender.
2. **Misbruik en kosten.** Een sms kost ~€0,08, dus duizend geautomatiseerde calls in een
   nacht is ~€80. Harde grenzen vóór lancering: Twilio geo-permissions alleen NL, guard
   weigert alles wat niet met +316 begint, één demo per nummer per 24 uur en drie per
   week, globale cap van 40 per dag (~€6), spend-trigger op €25 per maand. Bij het
   bereiken van de cap wisselt de hero automatisch naar een opname.
3. **AVG.** Je ontvangt het nummer van iemand die alleen keek. Grondslag is uitvoering van
   een door hem gevraagde dienst, dus je mag hem binnen dat sms-gesprek antwoorden en
   verder niets. Niet nabellen, niet in de prospectlijst, niet exporteren naar een
   advertentiedoelgroep. Bewaartermijn 7 dagen met een opruimtaak, STOP wordt gehonoreerd,
   en er komt een regel over in `privacy.html`.
4. **Uitval.** Een heartbeat belt elke vijf minuten het eigen nummer via de Twilio-API. Is
   de laatste geslaagde check ouder dan tien minuten, dan haalt de site het nummer zelf
   weg en toont een schermopname met *"Eerlijk: onze demo ligt er nu uit."* Een bezoeker
   die in een zwart gat belt is erger dan een bezoeker die niet belt.

**Eerste stap.** Vóór er één letter sitecopy verandert: de afzenderfix plus vijf echte
tests. NL sms-nummer in een Messaging Service, voice-webhook naar de nieuwe n8n-workflow,
en dan bellen vanaf vijf verschillende toestellen bij verschillende providers. Meten met
een stopwatch: doel onder 20 seconden tussen ophangen en melding, harde stopregel bij meer
dan 30. Pas bij vijf van de vijf geslaagd gaat het nummer op de site.

**Kinderen.** De eerlijke teller (*"Deze week 23 keer gebeld, 21 keer opgenomen binnen 2x
overgaan, 2 keer gemist, di 19:40 en do 07:15, die twee kregen binnen 18 seconden een
sms"*) · het dagquotum tonen als schaarste in plaats van als kostenrem, met een opt-in
voor morgen als het op is · het sollicitatiegesprek met de bot, inclusief een
arbeidsvoorwaardenkaart: €99 per maand, geen vakantiegeld, geen ziektedagen, maandelijks
opzegbaar · de warme terugbel-brug via een expliciete "JA" in het sms-gesprek, de enige
AVG-schone route van demo naar verkoopgesprek · het nummer offline verspreiden op een
sticker bij de groothandelbalie en op de achterruit van de bus, met een apart nummer per
kanaal zodat je meet welke balie werkt.

### Wat deze iteratie zegt over de rest

Het patroon achter de sterkste ideeën is niet "mooier" maar **ondergaan in plaats van
lezen**. Dat is een lens die op de volgende oppervlakken ook getest moet worden: kan de
vakman het dashboard ondergaan voordat hij klant is, kan hij de onboarding ondergaan, kan
hij de storingsafhandeling ondergaan. Meenemen naar iteratie 2.

---

## Iteratie 2 — Klantdashboard: het dagelijkse gebruik

Frames: de monteur die om 3 uur 's nachts gebeld wordt · logistiek · hardware-engineer ·
mierenkolonie. Vier geïsoleerde takken, 24 ideeën.

**De convergentie van deze ronde:** drie van de vier frames kwamen onafhankelijk uit op
een variant van *"het beste dashboard is er een die hij nooit opent"*. Dat is niet één
idee maar een productthese, en die is uitgediept in plaats van een losse functie.

### Clusters

**Het dashboard hoeft niet geopend te worden**
- Elke lead binnen 10 seconden óók als sms, zodat push luxe is en geen belofte `[N7 V9 F10]`
- Alleen "een klant wacht op jou, nu" mag pushen; al het andere is ophaalmateriaal `[N8 V9 F9]`
- Dagelijks spraakbericht om 17:30, af te luisteren zonder inloggen `[N9 V7 F8]`
- Het telefoonnummer als primair invoerkanaal: bel voor een gesproken samenvatting van open leads, 1-toets doorverbinden `[N10 V6 F9]`
- Push op iOS vervangen door sms of WhatsApp met deeplink: laat het besturingssysteem het transport leveren `[N7 V9 F9]`
- Dagroute om 06:30 als één afvinkbare stoplijst, gesorteerd op adres-nabijheid `[N8 V7 F8]`

**Tijd als ordenend principe in plaats van status**
- Bederfklok: elke lead heeft resterende houdbaarheid (formulier 15 min, gemiste oproep 1 uur, e-mail 4 uur) en zakt zichtbaar door van vers naar bedorven `[N9 V9 F9]`
- Retourbak: "geen deal" en "geen gehoor" komen na 14, 45 en 120 dagen terug als kant-en-klaar sms-sjabloon `[N8 V9 F9]`
- Trackingnummer plus publieke statuspagina die de vakman naar zijn klant sms't: ontvangen → gebeld → offerte → ingepland `[N9 V8 F9]`
- Prioriteitsklassen op signaalwoorden (lekkage, storing, verbouwing) plus kanaal `[N7 V8 F8]`

**Bediening onder fysieke omstandigheden**
- Eén "Ik ben aan het werk"-schuif die doorschakeling, bereikbaarheid en antwoordtekst tegelijk omzet `[N8 V9 F9]`
- Eén duim, drie seconden, 64px raakvlakken onderaan, contrast dat in vol zonlicht standhoudt zonder op kleur te leunen `[N6 V9 F8]`
- Offline als normale bedrijfsmodus: altijd uit een lokale buffer lezen, met alleen een "laatst ververst"-stempel `[N7 V7 F8]`
- Outbox met write-behind: elke handeling wordt lokaal bevestigd en verstuurt zodra er bereik is `[N7 V7 F8]`

**Beheer zonder beheerder**
- De configuratie schrijft zichzelf: na elke handmatige handeling één ja/nee-vraag om er een regel van te maken `[N10 V6 F9]`
- Eén tik "wel/geen klus?" na elke gemiste oproep, waarmee de vakman ongemerkt de routering traint `[N9 V7 F9]`
- Hartslag: het systeem belt zichzelf elk kwartier, de klant ziet één vinkje met tijdstempel `[N7 V9 F8]`
- Elk foutscherm toont één zelfhulpactie plus een "Herstel dit nu"-knop `[N7 V8 F7]`
- Zwarte doos: laatste 200 gebeurtenissen per klant, één knop stuurt ze als leesbaar rapport naar de founder `[N7 V9 F6]`

**Het collectief als motor** — allemaal **[wacht op klanten]**
- Nieuwe klanten erven de sms-teksten die over alle accounts heen de hoogste terugbelratio halen `[N9 V6 F7]`
- "61% van de dakdekkers laat dit aan" naast elke schakelaar `[N8 V7 F7]`
- Configuratie overnemen van de collega die je doorverwees, via een link die alléén instellingen meedraagt en nul contacten `[N9 V7 F8]`
- Cross-docking: één tik zet een lead die niet past door naar een bevriende collega, met terugverwijzing `[N10 V6 F9]`
- Geanonimiseerd regionaal signaal ("12% meer lekkages deze week") terug naar alle dashboards `[N8 V5 F6]`

### Waarschuwing bij het hele collectief-cluster

Vijf van deze ideeën zijn sterk en allemaal onbruikbaar bij nul klanten: ze hebben een
kolonie nodig om te bestaan. Bouw er geen enkele voordat er tien betalende klanten zijn,
maar ontwerp het datamodel er wel nu al naar, want achteraf een geanonimiseerde
aggregatielaag inbouwen is duurder dan hem meteen goed neerzetten.

### Uitgediept: het dashboard dat hij nooit opent

**Schets.** Belvanger houdt op een dashboard te zijn en wordt **een sms-lijn met een
archief erachter**. Elke aanvraag verlaat het systeem binnen 10 seconden als één sms van
een gewoon 06-nummer, in strikt één GSM-7-segment:

> `Nieuwe aanvraag 09:12 - Marja de Groot, 06 23456789 - lekkage keuken, Zwolle. Bellen: bel.vg/m3 - Belvanger`

Push is dezelfde tekst een halve seconde eerder, voor wie hem heeft. Daarmee is het
iOS-gat een comfortkwestie in plaats van een productgat.

Op een gewone dinsdag opent hij het dashboard niet: twee of drie sms'jes, tikken op het
nummer, terugbellen. Het systeem leidt uit dat gesprek af dat de lead is opgepakt, dus er
is niets af te vinken. Opent hij het wel, dan ziet hij één scherm: bovenaan de schuif
"Ik werk" / "Ik kan bellen", daaronder maximaal vijf mensen op volgorde van resterende
versheid, elk met één grote belknop.

**Van vijf secties blijven er twee over.** Overzicht wordt de versheidslijst met de schuif
erin. Contacten wordt "Mensen": archief plus retourbak, nu ook handmatig aanvulbaar en
exporteerbaar. Kanalen en Zichtbaarheid verdwijnen als sectie en komen terug als één
maandbericht op de 1e. Hulp verdwijnt als sectie en wordt een vaste belknop onderaan elk
scherm, plus het woord SPOED als sms-antwoord dat de founder direct piept.

**Dragend risico: waarde-onzichtbaarheid.** Een product dat perfect werkt en nooit geopend
wordt, voelt na drie maanden als €99 voor een sms'je dat hij "zelf ook wel had gehad".
Onzichtbaarheid is hier tegelijk de feature en de opzegreden. Het maandbericht is daarom
geen versiering maar het retentiemechanisme.

**De kostenkant, en dit is het belangrijkste getal uit deze ronde.** Reken met €0,08 per
segment. Een drukke vakman met 10 leads per dag is 220 leads per maand: €17,60 aan alerts
plus €17,60 aan de textback naar de beller plus ~€1,15 nummerhuur = **€36 op €99, oftewel
36% van de omzet.** Bij twee segmenten €55, oftewel 56%.

Fataal is niet het volume maar **één verkeerd teken**: één é, één emoji of één typografisch
aanhalingsteken schakelt de sms naar UCS-2 (70 tekens per segment) en verdrievoudigt de
rekening stilletjes. De sjabloon moet met een test op GSM-7 worden vastgeklikt. De
gemiddelde klant (3 leads per dag) kost ~€11 en dat is prima; dek de staart af met fair use
van 200 alert-sms per maand, en stuur daarboven automatisch één samenvattings-sms per drie
leads in plaats van door te belasten. Zo hangt de marge nooit van de drukte van de klant af.

**De bederfklok mag geen schuldgevoel-machine worden.** Geen terugblik-statistiek per lead,
geen rood, geen "gemist", geen streak. De klok bestaat alleen vooruit, om te sorteren. Wat
over de houdbaarheid gaat verdwijnt geruisloos naar "Later bellen" mét een kant-en-klaar
sms-sjabloon, in plaats van als verwijt.

**Zelflerende configuratie is bij één klant geen leren maar bevestigen.** Drempel van drie
identieke handelingen, maximaal één vraag per week, expliciete JA vereist, elke regel
zichtbaar en met één tik terug te draaien, en de harde grens dat een regel **alleen de
meldingssterkte mag wijzigen en nooit de opslag of aflevering van een lead**. Een verkeerd
geleerde regel kost dan hooguit een trage terugbelactie, geen klus.

**Het ontwerpprincipe voor uitval, en dit is de scherpste zin uit de hele ronde:** vallen
sms én push samen uit, dan is het antwoord geen derde meldingskanaal maar degraderen naar
de telefonie zelf. Een canary-lead om 06:55 moet binnen 60 seconden een delivery-receipt
opleveren; zonder dat receipt zet het systeem de doorschakeling automatisch uit zodat de
telefoon van de vakman gewoon overgaat zoals vóór Belvanger. **De slechtst mogelijke dag
met Belvanger moet gelijk zijn aan een normale dag zonder Belvanger.**

**Eerste stap.** Deze week alleen de sms-ruggengraat voor één kanaal (het webformulier),
op de bestaande Twilio-opzet: webhook naar sms binnen 10 seconden, met delivery-callback,
de 06:55-canary, en de tekst hard vastgeklikt op één GSM-7-segment via een unit-test die
elk niet-GSM-teken laat falen. Zeven dagen draaien op zijn eigen telefoon met drie tot vijf
zelfgemaakte leads per dag. Definition of done: zeven dagen achtereen elke testlead binnen
10 seconden afgeleverd, gemeten kostprijs per lead op papier, en één bewust uitgeschakelde
gateway die aantoonbaar de doorschakeling uitzette.

**Kinderen.** Het maandbericht op de 1e als enige uiting richting bestaande klanten (*"Juli:
23 aanvragen, 19 binnen het uur, 4 die je zonder Belvanger niet had gezien. Waarde bij je
gemiddelde klus van €340: €1.360"*) · terugbellen ís afvinken, de status komt uit de
handeling en niet uit een knop · canary met degradatie naar kale doorschakeling · de
retourbak als bevestig-sms in plaats van een scherm ("JA" kost drie seconden en €0,08, en
levert bij een klus van €340 al rendement bij 1 op 100) · **onboarding is dezelfde schuif**:
de nieuwe klant belt éénmalig vanaf zijn eigen mobiel naar het Belvanger-nummer, waarmee
opvangnummer, beltijden en afzender automatisch vaststaan. Dat laatste haalt de laatste
reden weg om ooit een instellingenpagina te bouwen, en het is de brug naar iteratie 3.

---

## Iteratie 3 — Onboarding: van "ja" tot live

Frames: biologie · speedrunner · oneindig budget en tien jaar · toezichthouder.
Vier geïsoleerde takken, 24 ideeën.

**Waarom dit oppervlak zwaarder telt dan het klinkt.** Een setup kost nu ongeveer een dag.
Bij dat tempo is 15 tot 25 klanten het maximum naast een baan, en het inkomensdoel vraagt
er 30 tot 40. Setuptijd is dus niet comfort maar de plek waar het verdienmodel breekt.

### Clusters

**De setup is een build, geen bouwsessie** (de convergentie van deze ronde)
- Het klantgenoom: één `klant.json` waaruit site, chatbot, n8n, Twilio en dashboard ontkiemen `[N8 V9 F10]`
- Zeven demo-sites staan al live; bij "ja" wissel je naam, telefoon, plaats en logo `[N8 V9 F10]`
- Eén commando provisioneert container, Traefik-route, DNS, Twilio, n8n en dashboardaccount; de PWA gaat via een QR aan het eind van het gesprek `[N8 V8 F10]`
- Epigenetische deploy: geen enkele per-klant fork, alleen de omgeving verschilt, dus één verbetering landt bij alle veertig `[N7 V9 F10]`
- Littekenweefsel: elke fout wordt binnen 24 uur een permanente check of default, zodat klant 30 sneller live is dan klant 3 `[N8 V8 F9]`
- Immuunsysteem: een preflight-poort blokkeert de bouw bij ontbrekende data in plaats van halverwege te repareren `[N7 V9 F9]`

**De input komt uit spraak, niet uit typen**
- De intake is één telefoongesprek van 20 minuten, opgenomen en getranscribeerd, en die transcriptie is de bron `[N9 V8 F10]`
- Darmflora-kennisbank: tien spraakberichten op WhatsApp worden de chatbot-kennisbank `[N9 V8 F10]`
- Cameraploeg mee in de bus, schaduwversie: 45 minuten videobellen terwijl hij rondloopt en praat `[N8 V7 F9]`
- Foto's via WhatsApp, live met vaktypische beelden die automatisch vervangen worden `[N8 V8 F9]`

**Ga live voordat het af is**
- Larve-fase: binnen een uur een werkende site op een subdomein met voorlopige gegevens die de klant zelf corrigeert `[N8 V8 F10]`
- Live met doorschakeling naar zijn eigen mobiel en de chatbot in neem-bericht-aan-modus; de kennisbank vul je in week twee met de vragen die klanten echt stelden `[N9 V9 F10]`

**Eigendom en toetsbaarheid als onboarding-stap**
- Eigendomsbewijs op dag nul: domein, DNS en repo op naam van de vakman, met PDF-bewijs, vóór er één regel gebouwd is `[N9 V9 F10]`
- Permanente exit-knop: ZIP met site, leads-CSV, kennisbank en logs, met de datum van de laatste geslaagde export zichtbaar `[N8 V9 F9]`
- Verplicht scherm waarin de vakman de AI-disclosure voor zijn eigen bellers kiest, niet uitzetbaar `[N8 V9 F8]`
- Tweekliks-keuze over doorgifte buiten de EER, EU-only als standaard, onwijzigbaar gelogd `[N8 V8 F8]`
- Geen klant aannemen zonder KvK van de founder plus een aansprakelijkheidsplafond gelijk aan de jaarvergoeding `[N6 V9 F9]`
- Bewaartermijnen als code: retentie-annotatie per tabel, nachtelijke job, teller in het dashboard `[N7 V8 F8]`

**Traps**
- **Schaduwprofielen van elke zzp-vakman in Nederland vooraf bouwen** `[N10 V4 F8]`. Scraping op schaal, doorway-pagina's, en AVG-problemen met profielen van mensen die nergens om vroegen.
- **Google Bedrijfsprofiel scrapen als intake** `[N9 V7 F10]`. Aantrekkelijk en tegen de voorwaarden van Google. De KvK heeft wel een officiële API; die route is schoon.
- **Generatieve portfoliobeelden** `[N8 V7 F7]`. Een AI-beeld tonen als "ons werk" is misleiding. Alleen bruikbaar als het zichtbaar een illustratie is, en dan is de waarde beperkt.

### Uitgediept: onboarding als build

**Schets.** Eén telefoongesprek van twintig minuten, geopend met een vaste zin: *"Ik neem
dit gesprek op zodat ik je website eruit kan bouwen, dan hoef jij niets te typen. Vind je
dat goed?"* Het gesprek stopt als het antwoord nee is. In die twintig minuten loopt de
founder twaalf vragenblokken af en typt hij tegelijk **zes harde velden** zelf in: uurtarief
en voorrijkosten, telefoonnummer, KvK/btw, werkgebied, domeinnaam en huisstijlkleur. Die zes
komen nooit uit de transcriptie.

Binnen het uur daarna draait één commando: transcriptie op de eigen VPS, een LLM genereert
een concept-`klant.json`, de founder leest die vijf minuten na, en de generator zet site,
chatbot-config, subdomein met certificaat, n8n-flow en dashboardaccount neer. De larve staat
op `jansen.belvanger.nl` achter noindex en een niet-raadbare link, met een zichtbare banner
*"CONCEPT, teksten door AI opgesteld uit ons gesprek, tarieven nog niet gecontroleerd"* en
met **alle prijsvelden op "op aanvraag"** in plaats van bedragen.

In week één één keer tien minuten bellen met scherm delen: de klant corrigeert hardop, de
founder wijzigt de JSON en herdeployt in twee minuten. De zes harde velden gaan als los
WhatsApp-kaartje terug met *"Klopt dit precies? Antwoord met JA"*, en pas bij die JA staan ze
live. Bij akkoord volgt de metamorfose: eigen domein, echt nummer, opvang aan, en pas dán de
factuur. In week twee leest de founder de echte vragen uit de logs en vult daaruit de
kennisbank.

**Eerlijke schatting, en dit is een correctie op het enthousiasme:** klant 3 kost ongeveer
**3,5 uur** founder-tijd verspreid over tien dagen, klant 30 ongeveer **75 tot 90 minuten**.
Geen tien minuten. Maar het verschuift het plafond wel van 15-25 klanten naar 40, en dat was
het hele punt.

**Dragend risico: autoriteit, niet snelheid.** Zodra een gegenereerde tekst een getal of een
belofte bevat, spreekt de machine namens de vakman, en de vakman wordt daarop afgerekend.
Daarom loopt er één harde scheiding door het hele proces:

> **Zachte data** (toon, over-ons, welke klussen, FAQ-onderwerpen) mag uit de transcriptie
> komen. **Harde data** (tarieven, voorrijkosten, garantietermijnen, spoedbeloftes,
> werkgebied, KvK) nooit.

Een boormachine op de achtergrond, een Twents accent, en "vijfenzeventig" dat "vijfenvijftig"
wordt, is precies het scenario dat je niet mág kunnen hebben. De transcriptiepijplijn markeert
elk getal en elk woord onder ~90% zekerheid met `??`, en de deploy blokkeert zolang er een
`??` in de JSON staat.

**Wanneer voorlopig schadelijk wordt:** zodra een derde het kan zien. Google, een klant van de
klant, of een doorgestuurde WhatsApp-link. Vandaar noindex, een niet-raadbare URL, en geen
echte bedrijfsnaam in de subdomeintitel tot akkoord. Een verkeerd geraden "over ons"-alinea is
charmant; een verkeerd tarief op een site waar net €625 voor is toegezegd is schadelijk.

**Het antwoord op "kan er niet ook nog even een offertemodule bij":** *"Dat zit niet in de €99,
die prijs bestaat juist omdat iedereen hetzelfde draait. Ik zet het op de lijst; vragen drie
klanten hetzelfde, dan bouw ik het voor iedereen en krijg jij het gratis. Wil je het nu, dan is
het een los project."* Elke afwijking wordt een vlag in het genoom, nooit een fork. **Een fork
bij klant 4 kost je klant 30.**

**Eerste stap.** Twee uur: schrijf `klant.json` schema v1 waarin elk veld een `bron` draagt
(`mens` voor de zes harde velden, `transcript` voor de rest), plus de 20-minuten vragenlijst
waarin elke vraag letterlijk de veldnaam noemt die hij vult. Verifieer het schema door de twee
bestaande dossiers in `product/chatbot/customers/` er retroactief in te persen: elk veld dat
daar niet in past, of dat in beide gevallen hetzelfde is, hoort niet in het genoom. Pas daarna
heeft het zin om de generator te schrijven, want het schema is het contract waar de generator,
de transcriptieprompt, de vragenlijst en de validator alle vier aan hangen.

**Kinderen.** Een deploy-blokkerende validator `klant-keuren.mjs` in het verlengde van het
bestaande `tools/website-keuren.mjs` · het WhatsApp-bevestigingskaartje met de zes harde velden
als vast processtuk en audit trail · genoomvlaggen in plaats van forks, met een verzoekenregister
en de drie-klanten-regel · een littekenregister met 24-uursdeadline, inclusief datum, klantnummer
en de exacte toegevoegde regel · twee korte gesprekken (20 minuten intake, 10 minuten
larve-doorloop) in plaats van e-mailpingpong, allebei ingepland tijdens het eerste gesprek.

---

## Iteratie 4 — De automatiseringen: n8n, sms, push, chat

Frames: inversie · de aanvaller · speedrunner · tienjarig kind. Vier geïsoleerde takken,
24 ideeën.

**De ongemakkelijke convergentie van deze ronde:** meerdere frames zeggen onafhankelijk
*haal eruit* in plaats van *bouw erbij*. Het tienjarige kind vraagt waarom er zes systemen
tussen "iemand belt" en "de vakman weet het" zitten, de speedrunner wil n8n en de pushlaag
schrappen, en de inversie laat zien dat de bestaande stille fouten juist ontstonden op de
naden tussen die systemen.

### Clusters

**Controleer de keten van buitenaf, en laat het kritieke pad buiten je eigen server lopen**
- Een synthetische testklant belt elk uur écht binnen; de keten moet zichzelf binnen 90 seconden de volledige sms plus melding terugleveren `[N8 V9 F10]`
- Twilio Studio stuurt zelf de sms bij een gemiste oproep, zodat dat pad blijft werken als de VPS plat ligt `[N8 V9 F10]`
- Meet het **antwoordpad**, niet de verzendbevestiging: een tweede echt nummer leest de sms terug en antwoordt "ja" `[N9 V8 F10]`
- Alarmeren mag nooit via het kanaal dat kapot is: dead man's switch bij een externe dienst die mailt als de VPS zwijgt `[N7 V9 F10]`
- Stiltealarm: wie normaal 12 leads per week krijgt en er nu 2 heeft, is dat de markt of de keten `[N9 V8 F9]`
- Ruwe payload wegschrijven vóór enige verwerking, zodat een mislukte verwerking herspeelbaar is zonder de beller opnieuw te storen `[N7 V9 F9]`

**Kostenbommen en misbruik**
- Dagbudget in euro's per kanaal, zachte drempel op 60% naar de vakman, harde drempel die degradeert naar een statisch belnummer `[N8 V9 F10]`
- Uitgaande sms-begrenzer per beller, per vakman, per uur, met "X pogingen onderdrukt" zichtbaar in plaats van stil `[N8 V9 F9]`
- Nummerverificatie: geen sms naar een nieuw nummer tot Twilio bevestigt dat de oproep daar echt vandaan kwam; formulierleads krijgen alleen e-mail `[N9 V8 F9]`
- Onveranderlijke bron-stempel per lead, met "geverifieerde oproep" versus "onbevestigd webformulier" zichtbaar in het dashboard `[N8 V8 F9]`

**De machine mag niet namens de vakman spreken**
- Uitgaande filter op de chatbot: blokkeer elk antwoord met een prijs, termijn, garantie of toezegging die niet letterlijk in de goedgekeurde feitenlijst staat `[N9 V8 F10]`

**Minder systemen**
- n8n volledig verwijderen; de webhook-handlers zijn vijftig regels in de Node-server die de founder al beheerst `[N8 V8 F9]`
- De dagelijkse "alles groen"-mail vervangen door een dead man's switch `[N8 V9 F9]`
- Web Push en de PWA schrappen ten gunste van sms `[N7 V9 F8]` — zie waarschuwing hieronder
- De AI-chatbot uitzetten tot een klant er expliciet om vraagt `[N7 V9 F7]` — zie waarschuwing hieronder
- Activiteitenlog vervangen door één gedeeld Google Sheet `[N8 V7 F6]` **trap**

**De keten is één telefoonnummer** (het naïeve frame, en het is minder naïef dan het klinkt)
- Bij geen gehoor gaat de telefoon meteen weer over met een stem: *"Er heeft net iemand gebeld op nul zes..."*, druk groen en je belt al `[N10 V7 F10]`
- Een gemiste oproep van een vast nummer dat hij opslaat als "GEMISTE KLANT"; terugbellen verbindt automatisch door met de laatste beller `[N10 V7 F9]`
- Het systeem belt de vakman én de klant en verbindt ze door, zodat er niets te tikken valt `[N10 V6 F10]`
- Alles wordt één WhatsApp-bericht in een groep waar alleen de vakman in zit `[N8 V7 F9]`
- Het antwoordbericht komt van het eigen mobiele nummer van de vakman `[N9 V5 F10]`

### Waarschuwingen bij het schrap-cluster

- **Google Sheet als leaddatabase is een trap.** Het gaat om telefoonnummers en
  gespreksinhoud van klanten van de klant, dus persoonsgegevens van derden, en het dashboard
  met export bestaat al. Dit ruilt een AVG-verantwoording in voor gemak.
- **PWA en Web Push schrappen is te ver, maar de these erachter klopt.** Iteratie 2 kwam er
  al op uit: push moet luxe zijn en sms de ruggengraat. Dat is iets anders dan de PWA
  weggooien die al werkt en waarvan de crypto op een echt toestel is bewezen.
- **De chatbot uitzetten is te ver.** Hij staat op de site als onderdeel van het aanbod en
  is een verkoopargument. Wat wél klopt: hij mag in fase één geen prijzen in zijn context
  hebben, en dat is precies wat de uitgaande filter afdwingt.

### Het patroon dat zich over twee iteraties heen aftekent

Iteratie 3 zei: harde data mag nooit uit een transcriptie komen. Iteratie 4 zegt: de chatbot
mag geen prijs noemen die niet in de goedgekeurde feitenlijst staat. Dat is twee keer
hetzelfde principe, uit twee onafhankelijke oppervlakken:

> **De machine mag nooit een getal of een belofte uitspreken namens de vakman.** Zachte taal
> mag gegenereerd worden, harde toezeggingen komen uitsluitend van een mens en zijn
> schriftelijk bevestigd.

Dit is de eerste kandidaat voor een vast ontwerpprincipe van het hele product.

### Uitgediept: de keten buiten zichzelf controleren

**Wat er verhuist, en dat is precies één ding.** Alleen het antwoord op een gemiste oproep
gaat naar Twilio, als ongeveer dertig regels **Twilio Function** en bewust **geen
Studio-flow**. Bij status no-answer, busy of failed gaan er twee sms'jes uit: één naar de
beller vanaf een echt tweeweg NL-nummer (~€3 per maand, in plaats van de alfanumerieke
afzender die antwoorden onmogelijk maakt), en één naar de eigen mobiel van de vakman, zodat
de melding niet afhangt van Web Push die op iOS toch nooit aankomt.

Al het andere blijft op de VPS: dashboard, chatbot, dedupe, rapportage. Elke inkomende
webhook wordt eerst als ruwe JSONL-regel weggeschreven met direct 200 OK, pas daarna
verwerkt, met een `replay <sid>`-commando zodat een mislukte verwerking herspeelbaar is
zonder de beller nog eens te storen.

**De controle draait buiten alles wat van de founder is.** Een externe cron (Cloudflare
Worker, gratis, ~30 regels) start via de Twilio-API een échte oproep van canarynummer A naar
het canary-Belvangernummer, hangt na 15 seconden op, leest via de API de volledige sms-body
terug op A en **controleert op de aanwezige link en ingevulde variabelen in plaats van op
`status=delivered`**, antwoordt dan letterlijk "ja", en eist dat dat antwoord binnen 90
seconden zowel op nummer B als in de ingest-API staat. Dat is het antwoordpad, niet de
verzendbevestiging.

**De kostenrem die dit ontwerp realistisch houdt.** Eén lus kost ~€0,22 (oproep €0,03, twee
sms €0,14, nummerhuur). Elk uur is **€158 per maand** en dat is bij nul omzet niet te
verdedigen. Dus: **vier keer per dag** (07:00, 11:00, 15:00, 19:00 ≈ €26 per maand) plus een
gratis uurlijkse halve check (Twilio-accountstatus, en GET én HEAD op alle webhook-endpoints,
want HEAD gaf ooit 405). Schaal pas naar elk uur vanaf de derde betalende klant.

**Vervuiling wordt één vlag, geen uitzondering.** De canary is een echte tenant `__canary`
met `synthetic: true` op elk event, standaard weggefilterd in élke query van portal,
klantrapport, bezoekersstatistiek en activiteitenlog.

**Alarmering loopt nergens door de keten die kapot kan zijn.** Een externe heartbeat-dienst
(EU-gehost, gratis tier) wordt na elke geslaagde lus gepingd; blijft die ping 90 minuten uit,
dan mailt hij naar Gmail, **niet naar de Hostinger-mailbox die op dezelfde VPS eindigt**.

**Dragend risico: de canary wordt een eigen keten.** Een synthetisch pad dat groen blijft
terwijl de echte klantconfiguratie ergens anders staat. Dat is exact dezelfde fout als de
07:00-mail die "alles groen" meldde, één laag hoger, en verraderlijker omdat het bewijs nu
overtuigender oogt. De mitigatie is structureel: de canary moet dezelfde Function, hetzelfde
configschema en dezelfde deploy-pijplijn gebruiken als een betalende klant en alleen in
configwaarden verschillen, plus één keer per maand een handmatige test met een echte tweede
telefoon.

**Over lock-in.** Naar Twilio Studio verhuizen zou een echte val zijn, want die flow is niet
exporteerbaar. Dertig regels JavaScript in git, met een leverancier-neutrale pseudocode-spec
ernaast, is dat niet: een Bird-migratie is dan een dag herbouwen in plaats van een
platformmigratie.

**Over alarmmoeheid, en dit beleid is harder dan de detectie.** Nachtmodus 22:00 tot 07:00:
alleen e-mail en een dashboardvlag. Er wordt pas echt gebeld als twee opeenvolgende lussen
falen én er in datzelfde venster een echte klantoproep binnenkwam. Elk vals alarm krijgt
binnen 24 uur één regel in `ALARMLOG.md` met precies drie toegestane uitkomsten: drempel
bijgesteld, check verwijderd, of echte fout gevonden. Meer dan één vals alarm per week
degradeert die check automatisch naar waarschuwing. **Liever een gemist alarm om 03:00 dan
een systeem dat over twee weken uitstaat.**

**Het stiltealarm wordt nu niet gebouwd.** Bij nul of één klant is elke week statistisch ruis.
Wel vanaf dag één de leadteller per klant per week vastleggen, en de onboardingvraag "hoe vaak
word je per week gebeld?" als prior gebruiken. Vóór acht weken historie geldt alleen een harde
vloer: nul leads in 72 werkuren betekent dat de founder de klant zelf belt, geen automatisch
alarm.

**Eerste stap, één avond en ongeveer €10.** Vervang de alfanumerieke afzender door een echt
tweeweg NL Twilio-nummer en herimplementeer het missed-call-antwoord als Twilio Function, niet
in Studio. Bewijs het daarna door op de VPS `docker compose stop n8n belvanger-portal` te
draaien, met een tweede telefoon écht naar het nummer te bellen en op te hangen, en te
controleren dat de sms met werkende link binnenkomt en dat een reply "ja" aankomt op de
telefoon van de "vakman", **terwijl er niets van jezelf draait**. Rapporteer wat er letterlijk
op beide schermen stond. Zonder dat bewijs is de rest van dit ontwerp de moeite niet waard.

**Kinderen.** `synthetic: true` als verplicht veld op het bestaande event-contract, met
`?include_synthetic=1` voor de eigen monitoringweergave · een maandelijkse chaosknop die de
VPS tien minuten bewust stillegt tijdens een canary-lus · de onboardingvraag "hoe vaak word je
gebeld en wat is een gemiste klus waard" als verplicht veld, tegelijk ROI-argument in de
verkoop en prior voor de stiltedrempel · `CRITICAL_PATH.md` met de logica in
leverancier-neutrale pseudocode, zodat de logica in het document woont en niet bij Twilio ·
ruwe webhooks append-only naar `raw/YYYY-MM-DD.jsonl` met een dagelijkse teller van
niet-verwerkte regels, precies het soort stille fout dat de 07:00-mail nu niet ziet.

---

## Iteratie 5 — Backend-stack: de leveranciers

Frames: markten · de vijandige leverancier · geen budget en één uur · dragende aanname
weghalen. Vier geïsoleerde takken, 25 ideeën.

**De convergentie van deze ronde is eigendom**, en hij sluit rechtstreeks aan op iteratie 3.

### Clusters

**Wat onvervangbaar is, hoort op naam van de klant**
- Koop alleen doorschakelnummers; het nummer dat zijn klanten kennen staat nooit op het Twilio-account van Belvanger `[N9 V9 F10]`
- Elke klant eigen accounts bij Twilio, Google en Cal.com op zijn naam en betaalmiddel; Belvanger krijgt gedelegeerde toegang en verkoopt configuratie plus onderhoud `[N10 V7 F10]`
- Postgres als enige echte database; NocoDB, Baserow en Cal.com zijn vervangbare UI-lagen erboven `[N8 V8 F9]`
- Belvanger levert geen software maar een telefoonnummer met mens en AI erachter, en kiest zelf zijn gereedschap `[N9 V7 F10]`

**Niets mag tegelijk omvallen**
- Registrar, DNS-hosting, VPS en mailbox bij vier verschillende partijen `[N8 V9 F10]`
- Noodtelefoonnummer geport-klaar bij een aparte carrier, met een vooraf ingesproken voicemail `[N9 V7 F10]`
- Fysiek herstelpakket: 2FA-codes op papier, tweede TOTP-toestel, twee betaalmiddelen bij verschillende banken, neutraal herstel-mailadres, buiten huis bewaard `[N7 V9 F9]`
- Winterslaap-export: wekelijks het leesbare eindproduct van elke dienst, niet de database-dump `[N9 V8 F9]`
- Koud kruispunt: een VPS van €5 bij een andere hoster in een ander land, één keer per kwartaal aangeraakt `[N8 V8 F9]`
- Uitvaldraaiboek van één pagina per leverancier, en elk kwartaal er één 24 uur echt live testen `[N8 V8 F9]`
- Elke leverancierskoppeling achter één vaste interne interface `[N7 V8 F9]`

**Kosten variabel maken in plaats van vast**
- Sms-doorbelasting bij kostprijs plus 30% in het contract, zodat de duurste variabele post meebeweegt met volume `[N8 V8 F9]`
- Kanaalrouter per klant per berichttype, met sms expliciet als premium-optie naast WhatsApp `[N8 V8 F9]`
- Modelketen met confidence-drempel: goedkoop model eerst, duur model alleen als de drempel niet gehaald wordt, met tokenkosten per klant gelogd `[N8 V7 F8]`
- Drie promptversies per taak (Gemini, generiek-OpenAI, lokaal klein model), maandelijks getest op tien voorbeeldgesprekken `[N8 V7 F8]`

**Nog niet bouwen**
- Mollie, Cal.com en Retell AI op de wachtlijst; de eerste drie klanten handmatig factureren `[N7 V9 F10]`
- Geen NocoDB of Baserow: één SQLite-bestand, en de eerste vijf klanten hebben geen admin-UI `[N7 V9 F9]`
- n8n uit, twee cronscripts; n8n mag terugkomen als een klant een flow wil kunnen zien `[N8 V8 F8]`
- AI lokaal op een mini-pc thuis voor niet-urgente taken, live pad regelgestuurd zonder model `[N9 V6 F9]`

### Traps

- **De mailbox en agenda van de vakman als enige database** `[N9 V5 F7]`. Breekt de
  dashboardbelofte en gaat uit van Google Workspace dat lang niet elke vakman heeft.
- **Een aparte stack en eigen VPS per klant** `[N8 V6 F7]`. Dit botst frontaal met iteratie 3,
  die juist concludeerde dat er geen enkele fork mag zijn omdat het beheer anders meeschaalt
  met het klantenaantal. Zie de tegenspraak hieronder.
- **Geen server, alleen een laptop met cron** `[N9 V5 F7]`. Voor een betaalde dienst met een
  bereikbaarheidsbelofte is dit niet verdedigbaar.

### Twee dingen die eerlijk benoemd moeten worden

**1. Een echte tegenspraak tussen iteratie 3 en 5.** Iteratie 3 zegt: geen forks, alle
klanten op één codebase, want anders schaalt het beheer mee met het klantenaantal. Iteratie 5
zegt: eigen accounts en desnoods een eigen omgeving per klant, want anders sleept één
leveranciersprobleem iedereen mee. Beide hebben gelijk over hun eigen faalmodus. Dit is
precies het soort conflict dat de synthesefase moet oplossen, en het antwoord ligt
waarschijnlijk in de scheiding: **één gedeelde codebase, gescheiden accounts en data.** Nog
niet vastgesteld.

**2. Dit is de derde iteratie op rij waarin een onafhankelijk frame zegt dat er iets moet
worden weggehaald dat al gebouwd is.** Iteratie 2 zei push moet luxe zijn, iteratie 4 zei
n8n en de check-mail eruit, iteratie 5 zegt n8n eruit, de zelfgebouwde Web Push-crypto eruit,
en het dashboard uitstellen tot een klant erom vraagt. Dat is geen ruis meer, dat is een
patroon.

De eerlijke lezing: **er is meer gebouwd dan er verkocht is, en de frames zien dat vanuit
elke hoek.** De juiste conclusie is niet om werkende dingen te slopen, want de bouwkosten zijn
al gemaakt en het dashboard is op een echt toestel bewezen. De juiste conclusie is dat er
vanaf nu **niets meer bij mag** tot er een betalende klant is die erom vraagt, en dat de
onderhoudslast van wat er staat actief omlaag moet (n8n vervangen door cronscripts is
daarvan het goedkoopste voorbeeld, want het haalt een heel tweede systeem met eigen UI,
updates en storingsmodus weg zonder dat één klant het merkt).

---
