# Classroom Notes — The Painted Board (Figma build) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Figma file for the Painted Board world: variables and text styles, then hub, chapter and notes-index frames at 1440/700/390, as fully editable layers.

**Architecture:** One new Figma design file in the PMC BIT team. A single variable collection `Classroom Notes / Painted Board` with Day and Night modes carries colour, space, radius and stroke. Components (board, index plate, brand plate, find strip, action plate, stencil rule, chapter tab, reading sheet, index row) are built once on a Components page and instanced into the surface frames. Every frame is drawn with auto-layout so text reflow at 700/390 is real, not simulated.

**Tech Stack:** Figma Plugin API through the `use_figma` MCP tool. `use_figma` requires `skillNames` to include `resource:figma-use` on every call and `resource:figma-generate-design` on every mutating call. `create_session` runs once per task batch.

**Spec:** `docs/superpowers/specs/2026-11-24-classroom-notes-painted-board-design.md`

## Global Constraints

- No site code changes: nothing under `assets/`, `notes/`, or `index.html` is edited by this plan.
- Palette, verbatim: `wall #171310`, `board-primed #3a3733`, `board-ivory #efe6d2`, `paint-black #1b1614`, `accent #f2c14e`, `board-hinge #8a7f6d`, `ink #171717`, `ink-dim #5c564d`, subjects `#4f8cff`, `#f2c14e`, `#51cf66`, `#cc5de8`, `#ff6b6b`.
- Accent collision rule: on any `#f2c14e` field, the action plate reverses to `paint-black` with ivory caps, the board number knocks out to ivory, and the focus ring is `paint-black` 2px / 3px offset.
- Type: board lettering **Anton** uppercase with a `paint-black` outline; board sub-copy Source Sans 3 uppercase tracked; reading body Source Sans 3 16-17px at 65-75ch; numerals and labels Barlow Condensed. No third display face.
- Breakpoints: 1440 x 900 desktop, 700, 390. Content corners 0px; only the music island is rounded (`999px` closed, `22px` open).
- Craft floor: no kicker above a heading; icons are drawn SVG, never emoji or Unicode glyphs; body text >= 4.5:1, large text >= 3:1; one authored motion (the swing).
- Facts come only from `subjects.json` and the existing chapter pages. Discrete Structure is the only live subject; four boards are primed with "Notes coming soon".
- Hub and notes index are Day-only. Night mode exists only on chapter frames.
- New UI strings allowed: "Notes coming soon", "Back to the boards". Existing strings are reused ("Open subject", "Filter subjects", "Notes index", "No subject matches that filter").

## Review Focus

- **Longest subject name at 390px.** "Microprocessor and Computer Architecture" is 42 characters; the 390 frame must wrap or scale it without clipping the board or shrinking below the one painted size. Expected: the name wraps to at most 3 lines, board grows, nothing overlaps.
- **Microprocessor / Economics chapter data.** `hub.js` carries 8 chapter titles for each, but their pages are stubs. Expected: neither board is default-active, neither reverse lists chapters, no count is drawn.
- **A single subject matched by the filter.** Expected: the wall keeps its ground and the matched board stays put, not a layout collapse to one stretched board.
- **Discrete Structure's `#f2c14e` board.** Expected: action plate black with ivory caps, number ivory, folio black over an accent rule; no accent on accent anywhere in that frame.
- **Reduced motion / no animation in the file.** Expected: the swing has one drawn authored state per board (closed, swung), never a scatter of effects.
- **The music island overlay.** `player.css` draws a rounded top-centre island on every page. Expected: a notation on the Cover/Notes page places it above the wall without a rounded content surface being introduced anywhere else.
- **Chapter Night mode leaking into the hub.** Expected: hub and index frames use Day values only; no Night symbols instance in them.

---

### Task 1: Create the file and the session

**Files:**
- No repo files. Creates the Figma file.

**Interfaces:**
- Consumes: nothing.
- Produces: `fileKey` (string) and `sessionId` (string) used by every later task; page names `Cover`, `Tokens`, `Components`, `Hub`, `Chapter`, `Index`, `States`, `Notes`.

