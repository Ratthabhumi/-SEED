# Unified art/UI corrective review — 2026-10-12

Baseline: a1d74ca28861fe7a4127b36b71a686fb48f623a9 (PR3). New workstream feat/unified-art-ui-repair-20261012; do not merge existing PRs/main. Incoming human report219 (session qa-54140-qfkh03) is preserved with its uncommitted sanitized files, without rewriting old interrupted softlock evidence. Private baseline reports/screenshots/bundle copied to scratch/unified-art-baseline-20261012.

## Root causes and corrections
1. Production PlayerRenderer drew bright primitive body below scout; EnemyRenderer drew primitive families plus capped64 chaser overlay. Now mandatory original sprite registry covers all four actual Origins, four enemy families, boss, guardian and same-Origin command squad; body flag suppresses old geometry. Functional affix/aim/HP/dash graphics remain. Source ledger: ACTOR_COVERAGE.md. No silent missing-art fallback.
2. Outpost repairT already advances canonically over10 seconds within350u, resets on exit, restores50%HP. Only Civilization Map exposed elapsed repair; world view lacked progress. A single world-space pooled label/bar now reads nearest visible disabled site, exact percent/remaining time; no fake timer. Existing outpost_repaired event supplies restoration text.
3. Origin identities shared one scout image and base geometry. New original asymmetric equipment silhouettes and six reusable Age equipment sets + anchored three-pose gait show actual Origin; hit/ability/dash feedback preserves canonical mechanics. Full authored attack/death animation remains partial.
4. Title nested expanding Archive in a580px panel centered inside overflow:hidden screen. Bounded two-region layout separates Archive from Start footer; short/narrow screens have explicit scroll ownership. Common semantic token palette replaces aliases and shared controls/cards/HUD; color tests, high contrast and focus style added. Incremental migration retains specialized map colors.

## Scope integrity
No core gameplay edits, Content/worldgen/save version changes or new dependencies. Existing Archive purchases, Logistics/first-Signal exemption, Tech eligibility/pin guidance, age gates, combat damage/health/movement/hitboxes remain. Test-only staging is query-gated and distinct from human QA. Existing durable raw evidence not deleted.

## Validation receipt
Pending final local/browser/CI verification; no green verdict before results. Screenshots captured from actual game except explicitly isolated actor sheet and query-gated combat/repair fixtures; these are engineering evidence, not human fun certification. Performance comparison uses same seeded sparse parent/child harness1920×1080; software renderer and ambient machine load limit causal inference.60FPS/hardware and long-session resource certification remain pending.

## Remaining production art / human checklist
ART_PRODUCTION_PARTIAL and HUMAN_VISUAL_REVIEW_PENDING: authored attack/dash/death frame sequences, bespoke elites/squad roles and full environment ages remain. Human must inspect4Origin previews, grayscale silhouettes, busy mixed combat, terrain contrast and repair area/readability, keyboard/200%Thai. Then new clean canonical human playtest (no E2E staging), real hardware FPS, Archive attempt2 and boss/Ascension. Do not infer HUMAN_FUN_PASS from CI, target-complete telemetry, or valid assets.
