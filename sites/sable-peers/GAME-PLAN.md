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
inside the window, one place per handle (a person, not a name), handle required (verified or not: the runs from 7 September
before the replay check went live count too, at the founder's request). The page shows a strip with a countdown
and a Contest tab, and marks the handle field as needed while the window is
live. Standings freeze by themselves: `day` is stamped by the board at
submission, so no later run can land inside a closed window.
`admin.js contest` prints the standings as JSON for the winner's page.


## The referee (7 September 2026, evening)

The replay proves a log produces a score, not that a person made the log. Two
holes closed the same evening: the page no longer exposes the autoplay switch
or the game object on a real run (they exist for the tests on a local build and
inside the demo), and the board reads every replay like a referee. The core
records the z of every refused request at the tap; the patient player taps at
one distance (std about 0.1), a person spreads over the whole approach (std
about 15). A run with 8 or more refusals and std under 2, or a shift of 150 s
or more with no wrong tap and no leak, is flagged: it stays on the board, out
of the contest, until `admin.js unflag` after someone has read the log
(`admin.js run <name>`). The limit is known: a bot with human jitter passes,
and the stored logs are the last line, read by a person before a prize is paid.
The live game test plays without the autopilot; `tests/board-live.mjs` checks
the live board's replay and referee through the API with the core.

## A customer sent away (8 September 2026, night)

A shared card showed 54,045 points in wave 15 that the board never received. Checked against the arena of the day: the 216 loops on that arena pay 43,625 points on their own, without a multiplier, so the score was reachable only by refusing nearly everything, sealed requests included. A wrong refusal cost nothing but the streak; the multiplier stayed at 1 and the loops paid anyway. Tapping everything competed with judgement.

Decision: refusing a sealed request costs `WRONG_COST = 5` budget (a quarter of a broken seal), on top of the streak reset, and still scores nothing. Tapping everything now ends a shift by wave 4 (`tests/wrong-cost-test.mjs`); the patient player is untouched. Alternatives rejected: a points penalty (a negative score is confusing and does not stop the run), loop points under the multiplier (cutting a loop is real judgement and should keep paying), a server-side flag for many wrong refusals (a flag after the fact, while the budget cost stops the strategy during the run).

With it, three things the case exposed:

- A rules version, `RULES` in core.js. `/start` returns it, the client sends it with the score, and a mismatch is refused as `rules` with the current version, so a page loaded before a change is told to reload instead of failing the replay without a word. The client plays such a run unranked and says why on the end card.
- The token window grows from 15 to 45 minutes. A run is at most 10 minutes of play, but a phone call in the middle pauses the game while the token ages; `dur <= age + 2 s` still holds, so nothing is gained by the longer window except fewer legitimate runs refused as `expired`.
- The board logs one line per accepted or refused submission: reason, name, score, wave, duration, and for a replay failure what the replay produced. No IP, no device id. The nginx log is not enough: it resets on every deploy.

Scores already on the board stand; the arena changes daily and the change is dated in the page log. Deploying the board recreates the container, so deploys go out when nobody has started a run in the last minutes.

Addendum, the same night: the cause of the lost run was found in `nginx.conf`. The `/api/game/` location carried `client_max_body_size 8k`; a run's input log is about 22 bytes per tap, so every submission with more than roughly 360 taps was answered 413 by nginx and never reached the board. The live log showed two 413s while this was being investigated. The cap is now 512k (the board's own `readBody` limit of 300 KB stays the effective one). Recorded under "What this page got wrong". The rules change and the cap fix went out together at 22:00 UTC; the first submission after the deploy (AlfinMzn, 18,340 in wave 9, a page loaded before the change) was accepted through the previous-rules grace path, as designed.

## The card is a record (9 September 2026, 00:15 CEST)

The founder's call after the 54,045 case: leave the board as it is, tell everyone the fix is in, and make the card anti-cheat. A card drawn by the browser from the browser's own numbers can only ever be a claim, so the card now carries the board's verdict instead.

- The card is drawn after the submission, not before. Accepted: a stamp top right, "ON THE BOARD · #n TODAY" and "CHECK CODE <id>-<8 chars>". Not accepted: "NOT ON THE BOARD" with the reason (demo, no answer, refused: replay, rules changed). The share text carries the code too.
- The code is `cardCode(id, day, name, score, wave)`: eight characters from an HMAC-SHA256 under the board secret, alphabet `ABCDEFGHJKMNPQRSTVWXYZ23456789` (no 0/O, 1/I/L). Handed out only with an acceptance, so a card that was never on the board cannot carry a code that checks out. About 39 bits: enough against guessing behind the per-IP limit of 300 checks an hour; it is not a signature anyone can verify offline, the board is the verifier.
- `GET /card/:id/:code` answers 404 for a wrong code or unknown run and, for a match, the row plus the card's other numbers replayed from the run's own input log (loops cut, leaked, clean waves, wrong refusals), under the rules the run was played with (current core first, previous core if the score differs). Rank that day included.
- "Check a card" under the leaderboard on the Play page: type the code, the board answers, every number on the card must match.
- The forensic star fingerprint (score * 7919 + wave) is unchanged, so `tests/card-stars-check.mjs` still works on cards from before this release.

Rejected: a QR code on the card (a QR encoder is a few hundred lines with no library allowed by the CSP; a short code typed into the page does the same job), an offline-verifiable signature (would need a public key on the page and a bigger code; the board is online anyway), signing the card image itself (a screenshot of a signed image is still a screenshot).
