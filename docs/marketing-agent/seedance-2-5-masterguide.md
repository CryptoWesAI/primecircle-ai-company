# The Seedance 2.5 Masterguide

*Everything ByteDance shipped, what the marketing pages get wrong, and the
prompt grammar almost nobody is using. Researched 8 August 2026.*

---

## 0. The 60-second version

Seedance 2.5 is ByteDance's video model, announced at Volcano Engine FORCE on
23 June 2026 and broadly available via API from early August.

It is **not** a straight upgrade over Seedance 2.0. It trades picture
resolution for **duration, reference control, and audio**. If you know that
going in, you will use it correctly. If you don't, you will produce worse video
than you did last month and blame yourself.

**What it actually buys you**
- One continuous **30-second** take (no stitching), with a beta long mode to 180s
- **50 reference inputs**: 30 images + 10 videos + 10 audio clips
- **Native synchronised audio** — dialogue, SFX, music, lip-sync, 10+ languages
- A real **prompt grammar**: slot order, `@tags`, and four bracket types

**What it costs you**
- Resolution. See §1. This is the thing nobody puts in the headline.

---

## 1. The resolution lie

Every "Seedance 2.5 — 4K & 30s" landing page is selling you a spec that does
not exist on the surfaces you can actually use.

I pulled the live schema from a production Seedance 2.5 endpoint. The
`resolution` field is an enum. It contains exactly two values:

```
"resolution": { "enum": ["480p", "720p"], "default": "480p" }
```

No 1080p. No 4K. And the **default is 480p** — so every person who hasn't
touched that dropdown has been generating at the lowest setting available.

It gets sharper. I checked an older **Seedance 2.0** job on the same account.
It returned **3840×2160** — genuine 4K.

> **Seedance 2.5 outputs at lower resolution than Seedance 2.0, and costs 62.5%
> more per second to do it.**

That is not a scandal, it's a trade — you are buying length and control, not
pixels. But you should know you're making it. Runway's own help docs reportedly
tell users to switch to Seedance 2.0 when they need 1080p, which tells you
ByteDance knows exactly what this model is for.

**Practical rule:** generate at 720p, always. Then run a separate upscale pass.
Budget for that pass — it is not optional for client work.

---

## 2. Real numbers, measured — not estimated

Every pricing figure you'll find in a blog post is an estimate. These are
measured against a live endpoint on 8 August 2026, in OpenArt credits:

| Config | Credits | Per second |
|---|---:|---:|
| 5s / 480p | 300 | 60.0 |
| 30s / 480p | 1,810 | 60.3 |
| 5s / 720p | 650 | 130.0 |
| 30s / 720p | 3,905 | 130.2 |
| 5s / 720p, **audio off** | **650** | 130.0 |
| *Seedance 2.0*, 5s / 720p | 400 | 80.0 |

Three things fall out of this table that change how you work:

**Pricing is perfectly linear.** A 30-second generation costs the same as six
5-second generations. There is no volume discount and no long-clip penalty.
So choose your duration for *story* reasons only. Cost is not an argument.

**Audio is free.** 720p/5s costs 650 credits whether audio is on or off. If you
have been disabling audio to save money, you have been saving nothing and
throwing away the model's best feature. Leave it on. Always.

**720p is 2.17× the price of 480p.** Worth it. Prototype at 480p, final at 720p.

---

## 3. The official six-part formula

ByteDance published an actual grammar for this model. Six slots, in this order:

```
Subject  →  Action / Event  →  Scene & Environment  →
Visual Style  →  Camera Movement or Cut  →  Audio
```

Most people write slot 1 and slot 3 and wonder why the camera does nothing.

The order matters because the model reads it as a priority stack. Put the thing
you care most about earliest, and never contradict an earlier slot with a later
one.

---

## 4. The four brackets — the part almost nobody uses

This is the piece of Seedance 2.5 that separates people who read the docs from
people who read the hype. The model routes different bracket types to different
output channels:

| Bracket | Routes to |
|---|---|
| `( )` | **Music** |
| `< >` | **Sound effects** |
| `{ }` | **Dialogue** |
| `【 】` | **Subtitles / on-screen text** |

So instead of writing a mushy sentence about "cinematic ambient audio", you
write:

```
<heavy swell slapping the steel hull, wind buffeting the mic, distant gulls>
(sparse low cello drone, single sustained note, no melody)
{The sea does not care what you planned today.}
```

