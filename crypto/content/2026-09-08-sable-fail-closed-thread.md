# Four days of no: Sable's confidential tier, fail-closed, on the record

- Date: 2026-09-08
- Status: not posted as a thread; published as an X Article instead on 2026-09-08, see `2026-09-08-sable-fail-closed-article.md`
- Author handle: @0PTIMUS_ONE (outsider, SABL holder, not affiliated with Sable Network)
- Disclosure line carried in the thread (post 17) and at the end of the long form: "Disclosure: I hold SABL. I am not affiliated with Sable Network."

## Sources used

| Source | Where | Read at (UTC) |
|---|---|---|
| Status ledger, local clone | `sable-whitepaper-watch/status/log.jsonl`, 24 lines, 2026-09-04T18:27:47Z to 2026-09-07T20:37:26Z | 2026-09-08 ~08:30 |
| Status ledger, GitHub main | same file at `origin/main` (commit 69c9741), 26 lines, last line 2026-09-08T04:46:17Z | 2026-09-08 ~08:36 (git fetch) |
| Live status | `https://api.buildsable.com/v1/status` | 2026-09-08T08:34:18Z |
| Live signer | `https://api.buildsable.com/v1/receipts/pubkey` | 2026-09-08T08:34:19Z |
| Whitepaper text | `sable-whitepaper-watch/whitepaper.txt` (pdftotext -layout of the 2026-09-04 snapshot, cover "v2.0, August 2026", sha256 72514487...951) | 2026-09-08 |
| Watcher README and workflow | `sable-whitepaper-watch/README.md`, `.github/workflows/watch.yml` (cron `17 * * * *`) | 2026-09-08 |
| Observatory wording | `sites/sable-peers/source/sable-peers.html`, Log topic, "Reliability record" | 2026-09-08 |

Notes on the sources:

- The ledger is scheduled hourly; the runs land two to six hours apart (GitHub Actions cron is best effort). The thread says "26 checks", never "every hour". The Observatory already says the same: "the schedule is set hourly, but runs often land two to four hours apart."
- The whitepaper text renders the PDF's dash as `--`. Quotes below keep it as extracted.
- The ledger field `third_party_nodes: 1` is not used: the Observatory's log (7 Sep) corrected that the node is Sable's own runner, and the whitepaper (section 10) says "Zero third-party machines serve traffic today".
- The two newest ledger lines on GitHub carry a `token` block with price and market cap. Not used anywhere in this piece.
- Live status at fetch time: still failing closed. The ending is written for that case. If the tier recovers before posting, rewrite posts 1, 7, 14 and 16 and the long form's last three sections around the recovery line in the ledger.


## The thread

**1/17**

Sable Network's confidential tier has refused every request for at least 86 hours. At 08:34 UTC on 8 Sep 2026 its status endpoint reads: verified false, error measurement_mismatch, 7,482 consecutive refusals. The gateway around it: 100% uptime. What that means, and the record.

(277 chars)

**2/17**

Fail-closed, in one sentence: when a system cannot prove the thing it promised, it says no instead of quietly doing the unproven thing. For a confidential AI request, the unproven thing would be serving it from a backend nobody verified and calling it confidential anyway.

(272 chars)

**3/17**

The mechanism. Sable's confidential backend runs inside an Intel TDX trusted VM. As the VM boots, the TDX module in the CPU records a measurement: a hash of what was loaded into it. That measurement travels inside an attestation quote, signed by a key that chains back to Intel.

(278 chars)

**4/17**

The gateway verifies the quote, then compares the measurement with the value the operator pinned. measurement_mismatch means the quote is genuine but the code inside is not the code that was pinned. A harmless rebuild and something worse look the same from outside. So it refuses.

(280 chars)

**5/17**

The whitepaper promised exactly this. Section 08, Confidential execution & attestation: "Anything less fails closed -- the request is refused with an error, never served in plaintext by a different path."

(204 chars)

**6/17**

Section 12, the threat model, covers the case where the cause is internal: "A confidential request whose backend fails verification is refused, not downgraded -- including when the failure is our own misconfiguration."

(218 chars)

**7/17**

A watcher I run appends one line from api.buildsable.com/v1/status to a public GitHub repo, on an hourly schedule. First line, 4 Sep 18:27 UTC: verified false, measurement_mismatch, 550 refusals. Latest, 8 Sep 04:46 UTC: 7,178. In 26 checks, verified was never true.

(266 chars)

**8/17**

The counter climbs about 80 an hour in every interval, no dip, no reset. The whitepaper describes a background loop that re-verifies attestation continuously; the status endpoint reports a 30-second probe. My read: that loop, asking the same question and getting the same answer.

