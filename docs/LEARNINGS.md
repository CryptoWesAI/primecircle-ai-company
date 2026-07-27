# Learnings — what we've learned building PrimeCircle

A running journal of **lessons, insights and mistakes-not-to-repeat**, distinct from the
other records so nothing overlaps:

| File | Answers |
|---|---|
| `CURRENT_STATE.md` | Where are we **now**? |
| `docs/decisions/DECISIONS_LOG.md` | What did we **decide**, and why? |
| **`docs/LEARNINGS.md`** (this file) | What did we **learn**? |
| `.claude/skills/*/SKILL.md` (Gotchas) | How do we **do** a recurring task, and what bites us? |
| `~/.claude/.../memory/` (auto-memory) | Cross-session **facts** about the founder & project |

**How this grows:** add an entry the moment a real lesson lands — a correction, a
surprise, a trap avoided. Keep each one to *lesson → why → where it's now encoded*. Update
this at milestones, same discipline as `CURRENT_STATE.md`. Newest first.

---

## 2026-07-27 — In an AI image for tradespeople, the method has to be right, not just pretty

**Lesson:** an image prompt I wrote put a painter on a ladder **leaning against the window
frame he was painting**. The founder caught it immediately. It cannot happen: you would be
resting on your own wet paint, glass and a frame are not load-bearing, and you cannot reach the
surface you are leaning on. Correct is a ladder against load-bearing brickwork *beside* the
opening, with a standoff, about 75 degrees, feet on firm ground, working sideways. For a whole
facade a mobile scaffold is more credible than a ladder at all.
**Why:** this is the most dangerous class of error in generated imagery, because it looks fine
to us and is obvious to the audience. Our reader IS the expert: a painter reads a wrong ladder
before he reads a single word, and then the site is a site built by someone who does not know
the trade. Cosmetic AI artifacts (a sixth finger) get noticed and forgiven; a wrong working
method gets noticed and disqualifies you.
**Encoded in:** the AI-image rules inside the client-intake prompt in
`product/chatbot/server.js` now list the standing ladder/method errors and what correct looks
like, so every future client site inherits it. Standing rule: for any trade image, have someone
from the trade look at it before it ships, and generate the scene from how the work is actually
done rather than from what looks dynamic.

## 2026-07-27 — Two ways a scroll-driven CSS animation silently does nothing

**Lesson:** building the painter example page (scroll = the wall gets painted) hit two traps
that both look like "the animation is broken" and are neither visible in devtools nor in any
console:
1. **`animation-timeline: view()` measures against the nearest scroll container, and
   `overflow: hidden` creates one.** A child inside a clipped card fills that card
   completely, so its view progress is pinned and the animation never moves. Fix: put
   `view-timeline-name` on the card itself (which *is* measured against the page) and
   reference it by name from the child.
2. **A `clip-path` sweep on a parent deletes any pseudo-element hanging outside it**, and
   `animation-fill-mode: both` makes that clip permanent after the animation ends. The
   ragged brush edge was a `::after` at `top: 100%`; the hero's reveal ended on
   `clip-path: inset(0 0 0 0)` and cut it off forever. Fix: end on `inset(0 0 -60px 0)`.
**Why:** both produce a *correct-looking* stylesheet with a wrong result, so reading the CSS
again does not help. What helped was measuring: forcing the element bright green and counting
pixels on a full-page screenshot proved the box was painted nowhere, which ruled out mask,
background and stacking in one shot and pointed straight at the clip.
**Encoded in:** comments at both sites in `sites/belvanger/site/voorbeelden/schilder-premium.html`,
and the habit: when an animation "does nothing", assert the element's painted pixels before
touching the animation. Same rule as the six-round "Bel terug" hunt — after one failed fix,
measure instead of fixing again.

## 2026-07-27 — Check the error paths and the other HTTP methods, not just GET /

