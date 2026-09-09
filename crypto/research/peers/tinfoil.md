# Tinfoil (tinfoil.sh): Fact Sheet

Compiled 2026-09-09.

## 1. What it is

Tinfoil is a San Francisco startup that lets developers run AI inference and applications inside hardware-based confidential computing enclaves so that not even Tinfoil can see the data or prompts. Founded in 2024 by Jules Drean, Sacha Servan-Schreiber and Tanya Verma (later joined by founding engineer Nate Sales); Drean and Servan-Schreiber hold MIT PhDs in secure hardware/cryptography, Verma is a former Cloudflare systems engineer. The company went through Y Combinator's Summer 2025 batch (YC "X25") and has around 5-7 employees.

Funding is small and not cleanly disclosed in one press release. Named backers across YC's own page, Crunchbase/Tracxn/PitchBook scrapes, and LinkedIn/press posts include: Y Combinator, Felicis Ventures, Pioneer Fund, Founders Capital (UK), and Tekedia Capital (a May 2026 addition, amount undisclosed), plus angels Paul Graham, Nick Sullivan, Michael Grinich (WorkOS) and Alana Renda (ex-Readyset). One Crunchbase-derived figure puts total disclosed raised at $500K, which likely reflects only the smallest tracked check, not a real total; a separate aggregator ("$504M raised") is very likely a data error and is not credible. **Exact seed round size and date: not found** in any primary source (no company blog post or press release with a dollar figure located).

## 2. The product that matters

Tinfoil's core claim is end-to-end confidential AI: "Data is encrypted in memory and only decrypted inside the enclave, ensuring that no one can access your data while it is being processed" (tinfoil.sh/technology). It supports three hardware roots of trust: NVIDIA "GPU confidential computing on Hopper & Blackwell architectures," AMD SEV-SNP "for secure encrypted virtualization of CPU workloads," and Intel TDX "for hardware-isolated trust domains" (tinfoil.sh/technology).

Verification is client-side and automatic: "the client SDKs automatically verify attestation through a series of cryptographic checks" (docs.tinfoil.sh/introduction), and code provenance runs through a Sigstore transparency log: "GitHub Actions automatically compiles the code and publishes both the binary and its cryptographic measurement to a transparency log maintained by Sigstore" (tinfoil.sh blog, 2025-01-10). Tinfoil describes hashes-and-signatures as the mechanism proving enclave authenticity ("running on hardware endorsed by NVIDIA, Intel or AMD") but no public page spells out a signature scheme (no secp256k1/EIP-191 equivalent found) or a "signed receipt per response" product the way Sable describes it.

Live today (per tinfoil.sh and docs, checked 2026-09-09): an OpenAI-API-compatible Private Inference API, a browser-based Private Chat (chat.tinfoil.sh), and "Tinfoil Containers" (announced 2026-03-10) for running arbitrary workloads, not just LLM calls, inside attested enclaves. Agent-facing tooling exists but is thin: GitHub shows an `opencode-provider` repo ("verifiably-private models from Tinfoil secure enclaves") and a `confidential-agent-sandbox` repo, both with 0 stars, i.e. early/unproven. A named use case: Pour Demain, a Brussels AI-policy think tank, used Tinfoil Containers to audit a 744B-parameter model inside a confidential enclave (tinfoil.sh blog).

## 3. Token

Tinfoil has no cryptocurrency token. Multiple unrelated "Tinfoil"-named tokens exist on Base, BSC and Solana (e.g. a "TFL" token on Base, "Tinfoil Hat Cult" on OKX/LBank) but none are affiliated with tinfoil.sh; these are coincidental name collisions, not the company's token.

Tinfoil is financed the conventional startup way: seed-stage VC plus a usage-based pricing page (self-serve and enterprise tiers for the Private Inference API, Private Chat and Containers products). No public token sale, no on-chain treasury.

## 4. Valuation / market cap arc