(279 chars)

**9/17**

The record opens with the counter already at 550. At 80 an hour, the first refusal lands near 11:40 UTC on 4 Sep. An estimate, not a reading. The gateway's own uptime field says its process started at 12:14 UTC that day. I note the proximity; I do not know that they are related.

(279 chars)

**10/17**

What did not break, in 26 of 26 checks: gateway online, 24h and 30d uptime 100.0%, receipt signer 0xf4a6…a812 and its scheme unchanged, 25 models listed, sandbox probe ok. Sable's uptime figure counts the gateway, not the backend a confidential request depends on.

(264 chars)

**11/17**

What the record cannot show: why the measurement changed. Section 08 says the pin is an allowlist, so an operator can pre-authorize a build; that a fail-closed window alerts an operator in about two minutes; and that a confidential-computing provider runs the enclave, not Sable.

(279 chars)

**12/17**

Opinion: the mundane explanation is a backend rebuild that was not on the allowlist. The whitepaper says that exact outage happened twice before the allowlist existed. Whether it is the case this time, only Sable or its provider can say. Anything else is a guess, mine included.

(278 chars)

**13/17**

Check it yourself, no account needed:
curl -s https://api.buildsable.com/v1/status
Read confidential.verified, error_class, consecutive_failures. Then:
curl -s https://api.buildsable.com/v1/receipts/pubkey
The signer should read 0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812.

(272 chars)

**14/17**

Recovery will show in the same record: a line where verified flips to true, last_verified_at gets a timestamp, verified_backends reads 1 of 1, the tee node reads online, and the counter resets. Whatever hour that happens, the ledger will hold it, next to every hour it did not.

(277 chars)

**15/17**

Why the ledger exists. Section 10: "Infrastructure whitepapers routinely describe a planned system in the present tense. We think that is the single most corrosive habit in this category." My read: the cure for that habit is a record the people involved do not control.

(269 chars)

**16/17**

Opinion: four days of refusals is a bad week for a product and a good week for a claim. The claim was that the system would rather say no than pretend. It has said no 7,482 times in a row, in public, with a counter anyone can read. I would still like to watch it say yes again.

(277 chars)

**17/17**

Disclosure: I hold SABL. I am not affiliated with Sable Network. The reliability record, with a day-by-hour grid of every check since 4 Sep: https://sable.primecircle.cloud#log
The raw ledger and the watcher script: https://github.com/CryptoWesAI/sable-whitepaper-watch

(269 chars)


## Long form

## Four days of no

Since at least the afternoon of 4 September 2026, Sable Network's confidential compute tier has refused every request sent to it. That reads like an outage report. It is closer to a compliance report, and the difference is the point of this piece.

### What the endpoint says

Sable publishes a status endpoint at api.buildsable.com/v1/status. At 08:34 UTC on 8 September it returned, among other fields: confidential.verified false, last_verified_at null, error_class measurement_mismatch, consecutive_failures 7,482, verified_backends 0 of 1. In the same reply: uptime_24h_pct 100.0 and uptime_30d_pct 100.0. Both are true at once. The confidential backend behind it has not passed verification in four days.

### What fail-closed means

A fail-closed system, when it cannot prove the thing it promised, says no rather than quietly doing the unproven thing. The alternative, fail-open, would serve the confidential request from whatever backend is available and label it confidential anyway. Nobody outside would notice, which is what makes it tempting.

### The mechanism

Sable's confidential backend runs inside an Intel TDX trusted VM. As the VM boots, the TDX module in the CPU records a measurement, a hash of what was loaded into it. That measurement is carried in an attestation quote signed by a key that chains back to Intel. Sable's gateway verifies the quote against Intel's collateral and then compares the measurement with a value pinned in advance by the operator. The whitepaper, section 08, describes the step: "the report's application measurement must match an operator-pinned allowlist, and the TCB status must be up to date. Anything less fails closed -- the request is refused with an error, never served in plaintext by a different path."

measurement_mismatch is the second half of that check failing. The quote is genuine and the hardware is real TDX, but the code that booted inside is not the code the operator said it would be. A harmless rebuild and a hostile substitution look identical: a valid quote carrying an unexpected hash. The honest answer to "is this the enclave you promised" is no, and the gateway says no.

Section 08 also anticipated the mundane version: "pinning one value turns every legitimate backend redeploy into a silent outage, which happened twice before the mechanism changed. An operator can now pre-authorize the next build. A background loop re-verifies attestation continuously, and a fail-closed window raises an operator alert within roughly two minutes rather than being discovered days later." And section 12, on the threat model: "A confidential request whose backend fails verification is refused, not downgraded -- including when the failure is our own misconfiguration."

