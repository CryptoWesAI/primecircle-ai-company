# Bronnotities: Cody Schneider over marketing-agents

Ruwe inhoud van de aflevering (Greg Isenberg × Cody Schneider), inclusief de negen
overzichtsborden uit de video. Dit bestand is het **bronmateriaal**; de omgerekende versie
voor Belvanger staat in `SYSTEEM.md`. Bewaard omdat de schermafbeeldingen zelf verdwijnen en
de uitspraken erin de argumenten zijn waarop het systeem rust.

---

## Bord 1: Let the market pick the winner

- **48 uur** tot een duidelijk beeld van waar de markt het meest ontvankelijk voor is.
- **Test breed:** duizend creatives, niet drie. Hetzelfde idee, 10 tot 20 positioneringen.
  Laat volume de winnaar vinden.
- **De beginnersfout:** een paar advertenties, ze floppen, stoppen. *"Only organic, only word
  of mouth."* Cody: *"We're not Don Draper"* — je legt de markt geen idee op, je legt creative
  in de markt en meet wat terugkomt.
- **De hoek die je zelf nooit zou kiezen:** anti-Yoast positionering. *"It makes you do the
  work rather than doing it for you."*
- **Het rekensommetje:** €1 in, €5 uit. *"Keep feeding that ATM."*
- **100 advertenties:** was twee weken werk, nu 90 minuten.
- **Een bureau:** tienduizenden per maand, nu je eigen systeem.
- Cody: *"This is a lifestyle choice. Marketing is not a campaign anymore."*

## Bord 2: Solve for entropy, feed it new DNA

- **Het probleem:** de agent gaat op dezelfde manier denken. Greg: *"No one speaks about that."*
- Vier bronnen van nieuw DNA:
  1. **Ads Library**: advertenties van concurrenten rechtstreeks uit Facebook halen en als
     brontekst invoeren.
  2. **YouTube**: honderden kanalen alleen al over WordPress; inzichten eruit mijnen en als
     advertentiehoek draaien.
  3. **Podcasts**: zelfde spel, ander corpus.
  4. **Virlo API**: scrapet TikTok en inmiddels Instagram Reels. *"Most viral beauty posts
     from the last week."* Formats en trends eruit.
- **Waarom het blijft bewegen:** trends verversen 10x sneller dan begin jaren 2000, en het
  begint op short form.
- Cody: *"What this ends up looking like in the final form is like a virtual employee."*

## Bord 3: Ten ads a day, then let them fight

Wat één klant van hem nu draait:

1. **Publiceren**: 2 adsets per dag, 5 advertenties per set, automatisch geüpload in FB.
2. **Laten lopen**: 2 tot 3 dagen, alle tien blijven live, niemand raakt ze aan. Wachten op
   echt signaal.
3. **De slechtste eruit**: de agent haalt prestaties uit het datawarehouse, verliezers uit.
4. **Winnaarspool**: overlevers gaan in een eigen pool en concurreren daar om het budget.
5. **Promptdatabase**: elke JSON-prompt naar Nano Banana, elk script naar HeyGen of Seedance
   wordt bewaard. De agent leest wat won en maakt daar meer van.

> Het kiest geen advertenties. Het draait elke drie dagen een afvalrace.

## Bord 4: Pipeline → warehouse → agent → terug

- **Bronnen:** Facebook Ads, Google Analytics, PostHog, HubSpot CRM, Stripe.
- **Airbyte**: de datapijplijn. Open source, self-hosted, kant-en-klare connectoren.
  Claude Code zet het op.
- **ClickHouse**: het datawarehouse. Elke bron in samenhang. Koppelt de advertentie aan omzet.
- **De agent**: leest het warehouse, publiceert, pauzeert, promoveert winnaars. Gehost op
  Heroku of Railway.
- Facebook-resultaten stromen terug de bronnen in: dat is de lus.
- **De ban-mythe:** *"The agent is not the reason it got banned."* Ze trokken honderden
  miljoenen rijen op. Dat is een voorwaardenschending, geen agentprobleem.
  **Marketing API = alleen schrijven:** publiceren, pauzeren, promoveren.
- **Gratis extra:** gespreksmatige analyse in Claude Code. *"We can't hit payroll, what is
  going wrong?"* → antwoord: je debiteuren. Plus eigen dashboards op dezelfde data.

> **De regel:** lezen komt uit het warehouse. Schrijven gaat via de API.

## Bord 5: Twee creative-pijplijnen, vandaag in gebruik

| | Static | Video |
|---|---|---|
| Tool | Kie AI, dan Google Nano Banana | HeyGen (AI-avatar UGC) |
| Zaad | één concurrentieadvertentie, of een zijdelingse branche | dezelfde pijnpunten en uitkomsten |
| QA | vision-model over elke output: fonts, kleuren, is de tekst leesbaar | nog steeds een mens die kijkt |
| Limiet | bulk genereren, geen echte bovengrens | clips van ±9 sec, frames stitchen voor 30 sec |
| Status | werkt vandaag | Seedance is de volgende stap, *"where this is going"* |

