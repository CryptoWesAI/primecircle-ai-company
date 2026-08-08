# Seedance 2.5 masterguide — distribution plan

The guide is finished. This file is about the part that actually determines
whether it gets seen, because a good guide with no distribution gets zero views.

## The uncomfortable arithmetic

A post's reach is roughly *your reachable audience × how hard the algorithm
pushes it*. The guide is built to maximise the second factor. It cannot do
anything about the first.

| Follower base | Realistic first-post ceiling | What 100k requires |
|---|---|---|
| < 1,000 | 2k–15k | A large account amplifying it |
| 1k–10k | 10k–60k | One good quote-post from a big account |
| 10k–50k | 40k–250k | Just good execution |
| 50k+ | 100k+ | Posting it at all |

If the founder is in the first two rows — likely, since this is a new company
account — **posting the guide cold is the lowest-odds move available.** The
guide is not the constraint. Reach into an existing audience is.

## The strategy: earn the audience before you ask for it

Do not lead with the guide. Lead with **one finding, given away free, in the
replies of threads that already have the audience you want.**

This works because of a specific mechanic: on X in 2026, replies and
reply-to-reply conversations carry the largest reach boost, and a reply that
draws a response from the original author is worth up to ~150× a like. A good
reply on a big thread borrows that thread's audience legitimately.

### Sequence

**Days 1–3 — deposit value, ask for nothing.**
Reply to live Seedance threads with a *specific finding*. No link. No
"check out my guide". Just the finding, stated plainly, as a peer.

**Day 4 — post the guide.**
By now some of those accounts recognise the name. Post the long-form guide with
the vertical clip attached. Link in reply 1.

**Day 4, first 90 minutes — work the replies.**
This is where the post is won or lost.

**Day 5 — quote-post your own best reply** from the warm-up, adding the
experiment table. Gives the guide a second surface without reposting it.

---

## Live targets (verified as real posts during research, 2026-08-08)

These were surfaced during the research sweep. **Check each is still live and
still relevant before replying** — a stale reply reads as spam.

| Account | Post | Angle to reply with |
|---|---|---|
| @EXM7777 (Machina) | [“the only Seedance 2.5 guide you’ll ever need”](https://x.com/EXM7777/status/2085376799643722093) | The moderation experiment. A guide post is the right place to add a finding the guide missed. |
| @EXM7777 | [Higgsfield official prompting guide](https://x.com/EXM7777/status/2084681563888062774) | The resolution enum — the official guide won’t mention the 720p cap. |
| @NexlowX | [the depth map trick for dance accuracy](https://x.com/NexlowX/status/2077796149617139742) | Agree and extend: depth maps also replace camera description, cutting prompt length. Credit them. |
| @_OAK200 | [depth map storyboard workflow](https://x.com/_OAK200/status/2079643011932156305) | Same — this is the person to be seen agreeing with. |
| @JSFILMZ0412 | [“getting my 30 second prompts ready for Seedance 2.5”](https://x.com/JSFILMZ0412/status/2073863670879166961) | The music/moderation warning. Directly saves them a wasted 30s render. |
| @idextratime | [Dreamina Seedance 2.5 live globally](https://x.com/idextratime/status/2083229408887005358) | The 480p default — most useful to people just getting access. |
| @minuitIA | [full character/design-sheet workflow](https://x.com/minuitIA/status/2080029449169584395) | Add: feed the sheet, not the hero shot; ask what they found on 2.5 vs 2.0. |
| @Primee32 | [character sheet method](https://x.com/Primee32/status/2073776413455601906) | Same thread family. |

Also worth monitoring: @minchoi, @EHuanglu (el.cine), @WesRoth — high-reach AI
video accounts who post Seedance content regularly.

---

## Ready-to-use replies

Each one gives away something real. **Do not paste a link into any of these.**

### A — the moderation finding (strongest, use on guide/tutorial threads)

> Worth adding: 2.5 has an output-side moderation pass that fires *after*
> generation, so the credits are already spent when it rejects you.
>
> I isolated it across 5 runs, same seed, one variable at a time. Asking the
> model for music is what trips it — copyright match on the generated score.
> Remove the music clause and the identical shot renders clean. Rephrasing
> doesn't help, it reads the intent not the wording.
>
> Cheapest fix: "no music of any kind, diegetic sound only", then lay music in
> during the edit.

### B — the resolution finding (use on launch/announcement threads)

> One thing that surprised me: there's no 4K. I pulled the schema and the
> resolution enum is exactly ["480p","720p"], defaulting to 480p.
>
> A 2.0 job on the same account returned 3840×2160. So 2.5 is actually a
> resolution downgrade from 2.0, at ~60% more per second. You're buying duration
> and reference control, not pixels — which is a fine trade, just not the one the
> landing pages describe.

### C — the depth map extension (use on @NexlowX / @_OAK200 threads — credit them)

> This is the most underrated technique in the model and I don't think people
> have clocked the second-order benefit yet.
>
> A depth map doesn't just stop motion drift — it replaces the camera
> description entirely. You stop writing "slow orbit from a low angle rising to
> eye level" and just hand it the geometry. Shorter prompt, fewer chances to
> contradict yourself, less drift.

### D — the cost finding (use on pricing threads)

> Priced it properly against a live endpoint: it's perfectly linear per second.
> A 30s generation costs exactly what six 5s generations cost. No bulk discount,
> no long-clip penalty.
>
> Also — audio is free. 5s/720p is the same price with audio on or off. If
> anyone's been disabling it to save credits, they've been saving nothing.

### E — the Sora 2 warning (use on comparison threads)

> Worth flagging on any comparison right now: OpenAI deprecated the Videos API
> and Sora 2 in March, with a published shutdown on 24 Sept 2026.
>
> It still wins on physics and it'll keep topping these lists, but nobody should
> start a new pipeline on it.

---

## Rules for the warm-up

- **One reply per thread.** Never reply twice to the same post.
- **No link, ever, during warm-up.** The moment you paste a link you become
  promotion instead of a peer, and the reply gets ignored or reported.
- **Reply within an hour of the original post** where possible. Late replies sit
  below fifty others.
- **Only claim what's actually verified.** Reply A and D are measured firsthand
  and defensible. Reply C is repeating someone else's finding — credit them, and
  don't present it as your own test.
- **If someone challenges you, answer with the method**, not with confidence.
  "Five runs, same seed, one variable" ends most arguments. Bluffing ends your
  credibility.
- **Do not use the bracket syntax as a hook.** It's the flashiest claim in the
  guide and my one firsthand probe pointed *against* it. Leading with it is how
  you get publicly corrected.

## What success looks like before you post the guide

At least 2–3 replies that got either a response from the original author or
meaningful engagement. That means the audience has seen the name once. Then post.

If none of the replies land after 3 days, **do not post the guide yet** — the
problem is reach, not content, and burning the guide into a dead feed wastes it.
Keep depositing findings for another week.

## Honest note

None of this guarantees 100k. It changes the odds from "depends entirely on
follower count" to "depends on whether the findings are good enough that people
with audiences want to repeat them." The findings are good. That is the part
that was actually in our control, and it's done.
