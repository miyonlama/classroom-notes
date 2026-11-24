"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var subjects = JSON.parse(fs.readFileSync(path.join(root, "subjects.json"), "utf8"));
var discrete = subjects.find(function (s) { return s.slug === "discrete-structure"; });
assert.strictEqual(discrete.href, "discrete/sets-relations-functions.html",
  "Discrete Structure must open chapter 1 directly");

var stub = fs.readFileSync(path.join(root, "notes/discrete-structure.html"), "utf8");
assert(stub.indexOf("discrete/sets-relations-functions.html") !== -1,
  "old URL must redirect to chapter 1");

var chapterDir = path.join(root, "notes/discrete");
fs.readdirSync(chapterDir).filter(function (f) { return /\.html$/.test(f); }).forEach(function (f) {
  var s = fs.readFileSync(path.join(chapterDir, f), "utf8");
  assert(s.indexOf("../discrete-structure.html") === -1,
    f + " still links to the removed landing page");
  assert(s.indexOf("CHAPTER INDEX") === -1,
    f + " still has an index link with no destination");
});

["index.html", "notes/index.html"].forEach(function (rel) {
  var s = fs.readFileSync(path.join(root, rel), "utf8");
  assert(s.indexOf("discrete-structure.html") === -1, rel + " still links to the removed landing page");
});

console.log("subject link tests ok");
