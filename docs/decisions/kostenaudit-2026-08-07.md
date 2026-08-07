# Kostenaudit: wat draait er, wat kost het, wat kan eruit

**Datum:** 2026-08-07 · **Aanleiding:** founder-verzoek tijdens vakantie, na de vraag
"waar ligt nog financiële waarde waar je mij niet voor nodig hebt".

---

## Lees dit eerst: wat deze audit wél en niet is

**Wat ik heb kunnen doen.** De hele repository uitkammen op wat er draait: vier
docker-compose-bestanden, alle `.env.example`-sleutels, de Traefik-routes, het
back-upscript, het besluitenlogboek en de specificatie van het privé-dashboard. Dat
geeft een **volledige inventaris van de systemen** en een harde lijst van welke
externe diensten daadwerkelijk een sleutel in productie hebben.

**Wat ik niet heb kunnen doen.** Ik kan vanuit deze sessie geen enkele externe host
bereiken (de egress staat dicht) en ik heb geen toegang tot je facturen, je
Hostinger-account, je Twilio-console of je OpenRouter-verbruik. **Geen enkel
eurobedrag in dit document is een gemeten bedrag.** Alles wat hieronder als bedrag
staat is een marktschatting of komt uit een eerdere notitie in de repo.

Ik gebruik daarom drie markeringen, en die staan er niet voor de sier:

| Markering | Betekent |
|---|---|
| **[feit]** | Staat letterlijk in de repo, met bestand erbij |
| **[schatting]** | Mijn inschatting van een marktprijs, door jou te controleren |
| **[onbekend]** | Ik weet het niet en gok niet — jij moet dit opzoeken |

De laatste sectie is een lijst van precies die dingen die jij in tien minuten in je
eigen accounts kunt nakijken en die deze audit van schatting naar feit tillen.

---

## De uitkomst in drie zinnen

1. **Je hebt geen kostenprobleem.** De maandelijkse uitgaven aan infrastructuur zijn
   naar schatting **€15 tot €25 per maand**, niet de €350 die in het ADHD-logboek als
   vaste lasten staat.
2. **Dat verschil is geen fout in dat logboek, maar een tijdsverschil.** De €350 is een
   schatting van je lasten **ná KvK-inschrijving**. Bijna al die kosten bestaan nu nog
   niet, en inschrijving is precies wat ze aanzet.
3. **De echte verspilling is geen geld maar geheugen en aandacht.** Op de VPS draaien
   minimaal negen containers waarvan er vier niets met Belvanger of met een klant te
   maken hebben, en één daarvan laat al weken een certificaataanvraag mislukken.

---

## 1. Wat er draait

> **Gecorrigeerd op 2026-08-07 door de founder, na de eerste versie van dit document.**
> Twee dingen die ik uit de repo niet kon weten en verkeerd had ingedeeld:
>
> 1. **AB Uitvaartzorg valt niet onder Belvanger.** Het is de referentiecase van
>    PrimeCircle, geen Belvanger-klant. Het telt dus **niet** mee in de twintig klanten
>    van het inkomensmodel en het draagt geen Belvanger-omzet. Voor de risico's verandert
>    er niets — het blijft de enige container met echte bezoekers en hij staat nog steeds
>    niet in git.
> 2. **`glasservice-siedsma` is geen administratief gat maar een warme prospect.** Het is
>    de buurman van de founder, glazenwasser, met een **proefwebsite die al draait** en
>    die mogelijk klant #1 wordt. Zie §7: dat is de belangrijkste bevinding van deze
>    hele audit geworden, en het is er geen over kosten.

### 1a. Belvanger en klanten (dit hoort er te zijn)

