# Bittensor: Fact Sheet

Accessed and compiled: 2026-09-09. Prepared as an independent peer comparison for Sable Network (buildsable.com).

## 1. What it is

Bittensor is a decentralized network of competing "subnets" that reward machine-intelligence production (inference, training, data, and more) with its token TAO, governed and stewarded by the Opentensor Foundation. It was founded by Jacob Robert Steeves (BASc, Simon Fraser University; software engineer at Google 2016-2018) and Ala Shaabana (PhD, McMaster University; assistant professor at the University of Toronto 2020-2021). Sourcing on the exact founding year is inconsistent: Steeves' own LinkedIn states work on Bittensor since March 2016, Crunchbase/CB Insights-derived listings say 2019, and other sources tie formal founding to the Opentensor Foundation around 2021; the network's first working chain ("Kusanagi") launched January 2021. The Opentensor Foundation is a Canadian federal corporation registered at 1030 King Street West, Unit 517, Toronto, ON (Canadian federal corporate registry).

Funding: sourcing is thin and fragmented. Tracxn/Crunchbase-derived data cited in search results shows Opentensor Foundation raising a total of $8M across 4 rounds, most recently $8M on 2025-08-07 (exact investors not found in accessible sources). This is separate from investment into companies building on top of Bittensor, e.g., Digital Currency Group's reported $10M strategic investment in Bittensor infrastructure through its "Yuma Asset Management" arm, and Toronto-based "General Tensor" raising $5M pre-seed/seed (anchored by Good Morning Holdings) to build Bittensor infrastructure. Named investors associated with Bittensor/TAO more broadly (per search aggregators, not independently confirmed per-round) include Digital Currency Group, Pantera Capital, Dao5, Polychain-adjacent funds, Lyrik Ventures and Knickerbocker Capital. A direct Messari fundraising page could not be fetched (HTTP 403).

## 2. Product relevant to private/provable AI compute

Confidential compute on Bittensor exists at the subnet level, built by independent teams, not as a single first-party Opentensor Foundation product. Two examples found:

