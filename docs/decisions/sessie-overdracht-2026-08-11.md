# Sessie-overdracht: wat er is gedaan, en hoe je het controleert

**Branch:** `claude/belvanger-nl-info-47rkq9` · **HEAD:** `b3e6a4d` · **41 commits voor op
`master`** · geschreven 2026-08-11.

---

## Voor de agent die dit leest

Dit document is geschreven door de sessie die dit werk heeft gedaan. **Neem niets aan
omdat het hier staat.** Elke bewering hieronder heeft een commando ernaast waarmee je hem
zelf kunt bevestigen of onderuithalen. Draai ze en rapporteer wat je vindt, ook — en juist —
als het afwijkt.

**Wijzig niets zonder dat de founder erom vraagt.** Er staan hieronder bewuste keuzes die
er als slordigheid uitzien maar het niet zijn, en er staan twee openstaande beslissingen die
alleen de founder mag nemen. Ze staan onderaan.

---

## 1. Wat deze sessie heeft gedaan

Vijf blokken werk, alle vijf op deze branch:

| # | Wat | Belangrijkste bestanden |
|---|---|---|
| 1 | **Kostenaudit** van de VPS: wat draait er, wat kost het, wat kan eruit | `docs/decisions/kostenaudit-2026-08-07.md` |
| 2 | **Geheugenlimieten, logrotatie en n8n-opruiming** op alle eigen containers | `infra/LIMIETEN.md`, `infra/vps-check.sh`, 4× `docker-compose.yml` |
| 3 | **Achtste voorbeeldpagina (glaszetter)** met vier eigen gegenereerde foto's, plus een galerijkaart in NL en EN | `sites/belvanger/site/voorbeelden/glaszetter-premium.html`, `docs/build/glaszetter-beelden.md` |
| 4 | **Deploy vanaf de VPS zelf**, zodat de founder niet vastzit aan één PC | `sites/belvanger/deploy-vanaf-vps.sh` |
| 5 | **Verkoopwerk**: post 3 geanalyseerd, post 4 geschreven, prijsinconsistentie gevonden | `SELLING.md`, `docs/offers/belvanger-facebook-post-4.md` |

Plus een merge van `master` (de showcasefilm-lijn van de founder) in deze branch.

---

## 2. Controleerbare beweringen

Draai deze vanaf de repo-root.

### Git

| Bewering | Commando | Verwacht |
|---|---|---|
| Branch staat 41 commits voor op master | `git rev-list --count origin/master..HEAD` | `41` |
| Alles is gepusht | `git status -sb \| head -1` | geen `[ahead N]` |
| Master is volledig opgenomen | `git merge-base --is-ancestor origin/master HEAD && echo ja` | `ja` |

### Tests

| Bewering | Commando | Verwacht |
|---|---|---|
| De intake-testsuite is groen | `cd product/chatbot && npm test` | eindigt op `Alles goed.`, 44 regels `ok` |
| NL en EN lopen niet uiteen | `node sites/belvanger/tests/taalpariteit.mjs` | `Geen structurele verschillen.` en **8** voorbeeldkaarten in beide |

### De acht voorbeeldpagina's

| Bewering | Commando | Verwacht |
|---|---|---|
| Er zijn er acht | `ls sites/belvanger/site/voorbeelden/*.html \| wc -l` | `8` |
| Alle acht hebben het aanvraagformulier | `grep -l aanvraag__kaart sites/belvanger/site/voorbeelden/*.html \| wc -l` | `8` |
| Alle acht hebben de sterretjesfix | `grep -l 'stat b .stars' sites/belvanger/site/voorbeelden/*.html \| wc -l` | `8` |
| De glaszetterspagina heeft een eigen accentkleur | `grep -o -- '--pan:#[0-9A-F]*' sites/belvanger/site/voorbeelden/glaszetter-premium.html \| head -1` | `--pan:#0F5FA8` |
| De vier beelden bestaan | `ls -la sites/belvanger/site/assets/voorbeelden/*glaszetter*` | 4 bestanden, 50-112 kB |

