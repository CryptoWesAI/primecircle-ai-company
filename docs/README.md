# Docs Index

This folder holds the working documentation layer for PrimeCircle AI Company.
It sits *underneath* the 5 canonical root files, which remain the single
source of truth for identity, mission, and current state:

- `CLAUDE.md` / `PROJECT_KERNEL.md` — operating instructions and principles
- `CURRENT_STATE.md` — live status: stage, milestone, candidate stack
- `PAOF_CONSTITUTION.md` — immutable PAOF principles
- `START_HERE.md` — session bootstrap order

## Layout

- **`WORKSPACE_MAP.md` — who owns what**: sorts the whole workspace into PrimeCircle
  (company/framework), PrimeCircle (reusable chatbot product), and Alien / AB
  Uitvaartzorg (client). Read this first if it's unclear where something belongs.
- `paof/` — methodology write-ups as PAOF (design/build/secure/operate)
  practice accumulates per master-skill domain
- `research/` — market/niche research (uitvaart sizing, local-MKB niche comparison)
- `decisions/DECISIONS_LOG.md` — running log of approved vs. draft decisions (**what we
  decided, and why**)
- `LEARNINGS.md` — running journal of lessons, insights and mistakes-not-to-repeat (**what
  we learned**). Grows over time; updated at milestones alongside `CURRENT_STATE.md`
- `compliance/` — product-wide compliance (EU AI Act Art. 50 disclosure)
- `offers/` — GTM strategy (`aanbod-uitvaartniche.md`) + `OFFER_TEMPLATE.md` (PrimeCircle-level only)
- `build/` — build recipes (trades missed-call MVP)

Client-specific docs live with the client, not here: see
`../clients/<name>/docs/` (e.g. `../clients/ab-uitvaartzorg/docs/`).

See also `../roadmap/LEARNING_ROADMAP.md` (master skills tracker) and
`../workflow/DEV_WORKFLOW.md` (commit/branch conventions).
