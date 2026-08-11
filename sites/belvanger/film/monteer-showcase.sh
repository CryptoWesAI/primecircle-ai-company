#!/usr/bin/env bash
# Monteert de showcase-film "Elk vak zijn eigen website" uit de frame-reeksen van
# neem-showcase-op.mjs en het geluid van maak-geluid.mjs.
#
# Draaien vanuit de map met showcase-frames/:
#   bash monteer-showcase.sh [uitvoerbestand]
#
# Alles hier is bewust knip-op-de-beat: harde sneden, geen overvloeiers. Een
# kruisvervaging tussen twee websites leest als een diavoorstelling; een harde
# snede op dezelfde compositie leest als montage. De enige uitzondering staat
# onderaan: één korte vervaging naar de slotkaart, omdat daar de film uitademt.
set -euo pipefail

FR="${FR:-./showcase-frames}"
UIT="${1:-belvanger-showcase-1080x1920.mp4}"
# Bewust een werkmap naast de frames en geen mktemp -d. Op Windows geeft mktemp een
# MSYS-pad terug (/tmp/...) dat de native ffmpeg als C:/tmp leest, waardoor de
# concat-lijst naar bestanden wijst die daar niet staan. Relatieve paden hebben dat
# probleem niet.
WERK="./montage-werk"
rm -rf "$WERK"; mkdir -p "$WERK"

fps=25
# Twee compressieniveaus, en dat is geen detail. Op één vaste CRF werd de film 20 MB
# en dat is te zwaar: WhatsApp hercodeert boven ongeveer 16 MB, en dan bepaalt
# WhatsApp de kwaliteit in plaats van wij.
# De hero's zijn bewegende foto's; daar ziet niemand het verschil tussen CRF 20 en
# 26, en daar zit wel het grootste deel van de bitrate. De simulatie en de
# tekstkaarten zijn vlakke vlakken met kleine letters, en juist het tijdstempel
# "14:32" is het enige harde bewijs in de hele film. Dat krijgt dus de ruimte.
CRF_FOTO="${CRF_FOTO:-26}"
CRF_TEKST="${CRF_TEKST:-18}"

# ── Afwerking: vignet + filmkorrel ───────────────────────────────────────────
# Uit de finishing-richtlijn van de scroll-film-studio skill: "film grain +
# vignette sell the one-shot feel". Dat is hier precies het probleem dat opgelost
# moet worden, want dit zijn negentien aan elkaar geplakte schermopnames en zonder
# deze laag zien ze er ook zo uit: negentien keer een ander, chemisch schoon
# beeldscherm.
# Bewust ZUINIG afgesteld. Zwaardere effecten (glitch, bloom, chromatische
# aberratie) vechten met de positionering: alles wat naar bureau ruikt kost bij deze
# doelgroep de kijker. Het vignet is nauwelijks te benoemen als je erop let, en de
# korrel is temporeel (allf=t) zodat hij per frame verschilt en dus als korrel leest
# in plaats van als vuil op de lens.
# `noise` moet vóór `format=yuv420p`, anders werkt hij op een geconverteerd beeld en
# krijg je kleurruis in plaats van luminantiekorrel.
# Korrel kost bitrate, en veel. Met korrel over de hele film werd het bestand 135 MB
# (h264 probeert elk korreltje mee te coderen), en zelfs op de laagste zichtbare
# sterkte nog 15,8 MB tegen 13,5 MB zonder. Daarom staat de korrel alleen op de
# gefilmde delen: de verfscene en de zeven hero's. Dat is ook waar hij hoort. De
# simulatie, het dashboard en de tekstkaarten zijn schérmen, en een scherm heeft geen
# filmkorrel; daar zou het als ruis lezen in plaats van als textuur, terwijl juist die
# vlakke vlakken de korrel het duurst maken.
# Het vignet loopt wel over alles, want dat kost vrijwel niets en het is het deel dat
# de negentien losse opnames als één stuk laat voelen.
VIGNET="vignette=angle=PI/4.6:mode=forward"
# Temporeel (allf=t): de korrel verschilt per frame en leest daardoor als korrel in
# plaats van als vuil op de lens. Vóór format=yuv420p, anders krijg je kleurruis.
VFX_FOTO="${VFX_FOTO:-$VIGNET,noise=alls=4:allf=t}"
VFX_TEKST="${VFX_TEKST:-$VIGNET}"

maak() { # maak <naam> <map> <startframe> <aantal> <crf> <vfx>
  ffmpeg -y -hide_banner -loglevel error \
    -start_number "$3" -framerate $fps -i "$FR/$2/f%04d.jpg" \
    -frames:v "$4" -vf "scale=1080:1920:flags=lanczos,$6,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$5" "$WERK/$1.mp4"
}

