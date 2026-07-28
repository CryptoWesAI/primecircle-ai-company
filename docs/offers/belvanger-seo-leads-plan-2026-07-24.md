# Belvanger: SEO- en leadsoptimalisatieplan (belvanger.nl)

Gebaseerd op een technische audit van de live site op 2026-07-24 (curl-checks
op robots, meta, structured data, headings, afbeeldingen).

## De belangrijkste bevinding staat los van SEO

De homepage (en aanbod.html, privacy.html, voorwaarden.html) staat op
`<meta name="robots" content="noindex, nofollow" />`. Dat betekent: Google
indexeert deze site op dit moment **helemaal niet**, ongeacht hoe goed de
content of techniek is. Dit is geen bug, dit stond al bewust zo in
`STATUS.md`:

> `noindex` eraf pas als: een echt telefoonnummer, KvK-inschrijving,
> bijgewerkte privacy/voorwaarden met bedrijfsnaam + KvK-nummer, en de
> contactPoint + prijs terug in de JSON-LD.

Je hebt in dit gesprek net bevestigd dat je nog geen KvK hebt en bewust eerst
een klant wil vinden voordat je dat regelt. Dat is een prima volgorde, maar
het betekent wel: **elke SEO-inspanning nu heeft nul effect totdat die
voorwaarde is opgelost.** Dit is dus geen SEO-vraagstuk maar een
volgordevraagstuk: KvK/telefoonnummer eerst, dan pas heeft indexeren zin. Ik
zou dit niet omzeilen door nu alvast te indexeren met onechte gegevens, dat
staat haaks op de eerlijkheids-insteek die je overal elders wel aanhoudt
(prijzen, "opgevangen"-definitie, geen nepreviews).

**Advies:** behandel "noindex eraf" als een aparte milestone, gekoppeld aan
KvK-inschrijving, niet aan dit SEO-plan. Alles hieronder kun je wel al
voorbereiden, zodat je vanaf dag 1 van het indexeren een voorsprong hebt in
plaats van pas dan te beginnen.

## Wat al goed staat (geen actie nodig)

- Eén H1 per pagina, correct.
- Volledige Open Graph-tags (title, description, image met juiste
  afmetingen, locale) — goed voor het delen op social/WhatsApp.
- Sterke structured data: `Organization`, `WebSite`, `FAQPage`, `Service`,
  `Offer` staan er al. Dit is meer dan de meeste startende sites hebben.
- Alle 6 afbeeldingen op de homepage hebben een `alt`-attribuut.
- `robots.txt` en `sitemap.xml` zijn technisch correct opgezet (ze zijn nu
  alleen nutteloos zolang de meta-tag blokkeert).

## Kleine technische polish (nu al te doen, kost weinig tijd)

- **Favicon ontbreekt** (`favicon.ico` geeft 404). Klein, maar zichtbaar in
  elke browsertab en bookmark — makkelijk te fixen, doe ik voor je zodra je
  het wil.
- Check of Google Search Console en Bing Webmaster Tools al gekoppeld zijn
  aan het domein (property verifiëren kan al vóór indexeren, zodat je vanaf
  dag 1 kunt meten).

## Realistische verwachting: SEO is een maanden-project, geen weken-project

Belvanger is een gloednieuw merk. Niemand zoekt nu al op "Belvanger" in
Google, er is dus geen bestaand zoekvolume om te vangen op merknaam. De
enige realistische opening is **long-tail, niet-merkgebonden content**: mensen
die zoeken op een probleem, niet op jouw naam. Zelfs met perfecte uitvoering
duurt het typisch 3-6+ maanden voordat een gloednieuw domein merkbaar
organisch verkeer krijgt. Dit past bij wat je zelf al aangaf: SEO is het
**parallelle, langzamere spoor** naast persoonlijke acquisitie, niet een
vervanging ervoor op de korte termijn.

## Contentplan: onderwerpen die je doelgroep echt zoekt

Geen blogposts over Belvanger zelf, wel over het probleem dat de doelgroep
heeft, in hun eigen zoektaal:

- "gemiste oproep klant kwijt vakman"
- "automatisch terugbellen sms zzp"
- "website laten maken loodgieter/dakdekker/hovenier" (per vakgebied een
  eigen, korte pagina — dit sluit ook aan bij de al bestaande
  voorbeeldengalerij per vakgebied)
- "hoeveel omzet mis je door gemiste telefoontjes" (haakt in op de bestaande
  rekenmachine op de homepage — die kan zelf een deelbare, linkbare pagina
  worden)
- "review-management vakman Google" (sluit aan bij de reputation-management
  suggestie uit het GoHighLevel-onderzoek van vandaag)

Elke pagina: één concreet probleem, één concreet antwoord, geen opvulzinnen.
Kwaliteit boven kwantiteit, vooral omdat je dit zelf moet schrijven naast een
baan.

## Backlinks: de meest onderschatte hefboom voor een nieuw merk

- **Elke klantwebsite die je bouwt, krijgt een kleine "Website door
  Belvanger"-link in de footer** (gangbare praktijk bij webbureaus). Dit
  kost niets, en elke nieuwe klant wordt automatisch ook een backlink zodra
  hun site zelf wél geïndexeerd staat. Bij 10 founding-klanten zijn dat 10
  relevante, thematisch passende backlinks, precies de doelgroep die Google
  serieus neemt.
- **Startersdirectories en KvK-adjacente lijsten** zodra je bent
  ingeschreven (bijv. KvK's eigen bedrijvenzoeker, lokale
  ondernemersverenigingen) zijn lage-moeite, betrouwbare vermeldingen.
- **Het partnernetwerk-idee dat je vandaag ook opperde** (doorverwijzen naar
  bevriende vakmensen) kan later ook een backlink-mechanisme worden: als
  partnerbedrijven naar elkaar linken, bouwt dat organisch autoriteit op
  zonder dat het als linkbuilding-truc aanvoelt, want het is een echte,
  functionele relatie.

## Volgorde, samengevat

1. **Nu**: favicon fixen, Search Console/Bing property alvast klaarzetten,
   contentonderwerpen uitwerken zodra er tijd is — dit kost niks en is
   klaar voor gebruik zodra indexeren mag.
2. **Zodra KvK + echt telefoonnummer geregeld zijn**: privacy/voorwaarden en
   JSON-LD bijwerken (staat al als TODO in `STATUS.md`), dan pas `noindex`
   eraf en sitemap actief laten crawlen.
3. **Doorlopend, na indexeren**: 1-2 contentpagina's per maand, elke nieuwe
   klantwebsite met eigen backlink, resultaten meten via Search Console.
4. **Verwacht geen leadvolume via deze route vóór maand 3-4** na indexeren.
   Houd de persoonlijke Facebook-aanpak (zie
   `belvanger-facebook-stappenplan-2026-07-24.md`) als primaire leadbron
   totdat dit spoor op gang komt.
