// Test van de pushmeldingen bij een inkomende reactie of aanvraag.
//
// Wat hier op het spel staat: dit bepaalt letterlijk wat een vakman op zijn telefoon
// ziet, en of daar persoonsgegevens van zijn klant in staan. Een fout hier is stil (de
// melding komt gewoon aan, maar met te veel of te weinig erin) en daarom moeilijk te
// betrappen zonder test.
//
// Draaien: node tests/inbound-push.mjs

import assert from "node:assert/strict";
import { INBOUND_PUSH_KINDS, inboundPushPayload } from "../src/push-payloads.js";

const CONTACT = { name: "Jan Kramer", phone: "+31612345678", preview: "Goedemiddag! We zoeken voor een project van 14 woningen een vaste installateur." };

// --- Welke events horen wel en niet te melden -------------------------------
assert.deepEqual(
  Object.keys(INBOUND_PUSH_KINDS).sort(),
  ["chat.lead", "email.inbound", "sms.inbound"],
  "alleen menselijke reacties en aanvragen horen een melding te geven"
);

// Ons eigen systeem aan het werk, en acties die de klant zelf in het dashboard doet:
// die mogen NOOIT een melding geven, anders krijgt hij een melding van zichzelf.
for (const stil of ["sms.outbound", "sms.status", "call.missed", "website.lead", "contact.status", "contact.manual", "contact.referred", "onzin.type"]) {
  assert.equal(inboundPushPayload(stil, CONTACT, 7, true), null, `${stil} hoort geen inbound-melding te geven`);
}

// --- Zonder details (PUSH_INCLUDE_CALLER=false) -----------------------------
const zonder = inboundPushPayload("sms.inbound", CONTACT, 7, false);
assert.equal(zonder.title, "Nieuw bericht");
assert.ok(!zonder.title.includes("Jan"), "naam mag niet in de titel staan als details uit staan");
assert.ok(!zonder.body.includes("14 woningen"), "berichttekst mag niet in de body staan als details uit staan");
assert.equal(zonder.phone, "", "geen telefoonnummer als details uit staan");
assert.equal(zonder.tag, "contact-7");

// --- Met details (PUSH_INCLUDE_CALLER=true) ---------------------------------
const met = inboundPushPayload("sms.inbound", CONTACT, 7, true);
assert.equal(met.title, "Nieuw bericht van Jan Kramer");
assert.ok(met.body.includes("14 woningen"), "de berichttekst hoort in de body");
assert.equal(met.phone, "+31612345678", "bij een sms hoort een nummer mee voor de Bel terug-knop");

// Geen naam bekend: dan valt hij terug op het nummer, niet op een leeg "van ".
const alleenNummer = inboundPushPayload("sms.inbound", { phone: "+31600000001", preview: "ja graag" }, 9, true);
assert.equal(alleenNummer.title, "Nieuw bericht van +31600000001");
// Niets bekend: geen kaal "van " in de titel.
const anoniem = inboundPushPayload("sms.inbound", { preview: "ja graag" }, 9, true);
assert.equal(anoniem.title, "Nieuw bericht");

// --- Bel terug alleen waar hij zin heeft -----------------------------------
// Bij e-mail en chat is er meestal geen nummer; een dode knop is erger dan geen knop.
assert.equal(inboundPushPayload("email.inbound", CONTACT, 7, true).phone, "", "e-mail hoort geen belknop te krijgen");
assert.equal(inboundPushPayload("chat.lead", CONTACT, 7, true).phone, "", "chat hoort geen belknop te krijgen");

// --- Lange en rommelige berichten ------------------------------------------
const lang = inboundPushPayload("sms.inbound", { name: "Jan", phone: "+3161", preview: "a".repeat(400) }, 7, true);
assert.equal(lang.body.length, 140, "body hoort op 140 tekens afgekapt te worden");
assert.ok(lang.body.endsWith("…"), "afgekapte body hoort op een ellips te eindigen");

// Regeleindes en dubbele spaties uit een sms mogen de melding niet opblazen.
const rommel = inboundPushPayload("sms.inbound", { name: "Jan", preview: "  ja\n\n  graag   vanmiddag \t bellen  " }, 7, true);
assert.equal(rommel.body, "ja graag vanmiddag bellen");

// Leeg bericht: dan blijft de standaardtekst staan i.p.v. een lege melding.
const leeg = inboundPushPayload("sms.inbound", { name: "Jan", preview: "   " }, 7, true);
assert.equal(leeg.body, INBOUND_PUSH_KINDS["sms.inbound"].body);

// --- Vorm van de payload ---------------------------------------------------
// De service worker leest exact deze velden; ontbreekt er één, dan valt de melding stil
// terug op standaardtekst zonder dat iemand het merkt.
for (const key of ["title", "body", "tag", "url", "phone"]) {
  assert.ok(key in met, `payload mist het veld ${key}`);
}
assert.equal(met.url, "/?tab=contacten");

console.log("OK  inbound-pushmeldingen: eventselectie, gegevensminimalisatie, belknop, afkapping en payloadvorm.");
