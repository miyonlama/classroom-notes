# Important Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an IMPORTANT QUESTIONS rail section and six exam-question pages to Discrete Structure, with real frequencies and marks from the past papers and placeholder solutions.

**Architecture:** Static HTML pages, no backend. The rail is plain markup copied into all seven existing chapter pages plus six new `iq-*.html` pages. Question cards are handwritten from `assets/pdfs/Past Questions.pdf`, with three diagram images extracted from that PDF. Styling lives in the existing `lecture-notes.css` using existing design tokens. The SPA router, player, and theme toggle stay untouched.

**Tech Stack:** Static HTML/CSS, Node `assert` tests, PyMuPDF (`pymupdf`) for one-time PDF image extraction.

**Spec:** `docs/superpowers/specs/2026-11-24-important-questions-design.md`

## Global Constraints

- Exactly five subjects; this change touches Discrete Structure only.
- Every distinct question in `assets/pdfs/Past Questions.pdf` (six papers: 2078, 2079, 2080.1, 2080.2, 2081, 2082) becomes a card. Skip nothing.
- Frequency and Marks come only from that PDF. No invented values.
- Same question in several papers merges into one card; Frequency lists every `YYYY (Qn)` occurrence; Marks lists every distinct printed value separated by `, `.
- Chapter names, order, and numbers 01–06 match the Syllabus rail exactly. No PQ row in the new section.
- Every solution block is `<div class="iq-solution" data-solution="pending"><p>Solution to be added.</p></div>`. Never write an answer.
- New pages keep `chalk-dust`, `projector-wash`, masthead, `study-toggle`, `syllabus-toggle`, both rail sections, footer, and the four scripts in the same order as `notes/discrete/induction-and-recursion.html`.
- No new dependency, no runtime question-loading JavaScript, no change to existing note content.
- Both dark and LIGHT themes must stay readable.

## Review Focus

- A merged card whose occurrences carry different marks (e.g. induction: `[5]` and `[4 + 6]`) must show every distinct mark. Pinned by `tests/important-questions.test.js` assertion on the induction card's Marks line (Task 2).
- Multi-part questions must not nest a list inside `<h3>`. Pinned by `tests/important-questions.test.js` assertion that `.iq-question ol` exists and no `h3` contains `<ol>` (Task 2).
- Diagram questions must not be lost: all three embedded figures exist and are referenced. Pinned by `tests/important-questions.test.js` assertions on `assets/images/iq-*.` files and `<figure class="iq-figure">` count (Task 2).
- The second rail section must not break the sticky rail or contents toggle on desktop or mobile. Pinned by `tests/important-questions-rail.test.js` assertions that all seven pages carry `syllabus-toggle` and the new section, plus the full existing suite including `chrome-ui.test.js` (Tasks 1 and 3).
- New pages must survive SPA navigation so the player keeps playing. Pinned by `tests/important-questions.test.js` assertion that each page includes `/assets/js/player.js`, `/assets/js/site-nav.js`, and `../../assets/js/lecture-notes.js` in that order (Task 2).

---

### Task 1: Rail section and card styles

**Files:**
- Modify: `assets/css/lecture-notes.css`
- Modify: `notes/discrete/sets-relations-functions.html`, `logic-and-proof-methods.html`, `trees-and-graphs.html`, `counting-and-discrete-probability.html`, `number-theory.html`, `induction-and-recursion.html`, `past-questions.html`
- Test: `tests/important-questions-rail.test.js`

**Interfaces:**
- Consumes: existing `.syllabus`, `.syllabus-label`, `.chapter-rail`, `.doc-shell` markup and tokens from `lecture-notes.css`.
- Produces: `.iq-rail` list markup present on all seven pages; `.iq-card`, `.iq-question`, `.iq-meta`, `.iq-solution`, `.iq-figure` classes available to Task 2.

- [ ] **Step 1: Write the failing rail test**

`tests/important-questions-rail.test.js`: for each of the seven `notes/discrete/*.html` chapter pages, assert the file contains `<p class="syllabus-label">Important Questions</p>` (case-insensitive label text acceptable), a `<ol class="chapter-rail iq-rail">` with exactly six `<li>` links, the six hrefs `iq-sets-relations-functions.html`, `iq-logic-and-proof-methods.html`, `iq-trees-and-graphs.html`, `iq-counting-and-discrete-probability.html`, `iq-number-theory.html`, `iq-induction-and-recursion.html`, the numbers `<b>01</b>` through `<b>06</b>`, and `id="syllabus-toggle"`. Assert `lecture-notes.css` contains `.iq-card`, `.iq-question`, `.iq-meta`, `.iq-solution`, `.iq-figure`, and `.iq-rail`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/important-questions-rail.test.js`
Expected: FAIL on the first page's missing label.

- [ ] **Step 3: Add CSS rules**

In `assets/css/lecture-notes.css`, after the `.priority-mark`/`.exam-mark` block, add rules for `.iq-rail` (spacing above the second section), `.iq-card` (bordered block with vertical rhythm), `.iq-question` (heading weight, no nested heading), `.iq-meta` (small dim label line for Frequency and Marks), `.iq-solution` (bordered or shaded placeholder area), `.iq-figure` (contained image with caption), using only existing CSS custom properties. Add an LIGHT-theme override only if a token cannot carry the contrast.

- [ ] **Step 4: Add the second section to all seven rails**

In each page's `<nav class="syllabus">`, after the existing `<ol class="chapter-rail">`, append a `<p class="syllabus-label">Important Questions</p>` and `<ol class="chapter-rail iq-rail">` with six `<li><a href="iq-….html"><b>0n</b><span>Chapter name</span></a></li>` rows, names and order copied from that page's Syllabus section. Do not add a PQ row.

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/important-questions-rail.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/css/lecture-notes.css notes/discrete/*.html tests/important-questions-rail.test.js
git commit -m "feat: add Important Questions rail section"
```

