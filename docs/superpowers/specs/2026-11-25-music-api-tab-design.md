# Music player API tab — design

- **Date**: 2026-11-25
- **Size**: small feature
- **Status**: DRAFT — awaiting approval

## Intent

The expanded music island gets two tabs at the top of its deck: `URL` and `API`.
The `URL` tab stays exactly as it is today. The `API` tab takes the user's own
YouTube Data API key and makes `UP NEXT` actually populate: real upcoming
tracks from a playlist, and title-based suggestions when the link is a single
video. Playback, transport, volume, and the player's survival across page
navigation stay unchanged.

## Goals

- `URL` tab: no visual or behavioural change.
- `API` tab: key input plus the same URL input and LOAD button.
- Playlist link in API mode: `playlistItems.list` fills `UP NEXT` with the next
  tracks, including titles and thumbnails from the API response.
- Single video in API mode: `videos.list` reads the title, then `search.list`
  finds similar videos and fills `UP NEXT`.
- One iframe, one queue, one volume state. API mode never creates a second
  player.
- Invalid key, exhausted quota, or bad link shows an inline error; URL mode
  keeps working.

## Non-goals

- No server, proxy, build step, or dependency.
- No YouTube related-videos scraping or unofficial endpoints.
- No sharing of keys; no key in analytics, logs, or the repo.
- No second embedded mini player.
- No change to the fresh-load rule: song, timestamp, and title still clear;
  only the URL input and the API key are restored.

## Anti-goals

- Breaking playback across SPA navigation by detaching `#yt-player`.
- Silent API calls that burn quota while the user types.
- Presenting keyword suggestions as if they were YouTube's official related
  list.

## Constraints

- Static site, plain CSS and plain browser JS.
- `search.list` costs 100 quota units per call; `videos.list` and
  `playlistItems.list` cost 1 unit per page. Default budget is 10,000 units per
  day, per key.
- `search.list` `relatedToVideoId` was deprecated in 2023, so true related
  videos are not available from the official API.
- An API key pasted into a static page is visible in that browser. The user
  owns the key and should restrict it by HTTP referrer in Google Cloud.

## Approaches considered

1. **Playlist only** — exact playlist queue at ~1 unit per 50 items; single
   video leaves `UP NEXT` empty. Rejected: fails the single-video case.
2. **Playlist + title-based suggestions** — real playlist items; single video
   uses `videos.list` then `search.list` with the title as the query. Chosen:
   fills both cases through official APIs at a known cost.
3. **Unofficial related endpoint** — true related videos for a single clip.
   Rejected: unsupported, unstable, and a terms-of-service risk.

## Decisions (builder's calls, not user decisions)

- Tabs sit at the top of `.yt-player__deck` as two buttons, `URL` and `API`,
  using the existing chalkboard/yellow tokens and square corners.
- API mode reuses the same `#yt-url` input and LOAD button. It does not auto-
  load on typing, so quota is spent only on an explicit LOAD. URL mode keeps
  its current 700 ms auto-load.
- API key lives in its own `localStorage` entry, separate from the song state,
  restored on load like the URL input. It is an `input type="password"` with
  `autocomplete="off"`.
- API queue is memory-only and replaced on each successful LOAD.
- `UP NEXT` shows up to five items. API thumbnails are used when present; the
  existing gradient placeholder stays as fallback.
- Single-video suggestions are labelled in the queue header as suggestions,
  not as the playlist's upcoming tracks.
- On API errors the status line inside the API tab reports the cause, and the
  player state stays usable.

## Left to the builder

- Exact markup and CSS for the tab strip and API panel.
- Error string wording and the quota error mapping.
- Regression tests for tab switching, queue population from both API paths,
  error states, and unchanged URL-mode behaviour.
