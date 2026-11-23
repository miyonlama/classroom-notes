# Classroom Notes Hub

Static site: scroll-scrubbed 3D classroom home page + subject notes pages.

## Subjects
- Discrete Structure: 6 chapters recreated from PDFs under `notes/discrete/`.

## Deploy (GitHub Pages)
1. Create a repo and push this folder.
2. Settings -> Pages -> Source: main branch, / (root).
3. Site goes live at https://<user>.github.io/<repo>/.

## Classroom frames
Drop Blender-rendered webp frames into `assets/classroom/frames/` as
`frame_000.webp`, `frame_001.webp`, ... and update `frameCount` in
`assets/js/scrubber.js`. For mobile, drop smaller set into
`assets/classroom/frames/mobile/`.

## Regenerate Discrete Structure pages
Place PDFs in `assets/pdfs/` and run:
`python .opencode/plan/gen.py <pdf> notes/discrete/<out>.html "<title>"`

## Reduced motion
Users with prefers-reduced-motion see `assets/classroom/hero.webp` instead.