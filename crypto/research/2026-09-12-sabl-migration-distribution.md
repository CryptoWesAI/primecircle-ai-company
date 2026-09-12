# SABL from Solana to Robinhood Chain: how to move the holders without breaking the token

Written 2026-09-12 for the founder, after the report that the Sable team announced a
full migration and bridge to Robinhood Chain. Opinion piece with a fact base;
the author holds SABL. Companion to `2026-09-10-sable-robinhood-chain-bridge.md`,
which argued against a bridge. That argument still holds; this note answers a
different question: if the team migrates anyway, how do they do it without
stranding a single holder or reopening the supply.

## 1. What is verified (2026-09-12)

| Fact | Value | Source, time |
| --- | --- | --- |
| SABL mint | `DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump`, 6 decimals | Solana RPC, 18:26 UTC |
| Supply | 958,360,940.986598 (launched at 1,000,000,000; the rest is burned) | Solana RPC `getTokenSupply`, 18:26 UTC |
| Authorities | mint authority none, freeze authority none | Solana RPC `getAccountInfo`, 18:26 UTC |
| Market | price $0.000221, liquidity $45.7K on PumpSwap, market cap $212K, 24 h volume $125K | DexScreener, 18:26 UTC |
| Pool | pump.fun graduated ("complete": true), PumpSwap pool `9bwoXpdt…`, no Raydium pool | pump.fun API, 18:26 UTC |
| Holder count, top holders | not measured: every public Solana RPC refused `getTokenLargestAccounts` (paid tier) | |
| The announcement | @sablenetwork on X, 12 Sep 17:43 UTC: "Sable is moving to Robinhood Chain", reasons privacy, AI, agents, RWAs; details on the migration promised later; nothing on buildsable.com or in the whitepaper at 18:30 UTC | x.com/sablenetwork/status/2098829794276221119 (pasted by the founder; X not fetchable here) |
| Fakes on 4663 | SABL x2 on 11 Sep (liquidity $42 and $19); SABLE `0x5d75E9aC…7777` on 12 Sep 09:56Z with a flapsh pool of about $9.7K | whitepaper-watch counterfeit ledger |
| Wallets | Phantom supports Robinhood Chain since 23 Jul 2026; MetaMask by manual add (RPC rpc.mainnet.chain.robinhood.com, chain 4663, gas ETH) | Solana Compass, docs.robinhood.com/chain/add-network-to-wallet |
| LayerZero on Solana | native OFT needs the OFT Store inside a 1-of-N mint-authority multisig; a token with revoked mint authority can only use the OFT Adapter (lock/unlock); "Multiple OFT Adapters break omnichain unified liquidity" | docs.layerzero.network, Solana OFT overview |
| Wormhole NTT | two models: burn-and-mint, or hub-and-spoke ("locks tokens on a central hub chain and mints equivalents on spoke chains"); per-chain rate limits | wormhole.com docs, NTT overview |
| Robinhood Chain | Arbitrum chain settling to Ethereum, ETH gas, 100 ms blocks, built with Offchain Labs; mainnet 1 Jul 2026 | Arbitrum DAO factsheet |

The whitepaper's promise that the migration must keep: "fixed supply, mint and
freeze authority revoked", and since 2 Sep 2026 "paying in SABL burns it and
earns a discount". Everything below is designed so that both sentences stay
true on the new chain.

## 2. The three ways to move a token, and which one fits

**A. Snapshot and airdrop.** Freeze a block height, map every Solana address to
an EVM address, mint the new token to the mapped addresses. Fails here twice:
a Solana address is not an EVM address, so every holder must register one
before the snapshot, and everyone who buys on Solana after the snapshot holds
nothing. A deadline turns a migration into a race, and the people who lose the
race are the small holders who read the news late.

**B. A two-way bridge (LayerZero OFT Adapter or Wormhole hub-and-spoke).** Real
SABL locked in a Solana escrow, wrapped SABL minted on 4663, redeemable both
ways. This keeps two live markets forever and a bridge contract as a permanent
attack surface. Multichain (July 2023) and the Secret Network Axelar bridge
(June 2026, an infinite-mint bug unnoticed for a week) are what that looks like
when it fails. It also means the "real" token stays on Solana, which is not a
migration.

**C. One-way burn-and-mint with no deadline.** A holder burns SABL on Solana
in a transaction that names a destination address on 4663; a verifier proves
the burn to a minter on 4663, which mints the same amount. Supply on the new
chain can never exceed what was burned on the old one, and nobody is ever
stranded: Solana SABL stays a valid ticket for as long as the contract exists.
Render did this from Ethereum to Solana from November 2023 with no closing
date, and the two markets stayed aligned by arbitrage. Helium moved to Solana
in April 2023 in one shot with an automatic state migration; that worked
because Helium controlled the source chain, which Sable does not.

Recommendation: C, with the guardrails in section 3.

## 3. The plan, in order

1. **Say where the truth lives, before any contract exists.** Publish on the
   whitepaper page (the one the watcher reads hourly) that no SABL exists on
   Robinhood Chain yet, that the official address will appear on that page
   first and nowhere else, and that anything on 4663 before then is fake. Three
   fakes already trade there. Sign the announcement as a Sable receipt or send
   it as an Agent Post letter from a Sable passport, so a signature backs it.
