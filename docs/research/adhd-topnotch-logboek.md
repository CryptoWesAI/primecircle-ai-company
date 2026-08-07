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
| Iteraties gedraaid | 11 |
| Oppervlakken gedekt | 15 van 15 (12 opgegaan in 3/4/5/9) (7 opgegaan in 2/4/6; 9, 10 en 15 samengevoegd in iteratie 8) |
| Fase | **synthese, adversarieel gedraaid** (divergentie afgerond op 9 iteraties) |

**Commercieel beslissende vondst, na correctie in iteratie 11:** de vlakke €99 subsidieert
de beste klanten. Een tweedelig tarief repareert dát, maar **niet het inkomensdoel**: de
adversariële ronde toonde aan dat de synthese brutomarge met netto verwarde. Bij €149 zijn
er **27 tot 37 klanten** nodig en dat ligt boven de leveringscapaciteit. Het minimum om het
te laten kloppen is **€199 tot €249 per maand**, of een doel van €1.800 netto. Elk bedrag
blijft een hypothese tot twintig echte vakmensen erop hebben gereageerd.

**Sterkste productvondst:** bel-de-demo (iteratie 1). Twee onafhankelijke frames
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

## Synthese (iteratie 10)

Negen iteraties, ~220 ideeën, vijftien oppervlakken. Dit is wat er overblijft als je de
dubbelingen samenvoegt en de tegenspraken oplost.

### Het ene beeld

**Belvanger is geen software. Het is een toetsbare belofte over de tijd tot een echt mens.**

Alles wat hoog scoorde over alle negen iteraties heen valt onder die zin. Het product is een
sms plus een kaart, de prijs is tweedelig, het beheer is begrensd, en het bewijs komt één keer
per maand met een naam erin. De concurrentie verkoopt het wegnemen van gesprekken; Belvanger
verkoopt het winnen ervan, en publiceert als enige een getal waarop je hem kunt afrekenen.

### Vijf ontwerpprincipes die uit meerdere oppervlakken tegelijk kwamen

1. **De machine spreekt nooit een getal of een belofte uit namens de vakman.** Zachte taal mag
   gegenereerd worden, harde toezeggingen komen van een mens en zijn schriftelijk bevestigd.
   *(Iteratie 3 via de transcriptie, iteratie 4 via de chatbot, iteratie 9 via de niveau-verklaring.)*
2. **Ondergaan in plaats van lezen.** Wat je kunt laten voelen, moet je niet beschrijven.
   *(Iteratie 1: bel-de-demo. Iteratie 9: de klikbare kaart in plaats van een pdf.)*
3. **De slechtst mogelijke dag met Belvanger moet gelijk zijn aan een normale dag zonder
   Belvanger.** Bij uitval degradeer je naar kale doorschakeling, niet naar een derde kanaal.
   *(Iteratie 2, bevestigd in 4.)*
4. **Beloof alleen wat je zelf beheerst.** Sms-snelheid en de robotbelofte wel; het terugbelgedrag
   van de vakman niet. *(Iteratie 6 en 9, onafhankelijk.)*
5. **De verdienste is van hem.** Het cijfer gaat over wat hij deed, nooit over wat het product
   deed, en nooit met een noemer erin. *(Iteratie 8.)*

### De drie tegenspraken, opgelost

**1. Eén codebase (it. 3) versus gescheiden per klant (it. 5).** Beide hebben gelijk over hun
eigen faalmodus. De oplossing is de scheiding op de juiste laag leggen: **één gedeelde codebase
zonder enkele fork, met gescheiden accounts en data.** Concreet: een Twilio-subaccount per klant
onder het hoofdaccount (gratis, één factuur, klant kan het niet slopen) plus de
sleutelbos-clausule voor wie er echt om vraagt. Afwijkende wensen worden een vlag in het genoom,
nooit een fork. *Een fork bij klant 4 kost je klant 30.*

**2. Onzichtbaar product (it. 2) versus zichtbare waarde (it. 8).** Geen echte tegenspraak zodra
je ze in de tijd scheidt: **onzichtbaar in de dagelijkse werking, zichtbaar één keer per maand,
en dan met een naam en een tijdstip in plaats van met aantallen.**

**3. Alles weghalen (it. 4, 5) versus wat er al gebouwd is.** De frames zien terecht dat er meer
gebouwd is dan verkocht, maar de conclusie is niet slopen. Het is: **er mag niets meer bij tot een
betalende klant erom vraagt, en de onderhoudslast van wat er staat moet omlaag.** n8n vervangen
door cronscripts is het goedkoopste voorbeeld: een compleet tweede systeem weg, geen enkele klant
merkt het.

### Wat dit kost aan geld en wat het oplevert

> ⚠️ **De tabel hieronder was fout en is gecorrigeerd door de adversariële ronde (iteratie 11).
> Zie daar.** De oorspronkelijke versie claimde 17 tot 24 klanten en "haalbaar"; dat verwarde
> brutomarge met netto-inkomen. Het echte getal is **27 tot 37 klanten**, en dat ligt boven de
> leveringscapaciteit. De fout blijft hier staan omdat hij is doorgegeven aan de founder.

| | Nu | Na synthese (**onjuist**) | Na correctie (it. 11) |
|---|---|---|---|
| Prijs | €625 setup + €99/mnd vlak | €595 + €149/mnd incl. 150 gesprekken, plafond €249 | **€199 tot €249/mnd** |
| Marge bij drukke klant | daalt naar ~€63 | ~€203 | ~€202, maar **negatief marginaal boven 317 gesprekken** |
| Klanten nodig voor het doel | 30 tot 40 | ~~17 tot 24~~ | **27 tot 37** |
| Leveringscapaciteit | 15 tot 25 | 15 tot 25 | 15 tot 25 |
| Haalbaar? | nee | ~~ja~~ | **niet op €149. Wel op €199-249, of bij een doel van €1.800 netto** |

### De vijf dingen die vandaag gratis zijn

Alles hieronder is positionering of tekst, geen bouwwerk, en alles kan vóór de eerste klant:

1. **De serviceafspraak op één A4** (bereikbaarheid, twee storingsklassen, vrijdagrit, spoedklep).
   Verwachtingen zijn gratis om vooraf te zetten en peperduur om achteraf terug te draaien.
2. **De robotbelofte plus garantie** op de site, met de afgekeurde AI-testopname ernaast als bewijs
   dat het een keuze is en geen gebrek.
3. **De prijskaart op één A4**, voorgelegd aan vijf echte vakmensen met vier vragen.
4. **De meetafspraak en de eigen-woorden-vraag** in het intake-sjabloon. Achteraf niet te
   reconstrueren.
5. **Het herstelpad losmaken van Hostinger** (neutraal herstel-mailadres, DNS elders,
   2FA-codes op papier buiten huis). Twee uur.

### De ongemakkelijke kern

Twee bevindingen die tegen elkaar in werken en samen de grootste openstaande vraag vormen:

- **De vakman die het meest voor opvang wil betalen, is degene die niet wil terugbellen.** Die
  koopt een AI-telefonist. Belvanger selecteert op vakmensen die al fatsoenlijk terugbellen, en
  dat is een kleinere markt die het probleem het minst voelt.
- **Elk cijfer in dit document is een hypothese.** Nul betalende klanten, nul gevoerde gesprekken,
  en een prijs die nooit aan een echte vakman is gevraagd.

Beide worden beantwoord door hetzelfde: **vijf gesprekken.** Niet door nog een iteratie.

