"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var rootDir = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(rootDir, "assets/js/player.js"), "utf8");
var css = fs.readFileSync(path.join(rootDir, "assets/css/player.css"), "utf8");

function el() {
  return {
    id: "",
    className: "",
    innerHTML: "",
    value: "",
    textContent: "",
    dataset: {},
    attrs: {},
    style: { setProperty: function () {} },
    classList: {
      add: function () {},
      remove: function () {},
      toggle: function () {},
      contains: function () { return false; }
    },
    addEventListener: function () {},
    appendChild: function () {},
    querySelector: function () { return el(); },
    setAttribute: function (k, v) { this.attrs[k] = v; },
    getAttribute: function (k) { return this.attrs[k]; }
  };
}

var byId = {};
var created = [];
var store = {};
var requests = [];
var fetchStub = function () { return Promise.reject(new Error("fetch stub not configured")); };
var sandbox = {
  window: {
    location: { hash: "", origin: "https://example.test" },
    addEventListener: function () {}
  },
  document: {
    readyState: "complete",
    body: { appendChild: function () {} },
    head: { appendChild: function () {} },
    addEventListener: function () {},
    createElement: function () {
      var e = el();
      created.push(e);
      return e;
    },
    getElementById: function (id) {
      if (!byId[id]) byId[id] = el();
      return byId[id];
    }
  },
  localStorage: {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); }
  },
  fetch: function (url) { requests.push(url); return fetchStub(url); },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

var root = created[0];
byId["yt-player"] = root;

assert.strictEqual(typeof sandbox.window.ClassroomPlayer.setMode, "function", "setMode is not a function");
sandbox.window.ClassroomPlayer.setMode("api");
assert.strictEqual(root.dataset.mode, "api");
assert.strictEqual(byId["yt-tabs-api"].attrs["aria-selected"], "true");
assert.strictEqual(byId["yt-tabs-url"].attrs["aria-selected"], "false");
sandbox.window.ClassroomPlayer.setMode("url");
assert.strictEqual(root.dataset.mode, "url");
assert.strictEqual(byId["yt-tabs-url"].attrs["aria-selected"], "true");
assert.strictEqual(byId["yt-tabs-api"].attrs["aria-selected"], "false");
sandbox.window.ClassroomPlayer.setMode("nonsense");
assert.strictEqual(root.dataset.mode, "url", "setMode must ignore unsupported modes");

[
  'id="yt-tabs-url"',
  'id="yt-tabs-api"',
  'id="yt-api-key"',
  'id="yt-api-url"',
  'id="yt-api-load"',
  'id="yt-api-status"'
].forEach(function (needle) {
  assert(src.indexOf(needle) !== -1, "player.js missing: " + needle);
});

function rule(selector) {
  var start = css.indexOf(selector + " {");
  assert(start !== -1, "player.css missing rule: " + selector);
  return css.slice(start, css.indexOf("}", start));
}

assert(/display:\s*none/.test(rule('[data-mode="api"] .yt-player__link')), "api mode must hide link row");
assert(/display:\s*(flex|block|grid)/.test(rule('[data-mode="api"] .yt-player__api')), "api mode must show api panel");
assert(/display:\s*(flex|block)/.test(rule('[data-mode="url"] .yt-player__link')), "url mode must show link row");
assert(/display:\s*none/.test(rule('[data-mode="url"] .yt-player__api')), "url mode must hide api panel");
assert(css.indexOf('.yt-player__api-status[data-error="true"]') !== -1, "api status error rule missing");

function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status: status,
    json: function () { return Promise.resolve(body); }
  });
}

function rejectedValue(promise) {
  return promise.then(function () { return null; }, function (err) { return err; });
}

