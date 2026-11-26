# Object-Oriented Programming Subject Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Object-Oriented Programming as a sixth subject with eight unit reading pages and a 72-question exam archive with worked answers.

**Architecture:** Static HTML pages under `notes/oop/`, all sharing the existing Lecture Hall shell and rail. Content is authored from the supplied syllabus and standard C++; exam facts and `EXAM n` counts come only from `C:\Users\lamam\Downloads\Past Questions.txt`. No build step, no dependency, no server.

**Tech Stack:** Plain HTML, CSS, browser JS, Node `assert` tests run with `node tests/<file>.js`.

**Spec:** `docs/superpowers/specs/2026-11-26-oop-subject-design.md`

## Global Constraints

- Static site only. No dependency, build step, or server.
- One existing global player; do not touch `assets/js/player.js` or its DOM.
- Unit and answer prose is authored, not transcribed from a PDF. State this on each page.
- Exam counts come only from the six papers in the attached text file: 2078, 2079, 2080.1, 2080.2, 2081, 2082. Never write "nine papers" on OOP pages.
- `EXAM n` counts occurrences across those six papers; a multi-part question counts once per distinct topic it examines. Badges are informational, not official weighting.
- Worked answers are model answers, not official solutions.
- Rail labels, in order: `Introduction to Object Oriented Programming`, `Basics of C++ Programming`, `Class and Objects`, `Operator Overloading`, `Inheritance`, `Virtual Function, Polymorphism, and other C++ Features`, `Function Templates and Exception Handling`, `File and Streams`, then `Past Questions` with the badge `PQ`.
- Each unit page loads `lecture-notes.css` and `/assets/css/player.css`, then `study-tools.js`, `player.js`, `site-nav.js`, and `../../assets/js/lecture-notes.js` in that order. The archive additionally loads `notes.js` and `past-questions.js`.
- Truth-value coloring and motion work on other pages is out of scope.
- Every task commits on branch `oop-subject`. Do not merge or push.

## Review Focus

- **Question text silently drifts from the supplied papers.** Task 6 and Task 7 tests pin paper ids, 12 questions per paper, the exact `Q1`–`Q12` numbering, and bracketed marks on every question.
- **A question has no worked answer.** Task 6 and Task 7 tests require exactly one `<details class="worked-answer">` immediately after each `.question` element, giving 72 total.
- **Rail or navigation breaks between units.** Task 2 through Task 5 tests pin the nine rail entries and each page's previous/next href. Task 7 resolves every local href on all OOP pages.
- **Hub still presents OOP as empty.** Task 1 tests the `hub.js` chapter entry, the `subjects.json` href, the redirect stub, and the six-subject copy.
- **Copy buttons render unstyled.** Task 1 tests that `.codeblock` and `.copy-btn` rules exist in `lecture-notes.css`; unit tasks require one `.codeblock` with a `.copy-btn` per unit page.

---

### Task 1: Site wiring and shared reading styles

**Files:**
- Modify: `subjects.json`
- Modify: `notes/object-oriented-programming.html`
- Modify: `index.html`
- Modify: `assets/js/hub.js`
- Modify: `assets/css/lecture-notes.css`
- Test: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `tests/oop-subject.test.js` using Node `assert` and `fs`, with a module-level `var oopUnits = [...]` holding the nine rail labels in Global Constraints order. Later tasks append assertions to this file and reuse `oopUnits`.
- Produces: `.codeblock` and `.copy-btn` rules in `lecture-notes.css`, using that file's existing CSS variables.

- [ ] **Step 1: Write the failing test**

Create `tests/oop-subject.test.js` with `assert`, `fs`, `path`, a `root` path, and `oopUnits`. Assert:
- `subjects.json` OOP entry has `href === "oop/introduction-to-oop.html"` and a description that does not contain "coming soon".
- `notes/object-oriented-programming.html` contains `oop/introduction-to-oop.html` and `location.replace`.
- `index.html` contains "Five subjects" and not "Six subjects".
- `assets/js/hub.js` contains `"object-oriented-programming"` and, inside its array, all eight unit labels from `oopUnits.slice(0, 8)`.
- `assets/css/lecture-notes.css` contains `.codeblock` and `.copy-btn` selectors.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL on the first assertion.

- [ ] **Step 3: Implement the wiring**

