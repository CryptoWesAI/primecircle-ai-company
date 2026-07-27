# CURRENT_STATE

## Objective

Build a managed AI automation business that can initially be operated by one founder and later scale into a platform company.

## Current Stage

First build live (AB Uitvaartzorg) → validating a niche pivot to local trades.

First customer: AB Uitvaartzorg (founder's schoonmoeder, Alien Bisschop —
uitvaartonderneming in Steenwijkerwold). First build: a knowledge-grounded,
bilingual (NL+EN) AI chat assistant, embedded on all 27 pages of her website.
**Working end-to-end** via OpenRouter (`google/gemini-2.5-flash-lite`) — live-tested:
grounded costs, safe escalation on grief input, no invented prices, EN steering.
**LIVE on HTTPS (2026-07-14):** the whole stack (NL+EN website + config-driven
chat + token dashboard) runs as one isolated non-root Docker container on the
founder's Hostinger VPS (`root@31.97.123.34`, `/opt/ab-uitvaartzorg`, restart
unless-stopped), served over **HTTPS at `https://ab.primecircle.cloud`** via the
VPS's existing Traefik (Let's Encrypt cert, HTTP→HTTPS redirect). Raw port 8091
is NOT published anymore — access is HTTPS-only. Staging domain `primecircle.cloud`
(free 1st year, claimed as VPS hostname; renews ~₹2536 on 2027-06-18 — auto-renew
still ON, disabling it was blocked as a financial action, founder to toggle in
hPanel). Dashboard token rotated; value only in gitignored `.env`. Verified
end-to-end incl. live OpenRouter chat over HTTPS.
Since deploy (2026-07-15/16): **dashboard v2** live — website visitors + chatbot
usage, fully anonymized (no IP/UA; daily-rotating hashed visitor id; bot filter),
site-styled + auto-refresh + "In één oogopslag" summary. **EU AI Act Art. 50
disclosure baked into the shared widget** (opening notice + persistent "AI" badge +
clear styling — every customer inherits it; see `docs/compliance/ai-transparantie-art50.md`).
Alien's project pushed to **private `CryptoWesAI/ABUitvaart`** (66 files, secrets
excluded/verified). Domain auto-renew: founder set a WhatsApp reminder instead of
disabling (keeps the keep/stop choice open). Before pointing Alien's REAL domain at
it: Alien's sign-off on tone/boundaries, paste the privacy paragraph into the live
`privacy-statement.html`, OpenRouter data-policy check.
Note: the VPS's other project claims the apex `primecircle.cloud`/`www` in Traefik
and its ACME fails — not ours (we only use the `ab.` subdomain).
See `clients/ab-uitvaartzorg/deploy/README.md` and `docs/decisions/DECISIONS_LOG.md`.

## Strategic direction (pivot under validation, 2026-07-16)

