# Should Sable bridge to Robinhood Chain? Research note and ADHD run

Date: 2026-09-10. Written for the founder, who holds SABL and runs the Sable Observatory as an outsider. Method: primary-source fact base first, then the `adhd` skill (five isolated divergent branches, scored and clustered, top three deepened). The public article built on this note is `crypto/content/2026-09-10-sable-robinhood-chain-bridge/article.md`.

Disclosure: the founder holds SABL. Every figure is dated and sourced. Opinions are marked as opinions.

## 0. The poll

The founder reports a community poll asking whether Sable Network should bridge to Robinhood Chain. The poll text could not be retrieved (X is not scrapable from this workspace and web search returned nothing), so this note treats both readings:

- **Reading A, token:** bridge SABL from Solana to Robinhood Chain as an ERC-20 (LayerZero OFT, lock-and-mint, or a wrapper) and list it there.
- **Reading B, rail:** make Sable's gateway usable from Robinhood Chain: accept stablecoin deposits on chain 4663, serve agents that live there.

The two readings have different costs, different risks and different answers. That is the first finding.

## 1. Fact base

### Robinhood Chain (as of 2026-09-10)

| Fact | Value | Source |
|---|---|---|
| Stack | Ethereum Layer 2 on the Arbitrum stack, built with Offchain Labs | Arbitrum DAO factsheet; Robinhood newsroom |
| Testnet | 10 Feb 2026, 4 million transactions in the first week | Robinhood newsroom (via search) |
| Mainnet | 1 July 2026, announced at a London keynote | Robinhood newsroom; Arbitrum DAO factsheet |
| Chain ID, gas | 4663, gas paid in ETH | docs.robinhood.com/chain/connecting |
| Speed | "100ms latency through configurable block times and preconfirmations" | Arbitrum DAO factsheet |
| Canonical bridge | Arbitrum bridge from Ethereum; docs also mention "several cross-chain routes" | docs.robinhood.com |
| Cross-chain | LayerZero endpoint ID 30416; LayerZero calls the chain "connected to every blockchain via LayerZero"; deBridge, Relay and Across route there from Ethereum | docs.layerzero.network; LayerZero on X (via search) |
| Stablecoin | USDG (Paxos, Global Dollar) is the native stablecoin; USDT is not reported as native | KuCoin flash, Cryptonomist (secondary sources, 21 Aug 2026) |
| Apps live | Uniswap, 1inch, Lighter, Rialto, Arcus, Chainlink, Morpho | Robinhood newsroom |
| Purpose | Stock Tokens: "tokenised debt securities, held in self-custody through the Robinhood Wallet, with 24/7 trading in more than 120 countries"; not available in the US, Canada, UK, Switzerland, UAE or sanctioned jurisdictions | Robinhood newsroom; Arbitrum DAO factsheet |
| Positioning | "AI-native and purpose-built for real-world assets" | Robinhood newsroom |
| Licence | 10 percent of chain net revenue to Arbitrum: 8 percent DAO treasury, 2 percent Developer Guild | Arbitrum DAO factsheet |
| Agentic trading | An MCP server for US brokerage accounts, launched 27 May 2026, crypto added July 2026, "rolling out" | TechCrunch; Genfinity; Robinhood newsroom |
| Scale | "nearly 28 million customers", 38 countries | Robinhood newsroom |

### Sable Network and SABL (as of 2026-09-10)

| Fact | Value | Source |
|---|---|---|
| Product | Pay-as-you-go gateway between AI agents and compute: sealed request, budget held first, signed receipt | Whitepaper v2.0, Aug 2026 (snapshot 4 Sep 2026 in the watch repo) |
| Pricing | "Compute is bought and sold here in dollars. If supply is ever paid, it is paid in dollars too." | Whitepaper v2.0 |
| Deposits | USDT to a treasury address; "In production, deposits are live on Ethereum, Arbitrum One, and Solana." Verification: own JSON-RPC node, Transfer from the configured token contract, linked sender wallet, confirmations, replay protection. "Token addresses are operator-configured and deliberately not hardcoded." | Whitepaper v2.0 |
| x402 | An out-of-credit request returns 402 with an accepts array; the agent pays and retries | Whitepaper v2.0 |
| Supply side | "Zero third-party machines serve traffic today" | Whitepaper v2.0, status table |
| SABL | Launched Aug 2026 on Solana, mint `DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump`, "fixed supply, mint and freeze authority revoked" | Whitepaper v2.0 |
| SABL utility | Since 2 Sep 2026: "it can be used to pay for Sable compute and Sable Pro subscriptions, and paying in SABL burns it and earns a discount." Optional, never required, no yield, no governance, no claim. Status "rolling out". | Whitepaper v2.0 |
| Market | Market cap about $330K to $390K on 8 to 9 Sep, $585K at the Observatory's read on 10 Sep; liquidity about $60K to $67K on one Solana DEX | DexScreener via the Observatory and `crypto/research/2026-09-09-sable-peers-deep-dive.md` |