| Project | Container(s) | Waar bereikbaar | Bron |
|---|---|---|---|
| `belvanger` | 1 (site + chat + `/api/intake` in één) | `belvanger.nl`, `www.belvanger.nl`, `bvaanbod.primecircle.cloud` | `sites/belvanger/docker-compose.yml` |
| `belvanger-portal` | 2 (Node + `postgres:17-alpine`) | `dashboard.belvanger.nl` | `sites/belvanger-portal/docker-compose.yml` |
| `ab-uitvaartzorg` | 1 **[onbekend, geen compose in de repo]** | `ab.primecircle.cloud` | `CURRENT_STATE.md`, back-upvolume `ab-uitvaartzorg-data` |
| `glasservice-siedsma` | 1 **[onbekend, geen compose in de repo]** | **[onbekend]** | `infra/dashboard/SPEC.md` |
| `n8n` | 1 (`n8nio/n8n:2.30.7`) | `n8n.primecircle.cloud` | `infra/n8n/docker-compose.yml` |
| `dashboard` (privé) | 1 | alleen via Tailscale, `127.0.0.1:8095` | `infra/dashboard/docker-compose.yml` |
| Traefik | 1 | de reverse proxy voor alles | **[feit]** genoemd, staat **niet** in de repo |

> **Eerste bevinding, en het is geen kostenbevinding.** Twee van deze zes staan niet
> in git: **de AB-container** (de enige die een echte klant bedient) en **Traefik** (de
> laag waar alle HTTPS doorheen gaat). `infra/backup/README.md` noemt dat laatste zelf
> als bekend gat. Voor de kosten maakt het niets uit; voor de vraag "wat als de VPS
> omvalt" maakt het alles uit. Zet dit hoger op je lijst dan welke bezuiniging ook.

### 1b. Wat er verder nog draait (dit is de vraag)

Uit `infra/dashboard/SPEC.md` en `docs/decisions/DECISIONS_LOG.md`:

| Project | Wat ik ervan weet | Weg mee? |
|---|---|---|
| `knifensharp` | Ouder project. Claimt de apex `primecircle.cloud` + `www` in Traefik, **en zijn certificaataanvraag mislukt** | Apex-labels weg, container laten staan |
| `primecircle` | Heeft `backend/.env`, dus een echte applicatie | Stoppen en een week kijken |
| `primecircle-*` | Meervoud, aantal onbekend | Stoppen en een week kijken |
| `agent-zero` | Secrets in `docker-compose.yml` zelf | Stoppen en een week kijken |

Het besluitenlogboek van 18 juli spreekt van **"9+ containers"** als de reden dat je het
privé-dashboard hebt gebouwd. Dat getal klopt: zeven hierboven plus deze vier is elf.

**Vier van de elf containers draaien iets dat niets met het bedrijf te maken heeft.**

---

## 2. Wat het kost

### 2a. Wat er nu echt van je rekening gaat

| Post | Bedrag | Zekerheid | Toelichting |
|---|---|---|---|
| Hostinger VPS | ~€8–15/mnd | **[schatting]** | Eén machine, 95,85 GB schijf. Prijs hangt af van je contracttermijn |
| `primecircle.cloud` | ~₹2536/jaar ≈ **€2,30/mnd** | **[feit]** uit `DECISIONS_LOG.md` | Gratis eerste jaar, verlengt **2027-06-18**, auto-verlengen staat **AAN** |
| `belvanger.nl` | ~€1/mnd | **[schatting]** | €10–15 per jaar |
| Mailbox / SMTP | ~€0–2/mnd | **[onbekend]** | `SMTP_HOST` is ingevuld, maar ik weet niet bij wie |
| Twilio-nummer `+14474274008` | ~€1–3/mnd | **[schatting]** | Zie §3, dit is de enige echte lek |
| Twilio-verbruik | ~€0/mnd | **[schatting]** | Geen klanten, dus vrijwel geen verkeer |
| OpenRouter (`gemini-2.5-flash-lite`) | ~€0–1/mnd | **[schatting]** | Het goedkoopste model, en de sites hebben nauwelijks bezoek |
| **Totaal** | **~€15–25/mnd** | | |

### 2b. Wat je gratis gebruikt en waar dus niets te halen valt

Traefik, Let's Encrypt, Docker, PostgreSQL, n8n (community), Tailscale (gratis onder
100 apparaten), GitHub (privé-repo's gratis), de zelfgebouwde Web Push (geen dienst,
eigen code), de zelfgebouwde SMTP-client (geen dependency), Overpass/Nominatim voor de
prospectlijst.