2. **The new token.** ERC-20 on 4663, same name and ticker, 6 decimals like
   the Solana mint so the supply page reads one to one. Hard cap equal to the
   Solana supply at the moment the migration opens (958.36M today, minus
   whatever is burned for compute before then). No premine, no team
   allocation, no "migration reserve", no marketing tranche: every single
   token on 4663 is minted against a burned token on Solana. Only the migration
   minter can mint; nothing else has the role. Upgrades behind a 48 h timelock
   and a public multisig, or no upgrades at all.
3. **The migration contract on Solana.** A small program that takes SABL into
   its own vault, burns it (the program owns the vault, so it can burn even
   with mint authority revoked), and emits an event with the amount and the
   destination 4663 address. Nothing else: no admin withdraw, no pause on
   deposits.
4. **The verifier.** The minter on 4663 mints only against a proven Solana
   burn. Use a messaging layer with a public verifier set (Wormhole with a
   custom emitter, or LayerZero DVNs), not a team-run signer alone; if the team
   must run one, make it one of at least three independent signers. Add a
   per-day mint rate limit (say 5 percent of supply) so that a bug in the
   verifier leaks a bounded amount, plus a pause on minting only, held by the
   multisig.
5. **Gas paid for the holder.** The relayer submits the mint on 4663, so a
   holder needs SOL for one burn transaction and nothing on the new chain.
   Receiving without owning ETH removes the biggest reason small holders never
   complete a migration.
6. **The claim page.** Connect Phantom, which already holds both a Solana and
   a Robinhood Chain address for the same user, so the destination is the
   user's own address by default, not a typed field. One transaction. Never a
   form, never a seed phrase, never "send tokens to this address": the scams
   will run exactly that flow within the hour, and the official page must be
   visibly different from it.
7. **Dry run in public.** The team migrates its own tokens first, a small
   amount, and publishes the two transaction hashes. Then an audit and a bug
   bounty on the minter and verifier before the page opens to everyone.
8. **Liquidity.** Seed a 4663 pool with migrated tokens against USDG or ETH,
   from a published address. Do not touch the Solana pool: pump.fun burns LP
   tokens on graduation, so it cannot be withdrawn anyway, and the one-way
   contract keeps its price aligned from below (buy cheaper on Solana, migrate,
   sell on 4663). State this plainly so nobody panics when the Solana chart
   keeps moving.
9. **Utility follows the token.** The burn-for-discount accepts 4663 burns
   from day one and Solana burns for a stated overlap period, then 4663 only.
   The whitepaper gets a dated paragraph with the new address, and the old
   mint stays listed as "migration ticket, no other use".
10. **The proof page.** One public page: total burned on Solana, total minted
    on 4663, the difference (which must be zero or the in-flight amount),
    updated live from both chains. The Observatory can host it; the watcher
    can alert when the two numbers diverge.

## 4. What would destroy it

- A snapshot with a deadline. Every deadline strands someone; the stranded
  holders are the loudest, and rightly so.
- Any supply on 4663 that did not come from a Solana burn. One "team reserve"
  and the fixed-supply sentence in the whitepaper is false.
- A wrapped token from a third-party bridge with a mint admin that is not the
  migration contract. That is a second supply with a different owner.
- Announcing the contract address on X first. Three fakes are already live;
  a reply with a lookalike address will be pinned under the real post within
  minutes.
- Pulling or moving liquidity before the migration path is open.
- Changing the ticker, the decimals, or the ratio. One to one, same name, or
  the market treats it as a new token, because it is one.

## 5. Open points to check before publishing anything

- Holder count and top-holder share (needs a paid RPC or Solscan key): a top-
  heavy distribution changes how much the dry run must cover.
- Robinhood Chain's own risk profile on L2BEAT (sequencer, upgrade keys, data
  availability): could not be fetched today; read it before calling the chain
  "safer".
- MiCA: a one-to-one migration of an existing token is not obviously a new
  offer, but a crypto-asset white paper obligation may follow the token onto
  the new chain. Flag for the team, not legal advice.
- The mechanism: the team promised details after the announcement. Hold them
  against section 3 when they arrive.

## Sources (accessed 2026-09-12)

- Solana RPC (api.mainnet-beta.solana.com): getTokenSupply, getAccountInfo for the SABL mint
- DexScreener token API: https://api.dexscreener.com/latest/dex/tokens/DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump
- pump.fun coin API: https://frontend-api-v3.pump.fun/coins/DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump
- Whitepaper watch, counterfeit ledger: `../sable-whitepaper-watch/CHANGELOG.md`, entries 2026-09-11-1005 and 2026-09-12-1005
- Sable whitepaper v2.0, snapshot 4 Sep 2026: `../sable-whitepaper-watch/whitepaper.sentences.txt` lines 119 to 140
- LayerZero Solana OFT overview: https://docs.layerzero.network/v2/developers/solana/oft/overview
- Wormhole NTT overview: https://wormhole.com/docs/products/token-transfers/native-token-transfers/overview/
- Phantom adds Robinhood Chain (23 Jul 2026): https://solanacompass.com/news/phantom-adds-robinhood-chain-support-bringing-tokenized-stock-defi-to-solanas-biggest-wallet
- Robinhood, add network to wallet: https://docs.robinhood.com/chain/add-network-to-wallet
- Arbitrum DAO factsheet, Robinhood Chain mainnet: https://forum.arbitrum.foundation/t/arbitrumdao-factsheet-robinhood-chain-mainnet-launch/31041
- Precedents from memory, verify before quoting in public: Helium to Solana (April 2023), Render upgrade portal (from November 2023), Multichain collapse (July 2023); Secret Network Axelar exploit (June 2026) from `crypto/research/peers/secret.md`
