"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var KEY = "classroom-notes-yt-player";
var saved = {
  url: "https://www.youtube.com/watch?v=ABCDEFGHIJK&list=PL1234567890abc&index=4",
  time: 137,
  volume: 70,
  muted: false,
  title: "OLD SONG TITLE"
};
var store = {};
store[KEY] = JSON.stringify(saved);

global.localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem: function (k, v) { store[k] = String(v); }
};

function el() {
  return {
    value: "",
    innerHTML: "",
    textContent: "",
    dataset: {},
    max: "100",
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    addEventListener: function () {},
    querySelector: function () { return el(); }
  };
}
var elements = {};
global.document = {
  readyState: "complete",
  body: { appendChild: function () {} },
  head: { appendChild: function () {} },
  createElement: function () {
    return { className: "", id: "", innerHTML: "", classList: { add: function () {} }, querySelector: function () { return el(); } };
  },
  getElementById: function (id) {
    if (!elements[id]) elements[id] = el();
    return elements[id];
  },
  addEventListener: function () {}
};
global.window = {
  location: { hash: "", origin: "https://example.test" },
  addEventListener: function () {},
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

require(path.join(root, "assets/js/player.js"));

var after = JSON.parse(store[KEY]);
assert.strictEqual(after.url, "", "fresh load must not keep saved playback URL");
assert.strictEqual(after.time, 0, "fresh load must not keep saved timestamp");
assert.strictEqual(after.title, "", "fresh load must not keep saved title");
assert.strictEqual(
  elements["yt-url"].value,
  saved.url,
  "URL input should still show the saved link for convenience"
);

console.log("player restore tests ok");
