"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");
var start = src.indexOf("  function parseSource(url) {");
var end = src.indexOf("  function fmt(seconds) {");
assert(start !== -1 && end !== -1 && end > start, "parser block not found in player.js");
var parsers = new Function(
  src.slice(start, end) + "\nreturn { parseSource: parseSource, parseId: parseId };"
)();
var parseSource = parsers.parseSource;
var parseId = parsers.parseId;

assert.deepStrictEqual(
  parseSource("https://www.youtube.com/playlist?list=PL1234567890abc"),
  { videoId: null, playlistId: "PL1234567890abc", index: 1 },
  "bare playlist link"
);
assert.deepStrictEqual(
  parseSource("https://www.youtube.com/watch?v=ABCDEFGHIJK&list=PL1234567890abc&index=4"),
  { videoId: "ABCDEFGHIJK", playlistId: "PL1234567890abc", index: 4 },
  "watch link with list and index"
);
assert.deepStrictEqual(
  parseSource("https://youtu.be/ABCDEFGHIJK?list=PL1234567890abc"),
  { videoId: "ABCDEFGHIJK", playlistId: "PL1234567890abc", index: 1 },
  "short link with list"
);
assert.deepStrictEqual(
  parseSource("https://www.youtube.com/shorts/ABCDEFGHIJK"),
  { videoId: "ABCDEFGHIJK", playlistId: null, index: 1 },
  "shorts link"
);
assert.strictEqual(parseSource("https://example.com/song"), null, "invalid link");
assert.strictEqual(
  parseId("https://music.youtube.com/watch?v=ABCDEFGHIJK"),
  "ABCDEFGHIJK",
  "music subdomain video"
);

console.log("player link tests ok");
