# Music Player API Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `API` tab beside the existing `URL` tab in the expanded music island so a user's own YouTube Data API key populates `UP NEXT` with real playlist tracks or title-based suggestions, while playback stays in the one existing iframe.

**Architecture:** `assets/js/player.js` owns both modes. A `data-mode` attribute on `#yt-player` switches the deck between the unchanged URL row and a new API row holding key, URL and LOAD. API calls go straight from the browser to `www.googleapis.com`; results are mapped to the existing queue DOM. No server, no dependency, no second iframe.

**Tech Stack:** plain browser JS, plain CSS, Node `assert` tests, YouTube Data API v3 over `fetch`.

**Spec:** `docs/superpowers/specs/2026-11-25-music-api-tab-design.md`

## Global Constraints

- Five subjects only; no other site pages change.
- No new dependency, build step, or server. Static hosting stays as-is.
- Single iframe `#yt-player` persists across SPA navigation; never detach it.
- URL tab behaviour stays byte-for-byte the same, including its 700 ms auto-load.
- API mode fetches only on explicit LOAD; typing never calls the API.
- Key lives only in `localStorage` entry `classroom-notes-yt-api-key`, sent only to `www.googleapis.com`.
- Fresh load still clears song, timestamp and title; URL input and API key are restored.
- `UP NEXT` shows at most five items. Playlist header reads `UP NEXT`; single-video header reads `MORE LIKE THIS`.
- Existing easing and colour tokens only; no new motion or dependency.
- Full suite command: `$tests = Get-ChildItem "tests\*.test.js" | ForEach-Object { $_.FullName }; foreach($t in $tests){ node $t; if($LASTEXITCODE -ne 0){ Write-Host "FAILED: $t" } }`
- Local preview: `python -m http.server 8813 --bind 127.0.0.1` from the repo root.

## Review Focus

- Invalid or referrer-restricted key → inline error in API tab, previous playback untouched. Test in Task 2.
- Quota exhausted (`quotaExceeded`) → inline error naming quota, URL mode still usable. Test in Task 2.
- Search returns zero results → queue shows "No suggestions found" instead of stale items. Test in Task 2.
- Tab switched to `url` while a request is in flight → late response must not overwrite URL-mode queue. Test in Task 3.
- Fresh load with saved key → key restored, song still cleared. Test in Task 3.

---

### Task 1: Tab strip and API panel

**Files:**
- Modify: `assets/js/player.js` — `build()` markup near lines 182-212; add mode state.
- Modify: `assets/css/player.css` — `.yt-player__deck` grid near lines 201-212; add tab and API panel rules.
- Test: `tests/api-tab.test.js` (new)

**Interfaces:**
- Consumes: `window.ClassroomPlayer` object created in `player.js` (`setOpen` already exists).
- Produces: `window.ClassroomPlayer.setMode(mode)` where `mode` is `"url"` or `"api"`; sets `data-mode` on `#yt-player` and `aria-selected` on `#yt-tabs-url` / `#yt-tabs-api`.
- DOM ids created in `build()`: `#yt-tabs-url`, `#yt-tabs-api`, `#yt-api-key`, `#yt-api-url`, `#yt-api-load`, `#yt-api-status`.
- Default mode is `"url"`.

- [ ] **Step 1: Write the failing test**

Create `tests/api-tab.test.js`. Load `assets/js/player.js` in a Node `vm` context with a generic stub element (an object whose `addEventListener`, `setAttribute`, `getAttribute`, `classList.add/remove/toggle/contains`, `querySelector`, `appendChild`, and `style.setProperty` are no-ops, and whose `dataset`/`attrs` are plain objects). Make `document.getElementById` return that stub for any id, `document.createElement` return a fresh stub, and `localStorage` an in-memory map. After loading the script, assert:

```js
assert.strictEqual(typeof sandbox.window.ClassroomPlayer.setMode, "function");
sandbox.window.ClassroomPlayer.setMode("api");
assert.strictEqual(root.dataset.mode, "api");
assert.strictEqual(byId["yt-tabs-api"].attrs["aria-selected"], "true");
assert.strictEqual(byId["yt-tabs-url"].attrs["aria-selected"], "false");
sandbox.window.ClassroomPlayer.setMode("url");
assert.strictEqual(root.dataset.mode, "url");
```

