# Session Handoff

## CURRENT CANONICAL STATE — READ THIS FIRST

- Active branch: `feat/v025-player-visible-emergence-20261005`
- Certified v0.24 technical baseline: `9c261e43c670ddf2208f8b4c38748879bcf167da` on `proto/v024-emergent-seed-core-20261002` (exact-SHA CI run 37644086577 100% green: Node 22, Node 24, Chromium E2E, Analyze).
- Parent logical baseline: `cf9c0ce` (v0.23.1 Interaction Clarity + Territory Economy — frozen, do not modify)
- Versions: `WORLDGEN_VERSION = 2` / `CONTENT_VERSION = 8` (intentional deterministic break: offer engine decoupling + quality sampling) / `SAVE_SCHEMA_VERSION = 1` / package `0.2.0-dev.0`
- Current milestone: `v0.25 Player-Visible Emergence` (Target: `V025_PLAYER_VISIBLE_EMERGENCE_HUMAN_AUDIT_READY`)
- Prior v0.24 CI status:
  - Run 37146320966: Failed (E2E failure)
  - Run 37237370456: Failed (0 jobs created due to invalid `matrix.node == 24` conditional on standalone `analyze` job)
  - Run 37644086577: PASSED ✅ (All 4 jobs passed: verify Node 22, verify Node 24, e2e Node 24, analyze Node 24)

---

## v0.25 IMPLEMENTATION OVERVIEW

1. **CONTENT_VERSION 8**:
   - Intentional deterministic break documented in `src/core/seed/versions.ts`.
   - `WORLDGEN_VERSION` remains 2; `SAVE_SCHEMA_VERSION` remains 1.

2. **Two-Stage Offer Engine**:
   - **Stage 1 (Selection)**: Decoupled from quality multipliers (`QUALITY_MULT`). Evaluates eligible `TechNode`s using Gumbel-Top-k with base node weight, domain affinity from `WorldLaws.domainBias`, combat family affinity from `WorldLaws.combatBias`, active origin families, owned tech synergies, novelty, underused-path bonus, and anti-pattern penalties. Removed dead `geographyAffinity * 0`.
   - **Stage 2 (Quality & Modifiers)**: Decoupled quality sampling (`COMMON`, `UNCOMMON`, `RARE`, `MYTHIC`) with modifier generation and effective effects derivation. Zero age-clamping (no suppression in Stone, no forced Mythic in Space).

3. **Authoritative Origin Identity & Legibility**:
   - Consolidated single source of truth for `OriginDef` in `src/core/progression/origins.ts`.
   - `squad.ts` and `originRulesets.ts` derive directly from `originById`.
   - Title screen surfaces origin cards with starting families, active ability (Volley/Overdrive/Nova/Bulwark) with cooldown, and strategic recommendation.
   - In-game HUD, Pause screen, Chronicle, and Guide make signature ability and cooldown readable with 100% EN/TH parity.
   - Canonical `originMechanic` fields (`hunterMarks`, etc.) explicitly retained as reserved experimental state.

4. **Player-Visible World Traits**:
   - Deterministically derived 1–2 legible traits per seed from `domainBias` and `combatBias` via `deriveWorldTraits(laws)`.
   - Surfaced on run-start toast, pause screen, chronicle, and in-game guide.
   - Directly answers: *"What makes this seed different?"*

5. **Experience & Distribution Audit Upgrade**:
   - Real age-index buckets (`Stone`, `Bronze`, `Iron`, `Industrial`, `Atomic`, `Space`) with positive sample counts across all buckets.
   - Separate tracking for real offers vs fallback offers (fallback < 7%).
   - All 4 qualities observed across all ages.
   - 4 Rule-based synthetic player policies (`BUILD_SEEKER`, `SURVIVOR`, `EXPANDER`, `AGGRESSOR`) demonstrating distinct behavioral trajectories.
   - Same-seed / different-origin test suites demonstrating divergence (JSD > 0.04 across domains).
   - Different-seed / same-origin test suites demonstrating World Trait and offer divergence.

6. **Deferred / Scaffolds (Explicit Boundary)**:
   - Live director: `src/core/director/director.ts` (threat budget, seeded RNG) remains the single canonical director.
   - Experimental scaffolds (`enemyEcology.ts`, `events.ts`, `emergence/director.ts`) remain isolated and are not integrated into live simulation.

---

## RECONCILIATION

- Reconciliation baseline:
  - `968a205` → `2a78b6d` is 5 commits ahead.
  - `716de31` → `2a78b6d` is 1 commit ahead.
  - `2a78b6d` → `9c261e4` is 1 commit ahead (v0.24 technical certification).
  - `9c261e4` → `feat/v025-player-visible-emergence-20261005` (v0.25 implementation).

---

## VERIFICATION COMMANDS

```bash
# Typecheck, test, build, third-party verify
npm run check

# Emergence & Experience Audit
npm run analyze

# Full Playwright E2E
npm run test:e2e

# Packaging and release verification
npm run zip
npm run release:verify
```