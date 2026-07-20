# CURRENT_STATE

## Objective

Build a managed AI automation business that can initially be operated by one founder and later scale into a platform company.

## Current Stage

First build live (AB Uitvaartzorg) → validating a niche pivot to local trades.

First customer: AB Uitvaartzorg (founder's schoonmoeder, Alien Bisschop —
uitvaartonderneming in Steenwijkerwold). First build: a knowledge-grounded,
bilingual (NL+EN) AI chat assistant, embedded on all 27 pages of her website.
**Working end-to-end** via OpenRouter (`google/gemini-2.5-flash-lite`) — live-tested:
grounded costs, safe escalation on grief input, no invented prices, EN steering.
**LIVE on HTTPS (2026-07-14):** the whole stack (NL+EN website + config-driven
chat + token dashboard) runs as one isolated non-root Docker container on the
founder's Hostinger VPS (`root@31.97.123.34`, `/opt/ab-uitvaartzorg`, restart
unless-stopped), served over **HTTPS at `https://ab.primecircle.cloud`** via the
VPS's existing Traefik (Let's Encrypt cert, HTTP→HTTPS redirect). Raw port 8091
is NOT published anymore — access is HTTPS-only. Staging domain `primecircle.cloud`
(free 1st year, claimed as VPS hostname; renews ~₹2536 on 2027-06-18 — auto-renew
still ON, disabling it was blocked as a financial action, founder to toggle in
hPanel). Dashboard token rotated; value only in gitignored `.env`. Verified
end-to-end incl. live OpenRouter chat over HTTPS.
Since deploy (2026-07-15/16): **dashboard v2** live — website visitors + chatbot
usage, fully anonymized (no IP/UA; daily-rotating hashed visitor id; bot filter),
site-styled + auto-refresh + "In één oogopslag" summary. **EU AI Act Art. 50
disclosure baked into the shared widget** (opening notice + persistent "AI" badge +
clear styling — every customer inherits it; see `docs/compliance/ai-transparantie-art50.md`).
Alien's project pushed to **private `CryptoWesAI/ABUitvaart`** (66 files, secrets
excluded/verified). Domain auto-renew: founder set a WhatsApp reminder instead of
disabling (keeps the keep/stop choice open). Before pointing Alien's REAL domain at
it: Alien's sign-off on tone/boundaries, paste the privacy paragraph into the live
`privacy-statement.html`, OpenRouter data-policy check.
Note: the VPS's other project claims the apex `primecircle.cloud`/`www` in Traefik
and its ACME fails — not ours (we only use the `ab.` subdomain).
See `clients/ab-uitvaartzorg/deploy/README.md` and `docs/decisions/DECISIONS_LOG.md`.

## Strategic direction (pivot under validation, 2026-07-16)

Objective niche analysis concluded the winnable funeral segment (solo/zzp) is too
LOW-VOLUME to sustain a high-value retainer (see `docs/research/uitvaartniche-marktonderzoek.md`).
**Leading direction: a done-for-you "mis nooit meer een klant" service for local
trades** (installateurs/loodgieters — huge TAM, cash-rich, poorly digitized; missed
call = lost €100-1200 job). Wedge = missed-call → text-back / 24-7 lead capture; the
pitch is ROI-arithmetic (suits the founder's selling weakness). AB Uitvaartzorg stays
a reusable chatbot **reference case**, not the growth market. Model = done-for-you
(build+run+maintain; sell outcome, not software). Financials + stack + MVP recipe:
`docs/research/niche-vergelijking-lokaal-mkb.md`, `docs/offers/aanbod-uitvaartniche.md`,
`docs/build/mvp-missed-call-textback.md`. **Current step: validate-before-build** — a
casual discovery conversation with a warm trade contact (who is overbooked → use as
referral bridge to hungry prospects, not customer #1), THEN build MVP v0.
(Fase B funeral supplier-ordering/invoicing app is deprioritized behind this.)

## Immediate Goal

Replace employment income through predictable recurring revenue.

## Principles

- Founder Time first.
- Business before perfection.
- Generic core, configurable verticals.
- Use existing platforms before building custom software.

## Candidate Stack

Oriented to the trades "never miss a lead" direction, EU-clean on the owned VPS
(Buy → Integrate → Configure → Automate → Build):

- **n8n** — orchestration/glue (self-host on VPS)
- **Bird (ex-MessageBird)** — NL telephony/SMS/WhatsApp, EU data (Twilio for the
  fastest throwaway MVP — native Studio flow + n8n node)
- **OpenRouter** — chatbot/LLM (lead capture; reuse existing config-driven widget)
- **NocoDB / Baserow** — CRM / lead store (self-host)
- **Retell AI** — Dutch voice agent (LATER, after validation)
- **Cal.com** — booking (optional); **Mollie** — payments (EU)
- VPS + Docker + Traefik (owned infra)
- Alternative "Buy" all-in-one: **GoHighLevel** (agency platform, missed-call-text-
  back built in) — US-centric (A2P/GDPR/WhatsApp friction); steal its wedge, not the lock-in.

These are candidates, not final decisions.

## Next Milestone

- [x] Create GitHub repository — `github.com/CryptoWesAI/primecircle-ai-company`
- [x] Finalize PAOF structure — see `docs/`, `roadmap/LEARNING_ROADMAP.md`, `workflow/DEV_WORKFLOW.md`, `.claude/skills/`
- [x] First build live (AB Uitvaartzorg chatbot + dashboard, HTTPS, private repo, Art. 50 disclosure) — reference case done
- [ ] **Validate the trades wedge** — one casual discovery conversation with a warm/hungry trade contact (crux: missed calls/week × job value × willingness-to-pay). Script ready. THEN build MVP v0 (`docs/build/mvp-missed-call-textback.md`). Use the `opportunity-check` skill for any further niche/offer decisions.
