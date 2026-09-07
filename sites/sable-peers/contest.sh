#!/usr/bin/env bash
# The contest, day to day.
#   bash contest.sh status     standings, flagged runs, the window
#   bash contest.sh close      write the winner's page from the board, then deploy by hand
#   bash contest.sh unflag "name"   a reviewed run counts again
#   bash contest.sh run "name"      a player's best row with its input log
set -euo pipefail
cd "$(dirname "$0")"
VPS="root@31.97.123.34"
KEY="$HOME/.ssh/primecircle_codex_vps"
box() { ssh -i "$KEY" -o BatchMode=yes "$VPS" "docker exec sable-board node admin.js $*"; }
case "${1:-status}" in
  status)
    echo "== window"; curl -s https://sable.primecircle.cloud/api/game/contest; echo
    echo "== standings (one place per handle)"; box contest
    echo "== flagged by the referee (out of the contest until unflag)"; box flagged
    echo "== rows"; box count
    echo; echo "Post today's card: open https://sable.primecircle.cloud/#play and press \"today's card\" on the strip."
    ;;
  close) node tools/close-contest.mjs "${@:2}" ;;
  unflag) box unflag "\"${2:?name}\"" ;;
  run) box run "\"${2:?name}\"" ;;
  *) echo "usage: contest.sh status | close [--dry] | unflag <name> | run <name>"; exit 1 ;;
esac
