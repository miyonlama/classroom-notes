# Motion plans

| # | Title | Severity | Status |
|---|-------|----------|--------|
| 001 | Ease the exam-paper switch | MEDIUM | DONE |
| 002 | Add press feedback to player buttons | LOW | DONE |

Recommended execution order: 001, then 002.

Dependencies: none. The two plans touch different files (`past-questions.*` vs `player.css`) and can be executed in either order or in parallel.

Source findings came from a `find-animation-opportunities` sweep on commit `150b432`. Both plans use the repo's existing `cubic-bezier(0.16, 1, 0.3, 1)` curve and stay inside the duration budgets in `AUDIT.md`.
