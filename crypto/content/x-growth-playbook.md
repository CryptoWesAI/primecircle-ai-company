# X growth playbook: @0PTIMUS_ONE

Written 2026-09-09. A living document: refresh section 1 monthly from X
analytics, change section 3 only when evidence changes, and log what was tried
in section 13. No em-dashes.

## 1. Where the account stands (9 Sep 2026)

- @0PTIMUS_ONE, 614 followers at the last reading (Aug 2026, refresh from the X
  analytics page). Creative AI-avatar brand, about 1 in 4 posts carried media,
  not a builder account until the Sable work started.
- Published: one X Article, the fail-closed piece (8 Sep 2026). Drafted and
  ready: the peer series (launch thread, 13 singles, closing thread, one-week
  calendar in `2026-09-09-peer-posts.md`) and a Telegram pitch.
- Assets nobody else in this niche has: the Observatory (live status, receipt
  verifier, door simulation, burn ring, SABL chart, reliability record), the
  Gatekeeper game with a contest running until 14 Sep, the public whitepaper
  watch repo (hourly checks, diffs, changelog), Lisa the voice guide, and 13
  sourced peer fact sheets.
- Voice, as it reads in the published pieces: declarative, first person, every
  number dated and sourced, hedged where the reading is uncertain ("my read,
  and only a read"), jargon explained on first use, disclosure "I hold SABL,
  not affiliated" on every piece.
- Measurement: every unauthenticated X read route died in Aug 2026, so metrics
  come from the founder's own analytics page. The X API is pay-per-use since
  6 Feb 2026 (about $0.005 per post read, $0.010 per post created, $0.20 per
  post created that contains a link; medianama, Feb 2026). A small measurement
  script is affordable, not free.

## 2. Diagnosis

Five findings, heaviest first. Each is an opinion built on the evidence named.

1. **The timeline is not where a 600-follower account grows.** An original post
   reaches mostly existing followers. A good reply under a post from a 20k to
   200k account reaches that account's readers. Reply-first is the one tactic
   every 2026 source repeats; the volume figures those sources quote (20 to 100
   replies a day) are marketing folklore, unverified. The account's own habit,
   as far as the drafts show, is posting, not replying.
2. **Every drafted post links out and asks nothing.** All 13 peer singles end
   in a link to the Observatory. Several 2026 sources (Buffer, SocialPilot Aug
   2026) report reduced reach for posts with an external link, and "link in the
   first reply" is reported as still working. The exact penalty is unverified,
   but the second problem is certain: a post that hands the reader a fact and a
   door gives them nothing to answer. Replies are what the ranker rewards.
3. **One-project accounts hit a ceiling at the project's size.** Sable has one
   pool under $100K liquidity, two Rust hires, no devrel, and a confidential
   tier that has refused every request since 4 Sep. The number of people who
   care about Sable specifically is small. The category (provable and
   confidential AI compute, agents that pay for inference, receipts you can
   verify) is larger and growing, and the 13 peer sheets already position the
   account as its independent observer. Own the category, keep Sable as the
   running example.
4. **The assets are under-used as a content engine.** The watcher and the
   Observatory produce a checkable fact every hour: status, refusal streaks,
   burns, whitepaper sentence diffs, node count, price of a model. An
   independent record that anyone can verify is exactly what the community
   landscape note found credible in this space. Right now that record is on a
   web page and in a GitHub changelog, not on X.
5. **The outsider stance is the edge, not the brake.** The voice summary flagged
   "not affiliated, I hold SABL" as a ceiling on advocacy. Disagree. The neutral
   third party reads as more credible than the project's own marketing (see
   `crypto/research/peers/community-landscape.md`), and MiCA requires the
   disclosure anyway. Keep it, make its placement fixed (bio, pinned post, last
   line of anything that names SABL).

## 3. What the platform rewards in 2026 (dated facts)

- X open-sourced its For You ranker on 20 Jan 2026: a Grok-based transformer
  predicting about 15 engagement types. The code does not publish weights, so
  every "replies are worth 13.5 likes" table on the web is folklore. Directional
  reading across sources: conversation depth and dwell time outrank passive
  likes; engagement-bait patterns ("like if you agree") are detected and
  penalised (ppc.land, 20 Jan 2026).
- Articles are open to every Premium tier since 7 Jan 2026 (ppc.land). Premium
  is about $8 a month; the account already publishes Articles.
