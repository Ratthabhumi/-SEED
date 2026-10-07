# -SEED Development Roadmap

## 1. North Star
- **Official Title**: -SEED: เมล็ดพันธุ์แห่งอารยธรรม (-SEED: Seed of Civilization)
- **High-Concept Pitch**: *Every seed is a different history. Take a civilization from stone tools to the stars — in a single run.*
- **Core Loop**: Survivor action combat + macro civilization strategy + deterministic seeded universe + procedural Technology DAG + Ascension prestige replay.

---

## 2. Product Principles
1. **Describable Builds**: Player choices must create a distinct, explainable civilization build (e.g. "Kinetic Ballistics + Industrial Outposts" vs "Field Aura + Research Expansion").
2. **Geography Drives Decisions**: Terrain, POI beacons, and outpost nodes dictate strategic routing and territorial defense.
3. **Visible Evolution**: Visuals, audio, unit silhouettes, and weapons visibly transform across each era.
4. **Seed Determinism is Sacred**: The same seed + input trace must always yield the exact same simulation outcome.
5. **Legible Mastery**: Players learn rules, synergies, and timings that reward deep strategic intuition across runs.
6. **Procedural != Arbitrary**: Procedural generation follows strict affinity graphs and frontier validation, never erratic chaos.
7. **Transparent Causality**: The UI always explains *why* an event, unlock, or penalty occurred.
8. **Bilingual Parity**: Thai and English are equal first-class citizens in typography, layout, and narrative depth.
9. **No Vanity Features**: No feature ships solely because it is technically impressive; it must serve player agency.
10. **Own the Core, Leverage Commodities**: Own -SEED's gameplay identity and deterministic core; leverage mature open-source tooling for presentation commodities.

---

## 3. Engineering Invariants
- **Fixed-Step Simulation**: 60 Hz deterministic physics tick (`SIM_DT = 1/60`), isolated from variable display refresh rates.
- **No Math.random in Canonical Gameplay**: All gameplay RNG flows from seeded pseudo-random streams (`src/core/seed/*`).
- **Purity of `src/core/**`**: Zero DOM, zero Phaser, zero browser APIs in simulation code.
- **Explicit Version Contracts**: `WORLDGEN_VERSION`, `CONTENT_VERSION`, and `SAVE_SCHEMA_VERSION` bumped with migration paths on intentional breaks.
- **Replay Equality**: Headless simulation hash matches browser execution down to the byte.
- **Safe Persistence**: Save files validate against schemas with defensive fallbacks on corruption.
- **Human Validation Gate**: Passing automated tests is necessary, but never sufficient; human playtest evidence gates every release.
- **Git History Integrity**: Zero force-pushes, zero rewriting public branch history.
- **Third-Party Provenance**: Every vendored asset has recorded source, license, checksum, and normalization history.

---

---

## 4. Status Legend
- ✅ **COMPLETE** = implementation + required human gate accepted
- 🟢 **ACTIVE** = current implementation focus
- 🟡 **VALIDATION** = implementation finished; evidence/human validation pending
- 🟠 **CORRECTIVE** = human/evidence found blockers that require correction
- 🔴 **BLOCKED** = cannot proceed because of a hard dependency/defect
- 🔵 **RESEARCH READY** = researched/approved but intentionally not implemented
- ⚪ **PLANNED** = scheduled but not started
- ⏸ **DEFERRED** = deliberately postponed pending evidence

---

## 5. Current Development Dashboard
- **v0.1 Vertical Slice**: ✅ COMPLETE
- **v0.1.1 Stabilization / Readability**: ✅ COMPLETE
- **v0.2 Engagement Loop**: ✅ HISTORICAL TECHNICAL FOUNDATION
- **v0.21 Civilization Command Loop**: 🟠 CORRECTIVE
  - *Reason*: Systems exist but macro purpose remains unclear in human play.
- **v0.22 Open-Source Leverage**: ✅ TECHNICAL FOUNDATION
  - 🟠 HUMAN INTEGRATION STILL EVOLVING
