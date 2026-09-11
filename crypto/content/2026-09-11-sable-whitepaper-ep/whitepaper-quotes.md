# Sable Network whitepaper: lyric source material

Source: pdf_url `https://www.buildsable.com/sable-whitepaper.pdf`. Latest snapshot: 2026-09-04. Generated_at: 2026-09-11T08:05:02Z. Sentence_count: 254.

All quotes below are copied verbatim from `whitepaper.json`, including original em-dashes and punctuation. Sentence ids in brackets are section.index within that section's sentence array (not ids carried in the source JSON, which has none).

---

## 1. The delegation problem

Summary: Delegating to an autonomous agent means it discloses everything continuously and, once it holds a wallet, nobody can verify what it did with the money afterward. Sable's answer is a narrow wedge: a one-line API swap, not new infrastructure to adopt.

Lines:
1. [01.01] You cannot delegate authority to a system you can neither keep private nor hold to account.
2. [01.07] An agent left running is a process with a wallet.
3. [01.08] It can loop.
4. [01.09] It can spawn sub-agents.
5. [01.10] It can be prompt-injected into doing something expensive.
6. [01.14] Both are engineering problems, not policy problems.
7. [01.17] The wedge is deliberately narrow: a developer adopts it by changing one line.
8. [01.19] Trust that requires lock-in is not trust — it is capture.

Hook candidates: "a process with a wallet", "It can spawn sub-agents", "Trust that requires lock-in"

## 2. The control plane

Summary: Sable does not sell compute itself, it sells the metering, budget enforcement, and proof that sit over it, with authority held at the gateway rather than the backend. Every check runs before the call, and a failure is refused rather than quietly downgraded.

Lines:
1. [02.01] Sable does not sell you a machine.
2. [02.02] It sells the metering, the budget, and the proof that sit over one.
3. [02.03] The product is a gateway, and the gateway is the whole thesis.
4. [02.11] anonymized access is not the confidential tier.
5. [02.17] Budgets are enforced before an upstream call is made, not reconciled afterwards.
6. [02.18] the request is refused rather than quietly downgraded.
7. [02.19] The backend is, deliberately, the least trusted component in the system — which is precisely what makes it replaceable.
8. [02.22] The interface is the contract; the substrate is an implementation detail.

Hook candidates: "the gateway is the whole thesis", "refused rather than quietly downgraded", "the least trusted component"

## 3. The privacy contract

Summary: Privacy is stated as a short list of hard invariants enforced in code, not a policy promise, tested against one blunt question for every change: could an operator reconstruct the payload from what was just added. Persistence is metadata only, and the portal itself can never show a prompt because the prompt was never kept.

Lines:
1. [03.01] A short list of invariants, enforced in code and testable from outside.
2. [03.03] Prompts, completions, and submitted code are never written to disk or logs.
3. [03.08] Persistence is metadata only.
4. [03.11] The only content-derived value stored anywhere is a truncated SHA-256 fingerprint.
5. [03.18] Secrets live in the environment.
6. [03.19] The master key is required at boot; the service refuses to start without one.
7. [03.20] The portal never displays content.
8. [03.22] It cannot show a prompt, because the prompt was never kept.
9. [03.24] If yes, it does not ship.

Hook candidates: "Persistence is metadata only", "It cannot show a prompt", "the prompt was never kept"

## 4. Architecture

Summary: One pipeline handles both inference and sandbox jobs: seal on ingress, hold a budget, dispatch once, meter what happened, then sign a receipt. Plaintext exists only inside a small, named code frame between opening the envelope and the single dispatch it was opened for.

Lines:
1. [04.01] Seal on ingress, authorize against a budget, dispatch once, meter what happened, sign the result.
2. [04.04] Its internal flow is the product.
3. [04.07] PLAINTEXT EXISTS ONLY BETWEEN OPEN() AND THE DISPATCH IT WAS OPENED FOR.
4. [04.09] The sealed envelope, not the plaintext, is what the routing layer carries.
5. [04.10] any tampering with the ciphertext fails authentication on open.
6. [04.13] This is the entire privacy surface.
7. [04.14] The plaintext does not leave that frame: it is not logged, not persisted, not echoed into errors, and not retained once the response has streamed back.
8. [04.15] a backend's own error message is one of the easiest ways to leak a payload

Hook candidates: "Its internal flow is the product", "This is the entire privacy surface", "seal on ingress"

