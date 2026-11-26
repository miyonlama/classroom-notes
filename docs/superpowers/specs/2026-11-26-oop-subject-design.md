# Object-Oriented Programming subject — design

Date: 2026-11-26

## Intent

Build out Object-Oriented Programming, already one of the five subjects on Classroom Notes. The
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

## Syllabus source

The user supplied the full BIT 153 syllabus in the request. It is the authority
for unit topics, including topics that never appear in the six papers. Unit
pages cover all of it, not only exam-derived topics.

- **Unit 1 — Introduction to Object Oriented Programming (3 Hrs).** 1.1
  structured vs object-oriented approach; Object, Class, Data Abstraction,
  Encapsulation, Inheritance, Polymorphism, Dynamic Binding, Message Passing.
- **Unit 2 — Basics of C++ programming (5 Hrs).** 2.1 program structure,
  character set and tokens, data types, type conversion, preprocessor
  directives, namespace, `cin`/`cout`, cascading I/O operators, `endl`, `setw`,
  `setprecision`, `new`/`delete`, control-statement review. 2.2 functions:
  overloading, inline, default argument, pass by reference, return by
  reference, scope and storage class. 2.3 pointers: declaration and
  initialization, pointer operators and arithmetic, pointers and arrays,
  pointer and function.
- **Unit 3 — Class and Objects (10 Hrs).** 3.1 structures and classes, class
  and object, accessing members, memory allocation for objects, member
  functions inside and outside the class. 3.2 constructor, destructor,
  default, parameterized, copy and default copy constructors. 3.3 objects as
  function arguments, returning objects, static data members and static
  member functions. 3.4 friend function, friend class, copy initialization,
  `this` pointer.
- **Unit 4 — Operator Overloading (7 Hrs).** 4.1 fundamentals, restrictions,
  rules, operator functions as class members. 4.2 unary pre-increment,
  post-increment and negation. 4.3 binary plus, comparison and string
  concatenation. 4.4 basic-to-user-defined, user-defined-to-basic and
  user-defined-to-user-defined conversion.
- **Unit 5 — Inheritance (7 Hrs).** 5.1 derived and base class, private,
  protected and public access specifiers. 5.2 single, multiple, hierarchical,
  multilevel and hybrid inheritance; public, protected and private
  inheritance. 5.3 constructor and destructor in derived classes, order of
  execution. 5.4 aggregation, aggregation vs inheritance, ambiguity in
  multiple and multipath inheritance, virtual base class.
- **Unit 6 — Virtual Function, Polymorphism, and other C++ Features (3 Hrs).**
  6.1 static and dynamic polymorphism, pointers to base class, virtual
  functions, dynamic polymorphism, abstract and concrete classes, pure
  virtual functions, virtual destructors, roles of polymorphism.
- **Unit 7 — Function Templates and Exception Handling (4 Hrs).** 7.1
  templates, function templates with multiple arguments, class templates,
  templates and inheritance, rules for using templates. 7.2 exception
  handling mechanism, `try`, `catch`, `throw`, multiple catch, catching all
  exceptions, uses of exception handling.
- **Unit 8 — File and Streams (6 Hrs).** 8.1 stream class hierarchy, read and
  write file pointers, text files, end-of-file detection, binary files. 8.2
  reading and writing objects, random file access.

## Goals

- Make OOP a real, navigable subject from the hub and Notes index.
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
- Hub copy keeps "Five subjects": OOP was already one of the five entries.

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
- `assets/js/hub.js` gains an `"object-oriented-programming"` entry in its
  `chapters` map with the eight unit names exactly as they appear in the OOP
  rail. Without it the hub shows "Chapters coming soon." and "Notes" instead
  of "8 chapters". `index.html` copy keeps "Five subjects" because OOP was
  already one of the five entries.
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
- Every unit page and the archive loads `notes.js`, so their copy buttons work.
  The archive also loads `past-questions.js` for its paper toggles.
- `.codeblock` and `.copy-btn` rules move into `lecture-notes.css` using that
  file's existing tokens. Unit pages and the archive then load one stylesheet
  for reading and one for the player, with no second design system.
- `tests/oop-subject.test.js` checks the eight unit files, shared rail, six
  papers, 72 question entries, 72 answer blocks, the hub copy, the `hub.js`
  chapter entry, and that every local href resolves to a file.

## Left to the builder

- Exact prose for the eight unit pages and the 72 worked answers.
- Exact topic-to-unit mapping used for the `EXAM n` counts.
- Where copy buttons sit inside each code example, following the existing
  `.codeblock` pattern.
