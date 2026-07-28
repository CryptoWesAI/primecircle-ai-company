# Privacy-alinea voor de chatassistent (AB Uitvaartzorg)

> Klaar om in `privacy-statement.html` te plakken vóór de chatbot live gaat
> (go-live gate, zie spec §8). **Geen juridisch advies**: laat het door Alien
> (en bij voorkeur een jurist) nalezen, en pas het aan als de opzet wijzigt.
> Geschreven voor de **v1 (stateless)**: de assistent slaat niets op.

## Waarom deze alinea nodig is

De website krijgt een digitale AI-assistent die algemene vragen beantwoordt.
Zodra die live staat, verwerkt hij wat bezoekers typen en gebruikt hij een
externe AI-dienst (Anthropic) als verwerker. Dat moet transparant in de
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

> Voor de digitale assistent maken wij gebruik van een AI-dienst via OpenRouter
> (met Google als aanbieder van het taalmodel). Wat u in de chat typt, wordt aan
> deze dienst doorgegeven om een antwoord te genereren. Hierbij kunnen gegevens
> buiten de Europese Economische Ruimte worden verwerkt. Met deze partijen zijn
> de vereiste afspraken gemaakt (verwerkersovereenkomst en passende waarborgen
> voor doorgifte).

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

- [ ] Databeleid + verwerkersketen van OpenRouter (→ Google) gecontroleerd en
  vastgelegd (zie `docs/paof/ai-governance-security.md`) — anders klopt de
  "Delen met derden"-tekst nog niet. Overweeg in OpenRouter de logging/retentie
  op de meest privacyvriendelijke stand te zetten.
- [ ] Analytics-afweging: standaard bewaart de server alleen **geanonimiseerde
  metadata** per gesprek (tijd, taal, lengtes, reactietijd, of er is
  doorverwezen) — géén berichttekst. Dan klopt "wij bewaren de gesprekken niet"
  nog. Zet je `LOG_QUESTIONS=true` (om een FAQ-backlog op te bouwen), dan wordt
  de vraagtekst wél bewaard → pas deze alinea aan met wat je bewaart en een
  bewaartermijn. Serverlogs kunnen IP-adressen bevatten (kort bewaren).
- [ ] Websitestatistieken: de server logt geanonimiseerd paginabezoek
  (tijd, pagina, taal, apparaattype, herkomst) met een **versleutelde,
  dagelijks wisselende bezoeker-code**: géén IP-adres, géén user-agent,
  geen cookies. Onder de AVG is dit sterk geanonimiseerd; de sectie
  "Geanonimiseerde websitestatistieken" hierboven dekt dit. Bots worden
  uitgefilterd en niet meegeteld.
- [ ] Alien de tekst laten nalezen op toon en juistheid.
