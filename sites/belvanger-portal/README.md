# Belvanger klantdashboard (MVP)

Dit is het afzonderlijke, multi-tenant klantdashboard van Belvanger. Het interne VPS-beheerpaneel wordt hiervoor niet hergebruikt.

## Wat het dashboard meet

- gemiste oproepen;
- verzonden en afgeleverde sms-berichten;
- ontvangen sms- en e-mailreacties;
- website- en chatbotaanvragen;
- contacten die nog opvolging nodig hebben;
- een gezamenlijke tijdlijn per contact.

Het dashboard claimt geen daadwerkelijk gewonnen klus of omzet: de klant bepaalt zelf de
praktische status van een contact (`new`, `follow_up`, `contacted` of `closed`). Wel toont het
Overzicht-tabblad een expliciet als schatting gelabelde "Deze periode bespaard"-widget:
(opgevangen gemiste oproepen deze periode) × (gemiddelde klus-waarde) × 60%. De 60% is
dezelfde gedocumenteerde aanname als de rekenmachine op belvanger.nl ("~60% van gemiste
belletjes = echte klus-kans"). Gemiddelde klus-waarde is een door platform_admin instelbaar
veld per klant (`tenants.avg_job_value`); zolang die niet is ingesteld valt de widget terug op
een indicatieve default van €250 en zegt de ondertekst dat expliciet.

## Partners en doorzetten

Op het Contacten-tabblad kan een klant zijn eigen "achterban" bijhouden (naam +
contactgegevens) en een lead die hij zelf niet kan oppakken handmatig doorzetten
naar een van die partners, via een knop in het contactdetail. Bewust geen
automatische matching/routing: de klant kiest zelf, per lead. Doorzetten
schrijft alleen een zichtbaar, tijdgestempeld dashboardrecord
(`contact.referred`-event + `referred_partner_id`/`referred_at` op het
contact) — er wordt nog niets automatisch naar de partner of de beller
verstuurd, dat is een aparte, nog te maken beslissing over toestemming en
notificatie. Zie ook de servicebelofte-tekst in
`docs/offers/belvanger-servicebelofte-copy-2026-07-24.md`, bedoeld om dit
richting de eindklant van de tenant te communiceren op diens eigen website.

## Bewijslog

Op het Overzicht-tabblad staat, onder een inklapbare "Bekijk het bewijs"-knop, een
chronologische Bewijslog: de eigen `call.missed`- en `sms.outbound`-events van de tenant met
tijdstempel (`GET /api/proof-log`, zelfde `range`-parameter en tenant-scoping als
`/api/summary`). **Let op, dit klopt nog niet in de praktijk.** Het n8n-eventcontract (zie `n8n/README.md`,
workflow 1) gaat ervan uit dat `call.missed` pas wordt geschreven nadat de automatische sms
is verstuurd, waardoor elke `call.missed` "per definitie opgevangen" zou zijn. De feitelijke
implementatie werkt anders: workflow 1 is een **poller** die elke minuut de Twilio-API
uitleest en `call.missed` schrijft ongeacht of er een sms uitging. De automatische sms komt
uit een **Twilio Studio Flow** (het `voice_url` van het nummer), niet uit n8n.

Gevolg, vastgesteld op 2026-07-27: er staan `call.missed`-events in de database zonder
bijbehorende `sms.outbound`, terwijl Twilio die sms'jes wél had afgeleverd. Oorzaak is het
filter in de code-node "Maak sms-berichten klaar", dat op `message.from === testNumber`
matcht terwijl de Studio Flow verzendt vanaf de alfanumerieke afzender `Belvanger`. Die
`continue` laat geen spoor achter, dus het verlies is onzichtbaar.

**Zolang dit niet is opgelost, mag "opgevangen" niet als bewijs aan een klant worden
gepresenteerd.** Twee dingen moeten daarvoor gebeuren: verzenden vanaf het Twilio-nummer in
plaats van een alfanumerieke afzender, en het importfilter hoorbaar laten falen in plaats van
stil overslaan. Zie `n8n/README.md` voor de koppelstappen per klant. De lijst koppelt een
gemiste oproep niet 1-op-1 aan "zijn" sms (ze delen geen betrouwbare gezamenlijke
`external_id`); de chronologische volgorde is voldoende om de belofte te bewijzen dat het
vangnet als geheel werkt.

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

## Installeerbare app en meldingen

Het dashboard is ook een Progressive Web App: een icoon op het beginscherm, volledig
scherm zonder adresbalk, een nette offline-pagina, en pushmeldingen zodra er een oproep
gemist wordt. Op het Overzicht-tabblad staat daarvoor bovenaan een kaart met
"Zet meldingen aan" plus een testknop, want of meldingen doorkomen hangt af van het
batterijbeheer van dat specifieke toestel en is niet te beredeneren.

Diezelfde PWA is verpakt als **Trusted Web Activity** in `android/`, zodat hij als echte
app in de Google Play Store kan. Er is géén frontend geport: de app draait de bestaande
site, dus elke wijziging aan het dashboard gaat serverside mee zonder nieuwe upload en
zonder store-review.

Web Push is zonder npm-dependency geïmplementeerd in `src/webpush.js` (dezelfde
dependency-arme lijn als de eigen SMTP-client), en gevalideerd tegen het officiële
testvector uit RFC 8291 Appendix A.

**De volledige route naar de Play Store, inclusief wat alleen de founder kan doen en een
lijst gotchas, staat in [`ANDROID.md`](ANDROID.md).**

## Lokale bestanden

- `src/server.js`: API, authenticatie, ingest en statische server;
- `src/schema.sql`: tenant-, gebruiker-, sessie-, contact-, event- en pushtabellen;
- `src/webpush.js`: Web Push (RFC 8188/8291/8292) op `node:crypto`, zonder dependency;
- `src/push-payloads.js`: welke events een melding geven en wat er letterlijk in staat;
- `public/`: responsive klantinterface, plus de PWA-laag (`manifest.webmanifest`,
  `sw.js`, `push.js`, `offline.html`, `icons/`);
- `android/`: het Trusted Web Activity-project voor de Play Store;
- `scripts/generate-vapid-keys.mjs`: VAPID-sleutelpaar voor meldingen;
- `scripts/make-icons.mjs`: alle iconen (PWA én Android) uit `public/favicon.svg`;
- `n8n/README.md`: precieze koppelroute per bron;
- `tests/smoke.mjs`: end-to-end API- en deduplicatietest;
- `tests/webpush-rfc8291.mjs`: conformiteitstest van de pushcrypto (`node tests/webpush-rfc8291.mjs`);
- `tests/inbound-push.mjs`: welke events melden, en wat er wel/niet aan klantgegevens in de melding staat;
- `tests/preview-server.mjs`: veilige visuele preview met uitsluitend fictieve data
  (`PREVIEW_PUSH=1` toont ook de meldingenkaart).

## Productie

De private stagingversie luistert alleen op `127.0.0.1:8096` op de VPS. Publiceer hem pas achter HTTPS nadat het dashboarddomein, DNS en de eerste klantaccounts zijn gekozen.