Update the OOP entry in `subjects.json`; keep accent `#51cf66`. Replace the placeholder body of `notes/object-oriented-programming.html` with the redirect pattern used by `notes/discrete-structure.html`. Keep the hub sentence as "Five subjects, one syllabus. Open the one you need." Add the eight-label OOP entry to the `chapters` map in `assets/js/hub.js`. Add minimal `.codeblock` and `.copy-btn` rules to `lecture-notes.css` using existing tokens; match the visual intent of the rules in `notes.css` without adding a second stylesheet.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite:
`$tests = Get-ChildItem "tests\*.test.js" | ForEach-Object { $_.FullName }; foreach($t in $tests){ node $t; if($LASTEXITCODE -ne 0){ Write-Host "FAILED: $t" } }`
Expected: `oop subject tests ok` and no `FAILED:` lines.

- [ ] **Step 5: Commit**

`git add subjects.json notes/object-oriented-programming.html index.html assets/js/hub.js assets/css/lecture-notes.css tests/oop-subject.test.js`
`git commit -m "feat: wire OOP subject into hub and reading styles"`

---

### Task 2: Unit pages 01 and 02

**Files:**
- Create: `notes/oop/introduction-to-oop.html`
- Create: `notes/oop/basics-of-cpp.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: `oopUnits` and the CSS classes from Task 1.
- Produces: `notes/oop/introduction-to-oop.html` with next href `basics-of-cpp.html`; `notes/oop/basics-of-cpp.html` with previous href `introduction-to-oop.html` and next href `classes-and-objects.html`.

- [ ] **Step 1: Write the failing test**

Append assertions that both files exist and each contains:
- all nine `oopUnits` labels, with `aria-current="true"` on its own label only;
- `class="priority-mark"` and at least one `class="exam-mark">EXAM ` badge;
- a source line saying content is written from the syllabus and standard C++;
- `class="revision-tracker" data-page="oop/<filename>"`;
- a `.codeblock` containing a `.copy-btn`;
- `class="site-footer"`;
- the four scripts in the order given in Global Constraints.
Assert unit 01 has prior href absent and next `basics-of-cpp.html`; unit 02 has prior `introduction-to-oop.html` and next `classes-and-objects.html`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the two files do not exist.

- [ ] **Step 3: Create the two unit pages**

Use the shell from `notes/discrete/sets-relations-functions.html`: masthead, `doc-shell`, sticky `syllabus` nav with `#syllabus-toggle`, `chapter-reading` article, folio, source line, recall cues, topic sections with `★★★ / ★★ / ★` marks and `EXAM n` badges, revision tracker, chapter nav, footer, scripts.

Unit 01 covers syllabus 1.1: structured vs object-oriented approach and Object, Class, Data Abstraction, Encapsulation, Inheritance, Polymorphism, Dynamic Binding, Message Passing.

Unit 02 covers 2.1, 2.2 and 2.3: program structure, tokens, data types, type conversion, preprocessor, namespace, `cin`/`cout`, cascading I/O, `endl`/`setw`/`setprecision`, `new`/`delete`, control-statement review; function overloading, inline, default arguments, pass by reference, return by reference, scope and storage class; pointer declaration and arithmetic, pointers and arrays, pointer and function.

Give each unit at least one complete, self-contained C++ example in a `.codeblock` with a `.copy-btn`. Do not use the phrase "nine papers".

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite as in Task 1 Step 4.
Expected: no `FAILED:` lines.

- [ ] **Step 5: Commit**

`git add notes/oop/introduction-to-oop.html notes/oop/basics-of-cpp.html tests/oop-subject.test.js`
`git commit -m "feat: add OOP units 01 and 02"`

---

### Task 3: Unit pages 03 and 04

