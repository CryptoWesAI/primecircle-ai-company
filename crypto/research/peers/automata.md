# Automata Network (ATA): Fact Sheet

Compiled 2026-09-09 for the Sable Network peer comparison. Figures are volatile; every number below carries its own date and source.

## 1. What it is, founding, funding

Automata Network is a machine attestation layer that verifies the hardware and code a service runs on and posts that proof onchain, built on Trusted Execution Environments (TEEs) such as Intel SGX and TDX.

Sourcing on founding is inconsistent across trackers. CoinCarp lists the launch year as 2021 and headquarters as the United Kingdom. Other write-ups (Benzinga, U.Today, 2021 launch coverage) describe the team as originating around 2019 out of Singapore, with founders named as Deli Gong, Zheng Leong Chua, Leona Hioki and Sujith Somraaj, several with backgrounds at Zilliqa and the National University of Singapore. Treat "2019 origin, Singapore team, 2021 public launch" as the working assumption, not a confirmed fact: no primary-source About page with a founding date was found during this research.

Funding rounds found (amounts are inconsistently reported across aggregators, so both figures are given):
- Seed/strategic round, announced March 9, 2021: $1M, investors Divergence Ventures, Signum Capital, SNZ Holding (per CoinCarp; Yahoo Finance/Investing.com coverage of the same round).
- A raise reported around June 2021 of $2.4M tied to the Binance Launchpool debut (Benzinga, U.Today, crypto.news, June 2021). CryptoRank aggregates total disclosed funding at roughly $3.4M across three rounds, naming Alameda Research, KR1, IOSG Ventures, Genesis Block Ventures and Binance Labs as participants.
- A later strategic round, dated February 11, 2022 by CoinCarp, undisclosed amount, investors YZi Labs (formerly Binance Labs), KR1, IOSG Ventures, Jump Trading.

No priced Series A/B in the traditional VC sense was found; Automata has raised as token-sale-adjacent rounds rather than an equity stack.

## 2. Product relevant to "private or provable AI compute"

Live today, per Automata's own docs (docs.ata.network, accessed 2026-09-09):
- "Automata Network is a machine attestation layer: it makes the hardware and software a service runs on verifiable."
- "Automata DCAP Attestation verifies Intel SGX and TDX quotes directly in smart contracts," turning "trust me" into "verify me."
- The stack "builds on Trusted Execution Environments (TEEs), isolated, hardware-enforced compute environments such as Intel SGX and TDX."
- Multi-Prover AVS (built on EigenLayer): lets rollups, coprocessors and L2s use a TEE Prover as a secondary proving mechanism alongside zk/optimistic proofs, hardening security by distributing trust across proof types.

Applied products sitting on top of the attestation layer:
- **1RPC**: a privacy-preserving Web3 RPC relay, described on Automata's own docs as applying "the same trusted execution and attestation principles used across Automata's TEE stack to request routing, metadata protection, and verifiable service operation." It also exposes a "verified AI gateway" surface, marketed as access to "39+ verified AI models with TEE-protected relays" (docs.ata.network/1rpc, accessed 2026-09-09).
- **XATA**: a trading platform with an "Agent Access" API, self-described as a "self-service API for AI agents and programmatic users to register, configure venues, and trade across multiple DEXes" via wallet-signature registration (docs.ata.network/xata/api/agent-access/overview, accessed 2026-09-09). This is agent tooling for trading, not a compute/inference paywall; the docs reviewed did not describe signed per-response receipts or spend caps.
- Homepage tagline: "The Foundation of Machine Trust," positioned as a "verification layer for the agentic age from silicon to chain," citing support for Intel SGX/TDX, AMD SEV-SNP, AWS Nitro Enclaves and NVIDIA H100 AI accelerators (ata.network, accessed 2026-09-09).

No evidence found of a pay-as-you-go metered inference gateway with per-key spend caps or secp256k1/EIP-191-signed receipts comparable to Sable; Automata's attestation layer is infrastructure that other products (including 1RPC) build on, not itself a compute marketplace.

## 3. Token

- Ticker: ATA. Chains: originally Ethereum-based, also deployed on BNB Smart Chain (ATA/BEP-20, used for PancakeSwap trading).
- First broad trading: Binance listed ATA in its Innovation Zone on June 7, 2021, 06:00 UTC, opening ATA/BTC, ATA/BNB, ATA/BUSD, ATA/USDT pairs, preceded by a Binance Launchpool farming event (June 2 to July 1, 2021) that distributed 40M ATA (4% of total supply) to BNB/BUSD/DOT stakers (Binance announcement, u.today, hive.blog, accessed 2026-09-09).
- Supply: max/total supply 1,000,000,000 ATA (fixed cap, no open-ended inflation found); circulating supply 971,275,049 ATA as of 2026-09-09 (CoinGecko, CoinMarketCap).
- Utility: gas/staking within the Automata ecosystem and governance; specific current utility mechanics were not independently re-verified against the tokenomics doc in this pass.
- Exchanges: WEEX, Gate.io, KuCoin, PancakeSwap v2, Azbit (CoinGecko, accessed 2026-09-09). Binance delisted ATA (along with FARM, MLN, PHB, SYS) effective May 27, 2026, 03:00 UTC, ending a major listing (Binance TH announcement, MEXC News, cryptopotato.com, accessed 2026-09-09).

## 4. Market cap arc