## Iteratie 11 — Adversariële ronde: wat de synthese niet overleeft

Drie aanvallers, elk met een eigen lens en zonder elkaars antwoord te zien: een sceptische
Friese loodgieter die drie jaar geleden een marketingbureau heeft weggestuurd, een nuchtere
financieel adviseur, en de commercieel directeur van een concurrerende AI-telefonist met 200
klanten en €15.000 advertentiebudget per maand.

**Deze ronde is de meest waardevolle van de hele loop, want hij haalt een fout uit mijn eigen
synthese.**

### Wat er sneuvelt

**1. De rekensom klopte niet, en de fout was van mij.** De synthese claimde 17 tot 24 klanten
voor het inkomensdoel en noemde dat haalbaar. Dat verwarde **brutomarge met netto-inkomen**.
Wat er tussen zit:

- **Nummerhuur vergeten:** €149 − €11 sms − €1,15 = €136,85, niet €138.
- **De portefeuillecijfers waren niet reproduceerbaar.** Met de eigen prijskaart komt er €176
  omzet en €156,40 marge uit, niet €162 en €146.
- **Vaste kosten ontbraken volledig:** VPS, domeinen, mailboxen, boekhouding, verzekeringen,
  telefonieabonnement, software. Schatting ~€350 per maand, die niet meeschaalt met klanten.
- **Belasting ontbrak.** De winst stapelt op een fulltime salaris, dus tegen het marginale
  tarief. Effectief ~35% na MKB-winstvrijstelling. De zelfstandigenaftrek vervalt praktisch,
  want die vraagt 1.225 uur náást een baan van 40 uur.

Bij 20 klanten: €3.128 marge − €350 vast = €2.778 vóór belasting, **netto ~€1.806 per maand.**
Voor €2.500 netto zijn **27 klanten** nodig, voor €3.500 netto **37**. Beide liggen **boven de
eigen cap van 20 en boven de bandbreedte 15-25**. Het plan mist zijn doel met 7 tot 17 klanten.

**2. Het plafond van €249 maakt je beste klant je slechtste marge.** Boven ~317 gesprekken loopt
de sms-kostenkant door terwijl de omzet stopt: marginale marge **−€0,12 per gesprek**. Dat is
exact dezelfde fout als de vlakke €99, alleen verplaatst naar een hoger volume.

**3. Ontbrekende kostenposten die elke marge hierboven te hoog maken.** Belminuten, spraak naar
tekst, LLM-tokens en tekst naar spraak staan nergens in het model. En de vraag of €149 ex of
inclusief btw is: inclusief wordt de marge €125,70 en valt het plan direct om.

**4. Het bedrijfsbrede gemiddelde als publiek getal is fataal.** *"Een ratel die kapotgaat precies
wanneer het werkt: elke nieuwe klant verdunt het, de driver ligt buiten je controle, en de maand
dat 11 naar 19 gaat is dát het verhaal, geschreven door jezelf. Ze hebben een marketingmotor
gebouwd die groei bestraft."* Vervangen door een **contractuele p90-plafondbelofte per klant** met
exitrecht. Een gemiddelde verbergt de staart, en een goede prospect vraagt om je p90.

**5. Het getal mag sowieso nog niet op de site.** *"Deze maand gemiddeld na 11 minuten een echt
mens. Gemiddeld van wat? Je hebt nul klanten. Als je me een getal noemt dat je niet hebt, wat
vertel je me dan nog meer."* Eén verzonnen cijfer besmet elke andere claim op de pagina.

**6. "Bij ons neemt nooit een robot op" leest als een trucje.** *"Nee, er neemt bij jullie helemaal
niemand op. Dat is geen mens, dat is een automaat die netjes over zichzelf zegt dat hij geen
automaat is."* En de garantie betaalt de verkeerde partij: hoor je een robot, dan krijg je €149
terug, maar de misgelopen badkamer van €4.200 niet.

**7. De aftelklok legt het risico bij de klant en het gemak bij Belvanger.** *"Nu is een gemiste
beller teleurgesteld. Straks is hij teleurgesteld én heeft hij zwart op wit dat ik mijn woord niet
hield."* En 's nachts: *"een klok die naar maandag telt is geen belofte, dat is een afwijzing met
animatie."*

**8. De vrijdagrit plus €49 spoedtoeslag is letterlijk het bureau dat hij heeft weggestuurd.**
*"Ik betaal €149 per maand en moet dán nog wachten tot vrijdag omdat het jou uitkomt, of bijbetalen
om iets recht te zetten dat vaak jullie eigen typefout is."*

### Wat er overeind blijft

- **De sms binnen 8 seconden met een terugbeltijd.** Beide vijandige lenzen noemen dit
  onafhankelijk het echte product. De concurrent geeft toe: *"een beter product dan mijn
  opnemen-in-3-seconden. Ik verkoop een metriek, zij verkopen een uitkomst."*
- **De diskwalificerende intakevraag.** *"Hun weigeren van klanten die niet binnen het uur
  terugbellen maakt hun getal wáár. Dat kan ik met 200 klanten niet kopiëren."*
- **Eigendom van domein en nummer bij de klant.**
- **De vijf gratis positioneringsstappen**, met uitzondering van het verzonnen gemiddelde.

### Wat de vakman zelf als voorwaarden noemde, en dat is je go-to-market

> *"Geen €595 vooruit, want ik betaal geen bedrijf zonder klanten. Drie maanden proefdraaien,
> opzegbaar per maand, en pas betalen vanaf de eerste klus die er aantoonbaar uit komt. Haal die
> klok weg of laat mij hem zetten. En laat me met één bestaande klant bellen. Kan dat niet, dan
> zijn we klaar."*

Die laatste eis is bij nul klanten onbeantwoordbaar. **Dat is precies waarom klant nummer één
bijna gratis moet zijn: je koopt geen omzet, je koopt het antwoord op die vraag.**

### Verloop, en dit is het cijfer dat het hardst aankomt

Bij 1,5 netto nieuwe klanten per maand: 2% verloop geeft 20 klanten na 15 maanden, 5% verloop na
21 maanden, en **bij 10% verloop wordt 20 klanten nooit bereikt** (plafond 15). Plus 2 tot 3
maanden vóór de eerste klant. Realistisch: **~24 maanden tot 20 klanten**, met onderweg gemiddeld
negen klanten en ~€1.400 marge per maand.

### Het financiële oordeel

**Het plan klopt niet op €149.** Het minimum om het wél te laten kloppen: **prijs naar €199 tot
€249 per maand**, of het doel bijstellen naar €1.800 netto. En vóór alles: **twintig
verkoopgesprekken voeren en de prijs testen. De hele spreadsheet is nu fictie.**

## Oppervlakken-wachtrij

Elke iteratie pakt het bovenste onbezochte oppervlak. Founder mag de volgorde omgooien.

