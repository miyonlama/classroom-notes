"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var chapterDir = path.join(root, "notes/discrete");
var files = [
  "iq-sets-relations-functions.html",
  "iq-logic-and-proof-methods.html",
  "iq-trees-and-graphs.html",
  "iq-counting-and-discrete-probability.html",
  "iq-number-theory.html",
  "iq-induction-and-recursion.html"
];

files.forEach(function (f) {
  var s = fs.readFileSync(path.join(chapterDir, f), "utf8");
  assert(s.indexOf('data-solution="pending"') === -1, f + " still has a pending answer");
  assert(s.indexOf("Solution to be added.") === -1, f + " still has placeholder text");
  var cards = s.split('<article class="iq-card">').slice(1);
  var done = (s.split('data-solution="done"').length - 1);
  assert.strictEqual(done, cards.length, f + " every card must have a written answer");
  cards.forEach(function (card, i) {
    var body = card.slice(card.indexOf('data-solution="done"'));
    assert(body.indexOf("<p>") !== -1, f + " answer " + (i + 1) + " has no paragraphs");
    var text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert(text.length >= 140, f + " answer " + (i + 1) + " is too short (" + text.length + " chars)");
    assert(card.indexOf("Frequency:") !== -1 && card.indexOf("Marks:") !== -1,
      f + " answer " + (i + 1) + " lost its Frequency or Marks line");
  });
});

console.log("answer completeness tests ok");
