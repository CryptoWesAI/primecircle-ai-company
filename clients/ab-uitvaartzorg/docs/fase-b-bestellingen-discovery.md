# Discovery — Bestellingen automatiseren (Fase B, AB Uitvaartzorg)

> Doel: Alien's huidige bestelproces begrijpen vóór we iets bouwen. De
> antwoorden leveren twee dingen op: (1) de **catalogus/"stamboom"** (leveranciers,
> producten, pakketten) en (2) de **workflow** (waar de bestelling vandaan komt,
> waar Alien controleert, waar het heen gaat). Dit is de basis voor het ontwerp —
> nog geen bouwopdracht.

## Hoe te gebruiken (voor jou)

- **Voer het als gesprek, niet als formulier.** Alien wil grip en wil je niet
  teleurstellen — laat merken dat er geen "goede" antwoorden zijn; je wilt gewoon
  begrijpen hoe zíj werkt. Niets ligt vast.
- **Laat haar één recente uitvaart als voorbeeld nemen** en daar doorheen lopen.
  Concreet vertelt beter dan abstract.
- **Leid haar niet.** Noteer haar eigen woorden (ook de rommelige stukken — daar
  zit vaak de echte pijn). Frequentie en het controle-moment zijn het belangrijkst.
- Hoeft niet in één keer. Eén blok tijdens de koffie is prima.
- Onderaan staat een **korte versie** die je desgewenst kunt appen als ze liever
  schrijft dan belt.

---

## Blok 1 — Hoe het nu gaat

1. Loop me eens door een recente uitvaart: vanaf het moment dat de wensen bekend
   zijn — wat bestel je dan allemaal, en in welke volgorde?
2. Bestel je per e-mail, telefoon, een portaal van de leverancier, of door elkaar?
3. Hoeveel tijd ben je gemiddeld kwijt aan het bestellen/regelen per uitvaart?
4. Hoe vaak komt dit ongeveer voor — per maand of per week? *(frequentie: bepaalt
   of automatiseren de moeite waard is)*

## Blok 2 — Leveranciers

5. Welke leveranciers gebruik je vast? Denk aan: kist/uitvaartkist, bloemen,
   drukwerk (rouwkaarten/liturgie), catering/koffie & cake, rouwvervoer/rouwauto,
   crematorium of begraafplaats, grafmonument/steenhouwer, muziek/geluid, akoestiek,
   condoleanceregister, ijs/koeling, dragers. *(vink af wat van toepassing is en
   vul aan)*
6. Per leverancier: hóé bestel je daar (mail/telefoon/portaal), en heb je een vaste
   contactpersoon?
7. Bij welke leveranciers heb je vaste prijzen of afspraken? En bij welke wisselt
   het per keer?

## Blok 3 — Pakketten / vaste keuzes ("stamboom")

8. Heb je standaard combinaties of "pakketten" die vaak terugkomen (bijv. een sober
   basispakket vs. een uitgebreider pakket)?
9. Waar kiezen families meestal voor — zit daar een patroon in?
10. Wat verschilt er juist per uitvaart? *(dit worden de "variabelen" in het systeem)*

## Blok 4 — Waar de bestelling vandaan komt (de "voorkant")

11. Welke informatie heb je nódig voordat je kunt bestellen? (datum, locatie,
    aantal genodigden, specifieke wensen, aanleverdatum …)
12. Waar staat die informatie nu — in het wensenformulier, op papier, in je mail,
    of in je hoofd?
13. Zou je willen dat het systeem die gegevens automatisch overneemt uit de intake/
    het wensengesprek, zodat je ze niet opnieuw hoeft in te tikken?

## Blok 5 — Jouw controle-moment *(cruciaal — dit is je "grip")*

14. Je zei: "alleen controleren en versturen." Hoe voelt dat ideaal — wil je elke
    bestelling apart goedkeuren, of liever een hele set voor één uitvaart in één
    keer nakijken en versturen?
15. Wat wil je absoluut zélf blijven doen en níét uit handen geven?
16. Wat mag er onder geen beding automatisch gebeuren (zonder jouw akkoord)?

## Blok 6 — Facturatie (grenst hieraan)

17. Maak en verstuur je zelf facturen naar de familie? Hoe gaat dat nu?
18. Wil je facturatie hierin meenemen, of eerst alleen de bestellingen en later pas
    de facturen?

## Blok 7 — Pijn & prioriteit

19. Wat kost je in dit hele proces nu de meeste tijd of ergernis?
20. Als je vandaag één ding mocht wegnemen — welk stukje zou dat zijn?

---

## Korte versie (om te appen als ze liever schrijft)

> Hoi Alien — om jouw bestellingen slim te kunnen automatiseren wil ik eerst
> begrijpen hoe je het nú doet. Geen haast, en niets ligt vast. Als je deze paar
> dingen los kunt beantwoorden helpt me dat enorm:
>
> 1. Bij welke leveranciers bestel je vast, en waarvoor?
> 2. Bestel je per mail, telefoon of portaal?
> 3. Hoe vaak per maand ongeveer bestel je voor een uitvaart?
> 4. Zijn er vaste "pakketten"/combinaties die vaak terugkomen?
> 5. Wat wil je altijd zélf blijven controleren voor er iets de deur uit gaat?
> 6. Wat kost je nu de meeste tijd of ergernis in dit proces?

---

## Wat we hierna doen

- Antwoorden verwerken tot: (a) een **catalogus** (leveranciers → producten/diensten
  → pakketten) en (b) een **flow-schets** (intake → concept-bestelling → Alien's
  controle → versturen naar leverancier).
- Ontwerp volgt de eerdere lijn: **Configure/Automate, geen custom build** —
  zelf-gehoste catalogus (NocoDB/Baserow) + n8n voor de order-flow, met Alien's
  "controleren & versturen" als vaste mens-in-de-lus stap.
- **Aandachtspunt vooraf (niet voor Alien, voor ons):** zodra de bestelling gevoed
  wordt vanuit het wensenformulier, verwerken we bijzondere persoonsgegevens en
  gaan er gegevens naar externe leveranciers. Dan gelden AVG-verplichtingen
  (grondslag, verwerkersafspraken, dataminimalisatie richting leveranciers). Zie
  `docs/paof/ai-governance-security.md` — meenemen in het ontwerp, niet in de
  discovery.
