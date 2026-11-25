(function () {
  "use strict";
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); resolve(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  function renderIndex() {
    const grid = document.getElementById("grid");
    if (!grid) return Promise.resolve();
    return fetch("../subjects.json")
      .then(res => res.json())
      .then(subjects => {
        subjects.forEach(s => {
          const a = document.createElement("a");
          a.className = "card";
          a.href = s.href ? s.href : (s.slug + ".html");
          a.style.setProperty("--accent", s.color);
          a.innerHTML = '<div class="icon">' + s.icon + '</div><div class="title">' + s.title + '</div>';
          grid.appendChild(a);
        });
      })
      .catch(() => {});
  }

  function init() {
    renderIndex();
    document.querySelectorAll(".codeblock").forEach(block => {
      const btn = block.querySelector(".copy-btn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const code = block.querySelector("code");
        const text = code ? code.textContent : block.textContent;
        copyText(text).then(() => {
          const old = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => { btn.textContent = old; }, 1200);
        }).catch(() => {
          btn.textContent = "Failed";
          setTimeout(() => { btn.textContent = "Copy"; }, 1200);
        });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.__CN_REINIT = window.__CN_REINIT || {};
  window.__CN_REINIT.notes = init;
})();