#!/usr/bin/env bash
# Leest de VPS uit: geheugen per container tegen zijn limiet, OOM-kills, logboekgroottes.
#
# Draai dit direct na het uitrollen van de limieten (infra/LIMIETEN.md) en nog een keer
# een dag later. Het is bewust ALLEEN-LEZEN: het wijzigt niets, herstart niets en
# verwijdert niets, zodat je het zonder nadenken kunt draaien.
#
# Gebruik:  bash infra/vps-check.sh        (op de VPS, als root)

set -uo pipefail   # bewust geen -e: één stukgelopen docker-commando mag de rest niet stoppen

echo "== Machine =="
free -h 2>/dev/null | awk 'NR<=2'
echo
df -h / 2>/dev/null | awk 'NR<=2'
echo

echo "== Geheugen per container tegen zijn limiet =="
echo "   Boven 70% = te krap bemeten. LIMIT gelijk aan het machinegeheugen = GEEN limiet ingesteld."
docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}' 2>/dev/null \
  || echo "   docker stats faalde — draai je dit als root op de VPS?"
echo

echo "== OOM-kills en herstarts =="
echo "   OOM=true betekent: de limiet is te laag en de container is afgeschoten."
printf '%-28s %-8s %-10s %s\n' "CONTAINER" "OOM" "RESTARTS" "STATUS"
for c in $(docker ps -a --format '{{.Names}}' 2>/dev/null); do
  oom=$(docker inspect --format '{{.State.OOMKilled}}'   "$c" 2>/dev/null || echo "?")
  rst=$(docker inspect --format '{{.RestartCount}}'      "$c" 2>/dev/null || echo "?")
  sts=$(docker inspect --format '{{.State.Status}}'      "$c" 2>/dev/null || echo "?")
  # Alleen opvallen als er iets is; een rustige machine hoort een korte lijst te geven.
  if [ "$oom" = "true" ] || [ "$rst" != "0" ] || [ "$sts" != "running" ]; then
    printf '%-28s %-8s %-10s %s\n' "$c" "$oom" "$rst" "$sts"
  fi
done
echo "   (containers zonder OOM, zonder herstarts en met status running staan er bewust niet bij)"
echo

echo "== Logboeken groter dan 10 MB =="
echo "   Na het instellen van logrotatie hoort hier op termijn niets meer boven de 30 MB te staan."
find /var/lib/docker/containers -name '*-json.log' -size +10M -printf '%s\t%p\n' 2>/dev/null \
  | sort -rn \
  | while IFS=$'\t' read -r bytes pad; do
      id=$(basename "$(dirname "$pad")")
      naam=$(docker inspect --format '{{.Name}}' "$id" 2>/dev/null | sed 's|^/||')
      printf '%8s  %s\n' "$(numfmt --to=iec "$bytes" 2>/dev/null || echo "$bytes")" "${naam:-$id}"
    done
echo

echo "== n8n-database =="
docker exec n8n sh -c 'ls -lh /home/node/.n8n/database.sqlite* 2>/dev/null' 2>/dev/null \
  || echo "   n8n-container niet bereikbaar (draait hij?)"
echo "   Was 200 MB op 2026-07-28. Krimpt pas na een VACUUM, zie infra/n8n/docker-compose.yml."
