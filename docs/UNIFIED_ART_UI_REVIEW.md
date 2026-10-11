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

Animation limitation: tank and boss currently use rigid facing/hit/equipment poses; their three gait frames repeat. Authored walking, attack and death animation remains production work.

## Verification and limits
- Focused asset/theme/canonical repair tests:17/17; analyze:6/6. Typecheck, provenance31 assets, production build, ZIP and release:verify17 checks passed locally.
- Local full check exceeded the existing180s frontier-policy timeout (726.7s on this machine); canonical policy outcomes matched baseline. Preserved scratch/unified-check.log, stopped only that verified runner tree. No test thresholds weakened. Exact-head Node22/24 CI full checks passed at c9f3cb5; final pushed head still requires all four jobs.
- First browser run: existing evolution4/4 and new canonical repair2/2 passed; two title matrix tests exposed a test fixture schema error. Corrected the schema2 meta fixture; partitioned all48 viewport/scale/language combinations into per-viewport tests under the existing cap, plus separate native funded-purchase cases. Assertions and product rules unchanged.
- Reviewed actual TH390px/200% title and TH1280px repair captures: Start accessible; independent content/Archive scrolling; repair13%/8.6s visible. Goal labels were ellipsized even at normal scale; now wrap above their bars.
- Baseline/child frame p95:222.2/268.2ms; c9f3cb5 comparison104.3/101.1ms. Renderer CPU submission p95:37.1/45.8ms versus15/12.3ms. Same harness, different ambient load/entity counts: exploratory comparison only, no causal improvement or60FPS certification. Raw actor texture estimate2.81MiB excludes engine overhead.
- ART_PRODUCTION_PARTIAL; HUMAN_VISUAL_REVIEW_PENDING. No HUMAN_FUN_PASS. Required human retest: all four Origins and six equipment Ages, tank/boss animation limitations, crowded/grayscale/high-contrast readability, small-screen Archive scrolling and repair pause/exit/restoration. Hardware performance budgets remain unverified.

Corrected local browser suite:16/16 passed (48 title combinations,2 native purchase cases,2 canonical repair cases). Final code checkpoint42ae39ed232bfa32ee5e45feee9bbc7bb853c99a rebuilt and passed ZIP/release verification; locale-preserving purchase/repair rerun captured final goal-label wrapping. Exact final pushed-head CI and artifact receipt is maintained in Draft PR4: https://github.com/Ratthabhumi/-SEED/pull/4 .
