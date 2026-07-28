# Privacy-alinea voor de chatassistent (AB Uitvaartzorg)

> **TOEGEPAST OP 2026-07-28**, in NL en EN, en live geverifieerd. Wat hieronder staat is de
> bronversie; de daadwerkelijk geplaatste tekst wijkt op twee punten af, zie de kaders.
> Oorspronkelijk bedoeld om in `privacy-statement.html` te plakken vóór de chatbot live gaat
> (go-live gate, zie spec §8). **Geen juridisch advies**: laat het door Alien
> (en bij voorkeur een jurist) nalezen, en pas het aan als de opzet wijzigt.
> Geschreven voor de **v1 (stateless)**: de assistent slaat niets op.

## Waarom deze alinea nodig is

De website krijgt een digitale AI-assistent die algemene vragen beantwoordt.
Zodra die live staat, verwerkt hij wat bezoekers typen en gebruikt hij een
externe AI-dienst als verwerker. Dat moet transparant in de
privacyverklaring staan (AVG), en de bezoeker moet weten dat het om AI gaat
(EU AI Act, art. 50). De onderstaande tekst dekt beide.

## Nieuwe sectie: plaats onder "Persoonsgegevens die wij verwerken"

> **Digitale assistent (chat)**
>
> Op onze website staat een digitale assistent die algemene, praktische vragen
> beantwoordt. U chat met een geautomatiseerde assistent, niet met een
> medewerker; dit wordt bij aanvang van het gesprek gemeld. Wat u in de chat
> typt, wordt verwerkt om uw vraag te kunnen beantwoorden. Wij bewaren de
> gesprekken niet: na afloop van uw gesprek onthoudt de assistent niets.
>
> Typt u geen gevoelige of persoonlijke gegevens in de chat. Voor persoonlijke,
> vertrouwelijke of dringende zaken belt u rechtstreeks met Alien op
> 06 4089 4000 — dag en nacht bereikbaar.

## Aanvulling: onder "Delen met derden"

> Voor de digitale assistent maken wij gebruik van OpenRouter, dat uw vraag doorgeeft
> aan een taalmodel van Google. Wat u in de chat typt wordt daarvoor aan deze partijen
> doorgegeven. Zij zijn gevestigd in de Verenigde Staten, waardoor uw gegevens buiten
> de Europese Economische Ruimte kunnen worden verwerkt. Wilt u dat liever niet,
> gebruik de chat dan niet en bel of mail ons rechtstreeks.

**Waarom de oorspronkelijke slotzin is geschrapt.** Die luidde: *"Met deze partijen zijn de
vereiste afspraken gemaakt (verwerkersovereenkomst en passende waarborgen voor doorgifte)."*
Die afspraken zijn er niet. Zo'n zin in een privacyverklaring is een onwaarheid in een
juridisch document, en juist datgene waar een toezichthouder of een klagende nabestaande naar
grijpt. De geplaatste tekst zegt nu wat er feitelijk gebeurt en biedt een alternatief, zonder
waarborgen te claimen. Zodra de verwerkersovereenkomst er ligt
(`docs/juridisch/verwerkersovereenkomst-concept.md`) mag de zin alsnog terug.

## Aanvulling: onder "Websitestatistieken" (indien nog niet aanwezig)

> **Geanonimiseerde websitestatistieken**
>
> Om te zien welke pagina's worden bezocht en hoe onze digitale assistent
> gebruikt wordt, houden wij geanonimiseerde bezoekstatistieken bij. Wij
> bewaren daarbij **geen IP-adressen** en geen gegevens waarmee u persoonlijk
> herkenbaar bent. Om terugkerende bezoekers globaal te kunnen tellen gebruiken
> wij een versleutelde, dagelijks wisselende code die niet naar u te herleiden
> is. Wij delen deze statistieken niet met derden en gebruiken geen
> tracking-cookies of advertentienetwerken.

## Aanvulling: onder "Geen geautomatiseerde besluitvorming"

> De digitale assistent geeft alleen algemene informatie en neemt geen besluiten
> over u met rechtsgevolgen of vergelijkbare gevolgen.

## Checklist voor de founder vóór livegang

- [ ] **NOG STEEDS OPEN.** Databeleid + verwerkersketen van OpenRouter (→ Google) gecontroleerd en
  vastgelegd (zie `docs/paof/ai-governance-security.md`) — anders klopt de
  "Delen met derden"-tekst nog niet. Overweeg in OpenRouter de logging/retentie
  op de meest privacyvriendelijke stand te zetten.
- [x] Analytics-afweging (gecontroleerd 2026-07-28 op de draaiende container: LOG_QUESTIONS=false,
  analytics.jsonl bevat alleen tijdstip, taal, lengtes, reactietijd en doorverwijzing): standaard bewaart de server alleen **geanonimiseerde
  metadata** per gesprek (tijd, taal, lengtes, reactietijd, of er is
  doorverwezen) — géén berichttekst. Dan klopt "wij bewaren de gesprekken niet"
  nog. Zet je `LOG_QUESTIONS=true` (om een FAQ-backlog op te bouwen), dan wordt
  de vraagtekst wél bewaard → pas deze alinea aan met wat je bewaart en een
  bewaartermijn. Serverlogs kunnen IP-adressen bevatten (kort bewaren).
- [x] Websitestatistieken (velden nagemeten in pageviews.jsonl: ts, path, lang, device, ref, vid): de server logt geanonimiseerd paginabezoek
  (tijd, pagina, taal, apparaattype, herkomst) met een **versleutelde,
  dagelijks wisselende bezoeker-code**: géén IP-adres, géén user-agent,
  geen cookies. Onder de AVG is dit sterk geanonimiseerd; de sectie
  "Geanonimiseerde websitestatistieken" hierboven dekt dit. Bots worden
  uitgefilterd en niet meegeteld.
- [ ] **Alien de tekst laten nalezen op toon en juistheid.** Zij is de
  verwerkingsverantwoordelijke; dit is haar document, niet het onze. De correctie is
  doorgevoerd omdat de oude tekst aantoonbaar onjuist was, maar dat vervangt haar akkoord niet.