**Dat is bewust zo gebouwd en het is de grootste kostenbesparing die er al ligt.** Een
concurrent die dit met GoHighLevel doet betaalt $97–$497 per maand voordat hij één klant
heeft. Jij betaalt de prijs van één VPS. Verander dit niet.

### 2c. Waar de €350 vandaan komt

`docs/research/adhd-topnotch-logboek.md` regel 154-155 noemt "VPS, domeinen, mailboxen,
boekhouding, verzekeringen, telefonieabonnement, software. Schatting ~€350 per maand".

Uitgesplitst naar wat je vandaag betaalt en wat pas begint bij inschrijving:

| Post | Nu | Na KvK | Zekerheid |
|---|---|---|---|
| VPS, domeinen, mailbox | €12–18 | €12–18 | **[schatting]** |
| Zakelijke rekening | €0 | €10–15 | **[schatting]** |
| Boekhoudpakket / boekhouder | €0 | €50–120 | **[schatting]** |
| Beroeps- en bedrijfsaansprakelijkheid | €0 | €30–60 | **[schatting]** |
| Zakelijk telefonieabonnement | €0 | €15–30 | **[schatting]** |
| Twilio-nummers per klant | €1–3 | schaalt mee | **[schatting]** |
| KvK-inschrijving | €0 | ~€80 **eenmalig** | **[schatting]** |

**De conclusie hieruit is belangrijker dan het bedrag.** Je vroeg eerder, vóór je zou
inschrijven, hoe groot de slaagkans is. Dit is het antwoord op de kostenkant daarvan:
**de inschrijving is niet de kostenpost, de inschrijving is de aan-knop.** Vanaf dat
moment loopt de meter van ongeveer €350 per maand, of er nu een klant is of niet, en
dan heb je bij €199 per klant al bijna twee klanten nodig om alleen de lucht te betalen.

**Wat ik daar níet uit concludeer:** dat je het moet uitstellen. Inschrijven is in
Nederland gekoppeld aan het feit dát je onderneemt, niet aan of je omzet hebt, en je
site staat live met een aanbod erop. Dit is een vraag voor de KvK of een boekhouder,
niet voor mij. Wat ik wel zeg: **weet dat dit de knop is, en zet hem niet aan in een
maand waarin je toch niet gaat bellen.**

---

## 3. Wat eruit kan, met het risico erbij

Gesorteerd op verhouding tussen opbrengst en risico. De opbrengst is bij bijna alles
géén geld, en dat zeg ik er expliciet bij, want een audit die doet alsof je hier €200
per maand wint zou onzin zijn.

### Doen, risico praktisch nul

> **Stand 2026-08-07:** punten 2, 3 en 4 zijn **gedaan in de repo** en gevalideerd met
> `docker compose config` op alle vier de bestanden. Ze staan nog **niet op de VPS** —
> dat is één `docker compose up -d` per project, zie `infra/LIMIETEN.md`. Punt 1 kan ik
> niet doen: dat zit in de Twilio-console en is een wijziging aan een externe dienst.

| # | Actie | Levert op | Risico van uitzetten |
|---|---|---|---|
| 1 | **`sms_url` van het Twilio-nummer weghalen van `demo.twilio.com`** | €0 | **Geen. Dit is een risico-verwijdering, geen bezuiniging.** Nu stuurt dat nummer een Twilio-demo-antwoord terug naar wie er sms't. Als dat ooit een echte prospect is, is dat de eerste indruk **[feit, `DECISIONS_LOG.md` 2026-07-27]** |
| 2 | **n8n-uitvoeringsgeschiedenis laten opruimen** | ~150 MB schijf, kortere nachtelijke back-up | Geen. Je verliest logboeken van testruns. `infra/backup/README.md` noemt dit zelf als open punt |
| 3 | **Logrotatie op alle containers** (`logging.options.max-size`) | Voorkomt dat de schijf volloopt | Geen. Staat al als open punt 5 in `CURRENT_STATE.md`. Zonder dit kan een lawaaiige container de VPS vullen, en dan gaat de site van je klant óók plat |
| 4 | **`mem_limit` op alle containers** | Voorkomt dat één proces de hele machine opeet | Geen. Nu heeft **geen enkele** container een geheugenlimiet **[feit, alle vier compose-bestanden]**. Eén weggelopen proces neemt AB Uitvaartzorg mee in zijn val |

