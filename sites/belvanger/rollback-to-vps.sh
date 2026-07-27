#!/usr/bin/env bash
# Zet Belvanger op de VPS terug naar een eerdere staat.
#
# De tegenhanger van deploy-to-vps.sh, dat vóór elke deploy een backup maakt in
# /opt/belvanger-backups/pre-deploy-<tijdstempel> maar zelf geen weg terug had. Een
# backup die nooit is teruggezet is geen backup maar een aanname, en bij een klant is de
# terugweg belangrijker dan de poort ervoor.
#
# Gebruik, lokaal vanuit sites/belvanger/:
#   bash rollback-to-vps.sh --list                 # welke backups zijn er
#   bash rollback-to-vps.sh --dry-run              # wat zou er gebeuren
#   bash rollback-to-vps.sh                        # zet de NIEUWSTE backup terug
#   bash rollback-to-vps.sh pre-deploy-20260727-1  # zet een specifieke terug
#
# Optioneel achteraan: [ssh-doel] [pad-naar-sleutel]
#
# Veiligheidsontwerp:
#   1. de HUIDIGE staat wordt eerst weggezet als pre-rollback-<tijdstempel>, dus een
#      rollback is zelf terug te draaien;
#   2. de nieuwe staat wordt eerst volledig naast de oude gezet en dan omgewisseld met
#      twee mv's, zodat er geen half uitgepakte map live kan staan;
#   3. na de herstart wordt de site echt opgevraagd; faalt dat, dan eindigt het script
#      met een foutcode en de naam van de map waar de vorige staat staat.
set -euo pipefail

DIR="/opt/belvanger"
BACKUPS="/opt/belvanger-backups"
URL="https://belvanger.nl"

# Opruimen is OPT-IN, niet standaard. Een rollback die stilzwijgend oude backups van een
# klantproductie weggooit is een verrassing, en juist tijdens een test wil je dat niet:
# er staan er nu 71, tot 17 juli terug. Met --prune blijven de nieuwste BEWAREN staan.
BEWAREN=0
MODE="restore"
DOEL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --list)    MODE="list";   shift ;;
    --dry-run) MODE="dryrun"; shift ;;
    --prune)   BEWAREN=5;     shift ;;
    --*)       echo "Onbekende optie: $1" >&2; exit 2 ;;
    *)         break ;;
  esac
done
case "${1:-}" in
  "") ;;
  *)  DOEL="$1"; shift ;;
esac

HOST="${1:-root@31.97.123.34}"
KEY="${2:-$HOME/.ssh/primecircle_codex_vps}"
# Zie de toelichting in deploy-to-vps.sh: hostverificatie blijft aan.
SSHOPT=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

if [ "$MODE" = "list" ]; then
  ssh "${SSHOPT[@]}" "$HOST" "
    ls -1dt '$BACKUPS'/*/ 2>/dev/null | sed 's|/\$||' | while read -r p; do
      printf '%-52s %s\n' \"\$(basename \"\$p\")\" \"\$(du -sh \"\$p\" 2>/dev/null | cut -f1)\"
    done || echo 'geen backups gevonden'"
  exit 0
fi

echo "Rollback van $HOST:$DIR"
[ -n "$DOEL" ] && echo "  doel: $DOEL" || echo "  doel: de nieuwste backup"

# Het hele herstel gebeurt in één remote shell, zodat er geen halve staat kan ontstaan
# als de verbinding tussentijds wegvalt.
ssh "${SSHOPT[@]}" "$HOST" "
set -euo pipefail
DIR='$DIR'; BACKUPS='$BACKUPS'; DOEL='$DOEL'; BEWAREN=$BEWAREN; MODE='$MODE'

if [ -n \"\$DOEL\" ]; then
  BRON=\"\$BACKUPS/\$DOEL\"
else
  BRON=\"\$(ls -1dt \"\$BACKUPS\"/*/ 2>/dev/null | head -1 | sed 's|/\$||')\"
fi

if [ -z \"\${BRON:-}\" ] || [ ! -d \"\$BRON\" ]; then
  echo \"FOUT: geen bruikbare backup gevonden (\${BRON:-leeg}).\" >&2
  echo 'Draai eerst: bash rollback-to-vps.sh --list' >&2
  exit 1
fi
if [ ! -f \"\$BRON/docker-compose.yml\" ]; then
  echo \"FOUT: \$BRON bevat geen docker-compose.yml, dat is geen volledige backup.\" >&2
  exit 1
fi

TS=\"\$(date +%Y%m%d-%H%M%S)\"
echo \"  terugzetten uit : \$BRON\"
echo \"  huidige staat -> \$BACKUPS/pre-rollback-\$TS\"

if [ \"\$MODE\" = 'dryrun' ]; then
  echo '  (dry-run, er is niets gewijzigd)'
  exit 0
fi

# 1. nieuwe staat eerst volledig naast de oude klaarzetten
rm -rf \"\$DIR.rollback-tmp\"
cp -a \"\$BRON\" \"\$DIR.rollback-tmp\"

# 2. omwisselen met twee mv's op hetzelfde filesystem
mkdir -p \"\$BACKUPS\"
mv \"\$DIR\" \"\$BACKUPS/pre-rollback-\$TS\"
mv \"\$DIR.rollback-tmp\" \"\$DIR\"

# 3. herstarten
cd \"\$DIR\"
docker compose up -d --build
echo '--- status ---'
docker compose ps

# 4. opruimen, alleen met --prune, en NOOIT de pre-rollback van net weggooien
if [ \"\$BEWAREN\" -gt 0 ]; then
  ls -1dt \"\$BACKUPS\"/*/ 2>/dev/null | sed 's|/\$||' | tail -n +\$((BEWAREN+1)) | while read -r oud; do
    [ \"\$(basename \"\$oud\")\" = \"pre-rollback-\$TS\" ] && continue
    echo \"  opgeruimd: \$(basename \"\$oud\")\"
    rm -rf \"\$oud\"
  done
fi

echo \"HERSTELD_UIT=\$(basename \"\$BRON\")\"
echo \"VORIGE_STAAT=pre-rollback-\$TS\"
"

if [ "$MODE" = "dryrun" ]; then
  echo "Dry-run klaar, niets gewijzigd."
  exit 0
fi

# 5. echt controleren of de site weer antwoordt. Een rollback die niet is nagekeken is
#    net zo veel waard als de backup die nooit is teruggezet.
echo
echo "Controle op $URL"
for poging in 1 2 3 4 5; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$URL" || echo 000)"
  echo "  poging $poging: HTTP $CODE"
  [ "$CODE" = "200" ] && { echo "Rollback geslaagd, site antwoordt."; exit 0; }
  sleep 5
done

echo "WAARSCHUWING: de site antwoordt niet met 200 na de rollback." >&2
echo "De staat van vóór deze rollback staat op de VPS in $BACKUPS/pre-rollback-*" >&2
exit 1
