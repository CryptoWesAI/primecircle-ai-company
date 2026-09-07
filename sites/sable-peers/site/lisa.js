// Lisa inside the guide panel: the ElevenLabs client SDK, fetched from jsdelivr
// only when a visitor presses Talk to Lisa. No floating widget; the panel owns
// the button, the status line and the captions.
const SDK_URL = "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.24.0/+esm";
let sdk = null, conv = null;

export async function start(o) {
  if (!sdk) sdk = await import(SDK_URL);
  const { Conversation } = sdk;
  const on = o.on || {};
  await navigator.mediaDevices.getUserMedia({ audio: true });
  conv = await Conversation.startSession({
    agentId: o.agentId,
    clientTools: o.tools || {},
    connectionType: "websocket",
    onConnect: () => { if (on.status) on.status("connected"); },
    onDisconnect: () => { conv = null; if (on.status) on.status("disconnected"); },
    onError: (e) => { if (on.error) on.error(typeof e === "string" ? new Error(e) : (e || new Error("connection failed"))); },
    onModeChange: (m) => { if (on.mode) on.mode(m && m.mode); },
    onStatusChange: (s) => { if (on.status) on.status(s && s.status); },
    onMessage: (m) => { if (on.message) on.message(m && (m.source || m.role), m && (m.message || m.text)); },
  });
  return conv;
}

export async function stop() {
  const c = conv; conv = null;
  if (c) { try { await c.endSession(); } catch { /* already closed */ } }
}

export function active() { return !!conv; }
// the microphone, muted or not: the tests mute it so a fake device's tone is not heard as speech
export function mute(on) { if (conv && typeof conv.setMicMuted === "function") { conv.setMicMuted(!!on); return true; } return false; }
export function conversation() { return conv; }
// text into the conversation as if spoken; and background context the agent sees but does not answer
export function send(text) { if (conv && typeof conv.sendUserMessage === "function") { conv.sendUserMessage(String(text)); return true; } return false; }
export function context(text) { if (conv && typeof conv.sendContextualUpdate === "function") { conv.sendContextualUpdate(String(text)); return true; } return false; }
