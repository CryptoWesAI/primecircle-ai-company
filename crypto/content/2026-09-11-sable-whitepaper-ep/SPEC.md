# The Whitepaper EP and the sonic logo: implementation spec

Date: 2026-09-11. Status: built and live on 2026-09-12 (sable.primecircle.cloud/#listening, six tracks, both test suites green live). The sonic logo has three candidate cuts awaiting the founder's ear. Explore mode.

Two deliverables. An EP of six songs whose lyrics are the Sable whitepaper's own
sentences, published in a listening room on the Observatory that mirrors the
Orrery (a planet with a track plays it). And a sonic logo, a two-second ident
in the same artist's palette, used at the start of every Observatory video and
at the moments on the site where something is sealed or verified.

Disclosure on every public piece: made by a SABL holder who is not part of the
Sable team. Composed with Suno from the whitepaper's own sentences.

## Decisions taken (founder, 2026-09-11)

| Decision | Choice | Rejected |
| --- | --- | --- |
| Length | EP of six; the other planets stay silent until their track lands | Full album of 14 (too much QA before anything ships); EP of 8 |
| Sound | One coherent artist sound, the founder's Suno artist; sections differ in mood and tempo | A genre per track (fun, but the artist persona carries nothing) |
| Rights | Suno Pro or Premier: outputs are owned with commercial rights, kept after the plan ends | Free plan (non-commercial, Suno keeps ownership) |
| Language | English, so lines can be sung verbatim | Bahasa or Dutch (verbatim is lost in translation) |
| Engine | Suno for both EP and logo, for a single sonic identity | vidIQ music (no artist identity, 180 s cap, 25 credits per take); kept as fallback for stings |

Suno facts used here, checked 2026-09-11: Style field about 1,000 characters,
Lyrics 5,000 (about 3,000 is where songs stop rushing), Title 100; the artist
lives under Voices (formerly Personas). Pro and Premier subscribers own their
outputs with commercial rights; a song with remixing enabled becomes jointly
owned and non-commercial, so remixing stays OFF for every track. Suno makes no
warranty that copyright vests in an output, and the creator bears the risk of
resemblance to an existing song, so each take gets a "does this sound like
something" listen before it ships.
Sources: help.suno.com/en/articles/2416769 (Does Suno own the music I make),
help.suno.com/en/articles/2746945 (copyright), hookgenius.app/learn/suno-character-limits
(third-party summary of the in-app limits; confirm in the Suno UI on the day).

## Part A. The EP

### A1. Source and rules for the lyrics

- Source: the Sable whitepaper, cover "v2.0, August 2026", at
  https://www.buildsable.com/sable-whitepaper.pdf, snapshot 2026-09-04 in the
  whitepaper watcher (`../sable-whitepaper-watch/whitepaper.json`, 254 sentences).
- Every verse line is either a verbatim sentence or clause from the paper, or a
  short piece of glue in plain words. The track file marks which is which, and
  the track page renders quotes as quotes with their section.
- Names and numbers stay exact: Intel TDX, gVisor, x402, USDT, Ethereum,
  Arbitrum, Solana, key formats. A lyric never rounds a fact.
- No claims the paper does not make. No price, no "moon", no roadmap promises.
- A check script (`check-quotes.mjs`) verifies every line marked as a quote
  against `whitepaper.sentences.txt` before any credit is spent.

### A2. Track list (proposal; override on this table)

| # | Working title | Section (Orrery planet) | Why this one |
| --- | --- | --- | --- |
| 1 | One Line | 1 The delegation problem (sun, 01) | The opener: the whole paper in one sentence, the problem and the one-line fix |
| 2 | The Privacy Contract | 3 The privacy contract (03) | A list song: the blunt rules, enforced in code |
| 3 | A Budget Checked After | 5 Metering, budgets and delegation (05) | The best single line in the paper; holds, caps, keys that only hand out smaller keys |
| 4 | Anyone Can Check | 7 Verifiable receipts (07) | Sable's core promise as a chorus |
| 5 | Never Downgraded | 8 Confidential execution and attestation (08) | Fail-closed, the thing the Observatory's Log measures every day |
| 6 | Trust Through Architecture | 13 Conclusion (13), one line from 11 | The closer: the machines are the commodity, the trust layer is not |

Bench for later planets: 6 Payment (machines pay without a card), 9 Sandbox
compute (network off), 10 What is built and what is not, 12 Threat model
(defended today, not yet), 2 The control plane, 4 Architecture (seal, hold,
open, meter, sign).

Running order is an arc: problem, rules, money, proof, refusal, thesis.
Titles are working titles until the quote file confirms the verbatim phrase.

### A3. What each track file holds

`tracks/NN-slug.md`, one per track, front matter plus body:

```
---
title: ...
slug: ...
track: 1
section: 1
planet: "01"
hook: "verbatim chorus phrase"
mood: one line, the per-track half of the Style field
duration_target: 150-200 s
suno_url:        (filled after generation)
generated:       (date, Suno model)
audio: 01-slug.mp3
---
## Style (paste into Suno "Style of Music", under 1,000 characters)
<ARTIST BASE> + <mood line>

## Lyrics (paste into Suno "Lyrics", target under 3,000 characters)
[Verse] ... with [Chorus], [Bridge], [Outro] tags

## Sources
- "verbatim sentence" (section n)
```

The `<ARTIST BASE>` is the founder's own description of the Suno artist
(voice, instruments, era, tempo range, what it never does). It is pasted once
into `tracks/ARTIST.md` and every Style field is base plus mood line.

### A4. The Suno session (founder, human step)

1. Custom mode. Model: the newest (v5 or later). Pick the artist under Voices
   (OG THE MOGI, melodic rap, Midwest double-time flow; base in `tracks/ARTIST.md`).
2. Paste Style, Lyrics, Title from the track file. Remixing OFF. The Style
   fields are already filled (base plus mood line, about 620 characters). Never
   add real artist names to the Style text: Suno's filter rejects them.
   The lyrics carry rap structure cues in the tags ([Verse 1: fast double-time
   flow], [Hook: layered harmonies, sing-rap], [Bridge: half-time, stacked
   harmonies]); a take that ignores a cue is a retake, not a rewrite.
3. Two takes per track. Keep the one that sings the quotes cleanly (a garbled
   "x402" or "TDX" is a reject). If a take cuts off, Extend rather than regenerate.
4. Download WAV (master) and MP3. Name them `NN-slug.wav` and `NN-slug.mp3`.
   Put them in `audio/` next to this spec. WAV is gitignored; MP3 ships.
5. Paste the Suno song URL and the date and model into the track file.

Budget: six tracks at two takes is 12 generations, well inside a Pro month.

### A5. The listening room (build)

- `sites/sable-peers/build-tracks.mjs`, a sibling of `build-notes.mjs`: reads
  `tracks/*.md` and `audio/*.mp3`, writes `site/tracks/<slug>.html` (player,
  lyrics with quotes marked and linked to their section, the source stamp with
  whitepaper version and snapshot date, the disclosure), copies the MP3 to
  `site/tracks/`, writes `site/tracks/index.json`.
- A "Listening room" band next to the reading room in `source/sable-peers.html`,
  rendered from `index.json` by `app.js` the way the notes list is: title,
  section, a native `<audio controls preload="none">` per track. The CSP already
  allows `media-src 'self'`, so no header change.
- Orrery: a planet with a track gets a play glyph; selecting it offers "Hear
  this section". The map from planet to slug comes from `index.json`, so the
  Orrery code changes by a few lines, not a rewrite.
- Audio never autoplays; every player starts from a click.
- Alternatives rejected: SoundCloud or YouTube embeds (break the CSP, add
  tracking, and the site would not own its own record); a custom Web Audio
  player (the native element is enough and accessible).

### A6. Release

- X: one post per track with the hook line, the planet, and the disclosure;
  the opener first. The X growth playbook's cadence applies.
- YouTube: optional, one video per track with the Orrery as the visual; the
  vidIQ tools cover titles and thumbnails; mark as synthetic audio.
- `CURRENT_STATE.md` and `docs/decisions/DECISIONS_LOG.md` get an entry; the
  whitepaper watcher's changelog is linked from each track page so a changed
  sentence is visible next to the lyric that quotes it.

## Part B. The sonic logo

- What: 1.5 to 2.5 seconds, two events that follow the paper's shape: a seal
  (a short, low, closed sound: a lock, a thud) and a receipt (a brighter chime
  that rises and resolves). Mono-compatible, audible on a phone speaker, and
  a version with 300 ms of silence at the head for video editors.
- How: Suno cannot render two seconds, so generate a 10 to 20 second
  instrumental "audio ident / sting" in the artist's palette, pick the best
  two seconds, and cut with ffmpeg (`sonic-logo/cut.sh`: trim, 120 ms fade
  out, loudness to -16 LUFS for the web and -14 LUFS for video, export WAV,
  MP3 and OGG). ffmpeg 8.1 is installed. Fallback engine: vidIQ, 10-second
  minimum, 25 credits.
- Order: after the EP's opener exists, so the sting can be prompted in the
  same palette and, if the founder wants, quote its chorus interval.
- Where it plays, each a separate later wire-in: the first frame of every
  Observatory video; the letterbox, when a new letter lands while the page is
  open (after a user gesture, per browser rules); the receipt "verified"
  moment; the Gatekeeper start. Lisa's greeting is a handoff to Lisa's owner.
- Alternatives rejected: a synthesised logo from Web Audio code (consistent
  but outside the artist's sound); a logo cut from a track (ties the ident to
  one song).

## Verification plan

| Step | How | Tool |
| --- | --- | --- |
| Lyrics are verbatim | every quote line found in `whitepaper.sentences.txt` | `check-quotes.mjs`, run before generation |
| Takes are usable | founder listens for garbled names and resemblance to existing songs | ears; ffprobe for duration and loudness |
| Logo meets spec | duration 1.5 to 2.5 s, peak under -1 dBTP, loudness on target | `ffprobe`, `ffmpeg loudnorm` print |
| Listening room renders | list loads, players play after a click, no console errors, no overflow on phone width | Puppeteer shell test, `web-verify` screenshots |
| Live | `curl` the track URL and `index.json` on sable.primecircle.cloud after deploy | curl; the Stop rule: not "done" until observed |

## Outcome, 2026-09-12

- Six tracks generated by the founder on Suno as OG THE MOGI (2:00 to 2:58),
  WAV masters local, MP3s in `audio/` and in the repo.
- Listening room live as its own topic: rail, chip, guide, voice map, Orrery
  links to planets 01, 03, 05, 07, 08, 13, a note glyph on those planets and
  "Hear this section" in their panel. Track pages under `/tracks/<slug>.html`
  built by `sites/sable-peers/build-tracks.mjs`, which re-runs the verbatim
  check at build time and refuses to write if a quote fails.
- Verified: `tests/tracks-test.mjs` and `tests/shell-test.mjs` against the
  live site, zero fails, zero console errors; curl: index.json 200 with six
  rows, MP3 as audio/mpeg with byte ranges, track page 200.
- The sting came back as one continuous 18.8 s piece, not the two-event
  shape. Three candidate cuts in `sonic-logo/out/A|B|C/` (A: a dip then a hit
  at 7.66 s; B: two hits at 6.40 s, closest to seal-then-receipt; C: the final
  hit and ring-out at 16.38 s), all at -16 LUFS, peaks under the ceiling.

## The ident and the covers, 2026-09-12 (later the same day)

- Founder picked cut B. Canonical files in `sonic-logo/`: `sable-ident.mp3`,
  `.ogg`, `sable-ident-web.wav` (-16 LUFS), `sable-ident-video.wav` (-14 LUFS)
  and `sable-ident-video-lead.wav` (300 ms of silence at the head).
- Site: `site/sable-ident.mp3` plus `SABLE_SOUND.ident()` on the sound
  system, so the header's button-sounds switch silences it. It plays on
  Gatekeeper's Play, on a receipt verifying as valid, and on opening the
  letterbox when a letter landed since the visitor's last look (newest letter
  id remembered in localStorage as `sable-mail-seen`; no chime on a first
  visit). Browsers refuse audio before the first tap, so every trigger is a
  click. Shell test checks the function and that the file is served as audio;
  live run green.
