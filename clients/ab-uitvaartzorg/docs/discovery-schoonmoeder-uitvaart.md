# Discovery & Tijd-audit — Uitvaartonderneming (schoonmoeder)

> Veldinstrument voor een gesprek van ~20 min. Doel: ontdekken **waar haar tijd
> echt heen gaat** en welke ene taak de beste eerste automatisering is —
> hoogste tijdsbesparing × laagste emotioneel risico × haalbaar met bestaande
> tools. Nog **geen** oplossingen voorstellen tijdens het gesprek; eerst
> luisteren en noteren in háár woorden.
>
> _(Nederlandstalig omdat dit live met haar wordt gebruikt; Engelse herbruikbare
> PAOF-versie volgt zodra dit een sjabloon voor andere niches wordt.)_

## Vooraf — mindset

- Noteer letterlijk wat ze zegt, ook getallen ("ongeveer 5 facturen per week").
- Vraag bij elke taak door op: **hoe vaak**, **hoe lang**, **wat gaat mis**,
  en **wie zit er aan de andere kant** (een bedrijf of een rouwende familie?).
- De emotioneel gevoelige taken zijn *niet* de eerste die we automatiseren —
  we zoeken juist de saaie, terugkerende, bedrijf-naar-bedrijf klussen.

---

## Deel A — Waar gaat de tijd heen (globaal)

1. Beschrijf een typische week. Welke terugkerende administratieve taken komen
   steeds terug?
2. Welke van die taken kosten de **meeste tijd**?
3. Welke kosten de meeste **energie of frustratie** (ook al duren ze kort)?
4. Welke taken komen altijd op een **ongelegen moment**?
5. Als je een uur per dag terug zou krijgen — welke taak zou je dan het liefst
   kwijt zijn?

## Deel B — Inzoomen op de top 2-3 taken

_Stel deze vragen per taak die uit Deel A naar boven kwam:_

6. Hoe vaak per week/maand doe je dit? Hoe lang duurt het per keer?
7. Welke stappen zet je precies? (laat haar het hardop doorlopen)
8. Welke tools/programma's gebruik je hiervoor nu?
9. Wat gaat er wel eens mis, of wat is vervelend aan de huidige manier?
10. **Wie zit er aan de andere kant** — een leverancier/bedrijf, of een
    familie in rouw?
11. Wat gebeurt er als deze taak een dag blijft liggen? (test van urgentie)
12. Zou je je er comfortabel bij voelen als een computer dit (deels) overneemt?
    Waar ligt voor jou de grens?

## Deel C — Telefoon (ze noemde dit zelf)

13. Hoeveel telefoontjes krijg je op een dag, ongeveer?
14. Welk deel is **echt spoed** (overlijden melden, dringend) versus routine
    (afspraak, algemene vraag)?
15. Wat zijn de meest voorkomende **niet-spoed** vragen? (kunnen die met
    standaardinfo beantwoord worden?)
16. Op welke momenten mis je oproepen of komt bellen slecht uit?
17. Wat mag een assistent aan de telefoon **absoluut nooit** doen?

_(Doel hier is niet om de telefoon-AI nu te bouwen — wel om te bepalen óf en
wanneer die later zinvol is, en waar de rode lijnen liggen.)_

## Deel D — Systemen & gegevens

18. Welke e-mail gebruik je (Gmail, Outlook, eigen domein)?
19. Hoe maak en verstuur je nu facturen? Welk boekhoud-/facturatieprogramma?
20. Waar staat de informatie over klanten/families nu — in je hoofd, op papier,
    in een programma?
21. Hoe plan je nu afspraken (agenda op papier, Google/Microsoft)?

## Deel E — Succes & grenzen

22. Als er dit jaar **één ding** geautomatiseerd kon worden dat je het meeste
    rust geeft — wat zou dat zijn?
23. Wat zou je een computer/AI **nooit** willen laten doen in jouw werk?

---

## Na het gesprek — de wedge kiezen (samen invullen)

Scoor elke kandidaat-taak 1-5 (5 = best). Hoogste totaal wordt de eerste
automatisering.

| Taak | Tijdsbesparing (hoe vaak × hoe lang) | Laag emotioneel risico (tegenpartij = bedrijf, fout herstelbaar) | Haalbaar met bestaande tools | Totaal |
|---|---|---|---|---|
| bv. facturen versturen | | | | |
| bv. bestellingen leveranciers | | | | |
| bv. e-mail triage | | | | |
| bv. afspraken/agenda | | | | |

**Regel:** de winnaar is de taak met het hoogste totaal — bijna altijd een
saaie, terugkerende, bedrijf-naar-bedrijf klus, niet de telefoon en niet iets
richting rouwende families. Dat wordt de eerste `OFFER_TEMPLATE.md`-invulling.

**Let op — twee fasen (weeg frequentie zwaar):**
- **Fase A (vóór/rondom een case):** binnenkomende vragen, voorgesprekken,
  algemene info, afspraken, e-mail. Herhaalbaar en hoger volume → meestal de
  betere eerste wedge.
- **Fase B (ná het gesprek met de familie):** bestellingen en facturatie. Dit
  is **maatwerk** en komt pas nadat alle keuzes met de familie zijn gemaakt.
  Het maatwerk zit in de *inhoud* (welke kist/bloemen/vervoer), niet in de
  *handeling* — de administratie erna is in principe automatiseerbaar. Maar bij
  een solo-verzorger is dit waarschijnlijk laag-frequent, dus hoge complexiteit
  × lage frequentie = een zwakkere eerste keuze, ook al is de tegenpartij een
  bedrijf. Noteer daarom bij elke taak expliciet hoe váák die voorkomt.

## Volgende stap na de audit

Met de gekozen wedge vullen we samen `docs/offers/OFFER_TEMPLATE.md` in voor
die ene taak, bepalen we Buy/Integrate/Configure/Automate/Build, en pas dán
kijken we naar de delivery (zie `docs/paof/ai-automation-engineering.md`:
Hostinger cron vs. n8n).