## 5. Metering, budgets & delegation

Summary: Credit is an append-only ledger with holds placed before any call runs, closing the race condition a runaway agent could otherwise exploit against a simple balance check. A delegated sub-key can only ever be equal to or narrower than its parent, never broader, and revocation cascades down the whole tree.

Lines:
1. [05.01] A budget that is checked after the money is spent is not a budget.
2. [05.02] Credit is an append-only ledger.
3. [05.05] Spending is pre-authorized, not post-paid.
4. [05.07] Spendable credit is the balance minus outstanding holds.
5. [05.09] without holds, a balance of one micro-dollar authorizes an unbounded number of concurrent jobs, which is exactly the failure mode a runaway agent produces.
6. [05.12] Agents fail in ways human users do not
7. [05.15] Omitting a field inherits the parent's limit — it does not mean "unlimited".
8. [05.16] An allowlist intersects.
9. [05.19] Depth is capped, and tier is inherited rather than settable.
10. [05.20] a runaway sub-agent is then bounded by construction rather than by somebody noticing.

Hook candidates: "Spending is pre-authorized, not post-paid", "An allowlist intersects", "bounded by construction"

## 6. Payment: prepaid USDT and x402

Summary: Agents fund accounts by sending USDT on-chain or pay per-request through x402, with strict on-chain checks that block replay and lookalike-token attacks. The paper is blunt that the new SABL token is optional, never required, and confers no yield, governance, or claim on the network.

Lines:
1. [06.01] Machines should be able to pay for compute without a card, a signup, or a human.
2. [06.15] Naming the scheme honestly is cheaper than explaining later why the standard one did not work.
3. [06.16] a payout denominated in something the recipient cannot spend is not a payout.
4. [06.17] Compute is bought and sold here in dollars.
5. [06.19] None of that has changed, and none of it will.
6. [06.26] Paying in SABL is optional and never required
7. [06.28] It confers no yield, no revenue share, no governance, and no claim on Sable Network.
8. [06.29] It is a consumptive payment utility, not an investment.
9. [06.31] anything else using the name is an impersonation.

Hook candidates: "without a card, a signup, or a human", "paid in dollars too", "not an investment"

## 7. Verifiable receipts

Summary: Every billable call returns a signed, metadata-only receipt that anyone can verify with standard crypto tooling, no Sable library required. The paper is explicit that a receipt proves the gateway's own accountable claim, not physics, unless paired with attestation.

Lines:
1. [07.01] A guarantee you can check beats a guarantee you have to believe.
2. [07.02] a compact, metadata-only statement of what was processed and under what terms
3. [07.05] since the headers are long gone by then
4. [07.06] It is worth being precise about what a receipt does and does not establish, because overstating it would undo the point.
5. [07.07] A gateway-signed receipt proves that this deployment attests to having processed a payload with that fingerprint, under that tier, at that metered cost — and that no field has been altered since.
6. [07.08] It is an accountable statement by a named party, not a proof of physics.
7. [07.09] the response bound to the key that measurement committed to
8. [07.10] an integration written today inherits the stronger guarantee without a code change.

Hook candidates: "A guarantee you can check", "not a proof of physics", "the headers are long gone"

## 8. Confidential execution & attestation

Summary: On the confidential tier the gateway cryptographically verifies real hardware attestation before routing anything to it, and fails closed instead of silently serving plaintext elsewhere. It also checks that the response itself came from the attested enclave, not merely that one exists somewhere.

Lines:
1. [08.01] Verify the hardware before you send it anything — and refuse rather than downgrade.
2. [08.02] a request is routed only to a backend running inside an Intel TDX trusted execution environment
3. [08.04] Anything less fails closed — the request is refused with an error, never served in plaintext by a different path.
4. [08.06] An attestation proves that a correctly-measured enclave exists.
5. [08.07] It does not, by itself, prove that your response came from it.
6. [08.10] Publishing the weaker state honestly is the difference between a verifiable claim and a marketing one.
7. [08.13] Routing to an enclave you did not attest is not a rule to remember; it does not compile.
8. [08.19] verified hardware, whoever runs it.

Hook candidates: "refuse rather than downgrade", "it does not compile", "verified hardware, whoever runs it"

## 9. Sandbox compute

Summary: Sandboxed code execution runs under the same privacy contract as inference: the code, its environment, and its output are never persisted, and a replayed run returns the receipt but not the output a second time. Billing counts memory as well as CPU because memory, not CPU, is what actually limits how many sandboxes a host can run at once.

