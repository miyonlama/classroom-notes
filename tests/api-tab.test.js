"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var rootDir = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(rootDir, "assets/js/player.js"), "utf8");
var css = fs.readFileSync(path.join(rootDir, "assets/css/player.css"), "utf8");

function el() {
  return {
    id: "",
    className: "",
    innerHTML: "",
    value: "",
    textContent: "",
    dataset: {},
    attrs: {},
    style: { setProperty: function () {} },
    classList: {
      add: function () {},
      remove: function () {},
      toggle: function () {},
      contains: function () { return false; }
    },
    addEventListener: function () {},
    appendChild: function () {},
    querySelector: function () { return el(); },
    setAttribute: function (k, v) { this.attrs[k] = v; },
    getAttribute: function (k) { return this.attrs[k]; }
  };
}

var byId = {};
var created = [];
var store = {};
var sandbox = {
  window: {
    location: { hash: "", origin: "https://example.test" },
    addEventListener: function () {}
  },
  document: {
    readyState: "complete",
    body: { appendChild: function () {} },
    head: { appendChild: function () {} },
    addEventListener: function () {},
    createElement: function () {
      var e = el();
      created.push(e);
      return e;
    },
    getElementById: function (id) {
      if (!byId[id]) byId[id] = el();
      return byId[id];
    }
  },
  localStorage: {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); }
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

var root = created[0];
byId["yt-player"] = root;

assert.strictEqual(typeof sandbox.window.ClassroomPlayer.setMode, "function", "setMode is not a function");
sandbox.window.ClassroomPlayer.setMode("api");
assert.strictEqual(root.dataset.mode, "api");
assert.strictEqual(byId["yt-tabs-api"].attrs["aria-selected"], "true");
assert.strictEqual(byId["yt-tabs-url"].attrs["aria-selected"], "false");
sandbox.window.ClassroomPlayer.setMode("url");
assert.strictEqual(root.dataset.mode, "url");
assert.strictEqual(byId["yt-tabs-url"].attrs["aria-selected"], "true");
assert.strictEqual(byId["yt-tabs-api"].attrs["aria-selected"], "false");
sandbox.window.ClassroomPlayer.setMode("nonsense");
assert.strictEqual(root.dataset.mode, "url", "setMode must ignore unsupported modes");

[
  'id="yt-tabs-url"',
  'id="yt-tabs-api"',
  'id="yt-api-key"',
  'id="yt-api-url"',
  'id="yt-api-load"',
  'id="yt-api-status"'
].forEach(function (needle) {
  assert(src.indexOf(needle) !== -1, "player.js missing: " + needle);
});

function rule(selector) {
  var start = css.indexOf(selector + " {");
  assert(start !== -1, "player.css missing rule: " + selector);
  return css.slice(start, css.indexOf("}", start));
}

assert(/display:\s*none/.test(rule('[data-mode="api"] .yt-player__link')), "api mode must hide link row");
assert(/display:\s*(flex|block|grid)/.test(rule('[data-mode="api"] .yt-player__api')), "api mode must show api panel");
assert(/display:\s*(flex|block)/.test(rule('[data-mode="url"] .yt-player__link')), "url mode must show link row");
assert(/display:\s*none/.test(rule('[data-mode="url"] .yt-player__api')), "url mode must hide api panel");
assert(css.indexOf('.yt-player__api-status[data-error="true"]') !== -1, "api status error rule missing");

console.log("api tab tests ok");
