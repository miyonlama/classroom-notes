# Classroom Notes Hub

Static site: dark editorial hub + subject notes pages.

## Hub
`index.html` uses `subjects.json` to render subject cards. No 3D, no build step.

## Notes
- `notes/index.html` — subject list
- `notes/discrete-structure.html` — 6 interactive chapters under `notes/discrete/`
- Other subjects are placeholders until PDFs are supplied.

## Deploy (GitHub Pages)
Push to `master`. Pages serves the root automatically.

## Regenerate Discrete Structure pages
Place PDFs in `assets/pdfs/` and run:
`python .opencode/plan/gen.py <pdf> notes/discrete/<out>.html "<title>"`
