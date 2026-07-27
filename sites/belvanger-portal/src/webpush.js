// Web Push zonder npm-dependency, op node:crypto.
//
// Waarom niet de `web-push`-package: deze codebase is bewust dependency-arm (alleen
// `pg`) en heeft om dezelfde reden al een eigen SMTP-client in server.js. Web Push is
// drie afgebakende RFC's en geen bewegend doel, dus een eigen implementatie is hier
// minder onderhoud dan een dependency-boom die we moeten blijven patchen.
//
//   RFC 8292 — VAPID: ES256-JWT als "wie mag naar dit endpoint pushen".
//   RFC 8291 — Message Encryption: ECDH P-256 + HKDF naar een AES-128-GCM-sleutel.
//   RFC 8188 — aes128gcm content-coding: het body-formaat met salt- en keyid-header.
//
// De payload wordt end-to-end versleuteld met sleutels die alleen het toestel van de
// klant heeft. Google/Mozilla zien alleen ciphertext. Dat is precies waarom er in
// server.js GEEN bellernaam of telefoonnummer in de payload gaat: versleuteld of niet,
// de push-dienst is een derde partij en de payload rust daar tot aflevering.

import crypto from "node:crypto";

const CURVE = "prime256v1";
const RECORD_SIZE = 4096;

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(value) {
  return Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

// HKDF (RFC 5869) met een vaste single-block expand: elk label hieronder vraagt
// <= 32 bytes, dus één HMAC-ronde is altijd genoeg.
function hkdf(salt, ikm, info, length) {
  const prk = hmac(salt, ikm);
  return hmac(prk, Buffer.concat([info, Buffer.from([1])])).subarray(0, length);
}

/**
 * Genereert een VAPID-sleutelpaar in het formaat dat ook `npx web-push generate-vapid-keys`
 * oplevert: publiek = 65-byte ongecomprimeerd P-256-punt, privaat = 32-byte scalar, beide base64url.
 */
export function generateVapidKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: CURVE });
  const jwk = privateKey.export({ format: "jwk" });
  return {
    publicKey: b64url(Buffer.concat([Buffer.from([4]), fromB64url(jwk.x), fromB64url(jwk.y)])),
    privateKey: b64url(fromB64url(jwk.d)),
    // Meegeleverd zodat een aanroeper kan valideren dat het paar bij elkaar hoort.
    _spki: publicKey.export({ format: "der", type: "spki" }).toString("base64"),
  };
}

function vapidPrivateKeyObject(publicKeyB64, privateKeyB64) {
  const pub = fromB64url(publicKeyB64);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error("VAPID_PUBLIC_KEY moet een 65-byte ongecomprimeerd P-256-punt zijn.");
  const d = fromB64url(privateKeyB64);
  if (d.length !== 32) throw new Error("VAPID_PRIVATE_KEY moet 32 bytes zijn.");
  return crypto.createPrivateKey({
    key: { kty: "EC", crv: "P-256", x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)), d: b64url(d) },
    format: "jwk",
  });
}

/**
 * VAPID-Authorization-header voor één push-endpoint. `aud` is de ORIGIN van het
 * endpoint, niet de volledige URL: een JWT op de hele URL wordt door FCM geweigerd.
 */
function vapidHeader(endpoint, { publicKey, privateKey, subject }) {
  const audience = new URL(endpoint).origin;
  const header = b64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = b64url(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  }));
  const signingInput = `${header}.${payload}`;
  // ES256 wil een raw r||s-signature van 64 bytes; Node levert standaard DER, dus
  // dwing IEEE-P1363 af. Dit stil verkeerd doen levert een 401 van de push-dienst.
  const signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: vapidPrivateKeyObject(publicKey, privateKey),
    dsaEncoding: "ieee-p1363",
  });
  return `vapid t=${signingInput}.${b64url(signature)}, k=${publicKey}`;
}

/**
 * Versleutelt een payload volgens RFC 8291 naar het aes128gcm-body-formaat van RFC 8188.
 * `p256dh` en `auth` komen letterlijk uit de PushSubscription van de browser.
 *
 * `fixed` bestaat uitsluitend zodat tests/webpush-rfc8291.mjs het testvector uit RFC 8291
 * Appendix A kan reproduceren; productiecode geeft dit nooit mee en krijgt dus altijd een
 * verse efemere sleutel en een verse salt.
 */
export function encryptPayload(payload, p256dhB64, authB64, fixed = null) {
  const uaPublic = fromB64url(p256dhB64);
  const authSecret = fromB64url(authB64);
  if (uaPublic.length !== 65) throw new Error("p256dh moet 65 bytes zijn.");
  if (authSecret.length !== 16) throw new Error("auth moet 16 bytes zijn.");

  const server = crypto.createECDH(CURVE);
  if (fixed?.asPrivate) server.setPrivateKey(fromB64url(fixed.asPrivate));
  else server.generateKeys();
  const asPublic = server.getPublicKey(); // ongecomprimeerd, 65 bytes
  const sharedSecret = server.computeSecret(uaPublic);
  const salt = fixed?.salt ? fromB64url(fixed.salt) : crypto.randomBytes(16);

  // RFC 8291 §3.4: eerst ECDH + auth_secret combineren tot de IKM, dan pas de
  // gewone aes128gcm-afleiding van RFC 8188 daarop.
  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]);
  const ikm = hkdf(authSecret, sharedSecret, keyInfo, 32);
  const cek = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);

  // 0x02 = delimiter "laatste record". Eén record is genoeg: onze payloads zijn
  // enkele honderden bytes en RECORD_SIZE is 4096.
  const plaintext = Buffer.concat([Buffer.from(payload, "utf8"), Buffer.from([2])]);
  if (plaintext.length + 16 > RECORD_SIZE) throw new Error("Push-payload te groot voor één record.");

  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const body = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

  const header = Buffer.alloc(21);
  salt.copy(header, 0);
  header.writeUInt32BE(RECORD_SIZE, 16);
  header.writeUInt8(asPublic.length, 20);
  return Buffer.concat([header, asPublic, body]);
}

/**
 * Verstuurt één push. Gooit nooit op een HTTP-fout: de aanroeper krijgt
 * { ok, statusCode, gone } terug, want `gone` (404/410) is een normale
 * levensloopgebeurtenis van een subscription en geen storing.
 */
export async function sendPush(subscription, payload, vapid, { ttl = 900, urgency = "high", timeoutMs = 10000 } = {}) {
  const body = encryptPayload(payload, subscription.p256dh, subscription.auth);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        "Content-Length": String(body.length),
        TTL: String(ttl),
        Urgency: urgency,
        Authorization: vapidHeader(subscription.endpoint, vapid),
      },
      body,
      signal: controller.signal,
    });
    // 404/410: de browser heeft dit endpoint weggegooid (Chrome-data gewist, app
    // verwijderd, endpoint geroteerd). De rij moet dan weg, anders blijven we
    // eeuwig pushen naar een toestel dat niet meer bestaat.
    return { ok: response.ok, statusCode: response.status, gone: response.status === 404 || response.status === 410 };
  } catch (error) {
    return { ok: false, statusCode: 0, gone: false, error: error?.message || String(error) };
  } finally {
    clearTimeout(timer);
  }
}
