# Akash Network (AKT): Fact Sheet

Compiled 2026-09-09 for the Sable Network peer comparison. Figures are volatile; every number below carries its own date and source.

## 1. What it is, founding, funding

Akash Network is a decentralized, open-source cloud compute marketplace (built as a Cosmos SDK chain) that lets anyone lease spare CPU, storage and GPU capacity from independent providers, positioned since 2023 primarily as a low-cost marketplace for AI/GPU compute.

Founded by Greg Osuri (CEO) and Adam Bozanich (CTO); most trackers date the company to 2018 as the entity behind Akash (the search results returned a spread of 2015 and 2019 depending on the aggregator; treat the precise founding year as unconfirmed and 2018 as the most commonly cited figure elsewhere, not independently verified in this pass). Headquartered in San Francisco, United States (Tracxn/PitchBook, accessed 2026-09-09).

Funding: reporting is thin and inconsistent. Aggregators (StartupHub, Crunchbase-derived) put total disclosed funding at roughly $2-2.25M across a single seed-stage round, naming investors including Blockin.Ventures, Borderless Capital, Bridgetower, CoinUnited Capital and D1 Ventures among a list of about 12-17 named investors; exact dates and per-round amounts were not found in a primary source. The clearer, better-dated capital event is the public token sale: an IEO on BitMax (now AscendEX) with the token generation event on October 21, 2020, priced around $0.35-$0.39, raising approximately $800,000 (ICO Drops, akash.network blog "Announcing Akash Mainnet Live and BitMax IEO," accessed 2026-09-09). Mainnet itself launched in September 2020, ahead of the IEO.

## 2. Product relevant to "private or provable AI compute"

Live today, dated:
- **AkashML**, launched November 22, 2025: Akash's own description is a "fully managed AI inference service on decentralized GPUs," shipping with Llama 3.3-70B, DeepSeek V3 and Qwen3-30B-A3B available for immediate deployment, an OpenAI-compatible API, and claimed cost cuts of up to 85% versus traditional cloud providers, served across 65+ datacenters (Metaverse Post, ourcryptotalk.com, accessed 2026-09-09).
- **Confidential compute / hardware-attested TEE**, went live July 29, 2026: tenants can request a hardware-enforced Trusted Execution Environment by adding `params.tee` (`cpu` or `cpu-gpu`) to their SDL deployment spec; the provider's actual TEE platform is AMD SEV-SNP or Intel TDX depending on hardware, workloads run inside Kata Containers (micro-VMs), and the spec explicitly covers NVIDIA GPU passthrough to Kata VMs plus "attestation sidecars" for combined CPU+GPU attestation (search-aggregated launch coverage, accessed 2026-09-09). This directly parallels Sable's Intel TDX confidential tier.
- The underlying roadmap item, **AEP-29 "Hardware Verification using Trusted Execution"** (akash.network/roadmap/aep-29, accessed 2026-09-09), states in Akash's own words: "Hardware Verification is the process of verifying that the specific CPU or GPU is what the provider claims to be," done via a "trusted Authority" process "ratified in the IETF's Remote Attestation Procedures Architecture (RATS) RFC 9334," gathering "cryptographic measurements from the hardware platform, including CPU, GPU, firmware, bootloader, and drivers," explicitly framed as "a fundamental building block for enabling Confidential Computing capabilities." The AEP page lists an estimated completion of 5/30/2026 and status "Final" (last updated 10/9/2025); the July 29, 2026 live date from separate coverage suggests actual shipping trailed the estimate slightly, or the two dates refer to different rollout phases; this discrepancy was not fully reconciled in this research pass.
- **Starcluster**, introduced in Q3 2025: a "protocol-owned compute system combining centrally managed datacenters with Akash's decentralized GPU marketplace" aimed at large-scale training and inference (Messari "State of Akash Q3 2025," accessed 2026-09-09).

No evidence found of secp256k1/EIP-191-signed per-response receipts or a sealed-prompt mechanism comparable to Sable; Akash's trust model for confidential compute is TEE attestation of the execution environment itself, not signed proof-of-response for individual API calls. Payment is via the AKT-denominated marketplace and standard Cosmos-chain rails, not a stablecoin/x402 pay-as-you-go gateway.

## 3. Token

