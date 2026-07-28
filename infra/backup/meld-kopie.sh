#!/usr/bin/env bash
# Wordt aangeroepen door haal-backup.ps1 op de PC van de founder, direct na een geslaagde kopie.
# Schrijft in dezelfde system_state-tabel die de systeemcheck van 07:00 leest, zodat "er is al
# tien dagen geen kopie van de VPS af" in de ochtendmail verschijnt in plaats van onopgemerkt
# te blijven tot het moment dat je de back-up nodig hebt.
set -euo pipefail
PAKKET="${1:-onbekend}"
MACHINE="${2:-onbekend}"
JSON=$(printf '{"pakket":"%s","machine":"%s","op":"%s"}' \
  "$(echo "$PAKKET" | tr -cd 'A-Za-z0-9._-')" \
  "$(echo "$MACHINE" | tr -cd 'A-Za-z0-9._ -')" \
  "$(date -Iseconds)")
docker exec -i belvanger-portal-db psql -U portal -d portal -v ON_ERROR_STOP=1 \
  -c "INSERT INTO system_state (key, value, updated_at) VALUES ('backup-kopie', '$JSON'::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();" >/dev/null
echo "genoteerd: $PAKKET"