Lines:
1. [09.01] Agents write code.
2. [09.02] Something has to run it, and the same rules should apply.
3. [09.06] Pricing memory as well as CPU is not a rounding detail.
4. [09.08] Any metering scheme that ignores the binding resource is a scheme that rewards exhausting it.
5. [09.11] a run replayed via its idempotency key returns the recorded receipt with a replayed marker and empty output.
6. [09.12] The metadata was kept; the output never was.
7. [09.13] the safe posture is the one you get by not thinking about it
8. [09.14] a container is not an isolation boundary for hostile code
9. [09.18] a backend that was never reachable, or a runner that failed to start, is recorded and costs nothing

Hook candidates: "Agents write code", "the output never was", "not a rounding detail"

## 10. What is built, and what is not

Summary: The paper draws a hard line between what runs in production today and what is still direction, and calls out its own earlier region-pinning claim as a jurisdiction claim backed by nothing. Fewer requests succeeding, honestly, is treated as the feature.

Lines:
1. [10.01] The most load-bearing section in this document.
2. [10.02] Infrastructure whitepapers routinely describe a planned system in the present tense.
3. [10.03] We think that is the single most corrosive habit in this category
4. [10.05] Zero third-party machines serve traffic today
5. [10.07] a jurisdiction claim backed by nothing
6. [10.08] Today a pin is honoured only when it matches the region the deployment actually declares, and refused otherwise.
7. [10.09] Fewer requests succeed.
8. [10.10] The ones that do mean something.

Hook candidates: "The most load-bearing section", "Fewer requests succeed", "a jurisdiction claim backed by nothing"

## 11. Direction: compute for rent

Summary: Sable's stated direction is to keep renting compute rather than buying hardware, and to sell the trust and metering layer over it rather than the machines themselves. The paper commits to not calling itself a marketplace or decentralized network until independent operators actually carry real volume.

Lines:
1. [11.01] The machines are the commodity.
2. [11.02] The trust layer over them is not.
3. [11.06] What Sable would sell is never the machine — it is gateway-authoritative metering, hard budgets, signed receipts, fail-closed attestation, and agent-native payment over hardware nobody has to trust.
4. [11.09] Vetted supply with dollar rails works.
5. [11.13] the buyer is paying for the proof, not the silicon.
6. [11.16] at commodity prices nobody buys code execution on a stranger's readable machine
7. [11.19] An exchange with no sellers is the most common artefact in this industry.
8. [11.20] We would rather ship late than describe one.

Hook candidates: "The machines are the commodity", "paying for the proof, not the silicon", "ship late than describe one"

## 12. Threat model & trust boundaries

Summary: The paper lists exactly what is defended today, in-transit interception, tampering, unattested execution, runaway budgets, double billing, against what is not yet solved: the gateway operator, the sandbox host, the upstream model host, a single point of failure. It states plainly that overstating a confidentiality guarantee is worse than making none.

Lines:
1. [12.01] What is protected now, what is not, and which of those we intend to change.
2. [12.05] A subpoena, a breach, or a curious engineer finds metadata — never content.
3. [12.09] A confidential request whose backend fails verification is refused, not downgraded
4. [12.11] Pre-auth holds, subtree-aware spend caps, and cascading revocation bound the blast radius of a sub-agent you no longer control.
5. [12.18] A runner host can read the code it executes and the environment handed to it.
6. [12.19] This is the honest gap
7. [12.22] the standard tier does not pretend otherwise, in the product or in the docs.
8. [12.25] a confidentiality product that overstates its guarantees is worse than one that makes none: it manufactures confidence that is then acted on.
9. [12.26] every step of it should be checkable from outside, by a buyer who has no reason to take our word for anything.

Hook candidates: "finds metadata — never content", "refused, not downgraded", "This is the honest gap"

## 13. Conclusion

Summary: The closing claim is that the durable position is not the hardware or the model but the layer that makes a unit of compute provable, and that this layer is what makes the machine underneath replaceable. It ends bluntly: trust comes from architecture, not assurances, because promises don't scale.

