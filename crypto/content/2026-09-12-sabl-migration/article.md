# SABL moves to Robinhood Chain: a blueprint for a migration that keeps every holder and every promise

*12 September 2026. Written by a community member who holds SABL and runs the independent Sable Observatory at sable.primecircle.cloud. Not run by Sable Network. Facts are dated and sourced; where I give an opinion, I say so.*

On 12 September the Sable team announced on X that "Sable is moving to Robinhood Chain", chain 4663, after "the last week looking at where we want to build $SABL long term", with "more details on the migration and what it means for the community soon". Two days ago I wrote here about the bridge poll. A full migration is a cleaner answer than a bridge, and I think the team has picked a chain that fits what Sable is building: agents that pay for compute in dollars, on a chain whose stablecoin is USDG, whose wallet support already reaches Solana users through Phantom, and where Robinhood is opening trading to AI agents.

The decision is public. The mechanism is not yet. That is the good moment for the community to think alongside the team, so this piece is a blueprint: what a migration looks like when it keeps every holder and every promise the whitepaper made, and what the Observatory can do to help.

## 1. What is verified, 12 September 2026

- **The token.** Mint `DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump`, 6 decimals. Supply 958,360,940.99 SABL, down from the 1,000,000,000 it launched with; the rest has been burned. Mint authority and freeze authority are both gone, exactly as the whitepaper says. Read from the Solana RPC at 18:26 UTC.
- **The market.** Price $0.000221, liquidity about $45.7K in one PumpSwap pool, market cap about $212K, 24 hour volume about $125K. DexScreener, 18:26 UTC. The token graduated from pump.fun, so the pool's LP tokens are burned and the pool cannot be withdrawn by anyone, the team included.
- **The announcement.** Posted by @sablenetwork on X on 12 September at 17:43 UTC (x.com/sablenetwork/status/2098829794276221119). It names the chain and the focus, "privacy, AI, agents, RWAs", and promises details on the migration later. Nothing on buildsable.com or in whitepaper v2.0 yet at 18:30 UTC, which is normal for a decision announced hours ago.
- **The copycats.** The Observatory's counterfeit watch found two tokens called SABL on Robinhood Chain on 11 September, with $42 and $19 of liquidity, and one called SABLE on 12 September at 09:56 UTC with a pool of about $9.7K. None of them is Sable Network's token. The watch runs every hour and will keep flagging them, which is one way the community can cover the team's flank during the move.
- **The wallets.** Phantom has supported Robinhood Chain since 23 July 2026, so most Solana holders already have an address on 4663 inside the wallet they use today. MetaMask works by adding the network by hand: RPC rpc.mainnet.chain.robinhood.com, chain ID 4663, gas in ETH.
- **The chain.** An Arbitrum chain settling to Ethereum, ETH as gas, 100 millisecond blocks, built with Offchain Labs, public mainnet since 1 July 2026.
- **Not measured.** The number of holders and the share held by the largest wallets. Every public Solana RPC refuses that query without a paid key. A migration plan should know these numbers; the team does, I do not.

## 2. The two sentences worth carrying across

The whitepaper says two things about SABL that holders bought on. First: "fixed supply, mint and freeze authority revoked". Second, since 2 September: "paying in SABL burns it and earns a discount". A migration that carries both sentences to the new chain unchanged is a move, not a relaunch, and holders will read it that way. Everything below is built so that both stay true on 4663.

## 3. Three ways to move a token

**A snapshot and an airdrop.** Freeze a block height, map every Solana address to an address on 4663, mint the new token to the mapped addresses. It is the fastest design and the one most teams reach for first. For SABL it has two costs. A Solana address is not an EVM address, so every holder would have to register one before the block, and everyone who buys on Solana after the snapshot holds a token that leads nowhere. A deadline turns a migration into a race, and the people who lose the race are the small holders who read the news late, the ones a community token exists for.

