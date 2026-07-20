# Learning Roadmap

We do not learn first and build later — every skill is mastered while
building the company, and every skill practiced must produce a real artifact
that becomes part of PrimeCircle (a doc in `docs/`, a workflow, a decision, a
real Claude skill, product code, etc.). No row here should stay "in progress"
without a linked artifact for long.

| Master Skill Domain | Sub-Skill | Priority | Status | Artifact Produced | Link |
|---|---|---|---|---|---|
| Platform Expertise | Hostinger MCP capability map (hosting, Node.js/cron deploy, DNS/domains, e-commerce/storefront, Reach email-CRM, WordPress) | P1 | researched | This roadmap row + `docs/decisions/DECISIONS_LOG.md` draft entry | `docs/decisions/DECISIONS_LOG.md` |
| Product & Business Design | Offer validation methodology (evidence over opinion, smallest sellable version, price-before-build) | P1 | done | `docs/paof/product-business-design.md` | `docs/paof/product-business-design.md` |
| AI Automation Engineering / Solution Design | **Config-driven reusable chatbot product** — knowledge-grounded bilingual assistant embedded in the AB Uitvaartzorg site (NL+EN); first customer live-verified, and refactored into a per-customer template (the "generic core, configurable vertical") | P1 | working end-to-end via OpenRouter; templated + proven reusable with a 2nd demo customer (one env var re-brands everything); packaged as an isolated Docker project for the VPS | `chatbot/` (generic server + widget + `customers/`), `clients/ab-uitvaartzorg/deploy/` | `chatbot/customers/README.md`, `clients/ab-uitvaartzorg/deploy/README.md` |
| Product & Business Design | First commercial offer definition (actual offer — needs founder's problem/customer input, not researchable) | P1 | not started | | `docs/offers/` |
| AI Governance & Security | GDPR / EU AI Act baseline (what applies to a 1-person AI automation vendor) | P2 | done | `docs/paof/ai-governance-security.md` (researched against current official sources) | `docs/paof/ai-governance-security.md` |
| AI Automation Engineering | Cron-based automation on existing hosting vs. n8n — when each is warranted | P2 | done | `docs/paof/ai-automation-engineering.md` | `docs/paof/ai-automation-engineering.md` |
| Platform Expertise | n8n / Supabase / Twilio / OpenRouter / Next.js / Docker / GitHub — only for gaps Hostinger doesn't cover | P3 | not started | | |
| Solution Design | — | P3 | not started | | |
| Platform Architecture | — | P4 | not started | | |
| Founder Operations | Engineering foundation scaffold | done | done | docs/, roadmap/, workflow/, .claude/skills/ structure | `docs/decisions/DECISIONS_LOG.md` |

## Research note: Hostinger MCP capability map (2026-07-12)

This environment has Hostinger MCP servers already connected — meaning these
are real, usable tools today, not hypothetical candidates:

- **hosting** — create websites, deploy Node.js apps from archive, manage
  cron jobs, create/manage MySQL-style account databases, subdomains, PHP
  config. Covers running a small backend/automation layer without new infra.
- **domains** — search/purchase domains, DNS records, WHOIS, forwarding.
- **wordpress** — full WP install/plugin/theme/WooCommerce management. Useful
  if a vertical customer's site is already WordPress-based.
- **ecommerce** — storefronts, digital/physical products, sales channels,
  shipping, manual payment methods. Can package and sell an offer directly.
- **reach** — contacts, segments, profiles across "reach profiles" (email
  marketing / lightweight CRM). Useful for offer validation outreach and
  nurture sequences.
- **billing** — manages PrimeCircle's own Hostinger subscriptions/payment
  methods (internal cost control, not customer-facing).

**Gap vs. candidate stack:** Hostinger does not appear to replace Supabase
(no general-purpose relational/Postgres-with-auth backend beyond basic
"account databases"), Twilio (no SMS/voice/WhatsApp), or OpenRouter (no LLM
routing) — those still need their own Buy/Integrate research if the first
offer needs them. Cron jobs are a real but limited substitute for n8n-style
visual workflow automation; fine for simple scheduled tasks, not for
multi-step branching automations.

**Draft recommendation (not yet approved — see decisions log):** don't
provision n8n/Supabase/Twilio until the first commercial offer's actual
requirements are known. Default to Hostinger hosting + cron + Reach + storefront
for the MVP delivery mechanism where sufficient; escalate to a dedicated tool
only for the specific gap it fills (e.g., Twilio only if the offer needs
SMS/voice, Supabase only if the data model outgrows Hostinger's databases).

Add rows as sub-skills get identified — don't pre-fill placeholders beyond the
7 master domains from the project bootstrap.
