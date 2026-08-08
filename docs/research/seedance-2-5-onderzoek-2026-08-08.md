# Seedance 2.5 — Research Log (2026-08-08)

Research backing the public masterguide. This file separates **what I verified
myself** from **what I read secondhand**, so the guide can be defended if
challenged publicly.

## Method & limitations (read first)

- **WebFetch was egress-blocked for every domain** in this session (403 on
  CONNECT for `openart.ai`, `seedance2.so`, `morphic.com`, `youtube.com`,
  `reddit.com`, `en.wikipedia.org`, …). Confirmed via
  `curl "$HTTPS_PROXY/__agentproxy/status"`.
- Therefore **no source page, X post, or YouTube video was read directly.**
  All web-sourced claims come from search-engine result summaries. That is
  weaker evidence than reading the page, and is labelled as such throughout.
- **The CDN was also blocked**, so I could not download the videos I generated.
  I verified their *metadata* via the API but **did not watch any of them.**
  No claim about visual quality in this file is mine.
- What I *could* do firsthand: read the live model schema, price real
  configurations, submit real generations, and read back real output metadata.
  That is the tier-1 evidence below.

---

## Tier 1 — Verified firsthand via the live OpenArt API

Model id: `byte-plus-seedance-2-5`. Account plan "Wonder", balance 74,660
credits at session start.

### Schema (from `openart_model_form_get`, modes `text2video` / `element2video`)

