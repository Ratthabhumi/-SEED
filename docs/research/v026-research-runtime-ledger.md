# Research-to-Runtime Ledger — v0.26 Experience Evidence

> Milestone: v0.26 — Evidence Integrity & Playability Validation  
> Date: 2026-10-08  
> Status: Authoritative runtime reconciliation against codebase HEAD (`feat/v026-experience-evidence-20261008`)

---

## 1. Classification Scheme

Each researched concept or subsystem is rigorously audited against actual runtime implementation:
- **`LIVE_AND_VERIFIED`**: Implemented in canonical simulation / runtime, covered by passing automated invariant tests, and actively executing in runs.
- **`LIVE_BUT_HUMAN_UNVALIDATED`**: Functioning in canonical simulation and UI, but player-visible impact has not yet been certified by human playtesters.
- **`PARTIAL`**: Core engine logic exists and operates, but high-tier content, visual manifestation, or sub-systems are incomplete.
- **`SCAFFOLD_ONLY`**: Type definitions, stubs, or state interfaces exist in `src/core/` or `src/content/`, but have zero runtime gameplay effect. Must NOT be claimed as functional game features.
- **`DEFERRED`**: Research concept deliberately postponed until player-facing evidence justifies its inclusion.
- **`REJECTED_WITH_RATIONALE`**: Investigated but explicitly ruled out due to architectural, performance, or scope incompatibility.

---

## 2. Research Subsystems Ledger

| Subsystem / Research Concept | Status | Implementation Entry Point | Automated Verification | Reality & Current Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Deterministic Seed Framework** | `LIVE_AND_VERIFIED` | `src/core/seed/` (`splitmix32.ts`, `pcg32.ts`, `seedStreams.ts`) | `tests/seed/determinism.test.ts` (100% replay invariant across seeds) | Pure deterministic RNG streams. Zero `Math.random()` in gameplay. Replay hashes match byte-for-byte. |
| **Tech DAG & Gumbel-Top-k Sampling** | `LIVE_AND_VERIFIED` | `src/core/tech/techGraph.ts`, `src/core/tech/offerEngine.ts` | `tests/emergence/distribution.audit.test.ts` (Class A & C) | Procedural DAG generation with deterministic Gumbel noise. Rarity, quality, and domain biases active. Fallbacks isolated (< 8%). |
| **World Laws & World Traits** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/world/laws.ts`, `src/core/world/traits.ts` | `tests/emergence/distribution.audit.test.ts` (Class C seeds) | Deterministic world laws select 2 player-visible World Traits per world that causally alter offer weights. Player comprehension pending playtest. |
| **4 Civilization Origins & Abilities** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/progression/origins.ts`, `src/core/sim/RunSimulation.ts` | `tests/emergence/distribution.audit.test.ts` (Class B & C) | Hunters, Engineers, Resonant, Sentinels with active abilities (F key) on 25s/25s/25s/30s cooldowns. Offer JSD > 0.015, pick JSD > 0.038. Strategic divergence pending playtest. |
| **Outpost Logistics & Garrison** | `LIVE_BUT_HUMAN_UNVALIDATED` | `src/core/territory/`, `src/core/sim/RunSimulation.ts` | `tests/territory/territory.test.ts`, `tests/emergence/distribution.audit.test.ts` (EXPANDER claims) | Logistics capacity limits outposts. Garrison trades mobile squad units for localized buffs. Needs human balance feedback. |
| **Live Threat Budget Director** | `LIVE_AND_VERIFIED` | `src/core/combat/spawner.ts`, `src/core/sim/RunSimulation.ts` | `tests/sim/director.test.ts` | Adaptive threat points pool controls enemy spawn waves and pacing based on player survivability. |
| **Experimental Phased Director** | `SCAFFOLD_ONLY` | `src/core/director/phasedDirector.ts` (scaffold) | N/A (not wired to `RunSimulation.step`) | Draft architecture for intensity curves (build-up, peak, relax). Not currently wired into the live game loop. |
| **Origin Deep Verbs (Marked Prey, etc.)** | `SCAFFOLD_ONLY` | `src/core/emergence/originRulesets.ts`, `src/core/sim/RunState.ts` (lines 107–120) | N/A | Reserved scaffold state for future origin verbs. No runtime effects in v0.26. Must NOT be claimed as active. |
| **Enemy Ecology / Faction Infighting** | `SCAFFOLD_ONLY` | `src/core/ecology/` (scaffold) | N/A | Design concept from research. Not active in runtime simulation. |
| **Procedural World Events (FATE system)** | `SCAFFOLD_ONLY` | `src/core/events/` (scaffold) | N/A | Design concept from research. Not active in runtime simulation. |
| **Game Feel / Audio Polish (ZzFX)** | `DEFERRED` | `src/renderer/audio/` | N/A | Minimal placeholder sounds. Major audio redesign deferred pending human combat feel verdict. |
| **Dagre Graph Layout & Panzoom UI** | `LIVE_AND_VERIFIED` | `src/renderer/scenes/TechMapScene.ts` | `tests/e2e/techmap.spec.ts` | Procedural graph layout with smooth pan/zoom in Tech Map modal overlay. |
| **Kenney Pixel Assets & Noto Sans Thai** | `LIVE_AND_VERIFIED` | `src/renderer/assets/`, `src/renderer/fonts/` | `tests/i18n/parity.test.ts`, Visual Playwright tests | Licensed Kenney spritesheet & Noto Sans / Noto Sans Thai typography active with key parity. |
| **Mindustry / OpenRA / shapez / Unciv Refs** | `LIVE_AND_VERIFIED` | Design patterns in logistics, territory, and minimal automation | System tests | Used strictly as high-level architectural references for logistics and deterministic state separation. Zero code copied. |
| **Synthetic Player Evaluation** | `LIVE_AND_VERIFIED` | `tests/emergence/distribution.audit.test.ts` (Class B) | Vitest automated suite (48 factorial runs) | 4 autonomous decision policies (BUILD_SEEKER, SURVIVOR, EXPANDER, AGGRESSOR) stepping canonical physics and rules without cheats. |
| **Pathfinding (A* / Navmesh)** | `REJECTED_WITH_RATIONALE` | N/A | N/A | Spatial grid queries and flocking steering are sufficient for current horde density and meet the 60 FPS performance budget. Full A* rejected as premature overhead. |
| **Entity Component System (ECS)** | `REJECTED_WITH_RATIONALE` | N/A | N/A | Flat contiguous object arrays in `RunState` (`enemies`, `projectiles`, `pickups`) are cache-friendly, simpler, and pass all performance benchmarks. |
| **Runtime LLM / Generative Content** | `REJECTED_WITH_RATIONALE` | N/A | N/A | Incompatible with 60 FPS deterministic offline desktop web target and deterministic replay contract. |