Lines:
1. [13.01] The agent economy will route an enormous volume of machine intent through a small number of compute endpoints.
2. [13.02] Whether that layer becomes an unaccountable one — where nobody can say what ran, on what, for whom, or how much — is being decided now, by the defaults the infrastructure ships with.
3. [13.03] metered where the metering can be trusted, bounded before the money moves, attested where the hardware allows it, and signed into a receipt that outlives the request and does not require trusting the party that issued it.
4. [13.04] Build that, and the machine underneath stops needing to be trusted — which is exactly what makes it replaceable, and exactly why the trust layer is the part worth owning.
5. [13.05] We earn trust through architecture, not assurances.
6. [13.06] Promises don't scale.

Hook candidates: "We earn trust through architecture", "Promises don't scale", "the part worth owning"

## 14. Appendix: API surface

Summary: The appendix lists a representative slice of the REST and JSON-RPC surface, from chat completions and sandboxes to delegated sub-keys and live attestation checks, with a signed receipt triplet stamped on every metered response header.

Lines:
1. [A.01] A representative slice.
2. [A.02] Full reference at buildsable.com/docs.
3. [A.03] Mint a bounded child of the calling key
4. [A.03] an agent's remaining runway
5. [A.03] Live verified TEE attestation
6. [A.03] pre-flight, before you send anything
7. [A.03] What is actually serving: this gateway and its configured backends
8. [A.04] Streaming responses emit the receipt as a trailing sable.receipt event instead, because the headers have already been flushed.

Hook candidates: "an agent's remaining runway", "before you send anything", "the headers have already been flushed"

---

## Whole-paper hooks

1. "The machines are the commodity." — section 11
2. "A budget that is checked after the money is spent is not a budget." — section 5
3. "An agent left running is a process with a wallet." — section 1
4. "Promises don't scale." — section 13
5. "Trust that requires lock-in is not trust — it is capture." — section 1
6. "It does not compile." — section 8
7. "Persistence is metadata only." — section 3
8. "the buyer is paying for the proof, not the silicon." — section 11

## Numbers and names to keep exact

- URL: `https://www.buildsable.com/sable-whitepaper.pdf`, docs at `buildsable.com/docs`
- Snapshot dates: first `2026-08-29`, latest `2026-09-04`, generated_at `2026-09-11T08:05:02Z`
- Crypto: AES-256-GCM, 96-bit nonce, SHA-256 (truncated fingerprint), Argon2id, secp256k1, EIP-191 digest
- Attestation: Intel TDX, DCAP quote, TCB status, report_data, response_bound flag
- Isolation: gVisor (production sandbox), Docker (dev-only backend, explicitly not an isolation boundary)
- Payment protocol: x402, scheme name `sable-usdt-onchain`, HTTP 402
- Token standard notes: USDT implements neither EIP-3009 nor EIP-2612
- Stablecoin: USDT, ERC-20 Transfer event
- Chains live in production: Ethereum, Arbitrum One, Solana
- SABL: community token on Solana, mint `DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump`, fixed supply, mint and freeze authority revoked, launched August 2026, utility stance reversed as of 2026-09-02
- SABL distribution: 8% project treasury, 92% circulates on the open market
- Model ids: `sable`, `sable-fast`, `sable-max`; flagship `sable` currently points to Claude Opus 5
- Receipt versions: v:1 (token-metered), v:2 (unit-metered), v:3 (node-countersigned, not built)
- Billing units: vCPU-seconds, gigabyte-seconds
- Per-key limit status codes: 402 (spend cap), 403 (allowlist), 401 (expiry), 429 with Retry-After (rate limit)
- Request params: `sable_privacy_tier`, `sable_region`, `sable_scrub`
- Env var: `ANTHROPIC_BASE_URL`
- Response headers: `x-sable-node`, `x-sable-region`, `x-sable-privacy-tier`, `x-sable-receipt`, `x-sable-receipt-sig`, `x-sable-receipt-signer`
- API endpoints (Appendix): `POST /v1/chat/completions`, `POST /v1/embeddings`, `POST /v1/messages`, `POST /v1/sandboxes`, `POST /v1/mcp`, `POST /v1/keys/delegate`, `GET /v1/credit`, `GET /v1/models`, `GET /v1/attestation`, `GET /v1/receipts/pubkey`, `POST /v1/receipts/verify`, `GET /v1/billing/methods`, `GET /v1/nodes`
- Auth gap noted: OAuth 2.1 / DCR is not implemented for the remote MCP server (bearer-key auth only)
- Sable Vault: RWA registry, per-asset hash-chained ledgers, Solana memo-transaction anchoring
