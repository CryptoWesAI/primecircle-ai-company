# Weekend-MVP: "Mis nooit meer een klant" (missed-call → text-back)

> Doel: de kleinste werkende loop bouwen die de hele businesscase bewijst.
> Bewust **zonder AI, zonder voice**, die komen later. **Kanaal: WhatsApp naar de
> klant** (vertrouwen > SMS; zie hieronder). SMS alleen als interne rooktest.
> v0 = een middag (intern bewijzen). v1 = een weekend (WhatsApp, echte pilot).

## De loop die alles bewijst

```
Beller belt → vakman staat op de steiger, neemt niet op
   → na ~18 sec "geen gehoor"
   → automatisch WhatsApp naar de beller (geverifieerd bedrijfsprofiel):
     "Sorry, we misten je belletje! Waarmee kunnen we helpen?"
   → melding naar de vakman: "Gemiste call van 06-… om 14:22"
   → lead vastgelegd → vakman belt terug → klus die hij anders miste
```

Als dit één keer een echte lead vangt, is het model bewezen. De rest is dit kopiëren.

## Kanaalkeuze: WhatsApp naar de klant, SMS alleen intern (2026-07-16)

**Vertrouwen weegt zwaarder dan setup-snelheid.** SMS-vertrouwen daalt door smishing;
een SMS van een onbekend nummer voelt verdacht. WhatsApp toont een **geverifieerd
bedrijfsprofiel** (naam/logo) en is in NL hét kanaal — veel hogere open- en
reactieratio. Bij een eerste indruk (waar vertrouwen de conversie bepaalt) wint
WhatsApp. Daarom:
- **Klant-facing bericht = WhatsApp Business API** (geen SMS).
- **SMS = alleen interne rooktest** om te checken dat de belflow werkt — nooit naar een
  echte prospect.
- **Technische regel:** een gemiste *oproep* opent geen WhatsApp-venster → het eerste
  terug-appje is business-initiated → vereist **één goedgekeurde Utility-template**.
  Zodra de beller terug-appt, opent het 24-uursvenster → vrij verder praten.
- **Nummer:** gebruik de WhatsApp Business *API* (niet de gratis app — die is niet te
  automatiseren). Een apart zakelijk nummer met geverifieerd profiel houdt de privé-
  WhatsApp van de vakman gescheiden.
- **Doe dit vroeg:** Meta Business-verificatie + template-goedkeuring kosten een paar
  dagen. Start dat **parallel aan het validatiegesprek**: dan blokkeert het niets.

## Belangrijke keuze: begin op Twilio, niet Bird

Voor de **wegwerp-demo** telt maar één ding: hoe snel heb je een werkende loop.
- **Twilio** = snelst: visuele flow-builder (Studio), textbook missed-call-patroon, native n8n-node, gratis proeftegoed. VS-gehost.
- **Bird** = EU/NL-data, goedkopere SMS: maar minder kant-en-klaar. **Bewaar Bird voor de EU-schone productieversie** zodra een pilot "ja" zegt.

Laat de EU-vs-VS-keuze je weekend niet blokkeren: **demo op Twilio, migreer later naar Bird.**

## Kanaal-heroverweging: SMS-onder-bedrijfsnaam voor de PILOT (2026-07-18)

Na het opzetten bleek de productie-WhatsApp (Meta business-verificatie + template) te veel
frictie vóór validatie: Wesley schrijft zich pas in bij de KvK zódra hij z'n eerste paar
klanten heeft, en Meta wil bedrijfsgegevens. **Beslissing: de pilot draait op SMS met een
alfanumerieke afzender-ID (= de bedrijfsnaam), met een link naar de site.** WhatsApp blijft
de upgrade voor ná de eerste betalende klanten + KvK.

- **Afzender = bedrijfsnaam** (alfanumerieke sender ID), niet een nummer → dit is dé
  trust-fix die SMS bruikbaar maakt (anders = smishing-vorm). Eenrichting (geen replies) —
  prima, want we sturen naar de website.
- **Bericht mét link** naar de site (schoon domein, géén linkverkorter). Test-case wijst
  naar `belvanger.nl`; in de echte uitrol naar het domein van de klant (bv.
  `jansenloodgieters.nl`) — NIET belvanger.nl (dat is de verkooppagina voor vakmensen).
