# Seedance 2.5 — Best Practices (library knowledge)

Durable operating knowledge for ByteDance's Seedance video models. Written
2026-08-08. Companion files:

- `docs/research/seedance-2-5-onderzoek-2026-08-08.md` — the firsthand test log
  (what was measured against a live endpoint, and what was not)
- `docs/marketing-agent/seedance-2-5-masterguide.md` — the public-facing guide

**Evidence grading used throughout.** `[MEASURED]` = verified firsthand on
OpenArt's Seedance 2.5 endpoint on 2026-08-08. `[REPORTED]` = consistent across
published sources but not independently confirmed. Most of this file is
`[REPORTED]`; the numbers are the part that was measured.

---

## 0. Which Seedance version to use (read this first)

The important thing is that **2.5 is not a straight upgrade**. It trades picture
resolution for duration, reference control and audio. Picking by version number
gets you the wrong model about half the time.

| Job | Use | Why |
|---|---|---|
| Full-bleed website background video, scroll films, hero loops | **2.0** | Needs resolution. 2.0 returned 3840×2160 on our account `[MEASURED]`; 2.5 capped at 720p on the same platform `[MEASURED]` |
| A character who must survive more than one shot | **2.5** | 50 references, character sheets, identity locking |
| Anything with dialogue, lip-sync or designed sound | **2.5** | Native synchronised audio, 10+ languages |
| One continuous 30s narrative beat (ads, founder clips) | **2.5** | 30s native single take, no stitching |
| High-volume cheap iteration | **2.0** | 400 vs 650 credits at 5s/720p `[MEASURED]` |

**Standing rule: never pick "the newest Seedance" by default.** Pick by whether
the job needs *pixels* or *duration and control*. This directly contradicts the
"use the newest available" instruction that was in
`.claude/skills/scroll-film-studio/SKILL.md`, which is why that line was
corrected.

---

## 1. The economics that drive workflow

`[MEASURED]`, OpenArt credits, 2026-08-08. Credits are a platform currency; the
**ratios** are the portable part.

| Config | Credits | Per second |
|---|---:|---:|
| 5s / 480p | 300 | 60.0 |
| 30s / 480p | 1,810 | 60.3 |
| 5s / 720p | 650 | 130.0 |
| 30s / 720p | 3,905 | 130.2 |
| 5s / 720p, audio OFF | 650 | 130.0 |
| **2.0** 5s / 720p | 400 | 80.0 |

Three operating consequences:

1. **Pricing is linear in duration.** 30s costs exactly six 5s clips. Choose
   duration on story grounds only; cost is never the argument.
2. **Audio is free.** Identical price with audio on or off. Leaving it off is
   pure loss.
3. **720p is 2.17× 480p.** So: prototype at 480p, finish at 720p. Never iterate
   a prompt at full resolution.

---

## 2. Prompt structure

The official six-slot order `[REPORTED]`:

```
Subject → Action / Event → Scene & Environment →
Visual Style → Camera Movement or Cut → Audio
```

The model reads this as a priority stack. Put what matters most earliest, and
**never contradict an earlier slot with a later one.** Contradiction, not
length, is what breaks these prompts — the prompt ceiling is 30,000 characters
`[MEASURED]`, so brevity is a style choice, not a constraint.

A good prompt reads like **a short shot brief**, not a search query: the subject
described concretely, the performance across the full take, the ambience with
setting and lighting.

### Write for a take, not a frame

2.0 rewarded dense, cut-heavy prompts. **2.5 punishes them** `[REPORTED]`.
2.0-tuned prompts reportedly produce glitchy output on 2.5, and the model
resists rapid one-second-cut styles. Scenes told to breathe do better.

Divide the take into consecutive beats. Each beat gets **one main change and a
visible end state**:

```
0-5s   hook — establish subject and world
5-16s  development — the thing starts happening
16-25s escalation or proof
25-30s resolution — land it
```

Ten actions in a four-second clip produces chaotic morphing. That is an
instruction failure, not a model failure.

### Vocabulary that works

**Camera — specify three things, in order:** shot size (wide / medium /
close-up / macro), angle (eye-level / low / high / overhead / dutch), movement
(locked-off / dolly-in / push-in / pull-back / pan / tracking / orbit / crane /
handheld / FPV / rack focus).

**Lighting carries the emotional tone** and is worth spelling out: "golden hour
backlight", "soft overcast daylight", "moody neon from the left", "high-key
studio".

**Style, stated as a look:** "cinematic, shallow depth of field, 35mm film
grain", "clean commercial product look", "documentary handheld", "anime
cel-shaded".

