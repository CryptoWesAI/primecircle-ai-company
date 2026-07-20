# Deploy & go-live — AB Uitvaartzorg chatbot

Van lokaal prototype naar live op de website. Volgorde: **eerst goedkeuren,
dan deployen, dan pas insluiten op de site.** Niets hiervan is onomkeerbaar,
maar in een rouwcontext gaat zorgvuldigheid vóór snelheid.

## Overzicht

```
[bezoeker op de site]
   │  widget.js (ingesloten op de site)
   ▼
POST https://<endpoint-host>/api/chat   ── CORS ──▶  [Node-endpoint op Hostinger]
                                                        │  system prompt + kennisbank
                                                        ▼
                                                   [Anthropic API — Sonnet 5]
```

De API-sleutel staat **alleen** op het endpoint (Hostinger), nooit in de site.

## Stap 1 — Endpoint deployen (Hostinger Node)

De candidate-hosting is Hostinger's Node.js-hosting (past bij de Hostinger-first
lijn). Kort:

1. Maak een zip van de map `chatbot/` **zonder** `node_modules/` en `.env`.
2. Deploy als Node.js-applicatie op Hostinger; startcommando: `node server.js`.
3. Zet de omgevingsvariabelen op de host:
   - `OPENROUTER_API_KEY` = je sleutel (openrouter.ai/keys)
   - `OPENROUTER_MODEL` = `google/gemini-2.5-flash-lite` (of een ander model)
   - `ALLOWED_ORIGIN` = `https://abaandachtenbetrokkenheiduitvaartzorg.nl`
   - `PORT` wordt meestal door Hostinger zelf geïnjecteerd (de server leest die).
   (Geen `npm install` nodig — het endpoint heeft geen dependencies.)
4. Noteer de publieke URL van het endpoint, bv. `https://chat.<...>.nl`.

> Ik (Claude) kan de Hostinger-deploy mét de MCP-tools voor je uitvoeren zodra
> je daar akkoord voor geeft — het is een naar-buiten-gerichte actie, dus dat
> doe ik niet zonder jouw go.

## Stap 2 — Widget op de site (al gedaan)

De site (`C:/Users/wfvis/Documents/PrimeCircle`, NL in de root + EN in `en/`) is
al aangesloten met `site-integration/apply.mjs`. Dat script:

1. **kopieert** het widget mee de site in: `assets/ab-chat.js` + `assets/ab-chat.css`
   (de canonieke bron blijft `chatbot/public/`), en
2. zet één regel vóór `</body>` op elke pagina, met de juiste taal en een
   relatief pad:

```html
<!-- NL-pagina's -->  <script src="assets/ab-chat.js" data-ab-chat data-lang="nl" defer></script>
<!-- EN-pagina's -->  <script src="../assets/ab-chat.js" data-ab-chat data-lang="en" defer></script>
```

Omdat het widget nu **met de site meekomt**, verschijnt de knop
("Stel een vraag" / "Ask a question") zodra je een pagina opent — **ook zonder
draaiend endpoint**. Alleen het daadwerkelijke chatten gebruikt het endpoint; is
dat niet bereikbaar, dan valt de chat netjes terug op "bel Alien".

De endpoint-URL wordt bij het kopiëren in `ab-chat.js` gezet (standaard
`http://localhost:3100`).

**Van host wisselen (lokaal → productie)** — de website-map is géén geldige
git-repo, dus gebruik het script als aan/uit- en resync-knop:

```bash
cd chatbot/site-integration
node apply.mjs add https://<endpoint-host>   # herkopieert de assets met de productie-host
```

`node apply.mjs remove` is je volledige terugdraai-knop: het verwijdert zowel de
embed-regels als de gekopieerde `assets/ab-chat.*`-bestanden. Draai `apply.mjs add`
opnieuw telkens nadat je het widget in `chatbot/public/` hebt aangepast, om de
site-kopie te synchroniseren.

## Stap 3 — Go-live checklist (allemaal afvinken vóór livegang)

- [ ] **Alien heeft de toon en de spoedgrens goedgekeurd** (test o.a. "mijn man
  is net overleden" → moet rustig doorverwijzen naar bellen). Zie het
  test-script `clients/ab-uitvaartzorg/docs/chatbot-qa-testscript.md`.
- [ ] **Databeleid/verwerkersketen van OpenRouter (→ Google)** gecontroleerd en
  vastgelegd (zie `docs/paof/ai-governance-security.md`).
- [ ] **Privacyverklaring bijgewerkt** met de alinea uit
  `clients/ab-uitvaartzorg/docs/chatbot-privacy-alinea.md`.
- [ ] **`ALLOWED_ORIGIN`** staat op het site-domein (niet `*`).
- [ ] **Kennisbank compleet** — Aliens veelgestelde vragen toegevoegd aan
  `knowledge-base.md` (en de canonieke bron in `docs/offers/`).
- [ ] Endpoint bereikbaar en de chat geeft nette antwoorden op de testvragen.

## Later (na een geslaagde v1)

- Minimale, GDPR-veilige logging als je wilt meten hoeveel/welke vragen komen
  (vergt dan wél een bewaartermijn + aanpassing van de privacyverklaring).
- Streaming antwoorden voor een nog snappere ervaring.
- Engelse variant (de site heeft al `/en/`).
