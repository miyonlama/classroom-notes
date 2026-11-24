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
var scripts = ["/assets/js/study-tools.js", "/assets/js/player.js", "/assets/js/site-nav.js", "../../assets/js/lecture-notes.js"];

var all = "";
var cardCount = 0;
var figureSources = [];

files.forEach(function (f) {
  var p = path.join(chapterDir, f);
  assert(fs.existsSync(p), "missing page " + f);
  var s = fs.readFileSync(p, "utf8");
  all += s;
  assert(s.indexOf('class="masthead site"') !== -1, f + " missing masthead");
  assert(s.indexOf('id="syllabus-toggle"') !== -1, f + " missing contents toggle");
  assert(s.indexOf('<p class="syllabus-label">Syllabus</p>') !== -1, f + " missing Syllabus section");
  assert(/<p class="syllabus-label">\s*important questions\s*<\/p>/i.test(s), f + " missing IMPORTANT QUESTIONS section");
  var cursor = 0;
  scripts.forEach(function (src) {
    var at = s.indexOf('src="' + src + '"', cursor);
    assert(at !== -1, f + " missing script " + src);
    cursor = at + src.length;
  });
  var cards = s.split('<article class="iq-card">').slice(1);
  assert(cards.length > 0, f + " has no question cards");
  var done = (s.split('data-solution="done"').length - 1);
  var pending = (s.split('data-solution="pending"').length - 1);
  assert.strictEqual(done + pending, cards.length, f + " every card needs exactly one solution state");
  cards.forEach(function (card, i) {
    assert(card.indexOf("Frequency:") !== -1, f + " card " + (i + 1) + " missing Frequency");
    assert(card.indexOf("Marks:") !== -1, f + " card " + (i + 1) + " missing Marks");
    var isDone = card.indexOf('data-solution="done"') !== -1;
    assert(isDone || card.indexOf('data-solution="pending"') !== -1,
      f + " card " + (i + 1) + " has no solution state");
    if (!isDone) {
      assert(card.indexOf("Solution to be added.") !== -1,
        f + " card " + (i + 1) + " missing placeholder text");
    }
    var questionPart = card.slice(0, card.indexOf('data-solution='));
    if (questionPart.indexOf("<h3") !== -1) {
      assert(questionPart.indexOf("<ol") === -1, f + " card " + (i + 1) + " nests a list inside h3");
    }
  });
  cardCount += cards.length;
  assert(done >= 0, f + " solution states must be countable");
});

assert(cardCount >= 60, "full extraction expected at least 60 cards, got " + cardCount);

var numberTheory = fs.readFileSync(path.join(chapterDir, "iq-number-theory.html"), "utf8");
var irrationalCard = numberTheory.split('<article class="iq-card">').find(function (c) {
  return c.indexOf("irrational") !== -1;
});
assert(irrationalCard, "missing irrationality card");
assert(irrationalCard.indexOf("2080.1 (Q7)") !== -1 && irrationalCard.indexOf("2082 (Q2)") !== -1,
  "irrationality Frequency must list both papers");
assert(/<b>Marks:<\/b> 5/.test(irrationalCard), "irrationality Marks must be 5");
assert(irrationalCard.indexOf("data-solution=\"done\"") !== -1, "irrationality answer must be filled");
assert(irrationalCard.indexOf("Contradiction") !== -1, "answer must name the method");
var cssFile = fs.readFileSync(path.join(root, "assets/css/lecture-notes.css"), "utf8");
assert(cssFile.indexOf('.iq-solution[data-solution="done"]') !== -1,
  "written answers need readable styling");

var induction = fs.readFileSync(path.join(chapterDir, "iq-induction-and-recursion.html"), "utf8");
var inductionCard = induction.split('<article class="iq-card">').find(function (c) {
  return c.indexOf("2079 (Q7)") !== -1;
});
assert(inductionCard, "missing merged induction question card");
["2079 (Q7)", "2080.2 (Q2)", "2082 (Q6)"].forEach(function (year) {
  assert(inductionCard.indexOf(year) !== -1, "induction Frequency missing " + year);
});
assert(inductionCard.indexOf("4+6") !== -1, "induction Marks must include 4+6");
assert(inductionCard.indexOf("Marks:") !== -1 && /\b5\b/.test(inductionCard), "induction Marks must include 5");

assert(all.indexOf('<div class="iq-question">') !== -1, "multi-part questions need an iq-question block");
assert(all.indexOf('<ol class="subquestions">') !== -1, "multi-part questions need a sublist");

var figures = all.match(/<figure class="iq-figure">/g) || [];
assert.strictEqual(figures.length, 3, "expected three diagram figures, got " + figures.length);
var srcs = all.match(/src="(\/assets\/images\/iq-[^"]+)"/g) || [];
assert.strictEqual(srcs.length, 3, "expected three diagram image sources, got " + srcs.length);
srcs.forEach(function (m) {
  var rel = m.slice(5, -1);
  assert(fs.existsSync(path.join(root, rel)), "missing diagram image " + rel);
});

console.log("important questions page tests ok");
