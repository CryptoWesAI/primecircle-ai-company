# NEAR AI / NEAR AI Cloud: Fact Sheet

Accessed and compiled: 2026-09-09. Prepared as an independent peer comparison for Sable Network (buildsable.com).

## 1. What it is

NEAR AI Cloud is a confidential AI inference gateway, built by NEAR AI, that runs open models inside hardware TEEs and cryptographically attests every response. NEAR Protocol (the underlying L1 chain, ticker NEAR) was founded in 2018 by Illia Polosukhin (ex-Google Research, co-author of "Attention Is All You Need") and Alexander Skidanov (ex-MemSQL); the project began in 2017 as "Near.ai," a program-synthesis startup, and pivoted to a blockchain after the founders hit payment friction paying international researchers. The NEAR Foundation, which stewards the ecosystem, was established in 2019 and is registered in Zug, Switzerland. NEAR AI was relaunched as a distinct research and product effort in 2024, led directly by Polosukhin, focused on confidential/user-owned AI infrastructure; no separately disclosed HQ city for the NEAR AI entity was found (not found).

Funding (NEAR Protocol/Foundation level; no separate NEAR AI round found):
- May 2020: $21.6M, led by a16z, joined by Libertus Capital, Blockchange Ventures, Animal Ventures and others (source: BusinessWire/TechCrunch).
- January 2022: $150M round; sources differ on lead: Cointelegraph names Three Arrows Capital as lead with Mechanism Capital, Dragonfly Capital, a16z, Jump, Alameda Research, Zee Prime, Folius, Amber Group, 6th Man Ventures and Circle Ventures participating.
- Cumulative: approximately $542M raised across 8 rounds per Tracxn's 2026 profile; other sources cite "$500M+" including token sales and ecosystem-fund contributions. Exact per-round breakdown beyond the two above is not found.

## 2. Product relevant to private/provable AI compute

NEAR AI Cloud and "Private Chat" were introduced on **December 3, 2025** (near.ai/blog/introducing-near-ai-cloud-private-chat). Live launch partners named in that post: Brave (Nightly browser), OpenMind (robotics OS) and Phala (confidential cloud), with a combined claimed reach of "over 100 million consumer and enterprise users" (company claim, not independently verified).

The underlying confidential-computing stack, "Private-ML SDK," was announced earlier, on January 19, 2025 (near.ai/blog/building-next-gen-near-ai-infrastructure-with-tees), and was "now live" as an SDK at that time, ahead of its integration into NEAR AI Cloud. Own-docs quotes:
- On TEEs generally: "a secure area in a hardware processor that guarantees the code and data running through it are not accessible to the operator of the machine."
- On the hardware: "TDX (Intel Trust Domain Extensions) is Intel's virtualization-based security technology used to create isolated, encrypted virtual machines," combined with "GPU TEE," "NVIDIA's confidential computing technology for graphics processing units."
- On attestation: "Thanks to Remote Attestation, users also get proof that their application is running on genuine, secure hardware with the correct, unmodified code."
- From the Cloud launch post: "Processing occurs inside a Trusted Execution Environment (TEE) that prevents external access, including from NEAR," and "Each inference generates a cryptographic attestation proving the model ran in genuine, verified hardware."

A public verification endpoint is documented (`/v1/attestation/report?model={model_name}`) returning attestation reports validated against Intel's and NVIDIA's own attestation services. NEAR AI also documents "End-to-End Encrypted Chat Completions" (docs.near.ai/cloud/guides/e2ee-chat-completions/), implying per-request encryption tied to the TEE session. No NEAR AI documentation was found describing per-response secp256k1/EIP-191 signatures in the specific form Sable uses; NEAR's own x402-style payment references (per x402.org network docs) describe NEAR-chain settlement via a delegated NEP-141 transfer, not an AI-inference product feature. Latency/throughput figures ("5-10% latency overhead," "100 requests/second per tenant") appear only in a third-party review site (bestclawhosting.com), not in NEAR's own docs, and should be treated as unverified.

## 3. Token

Ticker: NEAR. Native gas/staking token of NEAR Protocol, its own sharded ("Nightshade") Layer-1; a wrapped ERC-20 version (wNEAR) also circulates. Mainnet went live in phases starting April 2020, reaching community-run "MainNet Genesis" around October 2020; Binance opened NEAR/BTC, NEAR/BNB, NEAR/BUSD and NEAR/USDT trading on **2020-10-14 05:00 UTC** (Binance listing announcement), which is the best-sourced "first major listing" date found. Supply model: 1 billion NEAR at genesis, no fixed max supply (CoinGecko lists max supply as infinite); a "Halving Upgrade" completed in Q4 2025 cut maximum protocol inflation from 5% to 2.5% per year, with a majority of transaction fees burned. Utility: gas payment, validator staking/security, and (via NEAR AI Cloud) reportedly a settlement asset for AI usage, though no NEAR-AI-specific token utility beyond general gas/staking was documented (not found). Main listings today include Binance, Coinbase, Kraken and OKX.

## 4. Market cap arc