**Dead weight to delete:** "photorealistic", "stunning", "beautiful",
"cinematic" on its own. They are vibe words the model cannot act on. Replace
with things a camera operator could execute: rim lighting, shallow depth of
field, slow push-in, low tracking shot.

Every camera move should have a **reason**. A push-in that lands on a reaction
is direction; a push-in because push-ins look nice is drift.

### Constraints

Use negative constraints **sparingly** `[REPORTED]`. The useful pattern is
*immutable details + what must not appear*:

```
Constraints: one continuous shot, no cuts, no on-screen text, no watermark,
no readable brand marks, no dramatic weather change, no music of any kind.
```

Avoid conflicting camera instructions and stacked adjectives; those cause more
failures than missing detail does.

---

## 3. References: the actual skill

2.5 accepts **50 references**: 30 images, 10 videos, 10 audio `[REPORTED]`. Each
gets a handle (`@Image1`, `@Video1`, `@Audio1`). On API surfaces this is the
`label` field on the reference object `[MEASURED]`.

**Three rules that matter more than the count:**

1. **Rename handles to roles.** `@lead_character`, `@urban_night_style`,
   `@slow_dolly_motion` — not `@Image1`.
2. **One job per reference, stated in a sentence.**
   `@urban_night_style provides the colour palette and lighting, not the subject.`
   Never let two assets define the same property; two references both claiming
   "the style" is the most reliable way to get mush.
3. **Do not fill the budget.** 50 is a ceiling, not a target. Past a point,
   extra references *dilute* strong features and add noise. Video and audio
   references work best at **5–10 seconds** even though 30s is allowed.

### Division of labour

The recurring expert observation: **identity, wardrobe, props, location and
camera should each have a clear source**, instead of competing inside one
paragraph of prose. If all five are fighting in your prompt text, you are
running a 2026 model on a 2024 workflow.

### The depth map technique

The highest-leverage trick found, and still rare `[REPORTED]`. To transfer a
motion, do not hand the model source footage — it will try to interpret the
person, the clothes, the lighting, the room, *and* the movement. Hand it a
**depth map** and there is nothing left to interpret but motion and geometry.

Workflow: build the storyboard in an image model → convert to a depth map →
feed three references with one job each (depth map = composition/camera/motion,
style ref = tone/palette, character sheet = identity).

A depth map also **replaces paragraphs of camera direction**. Fewer words, less
contradiction, less drift.

### Multi-keyframe storyboards

```
Use @Image 1 through @Image 5 as keyframes in this order.
@Image 1 — she stands at the door, hand on the frame.
```

Upload frames **individually**; separate images align better than a collaged
contact sheet. Keyframes control stage *order*, not literal frame reproduction.

---

## 4. Character consistency (stopping identity drift)

The underlying cause `[REPORTED]`: the model is doing two jobs at once, holding
a recognisable face and delivering believable motion. **When forced to choose,
it picks motion.** That is where drift enters.

Counter-measures, in order of effect:

1. **Use a character sheet, not a hero shot.** Generate the character once, then
   build a reference sheet: multiple angles, close-ups, clothing, accessories,
   textures, proportions. Feed the *sheet*.
2. **Three stills maximum**, from the same session and same lighting: one
   straight-on, one three-quarter, one profile. More angles help up to a point,
   then extra images mean more variation, not less.
3. **Anchor on a few immutable features.** "Tattoo on left cheek", "silver hair
   with a blue streak". Concrete anchors hold; "a woman" drifts.
4. **Simplify the subject description.** Fewer details mean less room for
   interpretive drift.
5. **Stabilise before you complicate.** Lock face and outfit first, then add
   camera moves and secondary objects. Drift spikes when one hero character is
   mixed with several environment and style changes at once.
6. **Lock the seed** once a take is nearly right, then change one thing at a
   time `[MEASURED]` — seeds are settable, `-1` means random.

---

## 5. Image-to-video and keyframe mode

**If drift is your main problem, image-to-video is usually the better first
move** than text-to-video `[REPORTED]`. You are handing the model the answer
instead of asking it to invent one.

- Upload one image to lock the first frame, or two to lock first *and* last,
  then prompt the motion between.
- **Match aspect ratio and resolution between keyframes.** Mismatched dimensions
  force a crop or stretch, which shows up as drift.
- **Keep lighting and colour consistent** across keyframes.
- **Do not ask for too big a transition.** Tight close-up to wide aerial in 5
  seconds asks the model to invent too much and invites warping.

### Parameter locks (why settings grey out)

