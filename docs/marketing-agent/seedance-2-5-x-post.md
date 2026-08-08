# Seedance 2.5 masterguide — X publishing kit

## Format decision (and why)

Research on the 2026 X algorithm drove three structural choices:

| Finding | Consequence |
|---|---|
| Outbound links cost **50–90% of reach** | The artifact link goes in **reply 1**, never in the main post |
| **Single long-form posts now outrank multi-tweet threads** for distribution | Main asset is ONE long-form post, not a 20-tweet thread |
| **Bookmarks carry a 5× multiplier** (+10 vs +0.5 for a like) | Optimise for *saves*: dense, referenceable, numbered facts |
| An author reply to a comment is worth **up to 150× a like** | Block out 60–90 min after posting to reply to every comment |

Requires X Premium for the long-form character limit. If not available, split at
the marked break points into a thread and keep post 1 identical.

**Attach native video to the main post.** Native video massively outperforms a
naked text post. Use the vertical espresso clip (`m8So2O6kSEcjsui3jG26`,
720×1280) — vertical fills more of the mobile feed.

---

## MAIN POST

> I spent a day testing ByteDance's new Seedance 2.5 against the live API on
> OpenArt instead of reading launch pages.
>
> Three things everyone is repeating are wrong.
>
> 1. The 4K isn't in the API.
>
> I pulled the actual schema. The resolution field is an enum with exactly two
> values: 480p and 720p. That's it. No 1080p. No 4K.
>
> Caveat so nobody has to correct me: that's OpenArt's endpoint. I didn't test
> Dreamina or Volcano Ark. If 4K exists somewhere, it isn't there.
>
> And the default is 480p — so most people have been generating at the lowest
> setting available without knowing.
>
> 2. Seedance 2.5 is a downgrade from 2.0 on resolution.
>
> I checked an older 2.0 job on the same account. It returned 3840x2160. Real 4K.
>
> So 2.5 outputs lower resolution than 2.0 — and costs 62.5% more per second to
> do it. You're buying length and reference control, not pixels. That's a fine
> trade. Just know you're making it.
>
> 3. Turning audio off saves you nothing.
>
> Measured on OpenArt, same endpoint, same day (credits are OpenArt's — the
> ratios are the portable part):
>
> 5s / 480p — 300 credits
> 5s / 720p — 650 credits
> 30s / 720p — 3,905 credits
> 5s / 720p with audio OFF — 650 credits
>
> Identical. Audio is free. If you've been disabling it to save money you threw
> away the model's best feature for nothing.
>
> Also note the pricing is perfectly linear. 30s costs exactly six 5s clips. No
> discount, no penalty. So pick your duration for story reasons only.
>
> —
>
> The part that actually cost me something:
>
> I ran a completely benign prompt. An Icelandic fisherman on a trawler, one line
> of dialogue. No violence, no public figure, no brand, no IP.
>
> It generated. Then it failed:
>
> 1003: output_moderation_blocked
> "the output video may be related to copyright restrictions"
>
> Seedance runs three moderation passes: your prompt, your reference images, and
> the finished video. The third one is the expensive one — it fires after
> inference, so the GPU time is spent and the credits are charged before you're
> told no. Several platforms don't refund it.
>
> So I ran a controlled experiment. Same seed, same everything, one variable at a
> time:
>
> Original (dialogue + SFX + music) → FAILED
> Exact resubmission → FAILED
> Dialogue removed, music kept → FAILED
> Dialogue kept, music removed → PASSED
>
> Three things fall out of that.
>
> It's deterministic. An identical resubmission failed identically. A prompt that
> trips this will trip it every time — you cannot retry your way past it.
>
> Dialogue is innocent. Removing the spoken line entirely didn't help.
>
> The trigger is the music. I kept the face, the dialogue, the seed and the sound
> effects, and deleted one clause — "(sparse low cello drone)". It rendered clean.
>
> Then I checked whether it was a syntax thing — same music request, plain prose,
> no parentheses. Failed anyway. The model reads the intent to have music, not the
> phrasing. You can't rewrite your way out of it.
>
> The model generates a score, an audio fingerprint matcher compares it to
> copyrighted material, and a match destroys the finished video after you've paid
> for it.
>
> Context: Hollywood studios formally accused ByteDance of mass copyright
> infringement in Feb 2026. Controls got tightened. Things that passed in
> February are blocked now.
>
> So: never let it generate music for anything you care about. Write "no music of
> any kind, diegetic sound only" and lay music in during the edit, where you
> control the licence. Cleaner mix, and you stop paying for rejected renders.
>
> —
>
> The prompt grammar nobody uses:
>
> ByteDance published an actual formula. Six slots, in order:
>
> Subject → Action → Scene & Environment → Visual Style → Camera Move → Audio
>
> And four bracket types that route to different audio channels:
>
> ( ) music
> < > sound effects
> { } dialogue
> 【 】 subtitles
>
> So instead of a vague sentence about "cinematic audio" you write:
>
> <swell slapping the hull, wind on the mic, distant gulls>
> {The sea does not care what you planned today.}
>
> Two more that took me by surprise:
>
> The prompt limit is 30,000 characters. Every "keep prompts short" guide is
> giving you a style opinion, not a technical limit.
>
> Output is 24fps. Conform it deliberately if you're cutting into a 30 or 60fps
> timeline.
>
> —
>
> The best technique I found, and almost nobody is using it:
>
> You want to transfer a motion onto your own character. So you hand Seedance the
> source video as a reference. And the choreography drifts.
>
> Here's why. Feed it a video of someone dancing and it tries to interpret
> everything — the person, the clothes, the lighting, the room, and somewhere in
> there, the movement.
>
> Feed it a depth map and there's nothing left to interpret but the motion.
>
> The problem was never the model. You handed it ten variables when you meant to
> hand it one.
>
> So: build your storyboard, convert it to a depth map in Nano Banana 2 or GPT
> Image 2, then give Seedance three references with one job each —
>
> depth map → composition, framing, camera geometry
> style ref → tone, palette, lighting
> character sheet → identity
>
> A depth map replaces paragraphs of camera description. You stop writing "slow
> orbit from a low angle rising to eye level" and just show it the geometry.
>
> —
>
> The mistake almost everyone is making: trying to oneshot the whole video.
>
> 30-second takes with 50 reference slots push the work upstream into
> preparation. Identity, wardrobe, props, location and camera should each have
> their own source instead of fighting inside one paragraph of prose.
>
> If all five are competing in your prompt text, you're running a 2026 model on a
> 2024 workflow.
>
> One more, since every comparison post is about to get this wrong:
>
> Don't start anything new on Sora 2. OpenAI deprecated the Videos API and the
> Sora 2 models in March, with a published shutdown on 24 September 2026. That's
> 47 days out.
>
> It still wins on physics, and it'll keep topping "best AI video model" lists
> written by people who never checked the deprecation notice. Doesn't matter. You
> don't build a pipeline on something with an end-of-life inside two months.
>
> The split I'd actually use: Seedance 2.5 when a character has to survive more
> than one shot. Veo 3.1 for the one frame that has to look expensive. Kling 3.0
> for volume.
>
> —
>
> I wrote the whole thing up — the six-part formula, the reference tagging system,
> the modes nobody uses (backward extension is the good one), the parameter locks,
> and copy-paste templates.
>
> Link below. Everything in it is marked either MEASURED or REPORTED, so you can
> see exactly which claims I verified against the API and which ones I'm passing
> on from other people.

