# Facebook-post 3: "Kijk of jouw vak erbij staat"

**Datum geschreven:** 2026-08-07 · **Status:** klaar om te plaatsen, **maar niet nu** — zie
de twee voorwaarden onderaan.

---

## Wat post 2 leerde

Post 2 (7 augustus, vanaf Karpathos) was goed geschreven en deed één ding echt sterk: de
anti-goeroe-hoek. Uit `docs/research/concurrentie-vakmarketing-adhd-2026-08-07.md` blijkt dat
MHS Media, The A-Team en Adsplode geen prijs, geen aantal en geen nakijkbare belofte
publiceren — alleen houding. Een post die het scherm laat zien in plaats van de Lamborghini
is dus geen grapje maar precies het onderscheid.

Vier dingen die beter kunnen, op volgorde van wat ze kosten:

| # | Wat | Waarom het geld kost |
|---|---|---|
| 1 | Het probleem van de lezer staat pas in alinea 15 | Een vakman herkent zichzelf pas aan het eind, en de meesten komen daar niet. De sterkste zin stond op de laptop in de foto: *"Mis nooit meer een klant."* Dat is de opening, niet de link |
| 2 | Geen enkel getal | De hele edge is toetsbaarheid. Eén nakijkbare som is wat iemand doet stoppen met scrollen |
| 3 | De deel-vraag is voor jezelf gesteld | *"voor een beginnend initiatief als Belvanger…"* vraagt om sympathie. Vraag het namens degene die getagd wordt: zelfde klik, andere reden, kost geen status |
| 4 | "Wordt vervolgd…" en "de komende tijd in de praktijk brengen" | Zegt: nog niet. Terwijl er een werkende site, een dashboard, een intakeformulier en acht voorbeeldpagina's staan. Dat is een reden voor een lezer om te wachten |

**Wat wél werkte en dus terugkomt:** de vraag om te taggen. Post 1 leverde de enige twee
regels in het grootboek op, en niet door de post zelf — door de twee namen die Georgina
eronder tagde. De post is de aanleiding, het bericht is het contact.

---

## Post 3, klaar om te plakken

> Je staat op een ladder. Of je handen zitten in een leiding. Of je ligt onder een auto.
>
> En dan gaat je telefoon. 📞
>
> Je kunt niet opnemen. Dat is niet slordig, dat is gewoon je werk.
>
> Alleen: degene die belt weet dat niet. Die belt de volgende in het rijtje. En die neemt
> wél op.
>
> Even meerekenen, en corrigeer me gerust:
>
> Twee gemiste belletjes per week. Reken dat zes van de tien een echte klus was — dat is de
> aanname waar ik zelf mee reken en die staat ook gewoon zo op mijn site. Een klus van een
> paar honderd euro.
>
> Dan praat je over honderden euro's per week die de telefoon van iemand anders in gaan.
>
> Vind je dat te hoog ingeschat? Mooi. Zet je eigen cijfers erin, de rekenmachine staat
> open en bloot op de site. Ik heb liever dat je hem naar beneden bijstelt dan dat je hem
> gelooft.
>
> Daar is Belvanger voor. Je telefoon blijft van jou en er verandert niets aan hoe je werkt.
> Maar neem je niet op, dan valt de beller niet meer in een gat: hij krijgt binnen een
> minuut antwoord, en jij ziet hem 's avonds gewoon in je lijstje staan.
>
> Ik heb voor acht vakken een voorbeeldsite gebouwd. Loodgieter, elektricien, installateur,
> dakdekker, schilder, hovenier, glaszetter en klusbedrijf. 🔨
>
> 👉 https://belvanger.nl — scroll naar "Zo ziet het eruit" en kijk of jouw vak ertussen
> staat.
>
> Staat het er niet bij? Zeg het even, dan bouw ik hem erbij. 😉
>
> En dan mijn eigenlijke vraag:
>
> Ken je iemand die 's avonds mensen zit terug te bellen die allang iemand anders hebben
> gebeld? Tag hem hieronder. Niet voor mij — laat hem zelf even kijken en zelf bepalen of
> het iets voor hem is.