### Doen, maar eerst zelf kijken

| # | Actie | Levert op | Risico van uitzetten |
|---|---|---|---|
| 5 | **`knifensharp` stoppen of zijn apex-claim weghalen** | Stopt een mislukkende certificaataanvraag | **Laag, maar kijk eerst.** Dit project claimt `primecircle.cloud` + `www` en zijn ACME faalt **[feit, `CURRENT_STATE.md`]**. Let's Encrypt heeft weeklimieten; een aanvraag die permanent faalt vreet daarvan. In het slechtste geval raakt een verlenging van een cert dat wél werkt geblokkeerd. **Zet hem niet weg, haal alleen de Traefik-labels van de apex af** |
| 6 | **`agent-zero`, `primecircle`, `primecircle-*` stoppen** | Geheugen. Je VPS zit op 45% | **Onbekend, want ik weet niet wat het is.** Aanpak: `docker stop`, een week niets doen, dan pas `docker rm`. Stoppen is omkeerbaar, weggooien niet |

### Níet aanraken

| # | Onderdeel | Waarom |
|---|---|---|
| 7 | **`glasservice-siedsma`** | Dit is de proefwebsite van de buurman, glazenwasser, **mogelijk klant #1**. Zet hier niets uit en gooi hier niets weg. Wat er wél moet gebeuren staat in §7 en dat is geen kostenwerk |

### Wel bekijken, maar níet uitzetten

| # | Onderdeel | Waarom het blijft |
|---|---|---|
| 8 | **n8n** | Het ADHD-logboek concludeerde dat twee cron-scripts n8n kunnen vervangen zonder dat een klant het merkt, en dat klopt technisch. **Maar de besparing is €0** (self-hosted, gratis licentie) en de vervanging kost je een avond. Zet dit pas om als n8n je in de weg zit, niet om kosten |
| 9 | **`bvaanbod.primecircle.cloud`** | Een aanbodpagina die nog niemand heeft gezien. Kost €0, één Traefik-route. Weghalen is opruimen, geen besparing, en je hebt hem nodig zodra je gaat bellen |
| 10 | **De zes voorbeeldpagina's op belvanger.nl** | De bouwkosten zijn al gemaakt. Weggooien levert niets op |
| 11 | **Het privé-dashboard** | Kost €0 (Tailscale gratis) en is je enige manier om zonder SSH bij je secrets te komen |

### Het enige dat echt geld lekt

| # | Actie | Levert op | Risico |
|---|---|---|---|
| 12 | **Twilio-nummer `+14474274008` opzeggen** | ~€1–3/mnd **[schatting]** | **Middel, en de besparing is niet het punt.** Dit is geen Nederlands nummer, en je eigen koppelchecklist zegt dat een `+1`-nummer voor een Nederlandse vakman een vertrouwensprobleem is **[feit, `sites/belvanger-portal/n8n/README.md`]**. De testopstelling die eraan hangt is bovendien al stuk (Twilio-fout 30007). Je moet bij klant #1 sowieso een NL-nummer kopen en dán opnieuw testen. **Maar:** zeg het pas op als je geen testopstelling meer nodig hebt vóór dat moment, want zonder nummer kun je de keten niet oefenen. Beter alternatief: **ruil het nu al in voor een NL-nummer met sms én voice.** Dan test je eindelijk de opstelling die je gaat verkopen, in plaats van een die je nooit gebruikt |

---

## 4. Wat dit kost per klant, en waarom dat de enige kostenvraag is die telt

**[schatting], gebaseerd op de cijfers in `docs/research/adhd-topnotch-logboek.md`:**

| Post | Per klant per maand |
|---|---|
| NL Twilio-nummer | ~€3 |
| Sms-alerts (gemiddelde klant, 3 leads/dag) | ~€11 |
| Gemiste oproep zelf (geweigerd gesprek) | ~€0 |
| Chatbot (OpenRouter) | < €1 |
| **Marginale kosten** | **~€15** |

