"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var listeners = {};

global.window = {
  __CN_REINIT: {},
  addEventListener: function (ev, fn) { listeners[ev] = fn; },
  location: {
    href: "https://example.test/notes/discrete/logic.html",
    origin: "https://example.test",
    pathname: "/notes/discrete/logic.html",
    hash: ""
  },
  scrollTo: function () {}
};
global.location = global.window.location;
global.document = {
  readyState: "complete",
  addEventListener: function (ev, fn) { listeners["doc:" + ev] = fn; },
  querySelectorAll: function () { return []; },
  createElement: function () { return {}; },
  head: { appendChild: function () {} },
  body: {},
  dispatchEvent: function () {}
};
global.history = { pushState: function () {} };
global.fetch = function () { return Promise.reject(new Error("not used")); };
global.DOMParser = function () {};
global.CustomEvent = function () {};

require(path.join(root, "assets/js/site-nav.js"));

var nav = global.window.ClassroomNav;
assert(nav, "ClassroomNav API exposed");
assert.strictEqual(nav.moduleName("assets/js/hub.js"), "hub");
assert.strictEqual(nav.moduleName("../../assets/js/lecture-notes.js"), "lecture-notes");
assert.strictEqual(nav.moduleName("/assets/js/player.js"), "player");

function anchor(href, opts) {
  opts = opts || {};
  return {
    tagName: "A",
    nodeType: 1,
    getAttribute: function (k) { return k === "href" ? href : (opts[k] || null); },
    hasAttribute: function (k) { return k === "download" && !!opts.download; },
    target: opts.target || ""
  };
}

assert.strictEqual(nav.shouldIntercept(anchor("sets-relations-functions.html")), true);
assert.strictEqual(nav.shouldIntercept(anchor("../discrete-structure.html")), true);
assert.strictEqual(nav.shouldIntercept(anchor("/notes/index.html")), true);
assert.strictEqual(nav.shouldIntercept(anchor("#music")), false);
assert.strictEqual(nav.shouldIntercept(anchor("https://youtube.com/watch?v=abc")), false);
assert.strictEqual(nav.shouldIntercept(anchor("mailto:a@b.com")), false);
assert.strictEqual(nav.shouldIntercept(anchor("notes/foo.html", { target: "_blank" })), false);
assert.strictEqual(nav.shouldIntercept(anchor("file.pdf", { download: true })), false);
assert.strictEqual(nav.shouldIntercept(anchor("logic.html", {}, { button: 1 }), { button: 1 }), false);
assert.strictEqual(nav.shouldIntercept(anchor("logic.html#study", {})), false);

var pages = [];
function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!/^\./.test(e.name) && e.name !== "node_modules" && e.name !== "tests") walk(p);
    } else if (/\.html$/.test(e.name)) {
      pages.push(p);
    }
  });
}
walk(root);
assert.strictEqual(pages.length, 18, "expected 18 pages, got " + pages.length);
pages.forEach(function (p) {
  var s = fs.readFileSync(p, "utf8");
  assert(s.indexOf("site-nav.js") !== -1, "missing site-nav.js in " + path.relative(root, p));
});

var navSource = fs.readFileSync(path.join(root, "assets/js/site-nav.js"), "utf8");
assert(navSource.indexOf("history.pushState") < navSource.indexOf("parseFromString"),
  "history must update before relative URLs are resolved");
assert(navSource.indexOf("document.body.innerHTML") === -1,
  "body.innerHTML swap detaches the YouTube iframe and restarts playback");
assert(navSource.indexOf("importNode") !== -1, "missing surgical DOM swap");
assert(navSource.indexOf("prefetch") !== -1, "missing prefetch");
assert(navSource.indexOf('"mouseover"') !== -1, "missing hover prefetch");
assert(navSource.indexOf('"focusin"') !== -1, "missing focus prefetch");
assert.strictEqual(typeof nav.prefetch, "function");
assert.strictEqual(typeof nav.isCached, "function");

["hub.js", "notes.js", "lecture-notes.js", "study-tools.js"].forEach(function (name) {
  var s = fs.readFileSync(path.join(root, "assets/js", name), "utf8");
  assert(s.indexOf("__CN_REINIT") !== -1, "missing reinit registration in " + name);
});

var playerSource = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");
assert(playerSource.indexOf("Restored · press play") === -1, "stale song still auto-loads on reload");
assert(playerSource.indexOf("state.url === url") !== -1, "title reply not pinned to its URL");
assert(playerSource.indexOf("titleTimer") !== -1, "missing title retry");

console.log("site nav tests ok");
