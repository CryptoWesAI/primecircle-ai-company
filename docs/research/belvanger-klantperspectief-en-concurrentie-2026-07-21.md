# Belvanger: klantperspectief-audit + concurrentieonderzoek

> Doel: objectief bekijken waar de site en het dashboard nog niet aansluiten op de
> behoefte van de doelklant (vakman/vakbedrijf), en wat vergelijkbare spelers in 2026
> doen. Datum: 2026-07-21. Website en dashboard live bekeken (screenshots, geen
> aannames); concurrentiedata extern onderzocht, bronnen per claim.

## Deel 1: Eigen audit, ogen van de klant

### Website (belvanger.nl)

**Wat goed werkt:**
- Sterke hero met een concrete, herkenbare pijn ("Mis nooit meer een klant") en een
  visuele telefoon-mockup die het mechanisme in één oogopslag uitlegt.
- "Herken je dit?"-sectie met drie zeer specifieke, herkenbare scenario's (avond-
  voicemail, onbekend nummer tijdens het werk, drie keer bellen terwijl je op het dak
  staat) in plaats van generieke pijnpunten.
- Interactieve rekenmachine ("Wat kost het jou?") die de klant zelf laat uitrekenen
  wat gemiste oproepen kosten, met bron vermeld (Infopact-onderzoek).
- Transparante prijs (€99/mnd, founding-tarief zichtbaar) plus een sterke garantie:
  "je maandbedrag gaat pas lopen zodra Belvanger je eerste gemiste klant heeft
  opgevangen" (eerst werken, dan pas betalen). Dit is een ongebruikelijk sterke
  risico-omkering voor deze prijsklasse.
- FAQ pakt de twee grootste bezwaren direct aan: "moet ik mijn nummer veranderen?"
  (nee) en "moet mijn klant een app installeren?" (nee).
- Het founding-aanbod vraagt in ruil voor de korting expliciet om een eerlijke review
  en een aanbeveling, dus sociaal bewijs is al ingebouwd in het proces, alleen nog
  niet gevuld.

**Gaten die de klantbehoefte niet raken:**
1. **Geen inlogknop voor bestaande klanten.** De header heeft alleen "Plan een
   gesprek". Een klant die al betaalt heeft geen voor de hand liggende weg terug naar
   dashboard.belvanger.nl vanaf de site zelf.
2. **Geen enkel bewijs dat het product echt bestaat en werkt.** Geen testimonial,
   geen logo, geen cijfer uit de praktijk. Begrijpelijk bij 0-1 klanten, maar zodra er
   een eerste tevreden klant is (en die review is letterlijk al onderdeel van het
   founding-aanbod), hoort dit meteen op de site.
3. **De klant ziet nooit het dashboard zelf.** De hero laat het concept zien (een
   telefoon die overgaat), maar nergens een screenshot of korte opname van waar de
   klant dagelijks naar kijkt. Dat maakt "je eigen dashboard" abstracter dan nodig.
4. **WhatsApp is ondergesneeuwd.** In de praktijk verloopt de daadwerkelijke
   levering van leads via WhatsApp, maar op de site duikt WhatsApp alleen op als
   klein contactlinkje in de footer, niet als voordeel/feature.

### Dashboard (klantweergave: Overzicht, Contacten, Kanalen, Zichtbaarheid, Hulp)

Bekeken zoals een klant (niet platform-beheer) het zou zien: strak, snel, consistente
premium-stijl, live tijdlijn, statuskaarten. Geen bugs of overflow gevonden.

**Gaten die de klantbehoefte niet raken:**
1. **Geen realtime melding bij een gemiste oproep.** De klant moet zelf het
   dashboard openen om te zien dat er iets is gebeurd; er gaat geen WhatsApp, e-mail
   of pushmelding uit op het moment zelf. Voor een vakman die op de steiger staat is
   dit het belangrijkste ontbrekende stuk: hij weet niet dat hij iets moet
   terugbellen totdat hij toevallig inlogt. Dit raakt de kern van de belofte "mis
   nooit meer een klant" directer dan welk ander punt hier.
2. **Geen zelfbediening voor de klant.** Opvangnummer, bereikbaarheidstijden,
   n8n-koppelingen en Zichtbaarheid-instellingen zijn allemaal alleen door jou te
   wijzigen. Bij één klant is dat geen probleem; bij tien klanten wordt dat een
   herhaalde founder-tijd-kost voor iets dat de klant zelf zou moeten kunnen doen.
3. **WhatsApp ontbreekt als kanaal in "Kanalen".** Terwijl het in de praktijk het
   kanaal is waarlangs leads binnenkomen, staat het niet als kaart naast
   Website/Telefoon en sms/E-mail. Een klant die zijn kanalen bekijkt mist hierdoor
   het volledige beeld.
4. **Contacten: geen handmatig toevoegen, geen export.** Een klant kan geen
   loop-klant of doorverwezen klant zelf vastleggen, en kan zijn contactenlijst niet
   exporteren (in tegenstelling tot het Activiteitenlog, dat wel een export heeft).
