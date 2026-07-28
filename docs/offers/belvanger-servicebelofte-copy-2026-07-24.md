# Belvanger: servicebelofte "partner schakelt bij" (websitetekst-sjabloon)

Herbruikbare tekst voor op de website van een klant, in dezelfde "je"-toon en
belofte-stijl als de bestaande `pricecard__promise` op belvanger.nl ("Onze
belofte: je maandbedrag gaat pas lopen..."). [Bedrijfsnaam] vervangen per
klant; toon zelf mag per klant lichtjes worden aangepast, de kern niet.

## Korte variant (badge/eyebrow, bijv. naast het contactformulier)

> Altijd geholpen — ook als wij het even te druk hebben

## Middellange variant (los blokje, zelfde stijl als de prijskaart-belofte)

> **Onze belofte:** heeft [Bedrijfsnaam] het een keer te druk om je snel zelf
> te helpen? Dan schakelen we een vertrouwde partner in, zodat je nooit met
> lege handen staat. Kwaliteit staat bij ons voorop, ook als dat betekent dat
> een ander de klus oppakt.

## Lange variant (eigen sectie of FAQ-item)

**Wat als jullie het te druk hebben?**

> Soms hebben we het gewoon te druk. Dat gebeurt bij elk goed bedrijf. Maar we
> vinden het belangrijker dat jij geholpen wordt dan dat wij per se elke klus
> zelf doen. Kunnen we je op dat moment niet bedienen, dan schakelen we een
> partner in die we kennen en vertrouwen, zodat jouw klus alsnog goed
> terechtkomt. Dat is voor ons geen bijzaak, daar worden we op afgerekend.

## Waarom dit werkt

Het maakt van "we hebben het druk" (normaal een reden voor een klant om af te
haken) juist een vertrouwenssignaal: zelfs in het slechtste geval sta je niet
met lege handen. Het sluit aan bij het bestaande "belofte"-patroon op
belvanger.nl, en bij de "opgevangen"-clausule die er al staat: dezelfde
eerlijke, concrete toon in plaats van vage geruststelling.

## Voor implementatie op een klantwebsite

Plek: naast het contactformulier, of als los FAQ-item, past bij het bestaande
`qa`-patroon op belvanger.nl. Geen technische afhankelijkheid — dit is pure
websitetekst, functioneert onafhankelijk van of de dashboard-doorverwijsknop
(zie hieronder) al gebouwd is of niet.

## Openstaand: de dashboard-knop zelf

Bevestigd: **handmatig**, geen automatische routing. Een klant (de
vakman/het bedrijf) ziet bij een binnenkomende lead een knop om die lead
door te zetten naar een zelf ingevoerde partner (naam + contactgegevens,
door de klant zelf beheerd in het dashboard). Dit is een nieuwe, af te
bakenen bouwtaak, nog niet gestart. Nog te bepalen voordat ik dit spec en
bouw: wat de knop precies triggert (alleen de partner een seintje, of ook de
oorspronkelijke beller een berichtje "je bent doorverwezen naar..."), en hoe
toestemming van de beller wordt geregeld voor het delen van zijn gegevens
met een derde partij. Laat het weten als je wil dat ik dit nu al uitwerk tot
een spec, of dat het net als de vangnet-only-tier op de roadmap blijft staan
tot er een eerste klant is.
