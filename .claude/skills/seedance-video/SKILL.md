---
name: seedance-video
description: >-
  Produce a video shot with ByteDance's Seedance models (2.0 / 2.5) via the OpenArt
  MCP: pick the right model version for the job, write the shot brief in the model's
  own six-slot grammar, prototype cheap at 480p, lock the seed, then promote to 720p.
  Encodes the firsthand findings from the 2026-08-08 research session, above all the
  moderation trap that silently destroys renders after you have paid for them.
  Use this whenever a video clip is being generated or planned: "make me a video",
  "generate a clip", "AI video", "b-roll", "product video", "ad video", "UGC clip",
  "hero video", "image to video", "animate this image", or any mention of Seedance,
  Seedance 2.5, Seedance 2.0, or byte-plus-seedance. Also use it when reviewing or
  debugging a video prompt that produced drift, morphing, identity loss, or a failed
  generation. NOT for still images (use an image model directly), and not for the
  full scroll-film website lane, which has its own skill (`scroll-film-studio`) —
  though that lane should still follow the version rule in §1 here.
---

# Seedance video shots

Full background and the measured numbers live in
`docs/build/seedance-2-5-best-practices.md`. This skill is the operating procedure.
Read the reference doc when you need the reasoning; follow this file to do the work.

The single most important thing in here is §3. It is the difference between a clip
and a wasted charge.

## 0. Before generating anything

Two questions decide everything downstream, so ask them before touching the API:

1. **Does this need resolution, or duration and control?** That picks the model (§1).
2. **Where will it be watched?** That picks the aspect ratio, and it is not
   recoverable later — the ratio is baked into the generation.

If the user has not said, ask. Guessing the aspect ratio wastes a full render.

Then prepare *before* you generate. Seedance 2.5 in particular pushes work upstream
into pre-production: the reference set, the shot brief, the beats. That is the point
of the model, not an obstacle to it. Generating first and fixing later is the
expensive path.

## 1. Pick the model version — never by version number

**Seedance 2.5 is not an upgrade over 2.0.** It trades picture resolution for
duration, reference control and audio. Picking the higher number gets the wrong
model roughly half the time.

| The job | Use | Why |
|---|---|---|
| Full-bleed background video, hero loops, scroll films | **2.0** | Needs pixels. 2.0 returned 3840×2160; 2.5 was capped at 720p on the same platform |
| A character who must survive more than one shot | **2.5** | 50 references, character sheets, identity locking |
| Dialogue, lip-sync, designed sound | **2.5** | Native synchronised audio |
| One continuous 30s narrative beat (ads, founder clips) | **2.5** | 30s native single take, no stitching |
| High-volume cheap iteration | **2.0** | 400 vs 650 credits at 5s/720p |

Say which you picked and why. If a newer Seedance appears, only prefer it for the
resolution lane if it actually exposes 1080p or better — check the enum, do not
assume.

## 2. Write the shot brief

Seedance publishes a six-slot grammar. Use the order; the model reads it as a
priority stack.

```
Subject → Action / Event → Scene & Environment →
Visual Style → Camera Movement or Cut → Audio
```

Never contradict an earlier slot with a later one. **Contradiction breaks these
prompts, not length** — the ceiling is 30,000 characters, so brevity is a style
choice, not a constraint. A good brief reads like a short shot brief for a crew,
not a search query.

**Camera, always three things in order:** shot size (wide / medium / close-up /
macro), angle (eye-level / low / high / overhead), movement (locked-off / push-in /
dolly / tracking / orbit / crane / handheld / rack focus). Give the move a *reason* —
a push-in that lands on a reaction is direction; a push-in because it looks nice is
drift.

**Delete vibe words.** "Cinematic", "stunning", "beautiful", "photorealistic" are
not instructions the model can act on. Replace with what a camera operator would
execute: rim lighting, shallow depth of field, slow push-in, low tracking shot.

**Write beats, not a paragraph.** 2.5 resists rapid cutting and rewards scenes that
breathe. Give each beat one main change and a visible end state:

```
Timing: 0-5s   hook — establish subject and world
        5-16s  development — the thing starts happening
        16-25s escalation or proof
        25-30s resolution
```

Ten actions in a four-second clip produces morphing. That is an instruction failure,
not a model failure.

## 3. The music rule — non-negotiable

**Never let the model generate music.** Always include in the constraints:

```
no music of any kind, diegetic sound only
```

This was proven on 2026-08-08 with a five-arm controlled experiment, same seed, one
variable at a time:

| Arm | Change | Result |
|---|---|---|
| Original | dialogue + SFX + music | FAILED |
| Repeat | identical resubmission | FAILED |
| C2 | dialogue removed, music kept | FAILED |
| C3 | dialogue kept, **music removed** | **PASSED** |
| D1 | same music asked for in plain prose | FAILED |

