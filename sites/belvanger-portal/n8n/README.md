# n8n-koppelingen voor Belvanger

## Hoofdregel

Elke workflow eindigt met één HTTP Request naar de dashboard-ingest API:

```text
POST http://belvanger-portal:8096/api/ingest
X-Ingest-Key: opgeslagen als n8n-credential
X-Tenant: belvanger
Content-Type: application/json
```

De portal en n8n moeten daarvoor samen op een intern Docker-netwerk zitten. Stel de ingest key in als credential of secret; zet hem nooit letterlijk in een workflow-export.

## Universeel eventcontract

```json
{
  "source": "twilio",
  "event_type": "sms.inbound",
  "external_id": "SMxxxxxxxx",
  "occurred_at": "2026-07-19T10:15:00Z",
  "contact": {
    "name": "Optioneel",
    "company": "Optioneel",
    "phone": "+31612345678",
    "email": "optioneel@example.nl"
  },
  "message": {
    "direction": "inbound",
    "status": "received",
    "subject": null,
    "preview": "Ja, bel mij vanmiddag maar.",
    "provider_message_id": "SMxxxxxxxx"
  },
  "metadata": {}
}
```

Toegestane MVP-events: `call.missed`, `sms.outbound`, `sms.status`, `sms.inbound`, `email.inbound`, `website.lead`, `chat.lead` en `contact.status`.

## Workflow 1 — gemiste oproep en automatische sms

1. Een Twilio Voice status callback meldt `no-answer`, `busy` of `failed` aan een n8n Webhook.
2. n8n controleert of de combinatie `CallSid + status` al verwerkt is.
3. n8n genereert een kort, uniek vangnet-token (bijv. 8 tekens, willekeurig of afgeleid van `CallSid`).
4. n8n stuurt via Twilio de afgesproken sms naar de beller, met daarin een link naar de website van
   de klant met dat token als queryparameter (zie "Vangnet-link naar de website" hieronder).
5. n8n schrijft `call.missed` naar het dashboard, met het token in `metadata.vangnetToken`.
6. n8n schrijft de verzonden sms als `sms.outbound` naar het dashboard.
7. Twilio stuurt latere sms-statussen naar de aparte statusworkflow.

Als de sms nu buiten n8n wordt verzonden, blijft stap 1-2 hetzelfde en registreert de bestaande
verzender zijn MessageSid + het gegenereerde token via de ingestworkflow.

### Standaard sms-tekst

> Sorry, we misten je belletje! We bellen je zo snel mogelijk terug. Optioneel: vertel je vraag
> alvast hier, dan zijn we goed voorbereid: {{vangnet_link}}

**Waarom sms en niet WhatsApp (of een andere app):** sms komt aan op elke telefoon, ongeacht merk,
besturingssysteem of of de beller WhatsApp (of iets anders) geïnstalleerd heeft. Geen aanname over
het toestel van de beller nodig — dat maakt sms het enige kanaal dat gegarandeerd bij iedereen
aankomt, en is ook een sterk verkoopargument richting de klant (zie de scripts in
`docs/offers/belvanger-voice-memo-scripts-2026-07-24.md`).

Belangrijk, en bewust zo gekozen: het terugbellen staat voorop en is niet afhankelijk van het
formulier. De link is expliciet gelabeld als "optioneel" — een extra manier om de klant zich
gehoord te laten voelen en het gesprek beter voor te bereiden, geen voorwaarde om geholpen te
worden. Sms-tekst en toon zijn per klant aanpasbaar (zie "Wat per klant configureerbaar blijft"),
maar de volgorde terugbellen-voorop-formulier-optioneel is de standaard voor elke nieuwe klant.

**De beller kan niet op deze sms reageren** (geen tweeweg-sms beschikbaar voor dit
afzendernummer/deze flow). Dit is precies waarom de link naar het contactformulier bestaat: het is
niet een alternatief naast "gewoon antwoorden", het is de enige manier waarop de beller zelf meer
context kan geven vóór het terugbelmoment. Ontwerp dus nooit een variant van deze flow die op een
inkomend sms-antwoord van de beller rekent; `sms.inbound`/Workflow 2 blijft bedoeld voor berichten
die los van dit specifieke vangnet-moment binnenkomen, niet als reactie erop.

### Vangnet-link naar de website

Doel: het effect van een gemiste oproep die daarna via de website wordt opgevolgd, moet zichtbaar
worden in het dashboard als één samenhangend verhaal, niet als toevallig twee losse events.

- De link in de sms wijst naar de bestaande contact-/vragenpagina van de klant, met het token als
  queryparameter: `https://<klantdomein>/?vangnet=<token>`. Geen aparte landingspagina nodig.
