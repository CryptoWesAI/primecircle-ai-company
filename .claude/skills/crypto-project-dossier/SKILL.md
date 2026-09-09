---
name: crypto-project-dossier
description: >-
  Build the full research-and-content dossier for any crypto project the way it was done for
  Sable Network in Aug and Sep 2026: a verified surface inventory from primary sources, peer
  fact sheets with dated market-cap arcs, a community landscape with ranked tactics, a
  synthesis with a token ladder, an X growth playbook and a first content set, plus an
  optional claims-and-whitepaper watcher. Every number dated and sourced, disclosure on every
  public piece. Use when the founder says "run the dossier for <project>", "do the Sable
  workflow for <project>", "research this project and tell me how it should grow", or when a
  project asks for the observatory treatment. Not for investment decisions, price targets, or
  anything that signs a transaction.
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Bash, Grep, Glob, Agent, AskUserQuestion
---

# crypto-project-dossier

Distilled from the Sable Network work (Aug 29 to Sep 9, 2026). The originals are the
exemplars, read them before writing the equivalent piece:

- Surface and token facts: the auto-memory file `project_sable_support.md` and
  `crypto/research/2026-09-08-sable-mcp-gateway.md` (a claim checked against the live API).
- Peer fact sheets: `crypto/research/peers/phala.md` is the template (600 words, token).
  `crypto/research/peers/tinfoil.md` is the no-token case (revenue estimate instead of a
  market cap) and deviates from the template in its title and headings 2 and 4, and runs to
  1,067 words; follow phala.md for shape, tinfoil.md only for the no-token substitution.

Layout: Sable's files sit flat in `crypto/research/` because it was the first project. From
the second project on, everything goes under `crypto/research/<slug>/` (brief, surface,
`peers/`, the deep dive) and `crypto/content/<slug>/`, so two projects never share a folder.
- Landscape: `crypto/research/peers/community-landscape.md`.
- Synthesis: `crypto/research/2026-09-09-sable-peers-deep-dive.md`.
- Playbook: `crypto/content/x-growth-playbook.md`.
- Content set: `crypto/content/2026-09-09-peer-posts.md`, the Article pattern in
  `crypto/content/2026-09-08-sable-fail-closed-article.md`, the Telegram pitch in
  `crypto/content/2026-09-09-sable-telegram-pitch.md`.
- Watcher: the sibling repo `../sable-whitepaper-watch` (`watch.py`, `claims.json`,
  `peers.json`).

The whole run for Sable took about six sessions, with the fact sheets fanned out to seven
Sonnet agents. Budget for that; the skill does not get cheaper by skipping the verification.

## The law of this skill

1. **Primary sources only.** The project's own docs, whitepaper, contract or API, raw page
   HTML. Never a summary, never a WebFetch paraphrase as a quote: fetch the raw text and
   quote from it. Aggregator numbers (Crunchbase, Tracxn, review sites) are marked
   "directional, not confirmed" or left out.
2. **Every number carries a date and a source, inline.** `(phala.com, 2025-07-17)` style.
   Market caps, prices, TVL, supply, liquidity: fetched at writing time, dated to the day.
   Never a price expectation, in either direction.
3. **Outsider stance.** Contrasts run both ways. A peer sheet says what the peer does better.
   If the founder holds the token, every public piece ends with the disclosure line
   ("I hold X. Not affiliated.") and the Telegram version opens with it. MiCA calls this
   marketing communication: fair, clear, not misleading, disclosed.
4. **Nothing posts automatically.** The dossier produces drafts; the founder or the project
   posts by hand after re-checking every figure against its source line.
5. **The crypto rules in `CLAUDE.md` apply in full**: no keys, no funds, verify contract and
   mint addresses through official channels before they appear anywhere, scam-hostile by
   default.
6. **Explore mode unless told otherwise.** The dossier is the same in both modes; income mode
   only adds the Founder Filter and a stance at the end of step 7.

## Step 0: Intake, then a brief

Interview before spec. Ask what is not known; "use your best judgment" is an answer, recorded
as an assumption. The questions:

1. Project name, site, docs URL, whitepaper URL, GitHub org.
2. Token: chain, mint or contract address (verified through the project's own site or
   docs, not a DEX listing), where it trades, the pool address if one exists.
