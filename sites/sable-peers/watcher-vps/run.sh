#!/usr/bin/env bash
# One watch from the VPS: pull, run watch.py, commit with the same messages the GitHub Action
# uses, push with the deploy key, and tell the app's phones what the Action would tell them.
# Never exits non-zero on a network miss: the loop must live on. A rebase conflict (the Action
# and this runner appending to the same ledger in the same hour) drops this hour's local
# commit and resets to the published record; the next hour runs clean.
set -uo pipefail
cd /repo || { echo "no repo"; exit 0; }
export GIT_SSH_COMMAND="ssh -i /keys/id_ed25519 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/keys/known_hosts"
git config --global --add safe.directory /repo >/dev/null 2>&1
git config user.name "sable-whitepaper-watch"
git config user.email "actions@users.noreply.github.com"

sync_down() {
  if ! git pull --rebase -q origin main; then
    echo "pull --rebase failed: dropping local commits, resetting to origin/main"
    git rebase --abort >/dev/null 2>&1
    git fetch -q origin main && git reset -q --hard origin/main
  fi
}
sync_down

FLAGS=""
if [ "$(date -u +%H)" = "06" ]; then FLAGS="--peers"; fi
export GITHUB_OUTPUT=/tmp/watch-output.txt
: > "$GITHUB_OUTPUT"
python3 watch.py $FLAGS || echo "watch.py exited with $?"
out() { grep -m1 "^$1=" "$GITHUB_OUTPUT" 2>/dev/null | cut -d= -f2-; }

git add -A
if git diff --cached --quiet; then echo "nothing to commit"; exit 0; fi
if [ "$(out changed)" = "true" ]; then msg="Whitepaper changed: $(out summary)"
elif [ "$(out supply_fell)" = "true" ]; then msg="$(out supply_summary)"
elif [ -n "$(out conf_flip)" ]; then msg="$(out conf_summary)"
elif [ -n "$(out claim_flip)" ]; then msg="$(out claim_summary)"
else msg="Status ledger $(date -u +%Y-%m-%dT%H:%MZ) (vps)"; fi
git commit -q -m "$msg" || { echo "commit failed"; exit 0; }
sync_down
if git push -q origin main; then echo "pushed: $msg"; else echo "push failed (deploy key not accepted yet?), the commit stays local"; exit 0; fi

# the phones: same titles and targets as the Action's notify steps
notify() {
  [ -z "${PUSH_SECRET:-}" ] && return 0
  python3 - "$1" "$2" "$3" "$4" <<'PY'
import json, sys, urllib.request
title, body, url, tag = sys.argv[1:5]
data = json.dumps({"title": title[:80], "body": body[:200], "url": url, "tag": tag}).encode()
req = urllib.request.Request("https://sable.primecircle.cloud/api/game/push/notify", data=data, headers={"Content-Type": "application/json", "x-push-secret": __import__("os").environ["PUSH_SECRET"]})
try:
    print("notify:", urllib.request.urlopen(req, timeout=20).read().decode()[:120])
except Exception as e:
    print("notify failed:", type(e).__name__, e)
PY
}
if [ "$(out changed)" = "true" ]; then notify "Sable's whitepaper changed" "$(out summary)" "/#log" "whitepaper"; fi
if [ "$(out supply_fell)" = "true" ]; then notify "SABL supply fell on Solana" "$(out supply_summary)" "/#token" "supply"; fi
case "$(out conf_flip)" in
  recovered) notify "Sable's confidential tier verified again" "$(out conf_summary)" "/#log" "status" ;;
  failed) notify "Sable's confidential tier is failing closed" "$(out conf_summary)" "/#log" "status" ;;
esac
case "$(out claim_flip)" in
  reachable) notify "An announced Sable route answers from outside" "$(out claim_summary)" "/#log" "claims" ;;
  gone) notify "An announced Sable route went away" "$(out claim_summary)" "/#log" "claims" ;;
esac
exit 0