### Peer history in the founder's own files

- Secret Network: Axelar IBC bridge exploited June 2026, an infinite-mint bug unnoticed for a week (`crypto/research/peers/secret.md`).
- Nillion: token moved from its own Cosmos chain to Ethereum via a 1:1 bridge in Feb 2026; the old chain stopped a month later (`crypto/research/peers/nillion.md`).
- iExec: retired its bespoke sidechain in July 2026, "the cost of a bespoke chain" (`crypto/research/peers/iexec.md`).

## 2. ADHD run

**Brief.** Problem: should Sable bridge to Robinhood Chain. Reframe used: split into Reading A (token) and Reading B (rail), and ask what only becomes visible under five frames: markets, regulator, attacker, inversion, remove-the-assumption. Five parallel isolated branches, six ideas each.

**Wide set.** Scores are novelty, viability, fit, each 0 to 10.

*Cluster 1: the bridge is already there (nothing to build)*
- Robinhood Chain agents can already pay Sable via Arbitrum One and the canonical bridge, zero new engineering [N8 V8 F9]
- "Bridge" is a chain-ID config entry: point the existing EVM deposit path at 4663 [N7 V7 F9]
- The discount is gateway-side: burn SABL on Solana, present the burn hash, spend on any rail, no wrapped mint anywhere [N9 V8 F9]
- Refuse the frame: publish where Sable accepts dollars, "bridge or not" is a non-question [N6 V6 F6]

*Cluster 2: protect the attestation and the pool (token integrity)*
- An ERC-20 wrapper needs a live mint and burn admin, which breaks "fixed supply, authority revoked" for the aggregate supply while the Solana mint looks untouched [N8 V9 F9]
- A bridged SABL forks the $60K to $67K pool into two thin books; the team becomes the unpaid market-maker [N6 V8 F9]
- The $60K pool is a single position to defend, not a template to clone [N6 V8 F8]
- Size the bridge security budget against the market cap; if the numbers embarrass each other, that is the answer [N7 V8 F8]
- The first bridger captures the Solana-to-4663 basis trade; the bridge is a free arbitrage option handed to bots [N6 V7 F7]
- Wrap only if the burn-discount utility is contractually tied to Robinhood Chain usage; otherwise skip Reading A [N6 V7 F8]

*Cluster 3: who is actually on the other side (audience reality)*
- Check who can legally reach Sable from there: agentic trading is US-only brokerage, the chain's flagship product excludes the US [N7 V8 F8]
- Robinhood's own MCP rail may disintermediate a gateway that shows up early [N6 V6 F7]
- Deposits routed through a sequencer run for a US-regulated broker add an undisclosed censorship counterparty [N7 V7 F7]
- Reading B only clears if compute supply exists (two-sided market) [N6 V4 F6]

*Cluster 4: governance and process hygiene*
- A community "yes" is a forward contract on founder engineering hours, priced at zero [N7 V8 F7]
- Split the poll into two votes with separate cost estimates [N6 V9 F9]
- Publish a one-page "what each reading costs" sheet before the poll closes [N5 V9 F8]
- Acting on a poll is governance-shaped conduct that sits badly with "no governance" [N8 V6 F7]
- Decouple any outcome from a ship date; every new chain gets the same audit cycle [N5 V9 F8]
- Pre-draft a dated "no bridge decision has been made" holding statement [N6 V8 F7]