Three channels, separately addressed, no ambiguity about which is which.

**Caveat, stated honestly:** I verified that prompts using these brackets are
accepted without error. I could not verify that they change the output, because
the environment I researched from could not download the rendered videos. This
is the highest-value claim in this guide and it deserves your own 10-minute
A/B test before you build a workflow on it.

---

## 5. Audio and voice — the accent trap

Native audio is the reason to use this model. Two rules:

**Rule 1: name the regional variety, not the language.**
"English" gets you a neutral read. "Authentic Los Angeles English" gets you a
performance. There is a widely-reported case where a character kept receiving an
unrequested British accent — `"American"` fixed it, and `"American English"` did
**not**. The model is more sensitive to *how* you name the variety than seems
reasonable. Test it.

**Rule 2: voice is inferred from your image references unless you override it.**
If you supply a character reference and say nothing about voice, the model
guesses what that face sounds like. It is often wrong and always confident.

The working pattern for a spoken line:

```
Dialogue language: [language + regional variety].
The [character] says, [delivery direction]: {the actual line}
```

Keep lines **short**. Lip-sync accuracy degrades with length, and 2.5's lip-sync
is good enough that a short line lands and a long one exposes it.

---

## 6. The `@tag` reference system

Seedance 2.5 takes **50 references**: 30 images, 10 videos, 10 audio clips.
Each uploaded file gets a handle — `@Image1`, `@Video1`, `@Audio1`.

Two upgrades over how most people use this:

**Rename your handles semantically.** `@Image1` tells the model nothing.
`@lead_character`, `@urban_night_style`, `@slow_dolly_motion`, `@dramatic_voice`
tell it a *role*. (On API surfaces this is the `label` field on each reference
object — the label is the handle.)

**Give every reference exactly one job, in a sentence.**

```
@lead_character provides Nia's face, hairstyle and jacket only.
@urban_night_style provides the colour palette and lighting, not the subject.
@slow_dolly_motion provides the camera path and pacing, not the content.
@dramatic_voice provides Nia's speaking voice.
```

Never let two assets define the same property. Two references both claiming
"the style" is the most common way to get mush.

**And do not fill the budget.** 50 is a ceiling, not a target. Multiple sources
report that past a certain point extra references *dilute* the strong features
and add noise. Conflicting assets weaken direction rather than strengthening it.
Video and audio references reportedly work best at **5–10 seconds**, even though
30s is permitted.

---

## 7. Write for a take, not a frame

Seedance 2.0 rewarded dense, punchy, cut-heavy prompts. Seedance 2.5 punishes
them. Reported consistently: **2.0-tuned prompts produce glitchy output on 2.5**,
and the model resists rapid one-second-cut styles. Scenes told to *breathe*
do better.

Because you have 30 seconds of coherent take, describe **evolution over time**,
not a frozen moment. Structure it as beats:

```
Timing: 0-5s   hook — establish subject and world
        5-16s  development — the thing starts happening
        16-25s escalation or proof
        25-30s resolution — land it
```

