# Design: Important Questions section

**Date:** 2026-11-24
**Status:** Approved (user: full extraction, embed diagrams)
**Scope:** `notes/discrete/*.html` rails, six new question pages, `assets/css/lecture-notes.css`, one test.

## Intent

The Syllabus rail lists six chapters. The user wants a second category in that rail, "IMPORTANT QUESTIONS", with the same six chapter names. Each name opens a page of exam questions. Questions come from the real past papers. Answers are placeholders for now; the user will send answers later to replace them.

## Goals

- Add a second labeled section, `IMPORTANT QUESTIONS`, to the rail on all seven Discrete Structure pages.
- The section lists the same six chapters, numbered 01–06, same names as the Syllabus section.
- Six new pages, one per chapter, siblings of the current chapter pages: `iq-sets-relations-functions.html`, `iq-logic-and-proof-methods.html`, `iq-trees-and-graphs.html`, `iq-counting-and-discrete-probability.html`, `iq-number-theory.html`, `iq-induction-and-recursion.html`.
- Each question card shows: Question, Frequency (year + question number, e.g. `2079 (Q7), 2080.2 (Q2)`), Marks, Solution placeholder.
- Every distinct question from `assets/pdfs/Past Questions.pdf` (9 papers, 2078–2082) becomes a card. Nothing invented, nothing skipped.
- Frequency and Marks come only from those papers.
- A question repeated across years becomes one card with a combined Frequency list.
- Questions that need a diagram embed the figure cropped from the source PDF, so no exam question is lost.
- Merged cards list all distinct marks (e.g. `Marks: 5, 4+6`).
- Multi-part questions use a `.iq-question` block with a sublist, not a single `<h3>`.
- New pages reuse the Lecture Hall CSS, sticky rail, theme toggle, syllabus toggle, and global player.

## Non-goals

- No worked solutions yet. The user supplies answers later.
- No edits to existing note content, hub, or the five placeholder subject pages.
- No new frequencies guessed from chapter topics.
- No runtime question-loading JavaScript.

## Approaches

1. **Hardcode the second rail section into each page (chosen).** Matches the current structure: the rail is plain HTML in every chapter page. Smallest diff; no JS refactor; existing rail tests keep working. Cost: the same list is repeated across pages.
2. **Generate the whole rail from a JS data array.** One source of truth, automatic on new pages. Cost: larger refactor, risk to sticky-rail and hover tests, moves markup out of HTML.
3. **One combined page with anchors per chapter.** Fewer files. Cost: does not match "same chapter names open their own thing", worse navigation.

## Design

- Rail: after the Syllabus `<ol class="chapter-rail">`, add `<p class="syllabus-label">Important Questions</p>` and a second `<ol class="chapter-rail iq-rail">` with six links to the `iq-*.html` files. Same `<b>01</b>`–`<b>06</b>` numbers and spans. No PQ row in the new section.
- Cards: `<article class="iq-card">` with `<h3 class="iq-question">` (or a `.iq-question` block with sublist for multi-part items), optional `<figure class="iq-figure">` with the cropped PDF image, `<p class="iq-meta">Frequency: … · Marks: …</p>`, and `<div class="iq-solution" data-solution="pending"><p>Solution to be added.</p></div>`.
- Placeholder marker: `data-solution="pending"` on every solution block. Later replacement swaps inner HTML and sets `data-solution="done"`.
- CSS: new `.iq-card`, `.iq-question`, `.iq-meta`, `.iq-solution`, `.iq-placeholder`, `.iq-rail` rules in `lecture-notes.css`, using existing tokens only. Reuse `.syllabus-label` for the header.
- JS: no new runtime code. New pages include the same scripts; `show()` exits early when `#chapter-title` is absent, so rail hover is harmless. Sticky rail and toggle run from existing selectors.
- Extraction: read all 9 papers from the PDF, group questions by best-fit chapter, dedupe repeats into one card with all year/Q occurrences, keep the printed marks.

## Left to the builder

- Extract and classify questions; keep a plain-text dump during extraction for verification.
- Apply rail edits to all seven existing pages and build six new pages.
- Add `tests/important-questions.test.js`: six pages exist, each has six IQ rail links, every card has Frequency, Marks, and a `pending` placeholder, no fabricated solution text, and all seven old rails contain the new section.
- Run all tests, screenshot dark and LIGHT, commit, merge into `master`, push, verify live.
