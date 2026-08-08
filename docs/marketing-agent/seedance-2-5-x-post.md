# Seedance 2.5 masterguide: X publishing kit

## Format decision (and why)

Research on the 2026 X algorithm drove four structural choices:

| Finding | Consequence |
|---|---|
| Outbound links cost **50–90% of reach** | The artifact link goes in **reply 1**, never in the main post |
| **Single long-form posts now outrank multi-tweet threads** for distribution | Main asset is ONE long-form post, not a 20-tweet thread |
| **Bookmarks carry a 5× multiplier** (+10 vs +0.5 for a like) | Optimise for *saves*: dense, referenceable, numbered facts |
| An author reply to a comment is worth **up to 150× a like** | Block out 60–90 min after posting to reply to every comment |

Requires X Premium for the long-form character limit. If not available, split at
the blank lines into a thread and keep post 1 identical.

**Attach native video to the main post.** Native video massively outperforms a
naked text post. Use the vertical espresso clip (`m8So2O6kSEcjsui3jG26`,
720×1280); vertical fills more of the mobile feed.

**House style:** no em-dashes anywhere in published copy.

---

## PRE-FLIGHT (do this first, it is a hard blocker)

1. **Share the artifact.** Artifacts are private by default. Open the field
   manual, use the share menu, make it public.
2. **Open the link in a logged-out browser.** If it does not resolve, every
   click from the post lands on nothing and the post is wasted.
3. Have the vertical clip downloaded and ready to attach.

---

## MAIN POST (use this one)

Short by design. The field manual is the reference; the post only has to earn
the click.

> Spent a day testing Seedance 2.5 against the live API instead of reading launch pages.
>
> The one that cost me something: it moderates the output *after* the render finishes. Asking for music trips a copyright block. Credits already gone.
>
> 5 runs, same seed, one variable at a time. Remove the music clause and the identical shot renders clean. Rephrasing doesn't help, it reads intent not wording.
>
> Also, there's no 4K in the API. Two values, 480p and 720p, default 480p. A 2.0 job on the same account gave me 3840x2160.
>
> Wrote the rest up as a field manual. Free, no email gate. Link below.

**Reply 1:**

> [link]
>
> Every claim marked MEASURED or REPORTED so you can see what I verified myself.

**Note:** X does not accept PDF attachments. Link the artifact page, or host the
PDF somewhere with a URL and link that instead.

---

## LONG VERSION (fallback only)

Kept in case a long-form post is wanted later. Not the default: it reproduces
most of the field manual, which removes the reason to click through.