- **v0.22.1 First-Run Clarity**: ✅ TECHNICAL GATE (exact-SHA CI green)
  - 🟠 HUMAN UX CORRECTIVE (HUD overlap, UI-scale breakage, territory purpose, Tech Map overflow, Space FPS)
- **v0.23 Frontier Purpose & Late-Game Performance**: 🟠 TECHNICAL BASELINE PASSED (exact-SHA CI green at `e32e995`, run 36875936223)
  - 🟠 HUMAN UX CORRECTIVE (objectives, Tech agency, territory purpose, UI overlap — corrected in v0.23.1)
  - Logical baseline for v0.23.1: `e32e995`
- **v0.24 Emergent Technical Foundation**: 🟡 TECHNICAL BASELINE FREEZE (technical stabilization, CI repair, debug clean, frozen as baseline for v0.25)
- **v0.25 Player-Visible Emergence**: 🟢 ACTIVE VALIDATION TARGET (decouple offer quality from selection, remove age rarity clamping, make Origin identity legible, derive meaningful World Traits, experience audit)
- **Game Feel & Audio**: ⏸ DEFERRED — returns only after emergence passes human gate
- **v0.3+**: ⚪ PLANNED

---

## 6. Open-Source & Research Leverage Ledger
- ✅ **IMPLEMENTED**:
  - `@dagrejs/dagre` (3.1.1, MIT) — Tech DAG hierarchical layout in presentation layer
  - `@panzoom/panzoom` (4.6.2, MIT) — Tech Map pan/zoom canvas interaction
  - Kenney Sci-Fi RTS (CC0) — Outpost structures (Research, Military, Economic)
  - Kenney Input Prompts (CC0) — Keyboard glyphs (Q/E/R/F/T/M)
  - Kenney Board Game Icons (CC0) — UI category emblems
  - Kenney UI Pack - Sci-Fi (CC0) — Window frames & bevels
  - Approved agent skills (`.agents/skills/`) — Curated implementation references
  - Progressive disclosure (v0.23.1) — Q/E/R/F/T/M/C surfaced only when relevant
  - Contextual tutorial + surface coordination (v0.23.1) — one context-stack lane, exactly-one BLOCKING
  - Progressive Tech DAG (v0.23.1) — deterministic spine→foundation→specialization mini-paths
  - Outpost Capacity per Age (v0.23.1) — Stone 1 … Space 6, mission-signal exemption
  - Knowledge-cost Outpost upgrade (v0.23.1) — ≈9% of next Age threshold
- 🟠 **IMPLEMENTED / HUMAN VALIDATION PENDING**:
  - Kenney Particle Pack (CC0) — Corrective ADD/SCREEN blend handling; human validation of VFX readability still pending.
- 📖 **DESIGN REFERENCES ONLY (never code sources)**:
  - Mindustry, The Riftbreaker, OpenRA, shapez, Unciv (design references for territory/expansion/defense; GPL sources never copied)
  - World of ClaudeCraft, awesome-ai-game, awesome-ai-built-games, AI Game Central, itch AI-game catalog (landscape awareness only).
- 🔵 **APPROVED / NOT CURRENTLY USED**:
  - Kenney Game Icons 1.0 (CC0) — approved small-subset use only; not needed yet.
  - Kenney Game Icons Expansion 1.0 (CC0) — approved small-subset use only; not needed yet.
- 🔵 **RESEARCH READY / NOT USED**:
  - ZzFX — Procedural audio candidate (v0.24 sound language gate).
- ⏸ **DEFERRED / EVIDENCE-GATED (do not add now)**:
  - EasyStar.js / navmesh — Routing only if unit obstacle navigation proves deficient in gameplay evidence.
  - `simplex-noise` — Terrain variation requiring deliberate `WORLDGEN_VERSION` review.
  - Miniplex ECS migration — Custom pooled simulation already outperforms budget.
  - RexUI migration — Vanilla DOM modals offer cleaner control and lower overhead.
  - Runtime LLM systems — Conflicts with deterministic offline simulation and latency targets.
  - SpriteGPULayer — No evidence of a sprite-batch bottleneck justifying it.

---

## 7. Release Train