- All-time high: **$20.44** (CoinGecko) / $20.42 (CoinMarketCap) on **2022-01-16**. A distinct "ATH market cap" figure was not directly published by either source at time of access; with circulating supply near that date, it implies a market cap in the high-teens-of-billions of dollars, but this is an inference, not a sourced figure (not found as a direct number).
- Current market cap: **$2.998-3.005 billion**, price $2.30, as of **2026-09-08/09** (CoinGecko, CoinMarketCap).
- Driver of the January 2022 peak: the broader Layer-1 alt-coin bull run that topped alongside Bitcoin's November 2021 all-time high, amplified by NEAR's $150M raise that same month and its "sharding" scalability narrative versus Ethereum.
- Why it sits lower now: NEAR is down roughly 89% from its ATH. Contributing factors per available reporting: years of continued token unlocks/inflation diluting holders before the 2025 halving upgrade; intense Layer-1 competition (Solana, Sui, Aptos and others) that captured developer and liquidity share NEAR held in 2021-22; and a multi-year narrative gap until NEAR's 2024-2026 pivot to "user-owned AI," which did produce a documented rally (NEAR "doubling" and a reported 50%+ weekly surge in May 2026 on AI-token rotation, per KuCoin and Cointelegraph) but has not returned the token near its 2022 high.

## 5. Community

Hard numbers found: NEAR Protocol's X/Twitter account shows **1,947,324 followers** and **2,614 GitHub stars** (CoinCarp, accessed 2026-09-09; capture date on that page not shown, treat as approximate). Reddit subscriber count and Telegram/Discord member counts were not found in sourced form (CoinCarp shows Reddit as unavailable; official Telegram/Discord channels exist at t.me/cryptonear and via near.org but membership counts were not surfaced).

Programs: NEAR Foundation runs a "Founder Success Team" and "Ecosystem Solution Architects" to mentor AI x Web3 builders; recurring hackathons include an "Autonomous Agent" hackathon (co-sponsored with EigenLayer, Gensyn, Hyper Oracle) and a NEARCON "Innovation Sandbox" competition with a reported $150,000 prize pool for the AI track. Community discussion appears concentrated on X, Discord, and NEAR's own Medium/blog channels rather than Reddit.

## 6. Connection to Sable Network

Overlap: both NEAR AI Cloud and Sable sell verifiable AI inference, with TEE-backed confidentiality and cryptographic proof that a specific model produced a specific response, aimed at agent-to-agent and developer traffic rather than end consumers.

Genuine differences: NEAR AI Cloud is a first-party product of a long-established, well-funded L1 ecosystem (NEAR, founded 2018, $500M+ raised) and leans on its own chain's identity and NEP-141/NEAR-Intents payment rails rather than a chain-agnostic gateway; Sable is chain-agnostic, uses secp256k1/EIP-191 signed receipts, prepaid USDT or x402 as the default rail, and per-key spend caps as an explicit control, none of which NEAR's own docs describe in equivalent form. NEAR's TEE stack (Intel TDX + NVIDIA GPU TEE, Private-ML SDK) closely parallels Sable's Intel TDX confidential tier, making it the closest architectural peer found in this research.

What Sable could learn: NEAR AI Cloud shipped with named, credible launch partners (Brave, OpenMind, Phala) rather than launching bare, which gave it an immediate distribution and credibility story; and it staged the rollout (SDK live January 2025, product live December 2025) rather than shipping the full stack at once. What did not work for the parent ecosystem: years of token inflation and unlock overhang kept NEAR's price suppressed long after its 2022 peak, a caution for any project (Sable included) that pairs a utility product with a freely-inflating or lightly-vested token.

One-line case for the peer list: NEAR AI Cloud is the most direct feature-for-feature analogue to Sable's TEE-attested inference product, built by a decade-old, deep-pocketed L1 ecosystem, which makes it the benchmark for what a well-funded incumbent's version of Sable's pitch looks like.

## 7. Sources

- https://near.ai/blog/introducing-near-ai-cloud-private-chat (accessed 2026-09-09)
- https://near.ai/blog/building-next-gen-near-ai-infrastructure-with-tees (accessed 2026-09-09)
- https://docs.near.ai/cloud/verification/ (search-indexed content, accessed 2026-09-09; direct fetch returned HTTP 403)
- https://docs.near.ai/cloud/guides/e2ee-chat-completions/ (accessed 2026-09-09)
- https://docs.near.ai/cloud/introduction/ (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/near (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/near-protocol/ (accessed 2026-09-09)
- https://www.coincarp.com/currencies/nearprotocol/socials/ (accessed 2026-09-09)
- https://www.businesswire.com/news/home/20200504005546/en/NEAR-Protocol-Project-Raises-%2421.6M-Round-led-by-Andreessen-Horowitz-and-Launches-MainNet-to-Bring-Open-Web-Business-Models-to-Founders-Everywhere (accessed 2026-09-09)
- https://cointelegraph.com/news/near-protocol-raises-150m-to-promote-web3-adoption (accessed 2026-09-09)
- https://tracxn.com/d/companies/near (referenced via search snippet, accessed 2026-09-09)
- https://www.near.org/roadmap-history (accessed 2026-09-09)
- https://www.binance.com/en/support/announcement/binance-lists-near-protocol-near-deposits-are-now-open-1110b21de22e4633bc34710cc4ed2ce3 (referenced via search snippet, accessed 2026-09-09)
- https://www.kucoin.com/news/flash/near-price-doubles-amid-ai-narrative-privacy-features-and-intents-fee-buybacks (accessed 2026-09-09)
- https://cointelegraph.com/markets/near-protocol-leads-ai-token-rally-with-a-50-pump-is-5-near-price-next (accessed 2026-09-09)
- https://www.bestclawhosting.com/provider/near-ai-cloud (third-party review, accessed 2026-09-09; latency/throughput figures unverified)