- **Edit mode** locks aspect ratio to the input, and duration to the input
  length ±0.3s.
- **First-frame mode** locks aspect ratio to your image; duration stays free.

---

## 6. Audio

Audio is co-generated with the picture, so **shape it in the prompt** rather
than adding it afterwards — with one large exception (§7).

- **Name the soundscape**: "gentle café ambience", not "good audio".
- **Match audio to action**: describe actions clearly and the synchronised audio
  tends to track them.
- **Name the regional variety, not the language.** "Authentic Los Angeles
  English" beats "English". A reported case: a character kept getting an
  unrequested British accent; `"American"` fixed it and `"American English"` did
  not.
- **Voice is inferred from image references** unless you override it. The model
  guesses what a face sounds like, and is often wrong and always confident.
- **Keep dialogue lines short.** Lip-sync is good enough that a short line lands
  and a long one exposes it.

---

## 7. The moderation trap (highest-value operational rule)

`[MEASURED]` — this one was proven with a five-arm controlled experiment, same
seed, one variable at a time.

Seedance runs **three moderation stages**: prompt text, uploaded reference
images, and **the finished video**. The third fires *after* inference, so GPU
time is spent and **credits are charged before the rejection**. Several
platforms do not refund it.

| Arm | Change | Result |
|---|---|---|
| Original | dialogue + SFX + music | FAILED |
| C1 | exact resubmission | FAILED |
| C2 | dialogue removed, music kept | FAILED |
| C3 | dialogue kept, **music removed** | **PASSED** |
| D1 | same music request in **plain prose** | FAILED |

Conclusions:

- The block is **deterministic**. You cannot retry your way past it.
- **Dialogue is innocent.**
- **Prompt-requested music is the trigger.** The model generates a score, an
  audio fingerprint matcher compares it against copyrighted material, and a
  match destroys the finished video.
- **It is not a syntax problem.** Requesting music in plain prose failed too.
  The model reads the *intent*, not the phrasing. You cannot rewrite around it.

Context: Hollywood studios formally accused ByteDance of enabling mass copyright
infringement in February 2026; controls were tightened afterwards.

**Standing rules:**

1. Always write `no music of any kind, diegetic sound only`. Lay music in during
   the edit, where the licence is yours. Cleaner mix *and* no rejected renders.
2. **Smoke-test borderline concepts at 4s/480p (240 credits)** before committing
   to 30s/720p (3,905 credits).

---

## 8. Known weaknesses — design around them

- **Physical plausibility in complex motion.** Collisions, cloth, liquids under
  force. This is where it breaks.
- **Many interacting subjects.** Two people talking is fine; a crowd is a gamble.
- **Fast action morphs.** Decoherence in rapid sequences persists.
- **Latency.** Normal is 2–3 minutes; 8s/720p jobs exceeded **20 minutes** on the
  day the API went wide `[MEASURED]`. Never put a live deadline behind a render.
- **720p ceiling** on the surfaces we tested makes an **upscale pass part of the
  pipeline**, not a nice-to-have. Budget it.

**The shot this model wins at:** one clear subject, doing one clear thing, with a
camera move that has a reason.

---

## 9. The working loop

1. Prepare *before* generating: goals, storyboard, character sheet, audio
   references, camera direction, aspect ratio, duration. 2.5 pushes work
   upstream into pre-production; that is the point of it.
2. Prototype at **480p**.
3. Give each generation **one primary goal**. Generate → analyse → change one
   thing → repeat.
4. **Lock the seed** once close.
5. Promote to **720p** only when composition and motion are settled.
6. Prefer **Extend** and **Smart Edit** over regenerating. A take you like is
   expensive to rediscover. Extend runs *backwards* as well as forwards, which
   is the underused half.
7. **Upscale** as a separate pass.
8. Keep audio on throughout; keep music out of the generation.

---

## 10. Where this is wired into our own tooling

Four skills already depend on Seedance and should follow §0 rather than
defaulting to the newest version:

- `.claude/skills/scroll-film-studio/` — needs **resolution**, so it should stay
  on 2.0. Its "use the newest Seedance available" line was corrected to point
  here.
- `.claude/skills/scroll-world/` — same reasoning, full-bleed scroll footage.
- `.claude/skills/ad-batch/` — uses `byte-plus-seedance-2` for ad video. 2.5 is
  a genuine candidate here (30s beat + native audio suit ads), but only with
  the music rule from §7 applied, since ad music is exactly what trips it.

**Gotcha to carry into any skill that generates video: never let the model
generate music.**