Also assert the `build()` source contains each of the six new ids and that `player.css` contains `[data-mode="api"]` rules hiding `.yt-player__link` and showing `.yt-player__api`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/api-tab.test.js`
Expected: FAIL with `setMode is not a function`.

- [ ] **Step 3: Implement tab strip, API panel and mode switch**

In `build()`, add a tab row to the deck before the existing rows and an API panel after the link row. The API panel contains `#yt-api-key` (`input type="password"`, `autocomplete="off"`), `#yt-api-url` (`input type="url"`, same placeholder as `#yt-url`), `#yt-api-load` (button labelled `LOAD`), and `#yt-api-status` (status text). Add the ids from Interfaces. Give `#yt-player` `data-mode="url"` at build time. Implement `setMode(mode)` to accept only `"url"` or `"api"`, write `data-mode`, and set `aria-selected` on both tab buttons. Wire clicks on both tab buttons to `setMode("api")` / `setMode("url")`. Add `setMode` to `window.ClassroomPlayer`.

In `player.css`, add `tabs tabs` as the first area of `.yt-player__deck` and `api api` after `link link`. Style the tab buttons with existing `--player-line` / `--player-yellow` tokens and square corners. Add `[data-mode="api"]` rules that hide `.yt-player__link` and show `.yt-player__api`, and the reverse for `[data-mode="url"]`. Add an API status rule matching `.yt-player__status[data-error="true"]`.

- [ ] **Step 4: Run the test and full suite**

Run: `node tests/api-tab.test.js` then the full loop from `tests/`.
Expected: both pass; existing player tests unchanged.

- [ ] **Step 5: Commit**

```bash
git add assets/js/player.js assets/css/player.css tests/api-tab.test.js
git commit -m "feat: add URL/API tabs to music player"
```

---

### Task 2: API queue fetch and mapping

**Files:**
- Modify: `assets/js/player.js` — add API helpers after `parseSource()` near line 63; modify `renderQueue()` near lines 98-134; modify queue click handler near line 236.
- Test: `tests/api-tab.test.js`

**Interfaces:**
- Consumes: `apiQueue` (module-level array, initially `[]`), `setMode()` from Task 1, `parseSource()` and `escapeHtml()` already in `player.js`.
- Produces: `fetchApiQueue(key, source) -> Promise<{items: Array<{videoId:string,title:string,thumb:string}>, kind:"playlist"|"suggested"}>`; `apiQueue` array; `#yt-queue-title` holds the section heading.
- Queue item markup gains `data-video-id`; click handler plays that id when present.

**Endpoints and mapping (exact):**
- Playlist: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=<playlistId>&key=<key>`. Map `items[].snippet.resourceId.videoId`, `snippet.title`, `snippet.thumbnails.medium.url || snippet.thumbnails.default.url`.
- Single: `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=<videoId>&key=<key>` → `items[0].snippet.title`; then `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&order=relevance&q=<encodeURIComponent(title)>&key=<key>`. Map `items[].id.videoId`, `snippet.title`, `snippet.thumbnails.medium.url || snippet.thumbnails.default.url`.
- Errors: non-OK responses reject with the API `error.errors[0].reason` when present.

- [ ] **Step 1: Write the failing tests**

Append to `tests/api-tab.test.js`. Stub `fetch` in the vm sandbox to record URLs and return canned responses. Assert:

```js
// playlist path
const pl = await api.fetchApiQueue("KEY", { videoId: null, playlistId: "PL123", index: 1 });
assert.strictEqual(pl.kind, "playlist");
assert.strictEqual(pl.items.length, 2);
assert.strictEqual(pl.items[0].videoId, "vidOne");
assert(requests[0].indexOf("playlistId=PL123") !== -1);
assert(requests[0].indexOf("key=KEY") !== -1);

// single-video path
const one = await api.fetchApiQueue("KEY", { videoId: "vidA", playlistId: null, index: 1 });
assert.strictEqual(one.kind, "suggested");
assert.strictEqual(requests[1].indexOf("id=vidA") !== -1);
assert(requests[2].indexOf("q=" + encodeURIComponent("A Title")) !== -1);
```

Add three error tests: a `400` body with `reason: "keyInvalid"` rejects with `"keyInvalid"`; a `403` body with `reason: "quotaExceeded"` rejects with `"quotaExceeded"`; a search response with `items: []` resolves to `{kind:"suggested", items:[]}`. Expose `fetchApiQueue` as `window.ClassroomPlayer.api.fetchApiQueue` so the test can call it without a browser.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node tests/api-tab.test.js`
Expected: FAIL with `fetchApiQueue is not a function`.

- [ ] **Step 3: Implement API helpers and queue rendering**

