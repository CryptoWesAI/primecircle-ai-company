---
name: programmatic-seo
description: >
  Build a quality-gated set of local / programmatic SEO pages at scale for a local
  service business (a PrimeCircle client) or for PrimeCircle's own marketing — WITHOUT
  triggering Google's doorway-page penalty. Covers: scope + margin-driven clusters,
  geo/keyword research, right-sizing the page set, a uniqueness template (content +
  structural + linking), unique-content generation beyond variable-swaps, a 3-level
  quality gate, LocalBusiness/service-area schema, XML sitemap + internal linking, and
  batch-ship-then-monitor. Use when generating city / service-area / "[service] in
  [town]" pages, scaling local SEO content, or building an organic lead-generation
  engine. Distilled 2026-07-16 from the "Claude Code SEO" technique + local-SEO best
  practice. This is a PHASE-2 growth lever — validate the wedge first (see CURRENT_STATE).
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Glob, Grep
---

# programmatic-seo

Generate local SEO pages at scale that actually rank and convert — as **lead
generation** that complements PrimeCircle's lead **capture** (missed-call → WhatsApp).
Two applications:

1. **As the product (highest value):** give each trades client **service-area pages**
   so THEIR site ranks for real consumer demand ("loodgieter [stad]", "spoed dakdekker
   [stad]"). This turns your offer from *catching* leads into *generating* them too.
2. **For PrimeCircle's own marketing:** pages targeting the trade-owner buyer ("meer
   klanten als [vak] in [stad]") — useful but thinner search volume; weight application 1.

## The #1 rule (read before generating anything)

**Scale without depth is a liability.** Thin, city-swapped "doorway pages" get
penalized hard — Google demotes them AND drops sitewide trust (~75% average organic
traffic drop; recovery takes weeks–months of cleanup). John Mueller flagged
1,300 near-duplicate location pages as doorway abuse.

→ The goal is **15–20 excellent pages, not hundreds of thin ones.** Right-size, quality-
gate, and expand only what earns rankings. Quality is the strategy, not scale.

## Service-area vs location pages (get this right)

- **Who travels?** Customer comes to you → *location page*. **You go to the customer →
  *service-area page*.** Trades (loodgieter, dakdekker, installateur) = **service-area
  pages.** Use `LocalBusiness` schema with `areaServed`, not a fake storefront address.

## Method (8 phases)

1. **Scope + clusters.** 3–5 macro clusters mapped to **margin drivers** (the services
   that make money), not just keywords. E.g. "cv-ketel vervangen", "spoed loodgieter",
   "badkamer renovatie".
2. **Geo + keyword research.** Per cluster, pull candidate keywords with **volume +
   difficulty** (Semrush/Ahrefs/DataForSEO, via MCP if connected). Prefer **low intent-
   volatility** terms (stable SERPs = safer programmatic targets). List the target
   towns/regions the client actually serves.
3. **Right-size the set.** Pick **8–20 towns**, prioritizing where the client already
   works or where competition is low. Resist "every town in NL" — that's the doorway trap.
4. **Uniqueness template.** Design one template with **three kinds of uniqueness**:
   (a) *content* — intent-specific text (**≥60% unique per page**), (b) *structural* —
   different modules/rows per variation, (c) *linking* — different sibling/internal links
   per cluster. Required per-page local elements: services offered there, common job
   types, typical response times, **proof of work in the area**, real local testimonials,
   regional photos, and local-specific FAQs.
5. **Generate unique content per page.** Go beyond variable substitution — write genuine,
   locally-relevant copy that serves user intent (Helpful Content). Use real data points.
6. **Quality gate (3 levels + checklist).** Block any page that fails:
   - *Data validation* (complete, accurate inputs) → *template validation* (substantive
     output) → *post-deploy monitoring* (indexation + rankings as early signals).
   - Per-page checklist: **≥300 words meaningful content · ≥3 unique data points ·
     working internal links · valid structured data · correct canonical · passes Core
     Web Vitals.** Fails any → don't publish.
7. **Technical.** `LocalBusiness`/service-area JSON-LD (`areaServed`), add every page to
   `sitemap.xml`, contextual internal links from relevant service/hub pages, correct
   canonicals, fast pages.
8. **Ship in batches + monitor.** Publish a small batch, watch indexation + rankings,
   then expand only the patterns that work. Kill or improve non-performers.

## Doorway red flags (auto-reject)

- City name swapped, everything else identical · <300 words · no local proof/data ·
  no internal links · generated "just because the town exists" (no real service demand)
  · publishing hundreds at once. Any of these → stop.

## Tooling

- Keyword/volume data: Semrush, Ahrefs, DataForSEO (connect via MCP for live data).
- Data/scraping for local facts: Firecrawl or similar.
- Rendering: static generation or dynamic routes (e.g. `[service]/[stad]`), then a
  quality-gate script before publish.
- Measurement: privacy-friendly analytics + Search Console (indexation, queries, CTR).

## Output

A right-sized set of quality-gated, schema-marked, internally-linked service-area pages
+ updated sitemap, plus a short note on which batch shipped and what to monitor. Never
report raw page count as success — report indexed + ranking pages.

## Fit / discipline

This is a **Phase-2 growth lever**. Per the Founder Filter, don't build it before the
trades wedge is validated (see `CURRENT_STATE.md`, `docs/build/trades-landing-blueprint.md`
§5). When it's time, run `opportunity-check` on offering it as a paid add-on to clients.