- **Website = conversie-hub** (formulier + WhatsApp-knop + e-mail bestaan al op de site;
  wijzen per klant naar de vakman zelf).
- **Testtekst:** "Hoi, je belde net Belvanger. We konden even niet opnemen, maar we bellen
  je zo snel mogelijk terug. Wil je je vraag alvast doorgeven? Dat kan op belvanger.nl"
- **Go-live-eisen (later, geen bouw-blokkade nu):** (1) Twilio uit trial halen
  (betaalmethode), (2) alfanumerieke afzender-ID registreren voor NL (formulier, ~dagen).
  Lichter dan WhatsApp/Meta, geen KvK nodig.
- **Trade-off eerlijk:** SMS heeft minder vertrouwen/merkherkenning dan WhatsApp (waarom we
  eerst WhatsApp kozen). De bedrijfsnaam-afzender + schone link + eerlijke tekst mitigeren
  dat; WhatsApp blijft de upgrade zodra het zich terugverdient.

## Interview-beslissingen founder (2026-07-18)

Vastgelegd na het interview met Wesley; deze overrulen twijfels hierboven.

1. **Belvangst = bestaand nummer overnemen via voorwaardelijk doorschakelen.** De vakman
   houdt zijn eigen (zakelijke) nummer; we schakelen alleen "geen gehoor / bezet" door
   naar het Belvanger-nummer. Later per klant wijzigbaar. → route = doorschakelen, niet
   een apart aan-te-bellen nummer.
2. **Klantkanaal = WhatsApp** (vertrouwen + merkherkenning), zoals in de doc.
   - ⚠️ **Afzender-nuance (belangrijk):** de WhatsApp komt **niet** vanaf de exacte cijfers
     van de vakman (één nummer = één WhatsApp-account; zijn nummer is al in gebruik voor
     zijn eigen WhatsApp). Het gaat vanaf een **apart Belvanger-/API-nummer met een
     geverifieerd bedrijfsprofiel** (naam + logo). De klant ziet de **naam en het logo**
     van het bedrijf — dáár zit de herkenning, niet in de cijfers.
   - **Meta-verificatie vs. geen KvK:** pilot kan op een niet-volledig-geverifieerd
     account (lager volume, genoeg om te bewijzen). Volledige verificatie (met KvK) is een
     opschaal-checkpoint, geen pilot-blokkade.
3. **Orkestratie = n8n self-hosted op de eigen VPS** (`n8n.primecircle.cloud`, Docker +
   Traefik, zoals de andere containers). **Geen** n8n Cloud-abonnement: €0 i.p.v.
   €20–50/mnd, data op eigen EU-VPS, en beheer is een leerdoel. → Stance: Configure.
4. **Terug-belbericht (Utility-template, `{{1}}` = bedrijfsnaam):**
   > Hoi 👋 Je belde net **{{1}}**. We konden je telefoontje helaas niet opnemen —
   > waarschijnlijk omdat we met de handen in het werk zaten. Laat je in een berichtje
   > weten waar we je mee kunnen helpen? Dan bellen we je zo snel mogelijk terug. Je
   > aanvraag staat genoteerd — je hoeft niemand anders te bellen.

   De slotzin houdt de klant warm en weg bij de concurrent (bewuste keuze).
5. **Lead landt bij:** melding naar de vakman (nummer + tijd + evt. het antwoord van de
   beller) zodat hij zelf terugbelt; simpel overzicht kan later. "Jij belt zelf terug"
   blijft de belofte (staat ook zo in de voorwaarden/knowledge base).

## Wat je nodig hebt

| Onderdeel | Tool | Kosten (MVP) |
|---|---|---|
| Telefoonnummer + belflow | Twilio (proeftegoed) | ~€1-2/mnd nummer + centen/bericht |
| Klant-facing kanaal | WhatsApp Business API via Twilio (+ Meta-verificatie + 1 Utility-template) | Twilio $0.005 + Meta-conversatiekosten (Utility = goedkoop) |
| Orkestratie (v1) | n8n, self-host op je VPS | €0 |
| Lead-opslag (v1) | NocoDB of Google Sheet | €0 |
| Melding naar vakman | WhatsApp / Telegram / e-mail | centen |

