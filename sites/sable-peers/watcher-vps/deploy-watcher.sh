#!/usr/bin/env bash
# Puts the watcher's runner on the VPS and starts it. Idempotent: rerun after a change.
#   bash deploy-watcher.sh [ssh-target] [path-to-key]
# What it does on the VPS, all under /opt/sable-watch:
#   - generates an ed25519 deploy key there if none exists (the private half never leaves the VPS),
#   - clones the public watch repo over https and points its remote at ssh for the push,
#   - copies only PUSH_SECRET from the site's .env into its own .env (600),
#   - builds and starts the container, which runs one watch at minute 05 of every hour,
#   - prints the public key: add it on GitHub as a deploy key WITH write access; until then the
#     runner watches and commits locally but cannot push.
set -euo pipefail
HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
DIR=/opt/sable-watch
HIER="$(cd "$(dirname "$0")" && pwd)"

tar -C "$HIER" -czf - Dockerfile docker-compose.yml loop.sh run.sh README.md | ssh -i "$KEY" "$HOST" "mkdir -p $DIR && tar -C $DIR -xzf -"
ssh -i "$KEY" "$HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/sable-watch
mkdir -p keys repo
chmod 700 keys
if [ ! -f keys/id_ed25519 ]; then ssh-keygen -t ed25519 -N "" -C "sable-watch@vps" -f keys/id_ed25519 -q; echo "deploy key generated"; fi
chmod 600 keys/id_ed25519
ssh-keyscan -t ed25519 github.com > keys/known_hosts 2>/dev/null || true
if [ ! -d repo/.git ]; then git clone -q https://github.com/CryptoWesAI/sable-whitepaper-watch.git repo; echo "repo cloned"; fi
# fetch over https (public, no key needed, so pulls never depend on the deploy key), push over ssh
git -C repo remote set-url origin https://github.com/CryptoWesAI/sable-whitepaper-watch.git
git -C repo remote set-url --push origin git@github.com:CryptoWesAI/sable-whitepaper-watch.git
if [ ! -f .env ]; then (grep '^PUSH_SECRET=' /opt/sable-peers/.env || echo "PUSH_SECRET=") > .env; chmod 600 .env; fi
docker compose up -d --build 2>&1 | tail -2
echo
echo "PUBLIC KEY, add on github.com/CryptoWesAI/sable-whitepaper-watch > Settings > Deploy keys, with write access:"
cat keys/id_ed25519.pub
REMOTE
