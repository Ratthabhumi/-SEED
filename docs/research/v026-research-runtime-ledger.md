# Research-to-Runtime Ledger — v0.26.1 Playtest Readiness & Evidence Truth

> Milestone: v0.26.1 — Playtest Readiness & Evidence Truth  
> Date: 2026-10-08  
> Status: Authoritative runtime reconciliation against codebase HEAD (`fix/v0261-playtest-readiness-20261008`)

---

## 1. Classification Scheme

Each researched concept or subsystem is audited against the actual repository source code and runtime call graph:

- **`LIVE_AND_VERIFIED`**: Implemented in canonical simulation / runtime, covered by passing automated invariant tests, and actively executing in runs.
- **`LIVE_BUT_HUMAN_UNVALIDATED`**: Functioning in canonical simulation and UI, but player-visible impact has not yet been certified by human playtesters.
- **`PARTIAL`**: Core engine logic exists and operates, but audio/visual manifestation or high-tier content is minimal.
- **`SCAFFOLD_ONLY`**: Type definitions, stubs, or state interfaces exist in `src/core/emergence/`, but are NOT wired into `RunSimulation.step()`. Must NOT be claimed as active gameplay systems.
- **`DEFERRED`**: Research concept deliberately postponed until player-facing evidence justifies its inclusion.
- **`REJECTED_WITH_RATIONALE`**: Investigated but explicitly ruled out due to architectural, performance, or scope incompatibility.

---

## 2. Traceability Matrix: Research vs. Real Runtime

