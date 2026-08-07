#!/usr/bin/env bash
# Deploy Belvanger VANAF DE VPS ZELF, zonder je eigen PC.
#
# ─── WAAROM DIT BESTAAT ──────────────────────────────────────────────────────────────
# deploy-to-vps.sh duwt vanaf je werkplek naar de server en heeft daarvoor twee dingen
# nodig die alleen op jouw PC staan: de SSH-sleutel en sites/belvanger/.env. Ben je weg
# van die PC, dan kun je niets — ook niet als er iets omvalt. Dat is een reëel gat voor
# een eenmansbedrijf. Dit script haalt de code van GitHub naar de VPS en bouwt daar, dus
# je kunt deployen en terugdraaien vanaf een telefoon in een consolevenster.
#
# Het is NIET de gewone route. Gebruik thuis gewoon deploy-to-vps.sh. Dit is de route
# voor onderweg en voor storingen.
#
# ─── DIT SCRIPT IS NOG NOOIT GEDRAAID ────────────────────────────────────────────────
# Geschreven op 2026-08-07 in een omgeving die de VPS niet kan bereiken, dus alleen de
# syntaxis en de argumentafhandeling zijn nagelopen; git, docker en de site zijn hier
# nooit echt aangeraakt. Draai hem de EERSTE keer thuis, met je PC erbij, en eerst met
# --dry-run. Pas als je hem een keer echt hebt zien werken is hij iets waard onderweg.
#
# ─── EENMALIG INSTELLEN (zie ook onder --hulp) ───────────────────────────────────────
#   1. Op de VPS:  ssh-keygen -t ed25519 -f /root/.ssh/github_belvanger -N ""
#   2. Plak /root/.ssh/github_belvanger.pub in GitHub → de repo → Settings → Deploy keys
#      → Add deploy key. LAAT "Allow write access" UIT: lezen is genoeg, en een server
#      die niet kan schrijven kan je geschiedenis niet beschadigen.
#   3. Voeg toe aan /root/.ssh/config:
#         Host github.com
#           IdentityFile /root/.ssh/github_belvanger
#           IdentitiesOnly yes
#   4. Test:  ssh -T git@github.com    (moet je bij naam begroeten)
#
# Typ NOOIT een GitHub-token in een consolevenster: dat belandt in je shell-history en
# mogelijk in de logs van het hostingpaneel, op dezelfde machine die ook klantsites draait.
# Een deploy key is een sleutel die daar hoort en die je met één klik weer intrekt.
#
# ─── GEBRUIK ─────────────────────────────────────────────────────────────────────────
#   bash deploy-vanaf-vps.sh --hulp
#   bash deploy-vanaf-vps.sh --dry-run                       # laat zien wat er zou gebeuren
#   bash deploy-vanaf-vps.sh                                 # deploy master
#   bash deploy-vanaf-vps.sh claude/belvanger-nl-info-47rkq9 # deploy een tak
#   bash deploy-vanaf-vps.sh --geen-pull                     # herbouw wat er al staat
#
# Terugdraaien gaat met het bestaande rollback-to-vps.sh vanaf je PC, of op de VPS met de
# hand: de backup staat in /opt/belvanger-backups/pre-deploy-<tijdstempel>. Dit script
# gebruikt met opzet exact diezelfde naamgeving, zodat de rollback blijft werken.

set -euo pipefail