### The record

I run a small watcher, public on GitHub, that appends one line from the status endpoint on an hourly schedule. GitHub's scheduler often lands the runs two to four hours apart, so the ledger holds 26 lines for the period, not 82. The first line, 4 September 18:27 UTC, already read verified false, measurement_mismatch, 550 consecutive refusals. The latest line at the time of writing, 8 September 04:46 UTC, reads 7,178. Verified was never true. The counter climbs at about 80 an hour in every interval, with no dip and no reset: the shape of a re-verification loop getting the same answer.

Extrapolating that rate backwards from 550 puts the first refusal near 11:40 UTC on 4 September. That is an estimate. The gateway's own uptime_seconds field says its process started at 12:14 UTC the same day. I note the proximity and do not claim a link.

What did not change in those 26 checks: gateway online, both uptime figures at 100.0, the receipt signer 0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812 and its scheme secp256k1-eip191, 25 models listed, the sandbox probe ok, and the node list (gateway online, tee degraded, one sandbox node online). Sable's uptime figure counts the gateway. The record also counts the backend, which is what a confidential request depends on.

### What the record cannot show

Why the measurement changed. The whitepaper says the enclave is operated by a confidential-computing provider, not by Sable, and that a fail-closed window alerts an operator within about two minutes. My read, and only a read: a rebuilt backend that was not pre-authorized on the allowlist is the ordinary explanation, and the paper says that exact failure happened twice before. Whether it is the explanation this time, only Sable or its provider can say.

### Check it yourself

Run `curl -s https://api.buildsable.com/v1/status` and read the confidential block. Run `curl -s https://api.buildsable.com/v1/receipts/pubkey` and compare the signer.

Recovery will show in the same record: verified true, last_verified_at with a timestamp, verified_backends 1 of 1, the tee node online, the counter reset. Whichever hour that happens, the ledger keeps it, next to every hour it did not.

### Why bother

Section 10 of the whitepaper: "Infrastructure whitepapers routinely describe a planned system in the present tense. We think that is the single most corrosive habit in this category." The cure for the habit, in my opinion, is a record the people involved do not control. Four days of refusals is a bad week for a product. For the claim that the system would rather say no than pretend, so far the claim holds. I would still like to watch it say yes again.

Disclosure: I hold SABL. I am not affiliated with Sable Network. The reliability record: https://sable.primecircle.cloud#log. The ledger and the watcher: https://github.com/CryptoWesAI/sable-whitepaper-watch.


## Facts checked

Every number and quote above, with where it came from.

