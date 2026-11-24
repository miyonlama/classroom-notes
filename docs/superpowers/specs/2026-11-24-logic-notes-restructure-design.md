# Design: Logic and Proof Methods notes restructure

**Date:** 2026-11-24
**Status:** Approved by user

## Intent

Rebuild `notes/discrete/logic-and-proof-methods.html` as a structured, exam-aware study page using the user's supplied "Propositional Logic (22 pages) — Full Topic Breakdown with Priority Markings" format.

## Goals

- Reorganize the chapter into five parts: Propositional Logic, Propositional Equivalences, Predicates and Quantifiers, Rules of Inference, Methods of Proof.
- Keep the user's `★★★ / ★★ / ★` scale as **source emphasis** from the chapter PDF.
- Add a small `EXAM n` badge showing past-paper appearances, extracted from `C:\Users\lamam\Downloads\Past Questions.pdf`.
- Add a top "Past exam hits" block with year and question references.
- Convert run-on textbook paragraphs into tables, step lists, worked examples, and `<details>` solutions.
- Preserve syllabus rail, study toggle, recall cues, summary/recall block, revision tracker, and global player.

## Non-goals

- Other Discrete Structure chapters.
- Regenerating or replacing the source PDF.
- New JavaScript behavior.
- New dependencies.

## Constraints

- Static HTML and CSS only.
- Existing visual tokens in `DESIGN.md` remain authoritative.
- No new CSS colors outside the established palette and existing study-mode additions.
- Past-paper counts are derived from extracted PDF text, nine papers covering 2078–2082.
- Exam counts are informational, not official weighting.

## Approaches

1. **Dual marking (chosen).** Keep source stars and add `EXAM n`. Preserves the user's scheme while using the past papers.
2. Replace stars with exam counts. Rejected: discards document emphasis and the user's requested format.
3. Separate exam appendix only. Rejected: disconnects the exam signal from each topic.

## Exam signals extracted

- Direct/indirect/contradiction proofs: 5 appearances (2078 Q1, 2079 Q4, 2080.2 Q7, 2081 Q10, 2082 Q2).
- Rules of inference: 3 appearances (2079 Q1, 2080.2 Q12, 2082 Q2).
- Quantifiers / predicate logic: 3 appearances (2080.1 Q1, 2081 Q4, 2082 Q2).
- Propositions: 2 appearances (2079 Q1, 2081 Q4).
- Tautology: 1 appearance (2078 Q4).
- Negation of statements: 1 appearance (2080.2 Q4).

## Page structure

1. Header, breadcrumb, study toggle, source line.
2. Priority legend explaining stars and `EXAM n`.
3. Past exam hits block.
4. Five numbered `<section>` parts with heading badges.
5. Tables for connectives, equivalence laws, inference rules, quantified inference rules, proof methods.
6. `<details>` blocks for worked examples and longer derivations.
7. Existing recall cues, summary/recall, revision tracker, chapter nav.

## Files

- Modify: `notes/discrete/logic-and-proof-methods.html`
- Modify: `assets/css/lecture-notes.css`