| Subsystem / Research Concept | Status | Implementation Entry Point (Verified Path) | Canonical Sim Invoked? | Exposed in Game UI? | Automated Test Coverage | Human Evidence Status | Reality & Actual Limitations |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| **Deterministic Seed Framework** | `LIVE_AND_VERIFIED` | `src/core/seed/` (`splitmix32.ts`, `pcg32.ts`, `streams.ts`, `runRng.ts`, `hash.ts`) | **YES** | **YES** | `tests/seed/determinism.test.ts` | **PASS** | Pure deterministic RNG streams. Zero `Math.random()` in gameplay. Replay hashes match byte-for-byte. |
| **Tech DAG & Gumbel-Top-k Sampling** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/tech/graph.ts`, `src/core/tech/generator.ts`, `src/core/emergence/offerEngine.ts` | **YES** | **YES** | `tests/emergence/distribution.audit.test.ts` (Class A & C) | `PENDING_PLAYTEST` | Procedural DAG generation with deterministic Gumbel noise. Fallback rate is 7.06% (< 40%). JSD shows offer divergence, but human strategic agency is unverified. |
| **World Laws & World Traits** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/emergence/worldLaws.ts` (`generateWorldLaws`, `deriveWorldTraits`) | **YES** | **YES** | `tests/emergence/distribution.audit.test.ts` | `PENDING_PLAYTEST` | Deterministic laws select 2 player-visible World Traits per world that causally weight tech offers. Shown in top HUD banner; player comprehension pending. |
| **4 Civilization Origins & Abilities** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/progression/origins.ts`, `src/core/combat/squad.ts` (`ORIGIN_ABILITY`), `src/core/sim/RunSimulation.ts` | **YES** | **YES** | `tests/emergence/distribution.audit.test.ts` (Class B & C), `tests/sim/engagement.test.ts` | `PENDING_PLAYTEST` | Hunters (25s), Engineers (25s), Resonant (25s), Sentinels (30s) with active abilities (F key). Bot usage verified; tactical distinctiveness to human players pending. |
| **Outpost Logistics & Garrison** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/emergence/outpostLogistics.ts`, `src/core/world/territory.ts`, `src/core/world/poi.ts`, `src/core/sim/RunSimulation.ts` | **YES** | **YES** | `tests/territory/territory.test.ts`, `tests/emergence/distribution.audit.test.ts` | `PENDING_PLAYTEST` | Territory claiming ('E'), specialization (Research/Military/Economy), and logistics caps exist. Bot claims 54 outposts; human onboarding & map wayfinding pending. |
| **Live Threat Budget Director** | `LIVE_AND_VERIFIED` | `src/core/director/director.ts`, `src/core/combat/spawner.ts`, `src/core/sim/RunSimulation.ts` | **YES** | **YES** | `tests/sim/director.test.ts` | `PENDING_PLAYTEST` | Threat budget pool paces enemy spawn waves in live game loop. Combat feel & pacing need player evaluation. |
| **Experimental Phased Director** | `SCAFFOLD_ONLY` | `src/core/emergence/director.ts` (`PhasedThreatDirector`) | **NO** | **NO** | Unit scaffold only | N/A | Draft architecture for intensity curves (build-up, peak, relax). NOT imported or executed in `RunSimulation.step()`. |
| **Origin Deep Verbs** | `SCAFFOLD_ONLY` | `src/core/emergence/originRulesets.ts`, `src/core/sim/RunState.ts` (`originRulesetState`) | **NO** | **NO** | N/A | N/A | Reserved scaffold state for future origin verbs (Marked Prey, Field Repair, etc.). NOT hooked to gameplay actions in v0.26. |
| **Enemy Ecology / Infighting** | `SCAFFOLD_ONLY` | `src/core/emergence/enemyEcology.ts` | **NO** | **NO** | N/A | N/A | Design concept from research. NOT imported or executed in `RunSimulation.step()`. |
| **Procedural World Events (FATE system)** | `SCAFFOLD_ONLY` | `src/core/emergence/events.ts` | **NO** | **NO** | N/A | N/A | Design concept from research. NOT imported or executed in `RunSimulation.step()`. |
| **Audio Polish / SFX** | `PARTIAL` | `src/game/audio/sfx.ts` | **SimEvent** | **YES** | Basic sound trigger checks | `PENDING_PLAYTEST` | Minimal Web Audio synthesizer placeholder sounds. Comprehensive juice, ZzFX redesign, and volume mix deferred to v0.27. |
| **Dagre Graph Layout & Panzoom UI** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/game/tech/TechGraphLayout.ts`, `src/game/tech/TechMapView.ts`, `src/game/scenes/GameScene.ts` | Reads Sim | **YES** | `e2e/techmap.spec.ts` | `PENDING_PLAYTEST` | Procedural graph layout with smooth pan/zoom in Tech Map modal ('T'). Readability and clarity for real players must be tested. |
| **Kenney Pixel Assets & Noto Sans Thai** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/game/assets/seedAssets.ts`, `src/styles.css` (`@fontsource/noto-sans`, `@fontsource/noto-sans-thai`), `src/i18n/` | N/A | **YES** | `tests/i18n/parity.test.ts`, `scripts/verify-third-party.mjs` | `PENDING_PLAYTEST` | Licensed Kenney sprites & Noto Sans / Thai fonts active with full EN/TH key parity. Line-height 1.7+ enforced; real Thai speaker UX review pending. |
| **Synthetic Factorial Evaluation** | `LIVE_AND_VERIFIED` | `tests/emergence/distribution.audit.test.ts` (Class B) | **YES** | **NO** | Vitest automated suite (48 factorial runs) | N/A | Automated testing tool: 4 autonomous decision policies step canonical simulation up to 40s canonical time. Proves API capability, NOT human fun. |
| **Pathfinding (A* / Navmesh)** | `REJECTED_WITH_RATIONALE` | N/A | N/A | N/A | N/A | N/A | Spatial grid queries and flocking steering are sufficient for current horde density and meet the 60 FPS performance budget. |
| **Entity Component System (ECS)** | `REJECTED_WITH_RATIONALE` | N/A | N/A | N/A | N/A | N/A | Flat contiguous object arrays in `RunState` (`enemies`, `projectiles`, `pickups`) are cache-friendly, simpler, and pass all performance benchmarks. |
| **Runtime LLM / Generative Content** | `REJECTED_WITH_RATIONALE` | N/A | N/A | N/A | N/A | N/A | Incompatible with 60 FPS deterministic offline desktop web target and deterministic replay contract. |

