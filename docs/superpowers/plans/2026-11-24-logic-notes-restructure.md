# Logic Notes Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Logic and Proof Methods chapter page in the user's structured, priority-marked, exam-aware format.

**Architecture:** Add small CSS primitives for priority and exam badges, then replace the chapter article body with five structured parts. No JavaScript changes; existing study tools remain wired through their current IDs and classes.

**Tech Stack:** Static HTML, CSS, Python verification commands, Git, Vercel auto-deploy.

**Spec:** `docs/superpowers/specs/2026-11-24-logic-notes-restructure-design.md`

## Global Constraints

- Static HTML and CSS only.
- Use existing `DESIGN.md` tokens; no new literal colors.
- Preserve `id="study-toggle"`, `.cue-block`, `.recall-block`, `.revision-tracker`, and `.chapter-nav`.
- Preserve syllabus rail links and `aria-current="true"` on chapter 02.
- Exam counts are informational and extracted from nine past papers, 2078–2082.
- Do not modify other chapter pages.

## Review Focus

- Source stars must remain distinct from exam counts — verified by separate badge markup in Task 2.
- Long derivations must stay readable — verified by `<details>` count and screenshot in Task 3.
- Study mode contrast must not regress — verified by dark and `#study` screenshots in Task 3.
- Existing study tools must not be dropped — verified by ID/class grep in Task 3.
- No new design-system color drift — verified by `impeccable detect` in Task 3.

---

### Task 1: Add badge and topic-table styles

**Files:**
- Modify: `assets/css/lecture-notes.css`

**Interfaces:**
- Consumes: existing `--board-deep`, `--board-green`, `--yellow`, `--chalk`, `--chalk-dim`, `--line`, `--cue-bg`, `--cue-line` tokens.
- Produces: `.priority-mark`, `.exam-mark`, `.topic-table`, `.exam-hits`, `.worked-steps` used by Task 2.

- [ ] **Step 1: Append CSS for priority and exam badges**

Add rules using only existing tokens:

- `.priority-mark`: inline-block, yellow, letter-spaced, font-size `0.75rem`, no border.
- `.exam-mark`: inline-block, board-green text, 1px board-green border, square corners, font-size `0.7rem`, margin-left `0.5rem`.
- `.topic-table`: full width, max-width `70ch`, 1px `--line` borders, compact padding, left-aligned headers.
- `.exam-hits`: bordered panel using `--cue-bg` and `--cue-line`, max-width `70ch`.
- `.worked-steps`: ordered list with clear spacing inside `<details>`.

- [ ] **Step 2: Verify no new literal colors**

Run:

```sh
& "C:\Users\lamam\.config\opencode\skills\impeccable\scripts\impeccable.cmd" detect --json assets/css/lecture-notes.css
```

Expected: no findings for the newly added lines.

- [ ] **Step 3: Commit**

```sh
git add assets/css/lecture-notes.css
git commit -m "style: add priority and exam badges to notes"
```

### Task 2: Rewrite the chapter article body

**Files:**
- Modify: `notes/discrete/logic-and-proof-methods.html`

**Interfaces:**
- Consumes: classes from Task 1.
- Produces: five `<section class="topic-part">` blocks with `data-part="1"` through `data-part="5"`, each heading carrying one `.priority-mark` and, where applicable, one `.exam-mark`.

- [ ] **Step 1: Replace the article body between `.cue-block` and `.recall-block`**

Keep everything outside that range unchanged. Insert in order:

1. Priority legend explaining `★★★`, `★★`, `★`, and `EXAM n`.
2. `.exam-hits` panel listing the six exam signals from the spec.
3. Part 1 — Propositional Logic (pages 1–4), items 1–6 from the supplied structure.
4. Part 2 — Propositional Equivalences (pages 5–6), items 1–3.
5. Part 3 — Predicates and Quantifiers (pages 7–11), items 1–8.
6. Part 4 — Rules of Inference (pages 12–16), items 1–6.
7. Part 5 — Methods of Proof (pages 17–22), items 1–4.

- [ ] **Step 2: Use the exact structured content from the user's brief**

Preserve these specifics:

- All six connective truth behaviors and `¬ → ∧ → ∨ → → ↔` precedence.
- All implication wordings and converse/inverse/contrapositive.
- The 10 basic equivalence law names plus implication/biconditional equivalences.
- The two proof methods for equivalence and the three exercises.
- `∀`/`∃` essence as conjunction/disjunction, counterexample rule, free vs bound variables, negation rules.
- The 10 propositional inference rules, two fallacies, four quantified inference rules.
- Direct, indirect, vacuous, trivial, contradiction, exhaustive, equivalence, existence, uniqueness, counterexample proof methods.

- [ ] **Step 3: Convert dense material into scan-friendly markup**

- Use `.topic-table` for connectives, equivalence laws, inference rules, quantified rules, and proof methods.
- Use `<details>` with `<summary>` for worked examples, long derivations, and full past-question solutions.
- Use `.worked-steps` for numbered derivation steps.
- Keep all mathematical symbols as literal Unicode characters (`¬`, `∧`, `∨`, `→`, `↔`, `∀`, `∃`, `∴`, `★`).

- [ ] **Step 4: Verify structure with Python assertions**

Run:

```sh
python -c "s=open(r'C:\Users\lamam\classroom-notes\notes\discrete\logic-and-proof-methods.html',encoding='utf-8').read(); assert s.count('class=\"topic-part\"')==5; assert all('data-part=\"'+str(i)+'\"' in s for i in range(1,6)); assert 'class=\"exam-hits\"' in s; assert s.count('class=\"priority-mark\"')>=20; assert s.count('class=\"exam-mark\"')>=6; assert s.count('<details>')>=8; print('logic structure ok')"
```

Expected: `logic structure ok`.

- [ ] **Step 5: Commit**

```sh
git add notes/discrete/logic-and-proof-methods.html
git commit -m "content: restructure logic notes with priority and exam signals"
```

### Task 3: Visual verification and deploy

**Files:**
- No source files; verification only.

**Interfaces:**
- Consumes: committed pages from Task 2 and CSS from Task 1.

- [ ] **Step 1: Run detector on all touched files**

```sh
& "C:\Users\lamam\.config\opencode\skills\impeccable\scripts\impeccable.cmd" detect --json assets/css/lecture-notes.css notes/discrete/logic-and-proof-methods.html
```

Expected: `[]`.

- [ ] **Step 2: Verify preserved study hooks**

```sh
python -c "s=open(r'C:\Users\lamam\classroom-notes\notes\discrete\logic-and-proof-methods.html',encoding='utf-8').read(); [assert_token in s for assert_token in ['id=\"study-toggle\"','class=\"cue-block\"','class=\"recall-block\"','class=\"revision-tracker\"','class=\"chapter-nav\"','study-tools.js','player.js']]; print('study hooks ok')"
```

Expected: `study hooks ok`.

- [ ] **Step 3: Screenshot dark and study modes**

Start a local server on port 8781, then capture:

- `http://127.0.0.1:8781/notes/discrete/logic-and-proof-methods.html`
- `http://127.0.0.1:8781/notes/discrete/logic-and-proof-methods.html#study`

Inspect both images for table legibility, badge alignment, and no clipping.

- [ ] **Step 4: Push and verify deploy**

```sh
git push
```

Wait for Vercel, then fetch the live page and confirm `EXAM` and `Part 5` appear in the HTML.

- [ ] **Step 5: Commit verification artifacts if any**

```sh
git add -A
git commit -m "chore: add logic notes review screenshots"
```

Only if screenshots are intentionally kept.