echo "1/4  segmenten renderen"
# Koude opening: de wand wordt geverfd, MET de hook-laag eroverheen. Die twee regels
# tekst zijn niet optioneel. Zonder is dit 2,4 seconden lang een muur, en dan denkt
# een koude kijker dat hij naar een advertentie van een schildersbedrijf kijkt.
# Stopt op frame 60, want daar is de wand vol en scrollt de pagina alleen nog door.
ffmpeg -y -hide_banner -loglevel error \
  -framerate $fps -i "$FR/00-open/f%04d.jpg" \
  -framerate $fps -i "$FR/30-hook/f%04d.png" \
  -frames:v 61 -filter_complex "[0][1]overlay=format=auto,scale=1080:1920:flags=lanczos,$VFX_FOTO,format=yuv420p" \
  -c:v libx264 -preset slow -crf "$CRF_FOTO" "$WERK/s01.mp4"

# Eerst de claim, dan het bewijs. Deze kaart stond ooit NA de zeven vakken, en dat
# was de fout die de hele film onbegrijpelijk maakte: negen seconden websites kijken
# zonder te weten van wie ze zijn of voor wie ze bedoeld zijn.
maak s02 "31-kaart-1" 0 52 "$CRF_TEKST" "$VFX_TEKST"

# De zeven vakken. Zelfde kadrering, zelfde belknop, zeven werelden. De duur loopt
# terug van 1,44s naar 0,88s en de laatste landt weer op 1,40s.
maak s03 "10-vak-1-loodgieter"   0 36 "$CRF_FOTO" "$VFX_FOTO"
maak s04 "10-vak-2-dakdekker"    0 33 "$CRF_FOTO" "$VFX_FOTO"
maak s05 "10-vak-3-elektricien"  0 30 "$CRF_FOTO" "$VFX_FOTO"
maak s06 "10-vak-4-installateur" 0 27 "$CRF_FOTO" "$VFX_FOTO"
maak s07 "10-vak-5-hovenier"     0 24 "$CRF_FOTO" "$VFX_FOTO"
maak s08 "10-vak-6-klusbedrijf"  0 22 "$CRF_FOTO" "$VFX_FOTO"
maak s09 "10-vak-7-schilder"     0 35 "$CRF_FOTO" "$VFX_FOTO"

# Het aanvraagformulier wordt ingevuld. Dit is het hart van de film: niet de gemiste
# oproep, maar de bezoeker die zijn gegevens achterlaat op je eigen site. De ingevulde
# naam is dezelfde als de aanvraag die straks in het dashboard staat.
maak s10 "15-formulier" 0 100 "$CRF_TEKST" "$VFX_TEKST"

# Eén shot van de rinkelende telefoon, en verder niets van de sms-conversatie. Die
# hele conversatie zat er eerder in en is eruit gehaald: de film moet over de website
# met het formulier gaan. Wat blijft is het tweede kanaal in beeld brengen, zodat de
# kaart erna ("alles komt op één plek binnen") ergens over gaat.
maak s11 "20-sim" 38 40 "$CRF_TEKST" "$VFX_TEKST"

maak s12 "32-kaart-2" 0 50 "$CRF_TEKST" "$VFX_TEKST"

# Het dashboard, van de besparing tot de tijdlijn waar de sms, de gemiste oproep en de
# websiteaanvraag onder elkaar staan. Dat rijtje is het bewijs van de kaart ervoor.
maak s13 "25-dashboard" 0 90 "$CRF_TEKST" "$VFX_TEKST"

# En de melding op de telefoon, met de teksten die het portaal echt verstuurt.
maak s14 "35-melding" 0 60 "$CRF_TEKST" "$VFX_TEKST"

maak s15 "33-kaart-3" 0 82 "$CRF_TEKST" "$VFX_TEKST"

echo "2/4  aan elkaar zetten"
# De paden in de concat-lijst worden door ffmpeg opgelost TEN OPZICHTE VAN de lijst
# zelf, niet ten opzichte van de werkmap. Daarom staan hier kale bestandsnamen.
: > "$WERK/lijst.txt"
for s in s01 s02 s03 s04 s05 s06 s07 s08 s09 s10 s11 s12 s13 s14 s15; do
  echo "file '$s.mp4'" >> "$WERK/lijst.txt"
done
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$WERK/lijst.txt" -c copy "$WERK/beeld.mp4"

echo "3/4  geluid maken"
node "$(dirname "$0")/maak-geluid.mjs" "$WERK/geluid.wav"

echo "4/4  samenvoegen en luidheid normaliseren"
# EBU R128 op -16 LUFS met true peak -1,5 dBTP. Zonder deze stap klinkt de film op
# een telefoon veel te zacht en hoort niemand het rinkelen wegvallen, en dat is
# precies de beweging die het geluid moet dragen.
ffmpeg -y -hide_banner -loglevel error \
  -i "$WERK/beeld.mp4" -i "$WERK/geluid.wav" \
  -map 0:v -map 1:a -shortest \
  -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=16" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart "$UIT"

ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 "$UIT"
echo "klaar: $UIT"
