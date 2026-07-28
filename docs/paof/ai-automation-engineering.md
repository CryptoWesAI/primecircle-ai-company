# AI Automation Engineering: Cron vs. Workflow Orchestration

Practical decision framework for choosing an automation mechanism for a
PrimeCircle offer's delivery, written against what's actually available today
(see `reference: Hostinger MCP` in [[LEARNING_ROADMAP]] / decisions log).
Revisit this once real offers expose real requirements — this is a starting
default, not a permanent architecture.

## The three tiers

**1. Hostinger cron job** (already available, zero new cost/setup)
Good fit when the automation is: a single scheduled action, no branching
logic, no need to react to an external event mid-run, and failure just means
"try again next run." Example: nightly export of a client's form submissions
into a summary email; a weekly digest; a scheduled data sync with one
destination.
Limits: no visual run history/debugging, no built-in retry-with-backoff, no
easy way to chain "if this then that" across services, no webhook trigger (cron
is time-based only).

**2. n8n (self-hosted or n8n cloud)**
Good fit when the automation needs: multiple branching steps, third-party
webhooks as triggers (a form submit, an incoming SMS, a calendar event), retry
and error-branch handling, human-readable run history for debugging a
client's automation when something breaks, or 300+ pre-built service
integrations instead of hand-rolled API calls.
Cost: either hosting overhead (if self-hosted — another service to secure,
patch, and keep alive, which directly taxes founder time) or a recurring SaaS
fee (n8n cloud). This is real ongoing cost, not a one-time setup.

**3. Custom code / Build**
Only justified when neither of the above can express the logic, or the volume
justifies it (i.e. real recurring revenue already exists to justify the
maintenance burden). Per PAOF, this is last, not first.

## Decision rule

Default to **cron** for any single client's first automation. Escalate to
**n8n** only when a specific, real requirement needs branching, webhooks, or
multi-service chaining that cron structurally cannot do — not preemptively
"because it'll probably need it later." Never start at "custom code."

This mirrors the Founder Filter: cron costs nothing new and ships today;
n8n is the right call once it's *the* thing standing between the founder and
delivering a sold offer, not before.

## Open question to revisit

If/when 3+ client automations need n8n-class orchestration, re-evaluate
self-hosted n8n (on the same Hostinger hosting, if it supports the runtime)
vs. n8n cloud vs. an alternative — at that point there's real usage data to
decide with, instead of guessing now.