*Cluster 5: ship-safe defences if it happens anyway*
- Publish now, dated, that no SABL contract exists on chain 4663, so any future one is provably counterfeit [N8 V9 F8]
- Keep the same confirmation-depth policy on 4663; ignore the 100 ms preconfirmation marketing [N6 V9 F8]
- State that reachability from a chain is not partnership or endorsement [N5 V9 F8]
- Identical linked-wallet allowlist on 4663 deposits, no exceptions for the new chain [N4 V9 F7]

**Traps** (attractive, but wrong or dead-ended):
- "10 percent of chain revenue is a toll on Sable": the licence share is Robinhood's obligation to Arbitrum on its own revenue, not a tax on apps.
- "Sable is an unlicensed side door into a geoblocked chain": the geoblock is on Stock Tokens, the chain itself is public.
- "Make Robinhood's Trading MCP agents the customer": those agents sit in US brokerage accounts and trade; they do not buy compute on-chain.
- "Get a written commitment from Robinhood first": a $0.5M token will not get one; making it a gate means never.
- "Nothing proves a deposit was consumed": receipts and the ledger exist today on Sable's own node.
- "x402 turns Sable into a money transmitter": Sable sells its own compute; speculative without a lawyer.

**Converge.** Shortlist:
1. ★ The wrapper reintroduces a mint authority (Cluster 2). Non-obvious, and it is the argument that survives contact with a lawyer and with a Solscan check.
2. ★ Chain-agnostic by construction (Cluster 1). The token's only utility is gateway-side; the useful half of the poll is a config line and the token half is unnecessary.
3. Poll hygiene plus counterfeit defence (Clusters 4 and 5). Cheap, immediate, and the Observatory can do it alone.
4. Audience mismatch (Cluster 3): the people the chain serves are stock-token buyers outside the US; the agents Robinhood talks about are US brokerage clients. Neither is a compute buyer yet.

**Focus.**

*Branch 1: the wrapper reintroduces a mint authority.*
Sketch: SABL's Solana mint has its authorities revoked, so a native mint-and-burn OFT on the Solana leg is not available; the only fitting design is lock-and-mint: real SABL locked in a Solana escrow, wrapped SABL minted on 4663 against it. That escrow, its owner keys and the bridge verifier set become a second mint authority for the aggregate supply. A Solscan check still says "authority revoked" while cross-chain supply has become elastic. The one real market, $60K to $67K on a Solana DEX, would be split with a Uniswap pool on 4663, and the team would be the market-maker on both sides. A bridge securing a $0.5M token is either overbuilt or the largest attack surface in the project, the shape of Secret's June 2026 infinite mint.
Load-bearing risk: disclosure drift. Nothing on Solana changes when the wrapper is compromised, so nothing triggers a correction.
First step: check the Solana mint and Sable's channels for any existing bridge, OFT adapter or LayerZero deployment before writing, so the piece is a pre-mortem, not a report.
Children: a proof-of-collateral page (locked Solana SABL versus minted 4663 SABL) as a reusable Observatory template; a Nillion-versus-Secret bridge explainer; a treasury-math note on seeding a second pool without draining the first; a MiCA disclosure clause for bridged "fixed supply" tokens naming escrow and verifier as parties who can affect supply; a route comparison (LayerZero OFT, deBridge, Relay, Across) scored on how much new trust each reintroduces.

*Branch 2: chain-agnostic by construction.*
Sketch: the deposit flow already treats the chain as configuration: a transaction hash checked against an operator-configured token contract per chain. Accepting deposits on 4663 means whitelisting chain 4663 and a stablecoin contract, not deploying a bridge. The catch is that 4663's native dollar is USDG, not USDT, so the verifier has to be truly token-agnostic (decimals, blacklist functions, fee quirks). The SABL discount never leaves Solana: an agent burns SABL there and presents the burn hash the way a deposit hash is presented. One agent can settle compute in USDG on 4663 and burn SABL on Solana for the discount, two rails stitched by one gateway call. The poll's "bridge SABL everywhere" solves a problem the architecture already avoided.
Load-bearing risk: the verifier may silently assume USDT-shaped behaviour, in which case "add Robinhood Chain" is a code change disguised as a config change.
First step: ask the Sable team, or read the gateway code, whether the deposit verifier is token-address-agnostic per chain, using USDG on 4663 as the test question.
Children: verify the USDG assumption before publishing; name the pattern "detached discount rail" (burn on chain A, spend on chain B, only the gateway knows both); check whether Robinhood's agentic MCP and Sable's gateway are a natural pairing for the same agent; write the corrected explainer as public content with the holder disclosure; ask whether the chain's compliance posture permits an arbitrary third-party treasury contract at all.

