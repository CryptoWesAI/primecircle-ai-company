---
name: safe-demo-mirror
description: Build a public, no-login, safe-to-share demo of an authenticated internal tool (a dashboard, an admin panel, any app behind a login) by mirroring its REAL frontend at build time and backing it with a stateless, fictional-data mock API — never a copy of real data, never a second hand-maintained frontend. Use whenever a founder wants prospects to "see the product" (dashboard, portal, tool) without creating an account or exposing real customer data. Not for marketing pages themselves (those are just public already) and not for anything that needs to show truly live, changing data.
license: MIT
---

# Safe Demo Mirror

A prospect trusts a screenshot less than something they can click through
themselves. But the real tool has real customer data behind a real login, and
building a *second*, hand-maintained "demo version" of the frontend guarantees
the two drift apart the first time anyone changes the real one. This skill
mirrors the real frontend at build time and only fakes the data layer, so
there is exactly one frontend to maintain, ever.

## When to use

- A founder wants a shareable link ("here, look at the dashboard") to use
  during sales conversations, on a website, or in outreach, and the real tool
  requires login / has real customer data behind it.
- The tool already has (or can cheaply get) a mock/preview server used for
  internal dev or screenshots, that is step 0 of this skill, not a
  competing approach: check for one before building anything.

Skip it for content that's already public (a marketing page needs no
mirroring), and skip it if the whole point is showing genuinely live,
changing data, a static mirror will read as fake precisely because it is.

## The method

### Step 0: Look for an existing mock/preview server first

Before writing anything new, check whether the real product already has a
lightweight, no-database preview server (used for local dev, screenshots, or
smoke tests). If one exists, it has already solved "what does realistic
fictional data look like for this app", reuse and extend it rather than
inventing a second one. Building `safe-demo-mirror` from scratch when a
`preview-server.mjs`-shaped tool already exists is duplicated, drifting work.

### Step 1: Confirm the mirror is safe by construction

The demo must be structurally incapable of touching real data: no database
connection, no real credentials, no code path that could accidentally read a
real record. If the mock server can't reach a real data source because it was
never given one (not because of an `if` check), a bug can't leak real data.
Prefer "physically impossible" over "conditionally prevented".

### Step 2: Mirror the real frontend via a build-time copy, never a hand-maintained fork

Write a small script that copies the real app's frontend files (HTML/JS/CSS/
assets) from their single source of truth into the demo's location, patching
only what's structurally required:

- **API base path**: if the demo lives under a path prefix (e.g.
  `/dashboard-demo/`) while the real app expects to be at the root, patch the
  one central fetch helper (look for it, real apps usually have exactly one
  `api()`/`fetch()` wrapper all calls go through) to prepend the prefix. If
  there is no central helper, that's worth fixing in the real app first,
  patching N call sites individually is exactly the maintenance burden this
  skill exists to avoid.
- **Absolute asset paths**: `href="/style.css"`, `src="/app.js"`, favicon
  links, etc. break the instant the real frontend is served from a subpath
  instead of the root. Rewrite them to the prefixed path in the copy step.
- **A visible "this is a demo" banner**: inject one fixed element (sticky,
  high-contrast, impossible to miss) stating plainly that this is example
  data, not a real account. Do this in the copy script, not by hand-editing
  the copied file, or it'll vanish on the next rebuild.

Re-run this script on every deploy of the real app (wire it into the existing
build/assemble pipeline) so the mirror can never silently go stale.

### Step 3: Audit every API call the frontend makes, in one pass, before writing any mock

Grep the frontend for every call through its central fetch helper (or every
literal `fetch(`) and list every distinct endpoint + method before writing
mock responses. Missing even one (a "log out" button, a "support" form, a
secondary feature added after the demo was first built) means a real visitor
hits a raw 404 and sees a JS error alert mid-demo, discovered by them, not by
you. Build the full mock surface in one deliberate pass, not by fixing one
broken click at a time as bug reports come in, that happened three times in
the same session before the lesson landed.

### Step 4, Build a stateless mock: every endpoint returns a plausible response, none of them persist

