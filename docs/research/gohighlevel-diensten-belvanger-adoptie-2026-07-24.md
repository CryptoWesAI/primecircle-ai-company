# GoHighLevel — selecteerbare diensten en wat Belvanger daarvan kan leren

Onderzoek uitgevoerd 2026-07-24, gericht op wat GoHighLevel (gohighlevel.com)
aan agencies/resellers aanbiedt, en wat daarvan realistisch is om over te nemen
voor Belvanger (solo-founder, nul klanten, bewust done-for-you in plaats van
een self-serve platform).

## GoHighLevel: selecteerbare diensten/modules

**Kernplatform (elk plan, vanaf $97/mnd)**
- CRM & pipelines — leadopvolging, deal-stages.
- Funnel- & websitebuilder — drag-and-drop landingspagina's, volledige sites, split-testing.
- Workflow automation — trigger-gebaseerde sequenties (bijv. "gemiste oproep → sms").
- Missed-call-text-back — automatische sms bij gemiste oproep, met kwalificatie en boekingslink.
- Reputation management — automatische reviewverzoeken naar Google/Facebook op het piekmoment (net na de klus).
- Conversation AI / Voice AI / Content AI / Funnel AI / Reviews AI — AI-laag over de hele suite.
- Unified conversations — sms, e-mail, WhatsApp, social DM's in één inbox.
- Calendars/booking, forms/surveys/quizzes, social media management, payments/invoicing, prospecting tool, custom dashboards/rapportage.

**Agency-specifieke laag**
- Sub-accounts — één losse "account" per eindklant (3 op Starter, onbeperkt vanaf Unlimited $297/mnd).
- Snapshots — een volledig geconfigureerde klantopzet (pipelines, workflows, funnels, e-mail/sms-templates, kalenders) die in seconden naar een nieuwe sub-account gekopieerd wordt; verkoopbaar via de App Marketplace.
- White-label / SaaS Mode (Agency Pro $497/mnd) — eigen merk over de hele software, eigen prijsstelling, automatische sub-account-creatie, rebilling van belwaarde met marge.
- Add-ons: white-label mobiele app ($497/mnd), branded client portal ($49/mnd per klant), SEO-module, HIPAA-compliance, dedicated e-mail IP's.

## Wat waardevol is om over te nemen (het concept, niet het platform)

1. **Snapshot-denken als eigen sjabloon-bibliotheek.** Intern (niet publiek
   verkoopbaar) een herbruikbare "Belvanger-basisopzet" per vakgebied
   (loodgieter, dakdekker, hovenier) bouwen: standaard site-structuur,
   standaard chatbot-kennisbank, standaard sms-flow. Hetzelfde idee als GHL's
   snapshot, maar als eigen efficiëntietool, niet als product dat klanten
   zelf beheren.
2. **Reputation management** sluit logisch aan bij het bestaande verhaal:
   automatisch een reviewverzoek sturen vlak na afronding van een klus, met
   simpele automation (n8n/Twilio + Google-reviewlink), geen heel platform
   nodig.
3. **Timing-triggers als principe.** GHL's kracht zit in "actie op het juiste
   moment" (piektevredenheid na een klus, gemiste oproep meteen opvolgen).
   Dat principe is al de kern van Belvanger's belofte en is de moeite waard
   om verder uit te breiden (zie ook de reputation-management-suggestie).
4. **Kern + optionele add-ons als prijsmodel-idee**, net als GHL's HIPAA/SEO-
   add-ons bovenop het kernabonnement: een toekomstige, simpele "kern +
   add-on"-structuur (bijv. extra taal, extra automatisering) zonder
   complexiteit voor Belvanger zelf te creëren.

## Wat expliciet niet past bij Belvanger's schaal/positionering

1. **Sub-accounts, white-label en SaaS Mode** — precies het self-serve
   platformmodel dat Belvanger bewust vermijdt. Vereist multi-tenant
   infrastructuur, billing-automatisering en support op schaal (50-200
   klanten) die één persoon niet kan onderhouden naast een baan.
2. **De App Marketplace / snapshots verkopen aan andere agencies** — een
   tweezijdig platformbusiness (agency-naar-agency), een heel ander
   businessmodel dan "ik lever een dienst aan één vakman".
3. **Volledig zelfbedienings-CRM/funnelbuilder voor eindklanten** — zodra de
   klant zelf pipelines, funnels en workflows kan bouwen, verschuift de
   belofte van "wij doen het voor je" naar "hier is gereedschap, doe het
   zelf". Ondermijnt Belvanger's kernonderscheid.
4. **Brede AI-suite (Conversation AI, Voice AI, Content AI, Funnel AI, Reviews
   AI) als één te onderhouden geheel** — GHL kan dit dragen met honderden
   engineers; voor een solo-founder te veel oppervlak om per klant te
   beheren en te debuggen. Beter: één scherp afgebakende AI-functie (de
   chatbot) heel goed doen.
5. **Automatische sub-account-creatie en marge-op-rebilling van
   telefonie/e-mail** — vereist schaal (tientallen klanten) om de
   operationele overhead te rechtvaardigen; bij 0 klanten vroegtijdige
   complexiteit.

## Kernconclusie

GoHighLevel is een self-serve platform-product voor agencies die zelf een
SaaS-business willen worden. Belvanger's positionering (done-for-you, solo,
klein en persoonlijk) is bijna het spiegelbeeld daarvan. De bruikbare lessen
zitten in de *concepten* (snapshot-hergebruik, timing-gedreven automatisering,
reviewbeheer, gelaagde pricing), niet in de *architectuur* (multi-tenant,
white-label, marketplace).

## Bronnen

- [HighLevel Pricing Plans & Features](https://www.gohighlevel.com/pricing)
- [GoHighLevel Snapshots: What They Are, How to Build Them and How to Sell Them](https://netpartners.marketing/gohighlevel-snapshots/)
- [Selling Snapshots on the HighLevel App Marketplace](https://marketplace.gohighlevel.com/docs/marketplace-modules/Snapshots/)
- [GoHighLevel SaaS Mode 2026: White-Label Growth](https://netpartners.marketing/gohighlevel-saas-mode-white-label-growth-the-complete-agency-pillar-guide/)
- [How to sell GoHighLevel to local businesses and build a scalable SaaS agency?](https://www.ghlexperts.com/agency-saas/sell-gohighlevel-to-local-businesses)
