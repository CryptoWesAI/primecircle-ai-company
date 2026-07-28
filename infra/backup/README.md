# Back-up en herstel

Wat er elke nacht gebeurt, waar het staat, en hoe je het terugzet als het misgaat.

## In één plaatje

```
03:30  VPS      maak-backup.sh      pakket klaarzetten in /opt/belvanger-backups/offsite/
12:30  jouw PC  haal-backup.ps1     ophalen naar D:\Belvanger-backups\ + vingerafdrukken checken
07:00  VPS      systeemcheck        mailt als een van beide schakels stilvalt
1e vd maand     hersteltest.sh      pakket echt terugzetten in een wegwerpdatabase
```

**Jouw PC haalt op, de VPS duwt niet.** Dat is met opzet. De server heeft geen enkele toegang
tot je back-upmap, dus wie de server overneemt kan je kopieën niet wissen. Bij een push-opzet
kan dat wel, en dan verlies je allebei tegelijk op precies het verkeerde moment.

## Wat er in een pakket zit

| Bestand | Wat het is | Waarom het erin moet |
|---|---|---|
| `portal-db.sql.gz` | De hele portaldatabase | De leads van de klant. Het belangrijkste van alles. |
| `n8n.sqlite.gz` | n8n-database, consistente kopie | Je workflows én de versleutelde koppelingen |
| `n8n-overig.tar.gz` | De rest van de n8n-map | Instellingen, zonder de logboeken |
| `belvanger-data.tar.gz` | Bezoekstatistieken en aanvragen belvanger.nl | Staat nergens anders |
| `ab-uitvaartzorg-data.tar.gz` | Idem voor de klant AB | Idem |
| `dashboard-data.tar.gz` | Gegevens van het interne dashboard | Idem |
| `traefik-letsencrypt.tar.gz` | Alle HTTPS-certificaten | Staat in geen enkele repo. Kwijt = alles opnieuw aanvragen, en Let's Encrypt heeft weeklimieten |
| `env-bestanden.tar.gz` | Alle `.env`-bestanden uit `/opt` | Je sleutels en wachtwoorden. Staan met opzet niet in git, dus ook nergens anders |
| `SHA256SUMS` | Vingerafdruk per bestand | Zodat je PC kan controleren dat er onderweg niets kapot is gegaan |

Ongeveer 25 MB per nacht, waarvan 25 MB n8n. De website zelf zit er **niet** in: die staat in git
en op GitHub, dus die heb je al twee keer.

## Wat er níet in zit, en dat is bewust

- **De code.** Staat in git, op GitHub en op je PC.
- **De n8n-logboeken.** 34 MB puur logboek dat je bij een herstel niet nodig hebt.
- **Docker-images.** Die bouw je opnieuw uit de repo.

## Bewaartermijn

- **Op de VPS:** de laatste 7 pakketten. Dat is alleen een wachtkamer.
- **Op je PC:** alles van de laatste 30 dagen, plus van elke maand het eerste pakket. Zo heb je
  een fijnmazige reeks voor recente fouten én een lange lijn terug voor iets wat je pas laat
  ontdekt.

## Hoe je merkt dat het stukgaat

Dat is het punt van deze hele opzet. De systeemcheck van 07:00 kijkt naar drie dingen:

| Melding | Betekent |
|---|---|
| Back-up op de server: FOUT | De nachtelijke taak draait niet meer of is mislukt |
| Kopie van de server af: let op (7 dagen) / FOUT (14 dagen) | Je PC heeft te lang niet opgehaald |
| Hersteltest: FOUT | De back-up bestaat wel maar is niet terug te zetten |

Die laatste is de belangrijkste. Een back-up die je nooit hebt teruggezet is geen back-up maar
een aanname.

## Herstellen

### De portaldatabase (leads van de klant)

