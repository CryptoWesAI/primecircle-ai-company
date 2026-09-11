#!/usr/bin/env bash
# Cuts the sonic logo out of a longer Suno sting and renders the delivery set.
#
#   bash sonic-logo/cut.sh <sting.wav> <start-seconds> [duration, default 2.0] [label, default pick]
#
# Writes to sonic-logo/out/<label>/ (so several candidates can sit side by side):
#   logo-raw.wav               the trimmed cut with a 120 ms fade-out, untouched level
#   sable-ident-web.wav        loudness -16 LUFS, true peak -1 dBTP, 48 kHz (site use)
#   sable-ident.mp3 / .ogg     the web version encoded for <audio>
#   sable-ident-video.wav      -14 LUFS for video intros
#   sable-ident-video-lead.wav the video version with 300 ms of silence at the head
# Then prints the measured loudness and the final duration. Spec: 1.5 to 2.5 s.
# Note: loudnorm's integrated measure is approximate on a clip this short; the
# true-peak ceiling is the hard rule, the rest is judged by ear against the EP.
set -euo pipefail
in="${1:?usage: cut.sh <sting.wav> <start-seconds> [duration]}"
start="${2:?start seconds}"
dur="${3:-2.0}"
label="${4:-pick}"
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/out/$label"
mkdir -p "$out"
fade_at="$(awk -v d="$dur" 'BEGIN{printf "%.3f", d-0.12}')"

ffmpeg -v error -y -ss "$start" -t "$dur" -i "$in" -af "afade=t=out:st=${fade_at}:d=0.12" "$out/logo-raw.wav"
ffmpeg -v error -y -i "$out/logo-raw.wav" -af "loudnorm=I=-16:TP=-1:LRA=7" -ar 48000 "$out/sable-ident-web.wav"
ffmpeg -v error -y -i "$out/logo-raw.wav" -af "loudnorm=I=-14:TP=-1:LRA=7" -ar 48000 "$out/sable-ident-video.wav"
ffmpeg -v error -y -i "$out/sable-ident-web.wav" -c:a libmp3lame -b:a 192k "$out/sable-ident.mp3"
ffmpeg -v error -y -i "$out/sable-ident-web.wav" -c:a libvorbis -q:a 6 "$out/sable-ident.ogg"
ffmpeg -v error -y -i "$out/sable-ident-video.wav" -af "adelay=300|300" "$out/sable-ident-video-lead.wav"

echo "== measured (web version) =="
ffmpeg -i "$out/sable-ident-web.wav" -af "loudnorm=I=-16:TP=-1:LRA=7:print_format=summary" -f null - 2>&1 | grep -E "Input Integrated|Input True Peak" || true
echo "== duration (s) =="
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$out/sable-ident-web.wav"