---

## 3. Key Findings & Truth-in-Reporting Corrections

1. **Origin Active Ability Cooldowns**:
   - *Previous Report Claim*: 12s / 18s / 20s / 24s.
   - *Authoritative Implementation*: `origins.ts` defines `hunters`: 25s, `engineers`: 25s, `resonant`: 25s, `sentinels`: 30s. The runtime implementation is authoritative and preserved.
2. **Origin JSD & Fallback Contamination**:
   - In v0.25, fallback cards (`fb-*`) were improperly counted under canonical domains (or as `unknown`), artificially inflating measured divergence.
   - In v0.26, fallbacks are cleanly isolated. Mathematical JSD is verified on pure domain offers (Hunters vs Engineers: 0.0152, Hunters vs Resonant: 0.0134, Hunters vs Sentinels: 0.1523) and actual non-fallback picks (Hunters vs Engineers: 0.0393, Hunters vs Resonant: 0.0369, Hunters vs Sentinels: 0.2883).
3. **Autonomous Synthetic Players vs Human Reality**:
   - Synthetic players in v0.25 did not explore or claim outposts (all reported 0 outposts).
   - In v0.26 Class B tests, EXPANDER autonomously navigates chunks and claims territories (54 outposts across 12 runs), while AGGRESSOR exercises abilities (20 uses) and achieves high kills.
   - However, synthetic success remains a **simulation invariant test**, not proof of player enjoyment. Human playtesting is the sole authoritative gate for game feel.