| # | Oppervlak | Status |
|---|---|---|
| 1 | Website belvanger.nl: vertrouwen en conversie | **gedaan, iteratie 1** |
| 2 | Klantdashboard: het dagelijkse gebruik door de vakman | **gedaan, iteratie 2** |
| 3 | Onboarding: van "ja" tot live | **gedaan, iteratie 3** |
| 4 | De automatiseringen: n8n, sms, push, chat | **gedaan, iteratie 4** |
| 5 | Backend-stack: Twilio/Bird, OpenRouter, NocoDB, Cal.com, Mollie | **gedaan, iteratie 5** |
| 6 | Beheer: hoe één persoon 25 klanten draait zonder te verzuipen | **gedaan, iteratie 6** |
| 7 | Storing en support: wat er gebeurt als het stukgaat | **opgegaan in 2, 4 en 6** |
| 8 | Prijs- en pakketstructuur | **gedaan, iteratie 7** |
| 9 | Retentie: waarom een klant na maand 6 blijft | **gedaan, iteratie 8** |
| 10 | De wow: wat een vakman ongevraagd aan een collega vertelt | **gedaan, iteratie 8** |
| 11 | De AI-laag: chat, spraak, triage, tegenover de concurrentie | **gedaan, iteratie 9** |
| 12 | Data en AVG als product in plaats van als plicht | **opgegaan in 3, 4, 5 en 9** |
| 13 | Het iOS-gat en mobiele levering | **opgegaan in 2 en 4** (sms als ruggengraat) |
| 14 | Offboarding en eigendom | **opgegaan in 5** (eigendomslaag, exit-knop, weglooptest) |
| 15 | Meetbaarheid: aan welk cijfer leest de klant zijn waarde af | **gedaan, iteratie 8** |

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

### Uitgediept: eigendom bij de klant

**Wat er overeind blijft.** Drie lagen die je één keer bouwt en daarna vergeet: een
**eigendomslaag** (domein en telefoonnummer op naam van de vakman, Belvanger raakt ze aan maar
bezit ze nooit), een **scheidingslaag** (registrar, DNS, VPS, mailbox en herstel-adres bij vijf
verschillende partijen, nooit twee lagen bij dezelfde leverancier), en een **uitgangslaag**
(wekelijkse export van het leesbare eindproduct plus een papieren herstelpakket).

**Wat er sneuvelt, en dat is eerlijk.** Eigen leveranciersaccounts per klant is in zuivere vorm
**niet houdbaar** voor een eenmansbedrijf. Twintig klanten betekent twintig Twilio-accounts,
twintig facturen, twintig kaarten die verlopen, en twintig keer een vakman die jou belt als
helpdesk voor een leverancier waar je niets aan verdient. Dat botst frontaal met iteratie 3.
Erger: een vakman die zijn eigen account beheert kan het ook slopen. Zegt hij per ongeluk het
nummer op, dan is het na 30 dagen quarantaine definitief weg; weigert zijn kaart, dan schort
Twilio het account op en stopt de opvang midden in een werkweek, en de eerste die het merkt is
zijn klant die geen sms terugkrijgt. **Dat is precies de faalmodus die je verkocht hebt weg te
nemen.**

**Het compromis dat de verkoopwaarde behoudt zonder de last:** één Twilio-**subaccount** per
klant onder het hoofdaccount, plus een geschreven **sleutelbos-clausule**: *"Wil je dat alles op
je eigen naam komt te staan, dan zet ik het binnen tien werkdagen over, kosteloos, ook als je
weggaat."* Subaccounts zijn gratis, de factuur blijft één factuur, de klant kan zijn eigen account
niet slopen, en de administratieve last ontstaat alleen bij wie er echt om vraagt. In de praktijk
is dat bijna niemand.

**Wat kan er nu al, zonder KvK.** Vier van de vijf: de eigendomslaag voor het nummer, de
vier-partijen-scheiding, de exportflow en het herstelpakket. Alleen de eigen leveranciersaccounts
wachten op inschrijving, want zonder KvK is er geen zakelijke rekening, geen btw-factuur, geen
Mollie (KvK verplicht) en geen geloofwaardige rol als beheerder namens een ander.

**Wat de vakman ervan merkt bij aanmelden.** Vier concrete dingen: *"je eigen nummer blijft je
eigen nummer, ik koop nooit een nummer dat op je bus staat"* · het domein komt op zijn naam en
*"vraag je de verhuiscode, dan krijg je hem dezelfde dag, zonder dat ik eerst iets van je wil"* ·
op dag 30 de **weglooptest**, waarbij hij zelf de doorschakeling uitzet en weer aanzet · en elke
maandag de map met zijn eigen bestanden, met *"ook als ik morgen wegval, heb je alles wat je
nodig hebt, in bestanden die je zonder mij kunt openen."*

**Kosten van het houdbare deel:** ongeveer een avond voor de splitsing (domein €10-15 per jaar,
Cloudflare DNS gratis, aparte mailbox €19-60 per jaar), 3 tot 4 uur voor de exportflow, en een
uur plus €0 tot €110 voor het herstelpakket. Wat je ervoor terugkrijgt is het enige dat in dit
segment nog vrij is: een belofte die de klant zelf kan nakijken.

**Het tweede-orde-risico, en dit is het eerlijkste dat de verdieping oplevert:** dit is
aantrekkelijk werk voor iemand die liever bouwt dan verkoopt. Bij nul betalende klanten is elke
dag infrastructuurhygiëne een dag niet bellen. **Doe daarom alleen het deel dat in één avond af
is en daarna nul aandacht vraagt, en laat de rest landen als er een klant is die ervoor betaalt.**

**Eerste stap, twee uur.** Haal het herstelpad los van Hostinger: een neutraal herstel-mailadres
bij een andere partij, dat instellen op het Hostinger-account, DNS voor belvanger.nl naar
Cloudflare (gratis, nameserverwissel, ~15 minuten plus propagatie), en de 2FA-recoverycodes van
Hostinger, Cloudflare, GitHub, Twilio en OpenRouter op papier, bewaard buiten huis. Dit neemt
vandaag het scenario weg waarin één betaalgeschil je site, je DNS én het mailadres waar de
wachtwoordreset heen moet in één klap uitschakelt. **De domeinverhuizing en de exportflow plan je
in dezelfde week, maar niet vóór je eerstvolgende verkoopactie.**

**Kinderen.** De weglooptest op dag 30 als vast agendapunt · de maandagmap als één n8n-flow die
tegelijk winterslaap-export, AVG-exportplicht en wekelijks zichtbaar waardebewijs is · de
sleutelbos-clausule in de voorwaarden · vier-partijen-scheiding als vaste opzetregel voor elk
nieuw domein, ook dat van klanten · een A4 **"Wat er gebeurt als ik wegval"** bij elke offerte,
dat het grootste onuitgesproken bezwaar tegen een eenmanszaak zonder KvK zelf op tafel legt, en
dat je niet kunt schrijven zolang de export niet draait.

---

## Iteratie 6 — Beheer: 25 klanten met één persoon

Frames: de monteur die om 3 uur 's nachts gebeld wordt · logistiek (toegepast op het werk van
de founder, niet op de leads) · mierenkolonie · game designer (met de **founder** als speler).
Vier geïsoleerde takken, 24 ideeën.

**De convergentie van deze ronde: beheer wordt beheersbaar door begrenzing, niet door
automatisering.** Bijna elk frame zegt onafhankelijk "zet er een muur omheen" in plaats van
"optimaliseer erbinnen". Dat is een niet voor de hand liggend antwoord op "makkelijk te
beheren", want de reflex is automatiseren.

### Clusters

**Begrenzing: wat je niet belooft hoef je niet waar te maken**
- Verkoop expliciet "werkdagen 8 tot 18, buiten die uren vangt het systeem op", en dwing technisch af dat er 's nachts geen kanaal naar de founder is `[N8 V9 F10]`
- Twee storingsklassen en niet meer: KLANT-BLIND wekt, al het andere wacht tot de ochtend `[N8 V9 F10]`
- Eén vaste rit per week voor alle klantwijzigingen, cut-off donderdag 17:00 `[N8 V9 F10]`
- Twee prioriteitsklassen: "site plat" rijdt direct, de rest is verzamelvracht `[N7 V9 F9]`
- Kanban-limiet van drie open klantzaken, met een wachtrij die klanten zelf kunnen zien `[N8 V8 F8]`
- De vakantieschakelaar: één knop zet alle accounts in gedegradeerde maar werkende modus, vooraf verkocht als onderhoudsweek `[N9 V8 F10]`
- Nooit batchen: de eerste veertien dagen van een nieuwe klant, en elk betaalprobleem `[N8 V9 F9]`

