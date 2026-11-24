(function () {
  "use strict";

  var chapters = [
    {
      title: "Sets, Relations, and Functions",
      lede: "Set is a fundamental discrete structure on which all other discrete structures are built. Sets are used to group objects together.",
      label: "Definition",
      body: "A set is an unordered collection of objects, called elements or members. We write a ∈ A to denote that a is an element of the set A."
    },
    {
      title: "Logic and Proof Methods",
      lede: "Propositions, logical operators, predicates, quantifiers, rules of inference, and the standard methods of proof.",
      label: "In this chapter",
      body: "Detailed notes for this chapter are being prepared. The original PDF is available from the chapter page."
    },
    {
      title: "Trees and Graphs",
      lede: "Graph types, paths, connectivity, trees, and the vocabulary used to describe discrete structures as networks.",
      label: "In this chapter",
      body: "Detailed notes for this chapter are being prepared. The original PDF is available from the chapter page."
    },
    {
      title: "Counting and Discrete Probability",
      lede: "Product and sum rules, permutations, combinations, the pigeonhole principle, and discrete probability.",
      label: "In this chapter",
      body: "Detailed notes for this chapter are being prepared. The original PDF is available from the chapter page."
    },
    {
      title: "Number Theory",
      lede: "Divisibility, modular arithmetic, integer representations, and algorithms for integer operations.",
      label: "In this chapter",
      body: "Detailed notes for this chapter are being prepared. The original PDF is available from the chapter page."
    },
    {
      title: "Induction and Recursion",
      lede: "Mathematical induction, strong induction, the well-ordering property, and recursively defined functions.",
      label: "In this chapter",
      body: "Detailed notes for this chapter are being prepared. The original PDF is available from the chapter page."
    }
  ];

  var files = [
    "sets-relations-functions.html",
    "logic-and-proof-methods.html",
    "trees-and-graphs.html",
    "counting-and-discrete-probability.html",
    "number-theory.html",
    "induction-and-recursion.html"
  ];

  function pad(n) { return String(n).padStart(2, "0"); }

  function show(i) {
    if (!document.getElementById("chapter-title")) return;
    var c = chapters[i];
    if (!c) return;
    document.getElementById("folio").textContent = pad(i + 1);
    document.getElementById("chapter-title").textContent = c.title;
    document.getElementById("chapter-lede").textContent = c.lede;
    document.getElementById("callout-label").textContent = c.label;
    document.getElementById("callout-body").textContent = c.body;
    var next = document.getElementById("next-link");
    if (i + 1 < chapters.length) {
      next.hidden = false;
      next.href = files[i + 1];
      next.textContent = "NEXT CHAPTER — " + chapters[i + 1].title.toUpperCase() + " →";
    } else {
      next.hidden = false;
      next.href = "index.html";
      next.textContent = "BACK TO NOTES INDEX →";
    }
    var links = document.querySelectorAll(".chapter-rail a");
    links.forEach(function (a, idx) {
      a.setAttribute("aria-current", idx === i ? "true" : "false");
    });
  }

  function initSyllabusToggle() {
    var button = document.getElementById("syllabus-toggle");
    var shell = document.querySelector(".doc-shell");
    if (!button || !shell) return;
    var key = "classroom-notes-syllabus";
    var collapsed = false;
    try { collapsed = localStorage.getItem(key) === "collapsed"; } catch (e) {}

    function apply() {
      shell.classList.toggle("syllabus-collapsed", collapsed);
      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }
    button.addEventListener("click", function () {
      collapsed = !collapsed;
      try { localStorage.setItem(key, collapsed ? "collapsed" : "open"); } catch (e) {}
      apply();
    });
    apply();
  }

  // Slide the rail up into the space the header leaves behind, then stop at
  // the viewport top. Height grows with it so the rail always fills the screen.
  function updateStickyRail() {
    var rail = document.querySelector(".syllabus");
    if (!rail) return;
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
      rail.style.top = "";
      rail.style.height = "";
      return;
    }
    var top = Math.max(0, 76 - (window.scrollY || document.documentElement.scrollTop || 0));
    rail.style.top = top + "px";
    rail.style.height = "calc(100vh - " + top + "px)";
  }

  function initStickyRail() {
    if (!window.__CN_RAIL_SCROLL) {
      window.__CN_RAIL_SCROLL = true;
      window.addEventListener("scroll", function () {
        if (window.__CN_RAIL_TICK) return;
        window.__CN_RAIL_TICK = true;
        requestAnimationFrame(function () {
          window.__CN_RAIL_TICK = false;
          updateStickyRail();
        });
      }, { passive: true });
      window.addEventListener("resize", updateStickyRail);
    }
    updateStickyRail();
  }

  function init() {
    initSyllabusToggle();
    initStickyRail();
    document.querySelectorAll(".chapter-rail a").forEach(function (a, i) {
      a.addEventListener("mouseenter", function () { show(i); });
      a.addEventListener("focus", function () { show(i); });
    });
    document.querySelectorAll(".index-card").forEach(function (a, i) {
      a.addEventListener("mouseenter", function () { show(i); });
      a.addEventListener("focus", function () { show(i); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.__CN_REINIT = window.__CN_REINIT || {};
  window.__CN_REINIT["lecture-notes"] = init;
})();