### v0.22 — Open-Source Leverage Foundation
- **Status**: 🟠 CORRECTIVE (Technical foundation passed; human UX revalidation discovered P1 clarity, scaling, VFX blending, and QA evidence defects)
- **Deliverables**:
  - ✅ Dagre 3.1.1 integration for procedural Tech DAG layout
  - ✅ Panzoom 4.6.2 integration for Tech Map navigation
  - ✅ CC0 asset provenance, manifests, and automated verification (`npm run verify:third-party`)
  - ✅ Kenney input prompts (Q/E/R/F/T/M) & Outpost foundation assets
  - ✅ UI category icons (Kenney Board Game Icons)
  - 🟠 Kenney VFX presentation (particle pack solid black background blend defect)
  - 🟠 Integrated HUD readability (font sizes 11–14px too small)
  - 🟠 Human first-run clarity (unclear objectives, mechanics, age progression)

### v0.22.1 — First-Run Clarity & Presentation Corrective
- **Status**: ✅ TECHNICAL GATE (exact-SHA CI green) / 🟠 HUMAN UX CORRECTIVE
  (superseded into v0.23 corrective work; branch frozen)
- **Deliverables**:
  - ✅ UI typography scale (Xbox Accessibility target: >= 18px core text)
  - ✅ Tutorial foundation & contextual guidance
  - ✅ VFX blend correction (ADD policy)
  - 🟠 Adaptive UI scaling (breaks/overflows at 150–200%)
  - 🟠 HUD overlap (permanent cards collide)
  - 🟠 Tech Map high-scale layout (node overflow, sidebar squeeze)
  - 🔴 Exact-SHA full CI (was red at 4a2c7db; repaired at f2cd458, run 36815319757 green)

### v0.23 — Frontier Purpose & Late-Game Performance
- **Status**: 🟠 TECHNICAL BASELINE PASSED (exact-SHA CI green at `e32e995`, run 36875936223) / 🟠 HUMAN UX CORRECTIVE (superseded by v0.23.1; branch frozen, do not modify)
- **Scope** (delivered as built; UX corrective moved to v0.23.1):
  - 🟢 Strategic Site UX (UNSEEN → CLAIMED states, [C] claim action)
  - 🟢 Multi-Outpost Frontier (multiple sites, exact spec benefits)
  - 🟢 Dominion age gate (replaces abstract stabilization timer)
  - 🟢 Civ Map frontier graph (derived links, stronghold reveal)
  - 🟢 Stronghold endgame → boss as consequence of control
  - 🟢 Adaptive HUD dock + scale-aware Tech Map (reflow, not font multiply)
  - 🟢 Space performance profiling + deterministic spatial nearest
  - 🟡 Human validation (EPOCH-AET4-3SFC)

### v0.24 — Emergent Seed Core (Emergence Prototype)
- **Status**: 🟡 PLAYABLE PROTOTYPE (implementation + automated gates green, human audit pending)
- **Entry Gate**: v0.23.1 technical baseline frozen at `cf9c0ce`
- **Scope**:
  - **World Laws** — deterministic universe rules from masterSeed (domain bias, combat bias, world axes: aggression/scarcity/anomaly/volatility/territoriality). Universe-level: same masterSeed across Ascension = same World Laws.
  - **Offer Engine** — Gumbel-Top-k (K=3) selection with quality sampling (COMMON/UNCOMMON/RARE/MYTHIC), anti-pattern penalties, early mythic floor / late common floor. `DraftOffer` type (nodeId, quality, modifierIds, effectiveEffects) replaces raw `TechNode[]`.
  - **Origins Runtime** — 4 distinct identities (Hunters: Marked Prey/Trophy, Engineers: Fabrication, Resonant: Harmonic Charge, Sentinels: Bastion Network). Config derived from `getOriginRuleset(originId)`, mutable mechanic state in `originMechanic`.
  - **Logistics & Garrison** — explicit Logistics points replace opaque capacity. Costs: Research=1, Military=2, Economy=1 per tier (tier 2 ×1.5). Signal first-claim exemption preserved. Garrison: 1 mobile slot cost, spec-specific benefits.
  - **Distribution Audit** — `tests/emergence/distribution.audit.test.ts` + `npm run analyze:v024` (10k deterministic seeds). Metrics: quality dist, early mythic rate, late common rate, fallback offer rate, reroll alt availability, same-card repetition, longest low-quality streak, offer collision rate, origin JSD, world laws determinism, logistics growth.