Implement `fetchApiQueue` with the exact endpoints above. On success, set `apiQueue = result.items`, set `#yt-queue-title` text to `UP NEXT` for playlists and `MORE LIKE THIS` for suggestions, then call `renderQueue()`. In `renderQueue()`, when `apiQueue.length > 0`, render one button per item using `data-video-id`, the mapped title, and a thumbnail `<img>` inside `.yt-queue__thumb` when `thumb` is present; otherwise keep the current placeholder. When `apiQueue` is empty, keep the existing synthetic queue behaviour so URL mode is untouched. Update the queue click handler to call `player.loadVideoById(id, 0)` when `data-video-id` is present, falling back to the existing `playVideoAt` path.

- [ ] **Step 4: Run tests**

Run: `node tests/api-tab.test.js` and the full suite.
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add assets/js/player.js tests/api-tab.test.js
git commit -m "feat: populate player queue from YouTube Data API"
```

---

### Task 3: Key persistence, LOAD wiring, and stale-response guard

**Files:**
- Modify: `assets/js/player.js` — `init()` near lines 470-484; `build()` handlers; add load function.
- Modify: `assets/css/player.css` — API status and key input rules.
- Test: `tests/api-tab.test.js`

**Interfaces:**
- Consumes: `setMode()`, `fetchApiQueue()`, `apiQueue` from Tasks 1-2.
- Produces: `loadFromApi()` — reads `#yt-api-key` and `#yt-api-url`, validates via `parseSource()`, calls `fetchApiQueue()`, writes status to `#yt-api-status`, and calls the existing playback load path on success.
- A module-level `apiRequestId` counter guards against late responses.

- [ ] **Step 1: Write the failing tests**

Append to `tests/api-tab.test.js`:

```js
// key persistence and fresh-load rule
assert.strictEqual(localStorage.getItem("classroom-notes-yt-api-key"), "KEY");
assert.strictEqual(sandbox.window.ClassroomPlayer.stateForTest.url, "");

// no fetch on typing
sandbox.document.byId["yt-api-url"].value = "https://youtu.be/abc";
sandbox.document.byId["yt-api-url"].dispatch("input");
assert.strictEqual(requests.length, 0);

// invalid key error
await sandbox.window.ClassroomPlayer.loadForTest("BAD", { videoId: "vidA", playlistId: null, index: 1 });
assert.strictEqual(byId["yt-api-status"].textContent, "API key rejected. Check the key and its referrer restriction.");
```

Add a stale-response test: start two `fetchApiQueue` calls, switch mode to `"url"` with `setMode("url")`, resolve the first late, and assert `apiQueueForTest` is still empty and `#yt-queue-title` unchanged.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node tests/api-tab.test.js`
Expected: FAIL on missing `loadForTest` / `apiRequestId`.

- [ ] **Step 3: Implement persistence, LOAD handler and guard**

In `build()`, restore the saved key into `#yt-api-key` and save it on `input`. Wire `#yt-api-load` click to `loadFromApi()`. Do not add an `input` auto-load handler to `#yt-api-url`. In `loadFromApi()`: read key and URL, validate with `parseSource()`, clear `#yt-api-status`, increment `apiRequestId`, call `fetchApiQueue()`, and ignore the result if the id is stale or mode is no longer `"api"`. On success, call the same playback path `loadFromInput()` uses for that source, then write a short success status. On rejection, map `keyInvalid` to `"API key rejected. Check the key and its referrer restriction."`, `quotaExceeded` to `"API quota exhausted for today. URL mode still works."`, and any other reason to `"YouTube API error: " + reason`. Leave playback state unchanged on errors. Expose `loadForTest`, `stateForTest` and `apiQueueForTest` on `window.ClassroomPlayer` for the tests.

In `player.css`, style `#yt-api-key` like the URL input and give `#yt-api-status` the same small type and error colour as `#yt-api-status[data-error="true"]`.

- [ ] **Step 4: Run full verification**

Run: full test loop from `tests/`.
Expected: all tests pass. Then open the deployed local page, expand the island, switch to `API`, enter a valid key and a playlist URL, click LOAD, and confirm `UP NEXT` fills with real titles. Repeat with a single video and confirm `MORE LIKE THIS` fills. Switch to `URL` tab and confirm the old flow still loads.

- [ ] **Step 5: Commit**

```bash
git add assets/js/player.js assets/css/player.css tests/api-tab.test.js docs/superpowers/specs/2026-11-25-music-api-tab-design.md docs/superpowers/plans/2026-11-25-music-api-tab.md
git commit -m "feat: wire API key persistence and guard stale queue responses"
```