**Lesson:** "check everything" on the Belvanger site turned up three defects that every
happy-path check passes: (1) a fully designed `404.html` sat in the repo but the server never
served it, so a mistyped URL returned plain-text "Not found"; (2) `HEAD` returned **405 on
every page including `/`**, so any uptime monitor would report the site as down; (3) the deploy
shipped 67 MB of promo-film source the container never uses, and `cp -a` copied it into every
`pre-deploy` backup, 71 and counting.
**Why:** you only find these by asking for the paths and verbs nobody types in a browser.
`curl -sI` (HEAD) and one deliberately wrong URL would have caught two of them on day one.
The HEAD bug is the **second** time: the portal had the same fault on 2026-07-25, which means
it was a pattern, not an accident. **Encoded in:** `product/chatbot/server.js` now handles
HEAD and falls back to the site's own `404.html` (language-aware via `/en/`), and post-deploy
verification now checks GET *and* HEAD plus at least one 404 path. Note a 404 page is served
at an arbitrary URL, so its own asset links must be root-absolute; `apply.mjs` was writing a
relative widget path.

## 2026-07-27 — Shared JS across two language pages makes one language fail silently

**Lesson:** the Belvanger hero simulation is driven by one `js/app.js` for both languages,
which addresses DOM nodes by `data-step`. The Dutch page gained two closing cards (`data-step`
8 and 9); the English page never got them. `app.js` still ran `hide(7); show(8)` at 11.2s, so
on `/en/` the last notification disappeared and **nothing replaced it**: the animation ended
on an empty rectangle, right where the offer lands. No console error, no failed request, HTTP
200. It sat there from 18 to 27 July.
**Why:** shared code plus per-language markup means a missing node is not an error, it is
silence. A translation review reads *words*; this was a missing *hook*. And the flaw was
invisible in exactly the place that matters, the one page an English-speaking prospect sees.
**Encoded in:** `sites/belvanger/tests/taalpariteit.mjs`, which compares NL↔EN on `data-step` sets,
counts of every repeated copy block, prices/percentages, hreflang and `robots`. Run it after
touching either page. It fails on the pre-fix files and passes on the fixed ones (verified
both ways). It deliberately does **not** claim to judge wording: same structure with stale
sentences still passes, so a human still reads the copy.

## 2026-07-18 — Test the RENDERED page, not just the API endpoint

