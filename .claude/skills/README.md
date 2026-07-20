# Reusable Skills Convention

Real, reusable Claude Code skills for PrimeCircle land here — but only once a
workflow has actually proven repeatable through real work. This is not a
place for one-off notes or aspirational skills; those belong in `docs/paof/`
until there's a concrete, repeatable task to automate.

## Installed skills

- **opportunity-check** — authored by us (2026-07-16), distilled from the
  funeral→trades niche analysis. A repeatable decision procedure to pressure-test any
  new niche/offer/wedge BEFORE building: Founder Filter → market research (TAM, pain
  frequency×value, competition + price anchor, WTP) → scoring → the four "traps"
  checklist → wig→motor packaging → financial reverse-engineering → validate-before-
  build → Go/Adjust/Kill verdict + smallest next step. Encodes the hard lessons
  (low-volume-segment trap, cheap-incumbent price anchor, don't-give-it-away,
  validate-before-build, arithmetic-pitch preference). No external tooling needed.
- **web-verify** — authored by us (2026-07-18), distilled from the scroll-film-studio
  skill's verification harness. Screenshots any local/live URL at multiple viewports +
  scroll positions using the **system Chrome/Edge** (no download), auto-checks horizontal
  overflow + console errors; you then Read the PNGs to actually LOOK. Closes the "I can't
  see the rendered animation, please check it" gap. Ships `verify.mjs` (needs `npm i
  puppeteer-core` in a scratch dir). Deliberately does NOT adopt the source skill's
  cinematic scroll-film product (too heavy for fast trades sites) — only the verify
  discipline. Proven working against Belvanger (2026-07-18).
- **programmatic-seo** — authored by us (2026-07-16), distilled from the "Claude Code
  SEO" technique + local-SEO best practice. Generates a **quality-gated, right-sized**
  set of local / service-area SEO pages at scale (as a client product = lead
  *generation* complementing missed-call lead *capture*; or for own marketing) WITHOUT
  the doorway-page penalty. Encodes: margin-driven clusters, geo/keyword research,
  right-sizing (15–20 excellent pages, not hundreds of thin ones), a 3-uniqueness
  template, a 3-level quality gate + per-page checklist, service-area vs location-page
  distinction, LocalBusiness schema, and batch-ship-then-monitor. Phase-2 growth lever
  (validate the wedge first). No external tooling required to reason; live keyword data
  needs an SEO MCP (Semrush/Ahrefs/DataForSEO).
- **react-toolkit** — authored by us (2026-07-18), from research into
  [React Bits](https://reactbits.dev) at the founder's request. A curated shortlist of
  **animated React component libraries** for giving client sites a premium "statement"
  feel via **Integrate** (not Build), plus the rules for using them in *paid* work. First
  entry = React Bits (140+ copy-in animated components; **MIT + Commons Clause**, not plain
  MIT). Encodes: the toolkit index, how to pull a component in (jsrepo / shadcn / manual +
  variant), a **license gate** to run before any effect lands in billable work, and
  **performance / accessibility guardrails** for a mobile trades audience (one statement
  effect, WebGL is expensive, respect `prefers-reduced-motion`, keep text real, verify with
  `web-verify`). Detailed library notes live in `references/` (grow it per library). NOTE:
  unlike the other skills this came from research, **not yet battle-tested on a live client
  React build** — provisional until a real integration; also a reminder that the current
  Belvanger site is vanilla HTML, so it's not drop-in there.
- **scroll-world** — third-party skill (MIT, vendored 2026-07-14 from
  `github.com/cth9191/scroll-world`, not authored by us). Builds scroll-scrubbed
  "fly through the world" landing pages using the Higgsfield CLI + ffmpeg. Kept
  for possible future use; **needs external tooling to actually run** (a
  Higgsfield account/credits, the `higgsfield` CLI, `ffmpeg`/`ffprobe`, and
  optionally PIL). Scanned safe before install (image/DOM helpers only, no
  network exfiltration). Update by re-copying from the upstream repo.