GET endpoints return realistic fictional data. POST/DELETE/PATCH endpoints
that would mutate real state should still return a normal-looking success
response (so the UI doesn't error), they just don't need to actually persist
anything, since a fresh set of fictional data on every request is completely
fine for a demo and means there is no datastore to secure, back up, or leak.

### Step 5: Bypass auth by making "who am I" always answer yes

Mock the identity/session-check endpoint (`/api/me` or equivalent) to always
return a fake logged-in user. Real frontends that check this on load will
skip straight past the login screen with zero extra code, do not build a fake
login form, that's effort spent reproducing something you're trying to avoid.

### Step 6: Keep the fictional narrative consistent with what the REAL system can actually do

A mock event that is technically well-formed JSON but implies an interaction
the real product cannot perform (a customer replying to a one-way, no-reply
automated message; a feature that doesn't exist yet) is a **trust bug**, not
a cosmetic one, a careful prospect (or the founder demoing it) will notice.
Cross-check every fictional data point against the real product's actual,
documented constraints before shipping the mock.

### Step 7: Exclude the mirror from unrelated site-wide automation

If the parent site has any script that walks every page (embedding a chat
widget, injecting analytics, applying a global template), explicitly exclude
the demo's directory. A demo of a dashboard does not need the marketing
site's own chat widget layered on top of it, and if a similar exclusion
mechanism already exists for other demo/example content, extend that list
rather than building a second mechanism.

### Step 8: Verify through the real routing layer, not a bare static server

Serve the assembled app locally with its actual server code (not a generic
static file server) before deploying, so path-prefix and routing bugs surface
locally. If the app has no hash-based routing (most simple SPAs don't),
force-navigate to non-default views for a screenshot by temporarily injecting
a tiny auto-click script into the **local test copy only** (never into what
gets committed or deployed, confirm the deployed rebuild is clean of it
before shipping). Confirm with both a curl check per endpoint and an actual
rendered screenshot, curl proves the JSON shape is right, the screenshot
proves it's not silently blank/unstyled from a path bug.

### Step 9: Link to it from the moment of peak curiosity, not the first mention

Place the link where a reader has just been convinced enough to want proof,
not where the feature is first described (too early, they're still building
understanding) and not competing visually with the page's primary
conversion action (secondary/ghost button style, not the main CTA color).
If the page already has an established "here's proof" pattern elsewhere
(an example gallery, a case study section), extend that exact pattern to
cover the new demo rather than inventing a new visual language for it.

## Gotchas

- **Auditing API calls one broken click at a time is how this goes wrong.**
  The single biggest source of bugs in this pattern is treating the mock
  surface as "add mocks as things break" instead of "grep every call site
  first, build the full surface once." A feature added to the real app
  *after* the demo was first built (a new tab, a new button) is invisible
  until someone clicks it and gets a raw error dialog. Re-run the Step 3
  audit every time the real app gains a new API-calling feature.
- **Absolute paths are invisible until the demo moves off the root.** They
  work perfectly in local testing if you happen to test from the root path,
  and then break in production the moment the demo lives at `/some-prefix/`.
  Test the actual deployed path locally, not just `http://localhost:PORT/`.
- **A "well-formed but impossible" mock event is worse than an empty state.**
  An empty demo tab reads as "not connected yet", which is honest. A mock
  event depicting something the real product structurally cannot do (e.g. a
  reply channel that doesn't exist) reads as a false claim if anyone notices,
  which a careful prospect will. When in doubt, check the fictional story
  against the real system's actual documented behavior, not just against
  "does this look plausible."
- **Reuse the parent app's existing exclude-list mechanism if one exists**
  rather than building a second one; two overlapping mechanisms for "don't
  touch this directory" is how one of them gets forgotten later.
- **Rebuild fresh before every deploy, and diff-check that any temporary
  local-only test scaffolding (auto-click scripts, debug flags) is absent**
  from what actually ships. It's easy to leave a testing hook in the copied
  output if the copy step isn't re-run clean right before deploying.