- [ ] **Step 1: Create the file**

Call `create_new_file` with `fileName: "Classroom Notes — Painted Board"`, `planKey: "team::1706915581861863575"` (PMC BIT), `editorType: "design"`. Record the returned `file_key`.

- [ ] **Step 2: Open a session**

Call `create_session` with that `fileKey` and `description: "Build the Painted Board redesign: variables, components, hub/chapter/index frames at 1440/700/390"`. Record the returned `sessionId`.

- [ ] **Step 3: Verify the font face exists**

Call `use_figma` with `skillNames: "resource:figma-use"`, `sessionId`, and a read-only script that runs `await figma.listAvailableFontsAsync()` and returns the entries whose `fontName.family` is `Anton`, `Source Sans 3`, or `Barlow Condensed`, with their `style` strings.

Expected: `Anton` with style `Regular`; `Source Sans 3` with `Regular` and `Bold`; `Barlow Condensed` with `Regular` and `Bold`. If `Anton` is missing, stop and report — the spec's display face cannot be drawn.

- [ ] **Step 4: Verify the pages**

Return `figma.root.children.map(p => ({ id: p.id, name: p.name }))`. Expected: the default `Page 1`. Rename it `Cover` and create `Tokens`, `Components`, `Hub`, `Chapter`, `Index`, `States`, `Notes`. Return all page ids and names.

---

### Task 2: Tokens page — variables, text styles, effect styles

**Files:**
- No repo files. Creates the variables, styles, and the `Tokens` page content.

**Interfaces:**
- Consumes: `fileKey`, `sessionId`, page names from Task 1.
- Produces: variable collection `Classroom Notes / Painted Board` with modes `Day`, `Night`; colour variables `colour/wall`, `colour/board-primed`, `colour/board-ivory`, `colour/paint-black`, `colour/accent`, `colour/board-hinge`, `colour/ink`, `colour/ink-dim`, `colour/subject-1..5`; space variables `space/xs|sm|md|lg|xl|gutter`; radius `radius/none|island|island-open`; stroke `stroke/rule|outline|board-edge`. Text styles `board/name`, `board/sub`, `page/display`, `page/heading`, `reading/body`, `reading/caption`, `label`. Effect styles `paint/hard-offset`, `action/lift`.

- [ ] **Step 1: Create the collection and variables**

Call `use_figma` with both skills in `skillNames` and the `sessionId`. Create the collection with modes `Day` (default) and `Night`, then every variable above with the spec's exact values in both modes. Night differs only in `colour/wall` and `colour/board-ivory` (wall becomes `#0d0b09`, ivory becomes `#2b2925`). Naming rule: every slash becomes a dash in CSS, so `colour/wall` is `--colour-wall`, `space/md` is `--space-md`, `board/name` (the text style) is `--board-name`. Return every variable id, name, and resolved Day value as a table.

- [ ] **Step 2: Create the text styles**

Create the seven text styles with these values: `board/name` Anton Regular 64/0.96/0; `board/sub` Source Sans 3 Regular 13 uppercase tracking 0.14em; `page/display` Anton Regular 96/0.92; `page/heading` Anton Regular 40/1.0; `reading/body` Source Sans 3 Regular 16.5/1.6; `reading/caption` Source Sans 3 Regular 13/1.55; `label` Source Sans 3 Bold 11 uppercase tracking 0.18em. Load every font before writing. Return style ids with the resolved values.

- [ ] **Step 3: Create the effect styles**

`paint/hard-offset` = drop shadow, offset `{x: 6, y: 6}`, blur 0, colour `paint-black` at 65% opacity. `action/lift` = drop shadow, offset `{x: 0, y: 6}`, blur 18, colour black at 28%. Return style ids.

- [ ] **Step 4: Draw the swatch sheet**

On the `Tokens` page, draw one 1440x900 frame named `Tokens / Palette` containing a labelled swatch per colour variable, plus a row of the seven text styles set as live text. Bind each swatch fill to its variable. Return the frame id and a screenshot.

Expected in the screenshot: 5 subject chips, 6 neutral chips, one yellow chip labelled `accent`, readable labels, no rounded corners.