**De sterretjesfix, voor het geval je hem als ruis aanziet.** `.stat span{display:block}` pakte
óók het sterretje binnen de `<b>`, waardoor "4,9" en de ster op aparte regels stonden en dat
ene statblok 20px hoger werd dan de andere drie. Bevestigd met `getComputedStyle` op alle
zeven oude pagina's vóór de fix. Niet weghalen.

### Containerlimieten

| Bewering | Commando | Verwacht |
|---|---|---|
| Alle 5 services hebben een geheugenlimiet | `grep -c mem_limit sites/belvanger/docker-compose.yml sites/belvanger-portal/docker-compose.yml infra/n8n/docker-compose.yml infra/dashboard/docker-compose.yml` | 1, 2, 1, 1 |
| Alle 5 hebben logrotatie | zelfde bestanden, `grep -c max-size` | 1, 2, 1, 1 |
| De compose-bestanden zijn geldig | `docker compose -f <bestand> config` per project | geen fout |

---

## 3. Wat NIET is geverifieerd, en waarom

Dit is het belangrijkste deel van dit document. De sessie draaide in een container die
**de VPS niet kan bereiken** (geen `ssh`/`scp`/`rsync`, poort 22 dicht) en waarvan de
**egress-policy externe hosts blokkeert** (403 op CONNECT).

| Niet geverifieerd | Gevolg |
|---|---|
| **Niets is gedeployd.** Geen enkele wijziging staat op de VPS | Alles hieronder geldt pas na `bash deploy-to-vps.sh` |
| **`deploy-vanaf-vps.sh` is nooit gedraaid.** Alleen syntaxis, argumentafhandeling, de vier weigeringen, een volledige dry-run en de tar-uitsluitingen zijn getest | Eerste keer thuis draaien, met `--dry-run`, met de PC ernaast. Staat ook boven in het bestand |
| **De n8n-pruningvariabelen** (`EXECUTIONS_DATA_PRUNE`, `_MAX_AGE`, `_PRUNE_MAX_COUNT`) zijn niet tegen de documentatie van n8n 2.30.7 gehouden | Kijk bij de eerste start of n8n een waarschuwing over onbekende variabelen logt |
| **De geheugenlimieten zijn geschat, niet gemeten.** Nergens staat hoeveel RAM de VPS heeft | Ze liggen op ~3× normaal verbruik als noodrem. Een te lage limiet **kilt** een container, hij vertraagt hem niet. Draai `infra/vps-check.sh` na de uitrol |
| **De mail van het intakeformulier is nooit end-to-end getest** | Eén testinzending doen en controleren of sectie G en het blok "DE STEM VAN DE KLANT" in de mail naar `info@belvanger.nl` staan |
| **De Facebook-post is nooit gelezen** door de sessie (host geblokkeerd); de tekst in `SELLING.md` komt uit een plakactie van de founder | — |
| **De concurrentiegegevens** in `docs/research/concurrentie-vakmarketing-adhd-2026-08-07.md` komen uit zoekmachinesamenvattingen; geen enkele pagina is geopend | Staat als caveat in dat rapport zelf |

---

## 4. Bewuste keuzes die eruitzien als fouten

Verander deze niet zonder te vragen.

1. **`master` staat op €99/maand en de prijskaart op €199.** Dat is een openstaande
   beslissing van de founder, geen vergeten bestand. Zie punt 5.
2. **De radioknop `terugbelgedrag` in `klantintake.html` heeft geen `checked`-default.**
   Het is de diskwalificerende vraag; het vooraf aanvinken van het vleiende antwoord
   garandeert dat je nooit een eerlijk antwoord krijgt. Er staat een comment bij.
