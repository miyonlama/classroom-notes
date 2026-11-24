"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");
var start = src.indexOf("  function parseSource(url) {");
var end = src.indexOf("  function fmt(seconds) {");
assert(start !== -1 && end !== -1 && end > start, "parser block not found in player.js");
var parseSource = new Function(src.slice(start, end) + "\nreturn parseSource;")();

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
  parseSource("https://music.youtube.com/watch?v=ABCDEFGHIJK").videoId,
  "ABCDEFGHIJK",
  "music subdomain video"
);

assert(src.indexOf("loadPlaylist") !== -1, "loadFromInput must call loadPlaylist");
assert(src.indexOf('listType: "playlist"') !== -1, "playlist listType must be set");
assert(src.indexOf("That is not a YouTube video or playlist URL.") !== -1, "error text must mention playlists");
assert(src.indexOf("playerVars.list = playlistId") !== -1, "createPlayer must pass list in playerVars");
assert(src.indexOf('playerVars.listType = "playlist"') !== -1, "createPlayer must set listType");
assert(src.indexOf("playerVars.index =") !== -1, "createPlayer must pass index in playerVars");

console.log("player link tests ok");