Totaal om het te bewijzen: **~€0-10.** (Meta-verificatie is gratis, kost alleen doorlooptijd.)

## v0: de interne rooktest (een middag, ZONDER code)

Doel: bewijs voor jezelf dat de belflow werkt. Hier mag je **SMS** gebruiken (snel,
geen Meta-verificatie nodig) — dit gaat naar jóúw eigen telefoon, niet naar een klant.

Puur in **Twilio Studio** (visuele drag-drop flow), geen n8n nodig:

1. Maak een Twilio-account, activeer proeftegoed, koop 1 nummer (NL of test).
2. Nieuwe Studio-flow, trigger **Incoming Call**:
   - Widget **Connect Call To** → je eigen mobiele nummer, **timeout ~18 sec**.
   - Op de uitgang **no-answer / busy / failed**:
     - Widget **Send Message** → naar de **beller** (`{{trigger.call.From}}`):
       *"Hoi! Sorry, we misten je belletje. Waarmee kunnen we je helpen? Reageer gerust op dit bericht, we bellen zo snel mogelijk terug. — [Bedrijf]"*
     - Widget **Send Message** → naar jezelf: *"📞 Gemiste call van {{trigger.call.From}}."*
3. Koppel de flow aan je nummer ("A call comes in" → Studio Flow).
4. **Test:** bel het nummer, neem niet op, kijk of de berichten binnenkomen.

Start **parallel** de Meta Business-verificatie + de Utility-template (paar dagen
doorlooptijd), zodat WhatsApp klaar is voor v1.

## v1: de eerste echte pilot (weekend)

Nu klant-facing → **WhatsApp** (het vertrouwenskanaal), niet SMS.

1. **Doorschakelen instellen** op de telefoon van de vakman: *voorwaardelijk*
   doorschakelen bij "geen gehoor / bezet" → jouw Twilio-nummer. (Per provider;
   meestal een GSM-code of in de belinstellingen.) Zo blijft zijn eigen nummer zijn
   nummer, en vangt jouw systeem alleen de gemíste calls.
2. **WhatsApp Business API** klaarzetten (Meta-verificatie uit v0 moet nu rond zijn):
   het terug-appje gaat via de **goedgekeurde Utility-template** vanaf het geverifieerde
   bedrijfsprofiel van de vakman.
3. **n8n erbij** (op je VPS): laat Studio bij een gemiste call een **webhook** naar
   n8n sturen. In n8n:
   - Stuur de beller de WhatsApp-template ("Sorry, we misten je belletje…").
   - Log de lead in **NocoDB** (nummer, tijd, evt. het antwoord van de beller).
   - Stuur de vakman een melding (WhatsApp/Telegram/e-mail).
   - Vang het **antwoord** van de beller (opent het 24u-venster) → mini-gesprek/doorsturen.
4. **Simpel overzicht**: hergebruik je bestaande dashboard of een NocoDB-view →
   "deze week X gemiste calls opgevangen".

## Instrumentatie & resultatendashboard ("meten = weten"): ontwerp vooraf

De klant wil straks zien wat Belvanger oplevert. Dat hero-getal ("opgevangen oproepen")
bestaat alleen als de utility het **vanaf dag één logt**. Dus: ontwerp nu, bouw het portaal
later. Bepaal de events voordat je de flow bouwt — anders mis je de data achteraf.

**Events die de n8n-flow per klant moet wegschrijven** (append-only JSONL, per klant, naar
dezelfde data-laag als de bestaande geanonimiseerde bezoekersanalytics):

| Event | Wanneer | Velden |
|---|---|---|
| `missed_call` | gemiste oproep gedetecteerd | timestamp, klant-id, bellernummer |
| `whatsapp_sent` | terug-app-template verstuurd | timestamp, klant-id |
| `reply_received` | beller reageert (= warme lead) | timestamp, klant-id |
| `lead_notified` | vakman is gemeld | timestamp, klant-id, kanaal |

