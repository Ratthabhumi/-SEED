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

## 3. Historical Evidence Policy

Milestone visual-audit captures (`docs/visual_audit_v022/`,
`docs/visual_audit_v022_r2/`, `docs/visual_audit_v0221/`) are **immutable
historical evidence**. Routine CI must never rewrite them:

- Capture specs were converted to **archival verification**: assert each
  expected file exists, is non-empty, and has a PNG magic header — plus live
  product invariants (controls exist, no raw localization keys, deliberate
  product copy such as "Overview").
- Live-behavior coverage that used to live inside capture specs (tech-map
  fit/pin flow, outpost picker, onboarding flow, HUD states) moved into
  behavior tests that write nothing into archive dirs. Throwaway screenshots,
  if ever needed, go to gitignored `test-results/`.
- New milestones create NEW archive dirs (e.g. `docs/visual_audit_v023/`);
  old dirs are never extended in place.

## 4. E2E Save-State Preconditions

Tests NOT about onboarding boot with `tutorialCompleted: true` via the shared
`e2e/helpers.ts` `startRun()` (deterministic seeded save through
`addInitScript`, before GameScene boot). Onboarding tests pass
`tutorialCompleted: false` explicitly. Modal-blocking suites resolve
legitimate draft state with `resolveDrafts()` (real clicks, bounded loop).
No `force: true` clicks anywhere: an intercepted click is a real sequencing
defect until proven otherwise.
