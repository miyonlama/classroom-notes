# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user maintains the site, reads the notes, and shares it with other readers. Two modes matter: author/maintainer and reader. Reader job is to reach the right subject or chapter quickly; maintainer job is to add or update subjects and content.

## Product Purpose

A hub that makes studying material discoverable and reachable. Success means a visitor is impressed by the hub and still reaches the correct notes with minimal effort.

## Positioning

A visual showcase front door to a plain notes archive: atmosphere earns attention, direct navigation closes the job.

## Operating Context

Five subjects. Discrete Structure is populated with six chapters recreated from supplied PDFs; other subjects are placeholders awaiting PDFs. Deployed as a public static site on Vercel with auto-deploy on push.

## Capabilities and Constraints

- Free static hosting only. No backend, no auth, no paid services.
- Plain HTML/CSS/JS, no build step.
- Five subjects defined in `subjects.json`.
- Notes pages and Discrete Structure chapters are already built and must not be broken by hub work.
- Open decision: whether other subject pages receive real content later.
- Open decision: accessibility requirements beyond existing reduced-motion support are not established.

## Brand Commitments

Existing name: Classroom Notes. Public site. Subject colors and icons live in `subjects.json` and act as the current identity tokens.

## Evidence on Hand

- `subjects.json` — subject names, slugs, colors, icons, descriptions.
- `assets/pdfs/` — six Discrete Structure PDFs.
- `notes/discrete/` — six recreated interactive chapter pages.
- Live Vercel site confirmed working.

## Product Principles

1. Visual impact and task completion carry equal weight.
2. The hub is a front door, not the destination; notes stay reachable in few clicks.
3. Content truth comes from supplied PDFs; do not fabricate subject matter.
4. Keep the static, free, no-backend constraint absolute.
5. Preserve existing notes pages when changing the hub.
