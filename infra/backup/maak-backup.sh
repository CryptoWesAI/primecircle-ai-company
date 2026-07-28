#!/usr/bin/env bash
# Maakt op de VPS één nachtelijk pakket klaar met alles wat NIET in git staat.
#
# Dit script kopieert niets naar buiten. Dat doet je eigen PC, die het pakket ophaalt met
# haal-backup.ps1. Die richting is met opzet zo:
#
#   - Jouw PC hangt achter een router en heeft geen vast adres, dus de VPS kan er toch niet bij.
#   - Belangrijker: de VPS heeft dan geen enkele toegang tot jouw back-ups. Wie de server
#     overneemt kan de kopieën niet wissen. Bij een push-opzet kan dat wel, en dan verlies je
#     precies op het moment dat je ze nodig hebt allebei tegelijk.
#
# Draait als cron om 03:30, dus ruim voor de systeemcheck van 07:00 die de uitkomst meldt.

set -euo pipefail

UIT=/opt/belvanger-backups/offsite
BEWAAR_LOKAAL=7          # op de VPS is dit alleen een wachtkamer, jouw PC bewaart de reeks
STEMPEL=$(date +%Y%m%d-%H%M%S)
MAP="$UIT/$STEMPEL"

mkdir -p "$MAP"

# Mislukt er iets, dan de halve map opruimen en de fout doorgeven. Een half pakket dat er
# compleet uitziet is gevaarlijker dan geen pakket, want daar vertrouw je op.
opruimen_bij_fout() {
  rc=$?
  if [ $rc -ne 0 ]; then
    rm -rf "$MAP"
    echo "BACKUP MISLUKT (exitcode $rc). Halve map verwijderd."
    meld_resultaat "fout" "0" "Script stopte met exitcode $rc"
  fi
  exit $rc
}

meld_resultaat() {
  # Schrijft de uitkomst in dezelfde system_state-tabel die de systeemcheck van 07:00 leest.
  # Zonder deze regel is een back-up die al drie maanden faalt volstrekt onzichtbaar, en dan
  # ontdek je het op de enige dag dat het ertoe doet.
  local status="$1" bytes="$2" detail="${3:-}"
  local json
  json=$(printf '{"status":"%s","op":"%s","bytes":%s,"detail":"%s"}' \
    "$status" "$(date -Iseconds)" "$bytes" "$(echo "$detail" | tr -d '"' | tr '\n' ' ')")
  docker exec -i belvanger-portal-db psql -U portal -d portal -v ON_ERROR_STOP=1 \
    -c "INSERT INTO system_state (key, value, updated_at) VALUES ('backup-vps', '$json'::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();" >/dev/null 2>&1 \
    || echo "Let op: kon het resultaat niet in system_state schrijven."
}

trap opruimen_bij_fout EXIT

echo "== Back-up $STEMPEL =="

# 1. De portaldatabase. Dit is het belangrijkste van alles: de leads van de klant.
echo "-- portaldatabase"
docker exec belvanger-portal-db pg_dump -U portal --no-owner portal | gzip -9 > "$MAP/portal-db.sql.gz"

# 2. n8n. De workflows en de versleutelde koppelingen zitten in database.sqlite.
#    Niet zomaar het bestand kopiëren: er wordt in geschreven en er staat een WAL naast, dus een
#    rauwe kopie kan halverwege een transactie zitten. sqlite3 .backup maakt een consistente kopie
#    van een DRAAIENDE database, zonder n8n te onderbreken.
#    De n8nEventLog-bestanden gaan bewust niet mee: 34 MB puur logboek dat je bij een herstel
#    niet nodig hebt.
echo "-- n8n"
docker run --rm -v n8n-data:/d -v "$MAP":/o alpine sh -c \
  "apk add --no-cache sqlite >/dev/null 2>&1 && sqlite3 /d/database.sqlite \".backup /o/n8n.sqlite\""
gzip -9 "$MAP/n8n.sqlite"
docker run --rm -v n8n-data:/d -v "$MAP":/o alpine sh -c \
  "tar czf /o/n8n-overig.tar.gz -C /d --exclude='database.sqlite*' --exclude='n8nEventLog*' ."

# 3. De kleine datavolumes van de sites: bezoekstatistieken en aanvragen.
echo "-- datavolumes"
for v in belvanger-data ab-uitvaartzorg-data dashboard-data; do
  docker run --rm -v "$v":/d -v "$MAP":/o alpine tar czf "/o/$v.tar.gz" -C /d . 2>/dev/null || echo "   ($v overgeslagen)"
done

# 4. De certificaten van Traefik. Deze staan in geen enkele repo. Raak je ze kwijt, dan moet
#    alles opnieuw worden uitgegeven, en Let's Encrypt heeft daar weeklimieten op.
echo "-- certificaten"
docker run --rm -v traefik-5fbm_traefik-letsencrypt:/d -v "$MAP":/o alpine tar czf /o/traefik-letsencrypt.tar.gz -C /d .

# 5. Alle .env-bestanden. Dit zijn je sleutels en wachtwoorden, ze staan met opzet niet in git,
#    en daarom staan ze ook nergens anders. Zonder deze bestanden is een herstel een puzzel.
echo "-- instellingen"
tar czf "$MAP/env-bestanden.tar.gz" -C /opt $(cd /opt && ls -d */ 2>/dev/null | sed 's#/##' | while read -r d; do [ -f "/opt/$d/.env" ] && echo "$d/.env"; done) 2>/dev/null || true

# 6. Een lijst met vingerafdrukken, zodat je PC na het ophalen kan controleren dat er niets
#    onderweg is beschadigd. Zonder deze controle merk je een kapot bestand pas bij het herstel.
( cd "$MAP" && sha256sum ./* > SHA256SUMS )

GROOTTE=$(du -sb "$MAP" | cut -f1)
echo "-- klaar: $(du -sh "$MAP" | cut -f1)"

# Oudere pakketten op de VPS opruimen. Hier hoeft geen reeks te staan; dit is de wachtkamer.
ls -1dt "$UIT"/*/ 2>/dev/null | tail -n +$((BEWAAR_LOKAAL + 1)) | xargs -r rm -rf

meld_resultaat "ok" "$GROOTTE" "$(basename "$MAP")"
trap - EXIT
echo "Gereed. Op te halen met haal-backup.ps1 vanaf je eigen PC."
