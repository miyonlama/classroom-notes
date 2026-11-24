"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "notes/discrete/past-questions.html"), "utf8");
var css = fs.readFileSync(path.join(root, "assets/css/past-questions.css"), "utf8");
var js = fs.readFileSync(path.join(root, "assets/js/past-questions.js"), "utf8");

var sections = html.match(/<section class="paper[^"]*"[^>]*>[\s\S]*?<\/section>/g) || [];
assert.strictEqual(sections.length, 6, "six paper sections");

sections.forEach(function (section) {
  var open = section.slice(0, section.indexOf(">") + 1);
  assert(!/(?:^|\s)hidden(?:\s|=|>)/.test(open), "paper section still has hidden attribute: " + open);
  assert(/aria-hidden="true"/.test(open) && /\binert\b/.test(open), "missing aria-hidden or inert: " + open);
  assert(/\bpaper--collapsed\b/.test(open), "section must start collapsed to avoid a load flash: " + open);
  assert(section.indexOf('<div class="paper-inner">') !== -1, "paper section missing paper-inner");
  assert(section.indexOf('<div class="paper-body">') !== -1, "paper-inner missing paper-body");
  assert(/<\/div>\s*<\/section>$/.test(section), "paper-inner not closed");
});

assert(css.indexOf(".paper[hidden]") === -1, "stale hidden rule");
assert(css.indexOf("grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1)") !== -1,
  "missing measured-height transition");
assert(css.indexOf(".paper--collapsed { grid-template-rows: 0fr; opacity: 0; }") !== -1,
  "missing collapsed rule");
assert(css.indexOf(".chapter-reading .paper .paper-meta {") !== -1,
  "paper-meta selector broken by paper-inner wrapper");
assert(/\.chapter-reading \.paper \{[\s\S]*?border-top: 0;[\s\S]*?padding: 0;[\s\S]*?margin-top: 0;/.test(css),
  "paper must zero section box properties so collapsed height reaches zero");
assert(/\.paper > \.paper-inner \{[\s\S]*?overflow: hidden;[\s\S]*?min-height: 0;/.test(css),
  "paper-inner must be the clipping box with no padding of its own");
assert(/\.paper-inner > \.paper-body \{[\s\S]*?border-top: 1px solid var\(--line\);[\s\S]*?padding-top: 1\.6rem;/.test(css),
  "section border and padding must live on paper-body so the grid row removes them");
assert(css.indexOf(".chapter-reading .paper:first-of-type { padding-top: 0; }") !== -1,
  "first paper needs its inherited padding-top neutralised");
assert(css.indexOf(".chapter-reading .paper { transition: opacity 120ms !important; }") !== -1,
  "missing reduced-motion opacity fallback");
assert(js.indexOf("paper--collapsed") !== -1, "JS missing paper--collapsed");
assert(js.indexOf("inert") !== -1, "JS missing inert");
assert(js.indexOf("section.hidden") === -1, "JS still toggles hidden");

console.log("paper transition tests ok");
