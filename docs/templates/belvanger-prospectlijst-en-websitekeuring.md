# Prospectlijst bouwen en websites keuren

> Doel: honderd belbare vakbedrijven in je eigen regio, gesorteerd op wie het hardst
> iets nodig heeft, plus een oordeel over hun website dat ergens op slaat.
> Hoort bij `tools/prospects-verzamelen.mjs` en `tools/website-keuren.mjs`, en bij de
> belproef uit `docs/research/concurrentie-vakmarketing-adhd-2026-08-07.md`.

## Waarom "award winning" de verkeerde lat is

Je vroeg of ik de sites award winning vind. Dat is een eerlijke vraag met een
ongemakkelijk antwoord: **een prijswinnende site en een vertrouwenwekkende site zijn
niet hetzelfde ding, en voor jouw doelgroep vaak elkaars tegenpool.**

Awards worden uitgereikt door vakjury's die belonen op originaliteit, art direction en
animatie. De klant van een dakdekker is iemand van 52 met een lekkage, op een iPhone,
in een gang, met natte voeten. Die persoon beoordeelt een site op drie vragen en op
niets anders:

1. Doet hij mijn klus?
2. Werkt hij in mijn plaats?
3. Hoe bereik ik hem nu meteen?

Kost het antwoord op één van die drie meer dan vijf seconden, dan is de site gezakt,
hoe mooi hij ook is. Een carrousel die eerst moet afdraaien, een hero-animatie van drie
seconden of een contactformulier zonder telefoonnummer zijn in deze markt geen design,
het zijn lekken.

**Wat dat betekent voor je pitch.** Verkoop niet "een mooiere website", want dat is
precies wat MHS Media verkoopt en die heeft honderd cases en jij nul. Verkoop dat hij
bereikbaar wordt. Het mooie ontwerp is meegeleverd, geen argument.

## De vijf-secondentest (met je eigen ogen, op je telefoon)

Machinescores meten hygiëne. Dit meet vertrouwen. Doe dit alleen voor de bovenste
twintig van je gekeurde lijst, anders kost het je een dag.

Open de site **op je telefoon**, start een timer, en scoor:

| Check | Goed | Fout |
|---|---|---|
| Vak binnen 5 sec duidelijk | "Loodgieter in Drachten" staat er | je moet scrollen of raden |
| Werkgebied binnen 5 sec duidelijk | plaatsnamen of "regio Friesland" | nergens een plaats te bekennen |
| Contact binnen 5 sec | nummer bovenaan, aantikbaar | alleen een formulier onderaan |
| Echte mens zichtbaar | foto van hemzelf of zijn bus | uitsluitend stockfoto's |
| Echt werk zichtbaar | eigen projectfoto's | stockfoto's van buitenlandse modellen |
| Bewijs | reviews, referenties, keurmerk | niets |
| Bestaansrecht | adres, KvK, btw-nummer | anoniem |
| Nog levend | jaartal van dit of vorig jaar | copyright 2019 |

**Zeven of acht groen = de site is niet zijn probleem.** Ga bij die man op
bereikbaarheid zitten, niet op design, en zeg er eerlijk bij dat zijn site prima is.
Dat is meteen het meest ontwapenende wat je die dag zegt.

**Vier of minder groen = hoge kans.** Noem in het gesprek **één** gebrek, niet vijf.
Eén feit landt, vijf feiten voelen als een aanval en dan is het gesprek voorbij.

## Drie bronnen, in deze volgorde

### Bron 1: OpenStreetMap, geautomatiseerd (gratis, geen sleutel)

```bash
node tools/prospects-verzamelen.mjs          # standaard: Leeuwarden, 40 km
node tools/website-keuren.mjs --in tools/prospects.csv --uit tools/prospects-gekeurd.csv
```

Standaard staat op **Leeuwarden met een straal van 40 km**, de eigen regio. Dat dekt
Drachten, Heerenveen, Sneek, Bolsward, Franeker, Harlingen, Dokkum, Burgum, Grou, Joure
en Wolvega. Andere plek: `--plaats "Drachten" --straal 25`.

Overijssel en Groningen zijn ook werkgebied. Drie regio's achter elkaar en samenvoegen:

```bash
for p in Leeuwarden Zwolle Groningen; do
  node tools/prospects-verzamelen.mjs --plaats "$p" --straal 40 --uit "tools/prospects-$p.csv"
done
head -1 tools/prospects-Leeuwarden.csv > tools/prospects.csv
tail -q -n +2 tools/prospects-*.csv | sort -u >> tools/prospects.csv
```

`sort -u` vangt de dubbelen op die in twee stralen tegelijk vallen (Heerenveen en
Meppel liggen in het overlapgebied). Bel Friesland eerst af: "ik zit hier om de hoek"
is een argument dat je in Groningen niet hebt.

Levert naam, vak, telefoon, website, plaats. Gesorteerd met belbare nummers bovenaan,
en na de keuring met de hoogste kans bovenaan.

