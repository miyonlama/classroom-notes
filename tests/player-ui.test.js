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

console.log("player ui tests ok");
