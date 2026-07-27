async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || "Er ging iets mis."), { status: response.status });
  return body;
}

function show(id) {
  ["checkingState", "invalidState", "resetForm", "doneState"].forEach((other) => {
    document.getElementById(other).classList.toggle("is-hidden", other !== id);
  });
}

const token = new URLSearchParams(location.search).get("token") || "";

(async () => {
  if (!token) return show("invalidState");
  try {
    const result = await api(`/api/reset-password/verify?token=${encodeURIComponent(token)}`);
    show(result.valid ? "resetForm" : "invalidState");
  } catch (error) {
    show("invalidState");
  }
})();

document.getElementById("resetForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("resetFormError");
  errorEl.textContent = "";
  const form = new FormData(event.currentTarget);
  const password = String(form.get("password") || "");
  const confirm = String(form.get("passwordConfirm") || "");
  if (password !== confirm) { errorEl.textContent = "De wachtwoorden komen niet overeen."; return; }
  const button = event.currentTarget.querySelector("button[type='submit']");
  const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig…";
  try {
    await api("/api/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
    show("doneState");
  } catch (error) {
    errorEl.textContent = error.message;
  } finally {
    button.disabled = false; button.textContent = original;
  }
});
