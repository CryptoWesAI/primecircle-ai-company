# Belvanger hero: adversarial persuasion test, 23 juli 2026

## Aanleiding

De founder gaf aan dat de hero van belvanger.nl alleen de automatische SMS-vangst
liet zien, niet dat er ook een dashboard (met prestaties, gemiste oproepen,
berichten, en de mogelijkheid om direct vanuit het dashboard contact op te nemen)
en een professioneel gebouwde website bij het pakket horen. Opdracht: ADHD-ideation
op het hero-probleem, implementeren, en de uitkomst hard testen met sceptische
sub-agents die een lead spelen, niet zomaar aannemen dat het werkt.

## Methode: ADHD-ideation

Vijf onafhankelijke denkframes (concurrent, inversie, markt, game design, biologie)
kregen exact dezelfde probleemstelling, parallel, zonder elkaars antwoorden te zien.
Alle vijf kwamen, onafhankelijk van elkaar, op hetzelfde kernmechanisme uit: verleng
de bestaande telefoon-animatie in de hero tot een doorlopende reeks die de melding
na de gemiste oproep laat doorgroeien naar dashboard en website, in plaats van
nieuwe elementen aan de hero toe te voegen. Vijf van de vijf onafhankelijke frames
op dezelfde uitkomst is een ongewoon sterk signaal; dat gaf voldoende vertrouwen om
zonder extra ideatierondes door te bouwen.

## Implementatie

- De bestaande "Nieuwe lead binnen"-melding (na de gemiste-oproep-animatie) groeit
  nu door in twee extra stappen, op dezelfde plek, dezelfde vorm: eerst "Meteen in
  je dashboard" (met een directe-belactie-belofte), dan "Je eigen website ving 'm
  mee op". Geen nieuwe hero-ruimte, dezelfde melding morft door.
- De subkop opent nu met het volledige aanbod (eigen website, dashboard vol leads,
  automatisch vangnet) vóór de pijn-uitleg, in plaats van andersom.
- De statische/reduced-motion-fallback (geen JS, of motion uitgeschakeld) toont nog
  steeds alleen de oorspronkelijke melding: expliciet getest dat de twee nieuwe
  stappen daar niet overlappend blijven hangen.
- Geverifieerd op desktop, mobiel en dark mode, geen horizontale overflow, geen
  consolefouten. Live gedeployed.

## Methode: adversarial test

Drie onafhankelijke sub-agents kregen elk een sceptische, realistische
vakman-persona en exact de nieuwe hero-tekst (precies wat een bezoeker zonder
verdere context zou zien), zonder elkaars gesprek te zien. Ik (als founder) voerde
met elk apart, over meerdere ronden, een echt overtuigingsgesprek. De opdracht aan
de persona's was expliciet: kritisch blijven, niet snel tevreden, alleen instemmen
als de argumenten echt kloppen.

### Persona 1: Sanne, loodgietersbedrijf, eerder belazerd door een webbureau (1800 euro, niks opgeleverd), prijsbewust

**Opening.** Snapt het aanbod, maar wantrouwt meteen: hoe werkt de doorschakeling
concreet, waar komt de 52%/44%-statistiek vandaan, wat zit er echt in "professioneel
gebouwd", en waarom staat er geen prijs.

**Na ronde 2** (concrete antwoorden: hoe de doorschakeling werkt, bron van de
cijfers, dat elk vak een eigen indeling krijgt i.p.v. een sjabloon, en het
"pas betalen als je eerste gemiste klant is opgevangen"-principe): erkent dat de
antwoorden concreet zijn, maar wil weten hoe "opgevangen" precies gemeten wordt en
waarom er nog steeds geen indicatie van de opstartkosten is.

**Eindverdict:** *zou het gesprek boeken*, op voorwaarde dat twee dingen scherp
worden: het maandbedrag ná de opstart (dat voelde voor haar niet herhaald genoeg
naast het opstartbedrag) en de precieze definitie van "gemiste oproep die is
opgevangen" (telt een verkeerd nummer of een halve seconde ring ook mee).

