# Geheugenlimieten en logrotatie

Toegevoegd op 2026-08-07, punten 3 en 4 uit `docs/decisions/kostenaudit-2026-08-07.md`.

## Waarom dit er is

Tot nu toe had **geen enkele container** een geheugenlimiet of een maximum aan zijn
logbestand. Twee gevolgen, en allebei raken ze een klant en niet ons:

1. **Eén weggelopen proces neemt de hele VPS mee.** Zonder limiet mag elke container al
   het geheugen van de machine pakken. De kernel kiest dan zelf wat hij afschiet, en die
   keuze houdt geen rekening met welke container een betalende klant bedient. In het
   slechtste geval gaat `ab.primecircle.cloud` plat door een fout in n8n.
2. **Een lawaaiige container vult de schijf.** Docker-logboeken groeien standaard
   ongelimiteerd. Loopt de schijf vol, dan kan PostgreSQL niet meer schrijven en zijn de
   leads van de klant weg terwijl alles "gewoon draait".

## Wat er nu staat

| Container | `mem_limit` | Waarom dat getal |
|---|---|---|
| `belvanger` | 384 MB | Node + statische site + chat-proxy, normaal 80-150 MB |
| `belvanger-portal` | 512 MB | Node + pg-client + Web Push-crypto, normaal 100-200 MB |
| `belvanger-portal-db` | 512 MB | PostgreSQL met `shared_buffers` op de standaard 128 MB |
| `dashboard` | 256 MB | Node zonder dependencies, doet niets tussen twee kliks |
| `n8n` | 1024 MB | De grootste; de task-runner draait in dezelfde container |

Logrotatie is overal gelijk: **`max-size: 10m`, `max-file: 3`** — dus maximaal 30 MB per
container, 150 MB in totaal, in plaats van ongelimiteerd.

## Het risico dat je moet kennen voordat je dit uitrolt

**Een te lage `mem_limit` vertraagt een container niet, die kilt hem.** De kernel schiet
het proces af zodra het over de grens gaat (OOM-kill), en met `restart: unless-stopped`
start hij daarna opnieuw op. Het resultaat is een container die om de zoveel minuten
herstart, en van buiten ziet dat eruit als "de site is soms traag".

De getallen hierboven zijn daarom **noodremmen, geen budgetten**: ze liggen op ongeveer
drie keer het normale verbruik. Ze zijn bedoeld om een ontspoorde container te stoppen,
niet om geheugen te besparen.

**Ze zijn geschat, niet gemeten.** Er staat nergens in de repo hoeveel RAM de VPS heeft,
en de sessie waarin dit is geschreven had geen toegang tot de machine. Meet het met de
stap hieronder voordat je iets verlaagt.

## Uitrollen

Per project, op de VPS:

```bash
cd /opt/belvanger        && docker compose up -d
cd /opt/belvanger-portal && docker compose up -d
cd /opt/n8n              && docker compose up -d
cd /opt/dashboard        && docker compose up -d
```

`up -d` is genoeg: zowel `mem_limit` als `logging` vraagt om een **hermaakte** container,
en dat doet compose vanzelf omdat de configuratie is gewijzigd. Een `docker restart` is
**niet** genoeg — dan blijft de oude container met de oude instellingen staan.

**Twee dingen die niet met terugwerkende kracht gebeuren:**

- Bestaande logbestanden worden niet afgekapt. Wil je de huidige berg kwijt, kijk dan
  eerst met de check hieronder hoe groot hij is.
- De n8n-database krimpt niet vanzelf. Het opruimen verwijdert rijen, maar SQLite geeft
  de ruimte pas terug na een VACUUM. Zie de instructie in `infra/n8n/docker-compose.yml`.

## Controleren dat het goed ging

```bash
bash infra/vps-check.sh
```

Draai dit **direct na de uitrol en nog een keer een dag later**. Waar je op let:

- **`OOM: JA`** bij een container: de limiet is te laag. Verhoog hem in het
  compose-bestand, commit dat, en rol opnieuw uit. Ga niet de limiet weghalen — dan ben
  je terug bij het probleem.
- **Verbruik boven ~70% van de limiet** in rust: te krap bemeten, verhoog voordat het
  misgaat.
- **Verbruik onder ~20%** na een week: je mag verlagen, maar dat levert niets op zolang
  de machine niet vol zit. Laat het.

## De containers die hier níet in staan

De limieten hierboven gelden alleen voor de vier projecten die in deze repo staan. Op de
VPS draaien er meer, en juist die zijn het risico:

- **`ab-uitvaartzorg`** — de referentiecase van PrimeCircle (geen Belvanger-klant), de
  enige container met echte bezoekers, en hij staat **nergens in git**.
- **`glasservice-siedsma`** — de proefsite van de buurman van de founder, glaszetbedrijf,
  mogelijk klant #1. Staat ook niet in git. **Niets aan uitzetten of weggooien.**
- **Traefik** — alle HTTPS loopt hierdoorheen, staat niet in git.
- **`knifensharp`, `primecircle`, `primecircle-*`, `agent-zero`** — vreemde projecten,
  zie punt 5 en 6 van de kostenaudit.

Voor logrotatie kun je die in één klap meenemen met een daemon-brede standaard:

```jsonc
// /etc/docker/daemon.json  — voegt samen met wat er al staat, niet overschrijven
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

```bash
systemctl reload docker    # géén restart: reload pakt log-opts op zonder alles neer te halen
```

**Doe dit bewust en niet terloops.** Het raakt elke container op de machine, ook die van
de klant, en de instelling geldt pas voor containers die daarna hermaakt worden. Als je
twijfelt: sla het over. De per-container-regels hierboven dekken al onze eigen boel af,
en de vreemde projecten kunnen beter helemaal weg (punt 6 van de kostenaudit).

Voor `mem_limit` bestaat er géén daemon-brede standaard. Die moet per container. Voor
`ab-uitvaartzorg` en `glasservice-siedsma` betekent dat: **eerst het compose-bestand in
git krijgen**, want zolang dat alleen op de VPS staat is elke wijziging eraan
onreproduceerbaar. Voor Siedsma geldt dat dubbel: als hij klant #1 wordt, is dat de
container die je als eerste opnieuw moet kunnen opbouwen.

## Gotchas

- **`mem_limit` werkt in Docker Compose v2, `deploy.resources` niet** (dat laatste wordt
  alleen in Swarm afgedwongen en stil genegeerd in gewone compose). Gebruik `mem_limit`.
- **Herstart een container na een OOM-kill niet met `docker restart`** om te kijken of het
  "nu wel goed gaat". Dat lost niets op en wist het spoor. Kijk eerst naar
  `docker inspect --format '{{.State.OOMKilled}}'`.
- **Zet de n8n-limiet niet lager dan 1 GB** zolang `N8N_RUNNERS_ENABLED` aan staat. De
  runner is een apart proces binnen dezelfde container en telt dus mee.
- **De pruning-variabelen in `infra/n8n/docker-compose.yml` zijn niet tegen de
  documentatie van 2.30.7 gehouden** (geen netwerk in de sessie waarin ze zijn
  toegevoegd). Kijk bij de eerste start of n8n er geen waarschuwing over logt.