**De omstel verlagen in plaats van de batch vergroten**
- Elke klantklus start vanaf één identiek startpunt met dezelfde mapstructuur, commando's en volgorde `[N8 V9 F9]`
- Magazijnvoorraad: vijf kant-en-klare ongebonden klantomgevingen die alleen nog een naam nodig hebben `[N9 V8 F9]`
- Onboarding als speedrun met een zichtbare klok en een persoonlijk record; elke trage run levert precies één toegestane bouwtaak op om de volgende sneller te maken `[N9 V8 F9]`

**Support die zichzelf wegneemt**
- Klantzelfbediening als één Instellingen-tegel met terug-naar-standaard en een audit-log `[N6 V9 F10]`
- Wekelijkse gezondheidsmail per klant met "alles werkt / dit staat open", die de hele categorie geruststellingsbelletjes wegneemt `[N7 V9 F9]`
- Supportvragen per WhatsApp eerst beantwoord door de chatbot van zijn eigen product, alleen doorzetten als het spoor te zwak is `[N9 V7 F10]`
- Tekstwijzigingen door inspreken: het systeem toont een voorstel, de klant keurt goed, de founder ziet alleen een log `[N9 V7 F10]`
- Elke klantsite statisch en gecached, zodat hij blijft staan als het backend plat ligt `[N8 V8 F9]`

**Het spoor van de vorige klant verlaagt het werk bij de volgende** — grotendeels **[wacht op klanten]**
- Elke instelling die ooit is aangepast wordt de default-suggestie voor de volgende klant in hetzelfde vak en dezelfde regio `[N9 V7 F9]`
- Een gedeelde vak-kennisbank die alleen groeit uit geanonimiseerde vraagpatronen, met een eigen laag eroverheen die zwaarder weegt `[N9 V7 F8]`
- Doorverwijzing geeft de verwijzer korting en laat de nieuwe klant zijn instellingenprofiel overerven `[N9 V7 F9]`
- Het systeem detecteert wanneer meerdere klanten dezelfde onbeantwoorde vraag krijgen en zet die bovenaan, zodat de founder per patroon werkt in plaats van per klant `[N9 V7 F9]`

**De founder als speler** (het frame dat over hem gaat, niet over het product)
- Bouwkrediet: elk gesprek met een prospect levert 30 minuten bouwtijd op, en zonder saldo gaat de editor niet open `[N10 V6 F10]`
- Dagelijkse eindstand op een fysiek kaartje: hoeveel mensen gesproken, hoeveel klanten gered, hoeveel minuten gebouwd, **waarbij de derde regel altijd de kleinste moet zijn** `[N9 V8 F10]`
- Seizoensplit: maandag tot en met donderdag is de editor dicht, het weekend is bouwseizoen `[N8 V6 F9]`
- HP-balk per klant die leegloopt zonder contact, zodat beheer 25 healthbars boven de rode lijn houden wordt `[N9 V7 F8]`
- Permadeath op features die 60 dagen door geen betalende klant zijn aangeraakt `[N9 V5 F7]` **trap**

**Trap:** permadeath op ongebruikte features klinkt streng en zuiverend, maar bij nul betalende
klanten verwijdert die regel letterlijk alles wat er staat. Hij kan pas bestaan als er klanten
zijn om "aangeraakt" mee te meten.

### Wat de game-designtak hier eigenlijk zegt

Twee van deze ideeën gaan niet over het product maar over de founder, en ze zijn de moeite van
het serieus nemen waard omdat ze aansluiten op wat in `SELLING.md` al zelf is vastgesteld:
bouwen is de vorm die uitstel hier aanneemt. Het bouwkrediet maakt van de vermeden activiteit
de **valuta** in plaats van de straf, waardoor de beloning van bouwen intact blijft. Het
dagkaartje met drie regels waarvan de derde altijd de kleinste moet zijn, meet het zonder er
een oordeel van te maken.

Geen van beide is een systeem dat gebouwd moet worden. Dat is precies waarom ze hier passen.

### Uitgediept: beheer door begrenzing

**De dragende zin die alles bij elkaar houdt:** *het systeem is 24/7, de mens is werkdagen 8
tot 18* — en die twee worden in de verkoop nooit door elkaar gehaald.

**Het weekritme.** Maandag tot en met donderdag één triageslot van twintig minuten (20:00 tot
20:20) waarin elk bericht in precies twee bakjes valt: SITE PLAT of KLANT-BLIND rijdt direct,
al het andere is verzamelvracht. Geen derde bakje, dus sorteren kost seconden. Cut-off donderdag
17:00. Vrijdagavond 18:00 tot 22:00 rijdt de rit: alle tekstwijzigingen, kennisbank-updates en
configuratiewerk van 25 klanten in één blok, WIP-limiet drie. Zaterdagochtend buffer en
onboarding. Maandagochtend 07:00 gaat de gezondheidsmail automatisch uit.

**Bij 25 klanten is dat ~7,5 tot 8 uur per week** naast een fulltime baan, mits nieuwe klanten
apart begroot worden op drie uur onboarding elk.