Seedance moderates the **finished video**, after inference. The credits are spent
before the rejection fires (`1003: output_moderation_blocked`, "copyright
restrictions"), and platforms often do not refund it. The trigger is the model
generating a score that trips an audio fingerprint matcher. Dialogue is innocent.
The block is deterministic, so retrying is pure waste, and rephrasing does not help
because the model reads the *intent* to have music, not the wording.

Lay music in during the edit, where the licence is yours. Better mix, no rejections.

If a generation fails with `output_moderation_blocked` and the prompt had no music,
suspect a reference image or a recognisable likeness next — and say so plainly
rather than silently retrying.

## 4. References — one job each

2.5 accepts 50 references (30 images, 10 videos, 10 audio). **50 is a ceiling, not a
target.** Past a point extra references dilute the strong features and add noise.

Three rules carry almost all the value:

1. **Name handles by role**, not index: `@lead_character`, `@urban_night_style`,
   `@slow_dolly_motion`. On the OpenArt API this is the `label` field on each
   reference object.
2. **State each reference's single job in a sentence.**
   `@urban_night_style provides the colour palette and lighting, not the subject.`
3. **Never let two assets define the same property.** Two references both claiming
   "the style" is the most reliable way to get mush.

**Division of labour is the whole idea:** identity, wardrobe, props, location and
camera should each have a clear source instead of competing inside one paragraph of
prose.

Two techniques worth reaching for:

- **Character sheet, not hero shot.** For a character across multiple shots, build a
  reference sheet (multiple angles, close-ups, clothing, proportions) and feed the
  sheet. The model juggles holding a face against delivering motion, and when forced
  to choose it picks motion — that is where drift comes from.
- **Depth map for motion transfer.** Handing over source footage makes the model
  interpret the person, clothes, lighting and room *as well as* the movement. A depth
  map leaves nothing to interpret but motion and geometry, and it replaces paragraphs
  of camera description.

## 5. Generate: cheap first

Costs are linear per second, so duration is a story decision, never a budget one.
Resolution is the budget decision: **720p costs 2.17× 480p**.

1. **Prototype at 480p.** Iterate the brief here.
2. **One variable per generation.** Change one thing, regenerate, compare.
3. **Lock the seed** (`seed` to a fixed integer, not `-1`) once a take is close, so
   your next change is the only difference.
4. **Promote to 720p** only when composition and motion are settled.
5. **Keep `generateAudio: true` throughout** — it costs nothing extra, so switching
   it off is pure loss.
6. **Smoke-test anything borderline at 4s/480p** before a 30s/720p commit. That is a
   16× cheaper failure.

OpenArt MCP specifics: model `byte-plus-seedance-2-5` (or `byte-plus-seedance-2`),
modes `text2video` / `image2video` / `element2video`. Call `openart_model_form_get`
for the exact schema before generating — the enums do change. Note the default
resolution is **480p**, which is right for prototyping and wrong for delivery.

Renders normally take 2–3 minutes but were observed exceeding 20 minutes under load.
Never put a live deadline behind a render, and do not assume a slow job has failed.

## 6. Verify by looking — or say that you did not

This is where a video task most often goes quietly wrong.

**You frequently cannot see the output.** In several environments the CDN is blocked,
so the API returns metadata and nothing watchable. Metadata confirms resolution, fps,
duration and whether audio exists. It says nothing about whether the shot is any
good.

So:

- Check the returned metadata against what was asked for (dimensions, duration, fps,
  `hasAudio`). A mismatch is a real finding.
- **Surface the clip to the human and ask them to watch it.** Use the result card or
  send the file. Their eyes are the verification step.
- **Never describe the content of a video you have not watched.** Do not say "the
  lighting came out beautifully" from metadata. Report what you actually verified and
  name the rest as unverified.

Judging whether a shot is *good* requires taste, which means this skill augments the
human rather than replacing them. Design the loop that way: you handle version
choice, grammar, cost discipline and the failure modes; they judge the picture.

## 7. When something goes wrong

| Symptom | First move |
|---|---|
| `output_moderation_blocked` | Remove any music request (§3). Then suspect references or likenesses. Do not retry unchanged — the block is deterministic |
| Identity drifts across shots | Character sheet instead of hero shot; anchor on immutable features ("tattoo on left cheek"); stabilise face and outfit before adding camera moves |
| Motion morphs / chaotic | Too many actions for the duration. Cut to one main change per beat |
| Transferred motion drifts | Use a depth map instead of source footage |
| Result ignores the camera | Camera direction is missing or contradicted by a later slot. Check for two instructions fighting |
| Output looks soft | You are probably at the 480p default. Promote to 720p, then budget an upscale pass |
| Keyframe shot warps | Keyframes mismatch in aspect ratio or resolution, or the transition is too large (close-up → wide aerial in 5s) |

## Gotchas

Keep this list growing. Every correction or round of back-and-forth belongs here at
the moment it happens, so the same mistake is not made twice.

- **Never generate music.** The single most expensive mistake available. See §3.
- **Audit every beat against the constraint you just wrote.** The model does not
  sanity-check physical possibility — it will animate the impossible thing and the
  result looks broken. A prompt that established "both hands are occupied" and then
  asked the subject to put a torch back in his mouth produced a torch floating back
  by itself. Before generating, walk each beat and ask: with what the character is
  holding, can they actually do this? Prefer hands-free props (a head torch, not a
  torch in the teeth) so the question does not arise.
- **Do not write a shot around a known weak spot and hope.** Cloth under force,
  wind, liquids, glass and transparency are where this model visibly breaks. A batch
  of seven shots lost exactly the three that fought a weakness: flapping membrane in
  wind, a large pane of glass, and a face hidden behind the subject's own raised
  arms. Redesign the action instead of adding more constraints — pressing lead flat
  beats holding a sheet in the wind, and it reads the same to a viewer.
- **Keep the face clear at the emotional beat.** If the shot's payoff is an
  expression, check nothing occludes it: raised arms, an open cabinet door, a low
  angle. Arms above the head inside a boiler hides the very thing the shot is for.
- **Naming a prop in the sound slot puts it on screen.** "A spanner nudged on the
  counter" was written as ambience and came back as a visible spanner that then slid
  toward the subject's phone. The model does not separate what you can hear from what
  it should render. Only name objects you actually want in frame, in any slot.
- **The model does not know the trade.** It renders work that looks plausible to a
  layman and wrong to a professional — lead flashing laid *over* roof tiles instead
  of into the join, for example. That is fatal when the audience *is* the trade,
  because being mocked by your own market is worse than not posting. So do not depict
  skilled technique. Show the subject **holding something heavy or precarious**, or
  put the technical work out of frame (arms inside a cabinet). In a batch of eight
  trades shots, every survivor was a simple hold or hidden work, and every failure
  showed visible craft.
- **Never pick Seedance by version number.** 2.5 is lower resolution than 2.0. The
  `scroll-film-studio` skill previously said "use the newest Seedance available" and
  that instruction was wrong for its own lane; it has been corrected.
- **The default resolution is 480p.** Anyone who does not change it ships the lowest
  quality the model offers.
- **Output is 24fps.** Conform deliberately when cutting into a 30 or 60fps timeline.
- **Requested duration is approximate.** Asking for 5s returned 5.056s.
- **`autoEnhancePrompt` is opaque.** It does not expose the rewritten prompt, so its
  effect cannot be audited. Leave it off when you need a controlled comparison.
- **The four-bracket audio syntax is unconfirmed.** `()` music, `<>` SFX, `{}`
  dialogue, `【】` subtitles is widely repeated, but a controlled probe found plain
  prose behaved identically. Treat it as a way to organise a prompt, not a documented
  routing mechanism, and do not present it to anyone as fact.
- **Name the accent, not the language.** "Authentic Los Angeles English" beats
  "English". Voice is otherwise inferred from image references, confidently and often
  wrongly.
- **Never use a selfie as a face reference.** A selfie is a wide lens at arm's
  length, so it distorts the subject — nose enlarged, ears narrowed, face rounded.
  The model treats that distortion as the person's actual face and reproduces it, and
  the result lands in the uncanny valley of *almost* them. Ask for photos taken on the
  rear camera from roughly 2 metres, and take three (straight-on, three-quarter,
  profile) from one session in the same lighting and clothes.
- **A real person's face survives badly in a hostile shot.** Low angles, partial
  occlusion, water or dirt on the face, and upside-down framing all break identity no
  matter how good the references are. If someone specifically needs to be
  recognisable, the shot has to be rewritten so they are upright and lit, not just
  better referenced.
- **Ask whether a recognisable face helps the piece before adding one.** Relatable
  "this is you" content works because the viewer identifies with an anonymous
  subject; a known face converts it into an advertisement and the identification
  breaks. A founder's face earns its place in a piece to camera, not in a mirror.
- **Aspect ratio cannot be fixed after the fact.** Confirm it before generating.
- **Edit mode locks aspect ratio to the input and duration to ±0.3s of it;
  first-frame mode locks the ratio but leaves duration free.** That is why settings
  grey out.
- **Credit prices are per platform.** The numbers here are OpenArt's. The ratios
  (linear duration, free audio, 2.17× for 720p) are the portable part.
