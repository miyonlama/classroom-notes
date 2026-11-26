# Object-Oriented Programming subject — design

Date: 2026-11-26

## Intent

Add Object-Oriented Programming as the sixth subject on Classroom Notes. The
user has the full BIT 153 syllabus but no source PDF. The exam source is
`C:\Users\lamam\Downloads\Past Questions.txt`: six papers (2078, 2079, 2080.1,
2080.2, 2081, 2082), 12 questions each, 72 total, no diagrams. Goal is exam
preparation, so every past question gets a worked model answer.

## Why

The site already reserves the subject: `subjects.json` has an OOP entry marked
"Content coming soon" and `notes/object-oriented-programming.html` is an empty
placeholder. The hub still says "Five subjects". The attached text file is real
exam material and fits the per-paper archive pattern already built for Discrete
Structure.

## Goals

- Make OOP a real, navigable sixth subject from the hub and Notes index.
- Eight unit reading pages matching the eight syllabus units.
- One past-papers archive with all 72 questions and a worked answer for each.
- `EXAM n` counts on unit topics, derived only from the six papers.
- Same chalkboard visual world, sticky rail, study tools, and global player.
- Regression tests for file set, rail consistency, question count, answers,
  and hub copy.

## Non-goals

- No source PDF, so no transcription and no embedded PDF diagrams.
- No new CSS design system, no new motion, no new animation tokens.
- No backend, no build step, no dependency.
- No work on the other placeholder subjects.

## Constraints

- Plain static HTML, CSS, and browser JS. Vercel auto-deploys from `master`.
- Reuse `assets/css/lecture-notes.css`, `assets/css/past-questions.css`,
  `assets/css/player.css`, `assets/js/study-tools.js`,
  `assets/js/lecture-notes.js`, `assets/js/past-questions.js`,
  `assets/js/site-nav.js`, and `assets/js/notes.js`.
- Unit prose and C++ examples are authored from the syllabus and standard C++.
  They are not lecturer transcriptions. Say so on each page.
- Exam counts come only from the six papers in the attached text file. Show
  them as informational, not official weighting.
- Worked answers are model answers, not official solutions.
- Hub copy changes from five subjects to six.

## Approaches

1. **Full mirror of Discrete Structure** — eight unit pages, eight separate
   topic-grouped exam pages, plus one archive. Most consistent with Discrete,
   largest page count, and the user asked for exam-first.
2. **Exam-first (chosen)** — eight unit pages with topic breakdowns and
   `EXAM n` counts, plus one archive holding all 72 questions with worked
   answers. Fewer pages, direct exam value, still uses the same components.
3. **One long page** — units and questions together. Fastest to build, but
   breaks the rail navigation and reading layout used by every other subject.

Approach 2 was chosen because the stated goal is exam preparation and the extra
eight topic pages from approach 1 would duplicate the archive.

## Decisions

- `notes/object-oriented-programming.html` becomes a redirect stub to
  `oop/introduction-to-oop.html`, same pattern as
  `notes/discrete-structure.html`. `subjects.json` gets the same direct href
  and a real description; the `#51cf66` accent stays.
- Unit files under `notes/oop/`: `introduction-to-oop.html`,
  `basics-of-cpp.html`, `classes-and-objects.html`,
  `operator-overloading.html`, `inheritance.html`,
  `virtual-functions-and-polymorphism.html`,
  `templates-and-exception-handling.html`, `files-and-streams.html`.
- Rail on every OOP page: one "SYLLABUS" section with the eight units and a
  `PQ` Past Questions entry. No second "IMPORTANT QUESTIONS" section.
- Each unit page carries the chapter shell: folio, source line, recall cues,
  topic breakdown with `★★★ / ★★ / ★` marks and `EXAM n` badges, short C++
  examples with copy buttons, revision tracker, and chapter navigation.
- `EXAM n` counts the occurrences of a topic across the six papers. A question
  with multiple parts counts once for each distinct topic it examines.
- `notes/oop/past-questions.html` keeps all six papers as expandable sections
  with the existing `.paper-nav` and `.paper` markup. Question text and marks
  follow the attached file; each paper has 3 long and 9 short questions.
- Every question is followed by a `<details>` worked answer containing a short
  explanation and compilable C++ where the question asks for code. Repeated
  questions keep their own answer inside their own paper, so each paper stands
  alone.
- The archive loads `notes.js` in addition to the scripts used by the Discrete
  archive, so its copy buttons work.
- `tests/oop-subject.test.js` checks the eight unit files, shared rail, six
  papers, 72 question entries, 72 answer blocks, the hub copy, and that every
  local href resolves to a file.

## Left to the builder

- Exact prose for the eight unit pages and the 72 worked answers.
- Exact topic-to-unit mapping used for the `EXAM n` counts.
- Where copy buttons sit inside each code example, following the existing
  `.codeblock` pattern.