---

## REPLY 1 (the link — post immediately after)

> Full field manual here, free, no email gate:
> https://claude.ai/code/artifact/b8165a38-685f-4106-8c1b-7044f497b177
>
> Every claim is graded. MEASURED = I ran it against the live endpoint.
> REPORTED = consistent across sources but I couldn't independently confirm it.
>
> If you test the bracket syntax yourself I'd genuinely like to know what you get.

---

## REPLY 2 (optional, ~2h later, keeps the thread alive)

> Someone will ask, so: I tested on OpenArt's Seedance 2.5 endpoint. Credit prices
> are OpenArt's. The ratios (720p = 2.17x 480p, audio free, linear duration
> pricing) should hold anywhere — the underlying Volcano Ark billing shows the same
> ~2.2x step from 480p to 720p.

---

## Operating notes

- **Post timing**: aim for 14:00–16:00 UTC (US morning + EU evening overlap).
- **First 60–90 minutes decide the post.** Reply to every single comment. A reply
  that gets an author response is worth up to 150× a like in ranking terms.
- **Do not edit the post after publishing** — it resets velocity.
- **Do not put the link in the main post.** This is the single most common way
  people kill their own reach.
- If someone challenges the 4K claim: the answer is the schema enum plus the
  fact that a 2.0 job on the same account returned 3840×2160. That's the receipt.

## Honesty guardrail

The bracket syntax is the most quotable claim in the guide and it is **REPORTED,
not MEASURED**. It is labelled that way in the artifact and it should stay that
way in any reply. If someone tests it and it turns out not to work, the grading
is what protects the post's credibility — and yours.
