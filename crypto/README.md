# crypto/

Home of the founder's crypto work since 2026-09-05. See `CLAUDE.md` for the two
modes (explore by default, income only on request) and the crypto rules.

| Folder | What goes here |
|---|---|
| `research/` | Notes and analyses: protocols, tokenomics, on-chain data. One file per topic, dated. |
| `tools/` | Scripts, bots, alerts, trackers. Each tool has its own folder with a README. |
| `contracts/` | Smart contracts and dApp code. Testnet by default. |
| `content/` | Public writing: threads, explainers, drafts. |

Create a subfolder when its first file exists, not before. The Sable Observatory
predates this folder and lives in `sites/sable-peers/`.

Never put a seed phrase, private key, or exchange secret anywhere under this
folder. Secrets go in gitignored `.env` files only.
