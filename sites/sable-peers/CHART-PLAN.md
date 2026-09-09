# The chart: SABL's market, as recorded, in the site's own style

Spec written 2026-09-09 before building. The founder's brief: a chart of SABL on the Observatory, under the Token topic, everything in the site's own style. Decisions below are mine; the founder overrides here, not on the finished build.

## What it is

A section `#chart` inside the Token topic (it opens with the ladder and the ring, like "Every name" sits inside the Field topic), reachable as `sable.primecircle.cloud/#chart`. It shows the SABL/SOL pool's candles, the watcher's own hourly readings on top, and the record's events on the time axis. Drawn on a canvas by the page itself. No embed, no third-party script, no request to anyone but the site's own proxies.

## Data, and why each source

| Layer | Source | Path | Cache | Why |
| --- | --- | --- | --- | --- |
| Candles, hour and day | GeckoTerminal public API, pool `SABL / SOL` on PumpSwap (created 2026-08-25T23:06Z) | `/ext/ohlcv-hour`, `/ext/ohlcv-day` (nginx, pool address fixed in the config, nothing from the visitor forwarded) | 60 s hour, 300 s day | The only free OHLCV for this pool without a key; DexScreener has no public candle endpoint and its embed loads scripts and tracking on the visitor |
| Live figures | DexScreener, already proxied | `/ext/sabl` | 60 s | price, market cap, FDV, liquidity, 24 h volume and change, with the pool's own timestamp |
| The watcher's readings | `status/log.jsonl`, already proxied | `/ext/ledger` | 120 s | `token.price_usd` per hourly line since 2026-09-04: the Observatory's own record, with its gaps shown honestly |
| Supply, for the market-cap axis | `record.json` `sabl_supply.latest.ui_amount` | `/ext/record` | 120 s | market cap = price times the supply the watcher read on Solana, so the right axis is derived from the record, not copied from an aggregator |
| Events | a dated list in the page, plus two dynamic ones from `record.json` | `/ext/record` | 120 s | pool created (2026-08-25), whitepaper re-rendered (2026-09-02), Integration 001 posted and the confidential tier failing closed (2026-09-04), MCP Gateway announced (2026-09-08); dynamic: the first supply fall (`sabl_supply.last_fall.t`), the first announced route answering (`claims[].changes` to `present`) |