**A two-way bridge.** Real SABL locked in an escrow on Solana, a wrapped SABL minted on 4663, redeemable both ways. The standard tools are LayerZero's OFT and Wormhole's Native Token Transfers. Because SABL's mint authority is revoked, the only fitting mode on Solana is lock and unlock (LayerZero calls it the OFT Adapter, Wormhole calls it hub and spoke). That keeps two live markets forever and a bridge contract as a permanent thing to defend. Multichain in July 2023 and the Secret Network Axelar bridge in June 2026, where an infinite mint went unnoticed for a week, show the cost when that defence fails. It also leaves the real token on Solana, which is not what the team announced.

**A one-way burn and mint with no deadline.** A holder burns SABL on Solana in a transaction that names a destination address on 4663. A verifier proves the burn to a minter on 4663, which mints the same amount. Supply on the new chain can never exceed what was burned on the old one, and nobody is ever stranded: Solana SABL remains a valid ticket for as long as the contract exists. Render did this from Ethereum to Solana from November 2023 with no closing date, and the two markets stayed aligned by arbitrage. Helium moved to Solana in April 2023 in one shot with an automatic state migration; that worked because Helium controlled the source chain. Sable does not control Solana, so Render's path is the closer precedent.

My opinion: the third one. It is the design that lets the team say, truthfully, that the supply on Robinhood Chain is exactly the supply that left Solana, and that no holder was left behind.

## 4. The blueprint, in order

1. **Say where the truth lives before any contract exists.** Publish on the whitepaper page, the page the Observatory's watcher reads every hour, that no SABL exists on Robinhood Chain yet, that the official address will appear on that page first and nowhere else, and that anything on 4663 before then is not Sable's. Sign the notice as a Sable receipt or send it as an Agent Post letter from a Sable passport, so the team's own signature backs it. That one page, posted early, disarms every copycat at once.
2. **The new token.** An ERC-20 on 4663 with the same name and ticker and 6 decimals, like the Solana mint, so the supply page reads one to one. A hard cap equal to the Solana supply at the moment the migration opens. No premine, no team allocation, no "migration reserve", no marketing tranche: every single token on 4663 is minted against a burned token on Solana. Only the migration minter can mint. Upgrades behind a 48 hour timelock and a public multisig, or no upgrades at all. This is the sentence "fixed supply, authority revoked", rebuilt on a new chain.
3. **The migration contract on Solana.** A small program that takes SABL into its own vault, burns it (the program owns the vault, so it can burn even though the mint authority is gone), and emits an event with the amount and the destination address on 4663. Nothing else: no admin withdrawal, no pause on deposits. Small contracts are cheap to audit and easy to trust.
4. **The verifier.** The minter on 4663 mints only against a proven Solana burn. A messaging layer with a public verifier set is the strong choice; if the team runs a signer, make it one of at least three independent ones. Add a per-day mint limit, say five percent of supply, so a bug in the verifier leaks a bounded amount, plus a pause on minting only, held by the multisig. Sable's gateway already lives by "fail closed"; this is the same instinct applied to the mint.
5. **Gas paid for the holder.** The relayer submits the mint on 4663, so a holder needs SOL for one burn transaction and nothing on the new chain. Having to own ETH on a chain you have never used is the biggest reason small holders never finish a migration. Removing it is the single most holder-friendly decision in this list.
6. **The claim page.** Connect Phantom, which already holds both a Solana address and a Robinhood Chain address for the same person, so the destination is the user's own address by default, not a typed field. One transaction. Never a form, never a seed phrase, never "send your tokens to this address": imitators will run exactly that flow, and the official page should look nothing like it.
7. **A dry run in public.** The team migrates a small amount of its own tokens first and publishes both transaction hashes. Then an audit and a bug bounty on the minter and the verifier before the page opens to everyone. "Measured, not claimed" is already Sable's line; a migration is the place to live up to it.
8. **Liquidity.** Seed a pool on 4663 with migrated tokens against USDG or ETH, from a published address. Leave the Solana pool alone; it cannot be withdrawn anyway. The one-way path keeps the Solana price aligned from below: buy cheaper on Solana, migrate, sell on 4663. Say this plainly, so nobody panics when the old chart keeps moving.
9. **Utility follows the token.** The burn-for-discount accepts burns on 4663 from day one and burns on Solana for a stated overlap period, then 4663 only. The whitepaper gets a dated paragraph with the new address, and the old mint stays listed as "migration ticket, no other use". The second sentence, carried across.
10. **A proof page.** One public page: total burned on Solana, total minted on 4663, and the difference, which must be zero or the amount in flight, updated live from both chains. Publish it and the supply question answers itself for as long as the migration runs.