---

### Task 3: Components page — the board family and the small parts

**Files:**
- No repo files. Creates the components.

**Interfaces:**
- Consumes: variables, text styles, effect styles from Task 2.
- Produces: component sets `Board`, `IndexPlate`, `BrandPlate`, `FindStrip`, `ActionPlate`, `StencilRule`, `ChapterTab`, `ReadingSheet`, `IndexRow`. `Board` variants are `field = subject-1..5 | primed` x `state = closed | swung`; `ActionPlate` has `tone = accent | reversed`; `ChapterTab` has `state = default | active`.

- [ ] **Step 1: Build the Board component set**

Draw the board: a rectangle with a 3px `paint-black` edge, field fill bound to the variant's colour variable, an inner 1px `paint-black` rule inset 6px, a hard painted shadow (`paint/hard-offset`) on the `swung` variants only, and board name text (Anton, `board/name`) plus a count sub-line (`board/sub`) inside an auto-layout frame. The `primed` variants show the name as an outline stencil: text fill `board-hinge`, no count, plus the line "Notes coming soon". Create the component set with `addComponentProperty` for `name` and `count` text. Size: closed 260x190, swung 420x340.

Return the component set id, its variant ids with names, and a screenshot.

- [ ] **Step 2: Build the small parts**

Draw, each as its own component: `IndexPlate` (numbered painted plate, 56x40, `default | active`), `BrandPlate` (wordmark plate with the painted arrow that is the Notes-index link), `FindStrip` (painted rule, 300x40, with a real text layer "Filter subjects" and `default | focus`), `ActionPlate` (`tone = accent | reversed`; accent tone = `accent` ground with `paint-black` caps and `action/lift`; reversed = `paint-black` ground with `board-ivory` caps), `StencilRule` (dotted painted rule 1px with the uppercase label), `ChapterTab` (painted tab 240x48; `active` uses `accent` on the edge only and keeps body text in Source Sans 3 13.5), `ReadingSheet` (ivory board with a painted top rule, corner staple marks drawn as SVG, and a 12-column auto-layout body slot), `IndexRow` (ruled painted row 1000x64: number, name, count-or-coming-soon, arrow, `state = default | stubbed`).

Paint wear: draw one `EdgeWear` component — an authored vector of chipped enamel along a board edge and two hinge screws — reused on every board instance, no photographic texture. It sits above the field fill and below the text.

Icons: draw the brand arrow, the filter magnifier, and the row arrow as vector nodes with one stroke weight (1.6px). Never use emoji or Unicode glyphs.

Return every component id, and one screenshot of the Components page.

- [ ] **Step 3: Verify variant coverage**

Return, per component set, its variant count and the list of `name=value` strings. Expected: `Board` 14 (5 subjects + primed, x 2 states, precedence making primed a single variant of the field property), `ActionPlate` 2, `ChapterTab` 2, `IndexPlate` 2, `IndexRow` 2, the rest 1.

---

### Task 4: Hub at 1440

**Files:**
- No repo files. Creates the hub desktop frame.

**Interfaces:**
- Consumes: every component from Task 3; variables and styles from Task 2.
- Produces: frame `Hub / 1440`, with child frames `Hub / 1440 / brand-row`, `Hub / 1440 / index-strip`, `Hub / 1440 / wall`, `Hub / 1440 / foot`.

- [ ] **Step 1: Compose the frame**

Draw `Hub / 1440` at 1440x900 on the `Hub` page, background bound to `colour/wall`. Inside, in one auto-layout column: `brand-row` (BrandPlate left, FindStrip right, `space/lg` gap), `index-strip` (five IndexPlate instances 01-05, active = 02 Discrete Structure), `wall` (five Board instances at mixed widths — Microprocessor 260, Discrete swung 420, OOP 260, Statistics 220, Economics 300 — with `space/md` gaps, wrapped in 2 rows so the swung board has room), `foot` (StencilRule text "Classroom Notes / 2026" plus the dotted rule).

