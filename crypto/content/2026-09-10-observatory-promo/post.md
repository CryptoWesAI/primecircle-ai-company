# Post text for the Observatory promo video

The one to share: `sable-observatory-film.mp4`, the animated explainer drawn in
the site's own look (1920x1080, 30 fps, 51.9 s, narration by the vidIQ voice
"Sarah" plus a generated music bed). `-film-small.mp4` is the lighter copy,
`-film-silent.mp4` the version without audio. Source: `film/film.html` (one
canvas scene per narration line) and `film/render.mjs` (frame renderer):
`node film/render.mjs <frames> 30 51.9`, then ffmpeg on the frames, then mix.py.

The earlier screen-recording cut (`sable-observatory-promo*.mp4`) is kept for
reference only; the founder preferred the animated film.

The video ends on the link: no "Independent" line and no holding disclosure
(both removed on request, 10 Sep 2026; the voice is cut at the pause after
"cloud", see TRIM_END in mix.py). The disclosure therefore has to stay in the
post text below, as the last line.

Rebuild: `node capture.mjs <scratch>/shots`, `python build.py <scratch>`
(add `--compose-only` to reuse the rendered browser part), then
`python mix.py sable-observatory-promo-silent.mp4 <narration.mp3> <music.wav> sable-observatory-promo.mp4`.
The narration script lives in mix.py; the voice was generated with
vidiq_voiceover_generate (voice EXAVITQu4vr4xnSDxMaL) and sped up 6 percent with
ffmpeg atempo, the music with vidiq_generate_music. 39 credits in total.

## X, with the film attached (10 Sep 2026)

Main post (attach sable-observatory-film.mp4 as native video, no link in the
post itself; X ranks link posts lower, the link goes in the first reply):

An independent page about @Sablenetwork, in 50 seconds:

- the whitepaper as a solar system
- a door: send a prompt, get a receipt
- live status and supply, check it yourself
- Gatekeeper, a game where you are the door
- the whitepaper, watched hourly

I hold SABL.

First reply:

Watch it here: https://sable.primecircle.cloud

Everything runs in your browser. Nothing you type is sent anywhere.
Independent, not run by Sable Network. Corrections welcome.

## X, text only (earlier draft, under 280 characters)

One page for Sable Network, built by a community member: the whitepaper as a
solar system, a door you can send a prompt through, live status and supply you
can check yourself, a game, and the whitepaper watched hourly.

sable.primecircle.cloud

Independent. I hold SABL.

## Telegram (longer)

I built an independent page about Sable Network and it is live at
sable.primecircle.cloud. Forty seconds of what is on it:

- Overview: the whitepaper drawn as a solar system, every dot a sentence,
  orange where the text changed.
- Try it: send a prompt through the door in your browser. Sealed, budget
  held, opened once, receipted. Let it loop and watch the cap refuse it.
- Verify: Sable's live status, published signer, and the node listing, plus a
  receipt verifier that runs locally.
- Token: a thousand lights, one per million SABL, read from Solana.
- Play: Gatekeeper, you are the door. Leaderboard without accounts.
- Log: the whitepaper watched hourly, every diff on record, and what the page
  got wrong.

Not run by Sable Network. I hold SABL. Questions and corrections welcome.

Ident (12 Sep 2026): `bash add-ident.sh <in.mp4>` puts the Sable sonic logo on the first
two seconds of a finished video (video stream copied, audio remixed with the ident on top).
`sable-observatory-film-ident.mp4` is the film with the ident. The ident itself lives in
`../2026-09-11-sable-whitepaper-ep/sonic-logo/` (cut B of the Suno sting by OG THE MOGI).