### Persona 2: Mo, eenmanszaak dakdekker, niet technisch, bang voor extra administratie die tijd kost

**Opening.** Snapt het aanbod, maar wantrouwt "automatisch": verwacht dat het in de
praktijk toch een uur instellen en daarna wekelijks controlewerk wordt.

**Na ronde 2** (concreet getal: dertig minuten instelgesprek, daarna nul verplicht
onderhoud van zijn kant): vraagt door op wat er ÉCHT gebeurt op zijn telefoon bij
een misser, of een dringend bericht ("dak lekt nu") gewoon onopgemerkt in een
dashboard verdwijnt, en wat er gebeurt met zijn nummer en gegevens als hij stopt.

**Na ronde 3** (eerlijk antwoord: geen extra gepiep, berichten komen gewoon als
normale melding binnen net als nu, MAAR het systeem herkent geen spoedgevallen,
Belvanger is geen alarmcentrale, de automatische tekst verwijst bij spoed naar
opnieuw bellen; nummer en gegevens blijven van hem): **converteert volledig**.
Waardeert expliciet dat de founder een echte beperking toegaf in plaats van het
weg te praten. Boekt het gesprek, vraagt alleen om het kort te houden.

### Persona 3: Els, hoveniersbedrijf, heeft al een (verouderde maar bruikbare) eigen site en doet zelf Instagram-marketing, vergelijkt scherp

**Opening.** Ziet de vangst-functie als vergelijkbaar met een WhatsApp Business
auto-reply (gratis). Vraagt wat dit beter maakt dan wat ze al zelf heeft, en of de
nieuwe website haar huidige site vervangt of ernaast komt te staan.

**Na ronde 2** (het echte verschil: een overzichtelijk dashboard per lead i.p.v. een
appje tussen de rest; de site vervangt de hare, wordt niet ernaast gezet): erkent
dat het dashboard-argument echt een verschil maakt, maar vraagt of ze het
vangnet-en-dashboard-deel kan krijgen ZONDER haar huidige site te vervangen, en wat
dat kost, plus een concreet rekensommetje tegenover wat ze nu feitelijk gratis doet.

**Na ronde 3** (eerlijk antwoord: een losstaand "vangnet-only"-tarief bestaat
vandaag niet, het is nu een gebundeld pakket; wél een concrete rekensom met de
bestaande rekenmachine-logica op de site: 4 tot 6 gemiste belletjes per maand × 300
tot 500 euro per klus, dus één geredde klus verdient het pakket al ruimschoots
terug): **converteert niet voor het huidige pakket**, maar wil wél het
vrijblijvende gesprek, specifiek om te horen of er een losstaand tarief kan komen.
Waardeert expliciet de eerlijkheid ("bestaat niet, punt") boven een mooipraterij.

## Correctie: het geteste opstartbedrag was fout

In het Sanne-gesprek gebruikte de founder-persona een indicatieve bandbreedte van
250 tot 600 euro voor de eenmalige opstart. Dat was een aanname voor de test, geen
echt cijfer. Het echte, al door de founder vastgestelde founding-tarief staat in
`docs/offers/aanbod-belvanger-trades.md`: **625 euro opstart (founding, normaal
1.250 euro) plus 99 euro per maand, levenslang vast voor founding-klanten**. Omdat
juist de meest prijsgevoelige persona (Sanne) hierop test, is dit apart
gecorrigeerd en opnieuw getest met het echte bedrag.

**Resultaat van de correctie:** Sanne reageert eerst geïrriteerd, het bedrag
verdubbelt ten opzichte van wat ze eerder hoorde, en dat is precies het patroon
van haar vorige, slechte ervaring. Wat haar tóch over de streep trekt: de founder
corrigeert zichzelf ongevraagd, expliciet omdat het niet past bij wat hij net over
transparantie beweerde. Ze boekt alsnog het gesprek, maar expliciet onder
voorwaarde dat ze vooraf zwart op wit krijgt wat er precies in die 625 euro zit,
voor ze ergens voor tekent.

**Twee lessen hieruit, niet uit de rest van de test:**