### Task 2: Question pages and diagram images

**Files:**
- Create: six `notes/discrete/iq-*.html` pages listed in Task 1
- Create: `assets/images/iq-2078-q3.jpg`, `iq-2081-q1.jpg`, `iq-2082-q8.png`
- Test: `tests/important-questions.test.js`

**Interfaces:**
- Consumes: `.iq-*` classes from Task 1; the rail markup pattern from `notes/discrete/induction-and-recursion.html`.
- Produces: six pages with every exam question as an `.iq-card`; three diagram images referenced by `<figure class="iq-figure">`.

- [ ] **Step 1: Write the failing page test**

`tests/important-questions.test.js`: assert each of the six `iq-*.html` files exists and contains the masthead, `syllabus-toggle`, both rail sections, the four scripts in the fixed order, at least one `.iq-card`, and for every card a `Frequency:` string, a `Marks:` string, and `data-solution="pending"` with the text `Solution to be added.`. Assert no `data-solution="done"` exists in any page. Assert the induction page has a card whose Frequency contains `2078 (Q7)`, `2079 (Q7)`, `2080.2 (Q2)`, `2082 (Q6)` and whose Marks contains both `5` and `4+6`. Assert `h3` never contains `<ol>` and at least one `.iq-question ol` exists across the pages. Assert three `<figure class="iq-figure">` blocks exist and their `src` files exist under `assets/images/`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/important-questions.test.js`
Expected: FAIL because the pages do not exist.

- [ ] **Step 3: Extract the three diagram images**

Use PyMuPDF to extract the embedded images from pages 1, 6, and 8 of `assets/pdfs/Past Questions.pdf` into the three `assets/images/iq-*.` files above. Keep native format and resolution; do not rescale.

- [ ] **Step 4: Build the six question pages**

For each paper in `assets/pdfs/Past Questions.pdf`, transcribe every question into clean text, repairing math notation split across PDF text lines (write `n(n+1)/2`, `n²`, `aₙ = 4aₙ₋₁ + n²`, etc.). Group questions into the six chapters by best fit. Merge repeats into one card with every year/Q occurrence in Frequency and every distinct mark in Marks. Multi-part questions go in a `.iq-question` block with an `<ol>` sublist. The three diagram questions get `<figure class="iq-figure">` with the extracted image and a short caption. Use the page shell from `notes/discrete/induction-and-recursion.html`, set the crumb and footer to the chapter name, set `data-page` on the revision tracker to `discrete/iq-<chapter>.html`, and point `chapter-nav` back to the matching notes page. Every solution is the exact pending placeholder. Do not write answers.

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/important-questions.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/images notes/discrete/iq-*.html tests/important-questions.test.js
git commit -m "feat: add important question pages"
```

### Task 3: Full verification and deploy

**Files:**
- No source changes expected; fix only what verification exposes.

**Interfaces:**
- Consumes: both test files from Tasks 1 and 2.

- [ ] **Step 1: Run the full suite**

Run:
```bash
$tests = Get-ChildItem "tests\*.test.js" | ForEach-Object { $_.FullName }
foreach($t in $tests){ node $t; if($LASTEXITCODE -ne 0){ Write-Host "FAILED: $t"; break } }
```
Expected: all tests pass, including the nine existing ones.

- [ ] **Step 2: Check both themes in a browser**

Serve the worktree locally, open `notes/discrete/iq-induction-and-recursion.html` in dark and `#study` LIGHT, confirm the second rail section, a question card, a diagram card, and the placeholder are all legible. Check at 1200×800 and 360×640.

- [ ] **Step 3: Merge, push, verify live**

Commit any fix from the two checks above. Then:
```bash
git -C "C:\Users\lamam\classroom-notes" merge logic-notes-restructure --no-ff -m "merge: important questions"
git -C "C:\Users\lamam\classroom-notes" push
```
Wait for deploy, then fetch `https://classroom-notes-mocha.vercel.app/notes/discrete/iq-induction-and-recursion.html` and confirm it contains `Important Questions`, `data-solution="pending"`, and the induction Frequency line.
