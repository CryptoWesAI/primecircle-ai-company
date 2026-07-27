set -e
FF="$SP/ffmpeg/ffmpeg-8.1.2-essentials_build/bin/ffmpeg.exe"

# ── A. Vier videosegmenten, allemaal 1080x1920 @ 25fps, zonder audio ──────────
# Act 1 tot 10s: mijn prompt liet de telefoon rond de tiende seconde uitgaan, dus
# daar zit het natuurlijke einde van de scene.
"$FF" -y -hide_banner -loglevel error -i act1-steiger-audio.mp4 -t 10 \
  -vf "scale=1080:1920:flags=lanczos,fps=25" -an \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p v1.mp4

# Act 2: de simulatie is inhoudelijk klaar op 13,5s, 14 is genoeg.
"$FF" -y -hide_banner -loglevel error -i act2-simulatie.mp4 -t 14 -an \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p v2.mp4

# Tekstkaarten als stills naar clips.
"$FF" -y -hide_banner -loglevel error -loop 1 -i kaart-1.png -t 4 \
  -vf "fps=25,format=yuv420p" -c:v libx264 -preset slow -crf 18 v3.mp4
"$FF" -y -hide_banner -loglevel error -loop 1 -i kaart-2.png -t 6 \
  -vf "fps=25,format=yuv420p" -c:v libx264 -preset slow -crf 18 v4.mp4

printf "file 'v1.mp4'\nfile 'v2.mp4'\nfile 'v3.mp4'\nfile 'v4.mp4'\n" > concat.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i concat.txt -c copy film-beeld.mp4

# ── B. Audiospoor ────────────────────────────────────────────────────────────
# a1 = regen + rinkelende telefoon uit act 1 (de eerste 10s).
"$FF" -y -hide_banner -loglevel error -i act1-steiger-audio.mp4 -t 10 -vn \
  -c:a pcm_s16le -ar 48000 -ac 2 a1.wav

# a2 = regenbed: het staartje van act 1 (na het rinkelen) geloopt onder act 2 en de
# kaarten, zachter, en uitgefade aan het eind. Zo voelt de film als één geheel
# i.p.v. drie losse stukken, en de stilte na het rinkelen valt juist op.
"$FF" -y -hide_banner -loglevel error -ss 11 -i act1-steiger-audio.mp4 -t 4 -vn \
  -c:a pcm_s16le -ar 48000 -ac 2 rain-loop.wav
"$FF" -y -hide_banner -loglevel error -stream_loop 6 -i rain-loop.wav -t 24 \
  -af "volume=0.38,afade=t=out:st=19:d=5" -c:a pcm_s16le -ar 48000 -ac 2 a2.wav

printf "file 'a1.wav'\nfile 'a2.wav'\n" > concat-audio.txt
"$FF" -y -hide_banner -loglevel error -f concat -safe 0 -i concat-audio.txt \
  -c:a pcm_s16le film-geluid.wav

# ── C. Muxen ─────────────────────────────────────────────────────────────────
"$FF" -y -hide_banner -loglevel error -i film-beeld.mp4 -i film-geluid.wav \
  -c:v copy -c:a aac -b:a 160k -shortest belvanger-opgevangen-1080x1920.mp4
