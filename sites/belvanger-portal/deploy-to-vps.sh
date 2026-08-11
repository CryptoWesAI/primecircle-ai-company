#!/usr/bin/env bash
# Deploy het klantdashboard (belvanger-portal) naar de VPS.
# Draai lokaal vanuit sites/belvanger-portal/:
#   bash deploy-to-vps.sh [ssh-doel] [pad-naar-sleutel]
#
# Geschreven op 2026-07-29, tot dan werd dit handmatig gedaan. Zelfde vorm als
# sites/belvanger/deploy-to-vps.sh, inclusief de twee lessen die daar zijn geleerd:
# eerst een back-up op de server, en achteraf ECHT controleren of de dienst antwoordt
# in plaats van "klaar" printen.
set -euo pipefail

HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
DIR="/opt/belvanger-portal"
URL="https://dashboard.belvanger.nl/healthz"
SRC="$(cd "$(dirname "$0")" && pwd)"

# SSH-hostverificatie AAN. 'accept-new' pint de hostkey bij de eerste verbinding en
# weigert als die later verandert. NOOIT 'StrictHostKeyChecking=no' gebruiken.
SSHOPT=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

# .env staat NIET in de repo en mag hier nooit meegestuurd worden: op de server staan
# DATABASE_URL, INGEST_KEY en de VAPID-sleutels erin. Een lege lokale .env zou die
# overschrijven en dan is het dashboard stuk. node_modules en android/ horen ook niet
# in de container (de Dockerfile installeert zelf, en android/ is het TWA-project).
echo "Deploy: $SRC  ->  $HOST:$DIR   (maakt eerst een backup op de VPS)"
tar czf - -C "$SRC" \
      --exclude=./node_modules --exclude=./.env --exclude='./.env.bak*' \
      --exclude=./android --exclude=./.git --exclude=deploy-to-vps.sh . \
  | ssh "${SSHOPT[@]}" "$HOST" \
      "mkdir -p /opt/belvanger-portal-backups && \
       [ -d '$DIR' ] && cp -a '$DIR' \"/opt/belvanger-portal-backups/pre-deploy-\$(date +%Y%m%d-%H%M%S)\"; \
       mkdir -p '$DIR' && tar xzf - -C '$DIR' && cd '$DIR' && \
       docker compose up -d --build && echo '--- status ---' && docker compose ps"

# Traefik geeft 404 zolang de container herstart en er dus geen backend is: wie meteen
# na de deploy curlt ziet een 404 die geen 404 is. Vandaar de herhaalpogingen.
echo
echo "Controle op $URL"
for poging in 1 2 3 4 5 6 7 8; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$URL" || echo 000)"
  echo "  poging $poging: HTTP $CODE"
  if [ "$CODE" = "200" ]; then
    echo
    echo "Klaar en geverifieerd. Live op https://dashboard.belvanger.nl"
    exit 0
  fi
  sleep 5
done

echo "WAARSCHUWING: $URL antwoordt niet met 200 na de deploy." >&2
echo "Kijk op de VPS: docker compose -f $DIR/docker-compose.yml logs --tail 40" >&2
echo "Terugzetten kan uit /opt/belvanger-portal-backups/pre-deploy-*" >&2
exit 1
