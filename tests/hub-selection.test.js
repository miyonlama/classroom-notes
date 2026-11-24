"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var src = fs.readFileSync(path.join(__dirname, "..", "assets/js/hub.js"), "utf8");
var match = src.match(/function isSelectedAtVisibleIndex\(visibleIndex\) \{([\s\S]*?)\n  \}/);
assert(match, "could not extract isSelectedAtVisibleIndex");

var subjects = [{ title: "a" }, { title: "b" }, { title: "c" }, { title: "d" }, { title: "e" }];
var visible = function () { return true; };
var selectedAt = new Function("subjects", "selected", "visible", "visibleIndex", match[1]);

assert.strictEqual(selectedAt(subjects, 0, visible, 0), true);
assert.strictEqual(selectedAt(subjects, 1, visible, 0), false);
assert.strictEqual(selectedAt(subjects, 1, visible, 1), true);
assert.strictEqual(selectedAt(subjects, 4, visible, 4), true);
assert.strictEqual(selectedAt(subjects, 4, visible, 3), false);

var onlyLast = function (s) { return s.title === "e"; };
assert.strictEqual(selectedAt(subjects, 4, onlyLast, 0), true);
assert.strictEqual(selectedAt(subjects, 0, onlyLast, 0), false);

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
assert(/id="slide-link" href="notes\/microprocessor-and-computer-architecture\.html"/.test(html),
  "static slide link does not match the first selected subject");
assert(html.indexOf('<h2 id="slide-title">Microprocessor and Computer Architecture</h2>') !== -1,
  "static slide title does not match the first selected subject");

console.log("hub selection tests ok");
