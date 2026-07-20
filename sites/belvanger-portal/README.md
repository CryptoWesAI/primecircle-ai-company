# Belvanger klantdashboard (MVP)

Dit is het afzonderlijke, multi-tenant klantdashboard van Belvanger. Het interne VPS-beheerpaneel wordt hiervoor niet hergebruikt.

## Wat het dashboard meet

- gemiste oproepen;
- verzonden en afgeleverde sms-berichten;
- ontvangen sms- en e-mailreacties;
- website- en chatbotaanvragen;
- contacten die nog opvolging nodig hebben;
- een gezamenlijke tijdlijn per contact.

Het dashboard claimt bewust geen gewonnen klus of omzet. De klant bepaalt zelf alleen de praktische status: `new`, `follow_up`, `contacted` of `closed`.

## Systeemcheck (platform_admin)

Naast de passieve `last_event_at`-status uit de ingest-flow heeft de admin ("Systeemcheck"-
tabblad, alleen zichtbaar voor `platform_admin`) een knop "Alles controleren" die per actieve
klant drie dingen **actief** bevraagt:

- **Twilio**: bestaat het gekoppelde nummer nog onder het Twilio-hoofdaccount, en heeft het
  een voice-koppeling?
- **Website**: reageert het gekoppelde domein (`tenants.website_domain`) op HTTPS?
- **n8n**: staat de bijbehorende workflow nog op actief, via de n8n REST API? Elke klant
  heeft één workflow per kanaal (twilio/website/email), dus het workflow-ID staat per
  kanaal in `tenant_integrations.config->>'n8n_workflow_id'`, niet op tenant-niveau.

De check per kanaal is een combinatie: "Telefoon en sms" = Twilio-nummer + de
Twilio-n8n-workflow; "Website" = domein-bereikbaarheid + de website-n8n-workflow; "E-mail"
= alleen de e-mail-n8n-workflow (de mailbox zelf staat buiten ons beheer). Groen/geel/rood/
niet-gekoppeld per kanaal, plus hoe lang geleden het laatste event binnenkwam.

Vereist `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN` en `N8N_API_URL`/`N8N_API_KEY` in `.env`;
ontbreken die, dan geeft de check nette "unknown"-status i.p.v. te crashen. Website-domein
stel je in via "Website-domein instellen"; de drie workflow-ID's via "n8n-workflows
koppelen", beide op de klantkaart (Klanten-tab).

## Architectuur

```text
Website ─┐
Twilio ──┼─> n8n (ontvangen, omzetten, routeren) ─> ingest API ─> PostgreSQL ─> dashboard
E-mail ──┘
```

n8n is de integratielaag en niet de database. Alle bronnen worden in n8n omgezet naar hetzelfde eventcontract. De ingest API dedupliceert gebeurtenissen en koppelt ze op telefoonnummer/e-mailadres aan een contact.

## Lokale bestanden

- `src/server.js`: API, authenticatie, ingest en statische server;
- `src/schema.sql`: tenant-, gebruiker-, sessie-, contact- en eventtabellen;
- `public/`: responsive klantinterface;
- `n8n/README.md`: precieze koppelroute per bron;
- `tests/smoke.mjs`: end-to-end API- en deduplicatietest;
- `tests/preview-server.mjs`: veilige visuele preview met uitsluitend fictieve data.

## Productie

De private stagingversie luistert alleen op `127.0.0.1:8096` op de VPS. Publiceer hem pas achter HTTPS nadat het dashboarddomein, DNS en de eerste klantaccounts zijn gekozen.