- Ticker: AKT. Chain: native Cosmos SDK chain (Akash's own L1), with presence also referenced on Osmosis and Archway within the Cosmos ecosystem (CoinGecko categorization, accessed 2026-09-09).
- Token generation event: October 21, 2020, via IEO on BitMax/AscendEX (see Section 1).
- Supply: circulating supply approximately 297.6M AKT; total/max supply approximately 388.5M AKT (CoinGecko, CoinMarketCap, accessed 2026-09-09). Inflation model: a subsidy pool captures a portion of block rewards distributed to encourage adoption; inflation has reached its governance-set upper bound of 8% and cannot rise further without a governance change; the rate decays over time per a decay function (akash.network blog "An Evolution of Akash Network Token Economics," GitHub akt20-prop, accessed 2026-09-09). Allocation at genesis, per aggregator data: Mining ~70.94%, Investors ~10.03%, Team & Advisors ~7.85%, Foundation ~5.72%, Ecosystem ~2.32%, Testnets ~1.45%, Vendors & Marketing ~1.16%, Public Sale ~0.52% (source aggregator, accessed 2026-09-09; not cross-checked against a primary genesis doc).
- Utility: staking/securing the Cosmos chain, governance voting, and the unit of account for leasing compute on the marketplace.
- Exchanges: listed on roughly 20 exchanges with 33 trading pairs per CoinGecko (accessed 2026-09-09); named venues include Coinbase Exchange, Gate, Kraken, Upbit and Bitvavo. First major listing was the BitMax/AscendEX IEO (October 2020); Binance added an AKT/USDT perpetual futures contract (announced via Akash's own X account, exact date not confirmed in this pass, distinct from a spot listing).

## 4. Market cap arc

- All-time high: $8.07-$8.08 on April 6, 2021 (CoinGecko and CoinMarketCap both cite this window; one source lists April 7, 2021, accessed 2026-09-09), implying an ATH market cap on the order of $2-2.4 billion at the then-circulating supply (calculated from ATH price times circulating supply near that date; not a directly stated CoinGecko figure, flagged as inference).
- All-time low: $0.1650-$0.1672 on November 21, 2022 (CoinGecko/CoinMarketCap, accessed 2026-09-09).
- Current market cap: approximately $173.1-173.3 million on 2026-09-09 at a price of about $0.58, fully diluted valuation approximately $226.2 million (CoinGecko, CoinMarketCap, accessed 2026-09-09).
- Peak driver: the April 2021 ATH rode the broad Cosmos-ecosystem and DeFi/infrastructure token rally of that cycle, well before Akash's pivot to GPU/AI compute; Akash was not yet marketed as an AI play at that point.
- A second, smaller narrative-driven run is documented anecdotally (not independently price-verified here) around the 2023 "DePIN plus AI" narrative, when Akash's GPU marketplace (launched 2023) and its association with decentralized AI compute drew renewed attention; this is inference based on the sequence of product launches (GPU marketplace 2023, AkashML November 2025, confidential compute July 2026) rather than a sourced price chart citation.
- Current level driver: AKT trades roughly 93% below its 2021 ATH. Plausible factors, stated as inference rather than sourced fact: the ATH was set during a market-wide peak unrelated to Akash's present AI/GPU thesis, so it is arguably not the relevant comparison point; ongoing token inflation (up to 8%, per the tokenomics documented above) dilutes holders; and the AI-compute narrative that could re-rate the token (AkashML, confidential compute) only shipped in November 2025 and July 2026 respectively, both very recent relative to this September 2026 snapshot, so any re-rating effect would not yet be fully visible in the numbers gathered here.

## 5. Community

- Official channels confirmed live: Twitter/X (@akashnet_ and related handles including @akashnetAI for AkashML), Telegram (t.me/AkashNW), Discord, Reddit, YouTube, Facebook, and an active GitHub org (github.com/akash-network) (CoinGecko community links, accessed 2026-09-09). Exact follower/member counts were not retrievable in this pass; CoinGecko's community tab did not surface numeric counts in the fetch, and X's own follower count is not readable without visiting the profile directly. Not found: numeric Discord, Telegram, Reddit, or X follower counts as of 2026-09-09.
- Programs: a Student Ambassador Program bringing decentralized cloud computing to campuses across the US (akash.network blog, accessed 2026-09-09); an "insider program" that grew from 10 to about 50 global members; a "Vanguards" program for 24/7 Discord support (under community discussion, not confirmed as fully launched); a tiered (Beginner/Intermediate/Advanced) Community Contribution Program with paid GitHub-issue-based tasks; and a grants program for contributors with an established track record (akash.network/blog/akash-community-contribution-program, GitHub akash-network/community discussions, accessed 2026-09-09).
- Where the community actually talks: GitHub Discussions (used actively for AEPs and governance proposals, e.g. discussions #872, #614, #394, #811) function as a substantive technical/community forum alongside Discord and Telegram.

## 6. Connection to Sable Network

Overlap: Akash's July 29, 2026 confidential compute launch (Intel TDX or AMD SEV-SNP, with attestation sidecars covering CPU+GPU) is the closest direct technical parallel to Sable's Intel TDX confidential tier found among peers researched so far; both are metered compute marketplaces serving AI workloads with a pay-per-use model (Akash: AKT/marketplace-denominated leases and AkashML's "predictable pay-per-token pricing" per earlier coverage; Sable: prepaid USDT or x402, optional SABL). Both also sit adjacent to "agent tooling," Akash via general inference APIs an agent could call, Sable via a purpose-built agent-to-compute gateway.

Genuinely different: Akash is a full decentralized compute marketplace with its own L1, staking, provider network and multi-year operating history (mainnet since September 2020); Sable is a narrower gateway product layered on top of compute rather than a marketplace/chain itself. Akash's trust model for AI workloads is newly-live hardware attestation of the execution environment (TEE), not signed cryptographic receipts per response; no secp256k1/EIP-191-style receipt-per-call mechanism was found in Akash's own materials. Akash's payment and settlement layer is its native AKT-denominated Cosmos chain plus governance-set inflation, a materially different economic design from Sable's prepaid-USDT/x402-with-optional-pay-in-token model.

What Sable could learn from Akash's path: Akash shipped the unglamorous marketplace primitives (mainnet, staking, provider onboarding) years before the AI narrative existed, then successfully re-pointed the same infrastructure at GPU/AI demand starting with its 2023 GPU marketplace and culminating in AkashML (Nov 2025) and confidential compute (Jul 2026); this staged approach, infrastructure first, narrative-fit second, let it capture the 2023+ AI/DePIN wave without a ground-up rebuild. The token's 93%-below-ATH state also shows that shipping the right product late (confidential compute has been live only weeks as of this snapshot) does not guarantee a market cap re-rating; genuine developer adoption of AkashML/confidential compute, not the launch announcement itself, is the metric to watch.

Why an independent observer would put Akash on a Sable peer list: it is a large, multi-year-operating decentralized compute marketplace that, as of mid-2026, added the same TEE-attestation-for-AI capability Sable is built around, making it the most directly comparable production-scale marketplace among decentralized AI-compute projects, even though its economic model (native L1 token, marketplace leases) differs sharply from Sable's gateway/receipt model.

## 7. Sources

- https://akash.network/roadmap/aep-29/ (accessed 2026-09-09)
- https://akash.network/blog/announcing-akash-mainnet-live-and-bitmax-ieo/ (accessed 2026-09-09)
- https://akash.network/blog/an-evolution-of-akash-network-token-economics/ (accessed 2026-09-09)
- https://akash.network/blog/akash-community-contribution-program/ (accessed 2026-09-09)
- https://github.com/akash-network/community/blob/main/sig-economics/akt20-prop/README.md (accessed 2026-09-09)
- https://github.com/orgs/akash-network/discussions/872 (accessed 2026-09-09)
- https://github.com/orgs/akash-network/discussions/614 (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/akash-network (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/akash-network/ (accessed 2026-09-09)
- https://messari.io/report/state-of-akash-q3-2025 (search snippet, accessed 2026-09-09)
- https://messari.io/report/state-of-akash-q4-2025 (search snippet, accessed 2026-09-09)
- https://mpost.io/akash-network-rolls-out-akashml-first-fully-managed-ai-inference-service-on-decentralized-gpus/ (accessed 2026-09-09)
- https://ourcryptotalk.com/news/akash-network-launches-akashml-for-decentralized-ai-inference (accessed 2026-09-09)
- https://x.com/akashnet/status/1978856964429103250 (search snippet, accessed 2026-09-09)
- https://tracxn.com/d/companies/akash-network (accessed 2026-09-09)
- https://icodrops.com/akash-network/ (accessed 2026-09-09)
