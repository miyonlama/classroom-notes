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

console.log("oop subject tests ok");
