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

var currentLabels = {
  "introduction-to-oop.html": oopUnits[0],
  "basics-of-cpp.html": oopUnits[1],
  "classes-and-objects.html": oopUnits[2],
  "operator-overloading.html": oopUnits[3]
};

var unitPages = [
  { file: "introduction-to-oop.html", next: "basics-of-cpp.html", prior: false },
  { file: "basics-of-cpp.html", next: "classes-and-objects.html", prior: "introduction-to-oop.html" },
  { file: "classes-and-objects.html", next: "operator-overloading.html", prior: "basics-of-cpp.html" },
  { file: "operator-overloading.html", next: "inheritance.html", prior: "classes-and-objects.html" }
];

unitPages.forEach(function (u) {
  var s = fs.readFileSync(path.join(root, "notes", "oop", u.file), "utf8");
  oopUnits.forEach(function (label) {
    assert(s.indexOf(label) !== -1, u.file + " is missing rail label: " + label);
  });
  assert.strictEqual((s.match(/aria-current="true"/g) || []).length, 1, u.file + " must mark one rail label");
  var railLi = s.match(/<li>\s*<a href="[^"]*" aria-current="true"[\s\S]*?<\/li>/);
  assert(railLi, u.file + " must mark its own rail label");
  assert(railLi[0].indexOf(currentLabels[u.file]) !== -1, u.file + " aria-current must sit on its own rail label");
  assert(s.indexOf('class="priority-mark"') !== -1, u.file + " is missing a priority mark");
  assert(s.indexOf('class="exam-mark">EXAM ') !== -1, u.file + " is missing an exam mark badge");
  assert(s.indexOf("syllabus and standard C++") !== -1, u.file + " source line must say syllabus and standard C++");
  assert(s.indexOf('class="revision-tracker" data-page="oop/' + u.file + '"') !== -1, u.file + " revision tracker data-page must be oop/" + u.file);
  assert(/<div class="codeblock">[\s\S]*?<button class="copy-btn"[\s\S]*?<\/div>/.test(s), u.file + " code block must contain a copy button");
  assert(s.indexOf("site-footer") !== -1, u.file + " is missing the site footer");
  assert(s.indexOf("/assets/js/study-tools.js") !== -1, u.file + " is missing study-tools.js");
  assert(s.indexOf("/assets/js/notes.js") !== -1, u.file + " is missing notes.js");
  assert(s.indexOf("/assets/js/player.js") !== -1, u.file + " is missing player.js");
  assert(s.indexOf("/assets/js/site-nav.js") !== -1, u.file + " is missing site-nav.js");
  assert(s.indexOf("../../assets/js/lecture-notes.js") !== -1, u.file + " is missing lecture-notes.js");
  assert(s.indexOf("/assets/js/study-tools.js") < s.indexOf("/assets/js/notes.js"), u.file + " scripts out of order: study-tools before notes");
  assert(s.indexOf("/assets/js/notes.js") < s.indexOf("/assets/js/player.js"), u.file + " scripts out of order: notes before player");
  assert(s.indexOf("/assets/js/player.js") < s.indexOf("/assets/js/site-nav.js"), u.file + " scripts out of order: player before site-nav");
  assert(s.indexOf("/assets/js/site-nav.js") < s.indexOf("../../assets/js/lecture-notes.js"), u.file + " scripts out of order: site-nav before lecture-notes");
  var navBlock = (s.match(/<div class="chapter-nav">[\s\S]*?<\/div>/) || [""])[0];
  if (u.prior) {
    assert(navBlock.indexOf('href="' + u.prior + '"') !== -1, u.file + " chapter nav must link previous " + u.prior);
  } else {
    assert(navBlock.indexOf("PREVIOUS CHAPTER") === -1, u.file + " chapter nav must not link a previous chapter");
  }
  assert(navBlock.indexOf('href="' + u.next + '"') !== -1, u.file + " chapter nav must link next " + u.next);
});

var basicsPage = fs.readFileSync(path.join(root, "notes/oop/basics-of-cpp.html"), "utf8");
var introPage = fs.readFileSync(path.join(root, "notes/oop/introduction-to-oop.html"), "utf8");
function headingCarriesExamBadge(html, needle) {
  var re = /<h3[^>]*>[\s\S]*?<\/h3>/g;
  var m;
  var n = needle.toLowerCase();
  while ((m = re.exec(html)) !== null) {
    if (m[0].toLowerCase().indexOf(n) !== -1 && /<span class="exam-mark">EXAM \d+<\/span>/.test(m[0])) return true;
  }
  return false;
}
["introduction-to-oop.html", "basics-of-cpp.html"].forEach(function (f) {
  var s = f === "introduction-to-oop.html" ? introPage : basicsPage;
  ["types", "arithmetic", "pointers and functions"].forEach(function (needle) {
    assert(!headingCarriesExamBadge(s, needle), f + " heading '" + needle + "' must not carry an EXAM badge");
  });
});

var classesUnitPage = fs.readFileSync(path.join(root, "notes/oop/classes-and-objects.html"), "utf8");
var operatorUnitPage = fs.readFileSync(path.join(root, "notes/oop/operator-overloading.html"), "utf8");
["Copy Constructor", "Friend Function", "this pointer"].forEach(function (needle) {
  assert(classesUnitPage.indexOf(needle) !== -1, "classes-and-objects.html is missing required string: " + needle);
});
["Pre-increment", "Post-increment", "String Concatenation"].forEach(function (needle) {
  assert(operatorUnitPage.indexOf(needle) !== -1, "operator-overloading.html is missing required string: " + needle);
});

console.log("oop subject tests ok");
