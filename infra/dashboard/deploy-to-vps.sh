#!/usr/bin/env bash
# Deploy PrimeCircle VPS Control naar /opt/dashboard op de VPS en (her)start de container.
# Publiceert ALLEEN op 127.0.0.1 — bereikbaar maken doe je met `tailscale serve` (zie DEPLOY.md).
#
# Gebruik:  bash deploy-to-vps.sh [root@31.97.123.34] [~/.ssh/primecircle_codex_vps]
set -euo pipefail

HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
DIR="/opt/dashboard"
SRC="$(cd "$(dirname "$0")" && pwd)"
SSH=(ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$HOST")

if [ ! -f "$SRC/app/server.js" ]; then echo "FOUT: app/server.js niet gevonden in $SRC"; exit 1; fi

echo "→ map klaarzetten op $HOST:$DIR"
"${SSH[@]}" "mkdir -p $DIR"

echo "→ code overzetten (zonder lokale data/)"
tar --exclude='app/data' --exclude='.git' -czf - -C "$SRC" Dockerfile docker-compose.yml app \
  | "${SSH[@]}" "tar -xzf - -C $DIR"

echo "→ bouwen + starten"
"${SSH[@]}" "cd $DIR && docker compose up -d --build 2>&1 | tail -6"

echo "→ status"
"${SSH[@]}" "docker ps --filter name=dashboard --format '   {{.Names}}: {{.Status}}'"
echo "→ lokale healthcheck op de host (127.0.0.1:8095)"
"${SSH[@]}" "curl -s -o /dev/null -w '   HTTP %{http_code}\n' http://127.0.0.1:8095/api/session || true"

echo
echo "KLAAR. Nu bereikbaar maken op je Tailscale-netwerk (eenmalig):"
echo "   ${SSH[*]} 'tailscale serve --bg 8095'"
echo "Daarna: open de https-URL van je node (primecircle-vps.<jouw-tailnet>.ts.net)."