**Files:**
- Create: `notes/oop/classes-and-objects.html`
- Create: `notes/oop/operator-overloading.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: the rail and shell pattern from Task 2.
- Produces: `classes-and-objects.html` with previous `basics-of-cpp.html`, next `operator-overloading.html`; `operator-overloading.html` with previous `classes-and-objects.html`, next `inheritance.html`.

- [ ] **Step 1: Write the failing test**

Append the same per-page assertions as Task 2 for these two files, with their own `data-page`, `aria-current`, and previous/next hrefs. Additionally assert unit 03 contains the strings `Copy Constructor`, `Friend Function`, and `this` pointer; unit 04 contains `Pre-increment`, `Post-increment`, and `String Concatenation`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the two files do not exist.

- [ ] **Step 3: Create the two unit pages**

Follow the Task 3 shell. Unit 03 covers 3.1 structures/classes, members, memory allocation, member functions inside and outside the class; 3.2 default, parameterized, copy and default copy constructors plus destructor; 3.3 objects as arguments, returning objects, static data members and static functions; 3.4 friend function, friend class, copy initialization, `this` pointer.

Unit 04 covers 4.1 fundamentals, restrictions, rules and member operator functions; 4.2 unary pre-increment, post-increment and negation; 4.3 binary plus, comparison and string concatenation; 4.4 basic-to-user-defined, user-defined-to-basic and user-defined-to-user-defined conversion.

Use complete C++ examples for at least the copy constructor, `this` pointer, unary and binary overload sections.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite.
Expected: no `FAILED:` lines.

- [ ] **Step 5: Commit**

`git add notes/oop/classes-and-objects.html notes/oop/operator-overloading.html tests/oop-subject.test.js`
`git commit -m "feat: add OOP units 03 and 04"`

---

### Task 4: Unit pages 05 and 06

**Files:**
- Create: `notes/oop/inheritance.html`
- Create: `notes/oop/virtual-functions-and-polymorphism.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: the rail and shell pattern from Task 2.
- Produces: `inheritance.html` with previous `operator-overloading.html`, next `virtual-functions-and-polymorphism.html`; `virtual-functions-and-polymorphism.html` with previous `inheritance.html`, next `templates-and-exception-handling.html`.

- [ ] **Step 1: Write the failing test**

Append the same per-page assertions as Task 2 for these two files, with their own `data-page`, `aria-current`, and previous/next hrefs. Additionally assert unit 05 contains `Virtual Base Class`, `Aggregation`, and `Ambiguity`; unit 06 contains `Pure Virtual`, `Abstract class`, and `Virtual Destructor`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the two files do not exist.

- [ ] **Step 3: Create the two unit pages**

Follow the Task 3 shell. Unit 05 covers 5.1 base and derived classes with private, protected and public access specifiers; 5.2 single, multiple, hierarchical, multilevel and hybrid inheritance and public/protected/private inheritance; 5.3 constructor and destructor order in derived classes; 5.4 aggregation vs inheritance, ambiguity in multiple and multipath inheritance, virtual base class.

Unit 06 covers 6.1 static and dynamic polymorphism, pointers to base class, virtual functions, implementation of dynamic polymorphism, abstract and concrete classes, pure virtual functions, virtual destructors, and roles of polymorphism.

Use complete C++ examples for multilevel constructor order, virtual base class resolution, and dynamic polymorphism through a base pointer.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite.
Expected: no `FAILED:` lines.

- [ ] **Step 5: Commit**

`git add notes/oop/inheritance.html notes/oop/virtual-functions-and-polymorphism.html tests/oop-subject.test.js`
`git commit -m "feat: add OOP units 05 and 06"`

---

### Task 5: Unit pages 07 and 08

**Files:**
- Create: `notes/oop/templates-and-exception-handling.html`
- Create: `notes/oop/files-and-streams.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: the rail and shell pattern from Task 2.
- Produces: `templates-and-exception-handling.html` with previous `virtual-functions-and-polymorphism.html`, next `files-and-streams.html`; `files-and-streams.html` with previous `templates-and-exception-handling.html`, next `past-questions.html`.

- [ ] **Step 1: Write the failing test**

Append the same per-page assertions as Task 2 for these two files, with their own `data-page`, `aria-current`, and previous/next hrefs. Additionally assert unit 07 contains `Function Template`, `Class Template`, and `catch (...)`; unit 08 contains `ifstream`, `ofstream`, `ios::binary`, and `seekg`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the two files do not exist.

- [ ] **Step 3: Create the two unit pages**

Follow the Task 3 shell. Unit 07 covers 7.1 function templates with multiple arguments, class templates, templates and inheritance, rules for templates; 7.2 exception mechanism, `try`, `catch`, `throw`, multiple catch, catching all exceptions, uses.

Unit 08 covers 8.1 stream class hierarchy, read and write file pointers, text files, end-of-file detection, binary files; 8.2 reading and writing objects and random file access.

Use complete C++ examples for a function template, multiple-catch exception handling, text file I/O, and binary object I/O with `seekg`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite.
Expected: no `FAILED:` lines.

- [ ] **Step 5: Commit**

`git add notes/oop/templates-and-exception-handling.html notes/oop/files-and-streams.html tests/oop-subject.test.js`
`git commit -m "feat: add OOP units 07 and 08"`

---

### Task 6: Exam archive, papers 2078, 2079 and 2080.1

**Files:**
- Create: `notes/oop/past-questions.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: the rail from Task 2, the shared CSS from Task 1, and the exam source `C:\Users\lamam\Downloads\Past Questions.txt`.
- Produces: `notes/oop/past-questions.html` with six `.paper-nav` buttons targeting ids `paper-2078`, `paper-2079`, `paper-2080-1`, `paper-2080-2`, `paper-2081`, `paper-2082`. The three sections built here each hold 12 `.question` elements, `Q1`–`Q12`, each followed by one `<details class="worked-answer"><summary>Worked answer</summary>...`.