5. **Het "Hulp"-formulier dat ik zonet bouwde heeft geen noodoptie.** Puur e-mail,
   "reageren binnen één werkdag" is prima voor gewone vragen, maar niet voor "mijn
   telefoonsysteem doet het niet meer". Een zichtbare WhatsApp/telefoon-kortweg voor
   spoedgevallen naast het formulier zou beter aansluiten op de urgentie die deze
   doelgroep vaak heeft.
6. **Testdata zichtbaar in de eigen tijdlijn** ("n8n ketentest"-contact,
   "Geautomatiseerde ketentest; veilig verwijderen"). Klein, maar ruim dit op zodra
   dit account ooit als demo/referentie aan een prospect getoond wordt.

## Deel 2: Vergelijkbare spelers in 2026

Extern onderzocht (webresearch, bronnen per claim in de oorspronkelijke agent-run).
Belangrijkste conclusie vooraf: **dit is geen lege markt.** Er zijn minstens zeven
Nederlandse spelers die al een stuk van precies dit probleem bedienen.

### Nederlandse/EU-spelers (dichtstbijzijnde vergelijking)

| Speler | Kernaanbod | Prijs | AI? |
|---|---|---|---|
| **Qluzz** | Gemiste oproep → automatische sms met link, dashboard met naam/nummer/foto's | €39,95/mnd of €395/jr | Nee |
| **MissedCallPro.nl** | Gemiste oproep → automatisch WhatsApp-bericht, geen dashboard | €49/mnd | Nee |
| **VakWerkSysteem** | Breed: gemiste-oproep-sms, sms-afspraken, reviewverzoeken, agenda-sync, foto-verslaglegging | €49-99/mnd + €500 setup | Nee |
| **VakmanAI** | Chatbot/leadkwalificatie (hot/warm/cold), AI-offertes op hogere tiers | €197-697/mnd | Ja (chat, geen telefoon) |
| **Klusio** | AI-telefonist (opneemt binnen 3 sec) + chatbot + WhatsApp-bot, urgente meldingen | vanaf €199/mnd | Ja (spraak) |
| **InstallatieTelefoniste** | AI-spraaktelefonist specifiek voor installateurs, triage bij noodgevallen | €0,25/min, geen abonnement | Ja (spraak) |
| **Sainer** | Algemene AI-receptionist, CRM-koppeling, sentimentanalyse | €50-349+/mnd | Ja (spraak) |

**Geen van deze bundelt alle vier kanalen (bellen + sms + website + e-mail) in één
dashboard met automatische sms-opvang zoals Belvanger dat nu doet.** VakWerkSysteem
komt het dichtst in de buurt qua dashboard-breedte (maar breder/duurder en aan een
eigen website gekoppeld); Qluzz komt het dichtst in de buurt qua mechanisme (maar
smal, geen dashboard-diepte, geen AI). Belvanger's specifieke combinatie is dus nog
vrij open, maar de druk komt van een andere hoek: zie hieronder.

### Internationale spelers (referentiekader, niet direct concurrerend in NL)

| Speler | Kernaanbod | Prijs (instap) |
|---|---|---|
| Podium | Alles-in-één inbox + reviews + AI Employee (5 AI-rollen) | vanaf $399/mnd + AI-add-on |
| Birdeye | Reputatie + inbox + AI-chatbots | $299-449/mnd |
| Broadly | AI-receptionist: chat → sms → spraak, gelaagd naar prijs | $399-999/mnd |
| Weave | VoIP + gemiste-oproep-sms + reviews, gratis VoIP-hardware | ~$249/mnd |
| Smith.ai / Rosie / Dialzara / Goodcall | Losse AI-telefoonassistenten, VS-gericht op zzp/klein bedrijf | $29-300/mnd |
| Jobber / Housecall Pro / ServiceTitan | Bredere planning-CRM met "never miss a lead" er nu native bij | onderdeel van bestaand abonnement |

Signaal om in de gaten te houden: brede planning-suites zoals Jobber bouwen "nooit
meer een gemiste lead" steeds vaker gratis of goedkoop in hún abonnement in. Voor
bedrijven die al zo'n suite gebruiken wordt een los tooltje daardoor minder
aantrekkelijk; Belvanger's wedge werkt het best bij vakbedrijven die nog geen volledig
CRM/planningpakket gebruiken (nu vaak nog WhatsApp/papier/losse telefoon).

### Terugkerende patronen bij vrijwel alle onderzochte spelers

1. Automatische sms/WhatsApp-terugkoppeling bij een gemiste oproep, binnen enkele
   seconden. Overal aanwezig, dit is het absolute basisniveau.
2. Eén centrale inbox over minimaal bellen + sms, vaak ook webchat/social.
3. Automatische reviewverzoeken. Vrijwel overal aanwezig, behalve bij de goedkoopste,
   smalste tools.
4. **AI-spraakopname (niet alleen achteraf een sms'je, maar de telefoon écht
   opnemen)**: dit is het duidelijkste verschil tussen "2023-generatie" en
   "2026-generatie" tooling. Drie van de zeven Nederlandse spelers doen dit al.
