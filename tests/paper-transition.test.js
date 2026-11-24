"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "notes/discrete/past-questions.html"), "utf8");
var css = fs.readFileSync(path.join(root, "assets/css/past-questions.css"), "utf8");
var js = fs.readFileSync(path.join(root, "assets/js/past-questions.js"), "utf8");

var sections = html.match(/<section class="paper"[^>]*>[\s\S]*?<\/section>/g) || [];
assert.strictEqual(sections.length, 6, "six paper sections");

sections.forEach(function (section) {
  var open = section.slice(0, section.indexOf(">") + 1);
  assert(!/(?:^|\s)hidden(?:\s|=|>)/.test(open), "paper section still has hidden attribute: " + open);
  assert(/aria-hidden="true"/.test(open) && /\binert\b/.test(open), "missing aria-hidden or inert: " + open);
  assert(section.indexOf('<div class="paper-inner">') !== -1, "paper section missing paper-inner");
  assert(/<\/div>\s*<\/section>$/.test(section), "paper-inner not closed");
});

assert(css.indexOf(".paper[hidden]") === -1, "stale hidden rule");
assert(css.indexOf("grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1)") !== -1,
  "missing measured-height transition");
assert(css.indexOf(".paper--collapsed { grid-template-rows: 0fr; opacity: 0; }") !== -1,
  "missing collapsed rule");
assert(css.indexOf(".chapter-reading .paper .paper-meta {") !== -1,
  "paper-meta selector broken by paper-inner wrapper");
assert(js.indexOf("paper--collapsed") !== -1, "JS missing paper--collapsed");
assert(js.indexOf("inert") !== -1, "JS missing inert");
assert(js.indexOf("section.hidden") === -1, "JS still toggles hidden");

console.log("paper transition tests ok");
