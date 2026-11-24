"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var specs = [
  { file: "sets-relations-functions.html", parts: 3, minPriority: 20, minExam: 7, minDetails: 8, minTables: 6 },
  { file: "induction-and-recursion.html", parts: 4, minPriority: 15, minExam: 6, minDetails: 12, minTables: 2 },
  { file: "number-theory.html", parts: 4, minPriority: 15, minExam: 6, minDetails: 8, minTables: 4 }
];

specs.forEach(function (spec) {
  var file = path.join(root, "notes/discrete", spec.file);
  var s = fs.readFileSync(file, "utf8");

  assert.strictEqual((s.match(/class="topic-part"/g) || []).length, spec.parts, spec.file + " part count");
  for (var i = 1; i <= spec.parts; i++) {
    assert(s.indexOf('data-part="' + i + '"') !== -1, spec.file + " missing part " + i);
  }
  assert((s.match(/class="priority-mark"/g) || []).length >= spec.minPriority, spec.file + " priority marks");
  assert((s.match(/class="exam-mark"/g) || []).length >= spec.minExam, spec.file + " exam marks");
  assert((s.match(/<table class="topic-table">/g) || []).length >= spec.minTables, spec.file + " tables");
  assert((s.match(/<details>/g) || []).length >= spec.minDetails, spec.file + " details");
  assert(s.indexOf('class="exam-hits"') !== -1, spec.file + " exam hits");
  assert(s.indexOf('class="cue-block"') !== -1, spec.file + " recall cues");

  ["id=\"syllabus-toggle\"", "id=\"study-toggle\"", "id=\"syllabus\"",
    "class=\"revision-tracker\"", "class=\"chapter-nav\"",
    "study-tools.js", "player.js", "site-nav.js", "lecture-notes.js"].forEach(function (token) {
    assert(s.indexOf(token) !== -1, spec.file + " missing " + token);
  });
  assert(s.indexOf("CHAPTER INDEX") === -1, spec.file + " stale index link");
  assert(s.indexOf('href="sets-relations-functions.html">Discrete Structure<') !== -1, spec.file + " breadcrumb");

  var stack = [];
  var re = /<(\/?)(div|section|aside|table|details|summary|ol|ul|li|tr|td|th|thead|tbody|article|main|header|nav|footer)\b[^>]*>/g;
  var m;
  while ((m = re.exec(s))) {
    var name = m[2];
    if (m[1] === "/") {
      assert.strictEqual(stack.pop(), name, spec.file + " unbalanced " + name);
    } else {
      stack.push(name);
    }
  }
  assert.strictEqual(stack.length, 0, spec.file + " unclosed tags: " + stack.join(","));
});

console.log("three chapter tests ok");
