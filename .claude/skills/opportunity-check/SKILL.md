---
name: opportunity-check
description: >
  Pressure-test a candidate business niche, market, product idea, or commercial offer
  BEFORE building anything, and return a Go / Adjust / Kill verdict with the smallest
  next action. Runs the founder through PrimeCircle's decision funnel: the Founder
  Filter, a market-reality check (TAM, pain frequency×value, competition + price
  anchor, willingness-to-pay — using live web research), a scoring rubric, the four
  hard-won "traps" checklist, wig→motor packaging, a financial reverse-engineering
  from the revenue goal down to unit economics, and a validate-before-build plan.
  Use whenever the founder is weighing a new niche/vertical, a new wedge/feature to
  build, "should I target X market", pricing a new offer, or is tempted to start
  building before validating. Encodes the lessons from the funeral→trades analysis.
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, AskUserQuestion
---

# opportunity-check

A repeatable decision procedure for "is this worth pursuing, and if so what's the
single smallest thing to do next?" — built to protect the founder's scarcest resource
(time) and to break his historical pattern of building in isolation and giving value
away. Be objective, not encouraging; give real probabilities and name the risks.

Worked examples produced with this method live in `docs/research/` (niche comparison,
market sizing), `docs/offers/` (wig→motor offer), and `docs/build/` (MVP recipe).

## Step 0: Clarify the idea (don't assume)

Pin down in one sentence each: the **customer**, the **problem**, the **wedge** (the
one thing you'd sell first). If any is vague, ask before analysing. A fuzzy customer
is the #1 cause of a wrong answer downstream.

## Step 1: Founder Filter (fast kill-gate)

From PrimeCircle's `CLAUDE.md`. If it clearly fails several, stop here:
- Does it solve a real customer problem?
- Can it generate revenue?
- Does it save founder time (to deliver, not just for the customer)?
- Can an existing tool already solve it? (→ then Buy, don't build)
- Is this the smallest sellable solution?

## Step 2: Market reality (research, don't guess)

Use WebSearch/WebFetch to get REAL numbers. Cite sources. Establish:
- **TAM**: how many of this customer exist (national + local).
- **Pain frequency × value**: how OFTEN does the pain hit and what's each occurrence
  worth? (A €1000 problem once a year ≠ a €200 problem weekly.)
- **Competition + price anchor**: what already serves this? Crucially, **what does the
  cheapest incumbent cost?** That number anchors willingness-to-pay.
- **Willingness/ability to pay**: margins healthy? Segment cash-rich or struggling?
- **Adoption friction**: tech-savvy? regulated? emotionally sensitive?

## Step 3: Score (1-5 each; compare candidates side by side)

| Criterion | Weight it heavily because… |
|---|---|
| TAM | Enough bodies to reach the goal |
| Pain: frequency × value | The engine of willingness-to-pay |
| Competition-space (is it open?) | Avoid red oceans |
| Local & approachable | Warm intros, referrals, trust |
| Low regulatory/emotional load | Less risk, faster delivery |
| Fit with existing assets | Reuse the chatbot/VPS/delivery machine |
| Ability to pay | A great pitch to a broke buyer fails |

## Step 4: The four traps (check every one explicitly)

These killed or nearly killed earlier ideas. Name each verdict.

1. **Low-volume-winnable-segment trap.** Your *easiest-to-win* segment is often your
   *least valuable* (funeral solo: 1-3 events/mo → little time saved → low WTP). Ask:
   is the segment you can actually WIN high-frequency enough that the solution saves
   real, quantifiable time/money?
2. **Cheap-incumbent price-anchor trap.** If mature software already serves this at a
   low monthly price (funeral: FuneralView €39/mo), you CANNOT win on tool price. You
   must sell a *different category* — done-for-you SERVICE / outcome — or pick a wedge
   the incumbents don't cover.
3. **Give-it-away / dodge-the-money-conversation trap** (founder's recurring pattern —
   see memory `user-founder-selling-weakness`). Is there a **paid** validation step?
   Insist on charging, even a small founding-customer amount. Free ≠ validated.
4. **Build-in-isolation trap.** Is there a **validate-before-build** step — one real
   prospect conversation — BEFORE any code? If not, add it. This is non-negotiable.

**Preference rule:** favour niches where the pitch is **arithmetic, not persuasion**
("you lose €X/mo, this costs a fraction"). This routes around the founder's selling
weakness and de-risks acquisition.

## Step 5, If it passes: package as wig → motor

- **Wig (instap):** the cheap, easy-yes entry that builds trust + proof (often the
  website/chatbot). Not the profit centre — customer acquisition.
- **Motor (verdienmodel):** the recurring, higher-value done-for-you piece (the
  automation + retainer). This is where the money is.
- Never sell the wig *loose* as if it were the business. See
  `docs/offers/aanbod-uitvaartniche.md` for the template.

## Step 6: Financial reverse-engineering (goal → atom)

Work backwards, motivating each number:
1. **Unit economics:** setup fee, monthly ARPU (sanity-check vs the price anchor from
   Step 2), COGS/client, gross margin, hours to onboard + hours/mo to support.
2. **Goal in clients:** revenue target ÷ ARPU = # clients. State it plainly.
3. **Milestones with timing:** first paid client → ~10 clients (part-time viable) →
   the inflection where the day job becomes the ceiling → the goal. Give honest months.
4. **The atom:** the single smallest loop that proves the whole model (one client, one
   result, one payment). Everything above it is repetition.

## Step 7: Validate-before-build plan

- Identify ONE reachable real prospect. Check they're the RIGHT type (e.g. hungry-for-
  leads, not overbooked). If your warm contact is the wrong type, use them as a
  discovery source + referral bridge, not customer #1.
- Draft 3-4 casual questions that measure the crux (volume × value × WTP) without
  feeling like a pitch.
- Define the smallest buildable MVP (strip AI/extras; often an automation, not an AI
  product) and its "don't build yet" list. See `docs/build/` for the pattern.

## Step 8, Output: verdict + stance

Deliver, concisely:
- **Verdict:** Go / Adjust / Kill (with the reasoning).
- **Honest probability** of the modest and the ambitious outcome, plus the top risks.
- **Explicit stance** in PrimeCircle terms: Buy / Integrate / Configure / Automate /
  Build / Delay.
- **The one smallest next action** (usually a conversation, not code).

Persist anything durable to `docs/` (research → `docs/research/`, offer →
`docs/offers/`, build recipe → `docs/build/`) and update `CURRENT_STATE.md` if the
direction shifts. Save non-obvious founder/strategy context to memory.
