# OpenGradient (opengradient.ai): Fact Sheet

Compiled 2026-09-09.

## 1. What it is

OpenGradient is a decentralized "AI coprocessor" network that lets applications, blockchains and autonomous agents outsource AI inference to a network of GPU and Trusted Execution Environment (TEE) nodes, with cryptographic or zero-knowledge proof attached to each result. CEO is Matthew Wang; the company describes itself as "the leading research lab building a network for open intelligence" (github.com/OpenGradient org description). Backed early by a16z's Crypto Startup Accelerator (a16z CSX), implying Bay Area / US origin; exact HQ city not stated on the public site (**not found**). Founding year not explicitly dated on the public site; the seed round (below) was announced October 2024, implying founding in 2024 or earlier.

Funding rounds found:
- **October 9, 2024**: $8.5M seed, led by a16z CSX, with SV Angel, Coinbase Ventures, SALT Fund, Symbolic Capital, Foresight Ventures, and angels Balaji Srinivasan, Illia Polosukhin (NEAR co-founder) and Sandeep Nailwal (Polygon co-founder) (prnewswire.com/opengradient.ai blog, Oct 2024).
- **April 14, 2026**: Announced $9.5M in *total* funding to date (i.e. roughly $1M of additional capital layered onto the original seed, not a new large round), lead a16z crypto, with Coinbase Ventures, SV Angel, Foresight Ventures, Pragma, SALT, Symbolic Capital, Canonical Crypto, Black Dragon, NEAR, Celestia, and Thanefield Capital participating, plus angels Balaji Srinivasan, Illia Polosukhin, Sandeep Nailwal, Bruno Faviero, Daniel Cheung, Ryan Watkins and Ekram Ahmed (PR Newswire, 2026-04-14).

## 2. The product that matters

OpenGradient runs a "Verifiable Inference Network": a compute layer that "executes AI workloads and attaches cryptographic proofs to every inference, enabling downstream applications to verify exactly what model ran, on what input, and what it returned" (opengradient.ai). It combines two verification methods rather than one: "500K+ zkML Proofs + TEE Attestations" (opengradient.ai homepage). Docs describe an inference node that, in its TEE path, "publishes the node's TLS certificate and signing key, both generated inside the enclave," and a lower-assurance "Vanilla" method that offers "only signature verification and no proof of correct execution, suitable for low-risk workloads, prototyping" (docs.opengradient.ai/learn/onchain_inference/verification). One product page states "every LLM call within an autonomous AI agent is cryptographically signed with the exact prompt used" (docs.opengradient.ai), directionally close to Sable's signed-receipt model, though no source confirms the specific signature curve (secp256k1 or otherwise).

Mainnet launched **April 2026** (multiple sources tie this to the April 21-22, 2026 TGE window); before that the network ran on testnet. Live components as of 2026-09-09: a Model Hub hosting 4,500+ models on-chain, an on-chain AI SDK, "OpenGradient Chat," and agent-facing apps including BitQuant (quant/trading agent framework) and "Digital Twins." Its `tee-gateway` repo ("TEE-secured inference node for 3rd-party LLM inference requests") and `veil` repo ("local OpenAI-compatible proxy keeping agentic prompts private and verifiable") show live agent-tooling work, and an `x402` fork shows x402-payment support for inference calls, an explicit protocol overlap with Sable.

## 3. Token

Ticker **OPG**, on **Base** (ERC-20; contract 0xfbc2051ae2265686a469421b2c5a2d5462fbf5eb per BaseScan). Fixed, non-inflationary total supply of 1,000,000,000 OPG. Token Generation Event: **April 21-22, 2026** on Base (via Binance Wallet TGE, per search results and CoinGecko/CMC ATH date of April 22, 2026 the day after).

Allocation (opengradient.foundation/blog/tokenomics): Ecosystem 40% (400M, 10% at TGE, 60-month vest), Foundation 15% (150M, 33.33% at TGE, 48-month vest), Core Contributors 15% (154.5M, 0% at TGE, 12-month cliff, 36-month vest), Investors + Advisors 10% (95.5M, 0% at TGE, 12-month cliff, 36-month vest), Staking Rewards 10% (100M, 96-month vest), Liquidity & Launch 6% (60M, unlocked at TGE), Airdrop 4% (40M, unlocked at TGE).

Utility, per the project's own summary ("$OPG is how you pay for that trust, earn from it, and govern what comes next", opengradient.foundation): inference payments for verified AI calls, model-creator monetization, staking by validators to secure proofs, unlocking premium features in integrated apps, and governance over TEE hardware choices, gas pricing and protocol upgrades.

Exchange listings: 26 trading pairs across CEXs and DEXs as of 2026-09-09 (CoinGecko), including Binance, Coinbase Exchange, Bybit, MEXC, LBank and PancakeSwap. Binance listed OPG roughly around the TGE window (search-derived: "~109 days ago" from a 2026-09 baseline, i.e. approximately late May 2026, treat as approximate); South Korea's Upbit added a KRW pair later, which one source ties to a ~45% single-day price surge to $0.1795 on July 7, 2026 (search-derived, unverified against Upbit's own announcement).

## 4. Market cap / valuation arc

