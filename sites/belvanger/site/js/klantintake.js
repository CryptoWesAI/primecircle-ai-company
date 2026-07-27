/* Klantintake-formulier: client-side validatie + honeypot, POST naar /api/intake.
   Zelfde patroon als het demo-formulier op de homepage (zie js/app.js), losgetrokken
   omdat dit een aparte pagina met een eigen, veel groter formulier is. */
(function () {
  "use strict";
  var INTAKE_ENDPOINT = "/api/intake"; // same-origin: server mailt de intake naar info@belvanger.nl

  var pagField = document.querySelector("[data-pagina]");
  if (pagField) pagField.value = location.href;

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var form = document.querySelector("[data-intake-form]");
  if (!form) return;

  var ok = form.querySelector("[data-form-ok]");
  var fail = form.querySelector("[data-form-fail]");

  var showError = function (field, msg) {
    field.setAttribute("data-invalid", "");
    var err = field.querySelector("[data-err]");
    var input = field.querySelector("input, select, textarea");
    if (err) {
      if (!err.id) err.id = "err-" + (input && input.name ? input.name : Math.random().toString(36).slice(2));
      err.setAttribute("role", "alert");
      err.textContent = msg;
    }
    if (input) {
      input.setAttribute("aria-invalid", "true");
      if (err) input.setAttribute("aria-describedby", err.id);
    }
  };
  var clearError = function (field) {
    field.removeAttribute("data-invalid");
    var err = field.querySelector("[data-err]");
    var input = field.querySelector("input, select, textarea");
    if (err) err.textContent = "";
    if (input) {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  };

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      var f = el.closest(".ffield");
      if (f) clearError(f);
    });
  });

  // Bestandsuploads: logo (optioneel) + tot 3 projectfoto's (optioneel). Alleen
  // afbeeldingen, max 3 MB per bestand. Geen bestand gekozen is altijd toegestaan.
  var FILE_FIELDS = ["logoFile", "foto1", "foto2", "foto3"];
  var MAX_FILE_BYTES = 3 * 1024 * 1024;
  var ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  var ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

  var isAllowedImage = function (file) {
    if (file.type && ALLOWED_TYPES.indexOf(file.type) !== -1) return true;
    // Sommige besturingssystemen/browsers leveren geen mime-type mee; val dan terug op de extensie.
    return !file.type && ALLOWED_EXT.test(file.name || "");
  };

  var readFileAsDataUrl = function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(new Error("bestand lezen mislukt")); };
      reader.readAsDataURL(file);
    });
  };

  var validateFileField = function (input) {
    var f = input.closest(".ffield");
    if (!f) return true;
    var file = input.files && input.files[0];
    if (!file) { clearError(f); return true; }
    if (!isAllowedImage(file)) { showError(f, "Alleen jpg, png of webp toegestaan"); return false; }
    if (file.size > MAX_FILE_BYTES) { showError(f, "Bestand is te groot (max 3 MB)"); return false; }
    clearError(f);
    return true;
  };

  FILE_FIELDS.forEach(function (name) {
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) return;
    input.addEventListener("change", function () {
      if (!validateFileField(input)) input.value = ""; // ongeldig bestand meteen leegmaken
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot: gevuld = bot → stil negeren
    var hp = form.querySelector('input[name="website"]');
    if (hp && hp.value.trim() !== "") return;

    var valid = true;
    var required = form.querySelectorAll("[required]");
    required.forEach(function (el) {
      var f = el.closest(".ffield");
      if (!f) return;
      var val = el.value.trim();
      if (!val) { showError(f, "Dit veld is verplicht"); valid = false; return; }
      if (el.name === "telefoon") {
        var digits = val.replace(/\D/g, "");
        if (!/^[0-9+()\s-]+$/.test(val) || digits.length < 8 || digits.length > 15) {
          showError(f, "Vul een geldig telefoonnummer in");
          valid = false; return;
        }
      }
      if (el.name === "email") {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { showError(f, "Vul een geldig e-mailadres in"); valid = false; return; }
      }
      clearError(f);
    });

    FILE_FIELDS.forEach(function (name) {
      var input = form.querySelector('input[name="' + name + '"]');
      if (input && !validateFileField(input)) valid = false;
    });

    if (!valid) {
      var firstBad = form.querySelector("[data-invalid] input, [data-invalid] select, [data-invalid] textarea");
      if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      if (firstBad) firstBad.focus();
      return;
    }

    var payload = {};
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (!el.name) return;
      if (el.type === "file") return; // hieronder apart als base64-bijlage ingelezen
      if (el.type === "radio") { if (el.checked) payload[el.name] = el.value; return; }
      payload[el.name] = el.value;
    });

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (fail) fail.hidden = true;

    var fileReads = FILE_FIELDS.map(function (name) {
      var input = form.querySelector('input[name="' + name + '"]');
      var file = input && input.files && input.files[0];
      if (!file) return Promise.resolve(null);
      return readFileAsDataUrl(file).then(function (dataUrl) {
        var base64 = dataUrl.indexOf(",") !== -1 ? dataUrl.split(",")[1] : "";
        return { field: name, filename: file.name || (name + ".jpg"), contentType: file.type || "image/jpeg", content: base64 };
      });
    });

    Promise.all(fileReads)
      .then(function (results) {
        payload.attachments = results.filter(Boolean);
        return fetch(INTAKE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      })
      .then(function (r) { if (!r.ok) throw new Error("verzenden mislukt"); return r.json(); })
      .then(function () {
        form.hidden = true;
        if (ok) ok.hidden = false;
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (fail) fail.hidden = false;
      });
  });
})();