> I spent a day testing ByteDance's Seedance 2.5 against the live API on OpenArt instead of reading launch pages.
>
> Three things everyone is repeating are wrong.
>
> **1. The 4K isn't in the API.**
>
> I pulled the schema. The resolution field is an enum with exactly two values: 480p and 720p. The default is 480p, so most people have been generating at the lowest setting without knowing.
>
> Caveat so nobody has to correct me: that's OpenArt's endpoint. I didn't test Dreamina or Volcano Ark.
>
> **2. 2.5 is a resolution downgrade from 2.0.**
>
> I checked an older 2.0 job on the same account. It returned 3840x2160. Real 4K.
>
> So 2.5 outputs lower resolution than 2.0, and costs about 60% more per second. You're buying duration and reference control, not pixels. Fine trade. Just know you're making it.
>
> **3. Turning audio off saves you nothing.**
>
> Measured, same endpoint, same day:
>
> 5s / 480p: 300 credits
> 5s / 720p: 650
> 30s / 720p: 3,905
> 5s / 720p with audio OFF: 650
>
> Identical. Audio is free. Pricing is also perfectly linear, so 30s costs exactly six 5s clips. Pick duration for story reasons, never cost.
>
> Then the part that actually cost me something.
>
> I ran a benign prompt. A fisherman on a trawler, one line of dialogue. No violence, no public figure, no brand. It generated, then failed:
>
> 1003: output_moderation_blocked
> "the output video may be related to copyright restrictions"
>
> Seedance moderates the output after the render completes. The credits are already spent when it rejects you.
>
> So I ran a controlled experiment. Same seed, one variable at a time:
>
> Music + dialogue: blocked
> Exact resubmission: blocked
> Dialogue removed, music kept: blocked
> Dialogue kept, music removed: rendered
>
> It's deterministic, so you can't retry your way past it. Dialogue is innocent. The trigger is the music.
>
> I also tried the same music request in plain prose with no brackets. Blocked anyway. It reads the intent, not the phrasing.
>
> Fix: write "no music of any kind, diegetic sound only" and add music in the edit where you control the licence.
>
> The best technique I found, and almost nobody is using it:
>
> You want to transfer a motion onto your character, so you hand Seedance the source video. The choreography drifts.
>
> Feed it a video of someone dancing and it tries to interpret everything. The person, the clothes, the lighting, the room, and somewhere in there, the movement.
>
> Feed it a depth map and there's nothing left to interpret but the motion.
>
> The problem was never the model. You handed it ten variables when you meant to hand it one.
>
> A depth map also replaces paragraphs of camera direction. Stop writing "slow orbit from a low angle rising to eye level" and just show it the geometry.
>
> The mistake almost everyone is making: trying to oneshot the whole video.
>
> 30 second takes with 50 reference slots push the work upstream into preparation. Identity, wardrobe, props, location and camera should each have their own source instead of fighting inside one paragraph of prose.
>
> Two more, quickly.
>
> The prompt limit is 30,000 characters. Every "keep prompts short" guide is giving you a style opinion, not a technical limit.
>
> Output is 24fps. Conform it deliberately if you're cutting into a 30 or 60fps timeline.
>
> I wrote all of it up. The six part formula, the reference tagging system, the modes nobody uses, the parameter locks, and copy paste templates.
>
> Every claim is graded MEASURED or REPORTED, so you can see which ones I verified against the API and which I'm passing on.
>
> Link below.

---

## REPLY 1 (the link, post immediately after)

> Full field manual, free, no email gate:
> [shared artifact link]
>
> MEASURED means I ran it against the live endpoint. REPORTED means it's consistent across sources but I couldn't confirm it myself.

---

## REPLY 2 (optional, ~2h later, keeps the thread alive)

> Someone will ask, so: I tested on OpenArt's Seedance 2.5 endpoint. The credit
> prices are OpenArt's. The ratios should hold anywhere. 720p is 2.17x 480p,
> audio is free, and duration pricing is linear. Volcano Ark's published examples
> show the same ~2.2x step from 480p to 720p.

---

## Operating notes

- **Post timing**: 14:00–16:00 UTC (US morning + EU evening overlap).
- **First 60–90 minutes decide the post.** Reply to every comment. An author
  reply to a commenter is worth up to 150x a like in ranking terms.
- **Do not edit the post after publishing.** It resets velocity.
- **Do not put the link in the main post.** Single most common way people kill
  their own reach.
- If someone challenges the 4K claim: the receipt is the schema enum plus the
  2.0 job on the same account returning 3840×2160.
- If someone challenges the moderation finding: "five runs, same seed, one
  variable at a time." That ends most arguments.

## Why the bracket table is not in this post

The four-bracket audio syntax (`()` music, `<>` SFX, `{}` dialogue, `【】`
subtitles) is the most quotable claim in the research and it is **REPORTED, not
MEASURED**. Worse, the one firsthand probe run against it pointed *against* it:
requesting music in plain prose with no parentheses produced identical behaviour
to requesting it inside `()`.

It stays in the field manual, clearly graded and with the contrary evidence
stated. It is deliberately kept out of the post, because leading with the one
claim your own test undermines is how a guide gets publicly corrected.

Same rule applies in replies: do not defend the bracket system. Point at the
grading.