- **Deferred to v0.24 R2**:
  - Enemy Ecology — 8+ archetypes (chassis×attack×mobility×modifier×role), compatibility rules, spawn path integration
  - Director — seeded stream, RELAX/BUILD/PEAK/RECOVER phases, pressure logic, encounter composition
  - Events — procedural templates
  - FATE / Lock / Reroll / Choose — player-facing draft agency
  - World Law player reveal — readable clues through observation
- **Deliverables**:
  - ✅ World Laws generation (deterministic, universe-level)
  - ✅ Offer Engine with Gumbel-Top-k, quality, modifiers, anti-patterns
  - ✅ Origins runtime (4 distinct mechanical identities)
  - ✅ Logistics & Garrison (explicit points, Signal exemption, slot cost)
  - ✅ DraftOffer type (quality, modifiers, effectiveEffects)
  - ✅ Distribution audit test + 10k seed corpus
  - ✅ Typecheck + unit (343) + build + check + analyze:v024 all PASS
  - 🟡 Human audit pending

### Game Feel & Audio (old v0.24 scope): ⏸ DEFERRED
- Returns only after the new core passes its human gate.
- Combat impact (hit stop, directional knockback feel, projectile trails).
- Coherent SFX language across ages (Stone percussion → Bronze resonance → Industrial steam → Atomic hum → Space pulse).
- Civilization command audio cues (squad rally, focus confirmation, ability discharge).
- Boss telegraph audio and territory alarm sirens.
- Safe evaluation of procedural audio (ZzFX pre-generation or isolated cosmetic audio streams).
- Motion accessibility toggles (screen shake dampening, flash suppression).

### v0.3 — World Identity & Strategic Geography
- **Scope**:
  - Procedural region landmarks, megastructures, and distinct geological biomes.
  - Strategic territory effects (e.g. chokepoint defense bonuses, resource abundance zones).
  - World Tree / Megasite discovery objectives.
  - Fog of war and macroscopic strategic scouting.
  - Deliberate review and potential bump of `WORLDGEN_VERSION`.

### v0.4 — Civilization Depth
- **Scope**:
  - Civilization doctrines and cultural policies chosen at Age transitions.
  - Specialized squad commanders and automated defense outposts.
  - Macro-economic supply lines and trade caravans between claimed nodes.
  - Dark Age / Extinction events triggered by failure to repel coordinated raids.

### v0.5 — Deep Ascension / Galactic Network
- **Scope**:
  - Planetary constellation network across Ascensions.
  - Permanent civilization legacies that alter child-world generation.
  - Species/construct visual mutations based on historical run achievements.
  - Chronicle archives comparing epoch histories across thousands of in-game years.

### v0.6 — Content Expansion
- **Entry Gate**: Proven retention and positive human playtest telemetry on core loop.
- **Scope**:
  - 4 new enemy archetypes, 2 new world bosses.
  - 40+ additional Tech DAG nodes and 12 Breakthrough synergies.
  - Challenge seeds and authored anomaly encounters.

### v0.7 — Mastery & Analytical Replay
- **Scope**:
  - Build-history telemetry visualizer.
  - Ghost runs / pacing benchmark comparisons for speed and mastery.
  - In-game civilizational museum / codex.

### v0.8 — Platform & Accessibility
- **Scope**:
  - Gamepad / Steam Deck controller navigation.
  - Dynamic UI scaling for varied aspect ratios and mobile viewports.
  - Color-blind palette modes and full keyboard-only rebinding.

### v0.9 — Release Candidate
- **Scope**:
  - Complete feature, balance, and content freeze.
  - Full performance regression audit on low-spec hardware (i5-10210U baseline).
  - Comprehensive Thai/English localization proofing by native speakers.
  - Packaging and release validation for itch.io and web distribution.

### v1.0 — Polished Commercial Launch
- **Scope**:
  - Zero P0/P1 defects.
  - Verified save migration stability.
  - Complete legal, attribution, and third-party compliance ledger.

