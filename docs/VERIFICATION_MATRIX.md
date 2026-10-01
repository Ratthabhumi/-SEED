# Verification Matrix & Efficiency Tiers

This document establishes the official verification tiers for the -SEED project to maximize engineering efficiency while guaranteeing zero defects on committed code.

---

## 1. Verification Tiers

To avoid wasteful re-runs of the entire 3-minute Playwright suite on trivial or localized changes during rapid iterative development, development verification is partitioned into four clear tiers based on blast radius:

| Tier | Category | Examples | Required Local Verification |
|---|---|---|---|
| **TIER D** | **Documentation Only** | `ROADMAP.md`, `README.md`, `docs/**`, `SESSION_HANDOFF.md` prose | `git diff --check`, relevant markdown/provenance validator (`npm run verify:third-party` if licenses/manifest touched). Do **NOT** run full Playwright suite for prose-only edits. |
| **TIER P** | **Presentation / UI / I18N / Visual** | `src/styles.css`, `src/game/tech/**`, `src/game/onboarding/**`, `src/i18n/**`, VFX presentation | `npm run typecheck`, targeted Vitest suites (e.g. `npx vitest run tests/i18n/ tests/tech/`), `npm run build`, targeted Playwright specs (e.g. `npx playwright test e2e/techMap.spec.ts e2e/visual.spec.ts`). |
| **TIER Q** | **QA Infrastructure** | `src/qa/**`, `scripts/qa-*`, QA panel, telemetry, recording | `npm run typecheck`, QA unit tests (`npx vitest run tests/qa/`), targeted QA Playwright specs (`npx playwright test e2e/qa*.spec.ts`), report serialization validation. |
| **TIER C** | **Core / Content / Save / Simulation / Worldgen** | `src/core/**`, `src/content/**`, balance, replay, determinism | **Full Gate**: `npm run check` (typecheck + all Vitest unit tests + verify:third-party + build) + full `npm run test:e2e` (all 25+ Playwright specs). |

### Strictest Tier Rule
> If an edit or changeset touches files spanning multiple tiers, **always apply the strictest tier** among them.

---

## 2. Final Branch Gate (Pre-Push & CI)

Regardless of development tier, before declaring any milestone complete, merging branches, or handing off to human playtesters:

1. **Local Full Check**:
   ```bash
   npm run check           # tsc --noEmit + vitest run + verify:third-party + vite build
   npm run test:e2e        # full playwright test suite
   git diff --check        # zero whitespace/formatting defects
   ```
2. **GitHub Actions CI (Remote)**:
   - Run must execute on the exact commit SHA pushed to the remote branch.
   - **`verify (Node 22)`**: `SUCCESS`
   - **`verify (Node 24)`**: `SUCCESS`
   - **`e2e`**: `SUCCESS`
3. **Human Release Gates**:
   - Automated testing is necessary but never sufficient.
   - Human validation must confirm subjective clarity, game feel, readability, and fun before milestone closure.
