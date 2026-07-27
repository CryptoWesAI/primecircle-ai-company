// Teksten en opbouw van pushmeldingen, zonder database en zonder netwerk.
//
// Waarom een eigen module: server.js start bij import direct een HTTP-server en eist
// DATABASE_URL, dus daaruit valt niets te testen. Deze logica bepaalt wat een vakman
// letterlijk op zijn telefoon ziet en of daar persoonsgegevens in staan, en dat hoort
// getest te kunnen worden. Zie tests/inbound-push.mjs.

// Reacties en aanvragen die van een MENS komen. Dit is het belangrijkste blok van de
// hele meldingenlaag: de gemiste oproep is het probleem, maar het ANTWOORD van de beller
// is de lead. Bleef dit ongemeld, dan miste de klant het gesprek alsnog, en dat is
// precies wat "mis nooit een klant" belooft te voorkomen.
//
// sms.outbound en sms.status staan hier bewust NIET in: dat is ons eigen systeem dat aan
// het werk is, geen klant die iets van zich laat horen. Dashboardacties (contact.status,
// contact.manual, contact.referred) ook niet: die doet de klant zelf.
export const INBOUND_PUSH_KINDS = {
  "sms.inbound": { title: "Nieuw bericht", body: "Iemand reageerde op je automatische sms. Tik om te lezen." },
  "email.inbound": { title: "Nieuwe e-mail", body: "Er kwam een e-mail binnen. Tik om te lezen." },
  "chat.lead": { title: "Nieuwe aanvraag via de chat", body: "Iemand liet zijn gegevens achter op je site." },
};

// Android kapt een meldingstekst zelf al af. De bedoeling is dat de melding in één
// oogopslag te lezen is, niet dat het hele bericht erin past.
const MAX_BODY_CHARS = 140;

/**
 * Bouwt de payload voor een inkomende reactie of aanvraag.
 *
 * `includeDetails` volgt PUSH_INCLUDE_CALLER: diezelfde schakelaar bepaalt of er
 * leadgegevens in de payload mogen. Bewust één schakelaar en niet twee, zodat er één
 * gegevensbeschermingskeuze te maken is in plaats van een reeks losse.
 *
 * Geeft null terug voor een eventtype dat geen melding hoort te geven, zodat de
 * aanroeper daar niet zelf over hoeft na te denken.
 */
export function inboundPushPayload(eventType, { name, phone, preview } = {}, contactId, includeDetails) {
  const kind = INBOUND_PUSH_KINDS[eventType];
  if (!kind) return null;

  const who = String(name || phone || "").trim();
  const text = String(preview || "").replace(/\s+/g, " ").trim();

  // tag per CONTACT, niet per gebeurtenis: stuurt iemand drie berichten achter elkaar,
  // dan vervangt de melding zichzelf in plaats van een stapel te bouwen. Bij een gemiste
  // oproep is stapelen juist goed (elke oproep is een eigen kans), bij een lopend gesprek
  // niet.
  const payload = {
    title: kind.title,
    body: kind.body,
    tag: `contact-${contactId}`,
    url: "/?tab=contacten",
    phone: "",
  };
  if (!includeDetails) return payload;

  if (who) payload.title = `${kind.title} van ${who}`;
  if (text) payload.body = text.length > MAX_BODY_CHARS ? `${text.slice(0, MAX_BODY_CHARS - 1)}…` : text;
  // Alleen bij een sms is terugbellen zinvol; bij e-mail en chat is er meestal geen
  // telefoonnummer, en een dode "Bel terug"-knop is erger dan geen knop.
  if (eventType === "sms.inbound" && phone) payload.phone = String(phone);
  return payload;
}