# Alles staat in één functie die pas op de LAATSTE regel wordt aangeroepen. Reden: bash
# leest een script in stukjes terwijl het draait, en dit script doet een `git reset --hard`
# op een boom waar het zelf in staat. Zonder deze constructie kan bash halverwege een
# gewijzigde versie van zichzelf inlezen en iets uitvoeren wat er nooit stond.
main() {

  REPO_SSH="git@github.com:CryptoWesAI/primecircle-ai-company.git"
  BRON="/opt/belvanger-bron"          # werkkopie van de repo, NIET de live map
  DIR="/opt/belvanger"                # de live map
  BACKUPS="/opt/belvanger-backups"
  URL="https://belvanger.nl"
  NODE_IMAGE="node:22-alpine"         # zelfde major als de Dockerfile
  BRANCH="master"
  DRY=0
  PULL=1

  while [ $# -gt 0 ]; do
    case "$1" in
      --hulp|-h|--help) sed -n '2,45p' "$0"; exit 0 ;;
      --dry-run)   DRY=1;  shift ;;
      --geen-pull) PULL=0; shift ;;
      --*) echo "Onbekende optie: $1  (probeer --hulp)" >&2; exit 2 ;;
      *)   BRANCH="$1";    shift ;;
    esac
  done

  zeg() { printf '%s\n' "$*"; }
  doe() { if [ "$DRY" = 1 ]; then zeg "  [dry-run] $*"; else eval "$@"; fi; }

  # ── 0. Draaien we wel waar we denken te draaien? ───────────────────────────────────
  # Deze controle bestaat omdat dit script per ongeluk op een laptop draaien betekent dat
  # je /opt/belvanger van je eigen machine overschrijft met een build. Beter meteen stoppen.
  for nodig in git docker tar curl; do
    command -v "$nodig" >/dev/null || { echo "FOUT: '$nodig' ontbreekt. Draai je dit wel op de VPS?" >&2; exit 1; }
  done
  if [ ! -d "$DIR" ]; then
    echo "FOUT: $DIR bestaat niet." >&2
    echo "Dit script hoort op de VPS te draaien, waar Belvanger al eerder is uitgerold." >&2
    exit 1
  fi
  if [ ! -f "$DIR/.env" ]; then
    echo "FOUT: $DIR/.env ontbreekt — daar staat de OpenRouter-sleutel in." >&2
    echo "Zonder dat bestand start de chat-assistent niet. Niets gewijzigd." >&2
    exit 1
  fi

  zeg "Belvanger deployen vanaf de VPS"
  zeg "  tak        : $BRANCH"
  zeg "  bron       : $BRON"
  zeg "  live map   : $DIR"
  [ "$DRY" = 1 ] && zeg "  MODUS      : DRY-RUN, er wordt niets gewijzigd"
  zeg

  # ── 1. Code ophalen ────────────────────────────────────────────────────────────────
  if [ "$PULL" = 1 ]; then
    if [ ! -d "$BRON/.git" ]; then
      zeg "-- eerste keer: repo klonen naar $BRON"
      doe "git clone --no-single-branch '$REPO_SSH' '$BRON'"
    fi
    zeg "-- ophalen en $BRANCH gelijkzetten"
    # reset --hard en niet merge: deze werkkopie is wegwerpmateriaal en mag nooit een
    # eigen staat opbouwen. Wat er lokaal is aangerommeld gaat er hier dus vanaf.
    doe "git -C '$BRON' fetch --prune origin"
    doe "git -C '$BRON' checkout -B '$BRANCH' 'origin/$BRANCH'"
    doe "git -C '$BRON' reset --hard 'origin/$BRANCH'"
  else
    zeg "-- --geen-pull: werken met wat er al in $BRON staat"
    [ -d "$BRON/.git" ] || { echo "FOUT: $BRON bestaat nog niet. Draai eerst zonder --geen-pull." >&2; exit 1; }
  fi

  if [ "$DRY" = 0 ]; then
    zeg "   nu op: $(git -C "$BRON" log --oneline -1)"
  fi

  # ── 2. app/ bouwen ─────────────────────────────────────────────────────────────────
  # assemble.mjs bouwt app/ en zet het chat-widget same-origin in site/. Node staat niet
  # per se op de VPS, dus we lenen het uit dezelfde image als de Dockerfile. De hele repo
  # wordt gemount, want assemble.mjs leest ook uit product/chatbot/.
  zeg "-- app/ bouwen met $NODE_IMAGE"
  doe "docker run --rm -v '$BRON':/repo -w /repo/sites/belvanger '$NODE_IMAGE' node assemble.mjs"

  BUILD="$BRON/sites/belvanger"
  if [ "$DRY" = 0 ] && [ ! -f "$BUILD/app/server.js" ]; then
    echo "FOUT: app/server.js is niet gebouwd. Niets gewijzigd aan $DIR." >&2
    exit 1
  fi

  # ── 3. Backup van de live map ──────────────────────────────────────────────────────
  # Zelfde naampatroon als deploy-to-vps.sh, zodat rollback-to-vps.sh deze backup gewoon
  # ziet staan. Een deploy zonder weg terug is bij een draaiende site geen deploy maar een
  # gok.
  STEMPEL="$(date +%Y%m%d-%H%M%S)"
  zeg "-- backup naar $BACKUPS/pre-deploy-$STEMPEL"
  doe "mkdir -p '$BACKUPS'"
  doe "cp -a '$DIR' '$BACKUPS/pre-deploy-$STEMPEL'"

  # ── 4. Uitrollen ───────────────────────────────────────────────────────────────────
  # Exact dezelfde uitsluitingen als deploy-to-vps.sh. film/ is 40 MB bronmateriaal dat in
  # git hoort maar niet op de server: het werd vroeger elke deploy meegestuurd én daarna in
  # elke backup gekopieerd. Bij 71 backups loopt dat hard op.
  zeg "-- bestanden naar $DIR (zonder film/, tests/, de deployscripts en .git)"
  doe "tar cf - -C '$BUILD' \
        --exclude=deploy-to-vps.sh --exclude=rollback-to-vps.sh --exclude=deploy-vanaf-vps.sh \
        --exclude=STATUS.md --exclude=./film --exclude=./tests --exclude=.git . \
      | tar xf - -C '$DIR'"

  # .env komt NOOIT uit git — hij stond er al en moet blijven staan. tar hierboven kan hem
  # niet overschrijven omdat hij niet in de repo zit, maar dit maakt het expliciet.
  if [ "$DRY" = 0 ] && [ ! -f "$DIR/.env" ]; then
    echo "FOUT: $DIR/.env is verdwenen tijdens de deploy. Zet de backup terug:" >&2
    echo "  rm -rf '$DIR' && cp -a '$BACKUPS/pre-deploy-$STEMPEL' '$DIR'" >&2
    exit 1
  fi

  zeg "-- container herbouwen en starten"
  doe "cd '$DIR' && docker compose up -d --build"
  doe "cd '$DIR' && docker compose ps"

  if [ "$DRY" = 1 ]; then
    zeg
    zeg "Dry-run klaar. Er is niets gewijzigd."
    exit 0
  fi

  # ── 5. Echt controleren of de site antwoordt ───────────────────────────────────────
  # Traefik geeft 404 zolang de container herstart en er dus geen backend is: wie meteen na
  # de deploy curlt ziet een 404 die geen 404 is. Zonder deze lus zou hier "klaar" staan,
  # ook als de site plat ligt.
  zeg
  zeg "Controle op $URL"
  for poging in 1 2 3 4 5 6; do
    CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$URL" || echo 000)"
    zeg "  poging $poging: HTTP $CODE"
    if [ "$CODE" = "200" ]; then
      zeg
      zeg "Klaar en geverifieerd. Live op $URL"
      zeg "Backup van de vorige staat: $BACKUPS/pre-deploy-$STEMPEL"
      zeg "LET OP: de site staat op noindex tot de echte gegevens erin staan (zie STATUS.md)."
      exit 0
    fi
    sleep 5
  done

  echo >&2
  echo "WAARSCHUWING: $URL antwoordt niet met 200 na de deploy." >&2
  echo "Logs:      docker compose -f $DIR/docker-compose.yml logs --tail 40 belvanger" >&2
  echo "Terugzetten op de VPS:" >&2
  echo "  rm -rf '$DIR' && cp -a '$BACKUPS/pre-deploy-$STEMPEL' '$DIR' && cd '$DIR' && docker compose up -d --build" >&2
  echo "Of vanaf je PC:  bash rollback-to-vps.sh" >&2
  exit 1
}

main "$@"
