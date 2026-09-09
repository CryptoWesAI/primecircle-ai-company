# Phala Network (PHA): Peer Fact Sheet

Compiled 2026-09-09 for comparison against Sable Network (buildsable.com).

## 1. What it is

Phala Network is a decentralized, TEE-based confidential compute network for running smart contracts and AI inference off-chain with hardware-enforced privacy and attestation. Founded 2018 by Marvin Tong (CEO), Hang Yin, Zhe Wang and Jun Jiang; sources place the team in Beijing and San Francisco. Funding: $10M Strategic round on 2020-09-02 (IOSG Ventures, SNZ Holding, Alameda Research, Candaq Fintech Group, Incuba Alpha; CoinCarp/DropsTab) and an undisclosed round led by DWF Labs on 2024-01-12 (Messari). Private tranches of ~$1.4M (Jan 2021) and ~$28K (Feb 2021) preceded listing. Not found: one authoritative total-raised figure.

## 2. Product for private/provable AI compute

Phala Cloud runs LLM inference inside TEEs: Intel TDX, Intel SGX, AMD SEV, and NVIDIA H100/H200 GPU TEE. GPU TEE launched 2025-07-17: "Phala introduces the world's first open, real-time attested, hardware-enforced confidential AI platform on NVIDIA H100/H200" (phala.com). Deployment is turnkey via an OpenAI/OpenRouter-compatible API for Qwen, DeepSeek, Llama3 and others. Attestation is per-inference: "Each running model provides a real-time attestation, accessible via our 'Chat and Verify' tool... cryptographic proof that your workload is running inside an authentic TEE" (phala.com, 2025-07-17). This grew out of Phat Contracts (TEE-backed off-chain contracts). On 2025-10-08 Phala's community voted to migrate fully off Polkadot to its Ethereum L2. Not found: a signed-receipt scheme like Sable's secp256k1/EIP-191 signature; Phala's proof is a TEE quote, checked via its own tool.

## 3. Token

PHA, ERC-20 originally (TGE concluded 2020-09-12), migrating to Ethereum L2. Fixed supply: 1,000,000,000 PHA max/total, no inflation; circulating 840.5M (~84%), per CoinGecko, 2026-09-09. Utility: paying for TEE compute, gatekeeper staking/slashing, DAO governance. Binance listed PHA (Innovation Zone) on 2021-02-25.

## 4. Market cap arc

ATH: $1.39-$1.41 on 2021-05-14/15 (CoinGecko, CoinMarketCap). Current: $21.85M-$21.89M on 2026-09-09 (CoinGecko, CoinMarketCap), roughly 98% below ATH. The peak rode the 2021 DeFi/Polkadot-parachain bull run, coinciding with an early parachain slot win and the Binance listing. The current level reflects the Polkadot privacy-computing narrative fading post-2022, a multi-year repositioning (privacy chain to "coprocessor" to confidential-AI cloud, per Phala's 2023/2024 roadmap posts), and competition from better-funded AI-compute narratives (io.net, Render, Akash, Bittensor) despite a live 2025 GPU TEE product. All-time low, $0.01922, was set 2026-08-03, weeks before this sheet.

## 5. Community

X followers: approximately 142,800 (snapshot dated 2026-06-03; X not fetched directly). Discord: approximately 12,057 members. Telegram, Reddit counts: not found. Ambassador Program (Oct 2025): 1 Head, 2 Senior, 10 active Ambassadors sharing 45,000 PHA/month. Builders Program funds AI Agent Contract projects (Tier 1 up to $20,000 PHA, Tier 2 up to $50,000 PHA), plus hackathon sponsorships. Main venues: X, Discord, forum.phala.network.

## 6. Connection to Sable Network

Both sit in confidential AI compute and use hardware TEEs (Phala: TDX/SGX/H100/H200; Sable: Intel TDX), both offer cryptographic proof of enclave execution. Difference: Sable is a pay-as-you-go gateway between agents and third-party compute (sealed prompts, per-key spend caps, signed receipts per response, USDT/x402/SABL payment); Phala runs and sells its own compute, and its attestation is a TEE-quote check via its own tool, not a portable signed receipt. Lesson for Sable: attestation sells once it is one-click consumable, as Phala's "Chat and Verify" UX shows, and repeated repositioning costs years of narrative even as tech improves, so Sable should keep its pitch stable. Peer status: Phala is one of few projects putting real GPU workloads behind live hardware attestation for AI inference today.

## 7. Sources

All accessed 2026-09-09.

- coingecko.com/en/coins/phala-network
- coinmarketcap.com/currencies/phala-network
- docs.phala.com/network/overview/phala-network
- phala.com/posts/gpu-tee-is-launched-on-phala-cloud-for-confidential-ai (dated 2025-07-17)
- phala.com/posts/phala-2024-road-map
- phala.com/posts/phala-2023-year-in-review
- coincarp.com/fundraising/phala-network-strategic
- dropstab.com/coins/pha/fundraising
- messari.io/project/phala-network
- medium.com/phala-network/binance-will-list-phala-network-pha-in-the-innovation-zone-2ab5b1980355
- edgen.tech/news/crypto/phala-network-fully-migrates-to-ethereum-l2-for-ai-compute-pha-token-swap-announced
- fxstreet.com/cryptocurrencies/news/ai-polkadot-parachain-phala-votes-to-fully-switch-to-ethereum-l2-202510100604
- medium.com/phala-network/become-an-global-ambassador-of-phala-network-9cd230131b8d
