# iExec (RLC): Fact Sheet

## 1. What it is, founding, funding
iExec is a decentralized cloud computing marketplace, now positioned around confidential computing and AI, on Ethereum. Founded October 16, 2016 in Lyon, France by Gilles Fedak (CEO) and Haiwu He (Messari, Crunchbase). RLC: "Run on Lots of Computers."

Funding: a public ICO on April 19, 2017 closed in under three hours, raising roughly $12 to $12.5M (Cointelegraph: "the world's 5th largest ICO"). Crunchbase data (via search; direct fetch 403) names backers Bpifrance, Atopia Capital, HyperChain Capital, Maven 11. Tracxn shows a $603K round, January 1, 2021 (Sydcrypto, Blockpower) and a 2020 grant from Europa. Inference: post-ICO funding looks thin; these secondary sources are lower-confidence than the ICO figure.

## 2. Confidential compute / AI product
iExec's docs (docs.iex.ec) call Intel TDX "the standard technology for confidential computing," letting developers "run AI workloads in secure VMs without rewriting a single line of code," with "Remote Attestation: Verifies the integrity of the execution environment," so it "integrates remote attestation, verifying that only trusted environments can process sensitive AI models."

Dated: a Confidential AI framework running DeepSeek inside TDX TEEs (CryptoSlate, 2025); ElizaOS agents run "with full confidentiality in iExec TDX Trusted Execution Environments" (iExec Medium); an MCP server "built for Claude, agents, and AI tooling." September 8, 2025: TEE-based privacy tools launched on Arbitrum, per Decrypt "the first privacy tools provider for Arbitrum ecosystem builders." No independent audit.

## 3. Token
RLC is an ERC-20 on Ethereum. A PoS sidechain, Bellecour ("xRLC"), was sunset July 2, 2026, migrated to mainnet. TGE: the April 19, 2017 ICO. Supply is fixed near 87,000,000 RLC (CoinGecko/CoinMarketCap: ~87M circulating = max), 100% circulating, no inflation or unlocks. Utility: paying for compute/confidential tasks, staking, and, since September 2025, a burn per Arbitrum privacy transaction. First major listing: Bittrex, April 20, 2017; later KuCoin, Coinbase (dates not found).

## 4. Market cap arc
ATH: $15.51 (CoinGecko) / $16.26 (CoinMarketCap), both May 10, 2021, the 2021 bull run. All-time low: $0.1538, December 14, 2018 (CoinGecko), the post-ICO bear bottom. Current: market cap approximately $26.4M at roughly $0.30 (CoinGecko, CoinMarketCap, accessed 2026-09-09), about 98% below ATH. A 2025 rally took RLC from a May to July low near $0.45 to $1.34 in July (+59%), tied to AI/DePIN interest and the Arbitrum launch, then profit-taking. Inference: the low valuation reflects project age and newer competitors, not dilution (supply is fixed).

## 5. Community
X handle @iEx_ec exists; follower count: not found (CoinGecko/CoinMarketCap community pages gave no numbers). Telegram and Discord exist per iExec's Community Hub; member counts: not found. Reddit: not found. CoinMarketCap lists 26.89K on-chain "token holders" (distinct from social size). Programs: a Community Ambassador Program, an "iExec Portal" (2022), and an "iBuild" hackathon with $18K in prizes, up to $100K in grants (TAIKAI).

## 6. Connection to Sable Network
Overlap: both use TEE-based confidential compute with signed/attested execution for AI agents; iExec's MCP server and ElizaOS integration sit in the "agent plus verifiable compute" space Sable occupies. Difference: iExec is a nine-year-old general-purpose compute marketplace (protocol, workerpools, a retired sidechain) with confidential AI as one use case; Sable is a narrower, payment-first gateway (sealed prompts, spend caps, EIP-191 receipts, prepaid USDT/x402). Inference: iExec shows TEE compute has multi-year staying power, predating the AI-trust narrative, but its 98%-below-ATH cap shows infrastructure alone did not sustain value, and sunsetting Bellecour shows bespoke chains carry real cost, an argument for Sable's simpler gateway. An observer lists iExec as a Sable peer as one of the oldest TEE/confidential-computing projects, from the 2017 ICO cycle, pivoted toward confidential AI and agent tooling.

## 7. Sources
- https://messari.io/project/iexec-rlc/profile (accessed 2026-09-09)
- https://www.crunchbase.com/person/gilles-fedak (accessed 2026-09-09, via search snippet)
- https://www.crunchbase.com/organization/iexec (accessed 2026-09-09, direct fetch returned 403; data via search snippet)
- https://cointelegraph.com/news/iexec-closes-worlds-5th-largest-ico-with-12-mln-in-6-hours (accessed 2026-09-09)
- https://medium.com/iex-ec/iexec-crowdsale-results-and-kickoff-budget-a1104e4f16e7 (accessed 2026-09-09)
- https://tracxn.com/d/companies/iexec/__JMMUqEG81xLLZmsGgQdE5g3whLfu-oX4Pdln4uGE4TI/funding-and-investors (accessed 2026-09-09, via search snippet)
- https://docs.iex.ec/get-started/use-cases (accessed 2026-09-09)
- https://docs.iex.ec/protocol/tee/intel-tdx (accessed 2026-09-09)
- https://iex.ec/blog/confidential-ai-intel-tdx (accessed 2026-09-09)
- https://medium.com/iex-ec/elizaos-ai-agents-now-run-in-full-confidentiality-with-iexec-x-intel-tdx-48d10cba4468 (accessed 2026-09-09, via search snippet)
- https://cryptoslate.com/press-releases/iexec-confidential-ai-framework-running-deepseek-in-intel-tdx-tees/ (accessed 2026-09-09, via search snippet)
- https://decrypt.co/338425/iexec-becomes-first-privacy-tools-provider-for-arbitrum-ecosystem-builders (accessed 2026-09-09, via search snippet)
- https://chainwire.org/2025/09/08/iexec-becomes-first-privacy-tools-provider-for-arbitrum-ecosystem-builders/ (accessed 2026-09-09, via search snippet)
- https://www.coingecko.com/en/coins/iexec-rlc (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/rlc/ (accessed 2026-09-09)
- https://docs.iex.ec/get-started/tooling-and-explorers/bridge (accessed 2026-09-09, via search snippet)
- https://medium.com/iex-ec/iexec-2025-roadmap-expanding-the-iexec-and-rlc-ecosystem-f817194d4ac0 (accessed 2026-09-09, via search snippet)
- https://medium.com/iex-ec/introducing-the-iexec-community-ambassador-program-c0279a47e14c (accessed 2026-09-09, via search snippet)
- https://www.globenewswire.com/news-release/2022/03/23/2409014/0/en/iExec-Launches-iExec-Portal-a-New-Interface-to-Involve-and-Reward-the-Community.html (accessed 2026-09-09, via search snippet)
- https://taikai.network/en/iExec/hackathons/ibuild/overview (accessed 2026-09-09, via search snippet)
- https://iex.ec/community-hub (accessed 2026-09-09, via search snippet)
