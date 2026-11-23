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

  document.addEventListener("DOMContentLoaded", () => {
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
  });
})();