- Creator revenue sharing closed to new entrants on 7 Aug 2026 and is replaced
  by Original Content Rewards, applications from 8 Sep 2026: 500 verified
  followers plus 500,000 verified-user Home Timeline impressions in 90 days,
  original content only (TechCrunch, 8 Aug 2026). Not a target for this
  account yet; note that "verified followers" means Premium-subscribed
  followers, a fraction of 614.
- X Communities shut down on 30 May 2026 (TechCrunch, 23 Apr 2026). Not a
  channel. Spaces exist; no dated evidence that they grow small accounts.
- Penalties that a beginner trips over: engagement bait, reply spam, coordinated
  raids, purchased engagement. The landscape note lists raids and undisclosed
  paid posts as the two tactics that cost this niche the most credibility.

Sources: ppc.land (20 Jan and 7 Jan 2026), TechCrunch (23 Apr and 8 Aug 2026),
medianama (Feb 2026), devcommunity.x.com API pricing post, buffer.com links
resource, blotato.com scheduler roundup (2026).

## 4. Positioning

One sentence, used everywhere: **the independent observatory for provable AI
compute. I check the receipts.**

Bio draft (under 160 characters, pick or edit):

> I check the receipts on provable AI compute: status, burns, whitepaper
> diffs, hourly. Observatory and game in the link. Hold SABL, not affiliated.

Display name can carry the positioning while the handle stays: "Wes · Sable
Observatory" or similar. The handle, the GitHub name (CryptoWesAI) and the
domain (primecircle.cloud) are three identities; aligning them is a founder
call, not urgent, and renaming the handle keeps the followers.

Pinned post: the Observatory, as one image card plus one line of what it is and
what it checks, link in the first reply. Replace with the contest winner card on
14 Sep for a week, then back.

## 5. The content system

Three pillars, in this ratio per week: 3 record posts, 2 category posts, 1
build post. Plus replies every day, at least three replies for every post.

**Record posts** (from the watcher and the Observatory). One fact, its
timestamp, its source, what it means, what would change the reading. Templates:

- Refusal streak: "Sable's confidential tier: N consecutive refusals at HH:MM
  UTC on D Mon, error measurement_mismatch. Day N of the outage. The standard
  tier keeps answering. Fail-closed is the design; the question is how long a
  design can stay closed."
- Burn: "SABL burned this week: N (from the mint supply, D Mon HH:MM UTC).
  Paying for compute in SABL burns it. N of what, and against what inflow: the
  ring on the Token page shows both."
- Whitepaper diff: "The Sable whitepaper changed under the same 'v2.0, August
  2026' cover. Section NN, one sentence: [before] became [after]. Diff and
  snapshots in the watch repo."
- Weekly reliability record, every Monday: the UTC day by hour grid as an image,
  verified checks over total, longest gap, one sentence of reading.

Every figure fetched live at the moment of drafting, dated, sourced (the crypto
rules in `CLAUDE.md`). Never a price expectation.

**Category posts.** What a signed receipt proves and what it does not. Why a TEE
can attest and still be wrong. One peer, one true thing, one honest contrast
(the 13 singles already exist; post them without the link in the body). "From
the docs" as the recurring frame: a screenshot of the source with the sentence
highlighted.