- Het contactformulier op de website leest die queryparameter (client-side, zelfde patroon als de
  verborgen `pagina`-velden op de bestaande Belvanger-formulieren) en stuurt het token mee als
  onderdeel van de formulierinzending naar de website-intakeworkflow.
- Workflow 4 neemt dat token over in `metadata.vangnetToken` van het geschreven `website.lead`-
  event (zelfde veldnaam als bij `call.missed`, zodat beide events op naam matchen).
- Het daadwerkelijk koppelen van twee events met hetzelfde `vangnetToken` aan dezelfde contact
  (in plaats van te vertrouwen op toevallig gelijk telefoonnummer/e-mailadres) gebeurt nog niet
  automatisch in de ingest-API — dat is een bewust nog niet gebouwde vervolgstap in
  `belvanger-portal`, pas de moeite waard zodra er een eerste klant met een echte n8n-workflow
  hierop draait. Tot die tijd is het token al wel aanwezig in de ruwe event-data (metadata is een
  vrij JSON-veld, geen schemawijziging nodig) en vertelt de tijdlijn van hetzelfde contact het
  verhaal ook zonder expliciete koppeling, zoals nu al bij de Bewijslog.

## Workflow 2 — inkomende en uitgaande sms-status

- Twilio Incoming Message Webhook → n8n Webhook → normaliseren → `sms.inbound`.
- Twilio Status Callback → n8n Webhook → normaliseren → `sms.status`.
- Gebruik `MessageSid + MessageStatus` als deduplicatiesleutel via `external_id` en status.
- Valideer Twilio-webhooks vóór productie. De dashboard-ingest key beschermt alleen het tweede traject, van n8n naar de portal.

## Workflow 3 — Hostinger e-mail

1. Voeg in n8n een IMAP Email Trigger toe voor de mailbox van de klant.
2. Laat de trigger alleen nieuwe inkomende berichten lezen.
3. Filter eigen afzenders, autoreplies en bulkmail om lussen te voorkomen.
4. Gebruik `Message-ID` als `external_id`.
5. Normaliseer afzender, onderwerp en een korte platte-tekstpreview naar `email.inbound`.

Mailboxwachtwoorden worden uitsluitend in n8n Credentials ingevoerd en horen niet in dit project of in exports.

## Workflow 4 — website en chatbot

- Contactformulier → n8n Webhook → spamcontrole/normalisatie → `website.lead`.
- Chatbot met bruikbare contactgegevens → dezelfde route als `chat.lead`.
- Verstuur alleen een event wanneer minimaal een telefoonnummer of e-mailadres bekend is.
- Gebruik de formulier- of chat-ID als `external_id`.
- Als de inzending een `vangnet`-queryparameter bevat (zie "Vangnet-link naar de website" bij
  Workflow 1): neem die waarde over als `metadata.vangnetToken` op het geschreven `website.lead`-
  event, zodat deze inzending later herkenbaar is als vervolg op een specifieke gemiste oproep.

## Wat per klant configureerbaar blijft

- tenantcode;
- Twilio-nummer en credentials;
- IMAP-mailbox en credentials;
- website/chatbot webhookbron;
- sms-tekst en openingstijden;
- of het contactformulier de `vangnet`-queryparameter ondersteunt (vereist een klein stukje
  client-side code op de website van de klant, zie Workflow 1 — nog niet standaard bij elke
  opgeleverde site, wel het streven voor nieuwe klanten);
- gebruikersaccounts voor het dashboard.

De workflowstructuur blijft universeel; alleen deze credentials en klantinstellingen verschillen.

---

## Koppelchecklist per klant

Afvinklijst voor het aansluiten van één nieuwe klant. Opgeschreven op 2026-07-27 na een
diagnose op de testopstelling waarin drie dingen tegelijk stuk bleken door één instelling.
De volgorde is bewust: elke stap is te controleren voordat de volgende erop bouwt.

Wat je nodig hebt voordat je begint: het eigen telefoonnummer van de klant, zijn domein,
en een gemiddelde klus-waarde (voor de bespaard-widget).

### A. Twilio-nummer

- [ ] **Nederlands nummer** (`+31`) met **voice én sms**. Geen `+1`-nummer: voor een
      Nederlandse vakman is dat een vertrouwensprobleem, en internationale afzenders naar
      NL-providers worden strenger gefilterd.
- [ ] `voice_url` op de Studio Flow die de gemiste oproep afhandelt.
- [ ] **Verzend vanaf het NUMMER, niet vanaf een alfanumerieke afzender-ID.** Dit is de
      instelling die op de testopstelling drie dingen tegelijk brak. Een alfanumerieke
      afzender (`Belvanger`) is éénrichtingsverkeer: de beller **kan niet antwoorden**, en
      NL-providers filteren niet-geregistreerde afzenders bij herhaling (Twilio-fout
      `30007 Carrier violation`).