(async function () {
  var api = sandbox.window.ClassroomPlayer.api;
  assert.ok(api && typeof api.fetchApiQueue === "function", "fetchApiQueue is not a function");
  assert(src.indexOf('id="yt-queue-title"') !== -1, 'player.js missing: id="yt-queue-title"');
  assert(src.indexOf('class="yt-player__queue-title">UP NEXT<') !== -1, "initial queue heading must be UP NEXT");

  // playlist path
  requests.length = 0;
  fetchStub = function () {
    return jsonResponse(200, {
      items: [
        { snippet: { title: "One", resourceId: { videoId: "vidOne" }, thumbnails: { medium: { url: "https://i.ytimg.com/vi/vidOne/mq.jpg" } } } },
        { snippet: { title: "Two", resourceId: { videoId: "vidTwo" }, thumbnails: { default: { url: "https://i.ytimg.com/vi/vidTwo/default.jpg" } } } }
      ]
    });
  };
  var pl = await api.fetchApiQueue("KEY", { videoId: null, playlistId: "PL123", index: 1 });
  assert.strictEqual(pl.kind, "playlist");
  assert.strictEqual(pl.items.length, 2);
  assert.strictEqual(pl.items[0].videoId, "vidOne");
  assert.strictEqual(pl.items[0].title, "One");
  assert.strictEqual(pl.items[0].thumb, "https://i.ytimg.com/vi/vidOne/mq.jpg");
  assert.strictEqual(pl.items[1].thumb, "https://i.ytimg.com/vi/vidTwo/default.jpg");
  assert.strictEqual(requests.length, 1);
  assert(requests[0].indexOf("playlistId=PL123") !== -1);
  assert(requests[0].indexOf("key=KEY") !== -1);
  assert(requests[0].indexOf("part=snippet") !== -1);
  assert(requests[0].indexOf("maxResults=5") !== -1);
  assert.strictEqual(byId["yt-queue-title"].textContent, "UP NEXT");
  var plHtml = byId["yt-queue-list"].innerHTML;
  assert(plHtml.indexOf('data-video-id="vidOne"') !== -1);
  assert(plHtml.indexOf("One") !== -1);
  assert(plHtml.indexOf('src="https://i.ytimg.com/vi/vidOne/mq.jpg"') !== -1);

  // single-video path
  requests.length = 0;
  var singleStep = 0;
  fetchStub = function () {
    singleStep++;
    if (singleStep === 1) {
      return jsonResponse(200, { items: [{ snippet: { title: "A Title" } }] });
    }
    return jsonResponse(200, {
      items: [
        { id: { videoId: "vidA" }, snippet: { title: "Suggest A", thumbnails: { medium: { url: "https://i.ytimg.com/vi/vidA/mq.jpg" } } } },
        { id: { videoId: "vidB" }, snippet: { title: "Suggest B", thumbnails: { default: { url: "https://i.ytimg.com/vi/vidB/default.jpg" } } } }
      ]
    });
  };
  var one = await api.fetchApiQueue("KEY", { videoId: "vidA", playlistId: null, index: 1 });
  assert.strictEqual(one.kind, "suggested");
  assert.strictEqual(one.items.length, 2);
  assert.strictEqual(one.items[0].videoId, "vidA");
  assert.strictEqual(one.items[0].title, "Suggest A");
  assert.strictEqual(one.items[1].thumb, "https://i.ytimg.com/vi/vidB/default.jpg");
  assert.strictEqual(requests.length, 2);
  assert(requests[0].indexOf("id=vidA") !== -1);
  assert(requests[0].indexOf("key=KEY") !== -1);
  assert(requests[1].indexOf("q=" + encodeURIComponent("A Title")) !== -1);
  assert(requests[1].indexOf("key=KEY") !== -1);
  assert(requests[1].indexOf("order=relevance") !== -1);
  assert.strictEqual(byId["yt-queue-title"].textContent, "MORE LIKE THIS");
  assert(byId["yt-queue-list"].innerHTML.indexOf('data-video-id="vidB"') !== -1);
  requests.forEach(function (url) {
    assert(url.indexOf("https://www.googleapis.com/youtube/v3/") === 0, "key must only reach googleapis: " + url);
  });

  // invalid key
  requests.length = 0;
  fetchStub = function () { return jsonResponse(400, { error: { errors: [{ reason: "keyInvalid" }] } }); };
  assert.strictEqual(await rejectedValue(api.fetchApiQueue("KEY", { videoId: null, playlistId: "PL123", index: 1 })), "keyInvalid");

  // exhausted quota
  requests.length = 0;
  fetchStub = function () { return jsonResponse(403, { error: { errors: [{ reason: "quotaExceeded" }] } }); };
  assert.strictEqual(await rejectedValue(api.fetchApiQueue("KEY", { videoId: null, playlistId: "PL123", index: 1 })), "quotaExceeded");

  // no suggestions
  requests.length = 0;
  var emptyStep = 0;
  fetchStub = function () {
    emptyStep++;
    if (emptyStep === 1) return jsonResponse(200, { items: [{ snippet: { title: "A Title" } }] });
    return jsonResponse(200, { items: [] });
  };
  var empty = await api.fetchApiQueue("KEY", { videoId: "vidA", playlistId: null, index: 1 });
  assert.strictEqual(empty.kind, "suggested");
  assert.strictEqual(empty.items.length, 0);
  assert.strictEqual(byId["yt-queue-list"].innerHTML, '<li class="yt-queue__empty">No suggestions found</li>');
  assert.strictEqual(byId["yt-queue-title"].textContent, "MORE LIKE THIS");

  console.log("api tab tests ok");
})().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