- Promo: `2026-09-10-observatory-promo/add-ident.sh` overlays the ident on a
  finished video without re-mixing; `sable-observatory-film-ident.mp4` made.
- Covers: OpenArt had 3 credits and the cheapest image model costs 10, so the
  covers are drawn in code instead: `covers/render-covers.mjs` renders the
  album cover ("Compute You Can Prove", the Orrery with the six lit planets)
  and one cover per track (its planet, number, one orange moon, the hook) at
  3000x3000 with IBM Plex Mono, plus 1500 px JPEGs in `covers/web/` for
  uploads. PNG masters are gitignored (one command regenerates them, same
  pixels). Each track page now shows its cover and uses it as the share image.
  The album title is a proposal; it is one string in the script.

## Open inputs

- Lisa's ElevenLabs prompt does not know the Listening room topic yet
  (Lisa's owner).
- Upload the covers to Suno (per song) and, if the EP goes to a distributor,
  the album cover. Release posts on X with the holder disclosure; the commit.
- An illustrated cover variant needs OpenArt credits; the renderer can take a
  generated image as a background layer if wanted.

## Steps

1. Quote file from the whitepaper (`whitepaper-quotes.md`). Done by a sub-agent.
2. Six track files with lyrics, mood lines and sources. Founder reviews lyrics.
3. Artist base pasted; Style fields completed; `check-quotes.mjs` passes.
4. Suno session, twelve generations, MP3s and URLs into the folder.
5. Sonic logo sting, cut and measured.
6. `build-tracks.mjs`, listening room band, Orrery glyph, tests, deploy, live check.
7. Release posts; state and decisions log updated.
