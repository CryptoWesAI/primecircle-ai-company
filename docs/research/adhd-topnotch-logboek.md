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
| Iteraties gedraaid | 1 |
| Oppervlakken gedekt | 1 van 15 |
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
| 2 | Klantdashboard: het dagelijkse gebruik door de vakman | open |
| 3 | Onboarding: van "ja" tot live | open |
| 4 | De automatiseringen: n8n, sms, push, chat | open |
| 5 | Backend-stack: Twilio/Bird, OpenRouter, NocoDB, Cal.com, Mollie | open |
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
