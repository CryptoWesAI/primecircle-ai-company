#!/usr/bin/env bash
# Deploy "Sable Among Peers" naar https://sable.primecircle.cloud
#
# Draai lokaal vanuit sites/sable-peers/:
#   bash deploy-to-vps.sh [ssh-doel] [pad-naar-sleutel]
#   bash deploy-to-vps.sh --notify "Titel" "Tekst" [url]   stuurt na een geslaagde deploy een melding naar de app
#
# De pagina is één statisch HTML-bestand (site/index.html) plus een og-afbeelding,
# geserveerd door nginx achter Traefik. Geen backend, geen secrets.
set -euo pipefail

NOTIFY_TITLE=""; NOTIFY_BODY=""; NOTIFY_URL="/"
if [ "${1:-}" = "--notify" ]; then NOTIFY_TITLE="${2:?titel}"; NOTIFY_BODY="${3:?tekst}"; NOTIFY_URL="${4:-/}"; shift 4 2>/dev/null || shift $#; fi
HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
DIR="/opt/sable-peers"
URL="https://sable.primecircle.cloud"
HIER="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$HIER/site/index.html" ]; then
  echo "FOUT: site/index.html ontbreekt." >&2
  exit 1
fi
if ! grep -q "<!doctype html>" "$HIER/site/index.html"; then
  echo "FOUT: site/index.html is geen volledig document (geen doctype). Bouw hem eerst met build.mjs." >&2
  exit 1
fi

# SSH-hostverificatie AAN. 'accept-new' pint de hostkey bij de eerste
# verbinding en weigert als die later verandert. NOOIT 'StrictHostKeyChecking=no'.
SSHOPT=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

echo "Deploy: $HIER  ->  $HOST:$DIR   (backup eerst)"

# De map site/ is een bind-mount van de draaiende container. Verwijder daarom
# de INHOUD, nooit de map zelf: een rm -rf + mkdir geeft een nieuwe inode en de
# container blijft naar de oude, lege kijken (nginx: 403). --force-recreate
# vangt de rest op, want zonder wijziging in compose herstart 'up -d' niets.

tar czf - --exclude=leaderboard/node_modules -C "$HIER" site leaderboard docker-compose.yml nginx.conf security-headers.conf proxy-common.conf \
  | ssh "${SSHOPT[@]}" "$HOST" \
      "mkdir -p /opt/sable-peers-backups && \
       { [ -d '$DIR' ] && cp -a '$DIR' \"/opt/sable-peers-backups/pre-deploy-\$(date +%Y%m%d-%H%M%S)\" || true; }; \
       mkdir -p '$DIR/site' && find '$DIR/site' -mindepth 1 -delete && tar xzf - -C '$DIR' && \
       cd '$DIR' && docker compose up -d --build --force-recreate && \
       echo '--- status ---' && docker compose ps"

echo
echo "Controle op $URL"
for poging in 1 2 3 4 5 6 7 8 9 10; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$URL" || echo 000)"
  echo "  poging $poging: HTTP $CODE"
  if [ "$CODE" = "200" ]; then
    TITEL="$(curl -s --max-time 15 "$URL" | grep -o '<title>[^<]*</title>' | head -1)"
    echo "  $TITEL"
    echo "Klaar en geverifieerd. Live op $URL"
    if [ -n "$NOTIFY_TITLE" ]; then
      echo "Melding naar de app: $NOTIFY_TITLE"
      ssh "${SSHOPT[@]}" "$HOST" "docker exec sable-board node admin.js push $(printf '%q' "$NOTIFY_TITLE") $(printf '%q' "$NOTIFY_BODY") $(printf '%q' "$NOTIFY_URL")"
    fi
    exit 0
  fi
  sleep 8
done

echo "WAARSCHUWING: $URL antwoordt niet met 200 (Let's Encrypt kan nog bezig zijn)." >&2
echo "Kijk op de VPS: docker compose -f $DIR/docker-compose.yml logs --tail 40" >&2
exit 1