---

## 3. Path Discrepancy Corrections (Audit Ground Truth)

The previous v0.26 research ledger contained several non-existent file paths that created false traceability. The following corrections are authoritative:

| Phantom / Erroneous Path in v0.26 | Verified Actual Path in Codebase | Current Status |
| :--- | :--- | :--- |
| `src/core/world/laws.ts` | `src/core/emergence/worldLaws.ts` | `generateWorldLaws()` and `deriveWorldTraits()` live here |
| `src/core/world/traits.ts` | `src/core/emergence/worldLaws.ts` | World Traits types and derivations are in `worldLaws.ts` |
| `src/core/tech/techGraph.ts` | `src/core/tech/graph.ts` | Tech graph definition and generation live in `graph.ts` and `generator.ts` |
| `src/core/tech/offerEngine.ts` | `src/core/emergence/offerEngine.ts` | Offer sampling and Gumbel noise engine live in `core/emergence/` |
| `src/core/territory/` | `src/core/world/territory.ts`, `src/core/emergence/outpostLogistics.ts` | Territory chunk state is in `world/territory.ts`; logistics math in `emergence/` |
| `src/renderer/scenes/TechMapScene.ts` | `src/game/tech/TechMapView.ts` & `src/game/tech/TechGraphLayout.ts` | Tech map rendering is DOM/SVG/Panzoom inside `src/game/tech/` |
| `src/core/director/phasedDirector.ts` | `src/core/emergence/director.ts` | `PhasedThreatDirector` class exists here as `SCAFFOLD_ONLY` |
| `src/core/ecology/` | `src/core/emergence/enemyEcology.ts` | Ecology scaffolding exists here as `SCAFFOLD_ONLY` |
| `src/core/events/` | `src/core/emergence/events.ts` | Procedural FATE events scaffold exists here as `SCAFFOLD_ONLY` |
| `src/renderer/audio/` | `src/game/audio/sfx.ts` | Web Audio sound effects live in `src/game/audio/sfx.ts` |
| `src/renderer/assets/` | `src/game/assets/seedAssets.ts` | Asset registration and Kenney sprites live in `src/game/assets/` |

---

## 4. Key Findings & Truth-in-Reporting Corrections

1. **Origin Active Ability Cooldowns**:
   - `origins.ts` and `RunSimulation.ts` define cooldowns: `hunters`: 25s, `engineers`: 25s, `resonant`: 25s, `sentinels`: 30s.
2. **Offer vs Trajectory Divergence (Class C Truth)**:
   - Class C tests measure single-draft offer and heuristic first-pick divergence after artificial knowledge injection (`gainKnowledge(2000)`), NOT full multi-draft player decision trajectories.
   - Non-fallback offer JSD: Hunters vs Engineers = 0.0152, Hunters vs Resonant = 0.0134, Hunters vs Sentinels = 0.1523.
   - First-pick JSD: Hunters vs Engineers = 0.0393, Hunters vs Resonant = 0.0369, Hunters vs Sentinels = 0.2883.
3. **Collision Rate & Sample Frequency (Class A Truth)**:
   - The metric previously called "Collision rate" (15.90%) is actually the `collidingFingerprintGroupRate` (the fraction of unique fingerprint groups that appeared > 1 time).
   - The genuine `duplicateDraftSampleFrequency` (the percentage of observed draft instances that are duplicates of previously seen fingerprints) is **53.97%**.
   - The denominator is now verified against the exact observed draft count (`observedDraftSamples = 6000`).
4. **Autonomous Synthetic Players vs Human Reality (Class B Truth)**:
   - Synthetic players in Class B run up to 40 seconds of canonical simulation time (2,400 steps @ 60 Hz).
   - They execute actions via direct simulation APIs (`sim.claimTerritory()`, `sim.tryAbility()`).
   - While EXPANDER claims 54 outposts and AGGRESSOR uses 20 abilities, this verifies **simulation rule capability**, NOT human player onboarding, UI usability, or game enjoyment.
