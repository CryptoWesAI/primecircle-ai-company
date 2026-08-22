#!/usr/bin/env bash
# Monteert de verdelgerfilm uit wat neem-verdelger-op.mjs heeft opgenomen, plus de
# gegenereerde shot van act 1 als die er is.
#
#   node sites/belvanger/film/neem-verdelger-op.mjs        # eerst opnemen
#   bash sites/belvanger/film/monteer-verdelger.sh         # dan monteren
#
# Zet de gegenereerde shot als act1-verdelger.mp4 in de werkmap. Ontbreekt hij, dan
# monteert dit script een plaatshouder op die plek en synthetiseert het de rinkelende
# telefoon zelf, zodat het ritme van de rest nu al te beoordelen is.
#
# Draaiboek, prompts en de reden achter elke keuze:
# docs/offers/belvanger-film-verdelger-2026-08-21.md
set -e
HIER="$(cd "$(dirname "$0")" && pwd)"
WERKMAP="${1:-$HIER/werkmap-verdelger}"
FF="${FF:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
UIT="$HIER/belvanger-verdelger-1080x1920.mp4"

# Kaart 1 is de GESCHREVEN grap ("Je had je handen vol. Letterlijk."). In de take
# waarin de verdelger zelf in de camera kijkt en "mooi" zegt, draagt act 1 de grap al,
# en twee grappen achter elkaar verzwakken elkaar allebei. Vandaar standaard uit.
# Terugzetten: MET_KAART1=ja bash monteer-verdelger.sh
MET_KAART1="${MET_KAART1:-nee}"

# Stilstaand staartje achter act 1. Het gesproken woord eindigt vlak voor het einde
# van de gegenereerde clip, en zonder deze halve seconde valt de snede boven op de
# clou. Een bevroren laatste frame na een droog woord leest als een bedoelde pauze.
VRIES=0.5

cd "$WERKMAP"

# De simulatie is opgenomen op de wandklok en haalt de 25 fps niet: een screenshot
# kost tijd. Zonder deze correctie speelt de simulatie ongeveer 8% te snel af. De
# echte invoersnelheid is tijdens het opnemen gemeten en staat in opname.env.
. ./opname.env

# Een vignet over ALLE segmenten. Dat is wat losse opnames als een geheel laat voelen,
# en het kost vrijwel geen bitrate. Bewust geen filmkorrel: die maakte de vorige film
# tien keer zo groot, en juist op vlakke UI-vlakken kost hij het meest.
VIG="vignette=angle=PI/4.6"

# ── A. Beeldsegmenten, allemaal 1080x1920 @ 25fps, zonder audio ───────────────
if [ -f act1-verdelger.mp4 ]; then
  # De duur METEN en niet aannemen: de eerste take was 7 seconden zonder tekst, de
  # tweede 10 met een gesproken slotwoord. Een vaste -t 7 zou dat woord eraf knippen.
  ACT1_S="$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 act1-verdelger.mp4)"
  echo "act 1: gegenereerde shot gevonden, ${ACT1_S}s plus ${VRIES}s stilstaand"
  # De gegenereerde shot komt mogelijk niet exact op 1080x1920 terug. Opschalen tot
  # hij het frame vult en dan bijsnijden, nooit uitrekken.
  "$FF" -y -hide_banner -loglevel error -i act1-verdelger.mp4 \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=25,$VIG,tpad=stop_mode=clone:stop_duration=$VRIES" \
    -an -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p v1.mp4
  ACT1_AUDIO=1
else
  ACT1_S=7
  VRIES=0
  echo "act 1: NIET gevonden, plaatshouder gemonteerd (zet act1-verdelger.mp4 in $WERKMAP)"
  "$FF" -y -hide_banner -loglevel error -loop 1 -i act1-plaatshouder.png -t 7 \
    -vf "fps=25,format=yuv420p,$VIG" -c:v libx264 -preset slow -crf 18 v1.mp4
  ACT1_AUDIO=0
fi
# Bash rekent niet met kommagetallen, awk wel.
ACT1_FILM="$(awk -v a="$ACT1_S" -v v="$VRIES" 'BEGIN{printf "%.3f", a+v}')"
FADE_ST="$(awk -v a="$ACT1_S" 'BEGIN{printf "%.3f", a-0.25}')"

# De simulatie: vlakke vlakken met kleine letters, dus een lage CRF. Het tijdstempel
# "14:32" is het enige harde bewijs in de film en moet leesbaar blijven.
"$FF" -y -hide_banner -loglevel error -framerate "$SIM_FPS" -i sim-frames/f%05d.jpg \
  -vf "fps=25,$VIG,format=yuv420p" -an -c:v libx264 -preset slow -crf 18 v2.mp4

"$FF" -y -hide_banner -loglevel error -loop 1 -i kaart-2.png -t 4.4 \
  -vf "fps=25,$VIG,format=yuv420p" -c:v libx264 -preset slow -crf 18 v4.mp4

