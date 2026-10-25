# -SEED Open-Source Leverage & Technology Policy
**Version**: 0.22  
**Status**: ACTIVE GOVERNANCE  
**Authority**: External Auditor / Project Policy

---

## 1. Core Philosophy
> *"Leverage commodity technology; own the game's identity and deterministic core."*

Building complex games as an indie team requires extreme engineering discipline. We refuse to reinvent solved commodity problems (e.g. directed graph layout algorithms, pan/zoom gesture physics, basic controller button glyphs). However, we also refuse to surrender -SEED's unique identity, deterministic replayability, or architectural purity to heavy third-party frameworks.

To govern every external component, we enforce four explicit categories:

---

## 2. Category A — ADOPT (Commodity Libraries)
**Definition**: Small, mature, battle-tested commodity libraries with zero domain knowledge that solve purely algorithmic or presentation problems outside the simulation core.

### Current Approved:
1. **`@dagrejs/dagre` (v3.1.1, MIT)**:
   - *Problem Solved*: Deterministic hierarchical layout computation for the procedural Technology Directed Acyclic Graph (DAG).
   - *Boundary*: Presentation layer only (`src/game/tech/TechGraphLayout.ts`).
   - *Isolation*: It never enters `src/core/**`. It never mutates canonical `TechNode` objects. It is never hashed in `stateHash`.
2. **`@panzoom/panzoom` (v4.6.2, MIT)**:
   - *Problem Solved*: Mobile/desktop touch, drag, wheel zoom, and pinch transformation on DOM/SVG viewports.
   - *Boundary*: Presentation UI container only (`src/game/tech/TechMapModal.ts`).
   - *Isolation*: Destroyed on modal close; zero persistent listeners; fallback to native CSS scrolling if initialization fails.

---

## 3. Category B — ADAPT (Source Material & CC0 Assets)
**Definition**: High-quality open assets used strictly as raw material. They must undergo normalization (rescaling, palette matching, contrast calibration, anchor alignment) so the final game exhibits a singular, authored art direction.

### Current Approved:
- **Kenney CC0 Asset Packs**:
  - *Input Prompts* (Q, E, R, F, T, M keyboard & controller glyphs)
  - *Sci-Fi RTS* (Civilization Outpost structures: Research, Military, Economic)
  - *UI Pack - Sci-Fi* (Modal frames, sliced chrome bars, button bevels)
  - *Particle Pack* (Combat impact, claim pulse, breakthrough sparks, raid alarms)
  - *Board Game Icons* (Domain emblems for Research, Defense, Economy)
- *Rules*:
  - No "asset-flip" look. Every asset must satisfy [docs/ART_BIBLE.md](ART_BIBLE.md).
  - Only selected assets are bundled into `dist/`. No bulk imports of 1500 unused textures.
  - Manifested in `assets/ASSET_MANIFEST.json`.


---

## 4. Category C — STUDY ONLY (Architecture References)
**Definition**: Successful open-source games whose macro design, UI readability, or structural patterns provide valuable inspiration.

### Current Approved References:
- **Mindustry**: Wave pacing, macro territory threat, schematic readability.
- **OpenRA**: Command response feedback, fog-of-war clarity, RTS squad selection discipline.
- **shapez**: Tech tree progression readability, minimalist geometric visual hierarchy.
- **Unciv**: Clean, lightweight 4X empire state presentation.
- **World of ClaudeCraft**: Autonomous agent verification and headless simulation loops.

### Strict Legal & Engineering Rules:
- **NO GPL CODE COPYING**. Many of these games are licensed under GPL/AGPL.
- We **NEVER** copy source code, class hierarchies, data tables, or asset files from Category C projects.
- We study conceptual mechanics (e.g. "how to make territory pressure readable on a minimap"), not lines of code.

---

## 5. Category D — DEFER / REJECT
**Definition**: Technologies evaluated and deliberately deferred or permanently rejected to protect project velocity, determinism, or architecture.

| Candidate | Status | Rationale for Deferral / Rejection |
| :--- | :--- | :--- |
| **ZzFX** | **DEFERRED (v0.23)** | Procedural audio is appealing, but audio needs its own coherent aesthetic language and sound design pass. Deferred to milestone v0.23 (Game Feel & Audio) where it can be evaluated safely with pre-rendered WAVs or isolated cosmetic RNG. |
| **EasyStar.js / Navmesh** | **DEFERRED** | Squads and raid mobs currently operate in open terrain. We do not add pathfinding overhead until there is concrete gameplay evidence of units visibly failing to navigate around complex obstacles. |
| **Miniplex / ECS** | **DEFERRED** | Our custom pooled simulation (`src/core/sim/RunSimulation.ts`) already handles 650+ entities comfortably within the 2ms sim budget. Adding an ECS framework introduces cognitive overhead without solving a bottleneck. |
| **Full RexUI Plugin Suite**| **REJECTED** | Too heavy; introduces Phaser 3 legacy baggage and deep coupling with DOM/Canvas internals. We prefer lightweight vanilla CSS modals with modern flexbox/grid. |
| **React / React Flow** | **REJECTED** | Heavy runtime virtual DOM overhead is unacceptable in an action survivor roguelite loop. Native DOM + Panzoom + Dagre delivers higher performance with zero React runtime weight. |
| **Runtime LLM / AI NPCs** | **REJECTED** | Non-deterministic, slow latency, API dependency, high token cost. -SEED is a precision deterministic roguelite. |
| **Game-icons.net (CC-BY)** | **DEFERRED** | Requires attribution clauses on individual icons; Kenney CC0 provides cleaner license posture with no risk of attribution omission. |
