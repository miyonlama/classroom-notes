# Design: YouTube playlist support in the music island

**Date:** 2026-11-24
**Status:** Approved
**Scope:** small change. `assets/js/player.js`, `assets/css/player.css`, one test.

## Intent

The island currently accepts one YouTube video link. A `watch?v=...&list=...&index=4` link plays that one video and drops the playlist; a bare `playlist?list=...` link is rejected. The user wants the island to accept playlist links and play through them. The status text should start right of the MUSIC label, not hug the play/expand buttons.

## Goals

- Accept watch, embed, shorts, live, youtu.be, `music.youtube.com`, and bare `playlist?list=` links.
- Play a playlist in order, using the link's `index` as the starting track.
- Keep the existing single-video path unchanged.
- Update the title as the playlist advances.
- Left-align the status text beside MUSIC.

## Non-goals

- No search or user-upload list types.
- No queue UI, shuffle, or repeat controls.
- No change to restore behavior: fresh page load still restores only the URL text.

## Approaches

1. **IFrame `loadPlaylist` with `list` + `listType: "playlist"` (chosen).** The official API handles track advance and exposes `getVideoData()` for each new title. One extra branch in `loadFromInput`, one in `createPlayer`.
2. **Fetch playlist items through the YouTube Data API.** Needs an API key and a backend or exposed key. Rejected: the site is static and free.
3. **Parse the page HTML client-side.** Breaks on CORS and layout changes. Rejected.

## Design

- `parseSource(url)` returns `{ videoId, playlistId, index }` or `null`. `parseId()` becomes a thin wrapper over it for the single-video call sites.
- Playlist ID pattern: `[A-Za-z0-9_-]{10,}`. `index` is 1-based in URLs and 0-based in the API.
- If `playlistId` exists and a player is live, call `player.loadPlaylist({ list, listType: "playlist", index })`.
- If the player must be created, pass `list`, `listType: "playlist"`, and `index` in `playerVars` alongside `videoId`.
- `onStateChange` already calls `applyVideoData` on PLAYING, so an advancing playlist updates the title without new code.
- Error text becomes "That is not a YouTube video or playlist URL." The input auto-load check uses `parseSource`.
- CSS: `.yt-player__status` drops `margin-left:auto`, gains `flex:1; min-width:0`; the existing `max-width` caps it. Buttons stay at the far edge through `flex:none`.

## Left to the builder

- One Node test covering bare playlist, watch with list/index, youtu.be with list, plain video, and invalid input.
- Browser check of the expanded island in dark and `#study` themes.
- Commit, fast-forward `master`, push, verify live.
