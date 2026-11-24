# 002 — Add press feedback to player buttons

- **Status**: DONE
- **Commit**: 150b432
- **Severity**: LOW
- **Category**: 3. Physicality & origin (missing press feedback)
- **Estimated scope**: 1 file, ~10 lines changed

## Problem

The global player's transport controls respond on hover and focus but give no visual acknowledgement on press. Pressing play, pause, next, or the URL-row buttons feels like the interface did not register the tap, especially on touch where there is no hover state.

Current code, verbatim:

```css
/* assets/css/player.css:180-191 — current */
.yt-player button {
  ...
  transition: border-color 0.18s ease, background 0.18s ease;
}
.yt-player button:hover { border-color: var(--player-yellow); background: rgba(242, 193, 78, 0.08); }
.yt-player button:focus-visible { outline: 2px solid var(--player-yellow); outline-offset: 2px; }
```

## Target

```css
/* assets/css/player.css — target */
.yt-player button {
  /* existing declarations unchanged */
  transition: border-color 0.18s ease,
              background 0.18s ease,
              transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.yt-player button:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .yt-player button:active { transform: none; background: rgba(242, 193, 78, 0.12); }
}
```

`scale(0.97)` is inside the documented 0.95–0.98 press range; 160ms is at the top of the 100–160ms button-press budget. The curve `cubic-bezier(0.16, 1, 0.3, 1)` already appears in `assets/css/player.css:46`, so no new token is introduced.

## Repo conventions to follow

- Plain CSS in `assets/css/player.css`; no motion library.
- The existing reduced-motion block is at `assets/css/player.css:405-407`. Add the reduced-motion `:active` rule inside that existing block rather than creating a second media query.
- Existing hover feedback uses `rgba(242, 193, 78, 0.08)`; the reduced-motion fallback uses the same hue at `0.12` so colour feedback remains when movement is dropped.
- Do not touch `.yt-player__expand svg` (`assets/css/player.css:368`), which already has its own `transform 0.25s ease` rotation.

## Steps

1. In `assets/css/player.css`, edit the `.yt-player button` rule near line 180: extend its `transition` declaration with `transform 160ms cubic-bezier(0.16, 1, 0.3, 1)`, keeping the existing `border-color` and `background` transitions in the same declaration.
2. Immediately after the `.yt-player button:focus-visible` rule, add `.yt-player button:active { transform: scale(0.97); }`.
3. Inside the existing `@media (prefers-reduced-motion: reduce)` block at line 405, add `.yt-player button:active { transform: none; background: rgba(242, 193, 78, 0.12); }`.
4. Add a small regression assertion in `tests/player-ui.test.js` (or a new test file) that reads `assets/css/player.css` and checks for `transform 160ms cubic-bezier(0.16, 1, 0.3, 1)`, `button:active { transform: scale(0.97) }`, and the reduced-motion `background: rgba(242, 193, 78, 0.12)` fallback.

## Boundaries

- Do NOT change the player markup, any button handler in `assets/js/player.js`, or any other component's buttons.
- Do NOT add `:active` transform to links or to `.yt-player__expand svg`.
- Do NOT use `scale(0)`, keyframes, or `transition: all`.
- If a cited line has drifted from commit 150b432, STOP and report instead of improvising.

## Verification

- **Mechanical**: run the full suite with
  `$tests = Get-ChildItem "tests\*.test.js" | ForEach-Object { $_.FullName }; foreach($t in $tests){ node $t; if($LASTEXITCODE -ne 0){ Write-Host "FAILED: $t"; break } }`
  Expected: all tests pass, including the new assertion.
- **Feel check**: open any chapter page, expand the player, and press and hold the play/pause control on desktop. Confirm the button shrinks slightly on press and returns on release within 160ms. Repeat on a phone or device emulator: the feedback must appear on touch without a hover state. Use the Animations panel at 10% playback to confirm the curve starts fast and eases out.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce` and press again. No scale change; the yellow background darkens instead, so feedback is still visible.
- **Done when**: all tests green, press feedback visible on touch, and no jank at 10% playback.
