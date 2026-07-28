#!/usr/bin/env bash
# Zet de nieuwste back-up echt terug in een wegwerpdatabase en vergelijkt de uitkomst met
# productie. Draait maandelijks.
#
# Waarom dit bestaat: een back-up die nooit is teruggezet is geen back-up maar een aanname.
# Een dump kan al maanden netjes worden weggeschreven en toch onbruikbaar zijn, bijvoorbeeld
# omdat pg_dump halverwege afbrak en de gzip alsnog een geldig bestand leek. Dat merk je op
# precies één moment: als je hem nodig hebt.
#
# Deze test raakt de productiedatabase NIET aan. Hij maakt een aparte database, vult die met de
# dump, telt de rijen, en gooit hem daarna weg.

set -euo pipefail

BRON=/opt/belvanger-backups/offsite
TESTDB=hersteltest
DB=belvanger-portal-db

meld() {
  local status="$1" detail="$2"
  local json
  json=$(printf '{"status":"%s","op":"%s","detail":"%s"}' "$status" "$(date -Iseconds)" "$(echo "$detail" | tr -d '"' | tr '\n' ' ')")
  docker exec -i "$DB" psql -U portal -d portal -v ON_ERROR_STOP=1 \
    -c "INSERT INTO system_state (key, value, updated_at) VALUES ('backup-hersteltest', '$json'::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();" >/dev/null 2>&1 || true
}

opruimen() {
  docker exec "$DB" psql -U portal -d postgres -c "DROP DATABASE IF EXISTS $TESTDB;" >/dev/null 2>&1 || true
  rm -f /tmp/hersteltest-*.sql /tmp/hersteltest-*.sqlite
}
bij_fout() {
  rc=$?
  if [ $rc -ne 0 ]; then
    echo "HERSTELTEST MISLUKT (exitcode $rc)"
    meld "fout" "Test stopte met exitcode $rc"
    opruimen
  fi
  exit $rc
}
trap bij_fout EXIT

MAP=$(ls -1dt "$BRON"/*/ 2>/dev/null | head -1 || true)
[ -n "$MAP" ] || { echo "Geen back-up gevonden om te testen."; meld "fout" "Geen enkel pakket aanwezig"; exit 1; }
PAKKET=$(basename "$MAP")
echo "== Hersteltest op $PAKKET =="

# 0. Eerst de vingerafdrukken, want een beschadigd bestand hoeft niet eens teruggezet te worden.
echo "-- vingerafdrukken"
( cd "$MAP" && sha256sum -c SHA256SUMS >/dev/null ) || { echo "Vingerafdrukken kloppen niet."; meld "fout" "SHA256 komt niet overeen in $PAKKET"; exit 1; }

# 1. Productie tellen, zodat we iets hebben om mee te vergelijken.
PROD_CONTACTEN=$(docker exec "$DB" psql -U portal -d portal -tAc "SELECT count(*) FROM contacts;")
PROD_EVENTS=$(docker exec "$DB" psql -U portal -d portal -tAc "SELECT count(*) FROM events;")

# 2. Terugzetten in een wegwerpdatabase.
echo "-- terugzetten in $TESTDB"
docker exec "$DB" psql -U portal -d postgres -c "DROP DATABASE IF EXISTS $TESTDB;" >/dev/null
docker exec "$DB" psql -U portal -d postgres -c "CREATE DATABASE $TESTDB;" >/dev/null
gunzip -c "$MAP/portal-db.sql.gz" > /tmp/hersteltest-portal.sql
docker exec -i "$DB" psql -U portal -d "$TESTDB" -v ON_ERROR_STOP=1 -q < /tmp/hersteltest-portal.sql >/dev/null

# 3. Tellen en vergelijken.
TEST_CONTACTEN=$(docker exec "$DB" psql -U portal -d "$TESTDB" -tAc "SELECT count(*) FROM contacts;")
TEST_EVENTS=$(docker exec "$DB" psql -U portal -d "$TESTDB" -tAc "SELECT count(*) FROM events;")
TABELLEN=$(docker exec "$DB" psql -U portal -d "$TESTDB" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "   contacten: productie $PROD_CONTACTEN, teruggezet $TEST_CONTACTEN"
echo "   events:    productie $PROD_EVENTS, teruggezet $TEST_EVENTS"
echo "   tabellen:  $TABELLEN"

# De back-up is ouder dan nu, dus MINDER rijen is normaal. MEER rijen dan productie of nul
# rijen terwijl productie ze wel heeft, wijst op iets wat niet klopt.
[ "$TABELLEN" -ge 10 ] || { echo "Te weinig tabellen teruggezet."; meld "fout" "Slechts $TABELLEN tabellen na herstel"; exit 1; }
[ "$TEST_CONTACTEN" -le "$PROD_CONTACTEN" ] || { echo "Meer contacten dan productie, dat kan niet."; meld "fout" "Herstel gaf $TEST_CONTACTEN contacten tegen $PROD_CONTACTEN in productie"; exit 1; }
if [ "$PROD_CONTACTEN" -gt 0 ] && [ "$TEST_CONTACTEN" -eq 0 ]; then
  echo "Nul contacten teruggezet terwijl productie er $PROD_CONTACTEN heeft."
  meld "fout" "Herstel leverde een lege contacttabel"
  exit 1
fi

# 4. De n8n-kopie moet een geldige database zijn, anders zijn je workflows en koppelingen weg.
echo "-- n8n"
gunzip -c "$MAP/n8n.sqlite.gz" > /tmp/hersteltest-n8n.sqlite
N8N=$(docker run --rm -v /tmp:/t alpine sh -c "apk add --no-cache sqlite >/dev/null 2>&1 && sqlite3 /t/hersteltest-n8n.sqlite 'PRAGMA integrity_check;' && sqlite3 /t/hersteltest-n8n.sqlite 'SELECT count(*) FROM workflow_entity;'" | tr '\n' ' ')
echo "   $N8N"
echo "$N8N" | grep -q "^ok" || { echo "n8n-kopie is beschadigd."; meld "fout" "sqlite integrity_check gaf: $N8N"; exit 1; }

opruimen
meld "ok" "$PAKKET teruggezet: $TEST_CONTACTEN contacten, $TEST_EVENTS events, $TABELLEN tabellen"
trap - EXIT
echo "Hersteltest geslaagd."