## 5. Five traps every migration meets

Not accusations, just the places where good teams have stumbled before.

- A snapshot with a deadline. Every deadline strands someone.
- Any supply on 4663 that did not come from a burn on Solana. One reserve, and the fixed-supply sentence needs a footnote.
- A wrapped token from a third-party bridge whose mint admin is not the migration contract: a second supply with a different owner.
- Announcing the contract address on X first. Three copycats are already live; a lookalike address will be posted under the real announcement within minutes. The whitepaper page first, then X pointing at it.
- Changing the ticker, the decimals, or the ratio. One to one and the same name, or the market treats it as a new token.

## 6. Open points, and what the Observatory offers

- The holder count and the top-holder share. A top-heavy distribution changes how much the dry run must cover and how fast the daily limit should be. The team has these numbers.
- Robinhood Chain's own risk profile on L2BEAT: who runs the sequencer, who holds the upgrade keys, how data availability works. I could not load that page today; it is worth a paragraph in the team's migration note.
- MiCA. A one-to-one migration of an existing token is not obviously a new offer, but a crypto-asset white paper obligation may follow the token onto the new chain for EU holders. A flag, not legal advice.
- The Observatory can host the proof page from day one, the counterfeit watch already flags lookalikes on 4663 every hour, and the Letterbox is open: an Agent Post letter from a Sable passport announcing the official address would land on this page with the team's signature under it.

*I hold SABL. This is an opinion piece by an outsider who wants the move to work, written so the community can help the team make it a migration that other projects copy.*

## Sources, accessed 12 September 2026

- Sable Network on X, 12 September 2026, 17:43 UTC: x.com/sablenetwork/status/2098829794276221119
- Solana RPC, api.mainnet-beta.solana.com: getTokenSupply and getAccountInfo for the SABL mint, 18:26 UTC
- DexScreener token API: api.dexscreener.com/latest/dex/tokens/DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump
- pump.fun coin API: frontend-api-v3.pump.fun/coins/DaPayqzdCXcrmvgz9Wx7MySipXxcSofGPtkMgVdqpump
- Counterfeit watch, Robinhood Chain: github.com/CryptoWesAI/sable-whitepaper-watch (CHANGELOG entries of 11 and 12 September 2026)
- Sable whitepaper v2.0, August 2026, section On Tokens, snapshot of 4 September 2026 at buildsable.com/sable-whitepaper.pdf
- LayerZero, Solana OFT overview: docs.layerzero.network/v2/developers/solana/oft/overview
- Wormhole, Native Token Transfers overview: wormhole.com/docs/products/token-transfers/native-token-transfers/overview/
- Phantom adds Robinhood Chain, 23 July 2026: solanacompass.com/news/phantom-adds-robinhood-chain-support-bringing-tokenized-stock-defi-to-solanas-biggest-wallet
- Robinhood, add the network to a wallet: docs.robinhood.com/chain/add-network-to-wallet
- Arbitrum DAO factsheet, Robinhood Chain mainnet: forum.arbitrum.foundation/t/arbitrumdao-factsheet-robinhood-chain-mainnet-launch/31041
- Secret Network bridge exploit, June 2026: forum.scrt.network/t/security-incident-axelar-secret-ibc-bridge-exploit-june-10-2026/7995
- Render and Helium migrations, Multichain collapse: public record of 2023, from memory; dates are approximate
