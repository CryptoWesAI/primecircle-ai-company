# Marlin (POND): Peer Fact Sheet

Compiled 2026-09-09 for comparison against Sable Network (buildsable.com).

## 1. What it is

Marlin is a decentralized verifiable-compute protocol; its Oyster sub-network rents TEE-based confidential compute, including AI, via a marketplace. Founded around 2017-2018 by Siddhartha Dutta, Prateesh Goyal and Roshan Poddar (one source adds Nilotpal Mukherjee); HQ cited as Singapore, with India ties. Funding: a $3M seed round, July 2019 (Binance Labs, Arrington XRP Capital, Electric Capital, NGC Ventures; CoinDesk). Later backers named without dated rounds: Multicoin Capital, Pantera Capital, Coinbase Ventures. Total raised: "$33M" per one aggregator; a "$269M" figure elsewhere looks unreliable. Not found: a verified total.

## 2. Product for private/provable AI compute

Oyster is Marlin's TEE marketplace: "a verifiable computing protocol leveraging TEEs to allow complex workloads to be deployed over a decentralized cloud" (docs.marlin.org). It supports Intel SGX and AWS Nitro Enclaves, with Intel TDX added 2024. Oyster CVM rents confidential VM instances "for any amount of time" with "monitoring and uptime guarantees." Attestation: "a Solidity library with RISC Zero support and a web2 portal to confirm whether the right enclave image is running in a genuine TEE." For AI, inputs go "over an encrypted channel directly into an Oyster enclave," where "the proof is generated inside this 'black box,' and only the result is returned." Not found: an AI-inference launch date, a GPU-TEE product like Phala's or Sable's, or a signed receipt like Sable's secp256k1/EIP-191 scheme; Oyster's proof is a verifier-checked attestation, not a portable signature.

## 3. Token

POND is an ERC-20 on Ethereum, launched December 2020. Supply: fixed 10B total/max, no inflation; circulating 8.228B (~82%), CoinGecko, 2026-09-09. Utility: governance, validator/staking participation. Binance listed POND (Innovation Zone) 2021-03-09.

## 4. Market cap arc

CoinGecko's tracked ATH is $0.3234-$0.3845 on 2020-12-21 (sources vary); another aggregator cites $0.304 in 2021, so the ATH is firmly late 2020/early 2021 but not exact. Current market cap: $7.4M on 2026-09-09 (CoinGecko, CoinMarketCap), about a 99.7% decline, ranked roughly #1,069-#1,408. The peak coincided with launch hype and the Layer-0/infrastructure narrative of the 2021 bull run, before Oyster's TEE pivot existed. The current level reflects a long narrative gap: Marlin repositioned toward confidential compute and AI inference, but with few fresh catalysts, while the market concentrated AI-compute attention on better-marketed peers (Phala, io.net, Akash, Render). Holders: 24,580 addresses (CoinMarketCap), consistent with quiet, persistent usage over speculative demand.

## 5. Community

Discord: approximately 3,956 members. X, Telegram, Reddit counts: not found (X not fetchable here). No ambassador or grants program found; outreach is developer-facing: a Binance Academy collaboration, a Bangalore hackathon, forum posts at research.marlin.org. Main venues: X, Discord, GitHub.

## 6. Connection to Sable Network

Overlap: both broker confidential, TEE-attested compute with proof a workload ran in a genuine enclave, and both support AI workloads. Difference: Sable is a metered, pay-as-you-go gateway with sealed prompts, per-key spend caps, a signed receipt per response, and multiple payment rails (USDT, x402, SABL); Oyster is a raw confidential-VM rental marketplace, billed by duration, attestation verified via a Solidity library or web portal, not a per-response signature. Lesson: Marlin proves "TEE marketplace" infrastructure can survive on developer usage for years without a retail narrative, but POND's price and community size show infrastructure alone, without a sharp story like "confidential AI," does not hold speculative attention. Peer status: Oyster is a longer-running, still-active TEE marketplace with real attestation tooling, a useful lower bound for "compute without a narrative wrapper."

## 7. Sources

All accessed 2026-09-09.

- coingecko.com/en/coins/marlin
- coinmarketcap.com/currencies/marlin
- docs.marlin.org/oyster/introduction-to-marlin
- marlin.org/oyster
- coindesk.com (2019-07-10 seed round article)
- tracxn.com/d/companies/marlin
- cbinsights.com/company/marlin-protocol
- binance.com (POND listing)
- gritdaily.com (Binance Academy piece)
- bitdegree.org (price history)