3. **De commentaren in `glaszetter-premium.html` bevatten expres geen klassenamen tussen
   aanhalingstekens en geen bestandspaden.** `tools/glaszetter-beelden-inbouwen.mjs`
   herkent aan zulke tekst of het werk al gedaan is, en heeft zichzelf twee keer om de tuin
   geleid door zijn eigen documentatie mee te lezen.
4. **Het filmdocument beschrijft zeven vakken.** Dat is correcte geschiedenis voor 28 juli.
   Er staat een notitie bij dat er inmiddels acht zijn en dat hermonteren **niet** de
   bedoeling is.
5. **`sites/belvanger/site/aanbod.html` belooft "€99 per maand levenslang vast"** voor de
   eerste 10 klanten. Dat is opzettelijk nog niet gewijzigd — zie punt 5 hieronder.
6. **De verkeerde marge-tabel in `docs/research/adhd-topnotch-logboek.md` staat er nog,
   met een correctiebanner erboven.** Bewust: er was al naar gehandeld, dus hem stilletjes
   vervangen zou de fout onzichtbaar maken.

---

## 5. Openstaande beslissingen — alleen de founder

**A. De prijs.** De site zegt in de FAQ, in de prijssectie én in de JSON-LD structured data
(NL en EN) **€625 setup + €99/maand**, en `aanbod.html` belooft dat €99 **"levenslang
vast"** aan de eerste 10 klanten. `docs/offers/belvanger-prijskaart-A4.md` zegt **€595 +
€199** met een plafond van €299.

Die €199 komt uit de adversariële ronde die aantoonde dat een vlakke €99 de marge laat
**dálen** naarmate een klant méér belletjes krijgt (sms schaalt mee, de omzet niet), en dat
€149 het inkomensdoel mist met 7 tot 17 klanten.

De founder heeft aangegeven een lage instapprijs voor de eerste 10 te willen en daarna te
verhogen. De onbesliste vraag is het woord **"levenslang"**: doorgerekend met de cijfers uit
de prijskaart kost een permanente lock op 10 klanten ongeveer **€650 netto per maand** bij
volle bezetting.

**Tot dit besloten is, gaat post 4 niet de deur uit.**

**B. Merge naar master.** 41 commits. Plus er staat een tweede branch,
`claude/seedance-2.5-research-jffb6p` (25 commits, alleen `.claude/skills/` en
documentatie, **nul overlap**, kan zonder risico apart gemerged worden).

---

## 6. De volgorde die nog moet gebeuren

1. `cd product/chatbot && npm test` → `Alles goed.`
2. `cd sites/belvanger && node assemble.mjs && bash deploy-to-vps.sh` → `Klaar en geverifieerd.`
3. `cd sites/belvanger-portal && bash deploy-to-vps.sh` (script van de founder)
4. `cd infra/dashboard && bash deploy-to-vps.sh`
5. n8n: compose-bestand naar `/opt/n8n/` en `docker compose up -d`
6. `infra/vps-check.sh` op de VPS → let op `OOM: JA`
7. In de browser: acht vakken in de galerij, de vraagkaart als brede band, en de
   glaszetterspagina met leesbare kop over de foto
8. Eén testinzending van het intakeformulier
9. **Daarna pas** de prijsbeslissing en post 4

---

## 7. Wat je niet moet doen

- **Niet deployen zonder eerst `npm test`.**
- **Geen tweede schrijvende sessie** tegelijk in deze repo. Er is deze sessie al één keer
  bijna werk verloren gegaan doordat 18 gewijzigde bestanden op de PC nergens waren
  vastgelegd.
- **`git checkout` niet gebruiken om "op te ruimen"** zolang er ongecommit werk staat.
- **De TLS-verificatie niet uitzetten en `HTTPS_PROXY` niet leegmaken** om een geblokkeerde
  host te bereiken. Meld de host in plaats daarvan.
- **`voorbeelden/`-pagina's krijgen geen live chatwidget.** `assemble.mjs` sluit die map
  bewust uit; het zijn fictieve bedrijven.