**De 4 getallen die de klant écht wil** (geldgericht, niet tech):
1. **Opgevangen oproepen** = `count(missed_call)`: het hero-getal.
2. **Reacties/leads** = `count(reply_received)`; **reactieratio** = reacties ÷ opgevangen.
3. **Geschatte waarde** = opgevangen × *gemiddelde kluswaarde* (per klant configureerbaar,
   bv. in `config.json`), afgezet tegen het maandbedrag → ROI in één oogopslag.
4. (Bijvangst) **Websitebezoekers** + hoeveel er belden/appten — komt uit de analytics die
   de site/chatbot al verzamelt.

**Privacy/AVG:** het bellernummer is een lead (grondslag: de beller belde de klant zelf) —
minimaal bewaren, retentielimiet, het is de data van de klant. Aggregaties zijn tellingen.
Hergebruik het bestaande token-beveiligde dashboardpatroon (AB-bezoekersdashboard) wanneer
het portaal wordt gebouwd.

**Levering (augment vóór automate):** eerste 1–3 klanten krijgen een **handmatig maandelijks
WhatsApp/PDF-overzichtje**; het self-service klant-dashboard bouw je pas als dat handmatige
overzicht een bottleneck wordt. Zo blijft een altijd-kloppend live dashboard geen last vóór
het zich terugverdient.

## Gotcha's & compliance (kort maar belangrijk)

- **✅ v0 bewezen (2026-07-18):** call → Studio-flow → automatische SMS-terug werkt end-to-end
  (US-trial-nummer +14474274008, flow `belvanger-rooktest`).
- **Twilio-trial-valkuil (kostte meerdere debug-rondes):** op een proefaccount speelt Twilio
  bij élke inkomende oproep éérst *"You have a trial account… press any key to execute your
  code"* af. **De flow start pas ná een toetsdruk.** Symptoom: de call staat wél in de
  Calls-log, maar de Studio-flow toont **0 executions** en er komt geen bericht — totdat de
  beller een toets indrukt. Verdwijnt zodra je upgradet naar een betaald account (klanten
  horen dit dan nooit). Andere trial-beperkingen: SMS alleen naar geverifieerde nummers,
  US-nummer vereist A2P 10DLC + geo-permissies voor NL. Allemaal niet-relevant voor de
  productieversie (WhatsApp + net nummer + betaald account).

- **WhatsApp voor de klant, niet SMS (vertrouwen).** SMS = smishing-associatie + laag
  vertrouwen; WhatsApp = geverifieerd bedrijfsprofiel + NL-standaard. SMS alleen als
  interne rooktest (v0). Kosten van WhatsApp = Meta-verificatie + template-goedkeuring
  (paar dagen doorlooptijd) → start vroeg, dan blokkeert het niets.
- **Nummer/doorschakelen** is het enige fiddly stuk bij een echte klant — test het
  per provider. Voor de v0-rooktest hoef je niets aan een klant-nummer te doen.
- **AVG:** je verwerkt alleen het nummer van iemand die zélf net belde, om terug te
  reageren — nette grondslag. Houd het minimaal: sla niet meer op dan nodig, en zorg
  dat de bedrijfsnaam herkenbaar is (bij WhatsApp automatisch via het profiel).

## Wat je NU NIET toevoegt (discipline)

- ❌ AI-kwalificatie (je chatbot): pas als de kale loop een lead vangt.
- ❌ Voice-AI (Retell): pas als de niche bewezen is.
- ❌ Booking, meerdere klanten, facturatie: later.
- ❌ SMS-fallback / hybride: pas als een echte beller ooit géén WhatsApp blijkt te hebben.
- ❌ Self-service klant-dashboard: de utility logt de events wél vanaf dag één, maar het
  portaal bouw je pas als het handmatige maandoverzicht een bottleneck wordt.

Elke toevoeging is een last tot een betalende klant erom vraagt.

## Volgende stap

1. Gesprek met je vriend / een hongerige Type-A-vakman → pijn bevestigd.
2. Bouw **v0** (een middag) → demo op je telefoon.
3. Zet 'm 2 weken live bij die ene vakman (v1) → vang één echte lead.
4. Dát is je eerste case study + de basis om te vragen om betaling.
