---
name: Classroom Notes
description: A chalkboard lecture hall that opens directly into subject notes.
colors:
  board: "#101a16"
  board-deep: "#0b1310"
  chalk: "#e8ece1"
  chalk-dim: "#a9b7ac"
  board-green: "#2f7d58"
  projector-yellow: "#f2c14e"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3.2rem, 9vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Source Sans 3, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Source Sans 3, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    letterSpacing: "0.18em"
rounded:
  none: "0px"
spacing:
  sm: "0.7rem"
  md: "1rem"
  lg: "1.6rem"
  xl: "4vw"
components:
  button-primary:
    backgroundColor: "{colors.projector-yellow}"
    textColor: "{colors.board-deep}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.2rem"
  slide-card:
    backgroundColor: "{colors.board-deep}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "1rem 0.9rem 0.9rem"
  search-input:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0"
---

# Design System: Classroom Notes

## Overview

**Creative North Star: "The Lecture Hall Projection"**

The hub behaves like the slide deck projected before a lecture begins. A chalkboard-green field, a projector bloom, pinned subject slides, and a numbered syllabus make the visitor's job obvious: pick a subject and open its notes. The system is restrained in color and confident in scale, with one warm accent reserved for the active choice.

Depth comes from tone and a single soft shadow, not ornament. Every surface is square. Motion is a single settle-in on load and on the active slide change; nothing else animates by default.

**Key Characteristics:**
- Chalkboard ground with a faint chalk-dust texture
- Condensed display type against an open humanist body face
- Numbered syllabus paired with pinned subject slides
- One yellow accent for the active subject and primary action

## Colors

### Primary
- **Projector Yellow** (#f2c14e): Active subject, primary action, brand mark, and syllabus numbers. It marks the one thing to do next.

### Secondary
- **Board Green** (#2f7d58): Borders, rules, and hover tints. It carries structure without competing with the accent.

### Neutral
- **Chalkboard** (#101a16): Page ground.
- **Board Deep** (#0b1310): Slides, panels, and the chalk tray.
- **Chalk** (#e8ece1): Headlines and primary text.
- **Chalk Dim** (#a9b7ac): Secondary text and inactive labels.

**The One Voice Rule.** Yellow appears only on the active choice and its action. If a screen has more than one yellow element, all but one are the same decision.

## Typography

**Display Font:** Barlow Condensed (self-hosted)
**Body Font:** Source Sans 3 (self-hosted)

**Character:** Condensed, heavy display type reads like a projected lecture title. The body face stays open and readable so chapter lists never feel like decoration.

### Hierarchy
- **Display** (700, clamp 3.2–6rem, 0.92 line-height): Page headline only.
- **Headline** (700, 2.1rem, 1.0 line-height): Active subject title.
- **Body** (400, 16px, 1.5): Descriptions and chapter lists, max 65–75ch.
- **Label** (700, 0.7rem, 0.18em, uppercase): Syllabus and tray labels.

**The Heading Carries It Rule.** No kicker or eyebrow sits above a heading. Scale and weight do the work.

## Layout

Desktop uses a top utility row, a display headline, then a two-column body: a fixed syllabus rail and a flexible slides area. Subject slides form a five-column row; the active subject expands into a separate live-slide panel below with description, chapter list, and primary action.

At 1100px the rail moves above the slides and the slide row becomes three columns. At 700px the utility stacks, slides become two columns, and the live panel becomes a single column.

## Elevation & Depth

Most surfaces are flat and separated by full 1px borders. The primary action alone carries depth: a soft downward shadow. The projector bloom and chalk dust are material, not elevation.

- **Action lift** (`box-shadow: 0 6px 18px rgba(0,0,0,0.28)`): Primary button only.

## Shapes

All corners are square (0px radius). Subject slides use a small taped tab at the top edge. Dividers are 1px rules; the chalk tray uses a dotted rule. No rounded containers.

## Components

### Buttons
- **Shape:** Square, no radius.
- **Primary:** Yellow ground, deep-board text, 0.8rem 1.2rem padding, soft shadow.
- **Syllabus item:** Transparent with a 1px transparent border; hover tints the surface, active uses a yellow border and tint.
- **Focus:** 2px yellow outline, 3px offset.

### Cards / Containers
- **Slide card:** Deep-board ground, 1px board-green border, taped tab, number, drawn SVG mark, title, chapter count.
- **Live slide:** Deep-board ground, full 1px border, three-region grid (head/description/action against chapter list).

### Inputs / Fields
- **Search:** Transparent field with a bottom rule; focus turns the rule yellow. Caret is yellow.

### Navigation
- **Syllabus rail:** Uppercase label, numbered buttons, active state marked by yellow number and tinted row.

## Do's and Don'ts

### Do:
- **Do** keep every surface square.
- **Do** reserve yellow for the active decision.
- **Do** use drawn SVG marks with one consistent stroke weight.

### Don't:
- **Don't** add a kicker above the display headline.
- **Don't** use emoji or Unicode glyphs as icons.
- **Don't** introduce rounded corners or gradient text.