**Wat dit NIET oplost:** OSM kent de vakman-zonder-winkel slecht. Bedrijven met een
werkplaats of showroom staan erin, de ZZP'er die vanuit zijn bus werkt vaak niet.
Reken op tientallen treffers, niet op honderd. Dit is je startlijst, niet je eindlijst.

### Bron 2: Google Maps, handmatig (levert het meeste, kost het meeste tijd)

Zoek per vak per plaats: `loodgieter Drachten`, `dakdekker Heerenveen`, enzovoort.
Zeven vakken × elf plaatsen (Leeuwarden, Drachten, Heerenveen, Sneek, Bolsward,
Franeker, Harlingen, Dokkum, Burgum, Grou, Joure) = 77 zoekopdrachten, en elke opdracht
levert een handvol bedrijven met naam, nummer, website en reviewscore. Dit is de bron
die je daadwerkelijk aan honderd namen helpt.

Neem per bedrijf over: naam, vak, telefoon, website, plaats, **aantal Google-reviews**.
Dat laatste is gratis kwalificatie die OSM je niet geeft: onder de tien reviews is
iemand vrijwel zeker klein genoeg om zelf de telefoon te moeten opnemen, en dat is
precies je doelgroep.

Zet het in dezelfde kolomvolgorde als bron 1, dan kun je `website-keuren.mjs` er
zonder aanpassing overheen draaien.

### Bron 3: ledenlijsten (kleinste lijst, hoogste kwaliteit)

Brancheverenigingen publiceren hun leden met vestigingsplaats: Techniek Nederland
(installateurs), OnderhoudNL (schilders), Vakfederatie Rietdekkers, Bouwend Nederland,
VHG (hoveniers). Een lid van een branchevereniging betaalt al contributie om
professioneel over te komen, en dat is een koopsignaal.

## Het belproef-logboek

Voeg deze kolommen toe aan je gekeurde CSV. Dit is het instrument uit het rapport, en
het is een **meting**, geen verkoopactie: de opbrengst is het cijfer, een klant is
bijvangst.

| Kolom | Wat erin komt |
|---|---|
| `poging_1` | di 08:10, opgenomen ja/nee |
| `poging_2` | wo 12:40, opgenomen ja/nee |
| `poging_3` | do 16:35, opgenomen ja/nee |
| `voicemail` | vol / ingesproken / geen voicemail |
| `teruggebeld_min` | minuten tot terugbellen, leeg als niet |
| `bericht_verstuurd` | datum/tijd |
| `reactie` | letterlijk wat hij terugschreef |

**De regels die dit fatsoenlijk houden** (uit het rapport, niet onderhandelbaar):
nooit een klus of valse identiteit verzinnen; **niets opnemen**; maximaal drie
pogingen; alleen werkdagen tussen 08:00 en 18:00; alleen nummers die hij zelf publiek
als zakelijk nummer heeft gepubliceerd; het eerste bericht vertelt volledig wat er is
gebeurd en waarom. Zegt iemand "niet meer bellen", dan stopt alles en gaat het nummer
op een blokkeerlijst. Logs van niet-reagerende prospects na dertig dagen weg.

De uitkomst die telt is één percentage: **hoeveel van de gebelde bedrijven nam geen
enkele keer op.** Onder de 40% klopt de hele Belvanger-propositie niet en moet de
positionering terug naar de tekentafel. Dat is de goedkoopste manier om dat te weten
te komen.

## Gotchas

- **Draai `website-keuren.mjs` vanaf je eigen machine.** In een omgeving met
  geblokkeerde uitgaande verbindingen krijgt elke rij "site onbereikbaar", en dat is
  dan een fout in je netwerk en niet in hun site. Zie je bij álle rijen hetzelfde
  oordeel, dan meet je jezelf.
- **De score meet hygiëne, geen schoonheid.** Een machine kan niet zien of iets mooi
  is. De score wijst je aan wélke twintig sites je met je eigen ogen moet bekijken.
- **Een marktplaatsprofiel als "website" is je beste prospect,** niet je slechtste. Wie
  op Werkspot staat betaalt per lead en kent zijn eigen kosten. Dat is de Lekcheck.
- **Nummer zonder mobiel is vaak een vast kantoornummer,** en daar zit soms al iemand
  die opneemt. Die hoort niet in je doelgroep. `mobiel=ja` eerst bellen.
- **Normaliseer telefoonnummers voordat je belt.** Het script gooit alles weg wat na
  `+31` geen negen cijfers heeft; een half nummer kost je een belronde.
- **Ontdubbelen blijft handwerk.** Dezelfde zaak staat in OSM soms als punt én als
  gebouw, en op Google onder twee schrijfwijzen. Het script ontdubbelt op naam plus
  nummer, maar "Jansen Loodgieters" en "Jansen Loodgietersbedrijf" glippen erdoor.
- **Honderd is geen doel op zich.** Veertig goed gekozen nummers met `kans=hoog` zijn
  meer waard dan honderd willekeurige. Stop met verzamelen zodra je veertig hebt en
  begin met bellen; verzamelen is de comfortabele helft van dit werk.
