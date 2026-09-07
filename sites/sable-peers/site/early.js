// Loaded in the head, before anything else: catches the browser's install offer
// even when it fires before the page's own script has run (repeat visits).
window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.__bip = e; });
window.addEventListener("appinstalled", function () { window.__bip = null; window.__installed = true; });