| Claim | Value | Source | Timestamp (UTC) |
|---|---|---|---|
| Live confidential.verified | false | https://api.buildsable.com/v1/status | 2026-09-08T08:34:18Z |
| Live last_verified_at | null | same | same |
| Live error_class | measurement_mismatch | same | same |
| Live consecutive_failures | 7482 | same | same |
| Live binding_failures | 0 | same | same |
| Live verified_backends / total_backends | 0 / 1 | same | same |
| Live uptime_24h_pct, uptime_30d_pct | 100.0, 100.0 | same | same |
| Live samples_30d, probe_interval_seconds | 86408, 30 | same | same |
| Live gateway status | degraded | same | same |
| Live uptime_seconds | 332436 (92.3 h; process start 2026-09-04T12:13:42Z by subtraction) | same | same |
| Live signer_address, scheme | 0xf4a63ed649f4c2204738ac56fcb0ee2e348ad812, secp256k1-eip191 | https://api.buildsable.com/v1/receipts/pubkey | 2026-09-08T08:34:19Z |
| "at least 86 hours" | first ledger line 2026-09-04T18:27:47Z to live fetch 2026-09-08T08:34:18Z = 86.11 h | ledger + live fetch | as above |
| First ledger line | 2026-09-04T18:27:47Z, conf_verified false, measurement_mismatch, conf_failures 550, status degraded | status/log.jsonl line 1 (local and GitHub identical) | file read 2026-09-08 |
| Last local ledger line | 2026-09-07T20:37:26Z, conf_failures 6526 | status/log.jsonl line 24, local clone | file read 2026-09-08 |
| Last GitHub ledger line | 2026-09-08T04:46:17Z, conf_failures 7178 | origin/main status/log.jsonl line 26, commit 69c9741 | git fetch 2026-09-08 ~08:36 |
| "In 26 checks, verified was never true" | conf_verified false on all 26 lines; conf_error always measurement_mismatch; conf_backends always 0/1 | origin/main status/log.jsonl, scripted check | 2026-09-08 |
| "about 80 an hour in every interval" | 6628 refusals over 82.31 h = 80.5/h (first to last GitHub line); per-interval rate across the 22 intervals longer than 1.5 h: 79.6 to 85.7/h, all but the first evening between 79.6 and 81.3/h; last GitHub line to live fetch: 304 in 3.80 h = 80.0/h | scripted over origin/main status/log.jsonl + live fetch | 2026-09-08 |
| "no dip and no reset" | conf_failures monotonically non-decreasing on all 26 lines | scripted | 2026-09-08 |
| "30-second probe interval" | probe_interval_seconds: 30 in the live status reply; the counter grows about 80 an hour, so not every probe adds one, and the record does not explain the gap | live status | 2026-09-08T08:34:18Z |
| "first refusal near 11:40 UTC on 4 Sep" | 550 / 80.5 per h = 6.8 h before 18:27:47Z = ~11:38Z; labelled an estimate | derived | 2026-09-08 |
| "process started at 12:14 UTC" | 2026-09-08T08:34:18Z minus 332436 s = 2026-09-04T12:13:42Z | derived from live uptime_seconds | 2026-09-08 |
| "26 of 26 checks: gateway online, uptime 100.0, signer unchanged, scheme unchanged, 25 models, sandbox ok" | nodes always [gateway:online, tee:tee:degraded, node-4c9141b63c8d:online]; uptime_24h and uptime_30d always 100.0; signer and scheme constant; models always 25; sandbox_ok always true; confidential_models always the same two names | scripted over origin/main status/log.jsonl | 2026-09-08 |
| Ledger schedule "hourly" | cron "17 * * * *" in .github/workflows/watch.yml; README: "One line per hour" | repo files | 2026-09-08 |
| "runs land two to four hours apart" | Observatory Log topic text; measured gaps in the ledger 0.4 h to 6.1 h | sable-peers.html line 1069; scripted | 2026-09-08 |
| Quote, section 08 (tagline) | "Verify the hardware before you send it anything -- and refuse rather than downgrade." | whitepaper.txt line 347 | 2026-09-08 |
| Quote, section 08 | "the report's application measurement must match an operator-pinned allowlist, and the TCB status must be up to date. Anything less fails closed -- the request is refused with an error, never served in plaintext by a different path." | whitepaper.txt lines 351-353 | 2026-09-08 |
| Quote, section 08 | "pinning one value turns every legitimate backend redeploy into a silent outage, which happened twice before the mechanism changed. An operator can now pre-authorize the next build. A background loop re-verifies attestation continuously, and a fail-closed window raises an operator alert within roughly two minutes rather than being discovered days later." | whitepaper.txt lines 371-375 | 2026-09-08 |
| Paraphrase, section 08 | "the enclave is operated by a confidential-computing provider, not by Sable" | whitepaper.txt line 377 | 2026-09-08 |
| Quote, section 12 | "A confidential request whose backend fails verification is refused, not downgraded -- including when the failure is our own misconfiguration." | whitepaper.txt lines 532-533 | 2026-09-08 |
| Quote, section 10 | "Infrastructure whitepapers routinely describe a planned system in the present tense. We think that is the single most corrosive habit in this category." | whitepaper.txt lines 413-414 | 2026-09-08 |
| Quote, section 02 (not used in the thread, available) | "Attestation is verified against a pinned measurement by the gateway, and if verification fails the request is refused rather than quietly downgraded." | whitepaper.txt lines 101-103 | 2026-09-08 |
| Whitepaper snapshot identity | cover "v2.0, August 2026", 631,953 bytes, sha256 72514487a320b46baeef84e58613dbbc9a4a41f8ef1235f23866feeb06f5c951, snapshot 2026-09-04 | record.json, CHANGELOG.md | 2026-09-08 |
| Observatory wording reused | "Reliability record", "failing closed", "consecutive refusals", "refused, not downgraded", "Sable's own uptime figure counts the gateway" | sable-peers.html lines 1042, 1066-1069, 1839-1842 | 2026-09-08 |
| Links | https://sable.primecircle.cloud#log and https://github.com/CryptoWesAI/sable-whitepaper-watch | README.md, sable-peers.html | 2026-09-08 |

Not verified, and therefore not claimed: why the measurement changed; whether Sable or its provider has published a statement; whether the standard (non-confidential) tier served inference during the period (the ledger records the model list and gateway uptime, not inference success); how the TDX measurement is composed in Sable's specific deployment (the whitepaper says "application measurement", the thread says "a hash of what was loaded").
