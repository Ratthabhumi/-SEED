# Session Handoff

## CURRENT CANONICAL STATE — READ THIS FIRST

- Active branch: `feat/v026-experience-evidence-20261008`
- Certified v0.25 automated baseline: `12e172cba23fdf06cec4bf0057fcf3fcfb3a4d2d` on `feat/v025-player-visible-emergence-20261005` (exact-SHA CI run 37658953734 100% green: Node 22, Node 24, Chromium E2E, Analyze).
- Certified v0.24 technical baseline: `9c261e43c670ddf2208f8b4c38748879bcf167da` on `proto/v024-emergent-seed-core-20261002` (exact-SHA CI run 37644086577 100% green).
- Parent logical baseline: `cf9c0ce` (v0.23.1 Interaction Clarity + Territory Economy — frozen, do not modify).
- Versions: `WORLDGEN_VERSION = 2` / `CONTENT_VERSION = 8` / `SAVE_SCHEMA_VERSION = 1` / package `0.2.0-dev.0`.
- Current milestone: `v0.26 Experience Evidence & Playability Validation` (Target: `V026_EXPERIENCE_EVIDENCE_HUMAN_PLAYTEST_READY`).
- Next milestone gate: **Human Playtest Gate** (`docs/playtests/PLAYTEST_PROTOCOL_V026.md`). Direction of v0.27 (Combat Feel, Pacing Director, Strategic Geography, or Territory Rework) is determined strictly by human playtest findings.

---

## v0.26 IMPLEMENTATION OVERVIEW

1. **Evidence Integrity & Audit Corrections (`tests/emergence/distribution.audit.test.ts`)**:
   - **Class A (Conditioned Distribution Tests)**: Staged sampling across all 6 real ages (`stone`, `bronze`, `iron`, `industrial`, `atomic`, `space`). Explicitly asserts all 4 qualities present per age (COMMON ~59%, UNCOMMON ~27%, RARE ~10%, MYTHIC ~3%). Fallbacks isolated (< 8%).
   - **Class B (Natural Gameplay Simulations)**: Autonomous factorial simulation matrix without cheats (3 seeds × 4 origins × 4 policies = 48 runs). Policies physically navigate and step canonical simulation:
     - `EXPANDER`: Actively navigates chunk map, claims and specializes outposts naturally (54 outposts claimed across 12 runs).
     - `AGGRESSOR`: Actively hunts enemies, casts F abilities off cooldown (20 casts), and focuses warfare cards.
     - `SURVIVOR`: Kites mobs, uses panic F ability when injured, reserves defense cards.
     - `BUILD_SEEKER`: Seeks knowledge pickups and optimizes synergy tags with rerolls.
   - **Class C (Trajectory Divergence)**:
     - Mathematically validated base-2 normalized Jensen-Shannon Divergence ($0 \le JSD \le 1.0$).
     - Clean separation of fallback cards from canonical domain counters (zero `unknown` domain contamination).
     - Separate evaluation of raw offer divergence (JSD > 0.01) vs selected pick divergence (JSD > 0.035, and > 0.25 for Sentinels vs Hunters).
   - **Authoritative Cooldown Reconciliation**: Authoritative cooldowns verified in `src/core/progression/origins.ts` (Hunters 25s, Engineers 25s, Resonant 25s, Sentinels 30s) and truth-in-reporting documented.

2. **Upgraded Human QA Pipeline**:
   - `scripts/qa-report.mjs` and `scripts/qa-watcher.mjs` updated to dynamically generate version-aware reports (`latest-v026-experience-human.md`) when `content >= 8`, preserving historical v0.23.1 files.
   - `scripts/qa-handoff.mjs` upgraded to recognize `latest-v026-experience-human.md` as primary candidate.
   - Created `docs/playtests/PLAYTEST_PROTOCOL_V026.md` covering the 3 required human playtest cohorts (Same seed × 4 origins, same origin × 3 seeds, natural full run) and the 7-dimension subjective rubric (1–5 scale).

3. **Research-to-Runtime Ledger**:
   - Created `docs/research/v026-research-runtime-ledger.md` classifying all systems into `LIVE_AND_VERIFIED`, `LIVE_BUT_HUMAN_UNVALIDATED`, `PARTIAL`, `SCAFFOLD_ONLY`, `DEFERRED`, and `REJECTED_WITH_RATIONALE`.
   - Clarified that Origin deep verbs (`markedPrey`, etc.), phased Director, and enemy ecology are currently scaffolds and not live gameplay features.

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