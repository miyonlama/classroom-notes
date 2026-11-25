"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");

// 1. Notes index grid must render through notes.js so the SPA router can re-run it.
function makeDom() {
  var grid = { children: [], appendChild: function (el) { this.children.push(el); } };
  var doc = {
    readyState: "loading",
    addEventListener: function () {},
    getElementById: function (id) { return id === "grid" ? grid : null; },
    querySelectorAll: function (sel) { return sel === ".codeblock" ? [] : []; },
    createElement: function () {
      return { className: "", href: "", innerHTML: "", style: { setProperty: function () {} } };
    }
  };
  var subjects = JSON.parse(fs.readFileSync(path.join(root, "subjects.json"), "utf8"));
  var sandbox = {
    document: doc,
    window: {},
    navigator: {},
    console: console,
    setTimeout: setTimeout,
    fetch: function (url) {
      assert(url.indexOf("subjects.json") !== -1, "grid must read subjects.json");
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve(subjects); } });
    }
  };
  sandbox.window.document = doc;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, "assets/js/notes.js"), "utf8"), sandbox);
  return { sandbox: sandbox, grid: grid };
}

(async function () {
  var dom = makeDom();
  await dom.sandbox.window.__CN_REINIT.notes();
  await new Promise(function (r) { setImmediate(r); });
  assert.strictEqual(dom.grid.children.length, 5,
    "notes.js init must build the notes index grid when __CN_REINIT.notes is called");
  assert(dom.grid.children[0].href, "grid cards must link to subject pages");

  var indexHtml = fs.readFileSync(path.join(root, "notes/index.html"), "utf8");
  assert(indexHtml.indexOf('src="../assets/js/notes.js"') !== -1 ||
         indexHtml.indexOf('src="/assets/js/notes.js"') !== -1,
    "notes/index.html must load notes.js so the grid works on a direct load");
  assert(indexHtml.indexOf("fetch('../subjects.json')") === -1,
    "notes/index.html must not depend on an inline script the router skips");

  // 2. Every PDF link in the notes must point at a file that exists.
  var pages = [];
  function collect(dir) {
    fs.readdirSync(dir).forEach(function (name) {
      var full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) collect(full);
      else if (/\.html$/.test(name)) pages.push(full);
    });
  }
  collect(path.join(root, "notes"));
  var broken = [];
  pages.forEach(function (page) {
    var html = fs.readFileSync(page, "utf8");
    var re = /href="([^"]+\.pdf)"/g;
    var m;
    while ((m = re.exec(html))) {
      var target = path.resolve(path.dirname(page), m[1]);
      if (!fs.existsSync(target)) broken.push(path.relative(root, page) + " -> " + m[1]);
    }
  });
  assert.deepStrictEqual(broken, [], "broken PDF links: " + broken.join(", "));

  // 3. The collapsed player must expose a focusable, real button that opens it.
  var playerJs = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");
  var headStart = playerJs.indexOf("'<div class=\"yt-player__head\">'");
  var headEnd = playerJs.indexOf("'</div>' +", headStart);
  var head = playerJs.slice(headStart, headEnd);
  assert(/<button[^>]+id="yt-open"/.test(head),
    "collapsed player head needs a real button with id yt-open");
  assert(playerJs.indexOf('getElementById("yt-open").addEventListener("click"') !== -1,
    "yt-open must toggle the player");

  var playerCss = fs.readFileSync(path.join(root, "assets/css/player.css"), "utf8");
  var collapsed = playerCss.slice(playerCss.indexOf(".yt-player:not(.is-open) .yt-player__head {"),
    playerCss.indexOf(".yt-player:not(.is-open) .yt-player__mark {"));
  assert(collapsed.indexOf("#yt-open") === -1,
    "collapsed CSS must not hide the focusable opener");

  var queueStart = playerJs.indexOf("renderQueue = function");
  if (queueStart === -1) queueStart = playerJs.indexOf("function renderQueue");
  assert(playerJs.slice(queueStart, queueStart + 1400).indexOf("<button") !== -1,
    "queue items must be buttons so keyboard users can select them");

  console.log("p0 fixes tests ok");
})().catch(function (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