No token means no market cap. Last known funding signal is the YC Summer 2025 batch plus the Tekedia Capital investment reported in May 2026; no post-money valuation has been publicly disclosed by Tinfoil, PitchBook, or Crunchbase as of 2026-09-09 (PitchBook's profile requires a paid account to view the number). One third-party revenue data point: Latka reported Tinfoil at $660K annualized revenue with a 6-person team around September 2025 (getlatka.com, accessed 2026-09-09), third-party estimate, not confirmed by Tinfoil itself.

## 5. Community

- X/Twitter: official account is @TinfoilAI (not @tinfoilsh); a search-engine snippet reported a low three-digit follower count. This was not independently verified by direct page access (X pages are not fetchable here) and may be stale, treat as low-confidence.
- GitHub (github.com/tinfoilsh, checked 2026-09-09): small but active, top repos are `cvmimage` (23 stars), `tinfoil-webapp` (18), `tinfoil-python` (14), `modelwrap` (14), `tinfoil-js` (12), `encrypted-http-body-protocol` (12). No repo exceeds ~25 stars, consistent with an early-stage, developer-tool-sized project.
- Discord/Telegram/Reddit: no public community numbers found.
- No CoinGecko/CoinMarketCap community tab exists (no token).
- No ambassador, grants or hackathon program found on tinfoil.sh.
- Community activity appears to concentrate on Hacker News (a "Launch HN: Tinfoil (YC X25)" thread exists) and GitHub issues/PRs rather than a dedicated chat community.

## 6. Connection to Sable Network

Overlap: both sell confidential AI compute with hardware-rooted attestation as the trust mechanism, both support Intel TDX, and both target developers/agents who need to prove a request wasn't tampered with or leaked. Both also emphasize automatic client-side verification rather than asking users to trust a brand.

Difference: Tinfoil is a pure Web2 startup, no token, no on-chain payment rail, no per-key spend caps, and no cryptographically signed receipt attached to every response the way Sable's secp256k1/EIP-191 model does, Tinfoil's proof lives in attestation + Sigstore transparency logs, checked once per connection, not as a portable per-response artifact. Tinfoil also runs full GPU confidential computing (Hopper/Blackwell) today, which is a broader hardware footprint than a single-tier TDX offering.

What Sable could learn: Tinfoil's SDK-side "verify automatically, don't make the user think about it" UX is a stronger adoption wedge than a manually-checked receipt, and its transparency-log-plus-Sigstore approach to code provenance is a cheap credibility signal Sable's TDX tier could borrow.

Why a peer: Tinfoil is the clearest non-crypto competitor proving that "confidential AI inference in a TEE with attestation" is a fundable, shippable category on its own, without a token, which is the sharpest available contrast to Sable's crypto-native, token-optional model.

## 7. Sources

- https://tinfoil.sh/ (accessed 2026-09-09)
- https://tinfoil.sh/technology (accessed 2026-09-09)
- https://tinfoil.sh/company (accessed 2026-09-09)
- https://docs.tinfoil.sh/introduction (accessed 2026-09-09)
- https://tinfoil.sh/blog/2025-01-10-tinfoil-enclaves-overview (accessed 2026-09-09)
- https://tinfoil.sh/blog/2026-03-10-tinfoil-containers (accessed 2026-09-09)
- https://www.ycombinator.com/companies/tinfoil (accessed 2026-09-09)
- https://news.ycombinator.com/item?id=43996555 (Launch HN thread, accessed 2026-09-09)
- https://www.crunchbase.com/organization/tinfoil (accessed 2026-09-09)
- https://pitchbook.com/profiles/company/770982-94 (accessed 2026-09-09)
- https://tracxn.com/d/companies/tinfoil/__UDLjo0TGvK5WU1UvCYyhSGWQhSf1Z71WqXl2gHdLMms (accessed 2026-09-09)
- https://www.linkedin.com/posts/founders-capital-uk_were-backing-tinfoil-tinfoil-yc-x25-as-activity-7384256785567657985-BA5c (accessed 2026-09-09, snippet only, page 404'd on direct fetch)
- https://www.tekedia.com/tekedia-capital-invests-in-tinfoil-the-future-of-privacy-in-ai-era/ (accessed 2026-09-09)
- https://getlatka.com/companies/tinfoil.io (accessed 2026-09-09)
- https://github.com/tinfoilsh (accessed 2026-09-09)
- https://x.com/TinfoilAI (referenced via search snippet, accessed 2026-09-09, not independently verified)

Note: figures from aggregator sites (Crunchbase/Tracxn/PitchBook/StartupHub) disagreed sharply with each other (from "$500K" to an implausible "$504M"); treat all funding totals here as directional, not confirmed.
