(function () {
  "use strict";

  function init() {
    document.querySelectorAll(".paper-nav button").forEach(function (btn) {
      var target = btn.getAttribute("data-target");
      if (!target) return;
      var section = document.getElementById(target.slice(1));
      if (!section) return;

      var expanded = btn.getAttribute("aria-expanded") === "true";

      function apply() {
        section.hidden = !expanded;
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      }

      apply();

      btn.addEventListener("click", function () {
        expanded = !expanded;
        apply();
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.__CN_REINIT = window.__CN_REINIT || {};
  window.__CN_REINIT["past-questions"] = init;
})();
