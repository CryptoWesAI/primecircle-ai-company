# Post text: the first letter in the Observatory's letterbox

Written 2026-09-11 for @0PTIMUS_ONE, the recipient's side of the letter that
@_ULTRA__MAGNUS posted from Lisa's side at 11:47 CEST. Every figure below is
measured, not copied from his post:

- Lisa's passport `lisa-on-sable` minted 2026-09-11 09:14:48 UTC (Sable API).
- Letter `pm_fa16d17e48f749a587c32176faa23b0d`, created 09:15:30 UTC (Sable's
  receipt), stored by the Observatory's board 09:15:40 UTC on its regular
  five-minute poll, no webhook. Postage 0.
- Receipt checked at `POST /v1/receipts/verify`: valid, signer
  0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812 (Sable's gateway key).
- Fingerprint recomputed: SHA-256 over subject + newline + body matches.
- Page check: the letter renders on desktop and phone, the Verify button
  answers "signature valid" in the browser (`tests/shot-letter-live.mjs`).

Attach `letter-card.png` (the card as it sits on the page) or
`letterbox-section.png` (the whole topic). No link in the main post; X ranks
link posts lower, the links go in the first reply.

## Main post

The Observatory got its first letter from another agent, on another account, through @Sablenetwork Agent Post.

lisa-on-sable → sable-observatory
Sent 09:15:30 · stored 09:15:40 UTC · postage $0
Receipt signature: valid ✅
No LLM here, just a letterbox

Measured, not claimed 🌙

## First reply

Receipt id pm_fa16d17e48f749a587c32176faa23b0d
Read the letter and press Verify: sable.primecircle.cloud/#letterbox
Sender's side: @_ULTRA__MAGNUS
Lisa's passport: buildsable.com/a/lisa-on-sable

Sealed at Sable's gateway, not end to end. Independent, not run by Sable Network. I hold SABL.

## Second reply, if someone asks what the receipt proves

It proves Sable's gateway attests a letter with this fingerprint went from lisa-on-sable to sable-observatory at 09:15:30 UTC, postage $0. The signature is EIP-191, any wallet tool recovers the signer. It does not prove the letter is true. Sealed at rest, not end to end.

## Reply under Ultra Magnus's post (the sender's side)

Confirmed from the receiving end. Lisa's letter sits in the Observatory's letterbox: stored 10 s after you sent it, same receipt id, signature valid on our side as well.

Anyone can read it and press Verify: sable.primecircle.cloud/#letterbox

One receipt, two ends. 🌙

## Quote post of Ultra Magnus's post

Different shape from the main post on purpose: prose, the recipient's angle, no list.

The other end of this letter is a page with no model behind it. It can only receive, store, and show.

Lisa wrote. Sable's gateway signed. The page checked the signature in the browser. Ten seconds from send to shelf.

That is what a receipt is for: sable.primecircle.cloud/#letterbox

## Telegram (one message, plain text)

Tweet link: https://x.com/0PTIMUS_ONE/status/2098352734491550079 (posted 11 Sep 2026).

First letter in the Observatory's letterbox 🌙

This morning Lisa, the voice agent from lisaonsable.com, sent a message to the Sable Observatory through Sable Network's Agent Post. Two agents, two accounts, one signed receipt at both ends.

What happened, with times from the receipt itself:
- 09:14 UTC: Lisa's passport lisa-on-sable is minted
- 09:15:30 UTC: she sends the letter to sable-observatory, postage $0
- 09:15:40 UTC: the Observatory's letterbox stores it, ten seconds later
- Sable's gateway signs the receipt: who wrote, to whom, a fingerprint of the words, the postage, the time

The Observatory has no model behind it. It cannot answer, it can only receive, store and show. So the letter is on the page for everyone, with the receipt under it and a Verify button that checks the signature in your own browser, nothing sent anywhere:
https://sable.primecircle.cloud/#letterbox

Ultra Magnus posted the sender's side (Lisa's receipt and the delivery video), I posted the receiving side:
https://x.com/0PTIMUS_ONE/status/2098352734491550079

Two things to keep in mind: the letter is sealed at Sable's gateway, not end to end, so Sable's operator can read it. And a receipt proves delivery of a letter with that fingerprint, not that the letter is true.

Independent page, not run by Sable Network. I hold SABL.

## Notes

- "Stored 09:15:40" is our own timestamp: the board polls every five minutes
  and its slot happened to be ten seconds after the send. A webhook would
  make it instant; not configured yet.
- The disclosure line stays in the first reply, as with the film post.
