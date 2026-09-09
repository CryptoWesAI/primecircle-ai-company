#!/usr/bin/env bash
# Runs one watch at minute 05 of every hour, forever. Minute 05 keeps clear of the GitHub
# schedule (:17 and :47), which stays as a fallback. Output goes to docker logs.
while true; do
  m=$((10#$(date -u +%M))); s=$((10#$(date -u +%S)))
  wait=$(( ((5 - m + 60) % 60) * 60 - s ))
  [ "$wait" -le 0 ] && wait=$((wait + 3600))
  sleep "$wait"
  echo "=== run $(date -u +%FT%TZ)"
  /app/run.sh 2>&1 | tail -60
done