- **Subnet 90, "KubeTEE"**: per its own docs/GitHub, aims to turn "decentralized multi-cluster GPU nodes into a worldwide confidential AI factory," running training, inference and data jobs inside TEEs "scheduled fairly across Bittensor miner clusters." As of the most recent available update, KubeTEE describes itself as in "Phase 0 - Early Access": "The Kata + CoCo TEE runtime classes are live on Intel TDX H200 and B200 nodes; the Bittensor validator (v1) is built, tested... and scoring miners live on Finney; the LiteLLM gateway at llm.kubetee.ai serves confidential inference for GLM-5.2 and DeepSeek-V4-Flash-0731." Own quote on the security model: "A confidential pod is not a namespaced process on the host, it is a virtual machine with an encrypted, attested memory boundary."
- **Subnet 28 ("gm"/SayGM)**: reported (via KuCoin news aggregation of a Bittensor integration) to use "Trusted Execution Environments to protect query privacy and issue verifiable attestations" as part of an integration with OpenRouter, with a claim of processing "up to 120 billion tokens daily" (unverified, third-party-reported figure, not from Opentensor's own docs).
- **Subnet 2, "Targon"** and inference-labs' subnet-level TEE work (GitHub: inference-labs-inc/subnet-2-tee) describe TEE-assisted verification of miner computation as a way to reduce validator overhead versus recomputation, at the cost of added trust in the enclave.

No evidence was found of an Opentensor-Foundation-issued, protocol-wide signed-response or attestation standard analogous to Sable's per-response secp256k1/EIP-191 receipts; each subnet implements (or does not implement) its own verification scheme, and adoption/maturity varies (KubeTEE self-describes as "Early Access").

## 3. Token

Ticker: TAO. Runs on its own Substrate-based chain ("Subtensor"); the live mainnet is called "Finney," forked from an earlier "Nakamoto" chain (itself a fork of the original "Kusanagi" chain halted in May 2021 after early consensus issues). Finney testnet launched 2023-01-10; Finney mainnet went live 2023-03-20; subnets (the incentive-mechanism layer) went live on Finney 2023-10-02. Supply model deliberately mirrors Bitcoin: hard-capped max supply of **21,000,000 TAO**, base emission of 1 TAO per ~12-second block, with halvings triggered by cumulative issuance thresholds (10.5M, 15.75M, ...) rather than block counts; the first halving occurred in **December 2025**, cutting emission from 1 to 0.5 TAO per block (~3,600 TAO/day). Utility: staking into subnets ("root network" and per-subnet "alpha" tokens), paying for subnet registration, and validator/miner incentive distribution. First major centralized-exchange listings came well after the 2021 network launch: MEXC listed TAO in 2023, and KuCoin listed it in December 2023 (exact first-listing date and earliest listing venue not more precisely sourced; "not found" beyond "2023").

## 4. Market cap arc

- All-time high: **$757.60-$767.68** depending on source (CoinGecko cites $757.60; CoinMarketCap cites $767.68), both dated around **2024-04-11** (CoinMarketCap gives the specific date; CoinGecko's page referenced "March 7, 2024" in one search snippet, an inconsistency between sources that could not be fully resolved; CoinMarketCap's April 11, 2024 date is treated here as the better-sourced figure). All-time low: $30.40 on 2023-05-14 (CoinMarketCap).
- Current market cap: **$2.91-2.97 billion**, price approximately $257-287, as of **2026-09-08/09** (CoinGecko, CoinMarketCap). Fully diluted valuation at that price: approximately $5.4 billion (CoinMarketCap), reflecting that only about 9.6-11.3 million of the 21 million max supply is circulating (roughly half).
- Driver of the peak: TAO's April 2024 ATH came during the market's first major "AI x crypto" narrative wave, when Bittensor was one of the highest-profile "decentralized AI" tokens and subnet count/activity was rapidly expanding.
- Why it sits lower now: down roughly 66% from ATH. Contributing factors reported in coverage: the token is only about half-way through its 21M emission schedule, so continuing new supply (even post-halving) puts steady sell pressure on a market still working out how much of that emission represents real, demanded AI work versus subnet-farming; the "AI narrative" trade cooled and rotated toward other tokens/sectors after 2024; and competition for the "decentralized AI compute" narrative increased (from both centralized AI infra players and other crypto-AI projects). Grayscale's own research (title: "Bittensor on the Eve of the First Halving") frames the December 2025 halving as a supply-side catalyst still working through the market as of the most recent pricing snapshot.

## 5. Community

X/Twitter: the official @bittensor account had approximately **10,100 followers** as of a snapshot referenced around April 2025 (search-aggregated; CoinCarp's own count showed a much lower, likely stale or differently-scoped, figure of 1,847 followers when fetched 2026-09-09, an inconsistency that could not be reconciled with available tools — treat the X follower count as approximate and unresolved between roughly 1.8K and 10K). A separate official foundation account, @opentensor, also exists. Discord: the main Bittensor server has approximately **50,729 members**, and the Taostats (community analytics/block-explorer) Discord has approximately 3,328 members. Telegram: the official @bittensor channel has approximately 6,249 members, and a separate community channel (@taobittensor) has approximately 8,920 subscribers (all per search-aggregated data, accessed 2026-09-09; original capture dates not shown). Reddit subscriber count: not found.

Programs: no dedicated ambassador or grants program comparable to typical L1 foundations was found in this research; instead, ecosystem growth runs through subnet creation itself (anyone can launch a subnet and compete for emissions) and through third-party analytics/education sites (Taostats, official block explorer since 2022; learnbittensor.org). Community activity is reported as concentrated in Discord and subnet-specific channels rather than X or Reddit, consistent with the comparatively small official X following relative to a multi-billion-dollar market cap.

## 6. Connection to Sable Network

Overlap: Bittensor's subnet-level confidential-compute efforts (KubeTEE/SN90, SayGM/SN28) target the same problem Sable targets, proving that an AI workload ran on genuine, unmodified hardware without exposing the workload to the infrastructure operator, using the same underlying technology (Intel TDX, remote attestation).

Genuine differences: Sable ships confidential inference as a single, first-party, chain-agnostic gateway product with one payment and receipt model; Bittensor's equivalent capability is scattered across independently built, independently mature subnets with no unified attestation or payment standard, and the flagship confidential-compute subnet (KubeTEE) self-describes as "Early Access" rather than production. Bittensor's token model is also structurally different: a Bitcoin-style hard-capped, halving emission funding an open competition among miners/validators, versus Sable's pay-as-you-go, prepaid-spend model where SABL is an optional pay-in rather than the core emission-reward mechanism.

What Sable could learn: Bittensor shows that permissionless competition (anyone can spin up a subnet) accelerates the breadth of experiments, TEE-based inference, TEE-based training, GPU verification, faster than a single team could ship alone. What did not work: that same permissionlessness means quality and trust guarantees vary wildly subnet-to-subnet, and even after roughly three years of live subnets, the flagship confidential-compute effort is still labeled "early access," a caution against assuming a decentralized bazaar of implementations converges quickly on Sable's kind of unified, provable guarantee.

One-line case for the peer list: Bittensor is the largest, most liquid token explicitly branded around "decentralized AI," and its subnet-level TEE experiments make it a natural, if structurally very different, point of comparison for anyone evaluating Sable's provable-compute pitch.

## 7. Sources

- https://www.bittensor.com/docs/concepts/emissions (accessed 2026-09-09)
- https://learnbittensor.org/concepts/tokenomics (referenced via search snippet, accessed 2026-09-09)
- https://docs.taostats.io/docs/tokenomics (referenced via search snippet, accessed 2026-09-09)
- https://bittensorhalving.com/ (referenced via search snippet, accessed 2026-09-09)
- https://github.com/KubeTEE-AI/kubetee-subnet (accessed 2026-09-09)
- https://github.com/inference-labs-inc/subnet-2-tee (referenced via search snippet, accessed 2026-09-09)
- https://www.kucoin.com/news/flash/bittensor-integrates-confidential-routing-layer-with-openrouter-processes-up-to-120-billion-tokens-daily (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/bittensor (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/bittensor/ (accessed 2026-09-09)
- https://www.coincarp.com/currencies/bittensor/socials/ (accessed 2026-09-09)
- https://research.grayscale.com/reports/bittensor-on-the-eve-of-the-first-halving (referenced via search snippet, accessed 2026-09-09)
- https://opengovca.com/corporation/13026531 (Opentensor Foundation corporate registry, accessed 2026-09-09)
- https://tracxn.com/d/companies/bittensor (referenced via search snippet, accessed 2026-09-09)
- https://pulse2.com/general-tensor-5-million-raised-for-decentralized-ai-infrastructure-on-bittensor/ (accessed 2026-09-09)
- https://messari.io/project/bittensor/fundraising (direct fetch returned HTTP 403; content referenced only via search snippets)
- https://en.wikipedia.org/wiki/Bittensor (direct fetch returned HTTP 404 at time of access)
- Discord invite pages (discord.com/invite/bittensor, discord.com/invite/Ms2uGRWbcm) and Telegram channels (t.me/bittensor, @taobittensor) for community-size figures (accessed 2026-09-09)
