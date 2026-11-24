(function () {
  "use strict";

  // Page scripts register their init here so the router can re-run them
  // without a full reload. player.js is deliberately not registered: its
  // element and YouTube iframe are kept alive across navigations.
  var reinit = (window.__CN_REINIT = window.__CN_REINIT || {});
  var pending = {};
  var cache = {};
  var inflight = {};
  var persist = "#yt-player, .chalk-dust, .projector, .projector-wash";
  var skipScript = /(?:^|\/)(?:player|site-nav)\.js(?:\?|$)/;

  function moduleName(src) {
    var m = String(src).match(/(?:^|\/)([a-zA-Z0-9_-]+)\.js(?:\?|$)/);
    return m ? m[1] : "";
  }

  function anchorFrom(node) {
    while (node && node.nodeType !== 1) node = node.parentNode;
    while (node && node.tagName && node.tagName.toUpperCase() !== "A") node = node.parentNode;
    return node && node.tagName && node.tagName.toUpperCase() === "A" ? node : null;
  }

  function shouldIntercept(anchor, e) {
    if (!anchor) return false;
    if (e && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    if (anchor.hasAttribute && anchor.hasAttribute("download")) return false;
    if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return false;
    var href = anchor.getAttribute ? anchor.getAttribute("href") : anchor.href;
    if (!href || href.charAt(0) === "#") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    var url;
    try { url = new URL(href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;
    if (!/\.html?$/.test(url.pathname) && url.pathname !== "/") return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  }

  function swapStyles(doc) {
    var head = document.head;
    var incoming = Array.prototype.slice.call(doc.querySelectorAll('link[rel="stylesheet"]'));
    var incomingHrefs = incoming.map(function (link) {
      return new URL(link.getAttribute("href"), location.href).href;
    });
    var isPlayer = function (href) { return /\/player\.css(?:\?|$)/.test(href); };

    incoming.forEach(function (link, i) {
      var href = incomingHrefs[i];
      if (isPlayer(href)) return;
      var exists = Array.prototype.some.call(head.querySelectorAll('link[rel="stylesheet"]'), function (old) {
        return new URL(old.getAttribute("href"), location.href).href === href;
      });
      if (exists) return;
      var clone = document.createElement("link");
      clone.rel = "stylesheet";
      clone.href = href;
      head.appendChild(clone);
    });

    Array.prototype.forEach.call(head.querySelectorAll('link[rel="stylesheet"]'), function (old) {
      var href = new URL(old.getAttribute("href"), location.href).href;
      if (isPlayer(href) || incomingHrefs.indexOf(href) !== -1) return;
      if (old.parentNode) old.parentNode.removeChild(old);
    });
  }

  function runScripts(doc) {
    var seen = {};
    Array.prototype.forEach.call(doc.querySelectorAll("script[src]"), function (tag) {
      var src = tag.getAttribute("src");
      if (!src || skipScript.test(src)) return;
      var url = new URL(src, location.href).href;
      if (seen[url]) return;
      seen[url] = true;
      var name = moduleName(src);
      if (reinit[name]) {
        try { reinit[name](); } catch (e) { if (window.console) console.error(e); }
      } else if (!pending[url]) {
        pending[url] = true;
        var script = document.createElement("script");
        script.src = url;
        script.onload = script.onerror = function () { pending[url] = false; };
        document.head.appendChild(script);
      }
    });
  }

  function fetchHtml(href) {
    if (cache[href]) return Promise.resolve(cache[href]);
    if (!inflight[href]) {
      inflight[href] = fetch(href, { headers: { "X-Requested-With": "site-nav" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (html) { cache[href] = html; return html; })
        .then(function (html) { delete inflight[href]; return html; },
              function (err) { delete inflight[href]; throw err; });
    }
    return inflight[href];
  }

  function prefetch(href) {
    try { fetchHtml(new URL(href, location.href).href).catch(function () {}); } catch (e) {}
  }

  function isCached(href) {
    try { return !!cache[new URL(href, location.href).href]; } catch (e) { return false; }
  }

  function prefetchLinks() {
    var links = Array.prototype.slice.call(document.querySelectorAll("a[href]"));
    var grab = function () {
      links.forEach(function (a) {
        if (!shouldIntercept(a, null)) return;
        prefetch(new URL(a.getAttribute("href"), location.href).href);
      });
    };
    if (window.requestIdleCallback) window.requestIdleCallback(grab, { timeout: 2000 });
    else setTimeout(grab, 800);
  }

  function navigate(href, push) {
    return fetchHtml(href)
      .then(function (html) {
        // Update location first so relative URLs in the incoming document
        // resolve against the new page, not the one we are leaving.
        if (push) history.pushState({ nav: true }, "", href);
        var doc = new DOMParser().parseFromString(html, "text/html");
        var kept = Array.prototype.slice.call(document.querySelectorAll(persist));
        Array.prototype.forEach.call(doc.querySelectorAll(persist), function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        document.body.innerHTML = doc.body.innerHTML;
        kept.forEach(function (el) { document.body.appendChild(el); });
        swapStyles(doc);
        document.title = doc.title || document.title;
        if (location.hash === "#music") {
          var player = document.getElementById("yt-player");
          if (player && player.classList) player.classList.add("is-open");
        }
        window.scrollTo(0, 0);
        runScripts(doc);
        if (document.dispatchEvent && window.CustomEvent) {
          document.dispatchEvent(new CustomEvent("site-nav:navigated", { detail: { href: href } }));
        }
        prefetchLinks();
      })
      .catch(function () { window.location.assign(href); });
  }

  function prefetchFromEvent(e) {
    var anchor = anchorFrom(e.target);
    if (!shouldIntercept(anchor, null)) return;
    prefetch(new URL(anchor.getAttribute("href"), location.href).href);
  }

  document.addEventListener("click", function (e) {
    var anchor = anchorFrom(e.target);
    if (!shouldIntercept(anchor, e)) return;
    var href = new URL(anchor.getAttribute("href"), location.href).href;
    e.preventDefault();
    navigate(href, true);
  });
  document.addEventListener("mouseover", prefetchFromEvent);
  document.addEventListener("focusin", prefetchFromEvent);
  document.addEventListener("touchstart", prefetchFromEvent, { passive: true });

  window.addEventListener("popstate", function () {
    navigate(location.href, false);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prefetchLinks);
  else prefetchLinks();

  window.ClassroomNav = {
    moduleName: moduleName,
    shouldIntercept: shouldIntercept,
    navigate: navigate,
    prefetch: prefetch,
    isCached: isCached
  };
})();
