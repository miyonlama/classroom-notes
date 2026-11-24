(function () {
  "use strict";

  var THEME_KEY = "classroom-notes-study-theme";
  var REVIEW_PREFIX = "classroom-notes-review:";
  var intervals = [1, 3, 7, 14, 30];

  function fmtDate(ts) {
    if (!ts) return "not yet";
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function initTheme() {
    var btn = document.getElementById("study-toggle");
    if (!btn) return;
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var study = saved === "study" || window.location.hash === "#study";

    function apply() {
      document.documentElement.dataset.theme = study ? "study" : "dark";
      btn.setAttribute("aria-pressed", study ? "true" : "false");
      btn.innerHTML = svg() + "<span>" + (study ? "Dark mode" : "Study mode") + "</span>";
    }
    function svg() {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.5"/>' +
        '<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13"/></svg>';
    }
    btn.addEventListener("click", function () {
      study = !study;
      try { localStorage.setItem(THEME_KEY, study ? "study" : "dark"); } catch (e) {}
      apply();
    });
    apply();
  }

  function initReview() {
    var box = document.querySelector(".revision-tracker");
    if (!box) return;
    var key = REVIEW_PREFIX + (box.dataset.page || location.pathname);
    var state = { count: 0, last: 0, next: 0 };
    try {
      var raw = localStorage.getItem(key);
      if (raw) state = JSON.parse(raw);
    } catch (e) {}

    var dates = box.querySelector(".revision-dates");
    var button = box.querySelector(".revision-btn");

    function render() {
      if (!dates) return;
      var due = state.next && state.next <= Date.now();
      var text = "Last reviewed: " + fmtDate(state.last) + " · Next: " + fmtDate(state.next);
      if (!state.last) text = "Not reviewed yet · Next: any time";
      dates.textContent = text;
      dates.dataset.due = due ? "true" : "false";
      if (button) button.textContent = state.last ? "Mark reviewed" : "Mark as reviewed";
    }

    if (button) {
      button.addEventListener("click", function () {
        var now = Date.now();
        var step = intervals[Math.min(state.count, intervals.length - 1)];
        state.count = (state.count || 0) + 1;
        state.last = now;
        state.next = now + step * 24 * 60 * 60 * 1000;
        try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
        render();
      });
    }
    render();
  }

  function init() {
    initTheme();
    initReview();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.__CN_REINIT = window.__CN_REINIT || {};
  window.__CN_REINIT["study-tools"] = init;
})();
