# Sable among its peers: who is on the list, how they got their market caps, and what a top pick would take

Date: 2026-09-09. Written for the founder, who holds SABL and runs the Sable Observatory as an outsider. Per-project fact sheets with sources live in `crypto/research/peers/`. Market figures come from CoinGecko's public API on 2026-09-09 (`crypto/tools/cg-history.mjs`, output in `cg-history.json`) unless a sheet names another source. Every figure is dated; none is a forecast.

## 1. Do the two lists have to match?

No. They answer two different questions, and the page should say so instead of forcing one list.

- **The field** (8 rows) compares products column by column against their own documentation: model in a TEE, signed response, per-key cap, sub-keys, x402, sandboxes, USD pricing, token role. A row only earns its place when the docs answer those columns. Tinfoil is there without a token; Automata, Marlin, iExec, Akash, Virtuals and Bittensor are not, because their docs do not answer the columns the same way (Automata is an attestation layer that other products build on; Marlin rents confidential VMs by the hour; iExec sells TEE tasks; Akash added TEE compute on 29 July 2026; Virtuals sells agent identity and commerce; Bittensor's TEE work lives in independent subnets that call themselves early access).
- **The token ladder** (13 bars) shows where SABL's market cap sits among tokens that the market files under the same narratives: TEE and confidential compute (ATA, POND, RLC, PHA, SCRT, ROSE, NIL, OPG), decentralised compute (AKT), AI agents (VIRTUAL), decentralised AI (TAO), and the L1 that runs NEAR AI Cloud (NEAR). A ladder bar needs a traded token, so Tinfoil cannot be on it.

What the page lacked was the explanation per name: which list, why, and what the connection to Sable is. That is the new section "Every name on the list" (05b, inside the Field topic). Candidates for extra table rows once their docs are read column by column: Marlin (Oyster CVM), iExec (TDX tasks, MCP server), Akash (TEE cpu and cpu-gpu since July 2026). Not before: a half-read row would break the table's own rule.

## 2. The market cap arcs, in one table

CoinGecko, 2026-09-09. "From ATH" is the price drawdown; caps at the ATH are not published, so the arc is told in prices and current caps.

| Token | Project | Started | Token since | Price ATH (day) | Cap now | From ATH | Cap a year ago |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SABL | Sable Network | 2026 | Aug 2026 (Solana) | n/a | ~$330K to $390K (DexScreener, 8 to 9 Sep) | n/a | n/a |
| ATA | Automata | 2019 to 2021 | Jun 2021 | $2.36 (2021-06-06) | $634K | -100% | $27.2M |
| POND | Marlin | 2017 to 2018 | Dec 2020 | $0.32 (2020-12-21) | $7.4M | -100% | $68.7M |
| SCRT | Secret | 2015 as Enigma, 2020 relaunch | Feb 2020 | $10.38 (2021-10-28) | $12.2M | -100% | $57.1M |
| PHA | Phala | 2018 | Sep 2020 | $1.39 (2021-05-14) | $21.8M | -98% | $87.5M |
| OPG | OpenGradient | 2024 | 21 to 22 Apr 2026 (Base) | $0.48 (2026-04-22) | $22.5M | -79% | n/a (new) |
| NIL | Nillion | 2021 | 24 Mar 2025 | $0.90 (2025-03-24) | $25.6M | -94% | $58.8M |
| RLC | iExec | 2016 | Apr 2017 (ICO) | $15.51 (2021-05-10) | $26.4M | -98% | $91.7M |
| ROSE | Oasis | 2018 | Nov 2020 | $0.60 (2022-01-14) | $55.3M | -99% | $191.9M |
| AKT | Akash | 2018 (mainnet Sep 2020) | Oct 2020 | $8.07 (2021-04-06) | $173.0M | -93% | $322.5M |
| VIRTUAL | Virtuals | 2021 as PathDAO, AI pivot Jan 2024 | 2024 (Base) | $5.07 (2025-01-01) | $469.3M | -86% | $840.9M |
| TAO | Bittensor | 2021 (chain), subnets Oct 2023 | 2023 listings | $757.6 (2024-03-07 per CoinGecko, 2024-04-11 per CMC) | $2.47B | -66% | $3.31B |
| NEAR | NEAR Protocol | 2018 | Oct 2020 | $20.44 (2022-01-16) | $3.01B | -89% | $3.22B |

Two things stand out. Every token on the ladder is 66 to 100 percent below its high, and eleven of twelve are also below where they were a year ago. The niche as a whole has been shrinking in market terms for a year, so "idle" is the sector's default, not a Sable-specific problem. And the peaks line up with market-wide narratives, not with product launches: 2021 (ATA, POND, PHA, RLC, AKT, SCRT), early 2022 (ROSE, NEAR), the first AI wave of 2024 (TAO), the agent wave at New Year 2025 (VIRTUAL), and a token generation event (NIL, OPG). No peer's cap moved decisively on shipping confidential AI compute; NEAR AI Cloud (Dec 2025), Phala's GPU TEE (Jul 2025), Akash's TEE (Jul 2026) and iExec's Arbitrum tools (Sep 2025) all landed while their tokens kept falling.

## 3. Why high, why idle: the peers one by one

- **NEAR ($3.0B).** High because it is a top-20 L1 with $500M+ raised, Binance and Coinbase listings since 2020 and a decade of brand. Idle relative to its 2022 high because of years of inflation and unlocks and a lost L1 race; the AI pivot produced a rally in May 2026, not a return to the high. NEAR AI Cloud is the closest feature-for-feature analogue to Sable (TDX plus GPU TEE, attestation per inference, a public attestation endpoint) and it shipped with launch partners (Brave, OpenMind, Phala).
- **TAO ($2.5B).** High because it is the largest liquid token branded "decentralised AI", with a Bitcoin-style cap of 21M and a first halving in December 2025. Idle since April 2024 because emissions keep adding supply while the market works out how much subnet activity is demanded work. Its confidential compute (KubeTEE, subnet 90) still calls itself early access.
- **VIRTUAL ($469M).** High because it owned the AI-agent narrative at the turn of 2025 and has 1.1M holder addresses and 290K X followers. Down 86 percent because agent creation and revenue fell sharply through 2025. Relevant to Sable as a customer rather than a competitor: its agents need metered compute and machine payments, which is what x402 and receipts are for.
- **AKT ($173M).** The only peer whose cap stayed above $100M through the sector's down year. It built the marketplace primitives in 2020, pointed them at GPUs in 2023, added managed inference in November 2025 and TEE compute in July 2026. Down 93 percent from a 2021 high set before any of that existed; ongoing inflation (up to 8 percent) dilutes.
- **ROSE ($55M).** Oasis has run Solidity inside SGX since 2020 and shipped ROFL for agents in July 2025, with a $45M pre-sale from a16z in 2018 behind it. The 2022 high was a DeFi story (YuzuSwap, Wormhole), and when that faded nothing replaced it in market terms. Big community numbers (278K X, 63K Discord) did not translate into a re-rating.
- **RLC ($26M).** iExec is the oldest name here (2016, ICO 2017, fixed 87M supply, no unlocks). Its 2025 rally (+59 percent to $1.34 in July) came from AI and DePIN interest plus an Arbitrum launch, then faded. Idle because it is nine years old and newer names carry the story; the retired Bellecour sidechain shows the cost of a bespoke chain.
- **NIL ($26M).** The clearest warning: mainnet and token together in March 2025, Binance from day one, a $0.90 high on the TGE day, then a 94 percent fall helped by an unauthorised market maker dumping in November 2025 and a chain migration to Ethereum in 2026. The product (nilAI, signed completions on NVIDIA confidential computing) is genuinely close to Sable's, and Blacklight (verifying other TEEs, Phala included) is a pattern worth watching.
- **OPG ($22M).** Token-first: mainnet and TGE together in April 2026 with staking and governance on day one, Binance and Coinbase listings, 169K Discord members and 45K holders, and a 79 percent drawdown within five months. It supports x402 and attaches proofs per inference, so it is Sable's most direct token-bearing competitor.
- **PHA ($22M).** Phala has the strongest confidential AI product on the list (GPU TEE on H100 and H200 since July 2025, real-time attestation, a one-click "Chat and Verify"), an ambassador programme paying 45,000 PHA a month and a builders programme. Down 98 percent because the 2021 Polkadot story ended and three repositionings since (privacy chain, coprocessor, confidential AI cloud) each cost narrative time.
- **SCRT ($12M).** The oldest confidential-computing chain, and in 2026 the cautionary tale: the SGX attestation its trust rested on was broken by physical attacks (wiretap.fail, tee.fail, Sep 2025), a bridge exploit went unnoticed for a week in June 2026, SCRT Labs stopped L1 support on 1 September, Binance delisted spot trading by 3 September, and an emergency mint quadrupled the supply on 21 August. The lesson for a receipt-based design: attestation alone is not the claim to rest on.
- **POND ($7.4M).** Marlin's Oyster has rented confidential VMs (SGX, Nitro, TDX since 2024) for years with attestation tooling and about 4K Discord members. No sharp story, no retail attention, quiet developer usage. The floor for "infrastructure without a narrative".
- **ATA ($634K).** Automata is an attestation layer used by 1RPC's verified AI gateway and an EigenLayer AVS; it rode the 2021 Binance Launchpool wave and now trades near its all-time low after Binance delisted it on 27 May 2026. The one horizontal trust layer here that never got a sticky, revenue-bearing application of its own.
- **Tinfoil (no token).** A YC Summer 2025 startup of six people doing exactly Sable's confidential inference pitch without a token: TDX, SEV-SNP and GPU TEE, an OpenAI-compatible API, SDKs that verify attestation automatically, code provenance through Sigstore. About $660K annualised revenue per a third-party estimate. Proof that the category is fundable and shippable without a token at all.

## 4. What Sable would need to become a top pick

Measured against the twelve tokens above, not against hopes. Ordered by how much of the gap each item explains.

1. **A market that can hold a position.** Every ladder token above $20M trades on Binance, Coinbase, Kraken or Upbit with millions in daily volume. SABL trades on one Solana DEX with about $60K to $67K of liquidity (DexScreener, 8 to 9 Sep 2026). Until a listing with real depth exists, nothing else on this list can move the cap by more than the pool allows. Note that Sable's own docs say the token is optional and never required; a listing is a market event, not a product one.
2. **GPU confidential compute.** Five peers (Phala, NEAR AI, Nillion, Secret, Tinfoil) run models on GPU TEEs; Akash added it in July 2026. Sable serves two small CPU-only models on TDX, and that tier has refused every request since 4 September 2026 (7,986 consecutive refusals at 14:52Z on 8 September, per the Observatory's own record). The capability gap and the reliability gap are the same conversation for anyone comparing.
3. **Distribution partners at launch.** NEAR AI Cloud named Brave, OpenMind and Phala on day one. Sable has an OpenRouter application (29 Aug 2026) and no named integration. One credible partner that routes real traffic through the gateway would do more than any feature.
4. **A pitch that stays put for years.** Phala's three repositionings and Marlin's quiet years show the cost of drift; Akash's steady "compute marketplace" line paid off when the AI wave arrived. Sable's line ("compute you can prove": sealed prompts, caps, receipts) is good and should not move; the whitepaper's re-rendering under an unchanged version label is the kind of small drift that an observer notices.
5. **A token role that follows usage.** OpenGradient (-79 percent in five months) and Nillion (-94 percent) launched token utility before durable fee-paying usage existed. Sable's order (prepaid USDT first, SABL optional pay-in, burn on use) is the right one; it also means SABL's cap has no reason to move until the pay-in is live and the burn is visible on-chain. The Observatory's burn watch is the exact instrument for that moment.
6. **Reliability and honesty as the brand.** Secret's 2026 collapse came from attestation breaking plus governance improvisation; Sable's fail-closed design is the right response in principle, and the public status endpoint is a strength. A confidential tier that has been closed for five days with no public note is the opposite of that strength.
7. **Builder programmes with checkable output.** Phala's paid ambassadors, Virtuals' revenue-tied payouts and Akash's paid contribution tasks moved builders; the common thread is paying for verified output. Sable currently hires two Rust engineers and runs a thread contest. A small grants line tied to shipped integrations (an ElevenLabs agent routed through Sable, an MCP server behind the new gateway) would be the cheapest credible signal.

Things that would not help, judging by the peers: a bigger Discord number (Oasis, OpenGradient), a second chain (Nillion, iExec), token governance (OpenGradient), or a rebrand (Phala).

## 5. Winning attention from the neighbours' communities, honestly

The founder's goal is to bring people over from larger projects. The landscape note (`peers/community-landscape.md`) and the sheets say the same thing: what moved people in this niche was checkable artefacts (a dashboard, a comparison, a PR, a shipped integration), and what backfired was manufactured numbers (raids, bought engagement, padded member counts). The Observatory is already the right kind of artefact. Where each community lives and what it responds to:

| Community | Where | Size (dated, sourced in the sheets) | What they care about | The Observatory's hook |
| --- | --- | --- | --- | --- |
| Phala | X, Discord, forum.phala.network | 143K X (Jun 2026), 12K Discord | attestation UX, GPU TEE | the receipt verifier and the fail-closed record: "here is what per-response signatures add to your attestation" |
| NEAR AI | X, Discord, NEAR blog | 1.9M X (protocol account) | confidential inference, launch partners | the field table row, read from their own docs; a fair "what NEAR AI has that Sable lacks" post |
| Nillion | Discord, Telegram, GitHub | 63K Discord, 24K Telegram announcements | signed completions, Blacklight | signed completions versus EIP-191 receipts, a verifier that checks both |
| Oasis | X, Discord | 278K X, 63K Discord | ROFL agents | the page-changed watch on their docs, an honest ROFL versus gateway comparison |
| Akash | GitHub Discussions, Discord, Telegram | not found | TEE compute, contribution tasks | a written test of Akash's new TEE tier against Sable's, with receipts |
| OpenGradient | Discord | 169K Discord, 45K holders | x402, proofs per inference | x402 side by side, one request each, with the proof each returns |
| Virtuals | X, Telegram, Discord | 290K X, 25K Telegram | agents that earn | an ACP agent paying for compute through Sable, with the receipt as evidence |
| Secret | forum.scrt.network, Discord | 34K Discord | what happens after attestation breaks | the "attestation alone versus receipts" argument, with Secret as the case |
| Marlin, iExec, Automata | Discord, GitHub | 4K Discord (Marlin); others not found | developers, quiet | direct API comparisons, no drama |
| Bittensor | Discord, subnet channels | 51K Discord | subnet economics | a KubeTEE versus Sable confidential request, both attested, both timed |

Ranked tactics (from the landscape note, adapted to what exists):

1. Keep the one-line "the author holds SABL" disclosure on every page and post that names the token. MiCA makes it mandatory for an EU holder; it is also the credibility floor.
2. Publish the leaderboard's replay rules and the card codes (done 9 Sep) and say so in the neighbours' channels when relevant: the game is checkable, which is rare.
3. Write one honest comparison per neighbour, both directions, starting with NEAR AI and Phala (the strongest products) rather than the weakest names. Post them as articles, link the field table.
4. Post the Observatory's own findings (the 8k fault, the fail-closed streak, the burn watch, the route watch) as a member in the neighbours' Discords when the topic comes up, never as an announcement.
5. Open-source the Observatory (the repo is already public for Sable work); say so on the page.
6. Fund a small, personal, disclosed prize for the Gatekeeper contest tied to a checkable result; announce the winner with the card code.
7. Build one integration that a neighbour's users would use: an x402 request through Sable from a Virtuals agent, or Lisa routed through Sable, and write it up with receipts.
8. Contribute an issue or PR to Sable's own repos or docs (the whitepaper inconsistencies the watcher found are ready-made issues).
9. Pitch the Observatory as a case study to a crypto-data newsletter once the route watch or the burn watch catches its first event.
10. Never run raids, paid engagement, or follower-count games. In this niche they are cheap to expose and cost more than they buy.

## 6. Open questions and next checks

- Which of Marlin, iExec and Akash earn a field-table row: read their docs column by column (per-key cap, sub-keys, x402, USD pricing) before adding.
- Community counts for Akash, iExec, Marlin (X) and Bittensor (X) were not found through readable sources; ask in their channels or read the counts by hand.
- The SABL figures on the ladder come from DexScreener at load; the peers' caps from CoinGecko. The static table above will drift; the ladder will not.
- The confidential tier's outage is the single most visible weakness in every comparison; the fail-closed article is written and the recovery watch will say when it ends.

Disclosure: the founder holds SABL. Opinions in sections 4 and 5 are opinions.