**Buiten 8 tot 18 is er technisch geen kanaal.** Supportnummer naar voicemail met
terugbelnotitie, automatische mailreply (*"we lezen dit op de eerstvolgende werkdag vanaf 8:00.
Uw klanten worden ondertussen gewoon opgevangen, dat stopt nooit"*), en één apart alarmnummer
dat uitsluitend afgaat bij KLANT-BLIND.

**Dragend risico: de founder sloopt de muur zelf bij klant 1 tot 5, en kan hem daarna niet meer
terugzetten bij klant 20.** Precedent is duurder dan een verloren deal. Wie op 21:00 antwoordt,
verkoopt stilzwijgend 21:00 aan alle 25 volgende klanten.

**Het antwoord op de verkoopspanning is niet wegmoffelen maar hardop splitsen.** *"Wij zorgen
dat u geen klant meer mist"* gaat over uw klanten, en dat systeem staat 24 uur per dag aan.
*"Werkdagen 8 tot 18"* gaat over mij, en dat is precies waarom het systeem zo gebouwd is dat het
mij 's nachts niet nodig heeft. **Een leverancier die 's nachts moet ingrijpen om uw telefoon te
laten werken, heeft iets slechts gebouwd.** Bewijs het met een echt nachttranscript. Wie hierna
alsnog 24/7 menselijke bereikbaarheid eist, is geen €99-klant maar een klant die de marge opeet.

**De vrijdagrit is het echte pijnpunt**, en het antwoord is tweeledig: tarieven, openingstijden
en een spoedmelding zet de klant **zelf** live in het dashboard (die categorie mag nooit in de
rit, want vier dagen wachten kost hem geld), en voor de rest is er één betaalde klep:
**spoedwijziging buiten de rit, €49, binnen 4 werkuren.** Die prijs is geen omzetmodel maar een
filter: wie echt haast heeft betaalt, de rest ontdekt dat vrijdag prima was, en de founder hoeft
nooit meer op gevoel te beoordelen of iets "echt dringend" is.

**Eerste stap, 90 minuten en €0, geen code.** Schrijf de Serviceafspraak op één A4 (max 350
woorden, geen juridische taal): bereikbaarheid, systeem 24/7, de twee storingsklassen, de
vrijdagrit met cut-off, de zelfbedieningsvelden, de €49-spoedklep, twee onderhoudsweken per
jaar, en de twee uitzonderingen. Publiceer op `belvanger.nl/serviceafspraak`, hang hem onder de
offerte, en zet de auto-reply en voicemailtekst nu al live — **vóórdat prospect nummer één iets
anders heeft gehoord. Verwachtingen zijn gratis om vooraf te zetten en peperduur om achteraf
terug te draaien.**

**Kinderen.** Eén zelfbedienbaar veldenblok (tarieven, openingstijden, "even niet bereikbaar"),
geen volledig CMS · zichtbare wachtrij plus spoedknop: *"Rit van vrijdag 15 augustus, 2 van 3
plekken bezet"* · de belofte-splitsing als vast blok op de site · een **precedentlogboek** van
één regel per doorbreking, waarbij drie doorbrekingen in een maand een herziening van het ritme
triggeren en niet van de discipline · de eerste veertien dagen verkopen als benoemd
"Startprogramma" met drie vaste belmomenten en een expliciet einde, zodat het enige onbatchbare
werk eindig en verkoopbaar wordt.

---

## Iteratie 7 — Prijs- en pakketstructuur

Frames: markten · inversie · tienjarig kind · toezichthouder. Vier geïsoleerde takken, 24 ideeën.
**Dit is het commercieel beslissende oppervlak van de hele loop.**

### De convergentie

Drie onafhankelijke frames zeggen hetzelfde: **de vlakke €99 subsidieert precies de beste
klanten, en het model haalt het inkomensdoel rekenkundig niet.** De sabotage-formulering uit het
inversie-frame is de scherpste: *zo word je bang voor succes en durf je bij verlenging niets te
vragen, omdat het verbruik als je eigen fout voelt.*

### Clusters

**Prijs die meebeweegt met volume**
- Tweedelig tarief: vaste voet inclusief bundel, daarboven per gesprek `[N8 V9 F10]`
- Gesprekskrediet vooruit, verbruik erboven automatisch doorbelast zonder gesprek `[N8 V9 F10]`
- Staffels op geleverde waarde, automatisch en in het contract, **zodat de founder nooit hoeft te onderhandelen** `[N9 V8 F10]`
- Fair-use-drempel op sms, vooraf zichtbaar op de prijspagina `[N8 V9 F10]`
- Ingebouwde jaarlijkse indexatie plus herijking na twaalf maanden, ondertekend op dag één `[N8 V9 F10]`

**Toetsbaarheid van de prijsclaims**
- Definieer "de eerste opgevangen gemiste klant" als één meetbare gebeurtenis met een logregel die de klant zelf kan inzien `[N9 V9 F10]`
- De doorgestreepte €1.250 pas op de site zodra één klant hem betaald heeft; tot die tijd een onderbouwing die wél bewijsbaar is `[N7 V9 F10]`
- Aftellende teller met startdatum in plaats van "eerste tien founding-partners" `[N8 V9 F9]`
- Prijzen als "excl. btw (incl. €x)", plus KvK, btw-nummer en adres in de footer `[N6 V9 F10]`

**Capaciteit als prijsinstrument**
- Maximaal twaalf klanten regulier, publieke wachtlijst, toeslag om die over te slaan `[N9 V7 F10]`
- Postcode-exclusiviteit: één loodgieter per gemeente, prijs stijgt zodra een tweede zich meldt `[N10 V6 F9]`
- Twee pakketten die elkaar uitleggen: €99 waarbij hij zelf terugbelt, €249 waarbij Belvanger de afspraak in de agenda zet `[N8 V8 F10]`
- Setup blijft €1.250; de generatorwinst gaat naar marge, niet naar korting `[N8 V8 F9]`

**Eerlijkheid als prijsmechanisme**
- Seizoenspauze: de hovenier drukt in december op pauze `[N8 V8 F9]`
- Jaarcontract vooruit als werkkapitaal voor de volgende tien klanten `[N7 V7 F9]`
- Gratis tot de klant zelf op "deze klus heb ik gewonnen" klikt `[N9 V6 F8]`

**Traps** — alle vier uit het tienjarige-frame, en alle vier om dezelfde reden: **niet
verifieerbaar.** Een percentage van de binnengehaalde omzet, betalen per gesprek waarbij de
vakman zelf de prijs bepaalt, de eerste drie klussen als betaling, en de klant die zelf uit drie
bedragen kiest. Ze voelen eerlijk en ze zijn alle vier afhankelijk van zelfgerapporteerde cijfers
die je niet kunt controleren en niet kunt innen.

### Uitgediept: de prijskaart

**Wat er op de site komt:**

> **Eenmalig €595 opstart. Daarna €149 per maand, inclusief 150 opgevangen gesprekken.
> Daarboven €0,60 per gesprek, met een maximum van €249 per maand. Hoger wordt je rekening
> nooit.**

Daaronder de fair-use-regel vóór de handtekening (*"boven 500 gesprekken per maand bellen we je,
dan past een ander pakket bij je"*), de betaalgebeurtenis in gewone taal (*"je maandbedrag start
pas bij je eerste opgevangen klant: een gemiste oproep waarop wij binnen 2 minuten een sms
stuurden waarop de beller antwoordde. Je ziet die regel met datum en tijd in je dashboard"*), de
capaciteit (*"wij nemen nog 20 vaste klanten aan, daarna wachtlijst"*) en de seizoenspauze
(*"maximaal 3 maanden per jaar winterstop op €49"*).

**De rekensom:**

| | Gesprekken | Betaalt | Sms-kosten | Brutomarge |
|---|---|---|---|---|
| Gemiddelde klant | ~90 | €149 | ~€11 | **€138 (93%)** |
| Drukke klant | ~300 | €239 | ~€36 | **€203** |

**De marge stijgt nu mét het volume in plaats van te dalen.** Dat is de kernfout van het
€99-model, omgekeerd. Over een portefeuille van 70% gemiddeld en 30% druk: ~€162 omzet en ~€146
marge per klant. Het doel van €2.500 tot €3.500 vraagt daarmee **17 tot 24 klanten in plaats van
30 tot 40**, en dat valt binnen de leveringscapaciteit van 15 tot 25. De bovenkant van het doel
ligt wel op de bovenkant van de capaciteit, dus de cap staat hard op 20 en de setupfees (20 ×
€595 = €11.900 in jaar één) dragen het verschil.

**Dragend risico: dit is een prijsarchitectuur voor nul klanten, en kan daarmee zelf het uitstel
worden.** Vier afwegingen:

1. **Onvoorspelbaarheid.** Een vakman koopt rust, en €40 extra in zijn beste maand voelt als een
   boete op succes. Het **plafond van €249 is daarom geen detail maar de dragende constructie**:
   variabel naar boven, met een dak dat hij vooraf kent.
2. **Uitlegbaarheid.** Elke staffel is iets extra's om te verkopen in een gesprek dat de founder
   al vermijdt. Daarom mag de staffel **niet in het gesprek zitten maar in het product**:
   verbruiksmeter in het dashboard, waarschuwings-sms bij 120 gesprekken. Het verkoopgesprek gaat
   over één getal: €149.
3. **Meten is factureren.** Zodra de rekening van een telling afhangt, is een telfout een
   factuurgeschil met iemand die je zijn telefoonlijn heeft toevertrouwd. De telling moet
   exporteerbaar, per gesprek herleidbaar en **conservatief** zijn: bij twijfel telt hij niet mee.
4. **Wat nu vast moet en wat kan wachten.** Onomkeerbaar duur om later toe te voegen, want anders
   wordt klant één het plafond van het bedrijf: het getal op de site, de fair-use-zin, de meetbare
   definitie van de betaalgebeurtenis met zichtbare logregel, en de indexatie- plus
   herijkingsclausule. Alles daarna (automatische overage-facturatie, extra staffels, formele
   winterstopvoorwaarden, wachtlijstpagina) kan wachten tot klant drie.

**De grootste verliespost blijft dat de prijs nooit aan een echte vakman is gevraagd. Elk bedrag
hierboven is een hypothese, geen bevinding.**

**Eerste stap.** Zet de prijskaart op één A4 en leg hem binnen zeven dagen aan **vijf echte
vakmensen** voor. Geen demo, geen pitch, alleen het blad en vier vragen: *"Bij welk bedrag zou je
dit meteen doen? Bij welk bedrag zou je nee zeggen? Wat is hier onduidelijk? Wat zou je hier
weghalen?"* Noteer de antwoorden letterlijk. **Tot die vijf antwoorden er zijn, wordt er niets aan
de facturatie- of tellogica gebouwd.**

**Kinderen.** Het plafond letterlijk op de pagina · **meten vanaf dag één, factureren vanaf klant
drie** (de teller draait, maar de eerste drie klanten betalen twaalf maanden nooit meer dan €149,
zodat je de bundel kalibreert op echt verbruik vóór de telling geld waard wordt) · alleen
gesprekken waarop de beller antwoordde tellen mee, waarmee de prijs van een kostenpost een
succesvergoeding wordt · de staffel tonen en niet uitleggen · de doorgestreepte prijs vervangen
door drie echte, geanonimiseerde offertes van lokale webbouwers.

---

## Iteratie 8 — Retentie, mond-tot-mond en meetbaarheid

Drie oppervlakken samengevoegd (9, 10 en 15), omdat het één systeem is: een klant die zijn
waarde ziet, blijft én vertelt het door, en beide hangen aan hetzelfde mechanisme.

Frames: biologie · game designer · markten · inversie. Vier geïsoleerde takken, 24 ideeën.

### De convergentie

Vier onafhankelijke frames komen op hetzelfde uit, en het corrigeert het antwoord dat iteratie 2
gaf. Daar was het tegengif voor onzichtbaarheid een maandbericht met **aantallen**. Deze ronde
zegt: **anonieme aantallen repareren de onzichtbaarheid niet. De waarde moet een naam en een
tijdstip krijgen, en de verdienste moet bij de vakman liggen, niet bij Belvanger.**

De sabotageformulering uit het inversie-frame maakt het scherp: *wie nooit één concreet gezicht
heeft gezien dat anders was weggelopen, kan in december geen enkele zin noemen over wat het hem
opleverde.*

### Clusters

**De waarde krijgt een naam en een gezicht**
- Eén sms per maand met een gezicht erin, niet met een totaal: *"nummer 4 was Jansen Bouw, die belde zondag om 21:40"* `[N9 V9 F10]`
- Het cijfer gaat over hem, niet over het product: *"je belde 11 van de 14 terug, gemiddeld binnen 22 minuten"* `[N9 V8 F10]`
- Eén cijfer per maand dat hij zelf niet kan weten: *"14 mensen belden die je niet opnam, 9 daarvan hadden je nog nooit eerder gebeld"* `[N9 V8 F10]`
- In maand vijf belt de founder om te vragen welke opgevangen bellers klus zijn geworden, en dat bedrag staat daarna elke maand in de sms `[N8 V7 F10]`
- Elke gemiste-oproep-sms sluit af met het lopende totaal sinds de startdatum `[N8 V9 F9]`
- Onthoudingsdemo: één keer per kwartaal tonen wat hij zónder Belvanger niet had gezien `[N9 V7 F8]`

**Hij bouwt iets op dat van hem is**
- Het klantendossier: elke opgevangen oproep wordt een regel in zijn eigen adressenlijst, exporteerbaar met één knop `[N8 V9 F10]`
- Zijn eigen antwoorden zitten in de chatbot: onbekende vragen komen per sms naar hem toe, hij antwoordt in gewone taal, de bot leert het `[N9 V8 F10]`
- Imprinting op de stem: de bot neemt in de eerste 30 dagen zijn eigen groet en afsluitzin over `[N9 V7 F9]`
- Maandelijkse PDF plus CSV die hij bij opzegging gewoon meeneemt; wat hij verliest is niet zijn data maar de doorlopende reeks `[N8 V9 F9]`

**Doorvertellen zonder erom te vragen**
- Een fysiek A4 twee keer per jaar, met een extra exemplaar "voor als iemand ernaar vraagt" `[N9 V8 F9]`
- De collega-koppeling: hij mag één vakgenoot een half jaar gratis meenemen, zelf gekozen, en er wordt daarna nooit meer om een naam gevraagd `[N9 V8 F9]`
- Elke terugbel-sms aan de eindklant sluit af met één regel in zijn stem, zodat de particulier de vector wordt `[N9 V8 F8]`
- Een maandelijks regionaal feit dat gemaakt is om ongewijzigd in een WhatsApp-vakgroep geplakt te worden `[N8 V7 F8]`
- Openbare regiopagina met alleen de vakmensen die aantoonbaar binnen X uur terugbellen `[N10 V6 F9]` **[wacht op klanten]**

**Wederkerigheid en territorium** — **[wacht op klanten]**
- Leads die buiten zijn vakgebied vallen met één sms doorsturen naar een collega die hij zelf heeft aangedragen, waarmee hij een netwerk van openstaande wederdiensten opbouwt `[N10 V6 F9]`
- Territoriummarkering: tonen hoeveel aanvragen in zijn postcodegebied nog rondzwerven, met een beperkt aantal plekken per gemeente `[N9 V6 F8]`
- Jaarlijkse regiobrief per vak, waarbij een opgezegde klant de laatste editie houdt `[N8 V7 F8]`

**Het ritme moet een gezicht hebben**
- De vrijdagrit bevestigen met één zin van de founder over wát er veranderde en waarom het geld scheelt, niet met een automatische mail `[N8 V8 F9]`
- De onderhoudsweken vooraf aankondigen mét een concrete verbetering die hij niet had gevraagd `[N8 V8 F8]`
- Eén keer per kwartaal belt Belvanger hém, vier minuten, waarin hij als vakman wordt behandeld en niet als gebruiker `[N8 V7 F9]`

### Waarom dit iteratie 2 corrigeert

Iteratie 2 ontwierp een product dat je nooit hoeft te openen, en noemde waarde-onzichtbaarheid
als het dragende risico met een maandbericht als oplossing. Iteratie 8 laat zien dat dat
maandbericht in de voorgestelde vorm (*"23 aanvragen, 19 binnen het uur"*) het probleem niet
oplost, omdat een aantal geen verhaal is. **Een naam en een tijdstip zijn dat wel**, en het cijfer
moet over zijn eigen prestatie gaan, want daar is hij trots op en dat noemt hij uit zichzelf bij
de groothandel.

### Uitgediept: de verdienste is van hem

**Het ritme over twaalf maanden.** Maand 1, bij de intake: schrijf letterlijk op welke vraag hij
zelf altijd aan de telefoon stelt (*"waar zit het, en staat er nu nog water?"*), die zin wordt
regel één van de chatbot. En maak één meetafspraak die de rest van het jaar draagt: terugbellen
doe je via de knop in het sms'je, want dat is de teller.

Vanaf dag 30 één sms per maand, altijd dezelfde dag, drie dingen en nul links:

> *"Belvanger, augustus. Je hebt 7 bellers teruggebeld die je anders was misgelopen, gemiddeld
> binnen 22 minuten. De laatste was Jansen Bouw, zondagavond om 21:40. Je hoeft niets te doen."*

Maand 3: het eerste A4 op de mat, zijn bedrijfsnaam groot bovenaan, Belvanger klein onderaan,
plus een tweede exemplaar. Precies in de maand waarin het opzeggevoel opkomt en een sms allang
uit de inbox is. Maand 5: tien minuten bellen, **niet** met de open vraag wat het heeft opgeleverd
maar met de namenlijst in de hand: *"Jansen Bouw, badkamer, 12 januari, is die doorgegaan?"* Een
geheugentaak in plaats van een beoordeling. Vanaf maand 6 staat zijn eigen geld in de sms, en de
collega-koppeling komt niet als vraag maar als voorwerp: het tweede A4 krijgt één regel mee.

**Dragend risico, en het is niet wat je zou denken.** Niet de AVG en niet de prijs, maar dit:
**het cijfer gaat over hem, dus moet het kloppen in zijn beleving, en Belvanger meet iets wat het
strikt genomen niet ziet.** Belt hij terug vanuit zijn eigen oproeplijst in plaats van via de
knop, dan zegt de sms *"je belde er 2 terug"* terwijl hij er 14 belde. **Een bericht dat hem
onterecht klein maakt vernietigt meer vertrouwen dan helemaal geen bericht.** Daarom hoort de
meetafspraak in maand 1 en niet later, en valt de sms bij een onbetrouwbare teller terug op alleen
het opvang-aantal plus de naam.

**De AVG-lijn is scherper dan verwacht en werkt in je voordeel.** De beller gaf zijn naam zélf in
de sms-dialoog, met exact het doel om door die vakman teruggebeld te worden. Diezelfde naam in het
maandbericht aan diezelfde vakman zetten is geen nieuwe verstrekking. **Wat niet mag:** namen
verrijken via nummerherkenning, KvK of telefoongids; namen op een A4 dat op de balie kan blijven
liggen; namen in marketing, testimonials of screenshots; namen langer dan twaalf maanden bewaren.
Waar de beller geen naam gaf, wordt het gezicht **een tijdstip plus onderwerp**: *"de beller van
zondag 21:40 over een lekkage in de badkamer"* — even concreet, en geen persoonsgegeven van een
derde.

**Nooit een noemer.** Geen "11 van de 14", geen percentage, geen woord over wie hij liet lopen.
Openstaande bellers krijgen wél aandacht, maar **op de dag zelf en operationeel**, één keer, en die
regel komt nooit terug in een maandbericht. *Terugkijken is voor trots, vooruit duwen is voor
vandaag.*

**Het nulscenario is vooraf dichtgetimmerd.** Het maand-5-gesprek gaat alleen door als de teller
terugbellen laat zien; staat die op nul, dan is het geen waardegesprek maar een reparatiegesprek
dat de founder zelf opent. Blijkt het antwoord tóch nul klussen, dan volgt geen prijsgesprek en
geen korting, maar één concrete aanpassing plus een hercheck in maand 7.

**Tijd bij 20 klanten:** ~40 minuten maand-sms, ~30 minuten maand-5-gesprekken, en twee A4-rondes
van 80 minuten per jaar. Ongeveer **1,5 uur per maand op €2.980 maandomzet.** Harde grens: kost
dit ritme meer dan drie minuten per klant per maand, dan deugt het ontwerp niet.

**Eerste stap, 30 tot 40 minuten.** Twee blokken in `docs/templates/belvanger-klant-intake.md`:
(A) *"Wat is de eerste vraag die je zelf stelt als iemand belt? Zeg het precies zoals je het
zegt"*, woordelijk overnemen, geen herformulering. (B) De meetafspraak. En in de sms-flow: de
belknop registreert de tik, en de naam die de beller zelf opgeeft wordt gelabeld als "door beller
opgegeven", want alleen die naam mag straks in de maand-sms. **Dit kost bij nul klanten niets en is
achteraf niet te reconstrueren: klant één levert vanaf dag één de data die maand 12 draagt.**

---

## Iteratie 9 — De AI-laag tegenover de concurrentie

Frames: de vijandige concurrent · toezichthouder · hardware-engineer · tienjarig kind. Vier
geïsoleerde takken, 24 ideeën. **Strategisch de belangrijkste ronde na de prijs.**

### De convergentie

Vier onafhankelijke frames draaien het gat met de concurrentie om: **stop met concurreren op "wie
neemt het snelst op" en verplaats de meetlat naar "hoe snel helpt een echt mens". Wees daarbij
luidruchtig eerlijk dat er geen robot opneemt.**

De natuurkunde geeft daar dekking voor: een mens verwacht antwoord binnen ~300 ms, en een
spraakketen van herkenning, model en synthese haalt dat niet betrouwbaar over een mobiele
verbinding met een boormachine op de achtergrond. Tekst kent die eis niet.

### Clusters

**Verplaats de meetlat**
- Publiceer het echte "wachttijd tot mens"-getal als productkenmerk, met boeteclausule `[N9 V8 F10]`
- Live reactietijd-teller op de site van de vakman zelf: *hun 3 seconden leiden naar een robot, jouw 8 seconden leiden naar een mens* `[N9 V8 F10]`
- Elke gemiste oproep binnen 8 seconden een sms met naam, klus en terugbelknop `[N7 V9 F9]`

**"Wij nemen nooit op met een robot" als merkbelofte**
- Met garantie: hoort een klant ooit een robot, dan is die maand gratis `[N10 V8 F10]`
- De omkering hardop zeggen: *"ik ben geen mens en ik ga je niet ophouden, ik regel alleen dat Jan je belt"* `[N9 V9 F10]`
- Een openbare vergelijkingsgids waarin je de AI-telefonisten van de concurrentie zelf belt, de blunders publiceert, en eerlijk zegt wanneer zij de betere keuze zijn `[N9 V7 F8]`

**Vervang gesprek door structuur** (ruisimmuun bij dialect, paniek en keukengeluid)
- Genummerd sms-keuzemenu: 1 = lekkage nu, 2 = offerte, 3 = afspraak verzetten `[N8 V9 F10]`
- Grote knoppen in de chat in plaats van antwoorden: *"Loopt er water? JA / NEE"* `[N8 V9 F10]`
- Vooraf opgenomen menselijke stem met toetskeuze, zonder herkenning en synthese in het pad `[N8 V8 F9]`
- Voicemail die binnen 60 seconden getranscribeerd als push aankomt, met de ruwe audio als bijlage `[N7 V9 F9]`

**Zet de intelligentie waar vertraging gratis is**
- Bij terugbellen krijgt de vakman eerst 15 seconden briefing voordat de lijn doorschakelt `[N10 V7 F10]`
- Terugbelcoach: geen kale melding maar drie regels met wat de beller zei, wat het waarschijnlijk oplevert, en de eerste zin die hij uitspreekt `[N9 V8 F10]`
- Terugbelplanner: de sms biedt drie tijdvakken die de vakman zelf vooraf vrijgaf, de eerste tik boekt `[N9 V8 F9]`

**Eerste hulp vóór het gesprek**
- *"Zet je kraan dicht bij de meter, hier is een filmpje van 20 seconden, Jan belt je over 12 minuten"* `[N10 V8 F10]`
- De aftelklok: wat de beller eng vindt is niet de stilte maar het niet-weten `[N9 V8 F9]`
- Eén echt spraakbericht van 15 seconden per dag van de vakman zelf, naar elke gemiste beller `[N9 V8 F9]`

**Toetsbaarheid van een AI die met consumenten praat**
- Harde noodwoordenlijst (gaslucht, rook, water bij de meterkast, geen verwarming bij vorst) die de AI onmiddellijk uit het script haalt `[N8 V9 F10]`
- Niveau-verklaring in de eerste zin: niet alleen *dat* het AI is maar *wat* het mag: *"ik noteer uw vraag, ik maak geen afspraak en ik noem geen prijs"* `[N8 V9 F10]`
- Herkomstlabel per toezegging, verwijzend naar de versie van de door de vakman ondertekende feitenlijst `[N9 V8 F9]`
- Kwetsbaarheidsdetector die bij paniek of verwarring afbreekt en een mens forceert, met een teller die de vakman maandelijks ziet `[N9 V7 F9]`
- Publieke AI-bijsluiter per klant: model, land van verwerking, bewaartermijn, wat de AI weigert, hoe je een mens bereikt `[N8 V9 F9]`
- Gespreksbewijs: tijdgestempeld transcript naar vakman én beller, zodat *"maar uw robot zei..."* weerlegbaar wordt `[N8 V8 F9]`

**Trap:** bij een gemiste oproep ook de drie collega's in de buurt sms'en en de eerste die "JA"
stuurt de klant geven `[N9 V5 F7]`. Elegant vanuit de beller gezien, maar het verandert Belvanger
in een leadmarktplaats en dat is precies het model waar vakmensen elkaar voor waarschuwen.

### Uitgediept: de Terugbelkaart

**Eén product, één positionering.** Op t+8 seconden precies één sms (plafond twee segmenten,
~€0,16):

> *"Je belde Jan van Loodgietersbedrijf Jansen. Jan staat nu onder een aanrecht. Bij ons neemt
> nooit een robot op. Antwoord 1 = lekkage/storing NU, 2 = offerte, 3 = afspraak. Of tik:
> blvg.nl/x7k2"*

Die link opent **de Terugbelkaart**, en daar staat alles wat anders extra sms'jes zou kosten, dus
gratis: drie duimgrote knoppen, eerste hulp bij zijn keuze (*"draai de hoofdkraan dicht bij de
meter, filmpje 22 seconden"*), en onderaan een aftellende klok naar een tijdstip **dat de vakman
zelf heeft gezet**: *"Jan belt je vóór 14:45, nog 11:38."*

De vakman krijgt één push: *"14:12 gemist, 06-…, koos 1 SPOED, Herenweg 4 Zwolle, bestaande klant,
cv-ketel maart 2025"* met drie knoppen: **ik bel binnen 15 min / 30 min / vanavond**. Die tik zet
de klok bij de klant. Heeft hij op T-2 minuten nog niet gebeld, dan vraagt Belvanger om te
herzetten en stuurt automatisch *"Jan zit nog vast bij een storing, nieuwe tijd: 15:10"* — **een
gebroken belofte wordt zo een proactieve update**, wat de beller eigenlijk wilde. Belt hij, dan
hoort hij eerst 15 seconden briefing voordat de lijn opengaat; daar is vertraging gratis.

De zin op de site: *"Bij Belvanger neemt nooit een robot op. Je klant weet binnen 60 seconden wie
hem terugbelt en hoe laat, deze maand gemiddeld na 11 minuten een echt mens. Hoor je ooit een
robot, dan is die maand gratis."*

**Dragend risico, en dit is de scherpste bevinding van de hele loop.** De positionering leunt op
gedrag dat Belvanger niet bezit: het terugbellen zelf. Bij een slordige vakman publiceert het
product zijn eigen falen en krijgt Belvanger de schuld en de opzegging.

**Erger: precies de vakman die het meest voor opvang wil betalen, is degene die níét wil
terugbellen. Die koopt Klusio.** Belvanger selecteert dus op vakmensen die al fatsoenlijk
terugbellen, en dat is een kleinere markt die het probleem het minst voelt.

De mitigatie is een **diskwalificerende intakevraag**: *"bel jij je gemiste oproepen normaal binnen
het uur terug?"* Een nee is geen klant. Verder: de klok wordt door de vakman zelf gezet en nooit
door het systeem geraden, verstrijken is een update en geen stilte, en de boete geldt **alleen**
voor sms-snelheid en de robotbelofte.

**Het eerlijke antwoord op nacht en weekend**, dat je hardop moet durven zeggen:

> *"Klopt, hún robot neemt om 2 uur 's nachts op en noteert. En daarna belt er tot 8 uur alsnog
> niemand terug. Bij ons neemt om 2 uur ook niemand op, maar je klant weet binnen een minuut dat
> jij hem om 07:10 belt, en dat gebeurt ook. Vraag ze eens naar hun mediane tijd tot een echt mens
> 's nachts. Dat cijfer publiceert niemand, ik wel."*

Voor echte 24/7-spoed verlies je die deal gewoon, **en dat is goedkoper dan hem winnen.**

**Hoe je voorkomt dat "wij nemen nooit op" klinkt als een gebrek:** laat het bewijs van de keuze
zien. De klikbare demokaart, **de eigen afgekeurde AI-testopname met een boormachine op de
achtergrond**, en de live mensmeter. De spraakrobot is het goedkope deel; triage, briefing en
eerste hulp zijn het dure deel, en dat is wat je wél hebt gebouwd.

**Wat vandaag gratis is:** de zin, de garantie, het gemeten getal, de demokaart en de afgekeurde
AI-opname. Dat is positionering, geen bouwwerk. **Wat kan wachten:** de fluisterbriefing, de
eerste-hulpfilmpjes per vak, klantgeschiedenis en de automatische herzet-flow. Bij drie klanten
draai je die met de hand.

**Eerste stap, ~2 uur.** Eén statische demo-Terugbelkaart op `belvanger.nl/terugbelkaart`: drie
knoppen, het eerste-hulpblok voor lekkage, een JS-klok die live aftelt, en de robotbelofte met
garantie erboven. Neem daarnaast met je eigen telefoon één echte testcall op met de AI-belrobot van
een concurrent, mét afzuigkap of boormachine op de achtergrond, en zet die veertig seconden audio
ernaast. Stuur die ene link naar de twee prospects die al zijn aangeschreven: *"ik heb dit gebouwd
voor mensen zoals jij, mag ik tien minuten om te horen of het klopt?"* **Een klikbare kaart vraagt
om een reactie, een pdf niet.**

**Kinderen.** De mensmeter als embed-badge op de site van de vakman zelf (conversiewinst voor hem,
gratis distributie voor jou, en een schakelkosten-anker) · de afkeurband als content die de
concurrent niet kan beantwoorden zonder zijn eigen product te bekritiseren · het dagelijkse
spraakbericht van 15 seconden dat de hele dag bovenaan elke Terugbelkaart staat · **concierge-modus
voor klant 1 tot 3**: geen automatisering, de founder draait de relay met de hand in een servicevenster
van 08:00 tot 20:00 · de asymmetrische boeteclausule die luid scheidt wat Belvanger beheerst van wat
de vakman beheerst.

---