You can anchor beats explicitly in the prompt ("slow push-in over the first ten
seconds", "a hand enters at the midpoint") and the model honours them.

If you write ten actions into a four-second clip, you get chaotic morphing.
That is not a model failure, it is an instruction failure.

---

## 8. The modes people don't know exist

Text-to-video is the least interesting thing this model does.

- **Keyframe** — supply a first frame *and* a last frame, prompt the motion
  between them. This is how you get a shot to end exactly where you need it.
- **Extend** — continue an existing clip **forwards or backwards**. Backward
  extension is the underused one: generate the moment *before* a shot you
  already like. It also bridges two existing clips.
- **Smart Edit** — change one element in place without regenerating the shot.
  This is how you keep a take you love and fix the one thing that's wrong.
- **Long-video mode (beta)** — up to **180 seconds**, currently via Dreamina.

**The quiet gotcha — parameters lock themselves by mode:**
- **Edit mode** locks aspect ratio to the input, and duration to the input
  length ±0.3s.
- **First-frame mode** locks aspect ratio to your supplied image, but leaves
  duration free.

If a setting is greyed out and you don't know why, this is why.

---

## 9. Hard specs, from the live schema

| Parameter | Value |
|---|---|
| Prompt length | **up to 30,000 characters** |
| Duration | 4–30s (integer), beta long mode to 180s |
| Resolution | `480p`, `720p` — default `480p` |
| 480p resolves to | 854×480 |
| Frame rate | **24 fps** |
| Aspect ratios | 16:9, 4:3, 1:1, 3:4, 9:16, 21:9, adaptive |
| Audio | on by default, no extra cost |
| Seed | `-1` for random; set it to reproduce |
| Outputs per job | 1–4 |
| References | 30 images + 10 videos + 10 audio = 50 |

Note the prompt ceiling: **30,000 characters**. Every guide telling you to keep
prompts short is giving you a style opinion, not a technical limit. A 30-second
multi-beat shot with four labelled references and three audio channels justifies
a long brief. Length is not the enemy — *contradiction* is.

Also note **24fps**. If you are cutting Seedance output into 30fps or 60fps
timeline, conform it deliberately rather than letting your NLE guess.

---

## 10. Known weaknesses — plan around these

Straight from ByteDance's own stated limitations plus consistent creator reports:

- **Physical plausibility in complex motion.** Anything with real physics —
  collisions, cloth, liquids under force — is where it breaks.
- **Many interacting subjects.** Stability degrades as subject count rises.
  Crowds are a risk; two people talking is fine.
- **Fast action morphs.** Decoherence in rapid sequences persists.
- **720p ceiling** — upscaling is part of the pipeline, not a nice-to-have.
- **Generation stalls.** 10+ minute waits during peak load are reported;
  normal is 2–3 minutes.
- **"Generation failed"** usually means a content-policy trip or a genuinely
  ambiguous instruction, not a bug.

**Design rule:** give it *one* clear subject doing *one* clear thing, with a
camera move that has a reason. That is the shot this model wins at.

---

## 11. Copy-paste starting templates

### Cinematic dialogue shot
```
[Character: concrete identity anchor — age, build, one memorable garment, one
facial detail]. [What they do]. [Where, with time of day and weather].

Camera: [single move with a reason — push-in, orbit, handheld follow],
[lens], [depth of field].

Timing: 0-2s [beat]. 2-4s [beat]. 4-6s [beat].

Dialogue language: [language + regional variety], [delivery].
The [character] says: {short line}

<diegetic sound 1, diegetic sound 2, room tone>
(music direction, or "no music")

Constraints: one continuous shot, no cuts, no on-screen text, [what must not
appear].
```

### Product / macro
```
[Product] on [surface]. [The one thing that moves].

Camera: [locked-off, then one move], [macro lens], very shallow depth of field,
rack focus from [A] to [B].

Timing: 0-2s stillness. 2-4s [entry]. 4-6s [the move].

<one or two precise material sounds>
(no music)

Constraints: single take, no cuts, no text, no logo, [lighting], no lens flare.
```

### 30-second narrative beat sheet
```
[Subject + world in one sentence.]

Beat 1 (0-5s): hook. [What we see first.]
Beat 2 (5-16s): development. [What starts happening.]
Beat 3 (16-25s): escalation. [The turn.]
Beat 4 (25-30s): resolution. [Where it lands.]

Camera through-line: [one continuous logic across all four beats].

@lead_character provides [exactly one property].
@style_ref provides [exactly one property].

<ambience>
(music)

Constraints: one continuous take, let each beat breathe, no rapid cuts.
```

---

## 12. The workflow that actually works

1. **Prototype at 480p.** 60 credits/second. Iterate the prompt here.
2. **Lock the seed** once a take is nearly right, then change one thing at a time.
3. **Promote to 720p** only when the composition and motion are settled.
4. **Upscale** as a separate pass. Build it into the budget.
5. **Use Extend and Smart Edit** instead of regenerating. A take you like is
   expensive to rediscover.
6. **Keep audio on** throughout — it's free, and it's the differentiator.

---

## Sources & honesty note

Verified firsthand against a live Seedance 2.5 endpoint: the schema, the
resolution enum and 480p default, the 24fps output, the 854×480 dimensions, the
full pricing table, the audio-is-free finding, and the 2.0-outputs-4K comparison.

Everything in §4 (brackets), §5 (accent behaviour), §6 (`@tag` semantics), §8
(modes and locks) and §10 (weaknesses) is **secondhand** — drawn from published
guides and creator reports that I could not open directly, because the research
environment blocked outbound page fetches. It is consistent across multiple
independent sources, which is why it's here, but it is not the same grade of
evidence as the measured numbers. Test the brackets yourself before betting a
client deliverable on them.

I would rather hand you a guide with its seams showing than one that sounds
certain and isn't.
