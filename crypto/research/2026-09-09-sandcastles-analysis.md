# Sandcastles.ai, and whether "research plus strategy for crypto projects" is a product

Written 2026-09-09. Two research agents (product dissection, crypto landscape),
sources dated, listed at the end. Opinions are marked as such. Explore mode:
no revenue test, no Buy/Build stance; the question is what the thing is and
what would have to be true for a crypto version to work.

## 1. What Sandcastles is (facts)

- A research and scriptwriting tool for short-form video creators (Instagram,
  TikTok, YouTube Shorts). Tagline: "Create viral short-form videos in
  seconds." It ends at the script: no filming, editing, voice or publishing.
- The flow: build a feed of channels in your niche, surface "outliers"
  (videos that beat their own channel's baseline, not raw view counts), read
  an analysis of why each worked, download the transcript, generate hooks and
  a script. Workspaces and competitor tracking around it. An MCP integration
  (Aug 2026) lets ChatGPT and Codex query the same data.
- Pricing on the live site, 9 Sep 2026: Pro $39/month yearly (100 credits, 3
  workspaces, 150 tracked competitors), Visionary $79 (250 credits), Titan
  $399 (1,500 credits, API access). Credits are consumed per analysis or
  script. Review sites quote other credit counts, so treat those as
  unverified.
- Founder: Kane Kallaway, a creator with over a million followers across
  platforms. No funding found. Traction claims (20k, 22k, 30k+ users, "100k+
  users" on the site) are all secondary or self-reported; none verified.
- Reception: no Product Hunt page, no real Hacker News thread. Affiliate
  reviews praise the outlier research and report churn from people who
  expected finished videos.
- Undisclosed data sourcing (official APIs or scraping) for three platforms
  that police scraping. A real risk for the company, and the reason a clone
  cannot simply copy the data layer.

## 2. The mechanism that matters (opinion)

Strip the AI language and three things carry the product:

1. **A relative metric.** "Outlier" means performance against the channel's
   own baseline. It turns a firehose into a short list a creator trusts,
   because it filters out big-channel noise. This is the idea, not the LLM.
2. **A narrow job with a clear end.** Find proven ideas, leave with a script.
   The creator's metric (views) is unambiguous, so the tool's value is
   provable within a week. The churn complaint proves the boundary is sharp.
3. **Distribution the founder already owned.** A million followers in the
   exact buyer group. The product launched into an audience.

The "suggestions and strategy" the founder liked are thin here: Sandcastles
does not plan a channel, it remixes what already worked. That is worth noting
before building something bigger than the original.

## 3. What already exists for crypto projects (facts, Sep 2026)

Twelve products mapped in the landscape sweep. The pattern:

- Three data feeds get repackaged: on-chain flows (Nansen, Arkham, Dune,
  Artemis, Token Terminal), social sentiment and mindshare (Kaito, LunarCrush,
  Cookie3), self-reported fundamentals (Messari). Almost every "AI" layer is
  chat over that data or a score on top of it.
- Nobody ships unattended strategy. No self-serve product takes a project's
  token, roadmap and budget and returns a costed go-to-market plan. The "AI
  CMO" search hits were agencies that use AI internally.
- No crypto-native Sandcastles clone was found. The closest is chain-blind
  social scheduling (Followr) or data chat that does not draft anything.
- Entry prices are public and modest ($90 to $900 a month; Kaito Pro $833 a
  month annual); project-side pricing sits behind demos in 8 of 12 cases.
- Vendors are turning toward MCP and agent access (Dune, Kaito, Arkham with
  x402 pay-per-call). The next buyer of these tools is another agent.
- Buyer spend, directional and unverified for the small-cap band: projects
  spend $3,000 to $50,000 a month on marketing, 30 to 40 percent of it on
  KOLs, with agency fees of 15 to 30 percent on top (coinlaunch.space,
  ninjapromo, disence, 2026).
- MiCA: marketing communications about a crypto-asset must be fair, clear,
  not misleading and labelled as marketing. No growth tool in the table has a
  compliance layer; that is sold separately (Sedric, Sumsub) to licensed
  firms. Enforcement so far hits promoters and unlicensed exchanges, not
  tools.

## 4. Why the gap exists (opinion, the part to argue with)

"Nobody does it" is either an opportunity or a warning. Three reasons it may
be a warning:

- **Strategy needs context a tool does not have.** Runway, the team's real
  skills, what the lead investor promised, which exchange is in talks. The
  augment check in `CLAUDE.md` applies: judging the output needs taste, and
  80 percent quality is not acceptable for a plan someone spends $30,000 on.
  A brief that is 80 percent right reads as generic; the buyer pays an agency
  precisely for the last 20 percent and for someone to blame.
- **The agency is the product.** A small project with money buys a retainer
  and KOL placements; a small project without money does not buy software
  either. Software that sells to the founder directly has to beat "free
  advice from the community plus a $2,000 a month agency" on trust, and trust
  is the thing a new tool has least of.
- **Data is the moat, and it is priced.** Kaito and LunarCrush own the social
  baselines. Reading X now costs $0.005 a post through the API (pay-per-use
  since Feb 2026). A relative-metric feed for a niche of 50 accounts is
  affordable; a firehose is not.

## 5. What is already on this desk

The founder ran the manual version of the product once, for Sable, in the
past two weeks:

- 13 peer fact sheets and a synthesis (`crypto/research/peers/`).
- A community landscape note with ranked tactics for the niche.
- A content series (launch thread, 13 singles, closing thread, calendar).
- An X playbook with cadence, measurement and a reply target list.
- A watcher that probes a project's announced claims against its live API
  and docs (`claims.json`, `peers.json` in the watch repo), diffs the
  whitepaper, and keeps a reliability record. The site is Sable-specific in 7
  files; the watcher already has a small generic config surface.

Two things in that list exist in none of the twelve products: the
claims-versus-live verification, and the honest peer comparison written by an
outsider. Those are the founder's edge. The strategy brief is not; every
agency has one.

## 6. Three shapes a crypto version could take

Laid out, not chosen; explore mode.

**A. The brief pipeline as a skill.** Input: a project's site, docs, token
address, X handle. Output: the peer sheet set, the landscape note, an X
playbook, a first-week content set, with sources dated. Built from the work
already done for Sable, which is exactly how `CLAUDE.md` says skills get
built. Costs a session to make. Tests the one question that matters: does a
second project want this output, and what do they do with it.

**B. Observatory-as-a-service.** Re-point the watcher and the site at a second
project: claims probed against live, whitepaper diffed, reliability record,
peers. A public, independent page per project. Value to the project is
credibility; value to the community is a checkable record. Nobody in the
table sells this. Risk: projects do not pay to be watched, and the ones that
would are the ones that least need it.

**C. A Sandcastles clone for crypto X.** Outlier posts in a niche of tracked
accounts (relative to each account's baseline), why they worked, drafts in
the project's voice. Competes with Kaito on data and pays X per read. The
mechanism is clear and the founder's own X playbook would be its first user.
The buyer is any account, not only projects, which widens the market and
thins the edge.

Recommendation, as a recommendation: A first, because it is the manual work
already done, costs almost nothing, and the output goes to a real second
project before anything is designed. B is what A becomes if a project asks
for a public record. C is a different company.

## 7. Questions to answer before any spec

1. Who is the person: a two-engineer team like Sable's with no devrel, a
   marketing lead at a funded project, or an outsider-holder like the founder
   himself? The output and the price differ by an order of magnitude.
2. What is the Monday-morning job: "tell me what to post this week", "tell
   me what my peers did that worked", or "tell me what my docs promise that
   my API does not deliver"? Pick one for the first version.
3. Which second project gets the manual run? A peer from the 13 (they would
   notice an honest sheet), or a project that has already asked.
4. Does the founder want to sell to projects at all, given the MiCA line: a
   tool that drafts token promotion is making marketing communications on
   someone's behalf, and the compliance check has to be inside it, not sold
   separately.
5. What does the founder want to learn from building it? In explore mode
   that is the success criterion, and it decides whether A, B or C is the
   interesting one.

## Sources

Product: sandcastles.ai (home, pricing), blog.sandcastles.ai, content.game
(v3 launch, 11 Sep 2025), creatoreconomytools.com, coldiq.com, formatfinder
compare page, linkedin.com/in/kanekallaway. Landscape: pro.kaito.ai/pricing,
docs.kaito.ai, lunarcrush.com/pricing, coinex academy 1824 (Cookie3),
messari.io and cryptoadventure review (2026), tokenterminal.com, dune.com/blog
(Dune Agent, Dune MCP), info.arkm.com announcements (Apr and Aug 2026),
nansen.ai (29 Jan 2026), about.artemis.ai, addressable.io, chaingpt.org,
followr.ai. Buyer spend: coinlaunch.space, ninjapromo.io, kolhq.com,
disence.com, blockchainappfactory.com (all 2026). Regulation: innreg.com MiCA
guide, sedric.ai influencer compliance (Apr 2026).
