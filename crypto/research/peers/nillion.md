# Nillion (NIL) Fact Sheet

## 1. What it is
Nillion is a decentralized "blind computing" network: it processes sensitive data, including AI prompts, without decrypting it, combining multi-party computation, homomorphic encryption, and TEEs. Founded 2021. Co-founders: Alex Page (CEO), Miguel de Vega (Chief Scientist), Andrew Masanto (CSO). Headquarters unresolved: sources give both New York City and Zug, Switzerland.

Funding: seed round of about $20M around December 2022, led by Distributed Global (TechCrunch); a further round in February 2024; a $25M Series A on October 30, 2024, led by Hack VC (CoinDesk). Total raised: over $50M across three rounds.

## 2. Product for private/provable AI compute
Core offering: nilAI, "OpenAI-compatible APIs that run AI models within a trusted execution environment (TEE)", where "all processing happens within a TEE, built on NVIDIA Confidential Computing" (docs.nillion.com). "Every chat completion response includes a cryptographic signature", verified via an "attestation API" (docs.nillion.com), shifting trust "from 'trust us with your data' to 'trust the cryptography'" (docs.nillion.com). nilCC runs Docker workloads in TEEs; nilGPT and LouisAI build on this. Mainnet and NIL launched together March 24, 2025. Blacklight, an independent network verifying TEE workloads (nilCC, Phala) rather than one attestation, launched February 2, 2026.

## 3. Token
Ticker: NIL. Launched at mainnet/TGE March 24, 2025 on NilChain, a Cosmos chain. In February 2026 it migrated to Ethereum as an ERC-20 via 1:1 bridge; NilChain stopped March 23, 2026. Total supply: 1.01B, though CoinGecko flags max supply as unlimited, unresolved. Circulating supply: about 504M (CoinGecko, CoinMarketCap, Sept 2026). Utility: network fees, node staking, Blacklight staking (min. 70,000 NIL). Listed on Binance at TGE, plus KuCoin, Gate.io, MEXC, HTX, Bitget.

## 4. Market cap arc
ATH: $0.8971 on March 24, 2025 (CoinGecko) versus $0.9516 same day (CoinMarketCap); other trackers show $0.68-$2+, unresolved. Peak coincided with TGE, the Binance Launchpool listing, and 2025's AI-privacy narrative. Current market cap: about $25.6M-$25.7M as of September 9, 2026 (CoinGecko, CoinMarketCap), roughly 94-95 percent below ATH. A November 20, 2025 event compounded the fall: an unauthorized market maker dumped NIL holdings, a 48-50 percent crash on ~$200M sell volume (Bitget News, Invezz); Nillion answered with buybacks and legal action. Other drags: cliff-vested unlocks (Early Backers 21 percent, Ecosystem & R&D 29 percent), the chain migration, and a weak altcoin market for pre-revenue privacy tokens.

## 5. Community
Discord: about 62,600-63,200 members (Discordbotlist/Nicegram). Telegram: "Nillion Official Announcements" about 24,300 members; "Nillion Network" group about 750. X/Twitter followers: not found. GitHub: 49 stars, 52 forks, 1,119 commits (CoinCarp). Programs: the Nucleus Builders Program grants startups building on Nillion; a Nillion App Gallery showcases apps. Hackathons/workshops are mentioned generally; prize pools or counts not found. Primary venues: Discord, GitHub Discussions, Telegram.

## 6. Connection to Sable Network
Both sell a verifiable, privacy-respecting AI response instead of blind trust in a compute provider. nilAI's TEE-executed, signed completions parallel Sable's secp256k1/EIP-191 receipts and TDX tier: both turn "trust the operator" into "verify the proof." The difference is scope: Nillion runs a full coordination blockchain (own chain, staking, Blacklight, mandatory token), while Sable is a thin metering layer over existing compute, paid via prepaid USDT or x402, SABL optional.

Lessons for Sable: migrating off its own Cosmos chain to Ethereum shows the cost of a bespoke execution venue before demand is proven, favoring provider-agnosticism. The market-maker incident and 94 percent drawdown warn against front-loading speculation ahead of durable usage, which Sable's prepaid-first design already avoids. Blacklight models scaling attestation trust beyond one TEE. An observer would list Nillion beside Sable: both compete for the same spend, AI compute whose privacy and correctness can be checked, not just promised.

## 7. Sources
- https://docs.nillion.com/blind-computer/learn/overview (accessed 2026-09-09)
- https://docs.nillion.com/blind-computer/build/llms/overview (accessed 2026-09-09)
- https://docs.nillion.com/community/community-and-support (accessed 2026-09-09)
- https://nillion.com/news/nillion-blacklight-is-now-live/ (accessed 2026-09-09)
- https://nillion.com/news/nillions-tech-roadmap-2025-advancing-the-blind-computer/ (accessed 2026-09-09)
- https://nillion.com/news/nil-token-migration-guide/ (accessed 2026-09-09)
- https://nillion.com/news/the-next-frontier-for-nillion-ethereum/ (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/nillion (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/nillion/ (accessed 2026-09-09)
- https://www.coincarp.com/currencies/nillion/socials/ (accessed 2026-09-09)
- https://www.coincarp.com/project/nillion/ (accessed 2026-09-09)
- https://www.crunchbase.com/organization/nillion (accessed 2026-09-09)
- https://tracxn.com/d/companies/nillion/__30ja_QLsHcKZ7K8yzvZTqui6gHc-FgjJdm7fo2Wavyk (accessed 2026-09-09)
- https://techcrunch.com/2022/12/12/nillion-raises-over-20-million-to-build-new-web3-infrastructure/ (accessed 2026-09-09)
- https://www.coindesk.com/tech/2024/10/30/privacy-blockchain-project-nillion-raises-25m-to-expand-blind-computing (accessed 2026-09-09)
- https://cointelegraph.com/news/nillion-network-funding-decentralized-privacy-solutions (accessed 2026-09-09)
- https://www.bitget.com/news/detail/12560605074401 (accessed 2026-09-09)
- https://invezz.com/news/2025/11/20/nillion-nil-crashes-50-after-unauthorized-market-maker-dump/ (accessed 2026-09-09)
- https://www.cryptopolitan.com/rogue-market-maker-nillion-all-time-low/ (accessed 2026-09-09)
- https://tokenomist.ai/nillion (accessed 2026-09-09)
- https://etherscan.io/token/0x7cf9a80db3b29ee8efe3710aadb7b95270572d47 (accessed 2026-09-09)
- https://cryptorank.io/price/nillion (accessed 2026-09-09)
