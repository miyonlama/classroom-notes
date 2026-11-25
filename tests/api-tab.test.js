"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var rootDir = path.join(__dirname, "..");
var src = fs.readFileSync(path.join(rootDir, "assets/js/player.js"), "utf8");
var css = fs.readFileSync(path.join(rootDir, "assets/css/player.css"), "utf8");

function el() {
  var listeners = {};
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
    addEventListener: function (type, fn) {
      (listeners[type] = listeners[type] || []).push(fn);
    },
    dispatch: function (type, target) {
      var self = this;
      (listeners[type] || []).slice().forEach(function (fn) {
        fn.call(self, { target: target || self, preventDefault: function () {} });
      });
    },
    listenerCount: function (type) { return (listeners[type] || []).length; },
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
var loadVideoByIdCalls = [];
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
sandbox.window.YT = {
  Player: function () {
    this.setVolume = function () {};
    this.mute = function () {};
    this.unMute = function () {};
    this.loadVideoById = function (id, time) { loadVideoByIdCalls.push([id, time]); };
    this.loadPlaylist = function () {};
    this.getVideoData = function () { return { title: "API Song", video_id: "vidA" }; };
  }
};
// saved API key must survive the fresh-load reset
store["classroom-notes-yt-api-key"] = "KEY";
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

var realSetTimeout = sandbox.setTimeout;
var realClearTimeout = sandbox.clearTimeout;
var timers = [];
sandbox.setTimeout = function (fn, ms) {
  var handle = realSetTimeout(fn, ms);
  timers.push({ handle: handle, ms: ms, cleared: false });
  return handle;
};
sandbox.clearTimeout = function (handle) {
  timers.forEach(function (t) { if (t.handle === handle) t.cleared = true; });
  return realClearTimeout(handle);
};

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

// switching away from URL mode cancels the pending 700 ms auto-load
timers.length = 0;
var urlInputEl = sandbox.document.getElementById("yt-url");
urlInputEl.value = "https://youtu.be/pendingVid1";
urlInputEl.dispatch("input");
assert.strictEqual(timers.length, 1, "URL typing must schedule one auto-load");
assert.strictEqual(timers[0].ms, 700);
sandbox.window.ClassroomPlayer.setMode("api");
assert.strictEqual(timers[0].cleared, true, "leaving URL mode must clear pending auto-load");
sandbox.window.ClassroomPlayer.setMode("url");

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

  // ---- Task 3: key persistence, LOAD wiring, stale-response guard ----

  // saved key restored, song state still cleared on a fresh load
  var keyInput = sandbox.document.getElementById("yt-api-key");
  var apiUrlInput = sandbox.document.getElementById("yt-api-url");
  assert.strictEqual(keyInput.value, "KEY", "saved API key must be restored");
  assert.strictEqual(sandbox.localStorage.getItem("classroom-notes-yt-api-key"), "KEY");
  assert.strictEqual(sandbox.window.ClassroomPlayer.stateForTest.url, "", "fresh load must clear song");

  // key saved on input
  keyInput.value = "KEY2";
  keyInput.dispatch("input");
  assert.strictEqual(sandbox.localStorage.getItem("classroom-notes-yt-api-key"), "KEY2");
  keyInput.value = "KEY";
  keyInput.dispatch("input");
  assert.strictEqual(sandbox.localStorage.getItem("classroom-notes-yt-api-key"), "KEY");

  // LOAD wired; typing in the API URL never fetches
  requests.length = 0;
  assert.ok(sandbox.document.getElementById("yt-api-load").listenerCount("click") > 0, "LOAD button must be wired");
  apiUrlInput.value = "https://youtu.be/abc";
  apiUrlInput.dispatch("input");
  assert.strictEqual(apiUrlInput.listenerCount("input"), 0, "API URL must not auto-load");
  assert.strictEqual(requests.length, 0, "typing must not spend quota");

  // errors: exact strings, playback untouched
  sandbox.window.ClassroomPlayer.setMode("api");
  requests.length = 0;
  fetchStub = function () { return jsonResponse(400, { error: { errors: [{ reason: "keyInvalid" }] } }); };
  await sandbox.window.ClassroomPlayer.loadForTest("BAD", { videoId: "vidA", playlistId: null, index: 1 });
  assert.strictEqual(byId["yt-api-status"].textContent, "API key rejected. Check the key and its referrer restriction.");
  assert.strictEqual(byId["yt-api-status"].dataset.error, "true");
  assert.strictEqual(sandbox.window.ClassroomPlayer.stateForTest.url, "", "errors must not change playback");

  fetchStub = function () { return jsonResponse(403, { error: { errors: [{ reason: "quotaExceeded" }] } }); };
  await sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: null, playlistId: "PL123", index: 1 });
  assert.strictEqual(byId["yt-api-status"].textContent, "API quota exhausted for today. URL mode still works.");

  fetchStub = function () { return jsonResponse(400, { error: { errors: [{ reason: "badRequest" }] } }); };
  await sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: null, playlistId: "PL123", index: 1 });
  assert.strictEqual(byId["yt-api-status"].textContent, "YouTube API error: badRequest");

  // a late response must not populate the queue after switching to URL mode
  requests.length = 0;
  var pending = [];
  fetchStub = function () {
    return new Promise(function (resolve) { pending.push(resolve); });
  };
  sandbox.window.ClassroomPlayer.setMode("api");
  var firstPending = sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: null, playlistId: "PL_first", index: 1 });
  var secondPending = sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: null, playlistId: "PL_second", index: 1 });
  assert.strictEqual(pending.length, 2, "two requests must be in flight");
  sandbox.window.ClassroomPlayer.setMode("url");
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 0);
  var resolveLate = function (resolve) {
    resolve({
      ok: true,
      status: 200,
      json: function () {
        return Promise.resolve({ items: [{ snippet: { title: "Late", resourceId: { videoId: "lateVid" } } }] });
      }
    });
  };
  resolveLate(pending[0]);
  await firstPending;
  resolveLate(pending[1]);
  await secondPending;
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 0, "late response must not fill URL-mode queue");
  assert.strictEqual(byId["yt-queue-title"].textContent, "UP NEXT", "late response must not change reset queue heading");

  // success uses the same playback path as URL LOAD
  requests.length = 0;
  var step = 0;
  fetchStub = function () {
    step++;
    if (step === 1) return jsonResponse(200, { items: [{ snippet: { title: "Fetched Song" } }] });
    return jsonResponse(200, { items: [{ id: { videoId: "sugVid" }, snippet: { title: "Suggestion" } }] });
  };
  sandbox.window.ClassroomPlayer.setMode("api");
  var apiUrl = "https://youtu.be/vidA";
  var loaded = await sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: "vidA", playlistId: null, index: 1 }, apiUrl);
  assert.strictEqual(loaded.kind, "suggested");
  assert.strictEqual(sandbox.window.ClassroomPlayer.stateForTest.url, apiUrl, "API load must use playback load path");
  assert.strictEqual(byId["yt-api-status"].textContent, "Queue loaded — press play");
  assert.strictEqual(byId["yt-api-status"].dataset.error, "false");

  // queue-item click plays that video id
  var callsBeforeClick = loadVideoByIdCalls.length;
  var queueItem = sandbox.document.createElement("button");
  queueItem.setAttribute("data-video-id", "vidOne");
  byId["yt-queue-list"].dispatch("click", {
    closest: function (selector) {
      assert.strictEqual(selector, ".yt-queue__item");
      return queueItem;
    }
  });
  assert.strictEqual(loadVideoByIdCalls.length, callsBeforeClick + 1, "queue click must call loadVideoById");
  assert.deepStrictEqual(loadVideoByIdCalls[callsBeforeClick], ["vidOne", 0]);

  // leaving API mode resets the heading and API status
  sandbox.window.ClassroomPlayer.setMode("url");
  assert.strictEqual(byId["yt-queue-title"].textContent, "UP NEXT", "URL mode must reset queue heading");
  assert.strictEqual(byId["yt-api-status"].textContent, "", "URL mode must clear API status");
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 0);

  // close clears the API queue, heading and status
  sandbox.window.ClassroomPlayer.setMode("api");
  await sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: "vidA", playlistId: null, index: 1 }, apiUrl);
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 1);
  byId["yt-close"].dispatch("click");
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 0, "close must clear API queue");
  assert.strictEqual(byId["yt-queue-title"].textContent, "UP NEXT", "close must reset queue heading");
  assert.strictEqual(byId["yt-api-status"].textContent, "", "close must clear API status");
  assert.strictEqual(byId["yt-queue-list"].innerHTML.indexOf("data-video-id"), -1, "close must clear queue DOM");

  // an in-flight request must not repopulate the queue after close
  requests.length = 0;
  var closePending = [];
  fetchStub = function () {
    return new Promise(function (resolve) { closePending.push(resolve); });
  };
  var pendingCloseLoad = sandbox.window.ClassroomPlayer.loadForTest("KEY", { videoId: null, playlistId: "PL_close", index: 1 });
  assert.strictEqual(closePending.length, 1, "close test must have one request in flight");
  byId["yt-close"].dispatch("click");
  closePending[0]({
    ok: true,
    status: 200,
    json: function () { return Promise.resolve({ items: [{ snippet: { title: "Late", resourceId: { videoId: "lateVid" } } }] }); }
  });
  await pendingCloseLoad;
  assert.strictEqual(sandbox.window.ClassroomPlayer.apiQueueForTest().length, 0, "late response after close must not refill queue");
  assert.strictEqual(byId["yt-queue-title"].textContent, "UP NEXT", "late response after close must not change heading");

  console.log("api tab tests ok");
})().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