Bij €199 per maand is dat ongeveer **92% brutomarge per klant**. De vaste kant van
€15–25 nu (of €350 na inschrijving) is binnen twee klanten gedekt.

**Wat deze audit wel en niet verandert aan de eerdere rekensom.** In
`docs/research/adhd-topnotch-logboek.md` staat, na correctie van mijn eigen fout, dat je
bij €149 per klant **27 klanten** nodig hebt voor €2.500 netto en **37** voor €3.500 —
boven je eigen leveringsplafond van 20. Die som gebruikte €350 vaste lasten.

Die €350 blijft staan en wordt door deze audit **niet** gunstiger, want het is de juiste
schatting voor ná inschrijving. Wat er wél bijkomt is een onderscheid dat de som niet
maakte: **zolang je niet bent ingeschreven zijn je vaste lasten ~€20, niet €350.** Op
€199 per klant betekent dat je break-even nu bij **één klant** ligt in plaats van bij
twee tot drie. Dat is geen argument om de inschrijving uit te stellen, maar het is wel
de reden dat de eerste klant nú goedkoper te dragen is dan later.

**Daarom is dit ook de laatste kostenaudit die iets oplevert.** Er valt in de kosten
niets meer te winnen dat in de buurt komt van wat één klant oplevert. Elke verdere
optimalisatie hier is werk dat op werk lijkt.

---

## 5. Wat jij moet nakijken, want ik kan het niet zien

Tien minuten in je eigen accounts, en dan is dit document geen schatting meer. Vul de
bedragen hieronder in en zet ze in dit bestand.

| # | Waar | Wat opzoeken | Vul in |
|---|---|---|---|
| 1 | Hostinger hPanel → Facturen | Wat betaal je per maand voor de VPS, en wanneer verlengt hij | €____ |
| 2 | Hostinger hPanel → Domeinen | Staat auto-verlengen van `primecircle.cloud` nog aan, en wat is het bedrag in euro's | €____ |
| 3 | Hostinger hPanel → E-mail | Betaal je apart voor de mailbox achter `SMTP_HOST` | €____ |
| 4 | Twilio Console → Billing | Wat kost `+14474274008` per maand, en staat er saldo op dat wegloopt | €____ |
| 5 | Twilio Console → Phone Numbers | Heb je nog **andere** nummers staan die je vergeten bent | ____ |
| 6 | OpenRouter → Usage | Wat is het verbruik van de laatste 30 dagen | €____ |
| 7 | Je bankrekening | Sta er nog abonnementen op die hier helemaal niet in staan | ____ |

**Punt 5 en 7 zijn de belangrijkste.** Elke audit op basis van een repository vindt
alleen wat iemand ooit heeft opgeschreven. Wat je vergeten bent, staat per definitie
nergens.

---

## 6. Wat ik hier niet in heb gezet

- **Een advies om de VPS te verkleinen.** Je zit op 45% geheugen mét vier vreemde
  projecten erop. Ruim die eerst op en meet dan opnieuw; verkleinen op basis van het
  huidige beeld is meten aan de verkeerde machine.
- **Een advies om over te stappen naar een goedkopere hoster.** De besparing is
  hooguit een paar euro, en het kost je een dag plus een verhuizing van een live
  klantsite. Dat is een slechte ruil van founder-tijd.
- **Een advies om iets te bouwen.** Deze audit levert vier configuratiewijzigingen op
  (logrotatie, geheugenlimieten, n8n-opruiming, `sms_url`) die samen ongeveer een uur
  kosten, en verder alleen dingen die jij in een browser moet nakijken.

---

## 7. Siedsma: wat deze audit per ongeluk vond

Ik zocht naar containers die geld kosten en vond er één die dat niet doet. Dit onderdeel
staat in een kostenaudit omdat het daar is opgedoken, niet omdat het erin thuishoort.

**Wat er is:** een draaiende proefwebsite voor de buurman van de founder, glazenwasser,
mogelijk klant #1.

**Wat er niet is, en dit is de bevinding:**

