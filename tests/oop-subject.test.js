"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");

var oopUnits = [
  "Introduction to Object Oriented Programming",
  "Basics of C++ Programming",
  "Class and Objects",
  "Operator Overloading",
  "Inheritance",
  "Virtual Function, Polymorphism, and other C++ Features",
  "Function Templates and Exception Handling",
  "File and Streams",
  "Past Questions"
];

var subjects = JSON.parse(fs.readFileSync(path.join(root, "subjects.json"), "utf8"));
var oop = subjects.find(function (s) { return s.slug === "object-oriented-programming"; });
assert(oop, "subjects.json is missing the OOP entry");
assert.strictEqual(oop.href, "oop/introduction-to-oop.html", "OOP must open chapter 1 directly");
assert(oop.desc.indexOf("coming soon") === -1, "OOP description still says coming soon");

var stub = fs.readFileSync(path.join(root, "notes/object-oriented-programming.html"), "utf8");
assert(stub.indexOf("oop/introduction-to-oop.html") !== -1, "old OOP URL must redirect to chapter 1");
assert(stub.indexOf("location.replace") !== -1, "old OOP URL must redirect with location.replace");

var index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert(index.indexOf("Five subjects") !== -1, "hub must keep Five subjects");
assert(index.indexOf("Six subjects") === -1, "hub must not claim a sixth subject");

var hub = fs.readFileSync(path.join(root, "assets/js/hub.js"), "utf8");
assert(hub.indexOf('"object-oriented-programming"') !== -1, "hub.js is missing the OOP chapters entry");
var block = hub.match(/"object-oriented-programming":\s*\[([\s\S]*?)\]/);
assert(block, "could not read the OOP chapters array");
oopUnits.slice(0, 8).forEach(function (label) {
  assert(block[1].indexOf('"' + label + '"') !== -1, "hub.js OOP chapters missing: " + label);
});

var css = fs.readFileSync(path.join(root, "assets/css/lecture-notes.css"), "utf8");
assert(css.indexOf(".codeblock") !== -1, "lecture-notes.css is missing .codeblock");
assert(css.indexOf(".copy-btn") !== -1, "lecture-notes.css is missing .copy-btn");

var unitPages = [
  { file: "introduction-to-oop.html", next: "basics-of-cpp.html", prior: false },
  { file: "basics-of-cpp.html", next: "classes-and-objects.html", prior: "introduction-to-oop.html" }
];

unitPages.forEach(function (u) {
  var s = fs.readFileSync(path.join(root, "notes", "oop", u.file), "utf8");
  oopUnits.forEach(function (label) {
    assert(s.indexOf(label) !== -1, u.file + " is missing rail label: " + label);
  });
  assert.strictEqual((s.match(/aria-current="true"/g) || []).length, 1, u.file + " must mark one rail label");
  assert(s.indexOf('class="priority-mark"') !== -1, u.file + " is missing a priority mark");
  assert(s.indexOf('class="exam-mark">EXAM ') !== -1, u.file + " is missing an exam mark badge");
  assert(s.indexOf("syllabus and standard C++") !== -1, u.file + " source line must say syllabus and standard C++");
  assert(s.indexOf('class="revision-tracker" data-page="oop/' + u.file + '"') !== -1, u.file + " revision tracker data-page must be oop/" + u.file);
  assert(s.indexOf('class="codeblock"') !== -1, u.file + " is missing a code block");
  assert(s.indexOf('class="copy-btn"') !== -1, u.file + " code block is missing a copy button");
  assert(s.indexOf("site-footer") !== -1, u.file + " is missing the site footer");
  assert(s.indexOf("/assets/js/study-tools.js") !== -1, u.file + " is missing study-tools.js");
  assert(s.indexOf("/assets/js/player.js") !== -1, u.file + " is missing player.js");
  assert(s.indexOf("/assets/js/site-nav.js") !== -1, u.file + " is missing site-nav.js");
  assert(s.indexOf("../../assets/js/lecture-notes.js") !== -1, u.file + " is missing lecture-notes.js");
  assert(s.indexOf("/assets/js/study-tools.js") < s.indexOf("/assets/js/player.js"), u.file + " scripts out of order: study-tools before player");
  assert(s.indexOf("/assets/js/player.js") < s.indexOf("/assets/js/site-nav.js"), u.file + " scripts out of order: player before site-nav");
  assert(s.indexOf("/assets/js/site-nav.js") < s.indexOf("../../assets/js/lecture-notes.js"), u.file + " scripts out of order: site-nav before lecture-notes");
});

var introPage = fs.readFileSync(path.join(root, "notes/oop/introduction-to-oop.html"), "utf8");
assert(introPage.indexOf('href="basics-of-cpp.html"') !== -1, "unit 01 next chapter must be basics-of-cpp.html");
assert(introPage.indexOf("PREVIOUS CHAPTER") === -1, "unit 01 must not link a previous chapter");

var basicsPage = fs.readFileSync(path.join(root, "notes/oop/basics-of-cpp.html"), "utf8");
assert(basicsPage.indexOf('href="introduction-to-oop.html"') !== -1, "unit 02 previous chapter must be introduction-to-oop.html");
assert(basicsPage.indexOf('href="classes-and-objects.html"') !== -1, "unit 02 next chapter must be classes-and-objects.html");

console.log("oop subject tests ok");
