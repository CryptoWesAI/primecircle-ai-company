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
3. n8n stuurt via Twilio de afgesproken sms naar de beller.
4. n8n schrijft `call.missed` naar het dashboard.
5. n8n schrijft de verzonden sms als `sms.outbound` naar het dashboard.
6. Twilio stuurt latere sms-statussen naar de aparte statusworkflow.

Als de sms nu buiten n8n wordt verzonden, blijft stap 1 hetzelfde en registreert de bestaande verzender zijn MessageSid via de ingestworkflow.

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

## Wat per klant configureerbaar blijft

- tenantcode;
- Twilio-nummer en credentials;
- IMAP-mailbox en credentials;
- website/chatbot webhookbron;
- sms-tekst en openingstijden;
- gebruikersaccounts voor het dashboard.

De workflowstructuur blijft universeel; alleen deze credentials en klantinstellingen verschillen.