- **De hedge:** *"It's not even the best"*: HeyGen levert nog steeds resultaat.
- Hetzelfde onderzoek voedt beide. Alleen de rendermachine verschilt.

## Bord 6: Na Andromeda is de creative de targeting

- **Wat je advertentie leest:** de statische afbeelding, de tekst in het beeld, de video, het
  videoscript, de landingspagina.
- **Wat het dan beslist:** wie de advertentie ziet. Het vindt de tien mensen in de VS met
  precies dat probleem. Geen interessetargeting nodig.
- **Jouw werk nu:** spreek pijnpunten en uitkomsten aan, laat de landingspagina matchen, en
  zet het conversiedoel dieper in de trechter (aanmelding, betaling).
- **Dood: interessegericht targeten.** *"Historically I would target people with a WordPress
  interest on Facebook. You do not need to do that anymore."* De advertentietekst draagt de
  targeting; Andromeda leest de creative én de landingspagina en routeert het.
- Cody: *"Facebook has turned into the best B2B ads channel that exists right now."*

## Bord 7: Bouw het bewezen plugin opnieuw, AI-first

Greg migreerde time.com en techcrunch.com naar WordPress; hij heeft van dichtbij gezien
hoeveel geld er in het plugin-ecosysteem zit.

| Plugin | Wat het nu doet | AI-first versie |
|---|---|---|
| **Yoast SEO** | rode en groene stipjes, jij fixt het zelf | agent schrijft de meta, herstructureert de content, zet interne links |
| **WPForms** | een statisch formulier | gespreksmatige agent die de lead kwalificeert en vragen beantwoordt |
| **WooCommerce** | jij schrijft elke productpagina | AI-winkelier: productbeschrijvingen, verlaten-mandflows |
| **Akismet** | spamfilter, instellen en vergeten | beveiligingsagent. *"Security, it's just endless."* |

- **Het moeilijke deel:** niet het idee, maar het goed bouwen en dan distributie vinden.
- Zoek plugins waar mensen al voor betalen en die geen AI-laag hebben. Lever de 10x versie.

## Bord 8: 43% van het web, en niemand bouwt ervoor

- **43%** van alle door Google geïndexeerde websites draait WordPress. Blue ocean, niemand
  voert uit.
- **De pitch:** Lovable, maar voor WordPress. Vibe-code de site op de WP-stack. Formulieren,
  CRM en beveiliging inbegrepen.
- **Het model:** €29 per maand, basistier koopt X tokens. Eén rekening in plaats van tien
  pluginrekeningen. Een vijfde tot een tiende van de kosten.
- **Uitbreidingsomzet:** John, ongediertebestrijding, ging in een maand door €1.000 aan tokens
  en bouwde zijn eigen planningssysteem.
- **Waarom het landt:** 50+ WP-bureaus per stad, elke klant verafschuwt de zijne, en niemand
  migreert wég van WordPress.
- **De tegenwind:** drie YC-founders die een pivot zochten, alle drie bedankten.
- Inschatting: een bedrijf van $10 miljoen per jaar binnen ±24 maanden, mits je uitvoert en
  positioneert.

## Bord 9: Drie tests voordat je het een agent noemt

1. **Verenigde data**: de hele pijplijn op één plek. Ziet het pad van advertentie tot omzet.
2. **Beslissingen op een ritme**: loopt zonder jou, met een denkstap erin.
3. **Leert van resultaat**: leest zijn eigen output terug, maakt meer van wat won.

- **Geen agent:** een lineaire n8n- of Zapier-flow. *"Not entirely running your marketing stack."*
- **En ook geen AGI:** *"Doesn't have to be an AGI Hermes thing. I actually don't want that."*
- **Wat het echt vraagt:** datapijplijn, datawarehouse, code gehost in de cloud.
- Cody: *"An agent is just code under the hood. It's just a decision tree."*

---

## Wat Cody nog wilde behandelen (voor later)

Google Ads-agents, influencer-outreach met prijsonderhandeling, cold-email met een agent die
de inbox beheert, TikTok/Reel-farms met tien accounts in de cloud, SEO-agents (keyword →
artikel → merkstem), AI-search-citaties, social-media-beheer voor LinkedIn en X, en
podcast-nieuwsbrieven met 11Labs-stemmen plus lead magnets.

Voor Belvanger is daarvan **cold email** het interessantst, want dat sluit direct aan op de
verkoopactie die er toch al ligt. Maar het valt onder dezelfde regel als de rest: pas
automatiseren als het handmatig al werkt.