Page margin `space/gutter` (4vw = 57.6px at 1440). Fill the swung Discrete board's reverse with: description from `subjects.json`, the six real chapter titles from `notes/discrete/`, and an ActionPlate instance with the `reversed` tone (its field is `#f2c14e`).

- [ ] **Step 2: Verify against the constraints**

Return the frame id, the total node count, every text node's `characters` with its font size, and a screenshot.

Expected: the six chapter titles are real titles from the chapter pages; the invisible default board is Discrete; no text smaller than 11px; no rounded corner anywhere except nothing (the music island is not drawn in this frame); "Notes coming soon" appears on the four primed boards.

---

### Task 5: Hub at 700 and 390

**Files:**
- No repo files. Creates the hub narrower frames.

**Interfaces:**
- Consumes: `Hub / 1440` structure and the same components.
- Produces: frames `Hub / 700`, `Hub / 390`.

- [ ] **Step 1: Draw `Hub / 700`**

One board per row, index strip in a single horizontal row above the wall, brand row stacked (BrandPlate, then FindStrip), swung board's reverse stacked (name, description, chapter list, ActionPlate). At 700 the wall uses 3 columns for the closed boards.

- [ ] **Step 2: Draw `Hub / 390`**

One board per column, full width minus a 24px gutter, the index strip horizontally scrollable (draw it clipped at the right edge with a half-visible sixth position mark), find strip full width. Check the longest name: "Microprocessor and Computer Architecture" must wrap to at most 3 lines inside its board without clipping.

- [ ] **Step 3: Verify**

Return both frame ids, the height of every board instance, and one screenshot per frame. Expected: no text node clipped, no board narrower than 320px, nothing overlapping.

---

### Task 6: Chapter page at 1440, Day and Night

**Files:**
- No repo files. Creates the chapter desktop frames.

**Interfaces:**
- Consumes: components from Task 3, variables from Task 2.
- Produces: frames `Chapter / 1440 / Day`, `Chapter / 1440 / Night`, and the inner frames `rail`, `sheet`.

- [ ] **Step 1: Draw the Day frame**

Frame 1440x900, background `colour/wall`. Masthead: BrandPlate plus a breadcrumb StencilRule set as "Notes / Discrete Structure / Sets, Relations, and Functions". Left rail 240px: six ChapterTab instances with the real six chapter titles, tab 01 active. Right: a ReadingSheet instance filling the rest, containing the real chapter 01 content structure from `notes/discrete/sets-relations-functions.html`: title "Sets, Relations, and Functions" (`page/heading`), the source line, a recall-cues callout (ruled box, `label` heading plus three items), two section headings with body paragraphs, one table with `paint-black` hairlines, one `<details>`-style disclosure drawn as a closed summary row, and a chapter nav row. Body lives in a 720px-wide column (65-75ch at 16.5px).

- [ ] **Step 2: Draw the Night frame**

Duplicate the Day frame, switch the collection mode to `Night` on the frame's descendants, and add the painted study/dark switch plate top-right. Expected: wall goes near-black, sheet goes dark slate, every text fill keeps its contrast (body text >= 4.5:1 against the dark sheet).

- [ ] **Step 3: Verify**

Return both frame ids, a list of every text node with its fill and font size, and one screenshot each. Expected: no rounded content corners; the folio stencil is `paint-black` over a 3px `accent` rule; nothing in either frame uses `colour/subject-*` as a text fill on a subject field.

---

### Task 7: Chapter page at 700 and 390

**Files:**
- No repo files.

**Interfaces:**
- Consumes: `Chapter / 1440 / Day`.
- Produces: frames `Chapter / 700 / Day`, `Chapter / 390 / Day`.

- [ ] **Step 1: Draw `Chapter / 700 / Day`**

Rail becomes a horizontal tab strip above the sheet; sheet fills the width; the body column is the full sheet width at 16.5px (measure stays under 75ch by keeping the sheet at 660px).

- [ ] **Step 2: Draw `Chapter / 390 / Day`**

Tabs scroll horizontally (drawn clipped), sheet full width with 16px margins, the table becomes a stacked key-value list, the recall callout stacks its three items.

- [ ] **Step 3: Verify**

