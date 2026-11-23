(function () {
  "use strict";

  var subjects = [];
  var selected = 0;
  var query = "";

  var chapters = {
    "discrete-structure": [
      "Sets, Relations, and Functions",
      "Logic and Proof Methods",
      "Trees and Graphs",
      "Counting and Discrete Probability",
      "Number Theory",
      "Induction and Recursion"
    ]
  };

  function pad(n) { return String(n).padStart(2, "0"); }

  function linkFor(s) {
    return "notes/" + (s.href ? s.href : (s.slug + ".html"));
  }

  function mark(i) {
    var shapes = [
      '<circle cx="14" cy="14" r="9"/><circle cx="14" cy="14" r="2" fill="currentColor" stroke="none"/>',
      '<path d="M14 4L24 23H4Z"/>',
      '<rect x="5" y="5" width="18" height="18"/>',
      '<path d="M14 3L25 14L14 25L3 14Z"/>',
      '<path d="M14 3L23 8V20L14 25L5 20V8Z"/>'
    ];
    return '<svg viewBox="0 0 28 28" aria-hidden="true">' + shapes[i % shapes.length] + "</svg>";
  }

  function visible(s) {
    var q = query.trim().toLowerCase();
    if (!q) return true;
    return (s.title + " " + (s.desc || "")).toLowerCase().indexOf(q) !== -1;
  }

  function render() {
    var rail = document.getElementById("rail");
    var cards = document.getElementById("cards");
    rail.innerHTML = "";
    cards.innerHTML = "";

    subjects.forEach(function (s, i) {
      if (!visible(s)) return;

      var li = document.createElement("li");
      var rbtn = document.createElement("button");
      rbtn.type = "button";
      rbtn.innerHTML = '<span class="num">' + pad(i + 1) + '</span><span class="name">' + s.title + "</span>";
      rbtn.addEventListener("click", function () { setSelected(i); });
      li.appendChild(rbtn);
      rail.appendChild(li);

      var card = document.createElement("a");
      card.className = "slide-card";
      card.href = linkFor(s);
      card.innerHTML =
        '<span class="card-num">' + pad(i + 1) + "</span>" +
        mark(i) +
        '<span class="card-name">' + s.title + "</span>" +
        '<span class="card-count">' + (chapters[s.slug] ? chapters[s.slug].length + " chapters" : "Notes") + "</span>";
      card.addEventListener("mouseenter", function () { setSelected(i); });
      card.addEventListener("focus", function () { setSelected(i); });
      cards.appendChild(card);
    });

    var empty = document.getElementById("empty");
    var anyVisible = subjects.some(visible);
    empty.hidden = anyVisible;
    document.getElementById("live-slide").hidden = !anyVisible;

    if (anyVisible && !visible(subjects[selected])) {
      var first = subjects.findIndex(visible);
      if (first !== -1) setSelected(first);
    }
    syncActive();
  }

  function syncActive() {
    var railButtons = document.querySelectorAll("#rail button");
    var cards = document.querySelectorAll(".slide-card");
    railButtons.forEach(function (b, idx) {
      b.setAttribute("aria-current", subjects.findIndex(visible) === -1 ? "false" : (isSelectedAtVisibleIndex(idx) ? "true" : "false"));
    });
    cards.forEach(function (c, idx) {
      c.setAttribute("aria-current", isSelectedAtVisibleIndex(idx) ? "true" : "false");
    });
  }

  function isSelectedAtVisibleIndex(visibleIndex) {
    var idx = -1;
    for (var i = 0; i < subjects.length; i++) {
      if (visible(subjects[i])) {
        if (idx === visibleIndex) return i === selected;
        idx++;
      }
    }
    return false;
  }

  function setSelected(i) {
    if (i < 0 || i >= subjects.length) return;
    selected = i;
    var s = subjects[i];
    document.getElementById("slide-index").textContent = pad(i + 1);
    document.getElementById("slide-title").textContent = s.title;
    document.getElementById("slide-desc").textContent = s.desc || "Open the notes for this subject.";
    document.getElementById("slide-link").href = linkFor(s);

    var list = document.getElementById("chapter-list");
    list.innerHTML = "";
    var items = chapters[s.slug] || [];
    if (!items.length) {
      var li = document.createElement("li");
      li.textContent = "Chapters coming soon.";
      list.appendChild(li);
    } else {
      items.forEach(function (name) {
        var li = document.createElement("li");
        li.textContent = name;
        list.appendChild(li);
      });
    }
    syncActive();
  }

  function init() {
    fetch("subjects.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        subjects = data;
        render();
        setSelected(0);

        document.getElementById("search").addEventListener("input", function (e) {
          query = e.target.value;
          render();
        });
        document.getElementById("search").addEventListener("keydown", function (e) {
          if (e.key === "Escape") { e.target.value = ""; query = ""; render(); }
        });
        document.addEventListener("keydown", function (e) {
          if (document.activeElement && document.activeElement.tagName === "INPUT") return;
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          var visibleIdx = -1, count = 0;
          for (var i = 0; i < subjects.length; i++) if (visible(subjects[i])) count++;
          if (!count) return;
          for (var j = 0; j < subjects.length; j++) if (visible(subjects[j]) && j === selected) visibleIdx = j;
          var step = e.key === "ArrowRight" ? 1 : -1;
          var pos = visibleIdx === -1 ? 0 : (visibleIdx + step + count) % count;
          var seen = -1;
          for (var k = 0; k < subjects.length; k++) {
            if (visible(subjects[k])) {
              if (seen === pos) { setSelected(k); break; }
              seen++;
            }
          }
        });
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