- All-time high: $2.55 on June 7, 2021 per CoinMarketCap (accessed 2026-09-09); CoinGecko records a close but distinct figure of $2.36 on June 6, 2021 (accessed 2026-09-09). Both sit at the moment of the Binance Launchpool listing.
- Current market cap: $634,103 to $634,352 (sources differ by a few hundred dollars) on 2026-09-09, per CoinGecko and CoinMarketCap, at a price of roughly $0.000653. CoinMarketCap rank #2173; CoinGecko rank #3360 (both accessed 2026-09-09).
- All-time low: $0.0004603 on August 1, 2026 (CoinMarketCap, accessed 2026-09-09), i.e. the low was set barely five weeks before the Binance delisting.
- Peak driver: the 2021 ATH coincided with the Binance Launchpool/Innovation Zone listing during the broad 2021 DeFi/privacy-infrastructure token rally; ATA was marketed then as a general "privacy and assurance" protocol for dApps, ahead of its later pivot toward TEE attestation and AI.
- Current level driver: the token trades near its all-time low. The most concrete recent catalyst is the Binance delisting announcement (effective May 27, 2026), which multiple outlets tie to a roughly one-third single-day price drop; Binance's stated review criteria cover trading volume, liquidity, development activity, team commitment and regulatory factors (Binance TH, MEXC News, accessed 2026-09-09). Broader causes plausibly include five years of steady dilution toward the fixed 1B cap, thin volume (~$62-64K/24h, CoinGecko/CoinMarketCap 2026-09-09) and competition from newer TEE/attestation narratives; these are inference, not sourced fact.

## 5. Community

- X (Twitter) followers: 21,600 (CoinMarketCap, accessed 2026-09-09).
- Discord: approximately 16,208 members (search-indexed figure, accessed 2026-09-09, exact snapshot date on Discord's side not confirmable).
- Telegram (@ata_network): approximately 8,101 members, ~294 online at time of snapshot (accessed 2026-09-09).
- Token holders: 22,180 (CoinMarketCap, accessed 2026-09-09).
- Programs: a "Monthly Update" blog series (blog.ata.network) running to at least issue 80; no dedicated public ambassador, grants or hackathon program was found in this pass. Not found: Reddit presence, structured grants program.
- Where the community actually talks: primarily X and the project's own Telegram/Discord, per the channels linked from ata.network/links.

## 6. Connection to Sable Network

Overlap: both projects build on the same hardware trust primitive, TEEs with onchain attestation (Automata: Intel SGX/TDX/AMD SEV-SNP/NVIDIA H100 via DCAP; Sable: an Intel TDX confidential tier). Both frame themselves around making AI/agent infrastructure verifiable rather than merely fast, and both have an "AI gateway" surface: Automata's 1RPC (39+ models, TEE-protected relays) versus Sable's pay-as-you-go gateway between agents and compute with signed receipts.

Genuinely different: Automata is an attestation *layer* that other products plug into (1RPC, XATA, Multi-Prover AVS for rollups), not itself a metered compute marketplace; it does not appear to offer per-key spend caps or per-response secp256k1/EIP-191 signatures the way Sable's receipt model does. Automata's agent tooling (XATA Agent Access) targets DEX trading agents, not general inference metering. Automata is also an EigenLayer AVS with restaking security, a mechanism Sable does not use.

What Sable could learn: Automata shows both the ceiling and the floor of the "attestation infrastructure" narrative, it rode the 2021 privacy-token wave to a real listing and multi-year survival, but five years on trades near its all-time low with a Binance delisting as the most recent headline event. The lesson is that a horizontal trust layer needs a sticky, revenue-bearing application (Automata's own 1RPC/XATA) to avoid the token being priced as a speculative infra bet that decays once the narrative moves on; a single-exchange delisting can erase most remaining liquidity overnight, which argues for diversified listings and demonstrable paid usage over pure narrative.

Why an independent observer would list it as a Sable peer: it is one of the few live projects putting TEE hardware attestation onchain specifically for AI/agent workloads, the same technical ground Sable occupies, even though its business model (attestation-as-a-layer) and its token's market trajectory (nearly delisted, near all-time lows) look very different from Sable's pay-as-you-go gateway model.

## 7. Sources

- https://docs.ata.network/understanding-automata/what-is-automata (accessed 2026-09-09)
- https://docs.ata.network/1rpc (accessed 2026-09-09)
- https://docs.ata.network/xata/api/agent-access/overview (accessed 2026-09-09)
- https://www.ata.network/ (accessed 2026-09-09)
- https://github.com/automata-network/automata (accessed 2026-09-09)
- https://www.stakingrewards.com/asset/automata-multi-prover-avs (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/automata (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/automata-network/ (accessed 2026-09-09)
- https://www.coincarp.com/project/automata-network/ (accessed 2026-09-09)
- https://cryptorank.io/ico/automata-network (search snippet, accessed 2026-09-09; direct fetch returned 403)
- https://www.benzinga.com/news/21/06/21411439/automata-network-raises-2-4-million-and-already-surpasses-5b-in-tvl-on-binance-launchpool (accessed 2026-09-09)
- https://www.binance.com/el/support/announcement/introducing-automata-ata-on-binance-launchpool-farm-ata-by-staking-bnb-busd-dot-tokens-aff3429ff6c74775b4e20fc23377f142 (accessed 2026-09-09)
- https://www.binance.th/en/announcement/new-cryptocurrency-listing%7Cdelisting/d743ce0b7e8046d692829880c57420e3 (accessed 2026-09-09)
- https://www.mexc.com/news/1087255 (accessed 2026-09-09)
- https://finance.yahoo.com/news/automata-network-launches-1m-funding-160013946.html (accessed 2026-09-09)