Return both ids and one screenshot each. Expected: no horizontal overflow, no text under 13px, the sheet still reads as one sheet.

---

### Task 8: Notes index at 1440, 700, 390

**Files:**
- No repo files.

**Interfaces:**
- Consumes: `IndexRow`, `BrandPlate`, `StencilRule` from Task 3.
- Produces: frames `Index / 1440`, `Index / 700`, `Index / 390`.

- [ ] **Step 1: Draw the three frames**

Each frame: `colour/wall` ground, BrandPlate plus a StencilRule back link "Back to the boards", then an index sheet (ivory) holding five `IndexRow` instances — 01-05 with real titles, Discrete showing "6 chapters", the other four `state = stubbed` showing "Notes coming soon". The sheet is pinned with two staple marks.

- [ ] **Step 2: Verify**

Return the three ids, every row's text, and one screenshot per frame. Expected: five rows in `subjects.json` order, no invented counts, stubbed rows visibly quieter than the live row.

---

### Task 9: States page

**Files:**
- No repo files.

**Interfaces:**
- Consumes: `Board`, `ChapterTab`, `IndexPlate`, `ActionPlate`, `FindStrip`.
- Produces: frame `States / Grid`, frame `States / Empty filter`, frame `States / One match`, frame `States / Accent collision`.

- [ ] **Step 1: Draw the state grid**

One row per component, one column per state: `Board` (subject-1 closed, subject-1 swung, primed, hover-lean, focus-visible with the 2px `accent` ring at 3px offset), `ChapterTab` (default, active, focus), `IndexPlate` (default, active), `ActionPlate` (accent, reversed), `FindStrip` (default, focus). Label each with a `label` text.

- [ ] **Step 2: Draw the empty filter, the single match, and the accent collision**

`States / Empty filter`: the wall ground with three primed boards and the painted line "No subject matches that filter". `States / One match`: the wall ground with five boards where "disc" is typed in the find strip, four boards painted over with the wall ground and the Discrete board still at its own width and position — no stretched single-board layout. `States / Accent collision`: the Discrete board swung, with callouts naming the three rules (reversed action plate, ivory number, black folio over accent rule) and a contrast readout for each text pair on that frame.

- [ ] **Step 3: Verify**

Return the four frame ids, the focus ring/node pairs, the matched board's width in `States / One match` (expected: unchanged from the wall), and one screenshot each. Expected: every state visible without hovering; the focus ring style is the same in all frames.

---

### Task 10: Cover, Notes, and the final look

**Files:**
- No repo files. Optionally commits the spec and this plan.

**Interfaces:**
- Consumes: everything above.
- Produces: frames `Cover`, `Notes / Handoff`.

- [ ] **Step 1: Draw the Cover**

File title "Classroom Notes — Painted Board", the date, the direction name, `seed:b7a59026dda7a6ff`, the three surfaces, and one line naming the spec path.

- [ ] **Step 2: Draw the Notes / Handoff frame**

The two new UI strings, the decided display face (Anton, self-hosted later), the four my-call rules from the spec, the music-island placement note (`player.css` draws a rounded top-centre island; it sits above the wall and is the only rounded surface), and the follow-on list for the code build.

- [ ] **Step 3: Final look**

Read back every frame with `use_figma` (ids, names, positions, sizes) and take one screenshot per surface frame. Check against the craft floor: contrast (body >= 4.5:1, large >= 3:1 confirmed from the fill values), no kicker above any heading, no emoji or Unicode icon, one motion (the swing: exactly two Board states, no other animated state), no rounded content corner anywhere except the noted music island, hub and index frames carrying no Night mode override, and subject-named boards showing the correct `subjects.json` colour.

- [ ] **Step 4: Hand back**

Post the Figma file URL, the frame inventory, and any frame that failed a check with the evidence. Commit the spec and this plan to the repo.

```bash
git add docs/superpowers/specs/2026-11-24-classroom-notes-painted-board-design.md docs/superpowers/plans/2026-11-24-classroom-notes-painted-board-figma.md .impeccable/decision-payload.json
git commit -m "docs: add the Painted Board design spec and Figma build plan"
```
