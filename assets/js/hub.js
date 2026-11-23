(function () {
  "use strict";

  var subjects = [];
  var selected = 0;
  var nodesWrap = document.getElementById("nodes");
  var stage = document.querySelector(".stage");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) { return String(n).padStart(2, "0"); }

  function linkFor(s) {
    return "notes/" + (s.href ? s.href : (s.slug + ".html"));
  }

  function renderNodes() {
    nodesWrap.innerHTML = "";
    subjects.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "node";
      b.style.setProperty("--accent", s.color);
      b.setAttribute("aria-label", s.title);
      b.innerHTML = '<span class="node-dot"></span><span class="node-label">' + s.title + "</span>";
      b.addEventListener("click", function () { setSelected(i); });
      nodesWrap.appendChild(b);
    });
  }

  function layout() {
    if (!stage) return;
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    var nodes = nodesWrap.children;
    for (var i = 0; i < nodes.length; i++) {
      var angle = 90 + (i - selected) * 72;
      var rad = angle * Math.PI / 180;
      var dx = 0.34 * w * Math.cos(rad);
      var dy = 0.27 * h * Math.sin(rad);
      var norm = (Math.sin(rad) + 1) / 2;
      var scale = 0.72 + 0.28 * norm;
      var node = nodes[i];
      node.style.transform =
        "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(" + scale + ")";
      node.style.opacity = String(0.32 + 0.68 * norm);
      node.style.zIndex = String(Math.round(norm * 10));
      node.dataset.active = i === selected ? "true" : "false";
    }
  }

  function setSelected(i) {
    selected = (i + subjects.length) % subjects.length;
    var s = subjects[selected];
    document.getElementById("info-index").textContent = pad(selected + 1) + " / " + pad(subjects.length);
    document.getElementById("info-icon").textContent = s.icon || "◇";
    document.getElementById("info-icon").style.color = s.color;
    document.getElementById("info-title").textContent = s.title;
    document.getElementById("info-desc").textContent = s.desc || "Open notes for this subject.";
    var link = document.getElementById("info-link");
    link.href = linkFor(s);
    layout();
  }

  function initStars() {
    var canvas = document.getElementById("stars");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      var count = Math.floor((w * h) / 9000);
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.2,
          a: Math.random() * 0.5 + 0.1,
          s: Math.random() * 0.014 + 0.004,
          p: Math.random() * Math.PI * 2
        });
      }
      draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var alpha = reduced ? st.a : st.a * (0.55 + 0.45 * Math.sin(t * st.s + st.p));
        ctx.beginPath();
        ctx.fillStyle = "rgba(200,215,255," + alpha + ")";
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(t) { draw(t); if (!reduced) requestAnimationFrame(loop); }

    window.addEventListener("resize", resize);
    resize();
    if (!reduced) requestAnimationFrame(loop);
  }

  function init() {
    fetch("subjects.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        subjects = data;
        renderNodes();
        setSelected(0);

        document.getElementById("prev").addEventListener("click", function () { setSelected(selected - 1); });
        document.getElementById("next").addEventListener("click", function () { setSelected(selected + 1); });
        document.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") setSelected(selected - 1);
          if (e.key === "ArrowRight") setSelected(selected + 1);
        });
        window.addEventListener("resize", layout);

        var cardWrap = document.getElementById("cards");
        if (cardWrap) {
          subjects.forEach(function (s, i) {
            var a = document.createElement("a");
            a.className = "card";
            a.href = linkFor(s);
            a.style.setProperty("--accent", s.color);
            a.innerHTML =
              '<div class="card-top"><span class="num">0' + (i + 1) + '</span><span class="dot"></span></div>' +
              '<div class="card-icon">' + (s.icon || "◇") + '</div>' +
              '<div class="card-title">' + s.title + '</div>' +
              '<div class="card-meta">OPEN NOTES &rarr;</div>';
            cardWrap.appendChild(a);
          });
        }
      })
      .catch(function () {});

    initStars();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
