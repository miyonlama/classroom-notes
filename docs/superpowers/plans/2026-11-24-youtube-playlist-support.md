# YouTube Playlist Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the music island accept YouTube playlist links and start the title text beside the MUSIC label.

**Architecture:** Replace the single-ID parser with a source parser that returns video ID, playlist ID and 1-based index. The existing YouTube IFrame player gets one extra branch: `loadPlaylist` when live, `playerVars.list` when created. No new dependencies, no backend.

**Tech Stack:** Plain ES5-style JavaScript, CSS, Node `assert` tests.

**Spec:** `docs/superpowers/specs/2026-11-24-youtube-playlist-support-design.md`

## Global Constraints

- Static site, no backend, no API key.
- Keep the player DOM and `#yt-player` node intact across SPA navigation.
- Fresh page load restores only the URL text; never auto-plays.
- Keep existing single-video behavior byte-for-byte where possible.
- Maintain the LIGHT/DARK theme names in UI (`data-theme="study"` internally).

## Review Focus

- A bare `playlist?list=PL...` link has no `v`; it must still load and play the first track.
- A watch link with `&list=...&index=4` must start at track 4, not track 1.
- An invalid or non-YouTube link must show an error and must not clear the current song.
- The title must change when the playlist auto-advances.
- The status text must not overlap the MUSIC label or the play/expand buttons at 540px and at 360px.

## Task 1: Source parser and tests

**Files:**
- Modify: `assets/js/player.js:40-44`
- Test: `tests/player-links.test.js` (new)

**Interfaces:**
- Produces: `parseSource(url)` → `null` or `{ videoId: string|null, playlistId: string|null, index: number }`. `parseId(url)` → 11-char video ID or `null`, implemented via `parseSource`.

- [ ] **Step 1: Write the failing test**

`tests/player-links.test.js` loads `assets/js/player.js` source text, extracts the two parser functions with a regex, evaluates them, and asserts:
- `parseSource("https://www.youtube.com/playlist?list=PL1234567890abc")` → `playlistId: "PL1234567890abc"`, `videoId: null`, `index: 1`.
- `parseSource("https://www.youtube.com/watch?v=ABCDEFGHIJK&list=PL1234567890abc&index=4")` → that video ID, playlist ID, `index: 4`.
- `parseSource("https://youtu.be/ABCDEFGHIJK?list=PL1234567890abc")` → that video ID and playlist ID.
- `parseSource("https://www.youtube.com/shorts/ABCDEFGHIJK")` → that video ID, `playlistId: null`.
- `parseSource("https://example.com/song")` → `null`.
- `parseId("https://music.youtube.com/watch?v=ABCDEFGHIJK")` → `"ABCDEFGHIJK"`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/player-links.test.js`
Expected: FAIL, parser not exported yet.

- [ ] **Step 3: Implement `parseSource`**

Extract with one regex: optional video ID from `watch?v=`, `embed/`, `shorts/`, `live/`, `youtu.be/`, plus an optional `list=[A-Za-z0-9_-]{10,}` and optional `index=\d+` anywhere in the URL. Return `null` when neither ID exists. Replace `parseId` body with `var s = parseSource(url); return s ? s.videoId : null;`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/player-links.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add assets/js/player.js tests/player-links.test.js` then commit `feat: parse youtube playlist links`.

## Task 2: Wire playlists into the player

**Files:**
- Modify: `assets/js/player.js` (call sites of `parseId`, `loadFromInput`, `createPlayer`, error text)

**Interfaces:**
- Consumes: `parseSource` from Task 1.

- [ ] **Step 1: Write the test**

Extend `tests/player-links.test.js` with source-text assertions:
- `loadFromInput` contains `loadPlaylist` and `listType: "playlist"`.
- `createPlayer` `playerVars` contains `list:` and `index:`.
- Invalid-link message is exactly `That is not a YouTube video or playlist URL.`

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/player-links.test.js`
Expected: FAIL on the new assertions.

- [ ] **Step 3: Implement the branch**

In `loadFromInput`, call `parseSource(url)`; if `playlistId`, set `lastLoadedUrl` and call `player.loadPlaylist({ list: playlistId, listType: "playlist", index: (index || 1) - 1 })`; otherwise keep `loadVideoById(id, 0)`. When no player exists, pass the parsed playlist fields to `createPlayer(source)`. In `createPlayer`, spread those fields into `playerVars`. Update the auto-load check in the `input` handler and `init()` to use `parseSource`. Update the invalid-link message.

- [ ] **Step 4: Run all tests**

Run: `node tests/*.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add assets/js/player.js tests/player-links.test.js` then commit `feat: play youtube playlists in the island`.

## Task 3: Align the status text and verify in browser

**Files:**
- Modify: `assets/css/player.css:151-160`

**Interfaces:** none.

- [ ] **Step 1: Change the status rule**

Replace `margin-left:auto` with `flex:1; min-width:0`. Keep `max-width` and the ellipsis rules. Keep the `.is-open` max-width override.

- [ ] **Step 2: Verify visually**

Serve locally, open the chapter page, paste a playlist link, expand the island. Confirm the title starts right of MUSIC and the buttons stay at the far edge at 1440px and 360px. Repeat with `#study`.

- [ ] **Step 3: Commit, merge, push**

Commit `ui: start island status text beside music label`, then fast-forward `master` and push.

- [ ] **Step 4: Verify live**

Fetch `https://classroom-notes-mocha.vercel.app/assets/js/player.js` and `/assets/css/player.css`; confirm `loadPlaylist` and `flex:1` are present.
