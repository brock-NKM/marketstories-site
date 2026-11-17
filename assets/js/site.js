/* Market Stories v6: look picker dialog, sign-up buttons (Tally or preview stand-in), newsletter opt-in. No dependencies. */
(function () {
  "use strict";
  var cfg = {};
  try { cfg = JSON.parse((document.getElementById("ms-config") || {}).textContent || "{}"); } catch (e) { cfg = {}; }
  var EMAIL = cfg.CONTACT_EMAIL || "brock@marketstories.ca";
  var FORM_ID = (cfg.TALLY_FORM_ID || "").trim();
  var VIBES = cfg.VIBES || {};

  /* ---------- Look picker (behind "I'm starting fresh") ---------- */
  var picks = { vibe: "", font: "", palette: "" };   // nothing preselected
  var PAL = cfg.PALETTES || {};
  var FONTS = { serif: '"Playfair Display", Georgia, serif', modern: '"Manrope", system-ui, sans-serif', bold: '"Poppins", system-ui, sans-serif' };
  var dlg = document.getElementById("vibe-dialog");
  function paint() {
    if (!dlg) return;
    dlg.querySelectorAll(".chips").forEach(function (set) {
      var k = set.getAttribute("data-key");
      set.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-v") === picks[k])); });
    });
    // Live preview tile: updates as each option changes.
    var pv = dlg.querySelector(".pv");
    if (pv) {
      var any = picks.vibe || picks.font || picks.palette;
      pv.classList.toggle("pv--empty", !any);
      pv.className = pv.className.replace(/\bpv--(luxury|local|data|minimal|serif|modern|bold)\b/g, "").trim();
      if (picks.vibe) pv.classList.add("pv--" + picks.vibe);
      if (picks.font) pv.classList.add("pv--" + picks.font);
      var p = PAL[picks.palette];
      pv.style.background = p ? p[0] : "";
      pv.style.color = p ? p[1] : "";
      pv.style.setProperty("--pv-ac", p ? p[2] : "");
      pv.style.fontFamily = picks.font ? FONTS[picks.font] : "";
    }
    var go = dlg.querySelector('[data-path="vibe"]');
    var done = !!(picks.vibe && picks.font && picks.palette);
    if (go) go.disabled = !done;
    var need = dlg.querySelector(".pick__need");
    if (need) need.hidden = done;
  }
  if (dlg) {
    dlg.addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      var k = c.parentNode.getAttribute("data-key");
      picks[k] = c.getAttribute("data-v");
      // Picking a feel suggests a type and colours only where none is picked yet; taps override it.
      if (k === "vibe" && VIBES[picks.vibe]) { picks.font = picks.font || VIBES[picks.vibe][0]; picks.palette = picks.palette || VIBES[picks.vibe][1]; }
      paint();
    });
  }
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("data-open") === "vibe-dialog") paint();
      var d = document.getElementById(b.getAttribute("data-open"));
      if (d && typeof d.showModal === "function") d.showModal();
    });
  });

  /* ---------- Sign-up buttons ---------- */
  // Live: open the Tally popup with hidden fields. Preview (form not LIVE): open the stand-in dialog that shows them.
  var stub = document.getElementById("form-stub");
  function hidden(choice, path, extra) {
    var h = { choice: choice || "", path: path || "" };
    if (path === "vibe") { h.vibe = picks.vibe; h.font = picks.font; h.palette = picks.palette; h.preview_name = ""; }
    if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }
  function openForm(choice, path, extra) {
    var h = hidden(choice, path, extra);
    if (dlg && dlg.open) dlg.close();
    if (FORM_ID && window.Tally && window.Tally.openPopup) {
      window.Tally.openPopup(FORM_ID, { layout: "modal", width: 560, hiddenFields: h });
      return;
    }
    if (stub && typeof stub.showModal === "function") {
      stub.querySelectorAll('input[name="choice"]').forEach(function (r) { r.checked = !!choice && r.value === choice; });
      var out = stub.querySelector(".stub__hidden");
      if (out) out.textContent = Object.keys(h).filter(function (k) { return h[k]; }).map(function (k) { return k + "=" + h[k]; }).join("  ");
      stub.showModal();
      return;
    }
    window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(choice ? "Market Stories: " + choice : "Market Stories");
  }
  document.querySelectorAll("[data-choice]").forEach(function (b) {
    b.addEventListener("click", function () { openForm(b.getAttribute("data-choice"), b.getAttribute("data-path")); });
  });

  /* ---------- Newsletter opt-in (only present if the footer form is rendered). Coming soon = no form. ---------- */
  var news = document.getElementById("news");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = news.querySelector("#news-email"), ok = news.querySelector("#news-ok"), msg = news.querySelector(".news__msg");
      var btn = news.querySelector("[data-news]");
      if (!em.value || !em.checkValidity()) { msg.textContent = "Add your email first."; em.focus(); return; }
      if (!ok.checked) { msg.textContent = "Tick the box so we can email you."; ok.focus(); return; }
      msg.textContent = "";
      openForm(btn.getAttribute("data-news"), "newsletter", { email: em.value.trim() });
    });
  }
})();
