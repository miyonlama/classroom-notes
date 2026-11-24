# Design: Now-playing island with up-next queue

**Date:** 2026-11-24
**Status:** Awaiting approval
**Scope:** `assets/js/player.js`, `assets/css/player.css`, one new test.

## Intent

The expanded island is a thin URL bar with a title squeezed beside MUSIC. The user wants a player card: square cover art, title, channel, transport controls, progress, and an up-next list docked on the right. Chosen queue mode: **position-based**, no YouTube Data API key.

## Goals

- Cover art from the current video ID via `https://i.ytimg.com/vi/<id>/mqdefault.jpg`, with a neutral placeholder when unavailable.
- Title on line one, channel on line two, small MUSIC eyebrow above both.
- Progress bar with `elapsed / total` time.
- Previous, play/pause, next controls wired to `previousVideo()`, `playVideo()`, `nextVideo()`.
- Right-side queue for playlists: current track plus three upcoming slots, numbered from the link's `index` and updated from `getPlaylistIndex()` as tracks change. Track rows jump with `playVideoAt(index)`.
- Keep the URL input and LOAD button, the volume slider, the mute and close controls, collapsed circle, SPA persistence, and LIGHT/DARK chrome.
- Volume slider sits on the transport row beside prev / play / next, before mute and close.

## Non-goals

- No real upcoming titles or artwork: the IFrame API does not expose them. Future slots show `Track 05`, `Track 06`, `Track 07`; the current slot fills with the real title.
- No Data API key, proxy, search, shuffle, repeat, drag-to-reorder, or queue editing.
- No change to restore behavior: fresh load keeps only the URL text.

## Approaches

1. **Position queue (chosen).** Derive ordinals from `parseSource(state.url).index` and `player.getPlaylistIndex()`. Zero dependencies, works on every public or embeddable playlist.
2. **YouTube Data API v3.** Real titles and art, but needs a key in the browser or a proxy. Rejected: breaks the static, key-free setup.
3. **Unofficial YouTube internal endpoint.** No key, but brittle and CORS-dependent. Rejected.

## Design

- `build()` emits two regions inside `.yt-player`: `.yt-player__deck` (art, meta, progress, transport, link row) and `.yt-player__queue` (header `UP NEXT` + `<ol id="yt-queue-list">`).
- `icons` gains `prev` and `next`.
- `applyVideoData()` sets title, channel (`getVideoData().author`) and art (`getVideoData().video_id`) together through one `setMeta()` helper; the oEmbed fallback and polling path use it too. Escape all text inserted as HTML.
- `renderQueue()` reads `getPlaylistIndex()` when available, else the parsed link index. It renders four rows; single-video links show one row and a hint. Clicking a row calls `playVideoAt(index)`.
- `startPoll()` re-renders the queue when `getPlaylistIndex()` changes.
- The `#yt-seek`, `#yt-time`, `#yt-volume`, `#yt-mute`, `#yt-close`, `#yt-url` and `#yt-load` IDs stay unchanged so the existing handlers keep working.
- CSS: expanded island becomes `min(880px, calc(100vw - 1.5rem))`; deck and queue sit side by side, queue ~280px. At `max-width: 760px` the queue stacks below and the island narrows to `min(560px, calc(100vw - 1.5rem))`. Collapsed island stays 44px.
- The mockup's dark card look stays in both themes; the expanded island is not theme-swapped, matching the current design.

## Left to the builder

- `tests/player-ui.test.js` pinning the new IDs, `getPlaylistIndex`, `playVideoAt`, `previousVideo`, `nextVideo`, and the art URL pattern.
- Browser check at 1440px and 360px with a playlist link, using a stubbed IFrame API.
- Commit, merge into `master` (other agents are active there), push, verify live.
