---
name: react-toolkit
description: >
  Vetted toolkit of animated / interactive React component libraries for giving PrimeCircle
  client sites (and PrimeCircle's own marketing) a premium, "statement" visual feel without
  hand-building every effect. First entry: React Bits (reactbits.dev) — 140+ copy-in
  animated components (text effects, animated & WebGL backgrounds, UI). Encodes how to pull
  a component in (jsrepo / shadcn / manual + variant choice), the license gate (React Bits
  is MIT + Commons Clause, NOT plain MIT), and the performance / accessibility guardrails
  for a mobile trades audience. Use when: building or polishing a React/Next site, adding an
  animated hero / background / text effect, "make this site feel premium", picking an
  animation library, or deciding whether an effect is licence-safe for paid client work.
allowed-tools: Read, WebFetch, WebSearch, Bash, Edit, Write, Glob, Grep
---

# react-toolkit

A curated shortlist of **React component/animation libraries** worth reaching for when a
client site needs visual impact — plus the rules for using them safely in *paid* work.
Aligns with PrimeCircle's **Buy → Integrate → Configure → Automate → Build**: prefer
integrating a vetted, well-maintained library over hand-rolling animations.

Grow this toolkit by adding a file under `references/` when a new library earns its place
(is well-maintained, license-clear, and actually got used) — don't add aspirational entries.

## The toolkit

| Library | Use for | License | Reference |
|---|---|---|---|
| **React Bits** | Animated text, backgrounds (incl. WebGL/Three.js), statement UI | **MIT + Commons Clause** (see gate) | `references/react-bits.md` |

_(Add shadcn/ui, Framer Motion / `motion`, etc. as separate reference files once used.)_

## How to use it

1. **Read the relevant `references/*.md`** for the library before pulling anything in — it
   has the install command shape, variants, and the license note.
2. **Pick from the live gallery**, not from memory. Component names/props change; open the
   library's site (e.g. reactbits.dev) and copy the **exact** install command from the
   component's own page.
3. **Match the variant to the project** (React Bits: JS/TS × CSS/Tailwind).
4. **Run the license gate** (below) BEFORE it becomes a dependency of anything you bill.
5. **Apply the guardrails**, then **verify visually** with the `web-verify` skill — never
   report an animated page "done" without looking at it on mobile.

## License gate (do this every time)

Animated-component libraries are often *not* plain MIT. React Bits is **MIT + Commons
Clause**: free to use in client sites you build and bill as a service, but you may **not
resell the library itself** as a product. General rule for any toolkit entry:

- ✅ Component used *inside* a site/app you deliver as a service → fine.
- ❌ Reselling the library (or a thin wrapper) as its own product → not fine.
- ❓ Unsure / a stricter license (BUSL, non-commercial, "no SaaS") → stop and check before
  it lands in paid work. Record the finding in the library's reference file.

## Guardrails (mobile trades audience)

The people who visit these sites are often **on a cheap phone, on mobile data, on a
roof**. Heavy animation can hurt more than it helps.

- **One statement effect, not a carnival.** Pick the single spot where impact pays off
  (usually the hero). Don't animate the whole page.
- **WebGL/Three.js is expensive.** A `Ballpit`-style background can jank low-end phones and
  drain battery. Prefer lightweight CSS/`motion` effects; only go WebGL when it clearly
  earns it, and test on a throttled device.
- **Respect `prefers-reduced-motion`.** Provide a calm fallback; some React Bits components
  do not do this for you — add it.
- **Watch the bundle & LCP.** Each effect pulls its own animation dep. Keep the hero fast;
  lazy-load anything below the fold.
- **Accessibility holds.** Animated/gradient text must keep WCAG-AA contrast and remain
  real, selectable text (not an image) for SEO + screen readers.
- **Verify, don't assert.** Screenshot with `web-verify` at mobile + desktop, check the
  animation end-state fits and nothing overflows.

## Fit with the current stack

- **Plain-HTML sites (e.g. Belvanger)** are **not React** → these components aren't
  drop-in. Either adapt the technique to vanilla CSS/JS, or export a static asset from the
  library's studio tools (React Bits → Background Studio) and serve the file.
- **React / Next.js client sites** → integrate directly; this is where the toolkit shines.

## Gotchas

_Add every correction / edge case here the moment it happens, so it isn't repeated._

- **Not plain MIT.** React Bits carries a **Commons Clause**; several "free" animation
  libraries have non-MIT strings. Always run the license gate before paid use.
- **Belvanger is vanilla HTML, not React**: a recurring reflex to "just add a React Bits
  component" won't work there. Confirm the target stack first.
- **Copy the install command from the component page**, not from this doc — jsrepo variant
  tokens/paths drift and a hand-built command silently pulls the wrong variant.
- **Sourced from research (2026-07-18), not yet battle-tested on a live client React
  build.** Treat the workflow as provisional until a real client site uses it; update this
  section with what the first real integration teaches.
