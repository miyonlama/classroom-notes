# Design: Classroom Notes — the Painted Board (Figma redesign)

**Date:** 2026-11-24
**Status:** Awaiting user approval
**Direction:** The Painted Board (impeccable direction roll, seed `seed:b7a59026dda7a6ff`, assigned card, chosen by user)
**Deliverable of this task:** a new Figma design file. No site code changes.

## Intent and why

The user's stated goal: **the visitor who should be impressed.** The hub is the front door and carries that job; the chapter page follows as a reading surface. The incumbent world (the Lecture Hall Projection) is being replaced, not polished: the hub's hero owns a large empty band, five equal cards squeeze long subject names into small type, and the chapter page shares no material with the hub, so hub and notes read as two products.

This task produces the replacement world as editable Figma layers plus tokens, at the sizes the site ships, so the code build has one reference and no guessing. Product truth (`PRODUCT.md`) is unchanged: free static hosting, no backend, five subjects, six Discrete Structure chapters, notes must stay reachable in few clicks.

## Goals

- A hub first viewport that impresses a first-time visitor and still hands over the active subject's chapter list and a working action, in the fold.
- The chapter page in the same world, kept a **Read** surface: structure and readability first, world in the frame.
- All direction tokens as Figma variables (colour, space, radius, type) and text styles, named for a 1:1 mapping to CSS custom properties.
- Frames at 1440 x 900 (desktop), 700 and 390 (the site's existing breakpoints), for the hub, the chapter page and the notes index.
- State coverage drawn, not described: hover, focus-visible, active, placeholder subject, empty filter, no-notes-yet.

## Non-goals

- Editing `index.html`, `assets/css/*`, `notes/*`, or `subjects.json`. This task ships no code.
- Rewriting copy. Only two strings are new and they are UI labels, not content (see "Copy").
- Inventing exam counts, chapter counts, or chapter names. All facts come from `subjects.json` and the existing chapter pages.
- Devanagari on the boards. Real boards are bilingual; the user decided against it, so boards stay Roman-only and no Nepali copy is invented.
- Other subjects' chapter content.
- Replacing `DESIGN.md`. That happens in the code build, not here.

## Anti-goals

- A painted poster with no working parts: a picture of a wall, with the offer or the action hidden behind decoration.
- Food-stall clutter: five saturated enamels, outlines and borders competing at equal volume.
- The template with paint on it: hero headline, row of equal cards, badge row.
- Any statement the site cannot back: exam weighting, "official", grades, prices.

## Constraints and commitments

- Static, free, no backend, no build step. Everything designed must be expressible in hand-written CSS and a little JS.
- Brand commitments kept: the name "Classroom Notes"; the five subject colours from `subjects.json` (`#4f8cff`, `#f2c14e`, `#51cf66`, `#cc5de8`, `#ff6b6b`) as identity tokens; Projector Yellow `#f2c14e` as the accent.
- Existing type kept for text: Source Sans 3 (body), Barlow Condensed available for numerals/labels. One new display face is added for board lettering (see "Type").
- Breakpoints stay 1100px and 700px.
- Craft floor applies: no kicker above a heading; icons are drawn SVG, never emoji or Unicode glyphs; contrast body >= 4.5:1 and large text >= 3:1; body measure 65-75ch on the chapter page; one authored motion moment; browser surfaces (caret, selection, scrollbar, focus ring) themed from the palette.

## Approaches considered

1. **Wireframe-and-paint in Figma (chosen).** Layout and material drawn as real Figma layers: auto-layout frames for structure, variables for tokens, one painted display face, hinge states as separate frames. Reasons: fully editable, tokens survive as variables, the code build maps region by region, and the same file holds both surfaces and every breakpoint.
2. **Generate raster comps first, then trace into Figma.** Rejected: the Figma design skill's hard gate forbids a flattened rendering as the deliverable, and a traced comp loses the layer structure the build needs.
3. **Capture the live site into Figma, then restyle.** Rejected: it imports the incumbent world we are replacing, and its value (pixel-exact layout) is worthless when the layout is what changes.

## The direction: The Painted Board

**World.** The hand-painted enamel shopboard wall of the bazaar: flat fields of enamel on primed board, thick painted borders, hand letterforms with a painted outline, hinges and board joints, paint wear at the edges.

**Why this direction for this product.** Signage is the persuasion medium itself, so the metaphor and the job agree. Subject colours become enamel field colours, so the identity tokens are not lost, they are the wall. Boards are real, mixed-width objects: the active one can swing forward and carry the chapter list, which fixes the incumbent's squeezed-card hierarchy. Subjects with no content yet are honest: primed grey boards with the name stencilled in outline, waiting for paint. Today that is every subject but Discrete Structure.

**The promise/instruction flip (from the declined seed-packet rack).** Each board is double-sided: the face carries the promise (subject name, chapter count), the reverse carries the instruction (description, chapter list, the open action). The swing is part of the system, not a hover trick.

**One painted size (from the declined timetable rack).** Board lettering is painted at one size. Rank comes from paint weight, case, reversal (painted vs knocked-out) and border rules, never from shrinking type. This directly answers the incumbent hub's small-type failure.

**The index strip (from the declined timetable rack).** A numbered strip along the wall top (01-05) shows where the visitor stands in the five-subject set from any board, at every width.

**Repaint (from the declined alphabet storm).** Filtering repaints the wall: a board that does not match is painted over with the ground colour and returns when the filter clears.

**One gesture (from the declined drawcord cape).** The swing is the single transform: the chosen board comes forward, the other four hang back.

**Palette (variables).**

| Token | Value | Role |
|---|---|---|
| `wall` | `#171310` | ground behind the boards |
| `board-primed` | `#3a3733` | unpainted board, placeholder subjects |
| `board-ivory` | `#efe6d2` | enamel ivory board field, reading paper |
| `paint-black` | `#1b1614` | letterform outline, rules, board edges |
| `accent` | `#f2c14e` | the action plate, the active board's number |
| `subject-1..5` | `#4f8cff`, `#f2c14e`, `#51cf66`, `#cc5de8`, `#ff6b6b` | enamel field per subject |
| `ink` | `#171717` | text on ivory |
| `ink-dim` | `#5c564d` | secondary text on ivory |
| `board-hinge` | `#8a7f6d` | hinge plate, board joint, stencil rule |

The one made-up material rule: enamel fields are capped at the five subject colours plus ivory and primed grey, so the wall never becomes a paint chart. Painted drop shadows are flat paint (a hard offset in `paint-black` at low opacity), not soft CSS shadows, except the action plate which keeps the incumbent's soft lift.

**The accent collision rule.** Discrete Structure's field is `#f2c14e`, the same as `accent`, so accent never carries emphasis on accent. On any `#f2c14e` field: the action plate reverses to `paint-black` ground with ivory caps, the board number knocks out to ivory, and the focus ring is `paint-black` at 2px with a 3px offset. The folio stencil is `paint-black` with a 3px `accent` rule beneath, never yellow text on ivory. Elsewhere accent behaves as described.

**Type.**

- Board lettering: **Anton** (single weight, condensed, uppercase) as the painted display face, drawn with a painted outline in `paint-black`. The user chose it over Alfa Slab One and Ultra: long names ("Microprocessor and Computer Architecture") fit a board in a condensed face, and a heavy condensed cap reads as painted letterforms.
- Board sub-copy: Source Sans 3, uppercase, tracked, at the one small painted size.
- Chapter-page reading: Source Sans 3 body at 16-17px, 65-75ch measure; chapter titles in Anton. Barlow Condensed stays for numerals and labels.

**Topology.** Page-level: brand plate, index strip, board wall, foot. On the wall: five boards, mixed widths, one forward. Into a subject: the board's reverse carries the chapter list; each chapter line opens the chapter page; the primary plate opens the subject's first chapter.

**Motion (one authored moment).** The swing: the chosen board rotates on its vertical hinge axis (a `rotateY` about the board edge) with the other four settling back a few degrees, exponential ease-out, one orchestrated moment on selection and on filter. Everything else, including paint wear, is static material. Reduced motion parks the swing and switches boards without rotation.

## Surface 1 — hub (1440 x 900)

Regions, in reading order:

1. **Brand plate** (top-left): painted plate, "CLASSROOM NOTES" in board caps with a painted outline, a small painted arrow. No kicker above it.
2. **Find strip** (top-right): the filter as a painted rule with a real input, placeholder "Filter subjects", caret in `accent`. Focus turns the rule yellow.
3. **Index strip** (01-05): painted numbered plates along the wall top, each a real link to its subject; the active number in `accent`, the rest in `board-hinge` on the wall ground.
4. **Board wall**: five boards at mixed widths, each in its subject colour, name in Anton caps with painted outline, chapter count as a painted sub-line. The active board has swung forward: it stands proud of the wall with a hard painted shadow and its hinge visible, and its reverse carries description, the chapter list (real chapter titles), and the action plate "OPEN SUBJECT". Placeholder subjects are primed grey with the name stencilled in outline plus the honest line "Notes coming soon"; their board still swings, and its reverse says what will be there, with no live action. Today that is every subject but Discrete Structure, including Microprocessor and Computer Architecture and Economics, whose chapter titles sit in `hub.js` but whose pages are stubs; whether `hub.js` keeps that data is the code build's call. The default-active board is the only subject with readable chapter pages, today Discrete Structure; a subject without pages is never default-active.
5. **Wall foot**: the incumbent chalk-tray line, repainted as a stencil rule: "Classroom Notes / 2026" and a dotted painted rule.

Breakpoints: at 1100px the wall becomes a 3+2 arrangement with the index strip above it; at 700px one board per row, the index strip horizontal-scrolls, the swung board's reverse stacks (name, description, chapter list, action).

States drawn: default, hover (board edge darkens, 2° of forward lean), focus-visible (painted 2px outline in `accent`, offset 3px, `paint-black` on the `#f2c14e` board), active/swung, placeholder board, filter with no match (the wall shows the ground and a painted line "No subject matches that filter"), and the filter with one match.

## Surface 2 — chapter page (Read)

Same world, different job. The world supplies the frame; the text stays a text.

- **Frame:** painted wall ground; the masthead is a painted plate with the brand and a breadcrumb (Notes / Discrete Structure / Sets, Relations, and Functions) set as a stencilled strip.
- **Chapter rail (left):** six chapter tabs, painted board tabs with the number and title, the active one in `accent`; on hover the tab leans forward 1px. Readability wins: tab text is Source Sans 3, not painted caps, at 13-14px.
- **Reading sheet (right):** the chapter is an ivory printed sheet **stapled to the wall**: `board-ivory` field, a painted rule at the top edge, staple marks at the corners, the folio number (01) as a `paint-black` stencil over a 3px `accent` rule. Inside it, everything the current chapter pages have must keep working: chapter title in Anton, source line, recall cues callout, sections, tables, `<details>` solutions, summary/recall block, revision tracker, chapter nav. Tables and callouts are ruled with `paint-black` hairlines, no rounded corners.
- **Study/dark toggle:** a painted switch plate at the top right of the frame; the dark mode swaps the wall for `paint-black` and the sheet for a darker slate, which is the world's own night state.
- **Measure and contrast hold at every breakpoint:** at 700px the rail becomes a horizontal tab strip above the sheet.

## Surface 3 — notes index (`notes/index.html`)

The same wall, read as an index: a painted index sheet pinned to the wall, listing the five subjects as ruled painted rows, each with its number, name, chapter count or "Notes coming soon", and a painted arrow. Disclosure is one click to the subject, which keeps `PRODUCT.md`'s "notes reachable in few clicks". Its masthead carries the brand plate and a single back link to the wall ("Back to the boards"). Day-only, like the hub. One frame per breakpoint.

## Tokens to Figma

One variable collection **Classroom Notes / Painted Board** with modes **Day** and **Night**, holding: colour (the table above), space (`0.4/0.7/1/1.6/2.4rem` plus `4vw` page gutter), radius (`0` content, `999`/`22` for the music island only), and stroke widths (`1px` rule, `2px` outline, `3px` board edge). Text styles named `board/name`, `board/sub`, `page/display`, `page/heading`, `reading/body`, `reading/caption`, `label`. Effect styles: `paint/hard-offset`, `action/lift`.

The hub and the notes index are drawn **Day only**; Night exists for the chapter page and its study/dark toggle, which is where a reader actually sits. The chapter frames carry both modes.

The names map 1:1 to CSS custom properties (`--board-name`, `--space-md`, ...) so the code build is a transcription, not a translation.

## Figma file structure

1. `Cover` — file name, date, direction, seed reference, the three surfaces.
2. `Tokens` — variables, text styles, effect styles, the palette swatches with role names.
3. `Hub` — 1440, 700, 390; plus a component section: board (5 colour variants + primed placeholder), index plate, brand plate, find strip, action plate, stencil rule.
4. `Chapter` — 1440, 700, 390 in Day and Night; plus components: chapter tab, reading sheet, recall callout, table, details block, revision tracker.
5. `Index` — `notes/index.html` at 1440, 700, 390; plus components: index row, back link.
6. `States` — the state grid for board and tab (default/hover/focus/swung/primed/disabled), the empty-filter frame, and the accent-collision examples (yellow board, reversed action plate, folio rule).
7. `Notes` — the new UI strings, the decided display face, and the follow-on work for the code build.

## Copy

New UI labels authored: "Notes coming soon" (placeholder board line), "Back to the boards" (index masthead back link, replacing "Back to classroom"), and the kept "No subject matches that filter". "Open subject", "Filter subjects" and "Notes index" are existing strings. Everything else is drawn from `subjects.json` and the existing chapter pages.

## Left to the builder (my calls, stated so they can be overruled)

- Board widths per breakpoint: derived from name length, checked by rendering all five long names at 1440/700/390.
- Hinge swing: the chosen board's reverse presents as a flat, readable face standing proud of its closed position, hinge plate and hard painted shadow carrying the swing; unselected boards lean back 2°. Timing 0.7s, `cubic-bezier(0.16, 1, 0.3, 1)`.
- Paint wear: one authored noise/edge-wear SVG per board family, drawn once, reused; no photo texture.
- Where the index strip lives at 700px: horizontal strip above the wall.

## Decided (2026-11-24)

1. **Display face:** Anton.
2. **Devanagari:** left out. Boards stay Roman-only; no invented Nepali copy.
3. **Live boards:** Discrete Structure only. The other four are primed placeholders with "Notes coming soon", including Microprocessor and Economics, whose chapter titles in `hub.js` are not drawn.
4. **Scope:** hub, chapter page, and the notes index. No subject landing frame.
5. **Hub night mode:** none. The hub and index are Day-only; the chapter keeps its Day/Night toggle and carries both modes.

## Follow-on (not this task)

Code build in the repo: replace the hub's CSS and markup, restyle the chapter frame, repaint `notes/index.html` and the subject landing stubs, replace `DESIGN.md` with the new world, write the surface brief `FORM` line with `seed:b7a59026dda7a6ff`, and run the finish review. The Figma file is the reference for that build.
