# Now-playing Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the expanded music island as a now-playing card with art, title, channel, progress, transport, volume, and a position-based up-next list.

**Architecture:** Keep the existing IFrame player and all element IDs. `build()` emits a deck and a queue panel. `applyVideoData()` sets art/title/channel from `getVideoData()`. `startPoll()` watches `getPlaylistIndex()` and re-renders the queue on track changes. No new dependency.

**Tech Stack:** Plain ES5-style JavaScript, CSS, Node `assert` tests.

**Spec:** `docs/superpowers/specs/2026-11-24-island-now-playing-design.md`

## Global Constraints

- Static site, no backend, no API key, no new dependencies.
- Never detach `#yt-player`; SPA navigation must keep the iframe alive.
- IDs that existing handlers use stay unchanged: `yt-host`, `yt-status`, `yt-head-toggle`, `yt-expand`, `yt-url`, `yt-load`, `yt-seek`, `yt-time`, `yt-volume`, `yt-mute`, `yt-close`, `yt-player`.
- Fresh load keeps only the URL text; never auto-plays.
- No real upcoming titles: future slots are numbered placeholders.

## Review Focus

- A single-video link must not show four fake queue rows; it shows one row and a hint.
- Playlist link with `index=4` must start the queue at 04, not 01.
- Track auto-advance must move the current row and art without a reload.
- YouTube titles containing `<` or `&` must not break the queue markup.
- Volume slider and mute must still work after the markup restructure.

## Task 1: Deck and queue markup plus test

**Files:**
- Modify: `assets/js/player.js` (`icons`, `build`)
- Test: `tests/player-ui.test.js` (new)

**Interfaces:**
- Produces: new IDs `yt-art`, `yt-author`, `yt-prev`, `yt-next`, `yt-queue-list`. New classes `.yt-player__deck`, `.yt-player__queue`.

- [ ] **Step 1: Write the failing test**

`tests/player-ui.test.js` reads `assets/js/player.js` and asserts:
- source contains `id="yt-art"`, `id="yt-author"`, `id="yt-prev"`, `id="yt-next"`, `id="yt-queue-list"`, `id="yt-volume"`, `id="yt-seek"`;
- source contains `i.ytimg.com/vi/`, `getPlaylistIndex`, `playVideoAt`, `previousVideo`, `nextVideo`;
- source contains `class="yt-player__deck"` and `class="yt-player__queue"`.

- [ ] **Step 2: Run it and see it fail**

Run: `node tests/player-ui.test.js`
Expected: FAIL.

- [ ] **Step 3: Restructure `build()`**

Emit `.yt-player__deck` containing: mark + MUSIC eyebrow, art `<img id="yt-art">`, meta (`#yt-status`, `#yt-author`), progress (`#yt-seek`, `#yt-time`), transport (`#yt-prev`, `#yt-head-toggle`, `#yt-next`, `#yt-volume`, `#yt-mute`, `#yt-close`), link row (`#yt-url`, `#yt-load`). Emit `.yt-player__queue` with an `UP NEXT` header and `<ol id="yt-queue-list">`. Add `prev`/`next` SVG icons. Keep every existing event-binding ID and all existing listeners untouched.

- [ ] **Step 4: Run it and see it pass**

Run: `node tests/player-ui.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`feat: restructure island markup for now-playing card`

## Task 2: Metadata, art, queue behavior

**Files:**
- Modify: `assets/js/player.js` (`applyVideoData`, new `setMeta`/`renderQueue` helpers, `startPoll`)

**Interfaces:**
- Consumes: new IDs from Task 1 and `parseSource` from the playlist work.

- [ ] **Step 1: Extend the test**

Assert source contains a `setMeta` helper that reads `data.author` and `data.video_id`, an HTML escape helper used before `innerHTML`, and a `lastQueueIndex` variable in `startPoll`.

- [ ] **Step 2: Run it and see it fail**

Run: `node tests/player-ui.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement metadata and queue**

`setMeta(data)` sets title via `setTitle`, channel text, and art src from `i.ytimg.com/vi/<video_id>/mqdefault.jpg`. Route `getVideoData()` results, oEmbed fallback and the polling path through it. `renderQueue()` gets the index from `player.getPlaylistIndex()` or the parsed link index, renders four rows for playlists (current plus three), one row plus hint otherwise, and binds a delegated click to `playVideoAt(index)`. Escape all inserted text. `startPoll()` calls `renderQueue()` when the index changes.

- [ ] **Step 4: Run all tests**

Run: `node tests/*.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`feat: show cover art and up-next queue in island`

## Task 3: CSS layout and visual check

**Files:**
- Modify: `assets/css/player.css`

**Interfaces:** none.

- [ ] **Step 1: Style the card**

Deck and queue side by side; expanded island `min(880px, calc(100vw - 1.5rem))`; queue ~280px with its own scroll; transport row holds volume, mute, close; art square with placeholder background; ellipsis on title and channel. At `max-width: 760px` stack queue below and narrow the island. Collapsed island stays 44px. Keep reduced-motion rules.

- [ ] **Step 2: Verify in browser**

Serve locally, paste a playlist link, stub the IFrame API, click play. Check art, title, channel, progress, volume, and four queue rows at 1440px and 360px. Repeat with the LIGHT theme.

- [ ] **Step 3: Commit, merge, push, verify live**

Commit `ui: lay out island as now-playing card with queue`, merge into `master` (other agents active there), push, fetch live JS/CSS to confirm.