- [ ] `sms_url` **niet** op `demo.twilio.com/welcome/sms/reply/` laten staan. Dat is de
      Twilio-standaard en die stuurt een demo-antwoord terug naar de klant van je klant.
- [ ] Handhaaf beide uitkomsten van een niet-opgenomen oproep. Op de testopstelling kwam
      `DialCallStatus` als **`busy`** binnen, niet als `no-answer`. Filtert de Studio Flow
      alleen op `no-answer`, dan gebeurt er niets.

### B. Doorschakelen bij de klant

- [ ] Voorwaardelijk doorschakelen (bij geen antwoord én bij in gesprek) van zijn eigen
      nummer naar het Twilio-nummer. Zie `docs/build/mvp-missed-call-textback.md`.
- [ ] Laat de klant het zelf bellen vanaf een ander toestel en controleer dat de oproep
      daadwerkelijk op Twilio landt.

### C. n8n

- [ ] Dupliceer workflow 1 en 2 voor deze klant (één workflow per kanaal, zie boven).
- [ ] **Werk het nummer bij in BEIDE code-nodes**: `Maak gemiste oproepen klaar` en
      `Maak sms-berichten klaar`. Het staat er hardcoded als `const testNumber = '...'`.
      Twee plekken, en één vergeten is precies de fout die niets kapot lijkt te maken.
- [ ] **Laat het importfilter luid falen.** Nu staat er `if (!inbound && !outbound) continue;`
      zonder spoor. Gevolg op de testopstelling: Twilio leverde 3 sms'jes af, het dashboard
      kende er 1, en dat was onzichtbaar. Log of markeer een niet-matchende sms in plaats van
      hem stil over te slaan.
- [ ] Zet het workflow-ID per kanaal in `tenant_integrations.config->>'n8n_workflow_id'`,
      anders kan de Systeemcheck de workflow niet controleren.

### D. Dashboard

- [ ] Klant + gebruiker aanmaken (Klanten-tab, `platform_admin`).
- [ ] `website_domain` en `avg_job_value` instellen op de klantkaart.
- [ ] Ingest-token per kanaal aanmaken en in de bijbehorende n8n-workflow zetten.
- [ ] Systeemcheck draaien ("Alles controleren") en op groen krijgen voor telefoon, website
      en e-mail.
- [ ] Let op: `PUSH_INCLUDE_CALLER` is een **server**-instelling, niet per klant. Staat hij
      aan, dan geldt dat voor alle klanten.

### E. Meldingen op de telefoon van de klant

Doe dit **samen met de klant tijdens de onboarding**, niet per instructie op afstand.

- [ ] Laat hem inloggen op `dashboard.belvanger.nl` en op "Zet op beginscherm" tikken.
- [ ] "Zet meldingen aan", en het systeemvenster accepteren.
- [ ] "Stuur testmelding". Komt hij binnen tien seconden.
- [ ] **De Doze-test:** telefoon een uur wegleggen met het scherm uit, daarna opnieuw een
      testmelding. Dit is de test die op Xiaomi, Oppo en Samsung faalt waar de eerste slaagt,
      en die je dus niet kunt overslaan. Faalt hij, zie de escalatieladder in
      `docs/research/belvanger-android-app-adhd-onderzoek-2026-07-25.md`.
- [ ] iPhone: meldingen werken daar **alleen** als de PWA op het beginscherm staat. Staat hij
      er niet op, dan krijgt de klant niets. Dit is nog niet opgelost, zie `CURRENT_STATE.md`.

### F. Eindtest, en dit is de acceptatietest

Pas als deze hele keten zichtbaar is, mag "opgevangen" als bewijs richting de klant.

1. [ ] Bel het eigen nummer van de klant vanaf een ander toestel en neem niet op.
2. [ ] Je ontvangt als beller binnen ongeveer een minuut de automatische sms.
3. [ ] **Antwoord op die sms.** Lukt dat niet, dan staat stap A3 nog verkeerd.
4. [ ] De klant krijgt een pushmelding van jouw antwoord, met een "Bel terug"-knop.
5. [ ] In het dashboard staat de volledige keten met tijdstempel:
       `call.missed` → `sms.outbound` → `sms.status` → `sms.inbound`.
6. [ ] De bewijslog op het Overzicht-tabblad toont die keten ook.

Ontbreekt stap 5 of 6 een schakel, dan is de bewijslog incompleet en klopt de belofte niet.
Ga dan terug naar C, niet naar A.