Objective niche analysis concluded the winnable funeral segment (solo/zzp) is too
LOW-VOLUME to sustain a high-value retainer (see `docs/research/uitvaartniche-marktonderzoek.md`).
**Leading direction: a done-for-you "mis nooit meer een klant" service for local
trades** (installateurs/loodgieters — huge TAM, cash-rich, poorly digitized; missed
call = lost €100-1200 job). Wedge = missed-call → text-back / 24-7 lead capture; the
pitch is ROI-arithmetic (suits the founder's selling weakness). AB Uitvaartzorg stays
a reusable chatbot **reference case**, not the growth market. Model = done-for-you
(build+run+maintain; sell outcome, not software). Financials + stack + MVP recipe:
`docs/research/niche-vergelijking-lokaal-mkb.md`, `docs/offers/aanbod-uitvaartniche.md`,
`docs/build/mvp-missed-call-textback.md`. **Current step: validate-before-build** — a
casual discovery conversation with a warm trade contact (who is overbooked → use as
referral bridge to hungry prospects, not customer #1), THEN build MVP v0.
(Fase B funeral supplier-ordering/invoicing app is deprioritized behind this.)

## Immediate Goal

Replace employment income through predictable recurring revenue.

## Principles

- Founder Time first.
- Business before perfection.
- Generic core, configurable verticals.
- Use existing platforms before building custom software.

## Candidate Stack

Oriented to the trades "never miss a lead" direction, EU-clean on the owned VPS
(Buy → Integrate → Configure → Automate → Build):

- **n8n** — orchestration/glue (self-host on VPS)
- **Bird (ex-MessageBird)** — NL telephony/SMS/WhatsApp, EU data (Twilio for the
  fastest throwaway MVP — native Studio flow + n8n node)
- **OpenRouter** — chatbot/LLM (lead capture; reuse existing config-driven widget)
- **NocoDB / Baserow** — CRM / lead store (self-host)
- **Retell AI** — Dutch voice agent (LATER, after validation)
- **Cal.com** — booking (optional); **Mollie** — payments (EU)
- VPS + Docker + Traefik (owned infra)
- Alternative "Buy" all-in-one: **GoHighLevel** (agency platform, missed-call-text-
  back built in) — US-centric (A2P/GDPR/WhatsApp friction); steal its wedge, not the lock-in.

These are candidates, not final decisions.

## Next Milestone

- [x] Create GitHub repository — `github.com/CryptoWesAI/primecircle-ai-company`
- [x] Finalize PAOF structure — see `docs/`, `roadmap/LEARNING_ROADMAP.md`, `workflow/DEV_WORKFLOW.md`, `.claude/skills/`
- [x] First build live (AB Uitvaartzorg chatbot + dashboard, HTTPS, private repo, Art. 50 disclosure) — reference case done
- [ ] **Validate the trades wedge** — one casual discovery conversation with a warm/hungry trade contact (crux: missed calls/week × job value × willingness-to-pay). Script ready. THEN build MVP v0 (`docs/build/mvp-missed-call-textback.md`). Use the `opportunity-check` skill for any further niche/offer decisions.

### Belvanger klantdashboard als Android-app (2026-07-25)

Route gekozen na ADHD-onderzoek (`docs/research/belvanger-android-app-adhd-onderzoek-2026-07-25.md`):
**PWA-first, dan Trusted Web Activity**. Geen frontend geport, geen framework of bundler
toegevoegd, en app-versie 1.0 blijft 1.0 omdat elke UI-wijziging serverside meegaat
zonder store-review. Geverifieerd: TWA-op-een-echte-PWA is Google's eigen route langs
beleid 4.3, waar een WebView-wrapper juist op wordt afgekeurd.

**Gebouwd en lokaal geverifieerd** in `sites/belvanger-portal/`: PWA-laag (manifest,
service worker, offline-pagina, iconen uit één generator), Web Push zonder
npm-dependency (`src/webpush.js`, getest tegen RFC 8291 Appendix A), meldingen-UI met
testknop (visueel geverifieerd op 390px en 1440px, geen overflow/consolefouten),
`push_devices`-tabel, VAPID-routes, verzendhook op `call.missed` en `website.lead`,
`/.well-known/assetlinks.json` uit env, het TWA-project in `android/`, en een
cloud-build (`.github/workflows/belvanger-android.yml`) die zonder Android Studio of Mac
een ondertekende `.aab` oplevert.

**Besluit founder, 2026-07-25: de Play Store is geparkeerd.** Leveringsmechanisme is de
**geïnstalleerde PWA op het beginscherm**, niet een app in de store. Reden: de PWA geeft
de vakman 100% van de functionele waarde en dekt gratis ook iPhone-gebruikers, terwijl de
store alleen vindbaarheid toevoegt tegen permanente onbetaalde onderhoudslast. Het
TWA-project en `.github/workflows/belvanger-android.yml` blijven staan als slapende
optie: die workflow start alleen handmatig, dus er gaat nooit per ongeluk iets naar
Google. Route staat compleet in `ANDROID.md` mocht een klant er ooit om vragen.

**Let op, dit lost een bookmark niet op:** iOS Safari geeft Web Push **uitsluitend** aan
PWA's die op het beginscherm zijn geïnstalleerd. Op Android werkt push ook in een gewone
tab, en is installeren winst op weergave (volledig scherm, eigen icoon, offline).
Klanten moeten dus door "App installeren" worden geleid, niet door "bookmark maken".

**LIVE sinds 2026-07-25** op `https://dashboard.belvanger.nl` (VPS `/opt/belvanger-portal`,
Traefik + Let's Encrypt). Geverifieerd na deploy: `manifest.webmanifest` met het juiste
content-type, `sw.js` met `no-cache` + `Service-Worker-Allowed`, iconen als `image/png`,
`push_devices`-tabel aangemaakt, en in een echte browser een **geactiveerde service
worker** op scope `/`. VAPID-sleutels staan in de gitignored `.env` op de VPS
(voor `PUSH_INCLUDE_CALLER` zie punt 3 hieronder). Tijdens de deploy nog een
latente bug gefixt: `serveStatic` gaf 404 op elk HEAD-verzoek, dus ook op `/`, wat elke
uptime-monitor als "site down" had gelezen.

**Bewezen op een echt toestel:**

1. **Testmelding aangekomen** (2026-07-25). Dat valideerde het grootste technische risico:
   de zelfgebouwde Web Push-crypto in `src/webpush.js` wordt niet alleen door het
   RFC 8291-testvector geaccepteerd maar ook door de echte push-dienst, en door de browser
   ontcijferd. Er is geen tweede implementatie die ons corrigeert, dus dit was de open vraag.
2. **Doze-test geslaagd** (2026-07-27). Na een uur met het scherm uit kwam de testmelding
   alsnog aan, dus OEM-batterijbeheer knijpt de bezorging op dit toestel niet. Nuance: dit is
   **een** toestel. Xiaomi, Oppo en Samsung knijpen agressiever, dus de Doze-test staat als
   verplichte stap in de koppelchecklist (`sites/belvanger-portal/n8n/README.md`). De
   sms-escalatieladder blijft nuttig maar is geen voorwaarde meer om te kunnen leveren.
3. **`PUSH_INCLUDE_CALLER=true` live** (founder-besluit 2026-07-25). De melding bevat het
   nummer van de beller plus een "Bel terug"-knop. Verdedigbaar omdat de payload
   end-to-end versleuteld is (RFC 8291) met sleutels die alleen het toestel van de klant
   heeft, en het de eigen leaddata van de klant naar zijn eigen toestel betreft.
   Terugdraaien is een regel in de VPS-`.env` plus een herstart.
4. **Installeer-affordance gebouwd, Android only** (2026-07-25), gedreven door
   `beforeinstallprompt`; alle drie de toestanden geverifieerd op 390px.
5. **Meldingen op inkomende reacties live** (2026-07-25): `sms.inbound`, `email.inbound` en
   `chat.lead`, met `tests/inbound-push.mjs` gedraaid tegen de gedeployde broncode.

**Nog open:**

- **De "Bel terug"-knop is ongetest.** Het pad `notificationclick` → `/?call=<nummer>` →
  `location.href = tel:` is nog nooit op een echt toestel gelopen, en dat is het stuk met de
  meeste kans op een subtiele fout over Android-versies heen. Testen vergt een
  `call.missed`-event in de productiedatabase (`tests/cleanup-test-data.sql` bestaat).
- **De echte Chrome-installatieprompt is nog niet op een toestel gezien.**
- **iOS krijgt niets.** Safari geeft Web Push uitsluitend aan PWA's op het beginscherm en
  heeft geen installatie-API, dus de installeerkaart blijft daar verborgen. Een
  iPhone-vakman krijgt daardoor geen enkele melding. Bewust uitgesteld (founder-besluit).
- **De sms-keten klopt nog niet** (diagnose 2026-07-27). De automatische sms gaat uit vanaf
  een alfanumerieke afzender in plaats van vanaf het nummer, waardoor de beller niet kan
  antwoorden en het n8n-importfilter de sms stil overslaat. Bewust zo in de testopstelling;
  het echte NL-nummer komt met klant #1. Volledige diagnose in
  `docs/decisions/DECISIONS_LOG.md`, de stappen in de koppelchecklist.

**Bewust uitgesteld:** de sms-terugval als een pushmelding niet aankomt. Ontworpen, niet
gebouwd, omdat elke terugval Twilio-geld per bericht kost en dat een beslissing over
klantkosten is. `push_devices.failure_count`/`last_success_at` is er als storingssignaal, en
de e-mailmelding blijft als vangnet staan.

`TWA_*`-variabelen en de assetlinks-route zijn niet nodig zolang de Play Store geparkeerd
blijft (ze geven netjes 404 als ze leeg zijn).
