# Browser tests for sable.primecircle.cloud

Three Puppeteer suites, run against the local build first and the live page
second. They need `puppeteer-core` (in the repo's package.json) and a local
Chrome or Edge.

```
cd sites/sable-peers/tests && mkdir -p shots
node shell-test.mjs     "file:///c:/.../sites/sable-peers/site/index.html" local
node shell-test.mjs     https://sable.primecircle.cloud/ live
node sky-test.mjs       https://sable.primecircle.cloud/ live
node translate-test.mjs https://sable.primecircle.cloud/ live
node tracks-test.mjs    https://sable.primecircle.cloud/ live
```

- `shell-test.mjs`: the dashboard shell on desktop and phone (38 checks): compact
  and full modes, rail, Topics menu, the door, the verifier, the guide.
- `tracks-test.mjs`: the listening room's track pages: index.json, six pages with one
  player each and a served MP3, quoted lines marked at least as often as the
  sources list, stamp and disclosure, no overflow at 390. Local runs need
  `static-server.mjs` (audio and index.json are fetched, not opened as files).
- `sky-test.mjs`: the starfield, the drifter, reduced motion.
- `translate-test.mjs`: simulates a browser translating the page (every
  translatable text node rewritten with rot13 and wrapped in `<font>` pairs, the
  way Chrome does), then checks that addresses, hashes, receipts, the ledger,
  tickers, project names and the whitepaper cover text are untouched, that the
  live badges do not change, and that the door, the verifier, navigation and
  the guide still work on the translated page. It also asserts the `translate`
  mode of every element that matters, in both directions.

Screenshots land in `shots/` (ignored by git). Each suite exits non-zero on any
failed check or page error.

Against `file://` the suites ignore the expected proxy failures (no `/sable-api`
or `/ext` without nginx); everything else must pass in both places.
