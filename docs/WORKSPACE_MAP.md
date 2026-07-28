# Workspace-kaart: wat hoort bij wat

> Eén bron van waarheid over wie wat bezit. De mappenstructuur volgt sinds
> 2026-07-16 de drie eigenaren, zodat de explorer het meteen laat zien.

## De structuur in één blik

```
primecircle-ai-company/
  # A. Bedrijf & identiteit (root — moet hier blijven)
  CLAUDE.md  CURRENT_STATE.md  PAOF_CONSTITUTION.md
  PROJECT_KERNEL.md  README.md  START_HERE.md

  website/            # A. PrimeCircle-bedrijfssite (index.html, css/, js/, server.js)
  sites/
    belvanger/        # A. PrimeCircle-eigen trades-demo/verkoopsite (Belvanger)
  product/
    chatbot/          # B. Het herbruikbare chatbot-product
  clients/
    ab-uitvaartzorg/  # C. De klant Alien
      deploy/         #    → eigen git-repo CryptoWesAI/ABUitvaart (parent negeert dit)
      docs/           #    → Alien-specifieke docs
  docs/               # A. Bedrijfskennis (framework, onderzoek, beslissingen, compliance)
  roadmap/  workflow/ # A. Leren & werkwijze
  .claude/  .github/  # A. Skills + Copilot-instructies
```

## A. PrimeCircle: bedrijf, strategie & framework

| Wat | Locatie |
|---|---|
| Kern-instructies + status | `CLAUDE.md`, `CURRENT_STATE.md`, `START_HERE.md`, `README.md` |
| PAOF-framework | `PAOF_CONSTITUTION.md`, `PROJECT_KERNEL.md`, `docs/paof/*` |
| Copilot-instructies | `.github/copilot-instructions.md` |
| Beslissingen-log | `docs/decisions/DECISIONS_LOG.md` |
| Marktonderzoek | `docs/research/*` |
| Go-to-market strategie | `docs/offers/aanbod-uitvaartniche.md`, `docs/offers/OFFER_TEMPLATE.md` |
| Product-compliance (alle klanten) | `docs/compliance/ai-transparantie-art50.md` |
| Trades-product (MVP-recept) | `docs/build/mvp-missed-call-textback.md` |
| Leren & werkwijze | `roadmap/LEARNING_ROADMAP.md`, `workflow/DEV_WORKFLOW.md` |
| Skills | `.claude/skills/opportunity-check/`, `.claude/skills/scroll-world/` |
| Bedrijfssite | `website/` (index.html, css/, js/, server.js, package.json) |
| Trades-demo/verkoopsite (Belvanger) | `sites/belvanger/`: gecorrigeerde bron-van-waarheid + hardened `deploy-to-vps.sh`; live (noindex) op `belvanger.primecircle.cloud`. Zie `sites/belvanger/STATUS.md` |
| Deze kaart + docs-index | `docs/WORKSPACE_MAP.md`, `docs/README.md` |

## B. PrimeCircle: het herbruikbare product (de chatbot)

Config-gedreven chatbot als **product** dat meerdere klanten bedient. PrimeCircle-IP,
geen klantbezit. Eén generieke motor + per-klant configuratie.

| Wat | Locatie |
|---|---|
| Generieke server + widget + dashboard | `product/chatbot/server.js`, `product/chatbot/public/*` |
| Klant-sjabloon (nieuwe klant kopieert dit) | `product/chatbot/customers/_template/` |
| Klant-conventie + tooling | `product/chatbot/customers/README.md`, `product/chatbot/site-integration/apply.mjs`, `stats.mjs` |
| Handleidingen | `product/chatbot/README.md`, `product/chatbot/DEPLOY.md` |
| Demo-klant (bewijs, geen echte klant) | `product/chatbot/customers/demo-bakkerij/` |

## C. Alien / AB Uitvaartzorg: de klant

Alien's spullen leven op **vijf plekken** (bewust — config vs. deploy vs. docs vs. bron vs. live):

| # | Wat | Locatie | Eigen van |
|---|---|---|---|
| 1 | Klant-config in het product | `product/chatbot/customers/ab-uitvaartzorg/` | PrimeCircle-repo |
| 2 | Deploybaar pakket (site+chat+dashboard) | `clients/ab-uitvaartzorg/deploy/` = **git-repo `CryptoWesAI/ABUitvaart`** (parent negeert deze map) | privé ABUitvaart-repo |
| 3 | Klant-specifieke docs | `clients/ab-uitvaartzorg/docs/` (spec, kennisbank, privacy-alinea, QA-testscript, discovery, WhatsApp-vragenlijst, Fase B-discovery) | PrimeCircle-repo |
| 4 | Website-bron (27 pagina's NL+EN) | `C:\Users\wfvis\Documents\PrimeCircle\` (los, buiten deze workspace; kapotte `.git`) | buiten de repo |
| 5 | Live productie | VPS `/opt/ab-uitvaartzorg` → `https://ab.primecircle.cloud` | Hostinger VPS |

## Grensgevallen (goed om te weten)

- **`docs/offers/aanbod-uitvaartniche.md`** is **strategie** (wig→motor-model), niet
  Alien-specifiek → blijft bij PrimeCircle (A), niet bij de klant.
- **`product/chatbot/customers/ab-uitvaartzorg/`** is Alien's data, maar leeft *in* het
  product omdat de generieke server het bij deploy inleest.
- **Nieuwe (trade-)klant** = nieuwe map `clients/<naam>/` met dezelfde opzet
  (`deploy/` + `docs/`), en een klant-config onder `product/chatbot/customers/<naam>/`.

## Bouw/deploy-keten (paden na de herstructurering)

`clients/ab-uitvaartzorg/deploy/assemble.mjs` leest uit `product/chatbot/` (via
`../../../product/chatbot`) + de website-bron in Documents, en schrijft `deploy/app` +
`deploy/site`. Daarna `bash clients/ab-uitvaartzorg/deploy/deploy-to-vps.sh`. Getest
na de verhuizing (2026-07-16): 27 pagina's, widget correct ingebed.
