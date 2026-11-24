"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var dir = path.join(root, "notes/discrete");
var files = fs.readdirSync(dir).filter(function (f) { return /^iq-.*\.html$/.test(f); });

function score(marks) {
  var segments = marks.split(",");
  var totals = segments.map(function (s) {
    return (s.match(/\d+/g) || []).reduce(function (a, b) { return a + Number(b); }, 0);
  });
  return {
    total: Math.max.apply(null, totals),
    parts: (marks.match(/\d+/g) || []).length
  };
}

files.forEach(function (f) {
  var s = fs.readFileSync(path.join(dir, f), "utf8");
  s.split('<article class="iq-card">').slice(1).forEach(function (card, i) {
    var m = card.match(/<b>Marks:<\/b>\s*([^<]+)/);
    assert(m, f + " card " + (i + 1) + " missing Marks");
    var v = score(m[1].trim());
    var answer = card.split('data-solution="done">', 2)[1];
    assert(answer, f + " card " + (i + 1) + " has no written answer");
    answer = answer.split("</div>")[0];
    var text = answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    var min = 260 * v.total;
    assert(text.length >= min,
      f + " card " + (i + 1) + " [" + m[1].trim() + "] has " + text.length +
      " chars, needs " + min + " for " + v.total + " marks");
    var paras = (answer.match(/<p>/g) || []).length;
    var minParas = v.total >= 10 ? 6 : 4;
    assert(paras >= minParas,
      f + " card " + (i + 1) + " has " + paras + " paragraphs, needs " + minParas);
    if (v.parts > 1) {
      var labels = (answer.match(/\d+ marks/g) || []).length;
      assert(labels >= v.parts,
        f + " card " + (i + 1) + " needs " + v.parts + " mark-labelled parts, found " + labels);
    }
  });
});

console.log("answer depth tests ok");