**Build posts.** The verifier in the browser, the share-card star fingerprint,
the replay-verified leaderboard, Lisa's tools, the nginx proxy that keeps the
site read-only. Builders in the AI-agent crowd follow people who show the
mechanism. Each one ends with the repo link in a reply and one question ("what
would you fingerprint instead?").

Post shape, all pillars: first line carries the number and the date; one image
where one exists (the share-card and daily-card generators already produce
1200x675 images); no link in the body, link in the first reply; end with one
concrete question or a stated uncertainty; disclosure as the last line when SABL
is named. Threads only when the material has more than four steps; otherwise a
single post beats a thin thread.

**Replies.** A reply earns reach when it adds a checkable fact, a correction, or
a number the host did not have. Pattern: quote the host's claim in three words,
add the fact with its date and source, stop. No "great thread", no links unless
asked, no tagging Sable into other projects' threads. Reply targets: the 14
verified handles in the peer series plus 10 builder accounts in the
agent-payments and TEE space, handles verified from their own sites before they
go on the list. The list lives in section 8 and is pruned monthly.

## 6. Weekly cadence for a 32 to 40 hour job

Assumption: 30 minutes on weekdays, 60 on one weekend day.

- Weekday morning, 10 minutes: five replies from the target list, opened from a
  saved X List so the feed does not eat the time.
- Weekday evening, 15 minutes: one post from the pillar of the day (Mon record
  weekly, Tue category, Wed record, Thu build, Fri record, Sat off, Sun the
  long piece). Draft in the morning if the number needs fetching.
- Until 14 Sep: the daily contest card as the record post. 14 Sep: the winner
  card, pinned for a week.
- Sunday, 60 minutes: one Article or thread (the fail-closed thread exists as a
  draft, so does the closing peer thread), plus the analytics export.

## 7. Measurement

Monthly, on the first weekday: export the X analytics CSV into
`crypto/content/x-metrics/YYYY-MM.csv` (the founder does this; nothing in this
workspace can read X). Track four numbers, in this order of importance:

1. Replies received per post (conversation is what the ranker scores).
2. Share of impressions from non-followers (reach beyond the timeline).
3. Profile visits and the follows per hundred visits (the bio and pin do this).
4. Follower count (lagging; reported, not chased).

90-day hypothesis, written down to be proven wrong: from 614 to 1,200 by
9 Dec 2026 if the cadence holds. The December reading judges the plan, not the
mood.

## 8. Reply target list

Verified from the projects' own sites (9 Sep 2026): @Sablenetwork,
@PhalaNetwork, @near_ai, @nillion, @OasisProtocol, @akashnet, @OpenGradient,
@virtuals_io, @SecretRebooted, @MarlinProtocol, @iEx_ec, @AutomataNetwork,
@bittensor, @TinfoilAI.

To add, ten at most, each handle verified before it goes on the list: people
building agent payments (x402, MCP tooling), TEE and attestation engineers,
on-chain data accounts that cover Solana small caps honestly, one or two AI
researchers who post about inference cost. Prune anyone whose threads the
founder cannot add a fact to.

## 9. Do not

- No raids, engagement pods, follow-for-follow, giveaways for follows, bought
  engagement. Each is cheap to detect and the landscape note shows the cost.
- No price talk about SABL beyond what the chart shows, dated. No expectations.
- No tagging all 14 peers in one post; one tag per post, earned by the content.
- No "like if you agree" or any pattern the 2026 ranker flags as bait.
- No posting a number that was not fetched at drafting time.

## 10. Automation check

Candidate: a script that reads the watcher's `status/log.jsonl`, the burn
figures and the changelog, and writes a dated draft for each record template in
section 5 into a drafts file. The founder reads, edits, posts by hand.

- Does judging the output need taste: no, the draft is a filled template with
  the source timestamp; the founder's edit is the taste.
- Would 80 percent quality do: yes, because nothing posts without the founder.
- Failure mode: a stale reading drafted as current, or a number that moved
  between draft and post. Who notices: the founder, because every draft carries
  its timestamp and the rule is to re-check the figure before posting.
- Verdict: automate the drafting, never the posting. Spec first, in a separate
  session. Posting through the API costs $0.010 per post and $0.20 with a link,
  affordable but it removes the human check, so it stays out.

## 11. First week (10 to 16 Sep 2026)

1. Rewrite the bio and pin the Observatory card, link in the first reply.
2. Run the peer calendar as drafted, with one change: link in the reply, one
   question at the end of each single.
3. Five replies a day from the verified list; note which replies drew an
   answer, that note becomes the target-list pruning.
4. 14 Sep: close the contest, post the winner card, pin it.
5. Sunday 13 Sep: the closing peer thread, or the fail-closed thread if the
   confidential tier is still refusing (then the streak is the first line).
6. First analytics export on 1 Oct, into `crypto/content/x-metrics/2026-09.csv`.

## 12. Assumptions the founder can overrule

- The goal is reputation in the category first, follower count second.
- Time budget: 30 minutes on weekdays, 60 on Sunday.
- The account widens from Sable to the category, with Sable as running example.
- The handle stays; positioning goes in display name, bio and pin.
- English only; the audience for this niche reads English.
- No Spaces or video yet; revisit when the founder wants to use voice, and
  then Lisa is the obvious first guest.

## 13. Log

- 2026-09-09: playbook written. Peer series and fail-closed thread drafted
  earlier, Article published 8 Sep. Contest runs to 14 Sep.
