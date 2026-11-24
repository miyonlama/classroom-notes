# Design: Truth-value colors in chapter notes

**Date:** 2026-11-24
**Status:** Approved (scope 2 chosen by user)
**Scope:** `assets/css/lecture-notes.css`, `notes/discrete/logic-and-proof-methods.html`, one test.

## Intent

Truth values read as plain text. The user wants `True` green and `False` red so truth tables and worked proofs are easier to scan.

## Goals

- Add `.bool-true` and `.bool-false` utility classes with accessible green and red in both themes.
- Apply them to capitalized `True`/`False`, lowercase `true`/`false`, and standalone `T`/`F` in the Logic and Proof Methods chapter.
- Leave predicate symbols like `F(x)` alone.
- Leave HTML attributes (`aria-hidden="true"`, `aria-current="true"`, etc.) untouched.

## Non-goals

- No runtime highlighting JavaScript.
- No colorizing other subjects or future chapters automatically.
- No change to text wording or meaning.

## Approaches

1. **Manual spans + CSS classes (chosen).** Deterministic, no JS, no risk of rewriting attributes or predicate symbols.
2. **Runtime text-node highlighter.** Would cover future notes but needs exclusions and re-init hooks; more code than the eight-to-fifty occurrences justify.
3. **CSS-only content matching.** Not possible for arbitrary text.

## Design

- CSS: define `--bool-true` / `--bool-false` tokens in `:root`; override under `html[data-theme="study"]` for cream backgrounds. `.bool-true { color: var(--bool-true); font-weight: 600; }` and `.bool-false` likewise.
- HTML: single-pass replacement limited to text between tags, with a negative lookahead so `T`/`F` followed by `(` stays plain. Wrapped values keep their original case.
- Test: assert classes and theme overrides exist; assert the chapter contains wrapped truth values; assert `F(x)` and `aria-hidden="true"` are not corrupted.

## Left to the builder

- Apply the replacement, run all tests, verify dark and light screenshots, commit, merge into `master`, push, verify live.