---

## 8. Human Evidence Gates
Every milestone enforces three sequential acceptance gates:
1. **Technical Gate**: `npm run check` (typecheck + unit tests + production build) + Playwright E2E green.
2. **Visual Gate**: Visual Lab audit across normal, grayscale, high-contrast, English, and Thai.
3. **Human Playtest Gate**: Hands-on playtest by the auditor/operator confirming subjective engagement, pacing, and clarity. Automated tests verify code; humans verify fun.

---

## 9. Open-Source Leverage Gates
An external library or asset pack is admitted if and only if:
1. It solves an identified, concrete engineering bottleneck.
2. Its license is permissive (MIT, BSD, Apache 2.0, CC0) with zero viral/GPL copyleft risk.
3. Provenance is recorded in `assets/ASSET_MANIFEST.json` and `docs/THIRD_PARTY_LICENSES.md`.
4. It does NOT invade or contaminate `src/core/**`.
5. It degrades gracefully if the library fails or is removed.
6. The bundle byte payload is justified.
7. Maintaining the third-party component is strictly lower effort than writing and testing an in-house version.

---

## 10. Deferred / Not Currently Justified Systems
Features and systems are classified as **DEFERRED / NOT CURRENTLY JUSTIFIED** rather than permanently forbidden. They may be reconsidered when:
- Direct human evidence demonstrates an undeniable gameplay or accessibility need
- Clean architecture accommodates the feature without compromising boundaries
- An Architecture Decision Record (ADR) documents the engineering tradeoffs
- The return on investment (ROI) justifies the complexity

We do not treat genre definitions as dogma. The project evolves as evidence points to a superior player experience. What remains sacred:
- Deterministic simulation contract where promised
- Data, version, and telemetry honesty
- Player agency and causal transparency
- Readability, accessibility, and Thai/English parity
- Source and license provenance
- Rigorous evidence over assumption

Currently deferred systems:
- Multiplayer, PvP, or client-server netcode (massive scope inflation)
- Online leaderboards and cloud backends (maintenance overhead)
- Runtime LLM / Generative AI NPC dialogue (slow, non-deterministic, cost-heavy)
- Microtransactions, monetization SDKs, or analytics trackers (unethical/hostile to player trust)
- Full real-time worker-placement city simulation (distracts from survivor/macro hybrid loop)
- Inventory Tetris or complex item crafting grids (adds micro-fiddling without tactical depth)
- Engine migration away from Phaser (no ROI, current tech stack is robust)

---

## 11. Definition of Done (Per Milestone)
A milestone is declared complete when:
- All planned deliverables are implemented with zero architectural leakage.
- Unit test suite (`npm test`) passes with 100% green coverage on new subsystems.
- Production build (`npm run build`) bundles without warnings or bundle-budget breaches.
- E2E tests (`npm run test:e2e`) pass headlessly.
- Third-party license verification (`npm run verify:third-party`) succeeds.
- Exact-SHA CI passes on GitHub Actions (Node 22, Node 24, Chromium E2E).
- Documentation, Art Bible, and Session Handoff are updated and committed.
- Known rollback tag/SHA is recorded.

---

## 12. Architectural References & Decision Log
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): System boundaries, simulation engine, and rendering adapters.
- [docs/VERIFICATION_MATRIX.md](docs/VERIFICATION_MATRIX.md): Testing tiers and verification workflows.
- [docs/OPEN_SOURCE_LEVERAGE.md](docs/OPEN_SOURCE_LEVERAGE.md): Category A/B/C/D evaluation ledger.
- [docs/ART_BIBLE.md](docs/ART_BIBLE.md): Visual thesis, silhouette tiers, color tokens, and normalization rules.
- [docs/DEPENDENCY_POLICY.md](docs/DEPENDENCY_POLICY.md): External package checklist and invariants.
- [docs/THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md): Legal ledger and full license notices.
- [assets/ASSET_MANIFEST.json](assets/ASSET_MANIFEST.json): Machine-readable asset index.
- [SESSION_HANDOFF.md](SESSION_HANDOFF.md): Workstream continuity and session state.