- [ ] **Step 1: Write the failing test**

Append assertions that the archive exists and contains:
- the nine rail labels with `Past Questions` marked current;
- six `.paper-nav button` elements with the exact `data-target` values above;
- section ids `paper-2078`, `paper-2079`, `paper-2080-1`;
- for each of those sections, exactly 12 `<li class="question">`, qnums `Q1`–`Q12`, a bracketed mark on every question, and exactly 12 `<details class="worked-answer">`;
- `notes.js`, `past-questions.js`, `player.js` and `site-nav.js` script tags;
- no occurrence of "nine papers".

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the archive does not exist.

- [ ] **Step 3: Build the archive shell and paper 2078**

Copy the shell from `notes/discrete/past-questions.html`: masthead, `doc-shell`, rail, folio `PQ`, source line naming the text-file source and six papers, "How these papers are built" aside, six-button `.paper-nav`, footer and scripts. Add `notes.js` to the script list. Build paper 2078 with 3 long and 9 short questions copied verbatim from the text file, marks preserved, and a worked answer after each. Answers that ask for a program give a complete C++ program in a `.codeblock` with a `.copy-btn`.

- [ ] **Step 4: Build paper 2079**

Add the 12 questions from 2079 with the same answer pattern.

- [ ] **Step 5: Build paper 2080.1**

Add the 12 questions from 2080.1 with the same answer pattern. Use id `paper-2080-1`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`
Expected: PASS for the three paper assertions.

- [ ] **Step 7: Commit**

`git add notes/oop/past-questions.html tests/oop-subject.test.js`
`git commit -m "feat: add OOP exam archive papers 2078 to 2080.1"`

---

### Task 7: Exam archive, papers 2080.2, 2081 and 2082, and link validation

**Files:**
- Modify: `notes/oop/past-questions.html`
- Modify: `tests/oop-subject.test.js`

**Interfaces:**
- Consumes: the archive shell from Task 6.
- Produces: the complete archive with six papers, 72 questions and 72 worked answers; no dangling local links on any OOP page.

- [ ] **Step 1: Write the failing test**

Append assertions that:
- sections `paper-2080-2`, `paper-2081`, `paper-2082` each have 12 `.question` and 12 `.worked-answer` entries with qnums `Q1`–`Q12` and bracketed marks;
- the whole archive has exactly 72 `.question` and 72 `.worked-answer` entries;
- every `href="..."` in the eight unit pages and the archive that starts with `.` resolves to an existing file under the repo root; skip fragments and absolute URLs.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/oop-subject.test.js`
Expected: FAIL because the last three sections are missing.

- [ ] **Step 3: Build paper 2080.2**

Add the 12 questions and worked answers from 2080.2 with id `paper-2080-2`.

- [ ] **Step 4: Build paper 2081**

Add the 12 questions and worked answers from 2081.

- [ ] **Step 5: Build paper 2082**

Add the 12 questions and worked answers from 2082.

- [ ] **Step 6: Run tests to verify they pass**

Run: `node tests/oop-subject.test.js`, then the full suite as in Task 1 Step 4.
Expected: `oop subject tests ok`, no `FAILED:` lines.

- [ ] **Step 7: Commit**

`git add notes/oop/past-questions.html tests/oop-subject.test.js`
`git commit -m "feat: complete OOP exam archive with worked answers"`
