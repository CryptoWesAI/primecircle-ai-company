# X Article: Four days of no

- Date: 2026-09-08
- Status: draft, not published
- Author: @0PTIMUS_ONE (outsider, SABL holder, not affiliated with Sable Network)
- Built from: `2026-09-08-sable-fail-closed-thread.md` (same sources, same quotes), refreshed with the live status read at about 10:12 UTC on 8 September 2026 (derived from `uptime_seconds` 338,309 against the 08:34:18Z read).
- Cover image: `2026-09-08-sable-fail-closed-header.png` (1600 by 640, the 5:2 ratio the editor asks for), drawn from the ledger.

## How to paste

The X Articles editor has no markdown. Paste the body below section by section, then apply from the toolbar: the `##` lines become a heading (Tekst dropdown), the `>` blocks become a quote (the quote button), the `-` lines become a bulleted list, and the two `curl` lines stay plain text on their own lines. Make the URLs links. Everything else is plain paragraphs.

## Title

Four days of no: Sable's confidential tier, on the record

## Body

Since the afternoon of 4 September 2026, Sable Network's confidential compute tier has refused every request sent to it. At 10:12 UTC on 8 September the count stood at 7,612 consecutive refusals. That reads like an outage report. It is closer to a compliance report, and the difference is the point of this piece.

## What the endpoint says

Sable publishes a status endpoint at api.buildsable.com/v1/status. On 8 September at 10:12 UTC it returned, among other fields:

- confidential.verified: false
- last_verified_at: null
- error_class: measurement_mismatch
- consecutive_failures: 7,612
- verified_backends: 0 of 1
- uptime_24h_pct: 100.0 and uptime_30d_pct: 100.0

All of that is true at once. The gateway is up and has been up. The confidential backend behind it has not passed verification in four days.

## What fail-closed means

A fail-closed system, when it cannot prove the thing it promised, says no rather than quietly doing the unproven thing. The alternative, fail-open, would serve the confidential request from whatever backend is available and label it confidential anyway. Nobody outside would notice. That is exactly what makes fail-open tempting, and exactly why a promise to fail closed is only worth something once you have watched it cost the promiser a few days.

## The mechanism

Sable's confidential backend runs inside an Intel TDX trusted VM. As the VM boots, the TDX module in the CPU records a measurement: a hash of what was loaded into it. That measurement travels inside an attestation quote, signed by a key that chains back to Intel. Sable's gateway verifies the quote against Intel's collateral and then compares the measurement with a value the operator pinned in advance. The whitepaper, section 08, describes the step:

> "the report's application measurement must match an operator-pinned allowlist, and the TCB status must be up to date. Anything less fails closed — the request is refused with an error, never served in plaintext by a different path."

measurement_mismatch is the second half of that check failing. The quote is genuine and the hardware is real TDX, but the code that booted inside is not the code the operator said it would be. From the outside, a harmless rebuild and a hostile substitution look identical: a valid quote carrying an unexpected hash. The honest answer to "is this the enclave you promised" is no, and the gateway says no.

Section 08 also anticipated the mundane version of this:

> "pinning one value turns every legitimate backend redeploy into a silent outage, which happened twice before the mechanism changed. An operator can now pre-authorize the next build. A background loop re-verifies attestation continuously, and a fail-closed window raises an operator alert within roughly two minutes rather than being discovered days later."

And section 12, the threat model, covers the case where the cause is internal:

> "A confidential request whose backend fails verification is refused, not downgraded — including when the failure is our own misconfiguration."

## The record

I run a small watcher, public on GitHub, that appends one line from the status endpoint on an hourly schedule. GitHub's scheduler often lands the runs two to four hours apart, so the ledger holds 26 lines for the period rather than one per hour. I say "26 checks" and not "every hour" for that reason.

The first line, 4 September at 18:27 UTC, already read: verified false, measurement_mismatch, 550 consecutive refusals. The latest committed line, 8 September at 04:46 UTC, read 7,178. Verified was never true in any of the 26. The counter climbs at about 80 an hour in every interval, with no dip and no reset. The status endpoint reports a 30-second probe interval, so not every probe adds one to the counter; the record does not say why, and I do not guess.

Extrapolating that rate backwards from 550 puts the first refusal near 11:40 UTC on 4 September. That is an estimate, not a reading. The gateway's own uptime_seconds field says its process started at 12:14 UTC the same day. I note the proximity and do not claim a link.

## What did not break

In 26 of 26 checks:

- gateway online, uptime 24h and 30d at 100.0
- receipt signer 0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812, scheme secp256k1-eip191, unchanged
- 25 models listed
- sandbox probe ok
- node list unchanged: gateway online, tee degraded, one sandbox node online

Sable's uptime figure counts the gateway. The record also counts the backend, which is what a confidential request depends on. Both numbers are honest. They answer different questions.

## What the record cannot show

Why the measurement changed. The whitepaper says the enclave is operated by a confidential-computing provider, not by Sable, and that a fail-closed window alerts an operator within about two minutes. My read, and only a read: a rebuilt backend that was not pre-authorized on the allowlist is the ordinary explanation, and the paper says that exact failure happened twice before the allowlist existed. Whether it is the explanation this time, only Sable or its provider can say. Anything else is a guess, mine included.

## Check it yourself

No account needed. Two commands:

curl -s https://api.buildsable.com/v1/status

curl -s https://api.buildsable.com/v1/receipts/pubkey

In the first, read confidential.verified, error_class and consecutive_failures. In the second, the signer should read 0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812.

## What recovery looks like

Recovery will show in the same record: a line where verified flips to true, last_verified_at gets a timestamp, verified_backends reads 1 of 1, the tee node reads online, and the counter resets. Whichever hour that happens, the ledger keeps it, next to every hour it did not.

## Why bother

Section 10 of the whitepaper:

> "Infrastructure whitepapers routinely describe a planned system in the present tense. We think that is the single most corrosive habit in this category."

The cure for the habit, in my opinion, is a record the people involved do not control. Four days of refusals is a bad week for a product. For the claim that the system would rather say no than pretend, so far the claim holds: it has said no more than seven thousand times in a row, in public, with a counter anyone can read. I would still like to watch it say yes again.

Disclosure: I hold SABL. I am not affiliated with Sable Network.

The reliability record, with a day-by-hour grid of every check since 4 September: https://sable.primecircle.cloud#log

The raw ledger and the watcher script: https://github.com/CryptoWesAI/sable-whitepaper-watch

## Post to carry the article

Sable's confidential tier has said no to every request for four days: 7,612 consecutive refusals at 10:12 UTC today, with the gateway at 100% uptime the whole time. What measurement_mismatch means, what the whitepaper promised, and the public record, hour by hour.

(Add the article link. If the tier has recovered before you publish, rewrite the opening paragraph, "What the endpoint says", "What recovery looks like" and "Why bother" around the recovery line in the ledger, and change the post.)

## Facts refreshed for the article

| Fact | Source | Read at (UTC) |
|---|---|---|
| 7,612 consecutive refusals, verified false, measurement_mismatch, 0 of 1 backends, uptime 100.0 / 100.0, probe_interval_seconds 30, uptime_seconds 338,309 | https://api.buildsable.com/v1/status | 2026-09-08 about 10:12 (derived from uptime_seconds) |
| Everything else | see the facts table in `2026-09-08-sable-fail-closed-thread.md` | 2026-09-08 |

Quotes are verbatim from the whitepaper text; the em dashes inside them are the paper's own.
