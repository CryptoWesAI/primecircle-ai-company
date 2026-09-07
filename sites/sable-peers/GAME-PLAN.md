# Gatekeeper: the game on the Sable Observatory

Decided 6 September 2026. Concept A, backend on the VPS: both confirmed by the founder.

## The game

You are Sable's door. Sealed requests fly in from deep space toward the Prime
Circle. The door is open by default, as a gateway must be: whatever reaches it
is handled. Your job is to refuse what must not pass before it gets there.

- **Sealed request (cyan seal)**: let it through. At the door it becomes a
  receipt: 10 points times the streak multiplier.
- **Broken seal (injected request)**: tap it to refuse. 15 points times the
  multiplier. If it reaches the door the budget loses 20.
- **Runaway loop**: a chain of identical capsules. Tap any link and the whole
  chain is refused at the cap: 25 points per link, and every fifth streak
  refills one Attest charge. Each link that reaches the door costs 6 budget.
- **Wrong refusal** (tapping a sealed request): no damage, streak and
  multiplier reset. Reflex tapping is punished, judgement is rewarded.
- **Attest** (hold the button, or the space bar): slows time to 35% for 1.5 s.
  Three charges per run.
- Waves every 20 seconds: faster, denser, longer loops, and broken seals that
  are harder to tell from intact ones. Wave one already moves at 17 units a
  second with a request every 750 ms, a fifth of them broken and a tenth loops:
  the founder asked for difficulty from the first second. A run ends when the budget reaches
  zero; there is no clock, only a ten-minute hard cap (the full shift). Waves keep
  escalating: 45 units a second by wave 15, a request every 220 ms from wave 8, up to
  42% broken and 28% loops, loops up to ten links, seals fading to 22% visibility.
  A wave defended without a leak gives 10 budget back (max 100), so the patient
  player earns the length of the run. Changed on 7 September 2026 from a fixed
  150-second run, because the founder wanted it harder and longer for hardcore
  players; the board's plausibility caps moved with it (500 points a second, 601 s; a perfect ten-minute run is 262,925).
  The player can end a run early; it still counts. The demo stops after a minute.
- Multiplier: 1 + floor(streak / 5), capped at 5. Only refusals build the streak; a wave defended without a leak pays 50 times its number.

Same arena for everyone on a given day: the seed is the UTC date plus the
whitepaper record's latest snapshot hash, so the board compares like with like.

## Determinism

`site/game/core.js` is the whole rule set, with no rendering and no clock.
Fixed 60 Hz ticks, a seeded PRNG (mulberry32 over an FNV hash of the seed),
inputs logged as (tick, action, id). `replay(seed, log)` reproduces a run
exactly. The server does not replay yet (plausibility checks only); it can the
day cheating shows up, without a rewrite, because the log hash is submitted
with every score.

## Leaderboard service

`leaderboard/server.js`: Node 24, `node:sqlite`, no dependencies, one
container (`sable-board`) on the site's compose network, never exposed to the
host. nginx proxies `/api/game/` to it on the same origin, so the content
policy does not change.

- `POST /start {device}` returns `{seed, token}`; the token is an HMAC over
  seed, start time and device.
- `POST /score {token, name, handle, score, receipts, refused, wave,
  duration_ms, log_hash}`: the token must verify and be unused, the run must be
  20 s to 15 min old, `duration_ms` cannot exceed wall time, the score cannot
  exceed 250 per second plus 500, receipts cannot exceed 4 per second plus 10.
  Rate limits in memory: 30 scores per device per hour, 120 per IP per hour.
- `GET /top?period=today|week|all` returns the best score per name, 25 rows.
- `GET /me?device=` returns the device's best.
- Names: 3 to 20 characters, letters, digits, space, `_ . -`, a small
  denylist. Handle: optional, up to 15 characters of `[A-Za-z0-9_]`, shown as
  `@handle`. No accounts, no passwords, no email.

Stored per score: day, seed, name, handle, score, receipts, refused, wave,
duration, a hash of the device token (never the token), created_at, log hash.
No IP address is ever written to disk. Deletion on request through Telegram or
X. A one-line privacy note sits under the board.

The HMAC secret lives in `/opt/sable-peers/.env` on the VPS, generated there,
never in the repository.

## Client

`site/game/game.js` is an ES module loaded only when the visitor presses Play.
three.js comes from jsdelivr at that moment (allowed by the policy, the same
way the receipt verifier loads viem). Low-poly, pixel ratio capped at 1.5,
paused when the tab or the section is hidden. Picking uses projected screen
positions with a 44 px radius on touch. The HUD, the end screen, the name form
and the board are DOM.

## Verification

- `leaderboard/test.mjs`: token round trip, replayed token refused, implausible
  score refused, bad names refused, rate limit, top and me.
- `tests/core-test.mjs`: same seed and log reproduce the same summary; a
  perfect run scores more than an idle run; idle runs end on budget.
- `tests/game-test.mjs` (puppeteer): Play loads the module, a real-time
  autoplay run of 22 s submits a score through the API, the board shows it,
  phone layout has no overflow, the end screen appears when the player leaves
  the door, a demo run is not submittable.
- On live: the same suite against sable.primecircle.cloud, then the test rows
  are removed with `admin.js`.

## Assumptions made without asking

- No prizes in version one.
- Names are first come, no claiming; the device token keeps a name on one
  device only.
- English only, like the rest of the page.
- The game is a topic of its own, "Play", ninth in the rail, the Topics menu,
  the guide and the row under the map.

## Replay verification (8 September 2026)

The client sends its input log with the score: every tap as `[tick, action,
id]`. The board replays it with the same deterministic core (`core.js`, copied
into the image from `site/game/`) and refuses the score unless score, receipts,
refusals, wave and duration reproduce. The log is stored with the row
(`log`, `verified = 1`); rows from before this date have no log and stay
unverified. Limits: 20,000 inputs, 300 KB body, ticks up to 120,000 (attest
slows time, so a ten-minute run can take more than 36,000 ticks). The rate
limit is checked before the replay so a flood cannot burn CPU.

## Contest

`BOARD_CONTEST=YYYY-MM-DD/YYYY-MM-DD` (UTC days, inclusive) in the board's
environment. `GET /contest` returns the window and whether it is before, live
or over; `GET /top?period=contest` returns the highest verified run per player
inside the window, handle required. The page shows a strip with a countdown
and a Contest tab, and marks the handle field as needed while the window is
live. Standings freeze by themselves: `day` is stamped by the board at
submission, so no later run can land inside a closed window.
`admin.js contest` prints the standings as JSON for the winner's page.