| Field | Type | Range / enum | Default |
|---|---|---|---|
| `prompt` | string | **max 30,000 chars** | `""` |
| `duration` | integer | **4–30** | 5 |
| `resolution` | enum | **`480p`, `720p` only** | **`480p`** |
| `aspectRatio` | enum | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9`, `adaptive` | `16:9` |
| `generateAudio` | boolean | — | `true` |
| `seed` | number | `-1` = random | `-1` |
| `videoCount` | integer | 1–4 | 1 |
| `autoEnhancePrompt` | boolean | — | unset |
| `visualReferences` | array | objects of `{type, id, url, label}` | `[]` |

**Findings:**

1. **There is no 4K and no 1080p.** The enum admits `480p` and `720p` only.
   Every "4K & 30s" marketing page is wrong for this surface.
2. **The default is 480p.** Anyone who does not change it is generating at the
   lowest quality without being told.
3. **`visualReferences` carries a `label` field.** This is the API-side
   counterpart of the `@tag` system the guides describe. The label *is* the
   handle you address in the prompt.
4. **Prompt ceiling is 30,000 characters** — far beyond anything the guides
   suggest using.

### Verified output metadata (real generations, read back from the API)

- 480p resolves to **854×480**, **24 fps**, `hasAudio: true`.
- Requested 5s returned **5.056s** actual duration — durations are approximate.
- Container reported as `mov`.

### Measured pricing (OpenArt credits, 2026-08-08)

| Model | Config | Credits | Per second |
|---|---|---|---|
| Seedance 2.5 | 5s / 480p / audio on | 300 | 60.0 |
| Seedance 2.5 | 30s / 480p / audio on | 1,810 | 60.3 |
| Seedance 2.5 | 5s / 720p / audio on | 650 | 130.0 |
| Seedance 2.5 | 30s / 720p / audio on | 3,905 | 130.2 |
| Seedance 2.5 | 5s / 720p / **audio OFF** | **650** | 130.0 |
| Seedance 2.0 | 5s / 720p / audio on | 400 | 80.0 |

**Findings:**

5. **Pricing is linear in duration.** 30s costs almost exactly 6 × 5s. There is
   no bulk discount for long generations and no penalty either — so choose
   length on *creative* grounds, never cost grounds.
6. **Audio is free.** 720p/5s costs 650 credits with audio on *or* off.
   Turning audio off is pure loss — you are paying for it regardless.
7. **720p costs ~2.17× 480p.**
8. **Seedance 2.5 is 62.5% more expensive than 2.0** at identical 5s/720p
   (650 vs 400) — while capping at lower resolution.

### The resolution regression (strongest finding)

9. A **Seedance 2.0** generation in this same account's history
   (`j648kgcqOqhhDsEYq7oL`, 2026-07) returned **3840×2160 — true 4K** at 8.04s.
   Seedance 2.5's schema maxes at 720p. **On this platform, 2.5 is a
   resolution downgrade from 2.0**, costs more per second, and its advantage is
   length and reference budget, not picture quality.

### Behavioural observations

10. Prompts containing `{}`, `<>` and `()` bracket syntax were **accepted
    without error**. This does not prove the brackets *work* — only that they
    are not rejected. Unverified whether they change output.
11. `autoEnhancePrompt: true` does **not** expose the rewritten prompt; the
    stored prompt remains the original. Its effect is unverifiable from the API.

### Spend

10 generations: 4 × 5s/480p (1,200) + 8s/720p (1,040) + 6s/720p (780)
≈ **3,020 credits** of 74,660 (~4%).

---

## Tier 2 — Secondhand (search summaries only, page never read)

Treat as leads, not facts. Flagged where sources conflict.

### The official six-part formula
`Subject + Action/Event + Scene & Environment + Visual Style + Camera Movement/Cut + Audio`
— attributed to ByteDance. (blog.segmind.com, tryonr.com)

### The four-bracket audio/text language
- `()` → music
- `<>` → sound effects
- `{}` → dialogue
- `【】` → subtitles / on-screen text

Reported by seedance.tv and atlascloud.ai. **Not verified.** This is the single
highest-value claim in the guide and it rests on secondhand sourcing.

### Reference `@tag` system
Files get handles `@Image1`, `@Video1`, `@Audio1`. Best-practice claim: rename
to semantic handles (`@lead_character`, `@urban_night_style`,
`@slow_dolly_motion`) and give every reference **one sentence stating its job**.
Budget: 50 refs = 30 images + 10 videos + 10 audio. (glbgpt.com, seedance2pro.io)

### Modes beyond text-to-video
- **Keyframe**: set first + last frame, prompt the motion between.
- **Extend**: continue a clip **forwards or backwards**, or bridge two clips.
- **Smart Edit**: change one element in place without regenerating the shot.
- **Long-video mode (beta)**: up to **180s**, via Dreamina. (runwayml help,
  dreamina.capcut.com)

### Parameter locks (the "quiet" behaviour)
- **Edit mode** locks aspect ratio to the input and duration to input length
  ±0.3s.
- **First-frame mode** locks ratio to the supplied image; duration stays free.

### Reported gotchas
- **Seedance 2.0 prompts do not transfer to 2.5** — 2.0-tuned prompts reportedly
  produce glitchy output.
- 2.5 **resists rapid one-second cuts**; scenes told to breathe do better.
- **More references ≠ better.** Conflicting assets dilute direction.
- Video/audio references work best at **5–10s** even though 30s is allowed.
- **Voice/accent is inferred** from image refs unless named. One report: a
  character got an unrequested British accent; `"American"` fixed it but
  `"American English"` did not. Name a *regional* variety
  ("authentic Los Angeles English") for a specific read.
- Known weak points per ByteDance: physical plausibility in complex motion,
  stability with many interacting subjects.
- 720p output makes an **upscale pass practically mandatory** for finished work.

### Timeline (conflicting)
Announced at Volcano Engine FORCE, **23 June 2026**. Staged rollout via
Dreamina/Doubao. Broad API ~**7 Aug 2026**. Some hands-on content predates the
stated API date — regional staging is the likely explanation, unconfirmed.

---

## Open questions worth resolving before the guide is treated as authoritative

1. **Do the four brackets actually change the audio track?** Requires watching
   two generations that differ only in bracket usage. Blocked here; the founder
   can check in the OpenArt UI in minutes.
2. Does `autoEnhancePrompt` help or hurt? Unverifiable via API.
3. Is seed reproducible? Two identical seed-42 runs were generated
   (`AkZlGzWcYdjHcflFj5Lk`, `8QRtSpVZaOGiCOeIA4x1`) — **compare them visually**
   to settle it.
4. Does 4K exist on *any* surface (Dreamina/Volcano direct), or is it purely
   marketing?

## Test artefacts (for the founder to watch)

| Purpose | historyId |
|---|---|
| Vague prompt, seed 42 | `AkZlGzWcYdjHcflFj5Lk` |
| Same vague prompt, same seed — **determinism check** | `8QRtSpVZaOGiCOeIA4x1` |
| Structured prompt, seed 42 — **structure A/B** | `r1fJlglsSZVCn9laomND` |
| Vague + `autoEnhancePrompt: true` | `2iJWpOuRDL845Whuifjy` |
| Showcase: fisherman, bracket syntax + dialogue | `3tqjEmjavqzWTu6b0LPY` |
| Showcase: espresso macro, vertical 9:16 | `OREUnyKxOvJp0i92h8l2` |