```bash
# Op de VPS. LET OP: dit overschrijft de huidige database.
gunzip -c portal-db.sql.gz > /tmp/herstel.sql
docker exec belvanger-portal-db psql -U portal -d postgres -c "DROP DATABASE portal;"
docker exec belvanger-portal-db psql -U portal -d postgres -c "CREATE DATABASE portal;"
docker exec -i belvanger-portal-db psql -U portal -d portal < /tmp/herstel.sql
docker restart belvanger-portal
```

Twijfel je? Zet hem eerst terug in een database met een andere naam en kijk erin. Dat is precies
wat `hersteltest.sh` doet, en die kun je met de hand draaien.

### n8n

```bash
docker stop n8n
gunzip -c n8n.sqlite.gz > /tmp/n8n.sqlite
docker run --rm -v n8n-data:/d -v /tmp:/t alpine sh -c "cp /t/n8n.sqlite /d/database.sqlite && rm -f /d/database.sqlite-wal /d/database.sqlite-shm"
docker start n8n
```

De `-wal` en `-shm` moeten weg, anders probeert SQLite een journaal toe te passen dat niet bij
deze database hoort.

### Certificaten en instellingen

```bash
docker run --rm -v traefik-5fbm_traefik-letsencrypt:/d -v $(pwd):/b alpine tar xzf /b/traefik-letsencrypt.tar.gz -C /d
tar xzf env-bestanden.tar.gz -C /opt
```

### Alles kwijt: opnieuw beginnen op een nieuwe machine

1. Nieuwe VPS, Docker erop, Traefik terug (staat nog **niet** in de repo, zie hieronder).
2. `git clone` van de repo.
3. `env-bestanden.tar.gz` uitpakken naar `/opt`.
4. Containers bouwen en starten.
5. Database en n8n terugzetten zoals hierboven.
6. DNS omzetten naar het nieuwe IP-adres.

## Installeren op een andere PC

```powershell
# Eenmalig, in PowerShell, zonder beheerdersrechten
$script = "<pad naar de repo>\infra\backup\haal-backup.ps1"
$log    = "D:\Belvanger-backups\ophalen.log"
$actie  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"& '$script' *>> '$log'`""
$trigger = New-ScheduledTaskTrigger -Daily -At 12:30
$inst   = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName "Belvanger back-up ophalen" -Action $actie -Trigger $trigger -Settings $inst
```

`-StartWhenAvailable` is de belangrijkste instelling: staat de PC om 12:30 uit, dan draait de
taak alsnog zodra hij weer aangaat, in plaats van die dag over te slaan.

Handmatig ophalen kan altijd:

```powershell
& "<pad>\infra\backup\haal-backup.ps1"
& "<pad>\infra\backup\haal-backup.ps1" -Doel "E:\Belvanger-backups"   # naar een externe schijf
```

## Wat hier nog aan mankeert

Eerlijk, zodat je het weet in plaats van het te ontdekken.

1. **Alles hangt aan één PC.** Staat die twee weken uit, dan staat je enige kopie op de machine
   die hij moet beschermen. De systeemcheck waarschuwt daarvoor na 7 dagen, maar waarschuwen is
   geen oplossing. Zet er af en toe een kopie van op een externe schijf (`-Doel E:\...`), of zet
   er later alsnog een opslagdienst naast.
2. **De back-ups zijn niet apart versleuteld.** Het transport gaat over SSH en de bestanden staan
   op jouw eigen schijf, maar er staan persoonsgegevens in. Zet die map niet in OneDrive of
   Dropbox zonder daar eerst over na te denken.
3. **Traefik staat nergens in de repo.** De certificaten worden nu wel bewaard, maar de
   configuratie van Traefik zelf niet. Bij een herstel op een nieuwe machine moet je die met de
   hand terugbouwen.
4. **De n8n-database is 200 MB en groeit.** Dat is vrijwel allemaal uitvoeringsgeschiedenis. In
   n8n kun je die laten opruimen; dat scheelt straks in de tijd van elke kopie.
