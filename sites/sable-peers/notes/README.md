# The reading room

Research written for the Sable community, published on sable.primecircle.cloud
under the Reading room topic, each piece as its own page at `/notes/<slug>.html`
with an optional PDF.

## Adding a piece

1. Write the piece in `crypto/content/...` as usual (dated, sourced, holder
   disclosure, opinions marked). Render its PDF there if wanted.
2. Copy the markdown here as `YYYY-MM-DD-<slug>.md` with this front matter, and
   the body without the H1:

   ```
   ---
   title: ...
   date: 2026-09-10
   slug: robinhood-chain-bridge
   summary: one or two sentences for the list
   pdf: 2026-09-10-robinhood-chain-bridge.pdf
   ---
   ```

   Copy the PDF next to it under the name given in `pdf:`.
3. Build and check:

   ```
   node build-notes.mjs
   node build.mjs source/sable-peers.html
   node tests/static-server.mjs 8792     (then open http://127.0.0.1:8792/#reading)
   ```
4. Add a line to the page log in `source/sable-peers.html` (Page updates) and
   rebuild, then `bash deploy-to-vps.sh`.

The markdown subset the builder understands: headings, paragraphs, bullet and
numbered lists, bold, italics, inline code, links, horizontal rules. Bare
domains in the sources list become links. No inline HTML, no tables, no images
(add them to the builder when a piece needs them).