*Branch 3: poll hygiene and counterfeit defence.*
Sketch: publish a dated notice on the Observatory that no SABL contract exists on 4663, that the only SABL is the Solana mint, and that reachability from a chain is neither partnership nor endorsement. Extend the hourly watcher with a query against the 4663 Blockscout API for any ERC-20 whose name or symbol resembles SABL, logging deployer, address and time the moment one appears. Rewrite the bundled poll as two costed questions and put both through the same audit cycle regardless of outcome.
Load-bearing risk: an exact-string "SABL" match misses the obvious variants (SABLE, $SABL, homoglyphs, "wrapped SABL"), so a clean scan reassures while the real attack walks past.
First step: publish the notice, then hand-run one Blockscout token search on 4663 for a timestamped zero-result baseline before automating.
Children: a variant net for the match logic; generalise the counterfeit watch to any chain and any tracked project; a governance-hygiene checklist for bundled votes; a standing independence and disclosure banner on every such notice; an incident path for when a fake is found (who is told, in what order).

**Provocation.** What if the right chain question is not "which chain should SABL live on" but "which chain will the first paying agent arrive from"? Sable could publish the deposit rail its first hundred real customers actually used. If that list is empty, no bridge matters; if it is full of Arbitrum-stack addresses, Reading B answers itself and Reading A never comes up.

## 3. Recommendation (opinion)

1. **Reading A, bridge the token: no.** It breaks the one hard promise SABL makes (fixed supply, no authority), splits a $60K pool, and buys a bridge-sized attack surface for a $0.5M token. The utility it would supposedly carry over does not need to move: the discount is applied by the gateway, wherever the dollars come from.
2. **Reading B, add the rail: not yet, and cheap when yes.** It is a configuration and verification job, not a bridge. The blocking question is USDG versus USDT in the deposit verifier. Do it when a real agent asks to pay from 4663, not because a poll said so.
3. **Do today, at zero cost:** a dated notice that no SABL exists on chain 4663, a counterfeit watch on the Observatory, and a request to the team to split the poll into its two costed halves.

## 4. Open questions for the Sable team

1. Is the deposit verifier token-agnostic per chain, or does it assume USDT? USDG on 4663 is the test case.
2. Has anyone on the team deployed, or been approached about, a LayerZero OFT or any wrapper for SABL?
3. What is the count of paying accounts per deposit chain today? That number decides Reading B better than any poll.

## Sources (accessed 2026-09-10)

- Robinhood newsroom, 1 July 2026: https://robinhood.com/us/en/newsroom/robinhood-accelerates-global-expansion-robinhood-chain-mainnet-stock-tokens-agentic-trading/
- Robinhood Chain connection docs: https://docs.robinhood.com/chain/connecting
- Arbitrum DAO factsheet, Robinhood Chain mainnet: https://forum.arbitrum.foundation/t/arbitrumdao-factsheet-robinhood-chain-mainnet-launch/31041
- LayerZero deployments, Robinhood Chain: https://docs.layerzero.network/v2/deployments/chains/robinhood
- Robinhood testnet announcement, 10 Feb 2026: https://robinhood.com/us/en/newsroom/robinhood-chain-launches-public-testnet
- TechCrunch, 27 May 2026, agentic trading: https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/
- Genfinity, 21 July 2026, agentic trading opens to crypto: https://genfinity.io/2026/07/21/robinhood-agentic-trading-crypto-ai-agents/
- KuCoin flash, USDG as native stablecoin (secondary): https://www.kucoin.com/news/flash/robinhood-chain-selects-usdg-as-native-stablecoin-aiming-to-share-yield-with-network-participants
- Uniswap support, bridging to Robinhood Chain (403 on fetch, title only): https://support.uniswap.org/hc/en-us/articles/47092405620237
- Sable whitepaper v2.0 (Aug 2026), snapshot 4 Sep 2026: `../sable-whitepaper-watch/whitepaper.sentences.txt`, lines 119 to 140 and 200
- Sable peers deep dive: `crypto/research/2026-09-09-sable-peers-deep-dive.md`
