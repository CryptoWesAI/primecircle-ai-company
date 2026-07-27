#!/usr/bin/env bash
# Deploy Belvanger (trades-demo/verkoopsite) naar de VPS.
# Draai lokaal vanuit sites/belvanger/:
#   bash deploy-to-vps.sh [ssh-doel] [pad-naar-sleutel]
#
# Dit is sinds 2026-07-17 de GECORRIGEERDE bron-van-waarheid (na de onafhankelijke
# review). Deploy ALTIJD vanaf hier — niet vanuit een oudere buildmap, anders
# republiceer je de verwijderde valse claims. Zie STATUS.md.
set -euo pipefail

HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
DIR="/opt/belvanger"
SRC="$(cd "$(dirname "$0")" && pwd)"

# De chat-assistent heeft de OpenRouter-sleutel nodig (runtime-env, niet in de image).
if [ ! -f "$SRC/.env" ]; then
  echo "FOUT: $SRC/.env ontbreekt. Kopieer .env.example -> .env en vul de OpenRouter-sleutel in." >&2
  exit 1
fi
# Draai eerst 'node assemble.mjs' zodat app/ bestaat en het widget is ingebed.
if [ ! -f "$SRC/app/server.js" ]; then
  echo "FOUT: app/ ontbreekt. Draai eerst: node assemble.mjs" >&2
  exit 1
fi

# SSH-hostverificatie AAN (review-defect #8). 'accept-new' pint de hostkey bij de
# eerste verbinding en weigert als die later verandert — beschermt tegen MITM/DNS-
# omleiding. NOOIT 'StrictHostKeyChecking=no' gebruiken (dat controleert niets).
# Sterker: pin de bekende fingerprint vooraf in ~/.ssh/known_hosts en zet 'yes'.
SSHOPT=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

echo "Deploy: $SRC  ->  $HOST:$DIR   (maakt eerst een backup op de VPS)"
# film/ = 67 MB bronmateriaal voor de promotiefilm (frames, clips, de mp4). De container
# gebruikt het niet (Dockerfile kopieert alleen app/ en site/), maar het werd wél elke
# deploy geüpload EN daarna nog eens gekopieerd in de backup op de VPS. Bij 71 backups
# loopt dat hard op. Hoort in git, niet op de server. Idem tests/ en het rollbackscript.
tar czf - -C "$SRC" --exclude=deploy-to-vps.sh --exclude=rollback-to-vps.sh --exclude=STATUS.md \
      --exclude=./film --exclude=./tests --exclude=.git . \
  | ssh "${SSHOPT[@]}" "$HOST" \
      "mkdir -p /opt/belvanger-backups && \
       [ -d '$DIR' ] && cp -a '$DIR' \"/opt/belvanger-backups/pre-deploy-\$(date +%Y%m%d-%H%M%S)\"; \
       mkdir -p '$DIR' && tar xzf - -C '$DIR' && cd '$DIR' && \
       docker compose up -d --build && echo '--- status ---' && docker compose ps"

echo
echo "Klaar. Live op https://belvanger.nl"
echo "LET OP: de site staat op noindex tot de echte gegevens erin staan (zie STATUS.md)."
