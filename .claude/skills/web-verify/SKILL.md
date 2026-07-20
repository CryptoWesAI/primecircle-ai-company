---
name: web-verify
description: >
  Observe your own web output instead of asserting it works. Screenshots any local or
  live URL at multiple viewports and scroll positions using the SYSTEM browser (Chrome
  or Edge — no download), auto-checks horizontal overflow + console errors, and you then
  READ the PNGs to actually LOOK. Use before reporting a web page/site "done" or after
  any visual/layout/animation change — especially things you can't verify by reasoning
  (does it clip? overflow on mobile? does the animation end state fit? does the contrast
  hold? did the claim render?). Distilled 2026-07-18 from the scroll-film-studio skill's
  verification harness. Trigger on: verify a page visually, screenshot the site, "does it
  render", check mobile layout, check an animation, before-launch visual QA.
allowed-tools: Bash, Read, Write, Edit, Glob
---

# web-verify

**The rule:** *never ask the user to eyeball what you can prove.* If you built or changed
a web page, you can SEE it — don't say "please check it looks right." This closes the gap
that bit us repeatedly on Belvanger (editing an animation + calculator blind).

Aligns with PrimeCircle's Build Method: *"prefer tools that let you observe your own
output (browser…) over asserting that it works."*

## Setup (once per scratch dir)

Needs Node + an installed **Chrome or Edge** (auto-detected; uses the system browser via
`executablePath`, so no Chromium download).

```bash
cd <a scratch dir>
npm i puppeteer-core
```

## Run

```bash
node "<path>/.claude/skills/web-verify/verify.mjs" <url> [outDir] [config.json]
# then READ the PNGs in outDir to actually look at them
```

- No config → 4 default shots (desktop + mobile, top + full-page).
- The script prints, per shot, **horizontal overflow** (body must never scroll sideways)
  and **console errors** — then you Read the images.
- **The Read step is the point.** The tool renders PNGs; look for: clipping, overflow,
  broken layout on mobile, wrong contrast, an animation's END state, and whether the
  copy/claims render as intended.

## Custom shots (scroll positions, waits, elements)

Pass a JSON array. Each shot: `name, w, h, wait` + one of `sel` (scrollIntoView a
selector), `y` (scrollTo px), or `fullPage: true`. Example — capture a calculator and an
auto-playing animation's end state:

```json
[
  { "name": "calc", "w": 1440, "h": 900, "wait": 1500, "sel": "#rekenmachine" },
  { "name": "animatie-eind", "w": 1440, "h": 900, "wait": 12000 }
]
```

For animations: set `wait` past the animation's full duration to catch the end state
(auto-play triggers on scroll-into-view). Belvanger's ~9.5s film → wait 12000.

## Lessons carried over from scroll-film-studio (apply when relevant)

- **Measure animation smoothness by rAF deltas (p95/max), not average fps.** A 60fps
  average hides 80ms decode/layout spikes. Add a console jank meter to pages with heavy
  motion; target max < 50ms.
- **Build pages with a dev contract for deterministic capture:** `?jump=<scrollY>` lands
  pre-scrolled with scroll-driven state force-settled, and `window.__ready = true` fires
  only when truly ready. Then the harness can screenshot exact positions reliably.
  (Belvanger doesn't have this yet; puppeteer's scrollIntoView + a wait is the fallback.)
- **Hide any cursor-follower until first real mousemove** or it photobombs captures at 0,0.
- Host preview panes throttle hidden tabs (rAF freezes → stale shots) — this headless
  harness avoids that.

## Scope — what we deliberately did NOT take

The source skill builds cinematic **scroll-film** sites (canvas frame-scrubbing, generated
footage). We did **not** adopt that: a heavy cinematic scroll site is the opposite of what
a trades lead-gen page needs (speed + conversion + green Core Web Vitals; see
`docs/build/trades-landing-blueprint.md` §4). We took only the **verification discipline**,
which is universally useful. Don't build scroll-films for PrimeCircle clients.

## Fit / discipline

Use this to make the trades-blueprint pre-launch checklist (§13.5) real: *screenshot the
page on desktop + mobile and actually look, before sending traffic.* Reusable for every
web deliverable — Belvanger, client sites, the chatbot dashboard.