**Lesson:** the dashboard's `index.html` was missing its `<script src="app.js">` tag, so the
page loaded, styled, and the API answered — but the app never booted (stuck on "Laden…").
Every server-side check (`curl /api/session`, `/api/projects`) passed; only loading the page
in a real browser exposed it. Fixed by adding the tag + screenshotting via `web-verify` over
an SSH tunnel (desktop + mobile) before handing back.
**Why:** "the API works" and "the endpoint returns 200" are not "the page works." A green
backend can sit behind a blank screen. **Encoded in:** habit — for any UI, finish with a
`web-verify` screenshot of the rendered page (tunnel to localhost if it's private), not just
API curls. Sharpens [the verify-don't-assert entry below].

## 2026-07-18 — `fs.writeFileSync(path, data, {mode})` only sets mode on CREATE

**Lesson:** the `mode` option is ignored when the file **already exists** — Node keeps the
existing permissions. The VPS-dashboard wrote `.env` files that stayed `644` despite
`{mode:0o600}`; only an explicit `fs.chmodSync(path, 0o600)` after the write forced `600`.
**Why:** secrets files silently kept world-readable perms — caught only because the
end-to-end test checked `stat` (verify-don't-assert, again). **Encoded in:**
`infra/dashboard/app/server.js` chmods `.env` + backups explicitly after writing.

## 2026-07-18 — A private-only tool can accept "root-equivalent" access it never could publicly

**Lesson:** the secrets dashboard needs the Docker socket + `/opt` (≈ root on the host) to do
its job. That's only acceptable **because** it's reachable *exclusively* over Tailscale, never
the public internet (served via `tailscale serve` on `127.0.0.1`, no public Traefik route, no
public DNS). The access model is what licenses the privilege — flip it to public and the whole
design is unsafe.
**Why:** "how powerful may this component be?" is answered by "who can reach it?", not by the
feature list. **Encoded in:** `infra/dashboard/` (localhost-only publish + Tailscale) and its
`DEPLOY.md` security-model note; v2 plans privilege-separation to remove the socket.

## 2026-07-18 — Not every "free" library is free to resell

**Lesson:** run a **license gate** before any third-party component lands in billable
client work. React Bits looks MIT but carries a **Commons Clause** (can't resell the
library itself). Using it inside a client site you bill as a service is fine; reselling it
is not.
**Why:** a wrong assumption here only surfaces as a legal problem *after* you've shipped and
invoiced. **Encoded in:** `.claude/skills/react-toolkit/` (license gate + per-library notes).

## 2026-07-18 — When you swap an infrastructure layer, enumerate what it did

**Lesson:** replacing one component silently drops the things it used to do. Moving the
Belvanger container from **nginx → Node** dropped the security headers nginx had been
setting; only a `curl -sI` caught it.
**Why:** "it still loads" ≠ "it does everything the old layer did." Before swapping a layer,
list its responsibilities and re-check each after. **Encoded in:** shared
`product/chatbot/server.js` now sets the headers itself (travels with the app, not the proxy).

## 2026-07-18 — Verify against reality, not your local resolver

**Lesson:** fresh DNS records and new domains don't resolve everywhere at once. `n8n` and
`belvanger.nl` both showed NXDOMAIN locally while already live. Prove reachability with
`curl --resolve` / a public resolver (`8.8.8.8`), not your own machine.
**Why:** "it doesn't load for me" led to almost-wrong conclusions twice. **Related:** a
Google **Safe Browsing "Dangerous site"** flag on the fresh n8n subdomain was a
false-positive (new subdomain + login form on a `.cloud` TLD) — verified the served content
was clean n8n before reacting, and requested a Search Console review to clear it.

## 2026-07-18 — WhatsApp has hard rules that shape the product

**Lesson:** a business-**initiated** WhatsApp message (we text someone who only *called*)
requires a **pre-approved Utility template** — you can't just send free text. And the
message can't come from the trade's exact number (one number = one WhatsApp account); it
comes from a **separate branded Business profile** (name + logo carry the recognition).
**Why:** these constraints change the build and the founder's mental model — surface them at
interview time, not after. **Encoded in:** `docs/build/mvp-missed-call-textback.md`.

## 2026-07-18 — Never ask the user to eyeball what you can prove

**Lesson:** editing web pages "blind" (animation, calculator, icons on Belvanger) produced
wrong output repeatedly until each change was **screenshotted and looked at**. If you built
it, you can see it.
**Why:** reasoning about rendered layout/animation/contrast is unreliable; observation is
cheap. **Encoded in:** the `web-verify` skill (system-browser screenshots + overflow/console
checks). This is now a build-method default, not an afterthought.

## 2026-07-18 — Honesty is a product feature, not a nicety

**Lesson:** the first Belvanger build shipped with false claims — a fake phone number
(incl. in JSON-LD), "100%", "AVG-proof", a fake KvK number, and a hard €99 price that
contradicted the visible FAQ. All had to be stripped.
**Why:** false claims on a client-facing site are a legal + trust liability, and structured
data (schema) **must** match what's visible on the page. Rules now standing: no invented
facts or prices, label demos as simulations, no result guarantees, keep pilot/no-KvK status
honest. **Encoded in:** Belvanger legal pages + chatbot system-prompt guardrails.

## 2026-07-16 — Pick niches by volume × value, and charge for the outcome

**Lesson:** the funeral→trades pivot exposed two traps: (1) a **low-volume segment** can't
hit the revenue goal however good the offer, and (2) the founder's pattern of **giving value
away / betting on indirect payoff** has to be broken by charging up front and validating
*before* building.
**Why:** these are the mistakes most likely to sink a bootstrapped solo business.
**Encoded in:** the `opportunity-check` skill (Founder Filter → market reality → traps →
financial reverse-engineering → validate-before-build). See also auto-memory
`user_founder_selling_weakness`, `project_trades_pivot`.

## Standing principles distilled so far

- **Buy → Integrate → Configure → Automate → Build** — self-hosting n8n on the existing
  Traefik/Docker pattern beat building an orchestrator; reusing the config-driven chatbot
  beat one-off client code.
- **Config-driven reuse > one-offs** — one generic `server.js` + per-customer folder turned
  a single client build into a sellable product.
- **Respect the human validation zones** — client production (AB), payments, DNS/VPS and
  credentials get founder sign-off before the change lands.
- **Distinguish fact / assumption / recommendation**, and end real work with the
  highest-leverage next action.