# ffmpeg lost paden in een concat-lijst op ten opzichte van de LIJST, niet ten
# opzichte van de werkmap. Kale bestandsnamen dus.
if [ "$MET_KAART1" = "ja" ]; then
  "$FF" -y -hide_banner -loglevel error -loop 1 -i kaart-1.png -t 3.4 \
    -vf "fps=25,$VIG,format=yuv420p" -c:v libx264 -preset slow -crf 18 v3.mp4
  printf "file 'v1.mp4'\nfile 'v2.mp4'\nfile 'v3.mp4'\nfile 'v4.mp4'\n" > concat.txt
  GELUID_KAART=""
else
  echo "kaart 1 staat niet in deze montage (MET_KAART1=ja zet hem terug)"
  printf "file 'v1.mp4'\nfile 'v2.mp4'\nfile 'v4.mp4'\n" > concat.txt
  GELUID_KAART="--zonder-kaart1"
fi
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i concat.txt -c copy film-beeld.mp4

# ── B. Geluid ────────────────────────────────────────────────────────────────
if [ "$ACT1_AUDIO" = "1" ]; then
  node "$HIER/maak-geluid-verdelger.mjs" "$WERKMAP" --zonder-rinkel --act1="$ACT1_FILM" $GELUID_KAART
  # Het geluid van de gegenereerde shot (tuin, gezoem, de telefoon, het gesproken
  # woord) met de gesynthetiseerde bodem eronder door de hele film.
  # normalize=0: amix halveert anders elk kanaal en dan zakt de hele film weg.
  # De uitfade duurt maar een kwart seconde en begint pas als het woord er al uit is:
  # een langere fade zou de clou opeten.
  "$FF" -y -hide_banner -loglevel error -i act1-verdelger.mp4 -vn \
    -af "afade=t=out:st=$FADE_ST:d=0.25" -c:a pcm_s16le -ar 48000 -ac 2 a1.wav
  "$FF" -y -hide_banner -loglevel error -i a1.wav -i film-geluid.wav \
    -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest:normalize=0" \
    -c:a pcm_s16le -ar 48000 -ac 2 film-geluid-mix.wav
  GELUID=film-geluid-mix.wav
else
  node "$HIER/maak-geluid-verdelger.mjs" "$WERKMAP" --act1="$ACT1_FILM" $GELUID_KAART
  GELUID=film-geluid.wav
fi

# ── C. Muxen en luidheid ─────────────────────────────────────────────────────
# LRA=16 en niet 11: op 11 werd het geluid vlak, stak de beltoon nauwelijks boven de
# ruimtetoon uit en verdween juist het stiltemoment.
#
# TWEE doorgangen, geen een. Loudnorm schat in een enkele doorgang op basis van het
# begin van het bestand, en dat ging hier mis zodra het geluid van de gegenereerde
# shot erbij kwam: gevraagd -16 LUFS met true peak -1,5, geleverd -14,8 met -0,8.
# Die -0,8 is te dicht op nul om de hercodering van Facebook veilig te overleven.
# Meten, dan pas normaliseren.
LN="loudnorm=I=-16:TP=-1.5:LRA=16"
MEET="$("$FF" -hide_banner -nostats -i "$GELUID" -af "$LN:print_format=json" -f null - 2>&1)"
haal() { printf '%s\n' "$MEET" | grep "\"$1\"" | sed 's/[^-0-9.]//g'; }
M_I="$(haal input_i)"; M_TP="$(haal input_tp)"
M_LRA="$(haal input_lra)"; M_TH="$(haal input_thresh)"

if [ -n "$M_I" ] && [ -n "$M_TP" ] && [ -n "$M_LRA" ] && [ -n "$M_TH" ]; then
  LN="$LN:measured_I=$M_I:measured_TP=$M_TP:measured_LRA=$M_LRA:measured_thresh=$M_TH:linear=true"
  echo "luidheid gemeten: I=$M_I TP=$M_TP LRA=$M_LRA"
else
  # Nooit stilletjes doorgaan met een half filter: dan levert de film een luidheid
  # die niemand heeft gekozen.
  echo "LET OP: meting mislukt, terug naar een enkele doorgang"
fi

# -ar 48000 expliciet: loudnorm schakelt zelf naar 192 kHz en dan komt er een
# bestand van 96 kHz uit. Dat speelt overal, maar het is geen bewuste keuze en het
# kost bitrate die de leesbaarheid van het tijdstempel nodig heeft.
"$FF" -y -hide_banner -loglevel error -i film-beeld.mp4 -i "$GELUID" \
  -c:v copy -af "$LN" -c:a aac -b:a 160k -ar 48000 -shortest "$UIT"

echo
echo "klaar: $UIT"
"$FF" -hide_banner -i "$UIT" 2>&1 | grep -E "Duration|Stream" || true
