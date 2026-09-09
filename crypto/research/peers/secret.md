# Secret Network / Secret AI: Fact Sheet

## 1. What it is
Secret Network is a Cosmos layer-1 running smart contracts over encrypted inputs, outputs, and state via trusted execution environments (TEEs). Began as Enigma, founded 2015 at MIT by Guy Zyskind and Can Kisagun; its September 2017 ICO raised $45M, then drew SEC scrutiny. Relaunched as a Cosmos L1: mainnet February 2020, renamed Secret Network by vote May 2020. SCRT Labs (San Francisco, Tel Aviv) leads development. Funding: $11.5M on May 3, 2021, led by Arrington XRP Capital and BlockTower (Crunchbase); a $400M ecosystem fund announced January 19, 2022 with DeFiance Capital, Alameda Research, CoinFund and HashKey (Blockworks).

## 2. Product
The base chain uses Intel SGX enclaves so validators process data unseen, per docs "combining the programmability of Ethereum with the privacy of Zcash." Secret AI, layered on top, is SCRT Labs' "Decentralized Confidential Computing solution that brings trusted AI to users who value their privacy" (docs.scrt.network), using NVIDIA TEEs, separate from the chain's SGX. Its SDK developer preview shipped January 2025: Python access to confidential text, speech, multimodal inference; citing earth.network and Arweave-linked agent integrations. No per-response signatures like Sable's receipts were found; trust rests on remote attestation. This matters: September 2025's "wiretap.fail" and "tee.fail" disclosures showed physical-access attacks could forge attestation on Secret Network's SGX generation, forcing fully then semi-permissioned validators, hitting the attestation claim behind the chain and its AI product.

## 3. Token
SCRT is the gas, staking, and governance token, launched at mainnet (February 2020) via 1:1 swap from ERC-20 ENG; Binance opened SCRT/BTC and SCRT/ETH trading September 30, 2020, the first major listing. Supply is uncapped, inflationary (7-9%, docs.scrt.network). On August 21, 2026, Proposal 365 minted about 1.079B new SCRT, quadrupling supply from ~362M to 1.44B overnight, diluting holders to ~25% ownership (CryptoSlate, CryptoTicker).

## 4. Market cap arc
All-time high: $10.38-$10.64 on October 28, 2021 (CoinGecko, CoinMarketCap), the 2021 privacy-coin/Cosmos cycle. Current: ~$11-13M, September 8-9, 2026 (CoinGecko: $12.3M on 1.447B supply; CoinMarketCap: $3.09M on a stale 364M figure, trackers lagging the mint). The 2026 collapse compounds: a $4.67M Axelar-Secret bridge exploit unnoticed a week (June 10); wiretap.fail/tee.fail research undercutting SGX trust; SCRT Labs ending L1 support September 1; a rejected Arbitrum-migration vote; Binance delisting spot trading by September 3; then an emergency mint to fund continuation.

## 5. Community
Discord: ~34,160 members. X/Twitter: @SecretNetwork shows ~181,800 followers, though SCRT Labs stepped back toward a community-run @SecretRebooted handle in the 2026 transition, so this may not reflect an active channel. Telegram and Reddit subscribers: not found. Programs: a quarterly Grants Program (Q2 2025 cohort: Confidential AI/Agents) and recurring HackSecret hackathons via scrt.network, GitHub. Governance debate happens on forum.scrt.network.

## 6. Connection to Sable Network
Both sell verifiable trust for AI compute: Secret Network's SGX/NVIDIA-TEE attestation is a direct predecessor to Sable's Intel TDX tier, letting a client check a machine ran honestly. Difference: Secret Network secures trust at chain level as a general-purpose L1; Sable is a narrower pay-as-you-go gateway with per-key spend caps, prepaid USDT/x402 billing, and per-response secp256k1/EIP-191 signed receipts, a lighter guarantee than a chain to maintain. This suggests Sable's signature is more resilient than attestation alone, since 2025-2026 showed hardware attestation can be broken. Lesson: chain-level infrastructure accumulates attack surface over years (bridges, validators, governance capture) a narrower gateway avoids, but Secret Network's six-year run shows a credible non-token fallback plan must exist before a crisis, not improvised during one. An observer would list it as a peer: the oldest live confidential-computing chain now pivoting into "Confidential AI," the closest real precedent, failures included, for Sable's attempt.

## 7. Sources
- https://docs.scrt.network/secret-network-documentation/overview-ecosystem-and-technology/ecosystem-overview/contributors-and-entities/secret-labs (accessed 2026-09-09)
- https://docs.scrt.network/secret-network-documentation/overview-ecosystem-and-technology/secret-network-overview/history (accessed 2026-09-09)
- https://docs.scrt.network/secret-network-documentation/secret-ai/introduction (accessed 2026-09-09)
- https://docs.scrt.network/secret-network-documentation/overview-ecosystem-and-technology/secret-network-overview/scrt-and-sscrt (accessed 2026-09-09)
- https://coinbureau.com/review/secret-network-scrt (accessed 2026-09-09)
- https://ghost.scrt.network/introducing-scrt-labs-an-evolution-of-enigma/ (accessed 2026-09-09)
- https://finder.startupnationcentral.org/company_page/enigma (accessed 2026-09-09)
- https://www.crunchbase.com/organization/secret-network (accessed 2026-09-09)
- https://www.crunchbase.com/funding_round/secret-network-series-unknown--688d000d (accessed 2026-09-09)
- https://blockworks.co/news/secret-network-announces-400m-ecosystem-funding-reveals-big-name-investors (accessed 2026-09-09)
- https://scrt.network/blog/developer-ai-sdk-preview (accessed 2026-09-09)
- https://github.com/scrtlabs/secret-ai-sdk (accessed 2026-09-09)
- https://www.coingecko.com/en/coins/secret (accessed 2026-09-09)
- https://coinmarketcap.com/currencies/secret/ (accessed 2026-09-09)
- https://cryptoticker.io/en/secret-network-scrt-dilution-mint/ (accessed 2026-09-09)
- https://cryptoslate.com/layer-1-network-dilutes-supply-by-75-overnight-to-fund-survival-after-main-developer-quits/ (accessed 2026-09-09)
- https://forum.scrt.network/t/community-continuance-of-secret-network-l1/8011 (accessed 2026-09-09)
- https://forum.scrt.network/t/security-incident-axelar-secret-ibc-bridge-exploit-june-10-2026/7995 (accessed 2026-09-09)
- https://cointelegraph.com/news/secret-network-bridge-exploited-infinite-mint-bug (accessed 2026-09-09)
- https://en.cryptonomist.ch/2026/08/20/binance-token-delisting-icon-secret-storj/ (accessed 2026-09-09)
- https://www.binance.com/en/support/announcement/ab16b0fedc734c8e83bf0a5ba60cf024 (accessed 2026-09-09)
- https://x.com/SecretNetwork (accessed 2026-09-09)
- https://x.com/SecretRebooted (accessed 2026-09-09)
- https://scrt.network/blog/secret-labs-announces-latest-grant-recipients-opens-applications-for-q2-2025-cohort (accessed 2026-09-09)
