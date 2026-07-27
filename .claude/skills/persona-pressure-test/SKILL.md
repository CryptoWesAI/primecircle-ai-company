---
name: persona-pressure-test
description: Pressure-test a piece of persuasive copy (hero, pitch, pricing page, sales script) against genuinely skeptical simulated leads before trusting that it converts. Spawns 2-4 sub-agents as distinct, critical buyer personas who have only seen the EXACT copy, then runs a real multi-round persuasion conversation (you as founder, them as the lead) until each reaches a decisive verdict: converts, or names a specific remaining blocker. Use whenever a marketing/sales artifact needs validation beyond "does this read well to me", especially after a redesign, before a launch, or when a founder asks "will this actually persuade someone". Not for internal docs or code, only for anything meant to persuade an external buyer.
license: MIT
---

# Persona Pressure Test

A redesigned hero, pitch, or pricing page reading well to the person who wrote it
proves nothing. This skill forces the artifact to survive contact with someone
whose job is to NOT be easily convinced, and produces a written verdict plus a
list of what still needs fixing, before the founder finds out the hard way with a
real prospect.

## When to use

- A landing page, hero section, or pricing page just got rewritten or redesigned
  and needs validation beyond "does this look good".
- A founder is about to launch an offer and wants to know if the pitch actually
  lands with a skeptical buyer, not just an agreeable one.
- Deciding between two versions of persuasive copy and want evidence, not a
  coin flip.

Skip it for internal documentation, code, or anything not meant to persuade an
external buyer, that is what code review and the `simplify` skill are for.

## The method

### Step 1 — Extract the exact artifact

Pull the literal copy the persona will react to: headline, subhead, CTA labels,
any interactive/animated proof elements, trust signals, pricing (or its absence).
Do not summarize or paraphrase it for the persona, hand them precisely what a
real visitor would see. If the persona reacts to a paraphrase instead of the real
copy, the test result is worthless.

### Step 2 — Design 2-4 distinct skeptical personas, not one generic skeptic

Each persona needs its own OBJECTION ANGLE, not just a different name. Cover the
angles that actually kill deals in this market:

- **Trust/price-burned**: has been ripped off before, reads vague pricing as a
  red flag, wants specifics and verifiable numbers, not promises.
- **Effort/complexity-averse**: doesn't care if it works, cares whether it creates
  ongoing work for them; wants a concrete number for setup time and ongoing effort.
- **Already-has-something / differentiation-focused**: has a working, if mediocre,
  version of the solution already; needs to be shown what specifically beats what
  they already cobbled together, and probes for lock-in.

Adjust the angles to the actual market. Give each persona a real name, age,
business context, and a specific reason for their skepticism, generic personas
produce generic (useless) objections.

### Step 3 — Spawn all personas in parallel for their opening reaction

Each persona gets ONLY: the exact artifact copy, their character brief, and an
explicit instruction to give their unfiltered first reaction, understanding what
is being offered, what's unclear or suspicious, and one or two sharp specific
questions. Spawn them as **parallel, isolated** Agent calls, exactly like the ADHD
skill's diverge phase, so no persona anchors on another's phrasing.

Instruction template for each persona agent:

> You are playing [name], [age], [business context], [specific skepticism
> reason]. You are NOT hostile, just guarded, and you ask pointed, specific
> follow-up questions instead of vague objections. Here is exactly what \[the
> artifact\] says: \[verbatim copy\]. Give your genuine first reaction: what do
> you understand the offer to be, what's unclear or suspicious given your
> background, and 1-2 sharp specific questions you'd want answered before even
> considering a call. Do not be persuaded yet. 120-200 words. Leave real openings
> for a response, don't just shut the door.

### Step 4 — You respond as the founder, for real

Read each persona's objections and write a genuine, specific, HONEST response
grounded in what the product/service actually does (pull from the real knowledge
base, config, or docs, never invent a claim the business can't back). Vague
reassurance loses every time in this test; specific, checkable answers win. If an
honest answer includes admitting a real limitation, include it, personas reward
honesty about limits more than they reward a claim that sounds too clean.

### Step 5 — Continue each persona via SendMessage, not a fresh spawn

Use `SendMessage` to the same agent ID so the persona keeps its established
character and memory of what was already said. Feed it your founder response and
instruct it explicitly, every round:

> Stay in character, same skepticism, same voice. Do not cave just because this
> is a roleplay exercise, a real skeptical buyer with your background would only
> move forward if the specifics genuinely add up. If an answer closes a worry,
> you may acknowledge that specifically, but keep probing anything still vague or
> that raises a new concern.

Run 2-4 rounds per persona. Stop when each persona reaches a decisive verdict:
either explicit conversion ("I'd book the call") or a clearly named, specific
remaining blocker. Do not keep grinding rounds once the verdict is clear, extra
rounds past that point add noise, not signal.

### Step 6 — Separate artifact problems from business problems

Read every objection and sort it into exactly one bucket:

1. **The artifact caused it** (unclear copy, missing information, confusing
   layout). Fix the artifact and re-test that persona specifically.
2. **A real downstream business/product gap surfaced**, unrelated to the
   artifact's clarity (a pricing tier that doesn't exist, an unanswered FAQ, a
   process inconsistency). Do NOT patch the artifact to paper over this, write it
   up as a separate recommendation for the founder to decide on.

Conflating these two produces either an over-engineered artifact trying to solve
a product problem, or a shipped artifact that still has the real gap.

### Step 7 — Write the report

One table: persona, core objection, outcome. Then the per-persona narrative
(opening objection, what closed it or didn't, final verdict, in the persona's
own words, quoted). Then a clean split: artifact problems (now fixed, with
evidence) versus business/product findings (recommendations, not fixes). End
with a clear verdict: is the artifact validated, or does it need another pass.

## Gotchas

- **Sub-agents want to be agreeable.** Left to their own judgment, a persona
  agent will soften and convert too easily because that's the path of least
  resistance for a cooperative model. The explicit "do not cave" instruction has
  to be repeated every single round, not just in the opening brief, or the test
  quietly degrades into a strawman that always agrees.
- **Give personas the literal copy, never a summary.** A paraphrase lets the
  persona react to your intent instead of your actual words, which hides exactly
  the ambiguity you're trying to find.
- **Don't invent numbers you can't back.** If a founder-response round needs a
  concrete figure (a price range, a percentage) that isn't in the real knowledge
  base, it's fine to test with a plausible placeholder to see if specificity
  itself changes the outcome, but flag it explicitly in the report as a test
  assumption, not settled copy, so nobody accidentally ships an invented number.
  This came up directly: a persona asked for a setup-price range, none existed in
  the real knowledge base, a plausible range was used for the test and clearly
  flagged in the report rather than added to the live page, leaving the real
  number for the founder to decide.
- **A partial-conversion persona is a good outcome, not a failed test.** If a
  persona wants a follow-up call but explicitly for a product variant that
  doesn't exist yet, that's a genuine, valuable finding (a real market segment
  with a real unmet need), not evidence the copy failed. Report it as a product
  recommendation, don't force the copy to overpromise a tier that isn't real.
- **Repeat compound information (like total price) together, every time.** In
  testing, a persona who was told the setup-cost range in one round and the
  monthly price in an earlier round still asked for both again together later,
  because they think in total cost, not in whichever piece was said most
  recently. Any founder response involving money should restate the full picture,
  not assume earlier mentions are remembered.
- **Stop at a decisive verdict, don't pad rounds.** Two to four rounds is usually
  enough to separate real objections from theater. Continuing past a clear
  verdict for "more rigor" wastes agent calls without adding signal.
