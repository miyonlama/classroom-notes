"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var chapterDir = path.join(root, "notes/discrete");
var pages = [
  "sets-relations-functions.html",
  "logic-and-proof-methods.html",
  "trees-and-graphs.html",
  "counting-and-discrete-probability.html",
  "number-theory.html",
  "induction-and-recursion.html",
  "past-questions.html"
];
var hrefs = [
  "iq-sets-relations-functions.html",
  "iq-logic-and-proof-methods.html",
  "iq-trees-and-graphs.html",
  "iq-counting-and-discrete-probability.html",
  "iq-number-theory.html",
  "iq-induction-and-recursion.html"
];

pages.forEach(function (f) {
  var s = fs.readFileSync(path.join(chapterDir, f), "utf8");
  assert(/<p class="syllabus-label">\s*important questions\s*<\/p>/i.test(s),
    f + " missing IMPORTANT QUESTIONS rail label");
  var start = s.indexOf('<ol class="chapter-rail iq-rail">');
  assert(start !== -1, f + " missing iq-rail list");
  var list = s.slice(start, s.indexOf("</ol>", start));
  assert.strictEqual((list.match(/<li>/g) || []).length, 6, f + " iq-rail must have six links");
  hrefs.forEach(function (href) {
    assert(list.indexOf('href="' + href + '"') !== -1, f + " iq-rail missing " + href);
  });
  for (var i = 1; i <= 6; i++) {
    assert(list.indexOf("<b>" + String(i).padStart(2, "0") + "</b>") !== -1,
      f + " iq-rail missing chapter number " + i);
  }
  assert(list.indexOf("Past Questions") === -1, f + " iq-rail must not include PQ");
  assert(s.indexOf('id="syllabus-toggle"') !== -1, f + " toggle must survive the second section");
});

var css = fs.readFileSync(path.join(root, "assets/css/lecture-notes.css"), "utf8");
[".iq-rail", ".iq-card", ".iq-question", ".iq-meta", ".iq-solution", ".iq-figure"].forEach(function (cls) {
  assert(css.indexOf(cls + " ") !== -1 || css.indexOf(cls + "{") !== -1 || css.indexOf(cls + ",") !== -1,
    "missing CSS rule for " + cls);
});

console.log("important questions rail tests ok");