Rejected: a DexScreener iframe (third-party scripts and tracking on every visitor; breaks the page's "contacts only its own host on load" rule); Birdeye or Jupiter (need a key or give no history); reading swaps from Solana RPC (heavy, and the same data GeckoTerminal already aggregates); a charting library from a CDN (the CSP allows jsdelivr, but the ring and the Orrery are hand-drawn canvas and the chart should match them; a library would bring its own look and its own fonts).

## What the section shows

1. **Figures row** (`.rfacts` style, six tiles, two columns on phones): price, market cap, FDV, liquidity, 24 h volume, 24 h change. Small line under each: "DexScreener, PumpSwap pool, read HH:MM UTC". `translate="no"` on values.
2. **The chart** (canvas, full width, 380 px tall on desktop, 300 on phones, DPR-aware):
   - Candles: up in `--ok`, down in `--moon`, wicks one pixel, bodies at least one pixel. Volume bars under the candles in `--bar` at 40 percent, own scale.
   - Left axis price in USD (six significant digits at these levels: $0.000602), right axis market cap (price times supply), mono labels, uppercase axis titles in the site's letter-spacing.
   - The watcher's line: a dotted `--cyan-soft` polyline through `token.price_usd` of every ledger line, a small dot per reading. Gaps stay gaps: no interpolation across more than two hours, so the sparse cron is visible rather than smoothed away.
   - Event markers: a thin vertical line in `--edge2` with a numbered tag at the top; the legend under the chart lists the numbers with date and text. Dynamic events use `--moon` (burn) and `--ok` (route answered).
   - Crosshair: pointer move or touch shows a vertical guide and a tooltip with time (UTC), open, high, low, close, volume, and the market cap at close. Keyboard: left and right arrows move the crosshair when the canvas has focus.
3. **Controls** (pill buttons, like the leaderboard tabs): candle size `1h` (default) and `1d`; range `24h`, `7d`, `all` (all = what the pool has, 15 days today; the buttons stay as the pool ages). The choice is remembered in `localStorage` key `sable-chart`.
4. **A text summary** (`#chart-sum`, `aria-live="polite"`): "Last close $0.000602 at 2026-09-09 15:00 UTC · 7 days: high $0.000685 (7 Sep 02:00), low $0.000449 (3 Sep 11:00) · 168 candles · watcher: 33 readings". Screen readers get it, the guide (Lisa) reads it, tests assert on it.
5. **Caption**: "The market, as recorded. Candles from the pool through this site's proxy, the watcher's hourly reading on top, the record's events on the axis. Read the distance, not the direction. The author holds SABL."

## Style rules

- Colours from the CSS variables at draw time (`getComputedStyle(document.documentElement)`), never hard-coded, so the chart follows any palette change.
- Font: IBM Plex Mono (already self-hosted), 11 px labels, 10.5 px uppercase axis titles with `.14em` spacing, the same as `.rfact .k`.
- No animation; the chart redraws on data, resize, control change and pointer move. `prefers-reduced-motion` needs no special case.
- Works without the proxies: if a source fails, the layer is skipped and the summary says which ("candles not readable from here"); the page never says "undefined".
- Hash routing: `TOPICS.token` becomes `['token','chart']`, `ALIAS.chart = 'token'`; the chip and rail stay as they are.

## Verification

- `tests/chart-test.mjs`: serves the local build, answers `/ext/ohlcv-hour`, `/ext/ohlcv-day`, `/ext/sabl`, `/ext/ledger` and `/ext/record` with fixtures (a 200-candle hour series, a 16-candle day series, six ledger lines with prices, a record with supply and a fall), and asserts: the canvas has drawn pixels in the candle colours; the figures row shows six values with a read time; the summary names the last close, the high and low with times, the candle count and the reading count; switching to `1d` changes the candle count in the summary; the range buttons change it too; a pointer move over the canvas shows the tooltip with an OHLC line; the dynamic burn marker appears when the fixture carries a fall and not otherwise; no horizontal overflow at 390 px; no "undefined". Also the layer-failure case: the ohlcv fixture answers 500 and the summary says candles are not readable while the figures row still fills.
- `tests/shell-test.mjs` local and live (the Token topic still opens, no page errors).
- Live: `curl` the two new proxies for JSON with a `Cache-Control: no-store` header and an `X-Cache` line, then `tests/shot-who.mjs`-style capture of `#chart` at 1320 and 390.

## Not in this build

- Trades list, order book, holder counts: not the Observatory's job; DexScreener does those, and the caption links there.
- Alerts on price: the watcher records, it does not tip.
- A ninth chip on the map for the chart: only if the section earns visits.

## Built (9 September 2026, morning)

Live at sable.primecircle.cloud/#chart, inside the Token topic. As specified, with three small deviations found while building: the axis titles sit above the event tags (44 px of headroom instead of 28, or tag 1 covered "PRICE USD" when an event fell on the first candle); the volume strip takes 18 percent of the plot instead of 20; the legend puts a space between the number and the date, or screen readers and tests read "12 Sep" for event 1 on 2 Sep. GeckoTerminal answers through the proxies with X-Cache and the site's own no-store header (346 hour candles, 16 day candles at 08:33 UTC). The live page contacts only its own host, checked by `tests/shot-chart.mjs`. Fixtures test: `tests/chart-test.mjs` (three cases: all layers with a burn, no burn, candles unreadable). Not done: nothing from the spec; the ninth chip stays out until the section earns visits.

## Live (9 September 2026, later that morning)

The founder asked whether the chart could be live. Streaming is not on offer: DexScreener and GeckoTerminal have no public websocket, Solana's would need a relay, and the page's content policy allows no outside connection anyway. So live means polled, through the same proxies: while the section is on screen (IntersectionObserver) and the tab is visible, the page fetches the current candle series and the figures again every 30 seconds for 5-minute candles and every 60 seconds for hours and days, and the readings and the record every five minutes. A stamp by the controls says "live · updated HH:MM:SS UTC" and pulses on a fresh read (not under reduced motion); it turns amber when the last read is older than three intervals. The forming candle is outlined in cyan with its close marked on the right axis. New: 5-minute candles (`/ext/ohlcv-minute`, GeckoTerminal minute aggregate 5, cached 30 s, about three and a half days of history). `window.SABLE_CHART.refreshNow()` and `refreshMs()` exist for the tests; `tests/chart-test.mjs` now proves a refresh picks up a changed close and that the cadence tightens on 5-minute candles.