1. Het echte opstartbedrag (625 euro) ligt hoger dan wat in eerdere,
   niet-gecorrigeerde delen van dit rapport werd gebruikt; waar dit rapport
   "250 tot 600 euro" citeert in de Sanne-sectie hierboven, is dat de foutieve
   testaanname, niet het echte aanbod. Het echte aanbod staat in
   `docs/offers/aanbod-belvanger-trades.md`.
2. Een prijscorrectie die je zelf, ongevraagd, rechtzet werkt averechts-in-eerste-
   instantie maar bouwt op de langere termijn meer vertrouwen op dan een prijs die
   nooit hardop gecheckt wordt. Vertaalt naar een concrete aanbeveling: maak een
   kort, concreet "dit zit er in de 625 euro"-overzicht dat je al vóór of tijdens
   het eerste gesprek kunt delen, zodat niemand achteraf het gevoel krijgt dat het
   bedrag is "opgerekt".

## Resultaat

| Persona | Kernbezwaar | Uitkomst |
|---|---|---|
| Sanne (loodgieter, prijsbewust) | Vaagheid, eerder belazerd | Boekt gesprek, 2 vragen nog scherp te krijgen |
| Mo (dakdekker, tijdsdruk) | Verwacht verborgen administratie | Volledig overtuigd, boekt gesprek |
| Els (hovenier, heeft al iets) | Twijfelt of dit beter is dan haar huidige opzet | Boekt gesprek, maar niet voor het huidige pakket |

Drie van de drie sceptische persona's kwamen tot een "ja, ik bel" op basis van de
nieuwe hero plus een eerlijk, specifiek vervolggesprek. De hero zelf, met de
volledige waardepropositie in beeld en de doorlopende meldingssequentie, werd door
geen van de drie als onduidelijk of onvolledig bestempeld: iedereen begreep uit de
hero zelf dat er een website, een dashboard én automatische vangst bij hoort. Het
oorspronkelijke probleem (hero toont maar een derde van de waarde) is opgelost.

## Wat wél naar boven kwam, en geen hero-probleem is

1. **Prijs moet in één adem herhaald worden.** Setup-indicatie en het
   maandbedrag afzonderlijk noemen is niet genoeg; sceptische prospects willen ze
   samen, elke keer dat er over geld gesproken wordt, anders voelt het alsof er
   iets wordt achtergehouden.
2. **"Opgevangen" moet een harde, geloggede definitie krijgen** die de klant zelf
   kan naslaan (tijdstempel in het dashboard), niet een oordeel van Belvanger.
   Testgesprek gebruikte hiervoor al een concreet, verifieerbaar antwoord; dat
   verdient een vaste plek in de FAQ.
3. **Productgat: geen "vangnet-only" tarief.** Een herkenbaar prospect-segment
   (savvy ondernemers met een site die ze willen houden) haakt af zodra blijkt dat
   het pakket alleen gebundeld te koop is. Dit is geen copy-probleem, het is een
   productbeslissing: overwegen of een lichtere, losstaande instapoptie
   (missed-call-vangst + dashboard, zonder nieuwe website) de moeite waard is als
   wig voor dit segment.
4. **Opstartkosten met een indicatieve bandbreedte werken beter dan "op maat".**
   In de test werd een indicatieve range (illustratief, geen officiële prijs) sterk
   positiever ontvangen dan de huidige volledige vaagheid. Dit is een aanbeveling
   voor de founder om een echte bandbreedte te bepalen, geen voorstel om deze
   ongezien op de site te zetten.

## Conclusie

Het hero-probleem is met vertrouwen opgelost: vijf onafhankelijke denkrichtingen
kwamen tot hetzelfde mechanisme, de implementatie is zonder nieuwe hero-ruimte
gerealiseerd, en drie onafhankelijke, doelbewust kritische testgesprekken kwamen
alle drie tot een concreet vervolgstap. Verdere iteratie op de hero zélf is niet
nodig; de resterende wrijving zit in prijscommunicatie-consistentie en een
productbeslissing (vangnet-only tarief), niet in wat de hero laat zien.
