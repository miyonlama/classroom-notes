"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var chapterDir = path.join(root, "notes/discrete");
var pages = fs.readdirSync(chapterDir).filter(function (f) { return /\.html$/.test(f); });
assert.strictEqual(pages.length, 7);

pages.forEach(function (f) {
  var s = fs.readFileSync(path.join(chapterDir, f), "utf8");
  var navStart = s.indexOf('<nav class="syllabus"');
  var toggle = s.indexOf('id="syllabus-toggle"');
  assert(navStart !== -1 && toggle > navStart, f + " toggle must live inside the sidebar");
  assert(s.indexOf("<span>CONTENTS</span>") === -1, f + " toggle must be icon only");
  assert(s.slice(toggle, toggle + 400).indexOf("<svg") !== -1, f + " toggle missing icon");
});

var css = fs.readFileSync(path.join(root, "assets/css/lecture-notes.css"), "utf8");
var toggleRule = css.slice(css.indexOf(".syllabus-toggle {"), css.indexOf(".study-toggle {"));
assert(toggleRule.indexOf("position: fixed") !== -1, "toggle must stick to the screen");
assert(toggleRule.indexOf("border-radius: 50%") !== -1, "toggle must be a circle like the island icon");
var sidebarRule = css.slice(css.indexOf(".syllabus {"), css.indexOf(".reading {"));
assert(sidebarRule.indexOf("position: sticky") !== -1, "chapter list must stay visible while scrolling");
assert(css.indexOf(".doc-shell:not(.syllabus-collapsed) .syllabus-toggle {") !== -1,
  "open sidebar must move the toggle clear of the first chapter row");
assert(css.indexOf("left: calc(300px - 3.1rem)") !== -1,
  "open toggle must sit inside the rail edge");
assert(/@media \(max-width: 900px\)[\s\S]*?\.doc-shell\.syllabus-collapsed \.syllabus \{\s*display: block; height: 0;/.test(css),
  "collapsed mobile rail must keep the fixed contents button in the layout");
assert(css.indexOf("bottom: calc(1rem + env(safe-area-inset-bottom, 0px))") !== -1,
  "mobile contents button must dock clear of the chapter rail and folio");
assert(css.indexOf(".topic-table { display: block; overflow-x: auto; }") !== -1,
  "mobile tables must scroll inside the reading column");
var notesJs = fs.readFileSync(path.join(root, "assets/js/lecture-notes.js"), "utf8");
assert(notesJs.indexOf("function updateStickyRail") !== -1 &&
  notesJs.indexOf("76 - (window.scrollY") !== -1,
  "rail must slide up into the header gap and stop at the viewport top");
assert(css.indexOf("rgba(242,193,78,0.6)") === -1, "folio still hardcodes dark-theme gold");
assert(css.indexOf("color: var(--yellow); opacity: 0.6") !== -1, "folio must follow the theme");

pages.forEach(function (f) {
  var s = fs.readFileSync(path.join(chapterDir, f), "utf8");
  assert(s.indexOf('href="past-questions.html"') !== -1,
    f + " missing past questions link");
  assert(s.indexOf("<span>Past Questions</span>") !== -1, f + " missing past questions label");
});
assert(fs.existsSync(path.join(root, "assets/pdfs/Past Questions.pdf")), "past questions pdf missing");
var pq = fs.readFileSync(path.join(chapterDir, "past-questions.html"), "utf8");
assert(pq.indexOf('href="../../assets/pdfs/Past Questions.pdf" download') !== -1,
  "past questions page must still offer the original PDF");
assert(pq.indexOf('id="paper-2078"') !== -1 && pq.indexOf('id="paper-2082"') !== -1,
  "past questions page must carry the exam papers");

var playerCss = fs.readFileSync(path.join(root, "assets/css/player.css"), "utf8");
assert(playerCss.indexOf('html[data-theme="study"] .yt-player:not(.is-open)') !== -1,
  "collapsed island icon must change with the light theme");

var tools = fs.readFileSync(path.join(root, "assets/js/study-tools.js"), "utf8");
assert(tools.indexOf('"LIGHT"') !== -1 && tools.indexOf('"DARK"') !== -1,
  "theme button must say LIGHT / DARK");
assert(tools.indexOf("Study mode") === -1 && tools.indexOf("Dark mode") === -1,
  "old theme labels still present");

console.log("chrome ui tests ok");
