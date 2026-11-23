# Classroom Notes Hub

Static site: dark editorial hub + subject notes pages.

## Hub
`index.html` uses `subjects.json` for an animated orb selector (rings, starfield, < > arrows, keyboard) and subject cards. No 3D, no build step.

## Notes
- `notes/index.html` — subject list
- `notes/discrete-structure.html` — 6 interactive chapters under `notes/discrete/`
- Other subjects are placeholders until PDFs are supplied.

## Deploy
- Vercel: https://classroom-notes-mocha.vercel.app/ (auto-deploy on push)

## Regenerate Discrete Structure pages
Place PDFs in `assets/pdfs/` and run:
`python .opencode/plan/gen.py <pdf> notes/discrete/<out>.html "<title>"`