## Optionele regel, jouw keuze

Deze kun je vlak vóór "En dan mijn eigenlijke vraag" zetten:

> Eerlijk erbij: ik heb nog geen betalende klant. Dat zeg ik liever zelf dan dat je het
> straks ontdekt.

**Waarom hij erin zou moeten.** Het is dezelfde beweging als je anti-goeroe-post, en het is
precies waar de concurrentie het laat afweten: niemand van hen publiceert iets wat je kunt
nakijken. Iets toegeven wat je niet hoefde te zeggen, maakt de rest van je woorden zwaarder.

**Waarom je hem eruit zou laten.** Je warme netwerk weet dit al, en een vreemde die de post
via een deling ziet, ziet als eerste "geen klanten". Dat is een echte prijs.

Ik zou hem erin laten, maar het is jouw naam en jouw netwerk.

## Wat er bewust NIET in staat

- **Geen prijs.** Zie voorwaarde 2 hieronder.
- **Geen reactietijd, geen garantie, geen percentage dat je niet zelf in de hand hebt.**
  Uit `docs/research/adhd-topnotch-logboek.md`: beloof alleen wat je beheerst. "Binnen een
  minuut antwoord" gaat over het bericht dat de beller krijgt, en dat beheers je wel.
- **Geen "wordt vervolgd".** De spullen staan er.
- **Geen bronvermelding bij het getal**, want het is geen onderzoek maar jouw eigen som,
  en zo staat het er ook. Dat is sterker dan een cijfer met een voetnoot die niemand nakijkt.

---

## Twee voorwaarden vóór plaatsen

**1. Eerst deployen.** De post stuurt mensen naar acht voorbeeldsites, maar de
glaszetterspagina en de achtste galerijkaart staan nog alleen in git. Plaats je de post
eerder, dan telt een bezoeker er zeven en klopt je eigen zin niet.

```bash
git fetch origin && git checkout claude/belvanger-nl-info-47rkq9 && git pull
cd sites/belvanger && node assemble.mjs && bash deploy-to-vps.sh
```

**2. Eerst de prijs rechtzetten.** De site en de prijskaart spreken elkaar tegen:

| Bron | Prijs |
|---|---|
| `belvanger.nl`, FAQ **én de JSON-LD structured data** | €625 setup, **€99 per maand** |
| `docs/offers/belvanger-prijskaart-A4.md` | €595 setup, **€199 per maand**, plafond €299 |

Die €199 komt uit de adversariële ronde die aantoonde dat een vlakke €99 je marge laat
dálen naarmate een klant méér belletjes krijgt, en dat €149 het inkomensdoel mist met 7 tot
17 klanten. Zolang de site €99 zegt, verkoop je jezelf een prijs waarvan je zelf hebt
uitgerekend dat hij niet klopt — en het staat in structured data, dus Google kan het
overnemen.

Post 3 noemt daarom geen prijs. Maar iemand die op de link klikt, leest hem alsnog.

**Neem dit ook meteen mee:** vestigingsadres op de site (wettelijk verplicht, ook zonder
KvK), "excl. btw" bij de prijzen, en de doorgestreepte €1.250 die nooit is gevraagd — punt
4 in `CURRENT_STATE.md`. Nu je er publiek verkeer op zet, telt dat zwaarder dan gisteren.

## Na het plaatsen

Het enige dat telt gebeurt ná de post, niet erin:

- [ ] **Iedereen die liket, reageert, deelt of getagd wordt krijgt een bericht.** Ook een
      kale like. Iemand die op een post over gemiste telefoontjes klikt, mist telefoontjes.
- [ ] **Elk verstuurd bericht wordt één regel in het grootboek van `SELLING.md`.** De post
      zelf niet — dat is zichtbaarheid, geen contact.
