# 001 — Ease the exam-paper switch

- **Status**: DONE
- **Commit**: 150b432
- **Severity**: MEDIUM
- **Category**: 8. Missed opportunities (state change teleports)
- **Estimated scope**: 3 files, ~60 lines changed

## Problem

Clicking a year in the past-question paper nav replaces one long exam document with another in a single frame. There is no bridge, so the reading position and the whole page contents appear to jump.

Current code, verbatim:

```js
/* assets/js/past-questions.js:13-16 — current */
function apply() {
  section.hidden = !expanded;
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
}
```

```css
/* assets/css/past-questions.css:43 — current */
.chapter-reading .paper[hidden] { display: none !important; }
```

```html
<!-- notes/discrete/past-questions.html:72 — current (six such sections) -->
<section class="paper" id="paper-2078" hidden>
```

## Target

Swap the `hidden` attribute for a collapsed class that can animate, using a measured grid row (the documented accordion exception to transform/opacity-only motion).

```css
/* assets/css/past-questions.css — target */
.chapter-reading .paper {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 160ms cubic-bezier(0.16, 1, 0.3, 1);
}
.chapter-reading .paper > .paper-inner { overflow: hidden; min-height: 0; }
.chapter-reading .paper.paper--collapsed { grid-template-rows: 0fr; opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .chapter-reading .paper { transition: opacity 120ms ease !important; }
}
```

```js
/* assets/js/past-questions.js — target, inside apply() */
section.classList.toggle("paper--collapsed", !expanded);
section.setAttribute("aria-hidden", expanded ? "false" : "true");
if (expanded) section.removeAttribute("inert");
else section.setAttribute("inert", "");
btn.setAttribute("aria-expanded", expanded ? "true" : "false");
```

```html
<!-- target shape for each of the six sections -->
<section class="paper" id="paper-2078" aria-hidden="true" inert>
  <div class="paper-inner">
    <!-- existing h2, p.paper-meta, h3, ol.question-list stay unchanged -->
  </div>
</section>
```

Duration 220ms sits inside the 150–250ms dropdown budget; 160ms opacity stays inside the 100–160ms feedback budget. The curve `cubic-bezier(0.16, 1, 0.3, 1)` already appears in `assets/css/hub.css:71` and `assets/css/player.css:46`, so no parallel easing token is invented.

## Repo conventions to follow

- Plain CSS only; no motion library exists in this repo.
- Existing transitions use literal `cubic-bezier(0.16, 1, 0.3, 1)` for entrances and `0.18s ease` for hover/colour changes. Copy those exact strings.
- Reduced motion is handled by a global block in `assets/css/lecture-notes.css:438`: `@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }`. The local reduced-motion rule above needs `!important` to restore the gentle opacity fade.
- Collapsed content must still be hidden from assistive tech: use `aria-hidden="true"` and `inert` together, as shown.

## Steps

1. In `notes/discrete/past-questions.html`, for each of the six `<section class="paper" id="paper-..." hidden>` elements (lines 72, 97, 128, 159, 192, 222): remove `hidden`, add `aria-hidden="true" inert`, and wrap all of the section's existing children in a single `<div class="paper-inner">`. Do not edit any question text.
2. In `assets/css/past-questions.css`, delete the `[hidden]` rule at line 43 and add the four rules from the Target block above.
3. In `assets/js/past-questions.js`, replace `section.hidden = !expanded;` inside `apply()` with the four lines from the Target block. Leave the click listener and the `__CN_REINIT` registration untouched.
4. Add a regression assertion to `tests/` of your choice (or a new `tests/paper-transition.test.js`) that reads all three files and checks: no `hidden` attribute remains on any `.paper` section, each section contains `paper-inner`, the CSS contains `grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1)`, and the JS contains `paper--collapsed` and `inert`.

## Boundaries

- Do NOT touch any other HTML page, any `iq-*.html` page, or the past-question text and counts.
- Do NOT change button behaviour, `aria-expanded`, or the paper nav markup.
- Do NOT add dependencies, JS animation libraries, or `@keyframes` — this must be a retargetable CSS transition.
- Do NOT animate on hover; paper switching is click-only.
- If any cited line has drifted from commit 150b432, STOP and report instead of improvising.

## Verification

- **Mechanical**: run every test with
  `$tests = Get-ChildItem "tests\*.test.js" | ForEach-Object { $_.FullName }; foreach($t in $tests){ node $t; if($LASTEXITCODE -ne 0){ Write-Host "FAILED: $t"; break } }`
  Expected: all tests pass, including the new assertion.
- **Feel check**: serve the repo locally and open `/notes/discrete/past-questions.html`. Click 2078, then 2082, then back to 2078. Confirm the outgoing section collapses from its measured height while fading, and the incoming one expands from zero. Rapidly click several years: the transition must retarget from its current height, never restart or flash. Check in DevTools Animations panel at 10% playback.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce` in the Rendering panel and repeat. Height must change instantly; only a 120ms opacity fade remains. Collapsed sections must still be unreachable by Tab.
- **Done when**: all tests green, no collapsed section is focusable, and no layout jump or double-exposure is visible at normal or 10% speed.
