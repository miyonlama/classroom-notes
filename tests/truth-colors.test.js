"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var css = fs.readFileSync(path.join(root, "assets/css/lecture-notes.css"), "utf8");
assert(css.indexOf(".bool-true { color: var(--bool-true); font-weight: 600; }") !== -1,
  "missing true class");
assert(css.indexOf(".bool-false { color: var(--bool-false); font-weight: 600; }") !== -1,
  "missing false class");
assert(css.indexOf("--bool-true: #7fdca0") !== -1 && css.indexOf("--bool-false: #ff8a80") !== -1,
  "missing dark theme values");
assert(css.indexOf("--bool-true: #166a43") !== -1 && css.indexOf("--bool-false: #b8422e") !== -1,
  "missing light theme values");

var html = fs.readFileSync(
  path.join(root, "notes/discrete/logic-and-proof-methods.html"), "utf8"
);
function count(needle) { return (html.split(needle).length - 1); }
assert(count('class="bool-true"') >= 20, "too few true values wrapped");
assert(count('class="bool-false"') >= 20, "too few false values wrapped");
assert(html.indexOf('<span class="bool-true">True</span>') !== -1, "True not wrapped");
assert(html.indexOf('<span class="bool-false">False</span>') !== -1, "False not wrapped");
assert(html.indexOf('<span class="bool-true">T</span>') !== -1, "T not wrapped");
assert(html.indexOf('<span class="bool-false">F</span>') !== -1, "F not wrapped");
assert(html.indexOf('<span class="bool-false">F</span>(') === -1, "predicate F(x) must stay plain");
assert(html.indexOf('aria-hidden="true"') !== -1, "attribute text must stay plain");
assert(html.indexOf('aria-pressed="false"') !== -1, "attribute text must stay plain");
assert(!/="[^"]*<span/.test(html), "HTML attribute corrupted by the replacement");

console.log("truth color tests ok");