5. Afspraken/booking direct vanuit het gesprek of bericht.
6. Lead-kwalificatie/triage (spoed vs. niet-spoed, hot/warm/cold).
7. Geen app nodig voor de eindklant, wel voor de ondernemer (dashboard of melding).
8. Koppeling met agenda/CRM (Google/Outlook, of branche-specifiek zoals Exact/Afas).

## Deel 3: Aanbevelingen, geprioriteerd

Beoordeeld op founderhefboom, klantwaarde, omzetimpact, operationele eenvoud (zoals
het besluitkader voorschrijft). Elke aanbeveling eindigt met een expliciet standpunt.

### Prioriteit 1: klein, direct vertrouwen/duidelijkheid, snel te doen
- **Inlogknop op de site voor bestaande klanten.** Kleine toevoeging, voorkomt dat
  een betalende klant zijn eigen dashboard niet terugvindt. → **Build.**
- **WhatsApp zichtbaar maken** als kanaalkaart in "Kanalen" en als
  spoed-kortweg in "Hulp". Sluit het gat tussen wat er echt gebeurt en wat de klant
  ziet. → **Build.**
- **Testdata opruimen** uit Belvanger's eigen tijdlijn/contacten voordat dit account
  ooit als demo/referentie dient. → **Configure** (opschonen, geen bouwwerk).

### Prioriteit 2: raakt de kernbelofte, verdient een keuze
- **Realtime melding bij een gemiste oproep** (WhatsApp/e-mail zodra het gebeurt, niet
  pas bij het openen van het dashboard). Dit is het punt met de grootste klantwaarde
  uit deze hele audit: het raakt de belofte "mis nooit meer een klant" directer dan
  alle andere gevonden gaten samen, en elke onderzochte concurrent heeft in een of
  andere vorm een realtime kanaal. Bestaande n8n/WhatsApp-infrastructuur is er al,
  dus de bouwkost is waarschijnlijk beperkt. → **Build, hoogste prioriteit van alle
  aanbevelingen hier.**
- **Klant-zelfbediening** voor eigen instellingen (opvangnummer, bereikbaarheid).
  Bij één klant nog geen probleem; wordt een herhaalde founder-tijd-kost zodra er een
  tweede en derde klant bijkomen. → **Delay, expliciet tot de tweede klant**, wel nu
  al vastleggen als bekende toekomstige beperking.
- **Contacten: handmatig toevoegen + CSV-export voor de klant.** Kleine bouwklus,
  lager risico dan de rest van prioriteit 2. → **Build, lagere prioriteit dan
  bovenstaande twee.**

### Prioriteit 3: strategisch, geen haastige beslissing
- **AI-telefoonopname** (een AI die het gesprek zelf opneemt in plaats van pas ná het
  missen een sms te sturen). Dit is de grootste strategische dreiging én kans uit het
  concurrentieonderzoek: drie Nederlandse spelers (Klusio, InstallatieTelefoniste,
  Sainer) en vrijwel de hele Amerikaanse AI-receptionist-categorie doen dit al, en het
  is een sterkere versie van precies dezelfde belofte die Belvanger nu al voert. Dit
  verdient een eigen, volwaardige afweging (bouwen versus samenwerken met een
  bestaande Nederlandse AI-spraakpartij), niet een beslissing die hier tussendoor
  wordt genomen. Gegeven dat de huidige, eenvoudigere sms-opvang-wedge nog niet
  bewezen is met een eerste echt betalende klant, is de kleinste-verkoopbare-oplossing
  nu nog steeds de sms-opvang. → **Delay: eerst het huidige aanbod valideren met
  echte betalende klanten, maar dit expliciet als meest waarschijnlijke fase-2-
  investering markeren, en de tractie van Klusio/InstallatieTelefoniste als signaal
  blijven volgen.**
- **Automatische reviewverzoeken** na een afgesloten klus. Bijna universeel aanwezig
  bij concurrenten, en een natuurlijke uitbreiding van data die al bijgehouden wordt
  (contactstatus "afgesloten"), met hergebruik van de al gebouwde sms/WhatsApp-
  verzendinfrastructuur. → **Build, goede vervolgstap na de realtime melding
  hierboven, want hergebruikt dezelfde bouwstenen.**

## Slotoordeel

Belvanger's fundament (sms-opvang bij gemiste oproep + centraal dashboard) is nog
steeds een geldige, onderscheidende wedge: geen enkele gevonden concurrent bundelt
precies dezelfde vier kanalen op dezelfde manier. Maar de markt is niet leeg, en het
gat dat het meest direct de kernbelofte raakt is niet concurrentie, het is dat de
klant zelf pas iets weet als hij toevallig inlogt. **Hoogste-hefboom vervolgstap:
realtime melding bij een gemiste oproep bouwen**, dat is het enige punt in deze audit
dat zowel de klantbeleving direct verbetert als de kernbelofte van het product
waarmaakt in plaats van alleen ernaast te staan.
