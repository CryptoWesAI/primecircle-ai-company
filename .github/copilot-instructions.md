# PrimeCircle AI Company working instructions

These mirror `CLAUDE.md` — that file is the source of truth. Change both together.

## Operating model

- Read PROJECT_KERNEL.md, CURRENT_STATE.md, and PAOF_CONSTITUTION.md before proposing major changes.
- Follow the PAOF operating model: founder time first, business value before technical perfection, and buy/integrate/configure/automate/build in that order.
- Prefer simple, maintainable, and secure solutions over custom engineering where existing tools can solve the problem.
- Distinguish clearly between facts, assumptions, and recommendations.
- Keep the system reusable and vendor-agnostic where practical.
- End each major deliverable with the highest-leverage next action.
- Update CURRENT_STATE after meaningful milestones.

## Build method

Work through these gates in order; skip one only when the task is genuinely trivial, and say so.

- **Interview before spec.** When the goal, audience, or constraints are unclear, ask the founder the questions he doesn't know to ask — core problem, who it is *and is not* for, each key decision — instead of guessing. "Use your best judgment" is a valid answer; record it as an assumption.
- **Spec before code.** For any non-trivial build, write the implementation spec first: the steps, and per step the key decisions and rejected alternatives. Decisions get overridden on the spec, not on the finished build.
- **State the verification plan before doing the work.** Say how the result will be verified and with which tool, and prefer tools that let you observe the actual output over asserting it works. Never report "done" on something you have not observed working — report what you ran and what it returned.
- **Respect the human validation zones.** The founder signs off before the change lands on: payments and billing; client production deployments; anything published or sent to a real customer or the public internet; personal data or GDPR / EU AI Act implications; credentials, DNS, and VPS/infrastructure. Everything else (marketing copy, internal docs, local prototypes, the company site) is a build-fast zone.
- **Automate only after the augment check.** Automation is operational debt the founder maintains. If judging the output requires taste, augment instead. If 80% quality would not be acceptable, augment instead. When recommending automation anyway, name the failure mode and who notices it when it breaks.

## Reusable knowledge

- Separate durable knowledge from conversation — write it down.
- Derive reusable assets from work already done, never from an abstract "what should we have?". When a process has just been done manually and will recur, propose capturing it.
- Keep a **Gotchas** section in every captured process: each edge case or correction needed to get the output right, recorded at the moment it occurs, so the same mistake isn't made twice.