- **All-time high**: $0.4816-$0.4823 on **April 22, 2026** (CoinGecko and CoinMarketCap, both accessed 2026-09-09; minor cent-level discrepancy between the two trackers), i.e. the day after/around TGE.
- **All-time low**: $0.08201 on **August 28, 2026** (CoinGecko, accessed 2026-09-09).
- **Current market cap**: approximately **$22.5-22.9 million** as of **2026-09-09**, price around $0.10, circulating supply 221.9M of 1B max supply (~22% circulating), rank #624-778 depending on tracker (CoinGecko and CoinMarketCap, both accessed 2026-09-09).
- 24h volume around $7.2-7.7M (both trackers, 2026-09-09).
- The ATH coincides with TGE-driven speculative demand and the Upbit KRW listing bump reported around July 7, 2026; the token is down roughly 79% from ATH as of 2026-09-09, consistent with a typical post-TGE unlock/de-risking drawdown rather than any reported project-specific failure.
- No pre-token valuation (e.g. a VC round post-money number) was found publicly; the $8.5M and $9.5M figures above are capital raised, not valuations.

## 5. Community

- Discord: 169,014 members (discord.com/invite/2t5sx5BCpB, accessed via search 2026-09-09).
- GitHub (github.com/OpenGradient, accessed 2026-09-09): `ghost` agentic harness 146 stars, `OpenGradient-SDK` 98 stars, `BitQuant` 54 stars, `og-evm` (network node) 16 stars, `tee-gateway` 15 stars, several smaller repos (2-6 stars). Materially more GitHub traction than Tinfoil.
- CoinGecko/CoinMarketCap holder count: 45,070 holders (CoinMarketCap, accessed 2026-09-09).
- X/Twitter: presence confirmed but follower count **not found** through CoinGecko/CMC/GitHub or the project's own site (X pages not directly fetchable per research constraints).
- Reddit, Telegram: **not found**.
- Incentive/points activity described as active "from Q1 2026," where users complete tasks for eligibility toward future rewards (search-derived; no formal "ambassador program" name found). No hackathon program found on the public site.
- The network claims "2 Million+ Verifiable AI Inferences" and "500K+ zkML Proofs + TEE Attestations" as cumulative usage metrics (opengradient.ai), though these are unaudited, project-reported numbers with no independent verification found.

## 6. Connection to Sable Network

Overlap: OpenGradient and Sable both position as a paid layer between AI agents and compute, both use TEEs (OpenGradient explicitly supports TEE attestation as one of two proof types; Sable's confidential tier is Intel TDX specifically), both support x402 as a payment rail, and both attach a cryptographic proof to individual inference calls rather than trusting the provider.

Difference: OpenGradient is a full Layer-2-adjacent token network with a 1B-supply governance/utility token, a validator/staking layer, and a research-lab identity built around zkML plus TEE as dual, interchangeable proof types, whereas Sable is a narrower "gateway" (sealed prompts, per-key spend caps, signed receipts) with SABL positioned as optional rather than mandatory pay-in. OpenGradient also runs its own model hub and agent frameworks (BitQuant, Digital Twins) as first-party products, extending further into the application layer than Sable's infrastructure-only stance.

What Sable could learn: OpenGradient shipped token utility, staking and governance simultaneously with mainnet, which produced a large, fast community (169K Discord, 45K holders) but also a sharp ~79% post-TGE drawdown, illustrating the volatility cost of token-first go-to-market versus Sable's prepaid-USDT-first, token-optional design; OpenGradient's dual zkML+TEE proof menu (letting users choose speed vs. assurance) is a concrete design pattern Sable's single-tier TDX confidential offering could borrow for tiered pricing.

Why a peer: OpenGradient is the clearest token-issuing, TEE-using direct competitor at the "verifiable AI compute" layer, making it the natural token-bearing counterpart to Sable on any peer list, with a real market cap and trading history to compare against SABL's.

## 7. Sources

- https://opengradient.ai/ (accessed 2026-09-09)
- https://docs.opengradient.ai/ (accessed 2026-09-09)
- https://docs.opengradient.ai/learn/onchain_inference/verification (accessed 2026-09-09)
- https://docs.opengradient.ai/learn/architecture/inference_nodes.html (accessed 2026-09-09)
- https://opengradient.foundation/blog/tokenomics (accessed 2026-09-09)
- https://www.opengradient.ai/blog/opengradient-raises-8-5m-to-decentralize-ai (accessed 2026-09-09)
- https://www.prnewswire.com/news-releases/opengradient-raises-8-5m-to-decentralize-ai-infrastructure-and-accelerate-secure-open-source-ai-302270745.html (accessed 2026-09-09)
- https://www.prnewswire.com/news-releases/opengradient-announces-9-5-million-in-total-funding-to-build-the-compute-layer-for-verifiable-ai-302741614.html (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/opengradient (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/opengradient/ (accessed 2026-09-09)
- https://basescan.org/token/0xfbc2051ae2265686a469421b2c5a2d5462fbf5eb (accessed 2026-09-09)
- https://github.com/OpenGradient (accessed 2026-09-09)
- https://discord.com/invite/2t5sx5BCpB (accessed 2026-09-09, via search)
- https://www.chaincatcher.com/en/article/2146530 (accessed 2026-09-09)

Note: some secondary figures (exact Binance listing date, the July 7 Upbit-driven price move, the Q1 2026 incentive program) came from aggregator/news-site search snippets rather than a primary OpenGradient announcement; flagged inline above as search-derived and unverified against a primary source.
