# Session Handoff

## CURRENT CANONICAL STATE — READ THIS FIRST

- Active branch: `proto/v024-emergent-seed-core-20261002`
- Parent logical baseline: `cf9c0ce` (v0.23.1 Interaction Clarity + Territory Economy — frozen, do not modify)
- Remote HEAD at session start: `2a78b6d2e226ced10675638be32578a738b16ccc`
- Versions: WORLDGEN 2 / CONTENT 7 / SAVE 1 / package 0.2.0-dev.0
- Current milestone: v0.24 Emergent Seed Core (Technical Baseline Stabilization — Human Audit postponed to v0.25)
- Prior CI status:
  - Run 37146320966: Failed (E2E failure)
  - Run 37237370456: Failed (0 jobs created due to invalid `matrix.node == 24` conditional on standalone `analyze` job)
- Corrective applied:
  - CI workflow fixed: standalone Node 24 `analyze` job without invalid matrix conditional
  - Cleaned debug residue: removed `%%% OPEN_DRAFT`, `%%% PICKCARD`, `%%% CHOOSEDRAFT`, temporary setTimeout probes, drainDrafts console spam, and temporary browser console captures
  - Explicit `type="button"` on draft interactive controls (`.card-select`, `.card-reserve`, `.btn` reroll/skip)
  - Replaced non-deterministic `Date.now()` in `events.ts` with seeded RNG
- Verified live runtime scope:
  - **World Laws**: deterministic seed-derived universe rules (`domainBias`, `combatBias`, world axes). Universe-level: same masterSeed across Ascension = same World Laws. Note: `combatBias` generated but not yet consumed in offer scoring (target for v0.25).
  - **Offer Engine**: Gumbel-Top-k (K=3) selection with quality sampling, anti-pattern penalties. `DraftOffer` type. Note: quality coupling and age-rarity clamping slated for rework in v0.25.
  - **Origins**: Live differentiation is family pair, World Expansion family unlock, and active F signature abilities (Hunters = Volley, Engineers = Overdrive, Resonant = Nova, Sentinels = Bulwark). Canonical `originMechanic` fields (`hunterMarks`, `hunterTrophies`, `fabricationModules`, etc.) are initialized but reserved / not active in simulation mechanics.
  - **Director**: `src/core/director/director.ts` is the live director (threat budget, seeded RNG). `src/core/emergence/director.ts` is experimental scaffold only.
  - **Enemy Ecology & Procedural Events**: experimental scaffolds, not integrated into live runtime.
  - **Logistics & Garrison**: Logistics points gate outpost spec assignment; garrison system operational.

---

## RECONCILIATION

- Reconciliation baseline:
  - `968a205` → `2a78b6d` is 5 commits ahead.
  - `716de31` → `2a78b6d` is 1 commit ahead.
- Clean tree: in progress for technical certification.

---

## VERSIONS

- WORLDGEN_VERSION: 2 (unchanged)
- CONTENT_VERSION: 7 (Offer instance type + World Laws in canonical state)
- SAVE_SCHEMA_VERSION: 1 (unchanged)
- Package: 0.2.0-dev.0

---

## STATUS & NEXT STEPS

- Complete local verification suite (`npm run check`, `npm run analyze`, `npm run test:e2e`).
- Push technical corrective to `proto/v024-emergent-seed-core-20261002`.
- Verify exact-SHA GitHub Actions run is 100% green across all jobs.
- Freeze `proto/v024-emergent-seed-core-20261002` at certified SHA (`V024_TECHNICAL_BASELINE_GREEN`).
- Branch `feat/v025-player-visible-emergence-20261005` for player-visible emergence implementation.