3. X handle (read from the project's site, not from search), Telegram, Discord.
4. Who asked: the project itself, the founder as outsider-holder, or a community. This sets
   the voice and where the outputs go.
5. The Monday-morning job the dossier must answer: "what do we post this week", "what did
   our peers do that worked", or "what do our docs promise that our surface does not
   deliver". One primary job; the rest is secondary.
6. Does the founder hold the token. Disclosure follows from this.
7. Timebox and language of the public pieces.
8. Mode: explore (default) or income (only if the founder says so).

Output: `crypto/research/<slug>/00-brief.md` with the answers, the assumptions, and the
verification plan for the run (which tool checks which step, see step 7).

## Step 1: Surface inventory, what the project actually has today

Four Sonnet agents in parallel, each self-contained, each returning at most 600 words with a
URL and date on every fact:

- **Site**: home, pricing, trust or security page, careers (team size and priorities read
  from the hiring page: Sable's told us "two Rust engineers, no devrel"), changelog, blog,
  any localised site.
- **Docs and whitepaper**: pdftotext the PDF (`pdftotext -layout`), hash it, keep the text
  as a snapshot with the date. Section list, the token role as the whitepaper states it,
  every verifiable claim (signed responses, attestation, caps, receipts, and so on).
- **Live surface**: endpoints that answer without a key (status, models, pricing, nodes,
  public keys), the MCP server if any, webhook events, CORS-exposed headers. Record exactly
  what each returns, with the UTC timestamp. Token: supply from the chain (Solana
  `getTokenSupply` on the mint, or the contract's `totalSupply`), pool and liquidity from
  GeckoTerminal or DexScreener, holders where a free source exists.
- **Social and community**: handle verification, follower counts with date, posting cadence
  from the last 20 posts if readable, Telegram and Discord sizes, the last three
  announcements verbatim with dates.

Merge on the main line into `01-surface.md`: Product, Proof (what can be verified live and
how), Pricing, Token (role per whitepaper, supply, pool, liquidity, verified addresses), Team
and hiring, Announcements versus docs versus live (every announced feature and whether the
docs describe it and the live surface answers it). That last table seeds the watcher's
`claims.json` in step 6 and is the most valuable page of the dossier, because nobody else
writes it.

## Step 2: Two peer lists, then fact sheets

Two lists, deliberately different, and the synthesis says why:

- **The field** compares products column by column against their own documentation. Derive
  a new column set from this project's own claims in `01-surface.md`; Sable's set (model in
  a TEE, signed response, per-key cap, sub-keys, x402, sandboxes, USD pricing, token role)
  is an example of the method, not a default. A row earns its place only when the docs
  answer the columns; if they do not, it waits until they have been read column by column.
- **The ladder** is the tokens the market files under the same narratives (CoinGecko
  categories, the project's own comparisons, who the project tags, "alternatives to"
  searches). A ladder bar needs a traded token; a peer without one gets a sheet but no bar.

Pick 8 to 13 peers. Then one fact sheet per peer, two peers per Sonnet agent, run in
parallel. Each agent gets the template, the exemplar path, and the definition of done.

Fact sheet template (about 600 words, dateline first: "Compiled YYYY-MM-DD for comparison
against <project> (<site>)."):

```
# <Peer> (<TICKER>): Peer Fact Sheet
## 1. What it is
## 2. Product for <the category>
## 3. Token                      (or: No token, and what stands in for one)
## 4. Market cap arc             (genesis, ATH with day, a year ago, current with date and source)
## 5. Community                  (channels, sizes with dates, programmes with checkable output)
## 6. Connection to <project>    (Difference: / What <project> could learn: / Why a peer:)
## 7. Sources                    (bare URLs, "accessed YYYY-MM-DD", conflicts flagged)
```

Market cap arcs come from `crypto/tools/cg-history.mjs` (CoinGecko coin endpoint: genesis,
ATH, current, one-year series; the full history endpoint needs a key since 2024). Handles are
read from the peer's own site and cross-checked against its CoinGecko page. A no-token sheet
keeps the same headings, says "No token" under 3, puts a flagged third-party revenue or
valuation estimate under 4, and may run to 900 words.

Output: `crypto/research/<slug>/peers/<peer>.md` per peer.

## Step 3: Community landscape

One Sonnet agent, sources dated, at most 900 words, headings fixed:

```
# How Small "<Category>" Crypto Projects Grew Communities, <years>
## Channels
## What moved people          (programmes with checkable output, hackathons, independent dashboards)
## What backfired             (bought members, undisclosed paid posts, raids; with the named cases)
## Regulatory note            (MiCA for an EU holder or project; licensing if the project serves third parties)
## Ranked tactics for <the asker's position>, effort to effect   (10 items; Sable's read "for an observatory with a leaderboard game")
```

Output: `crypto/research/<slug>/peers/community-landscape.md`.

## Step 4: Synthesis, written on the main line

This step needs judgment; do not delegate it. Headings from the Sable deep dive:

```
# <Project> among its peers: who is on the list, how they got their market caps, and what a top pick would take
## 1. Do the two lists have to match?
## 2. The market cap arcs, in one table     (Token | Project | Started | Token since | Price ATH (day) | Cap now | From ATH | Cap a year ago)
## 3. Why high, why idle: the peers one by one
## 4. What <project> would need to become a top pick     (bold leads, each a checkable condition)
## 5. Winning attention from the neighbours' communities, honestly
## 6. Open questions and next checks
```

Section 4 is the strategy. It is a list of conditions the market has rewarded in this
category, each tied to a peer that met it, not a list of tactics. For Sable the leads were: a
market that can hold a position, GPU confidential compute, distribution partners at launch, a
pitch that stays put for years, a token role that follows usage, reliability and honesty as
the brand, builder programmes with checkable output.

Output: `crypto/research/<slug>/<run date>-peers-deep-dive.md`. The run date names the file;
every market figure inside carries its own fetch date.

## Step 5: Playbook and the first content set

**The playbook.** Copy the 13-section structure of `crypto/content/x-growth-playbook.md`
and fill it for the asker's account: where it stands (dated), diagnosis, what the platform
rewards (refresh the dated facts, they change), positioning and a bio draft under 160
characters, three pillars (record, category, build) with fill-in templates, a cadence that
fits the asker's real time budget, measurement, reply target list (the verified peer
handles), do-not list, automation check, first week, assumptions to overrule, log.

**The content set**, in `crypto/content/<date>-<slug>-posts.md`:

- A launch thread of about 8 posts. Post 1 states the count and the promise ("Thirteen
  projects sell ... I put every one on one page: what it is, how it touches @project, why it
  is on the list, and how its market cap got where it is. Read from their own docs, dated. A
  thread."). The last post carries the link, the sources line and the disclosure.
- One single per peer: first something true and useful about the tagged peer, then one
  honest contrast with the project, then the link (in the first reply) and the disclosure.
  Under 280 characters with the link counted as 23. One tag per post.
- A closing thread on what would move the project up (section 4 of the synthesis), tagging
  the project once.
- A one-week calendar: launch thread day 1, two singles a day, closing thread day 7.
- A Telegram version of the pitch, disclosure in the first line, two lengths.
- An Article only when a live event earns it: open with the fact and its UTC timestamp,
  reframe in the second sentence ("That reads like an outage report. It is closer to a
  compliance report, and the difference is the point of this piece."), then the mechanism,
  the record, what did not break, what the record cannot show, check it yourself.

Post shape: record posts open with the number and its date; peer singles open with the
tagged peer's fact. No link in the body, link in the first reply. One tag per single; a
thread's roll-call post may tag up to five. End with one question or one stated
uncertainty. Disclosure last.

Three of those rules are stricter than the Sable singles of 9 Sep 2026, on purpose: those
put the link in the body, only one of twelve ended with a question, and two thread posts
tagged five handles. The X playbook's diagnosis (link in the reply, ask something) came
after they were drafted. Follow the rules here, not the exemplar, on those three points.

## Step 6: The watch (optional, and the part that lasts)

Only when the asker wants a running public record. Fork `../sable-whitepaper-watch` into a
sibling repo `../<slug>-watch` (public, under the founder's GitHub account CryptoWesAI
unless the project hosts it), then:

- Configure the whitepaper URL, the mint or contract, the public endpoints, the RPC
  (`SOLANA_RPC` env var or the chain's equivalent).
- `claims.json`: one entry per announced feature from the step 1 table: `id`, `title`,
  `announced`, `announcement` (verbatim), `source`, `docs`, `docs_say`, `probes`
  (method, path, note), and one `control` probe on a route known to answer, so a 404 on the
  claim is distinguishable from a network failure.
- `peers.json`: the project's own key pages plus each peer's home and docs, for the
  page-changed watch.
- GitHub Action on two cron lines (`17 * * * *` and `47 * * * *`); a single hourly cron ran
  about seven times a day in practice. Snapshots, sentence diffs and a CHANGELOG stay in the
  repo, public.

Standard library Python only, so it runs anywhere. The site that reads it (an observatory
page) is a separate build and not part of this skill.

## Step 7: Self-review, hand-over, record

Before anything is called done, a reviewer sub-agent (Sonnet) gets the dossier and this
checklist and reports every miss:

- Every figure has a date and a source; every quote traces to a raw text line (pdftotext
  output or raw HTML), not to a fetch summary.
- Addresses verified through the project's own channels; handles verified from the peers'
  sites and CoinGecko.
- Each peer sheet has all seven sections and the three-part section 6.
- The synthesis explains why the two lists differ.
- Every post under 280 with the link as 23; one tag per single; no link in the body; no
  price talk.
- Disclosure: wherever a token the founder holds is named, the holder line. When the asker
  is the project itself, the pieces say so ("from the team") instead of "not affiliated";
  a project's own posts about its own token are marketing communications under MiCA and
  must be labelled as such.
- No em-dashes anywhere.
- The brief's Monday-morning job is answered in the playbook's first week.

Then state what was run and what it returned (the verification plan from step 0, executed).
Write the `CURRENT_STATE.md` entry in the same session. If a decision was taken (a peer
excluded, a claim marked unverifiable), one line in `docs/decisions/DECISIONS_LOG.md`.

If, and only if, the founder switched on income mode: run the Founder Filter, the crypto
reality check (where is the edge, who is the counterparty, MiCA and Dutch tax), and end with
a stance: Buy / Integrate / Configure / Automate / Build / Delay.

## Gotchas

- **WebFetch paraphrases.** It once misattributed the opening line of Sable's manifesto.
  Quotes come from pdftotext output or raw HTML fetched as text, never from a fetch summary.
- **The version label lies.** Sable's whitepaper was re-rendered on 2 Sep 2026 with changed
  text under the same "v2.0, August 2026" cover. Hash the PDF, snapshot the text, diff
  sentences. Re-extract before every quote.
- **pdftotext differs by platform.** The mingw64 build renders an em dash as "--" and splits a
  few sentences differently from the Ubuntu build. One environment is the record (the CI
  runner for Sable); never hand-generate the sentence file locally and call it truth.
- **X cannot be read for free.** Every unauthenticated route died in Aug 2026 (nitter,
  syndication, jina, fxtwitter). Social figures come from the account owner's analytics or
  the pay-per-use API (about $0.005 per post read since Feb 2026). Say so in the surface
  page instead of guessing.
- **CoinGecko history needs a key.** Since 2024 the full market-chart history is keyed; the
  coin endpoint still gives genesis, ATH with date, current and a one-year series, which is
  what `cg-history.mjs` uses.
- **Aggregators disagree with each other.** Tinfoil's revenue, Sandcastles' user count,
  Premium+ pricing: three sources, three numbers. Mark directional or leave out.
- **A quoted figure was wrong once.** Post 8 of the Sable thread misread the status probe
  interval and was corrected after posting. Walk every figure back to its source line
  before the founder posts; a thread is cheaper to fix in draft.
- **Solana public RPC refuses browser origins.** Server-side fetch works; a page needs a
  proxy with fixed JSON-RPC bodies. Irrelevant for the dossier, decisive for a site.
- **A peer without a token still gets a sheet.** Replace the market cap section with a
  third-party revenue or valuation estimate, flagged, and keep it off the ladder.
- **The two lists confuse readers unless explained.** The field (docs answer the columns)
  and the ladder (traded tokens in the narrative) differ on purpose; section 1 of the
  synthesis exists to say why.
- **Count the link as 23 characters.** X shortens every URL to 23; a post that fits with the
  raw URL may not fit with the tag added.
- **Hiring pages are strategy documents.** "Two Rust engineers, no devrel" said more about
  Sable's next six months than the roadmap did. Read careers first.
- **Team size sets the ceiling of what they can act on.** A two-person team cannot run a
  ten-item tactics list; rank tactics by effort to effect and say which three to do first.
- **The observatory site is not the dossier.** The Sable page took many sessions (door
  simulation, verifier, chart, game, voice guide). The dossier is documents plus an optional
  watcher; a page is a second decision.
- **Cron is not hourly.** GitHub's `17 * * * *` ran about seven times a day over four days;
  a second cron line helped, a VPS cron calling `workflow_dispatch` is the real fix.
- **Sub-agents write em-dashes.** Four of the thirteen Sable sheets came back with them
  despite the house rule. Put "no em-dashes" in every agent brief and grep the outputs
  (`grep -c -- '—'`) in the step 7 review; the reviewer that checked only the skill file
  missed them.
- **The reviewer pass pays for itself.** A fresh-operator review of this skill on the day it
  was written found eight misses, among them a folder layout nobody had used and three
  rules that silently contradicted the exemplars. Run it before the first real use, not
  after.
