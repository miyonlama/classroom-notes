"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var location = {
  href: "https://example.test/index.html",
  origin: "https://example.test",
  pathname: "/index.html",
  hash: ""
};
var setOpenCalls = [];
var opener = {
  attrs: {},
  setAttribute: function (k, v) { this.attrs[k] = v; },
  getAttribute: function (k) { return this.attrs[k]; }
};
var bodyChildren = [];
var body = {
  children: bodyChildren,
  appendChild: function (el) { bodyChildren.push(el); },
  removeChild: function (el) {
    var i = bodyChildren.indexOf(el);
    if (i !== -1) bodyChildren.splice(i, 1);
  }
};
var doc = {
  readyState: "complete",
  addEventListener: function () {},
  querySelectorAll: function () { return []; },
  createElement: function () { return {}; },
  importNode: function (el) { return el; },
  head: { appendChild: function () {}, querySelectorAll: function () { return []; } },
  body: body,
  dispatchEvent: function () {},
  getElementById: function (id) { return id === "yt-open" ? opener : null; }
};
var win = {
  __CN_REINIT: {},
  location: location,
  scrollTo: function () {},
  addEventListener: function () {},
  ClassroomPlayer: {
    setOpen: function (open) { setOpenCalls.push(open); }
  }
};
var html = "<!doctype html><html><head></head><body><main>ok</main></body></html>";
var sandbox = {
  window: win,
  document: doc,
  location: location,
  history: {
    pushState: function (state, title, href) {
      var url = new URL(href, location.href);
      location.href = url.href;
      location.pathname = url.pathname;
      location.hash = url.hash;
    }
  },
  fetch: function () { return Promise.resolve({ ok: true, text: function () { return Promise.resolve(html); } }); },
  DOMParser: function () {
    this.parseFromString = function () {
      return {
        querySelectorAll: function () { return []; },
        body: { children: [{ nodeType: 1, matches: function () { return false; } }] }
      };
    };
  },
  CustomEvent: function () {},
  setTimeout: setTimeout,
  URL: URL,
  console: console
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "assets/js/site-nav.js"), "utf8"), sandbox);

(async function () {
  await win.ClassroomNav.navigate("https://example.test/notes/index.html#music", true);
  assert.deepStrictEqual(setOpenCalls, [true],
    "#music navigation must go through ClassroomPlayer.setOpen so aria-expanded stays in sync");

  var playerJs = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");
  assert(playerJs.indexOf("window.ClassroomPlayer = { setOpen: setPlayerOpen }") !== -1,
    "player.js must expose setOpen for the router");

  console.log("music state tests ok");
})().catch(function (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
