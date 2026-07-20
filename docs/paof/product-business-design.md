# Product & Business Design — Offer Validation Methodology

A reusable method for filling out `docs/offers/OFFER_TEMPLATE.md`. This is
methodology, not an instantiated offer — an actual PrimeCircle offer requires
founder input (industry knowledge, network, specific customer problems seen
firsthand) that can't be researched or invented from inside this repo.

## Principle: evidence over opinion

An offer is a hypothesis until it has evidence. "I think funeral homes need
X" is a draft idea, not a decision, until someone who runs a funeral home has
said so — ideally with money, a signature, or a scheduled call, not a
compliment. Distinguish these explicitly in every offer file, same as
`docs/decisions/DECISIONS_LOG.md` distinguishes `approved` from `draft`.

## Sequence

1. **Problem before solution.** Write down the customer's problem in their
   words, from a real conversation, before writing down what PrimeCircle
   would build. If the problem line can't be filled from a real conversation,
   the offer isn't ready to draft yet — go have the conversation first.
2. **Smallest sellable version.** Per the Founder Filter's "is this the
   smallest sellable solution?" — the first version of an offer should be
   the narrowest thing a real customer would still pay for, not the full
   vision. Expand only after it sells.
3. **Price it before building it.** State a real price and ask for it (a
   pre-sale, a deposit, a signed pilot agreement) before the automation is
   built. If nobody will commit before it exists, that's evidence, not a
   reason to build faster.
4. **One evidence-gathering channel at a time.** Pick the cheapest way to
   reach 5-10 real prospects in the target segment (existing network, a
   niche community, a direct outreach list via `hostinger-reach`) rather than
   building a marketing funnel before there's a validated offer to put in it.
5. **Verdict, not vibes.** Every offer file ends in a Founder Filter verdict
   (Buy/Integrate/Configure/Automate/Build/Delay) and a status
   (draft/testing/validated/abandoned). "Abandoned" is a normal, healthy
   outcome — it means real evidence disagreed with the hypothesis, which is
   the method working, not failing.

## Anti-patterns to avoid

- Building the automation before anyone has agreed to pay for it.
- Treating polite interest ("that sounds cool") as validation.
- Designing for a whole vertical before one customer in it has paid.
- Letting offer research stall on competitive analysis or market-sizing
  spreadsheets instead of talking to 5 real prospects.

## When to escalate past this doc

Once an offer reaches `validated` status with a real paying (or committed)
customer, the next PAOF artifact is the delivery mechanism decision — see
`docs/paof/ai-automation-engineering.md` for the cron-vs-n8n-vs-build call,
made against that specific offer's actual requirements.
