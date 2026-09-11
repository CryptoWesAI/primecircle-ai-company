#!/usr/bin/env bash
# Puts the Sable sonic logo (the ident, cut B of the Suno sting, see
# ../2026-09-11-sable-whitepaper-ep/sonic-logo/) on the first two seconds of a
# finished video. The ident sits on top of the existing mix at full level; the
# video stream is copied, so this takes seconds and changes no frame.
#
#   bash add-ident.sh <in.mp4> [out.mp4]      (default out: <in>-ident.mp4)
#
# The ident file has 300 ms of silence at the head, so the hit lands at 0.3 s.
set -euo pipefail
in="${1:?usage: add-ident.sh <in.mp4> [out.mp4]}"
out="${2:-${in%.mp4}-ident.mp4}"
here="$(cd "$(dirname "$0")" && pwd)"
ident="$here/sable-ident-video-lead.wav"
[ -f "$ident" ] || { echo "ident missing: $ident" >&2; exit 1; }
ffmpeg -v error -y -i "$in" -i "$ident" \
  -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$out"
echo "wrote $out"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out"
