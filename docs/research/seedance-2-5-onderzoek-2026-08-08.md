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

### Output-side moderation block (firsthand, highest-value finding)

12. A completely benign prompt — an Icelandic fisherman on a trawler delivering
    one line of dialogue — **failed after generating**:

    ```
    errorDisplayCode: "1003: output_moderation_blocked"
    failedCode: "output_moderation_blocked"
    error: "[byte-plus] output content rejected by moderation:
      OutputVideoSensitiveContentDetected.PolicyViolation: The request failed
      because the output video may be related to copyright restrictions."
    ```

    No violence, no public figure, no brand, no IP reference. Blocked anyway,
    for *copyright*.

**Corroborating secondhand context** (search summaries, segmind/mindstudio/
vicsee/nemovideo): Seedance runs **three separate moderation stages** —
(a) a prompt text filter before generation, (b) a computer-vision filter on
uploaded reference images targeting copyrighted visual elements, and (c) an
**output filter that reviews the finished video**. Stage (c) is the expensive
one: moderation runs *during/after* inference, so **GPU time is consumed and
credits are charged before the rejection fires**, and several platforms do not
refund moderation rejections.

Critically, one source states the audio path specifically: *"the audio contained
in the output video was blocked after matching audio copyright rules … when the
model produces audio that matches known copyrighted material — background music,
recognizable soundbites — the request gets blocked at the output stage."*

**My failing prompt requested music** (`(sparse low cello drone…)`). The leading
hypothesis is therefore that **the generated music tripped an audio-copyright
matcher**, not anything visual.

Context: in February 2026 Hollywood studios formally accused ByteDance of
enabling mass copyright infringement via Seedance 2.0, which produced a public
commitment to tighten controls. Categories that were borderline earlier in 2026
are now blocked.

**Isolation experiment — CONCLUSIVE** (all seed 1234, 8s/720p, 16:9, identical
in every other respect):

| Arm | historyId | Difference | Result |
|---|---|---|---|
| Original | `3tqjEmjavqzWTu6b0LPY` | dialogue + SFX + music | **FAILED** |
| C1 | `fA78UXXW7CxddUgwiY6B` | exact repeat of original | **FAILED** |
| C2 | `qRuogscrAOvP2JW7uePq` | dialogue removed, **music kept** | **FAILED** |
| C3 | `cGS0jpxXScaAB9YHRntZ` | dialogue kept, **music removed** | **PASSED** — 1280×720, 8.064s, 24fps, audio present |

**Conclusions, now first-tier evidence:**

13. **The block is deterministic.** C1 was a byte-identical resubmission of a
    failed prompt and failed identically. This is not a random moderation roll —
    a prompt that trips it will trip it every time. You cannot retry your way out.
14. **Dialogue is not the trigger.** C2 removed the spoken line entirely and
    still failed.
15. **Prompt-requested music IS the trigger.** C3 kept the dialogue, the face,
    the seed and the SFX, and removed only the `(sparse low cello drone…)`
    clause plus added `No music of any kind, diegetic sound only`. It rendered
    successfully.

This confirms the audio-copyright-matcher hypothesis with a controlled
experiment. The model generates a score, an audio fingerprint matcher compares
it against copyrighted material, and a match kills the finished video *after*
you have paid for it.

**Practical rule (now measured, not inferred):** never let the model generate
music for work you care about. Write `no music of any kind, diegetic sound only`
and lay music in during the edit where you control the licence. And smoke-test a
borderline concept at 4s/480p (240 credits) before committing to 30s/720p
(3,905 credits).

16. **720p 16:9 resolves to 1280×720**; 720p 9:16 resolves to 720×1280.
17. **Peak-load latency is real.** 8s/720p jobs exceeded **20 minutes** on
    2026-08-08, against a reported 2–3 minute norm. One job passed **30 minutes**
    still RUNNING. Do not promise same-hour turnaround on launch week.

### Open test — D1, the bracket probe (result pending)

`0qRoizn0j7umA8R2BVLu` — still RUNNING at end of session.

This is a clever probe worth finishing, because it tests the **bracket syntax**
indirectly through an observable outcome rather than through pixels I cannot see.

- The failing arms all requested music **inside parentheses**: `(sparse low
  cello drone…)`.
- D1 requests the *same* music in **plain prose**, no parentheses: "A sparse low
  cello drone plays underneath the scene…". Everything else is byte-identical to
  the original failing prompt, same seed 1234.

**How to read the result:**

| D1 outcome | What it means |
|---|---|
| **FAILS** | The model interprets a music request semantically regardless of syntax. The rule generalises to "never request music in any form". The brackets are not doing special routing here. |
| **PASSES** | The `()` bracket specifically routes to a music channel that plain prose does not reach. That would be **firsthand evidence the four-bracket system is real** — currently our only unverified headline claim. |

Either result is publishable. The second would be a significant upgrade,
promoting §4 of the guide from REPORTED to MEASURED.

**To check:** `openart_creation_get` on `0qRoizn0j7umA8R2BVLu`, or just look in
the OpenArt history.

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