| Zou er moeten zijn | Staat er |
|---|---|
| `clients/glasservice-siedsma/` | Bestaat niet |
| Een dossier, intake of gespreksnotitie | Nul documenten in de hele repo |
| Een regel in `SELLING.md` | Niets. De teller staat op 0 gesprekken |
| Het compose-bestand | Alleen op de VPS |
| Een voorbeeldpagina voor zijn vak | Er zijn er zeven, glazenwasser zit er niet bij |
| Een regel in `product/chatbot/galerij.json` | Ontbrak, nu toegevoegd (leeg, niet geraden) |

**De dichtstbijzijnde kandidaat voor klant #1 bestaat dus nergens in de administratie.**
Twee mensen zijn koud aangeschreven en staan wél in `SELLING.md`; de buurman voor wie al
een site draait, staat er niet in. Dat is geen boekhoudfoutje: het is precies de reden
dat de verkoopteller op nul staat terwijl er een warme prospect met een gebouwd product
naast de deur woont.

### Eén ding dat je moet weten voordat je hem pitcht

**De rekensom van Belvanger werkt niet zoals hij is voor een glazenwasser.** De hele
pitch en de "bespaard"-widget draaien op `avg_job_value`, met een standaard van **€250**
per klus (`sites/belvanger-portal/src/server.js:93`, en dezelfde aanname zit in de
rekenmachine op de homepage). Een gemiste oproep is dan ~€150 misgelopen omzet, en €199
per maand verdient zichzelf terug bij anderhalve gemiste klus.

Een glazenwasser draait geen klussen van €250. Eén beurt is eerder €30 tot €60. Zet je
zijn echte klusbedrag in het dashboard, dan zegt de widget iets in de orde van €25 per
gemiste oproep, en dan kost Belvanger hem acht gemiste oproepen per maand voordat het
quitte speelt. **Op het huidige verhaal valt hij door de mand, en dat merk je pas tijdens
het gesprek.**

Dat betekent niet dat hij geen goede klant is — het betekent dat je bij hem iets anders
verkoopt. Een glazenwasser leeft van **terugkerende rondes**, niet van losse klussen. Een
nieuwe klant die vier keer per jaar €45 betaalt en drie jaar blijft is €540 waard, geen
€45. **Als je hem pitcht, reken dan met contractwaarde en niet met klusprijs**, en zet
`avg_job_value` op de waarde van een gewonnen *ronde*, niet van een beurt — met die keuze
opgeschreven op zijn klantkaart, anders is het over een half jaar een onverklaarbaar getal.

Dit is een aanname van mij, geen meting: ik weet niet wat Siedsma rekent en hoe vaak hij
terugkomt. **Dat is precies de eerste vraag die je hem stelt**, en het is een prettige
vraag om mee te beginnen, want het is oprechte interesse in zijn bedrijf en geen pitch.

### Wat er moet gebeuren, in deze volgorde

1. **Vraag hem hoe het met de proefsite is.** Geen aanbod, geen prijs. Je hebt iets voor
   hem gebouwd en je wilt weten of hij er iets aan heeft. Dat is het hele gesprek.
2. **Vraag naar zijn cijfers**: wat kost een beurt, hoe vaak per jaar, hoeveel klanten
   blijven, en hoe vaak belt er iemand die hij niet opneemt.
3. **Leg beide vast** in `clients/glasservice-siedsma/docs/` en zet hem als regel in
   `SELLING.md`. Zolang hij daar niet in staat, telt hij voor niemand mee, ook niet voor
   jezelf.
4. **Pas daarna** de rekensom en een aanbod, met contractwaarde als basis.

Stap 1 en 2 kosten samen een half uur en er hoeft niets voor gebouwd te worden.

---

## Hoogste-hefboom vervolgactie

**Niet uit deze audit, en niet uit de prospectlijst.** Er is hier ongeveer €3 per maand te
winnen; je kostenkant is gezond en er valt niets te snijden dat ertoe doet. De vier
configuratiewijzigingen uit §3 zijn een uur werk en gaan over risico, niet over geld.

De hefboom is §7. **Spreek de buurman.** Er draait al een site voor hem, hij woont naast
je, en hij staat in geen enkel bestand. Dat is een kortere weg naar klant #1 dan honderd
koude nummers, en het is de enige actie in dit hele document waar geen enkele schatting
in zit.
