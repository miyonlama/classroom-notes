"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(root, "assets/js/player.js"), "utf8");

[
  'id="yt-art"',
  'id="yt-author"',
  'id="yt-prev"',
  'id="yt-next"',
  'id="yt-queue-list"',
  'id="yt-volume"',
  'id="yt-seek"',
  'class="yt-player__deck"',
  'class="yt-player__queue"',
  "i.ytimg.com/vi/",
  "getPlaylistIndex",
  "playVideoAt",
  "previousVideo",
  "nextVideo",
  "function setMeta",
  "data.author",
  "data.video_id",
  "function escapeHtml",
  "lastQueueIndex"
].forEach(function (needle) {
  assert(src.indexOf(needle) !== -1, "player.js missing: " + needle);
});

var css = fs.readFileSync(path.join(root, "assets/css/player.css"), "utf8");
var headStart = css.indexOf(".yt-player:not(.is-open) .yt-player__head {");
var headEnd = css.indexOf("}", headStart);
assert(headStart !== -1 && headEnd !== -1, "collapsed head rule missing");
assert(
  css.slice(headStart, headEnd).indexOf("justify-content: center") !== -1,
  "collapsed play mark must be centered"
);

console.log("player ui tests ok");
