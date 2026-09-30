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

## 4. Current Verified Baseline
- **v0.1 Vertical Slice**: Stone Age survivor vertical slice, basic tech drafting, golden seed harness — `VERIFIED`.
- **v0.1.1 Stabilization & Readability**: Entity pooling (650 enemies, 600 proj), visual lab, Thai typography rules (`line-height >= 1.7`) — `VERIFIED`.
- **v0.2 Engagement Loop**: Stone → Space progression, Origins, Legacies, Ascension child-world reset, zero-friction playtest automation sink — `VERIFIED`.
- **v0.21 Civilization Command Loop**: Squad commands (Rally/Focus/Hold), active abilities, Outpost expansion (Research/Military/Economic), territory control, raid threats, minimap/civ map, build history — `AUTOMATED VERIFIED — HUMAN REVALIDATION EVIDENCE CAPTURED — AUDITOR VERDICT PENDING`.

---

## 5. Release Train

### v0.22 — Open-Source Leverage Foundation
- **Status**: `AUTOMATED VERIFIED — HUMAN REVALIDATION EVIDENCE CAPTURED — AUDITOR VERDICT PENDING`
- **Goal**: Stop rebuilding commodity tooling/assets; integrate proven open-source components for presentation while hardening governance.
- **Key Deliverables**:
  - Dagre-powered procedural Tech DAG presentation layout (`@dagrejs/dagre: 3.1.1`).
  - Panzoom touch/mouse navigation for the Tech Map (`@panzoom/panzoom: 4.6.2`).
  - Third-party CC0 visual foundation (Kenney Input Prompts, Sci-Fi RTS outposts, UI Pack chrome, Particle Pack VFX, Board Game Icons).
  - Project-local agent skills (`.agents/skills/`) for curated implementation cheatsheets.
  - Formal asset manifest (`assets/ASSET_MANIFEST.json`) & automated license verification (`scripts/verify-third-party.mjs`).
  - Canonical Art Bible (`docs/ART_BIBLE.md`) & Dependency Policy (`docs/DEPENDENCY_POLICY.md`).
- **Exit Gate**: CI green, third-party verify script passes, bundle budget verified, human Tech Map usability audit.

### v0.23 — Game Feel & Audio
- **Entry Gate**: v0.22 successfully audited and merged.
- **Scope**:
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

## 6. Human Evidence Gates
Every milestone enforces three sequential acceptance gates:
1. **Technical Gate**: `npm run check` (typecheck + unit tests + production build) + Playwright E2E green.
2. **Visual Gate**: Visual Lab audit across normal, grayscale, high-contrast, English, and Thai.
3. **Human Playtest Gate**: Hands-on playtest by the auditor/operator confirming subjective engagement, pacing, and clarity. Automated tests verify code; humans verify fun.

---

## 7. Open-Source Leverage Gates
An external library or asset pack is admitted if and only if:
1. It solves an identified, concrete engineering bottleneck.
2. Its license is permissive (MIT, BSD, Apache 2.0, CC0) with zero viral/GPL copyleft risk.
3. Provenance is recorded in `assets/ASSET_MANIFEST.json` and `docs/THIRD_PARTY_LICENSES.md`.
4. It does NOT invade or contaminate `src/core/**`.
5. It degrades gracefully if the library fails or is removed.
6. The bundle byte payload is justified.
7. Maintaining the third-party component is strictly lower effort than writing and testing an in-house version.

---

## 8. Explicitly Deferred / Out of Scope
The following concepts are strictly prohibited during the v0.x lifecycle:
- Multiplayer, PvP, or client-server netcode.
- Online leaderboards and cloud backends.
- Runtime LLM / Generative AI NPC dialogue.
- Microtransactions, monetization SDKs, or analytics trackers.
- Full real-time worker-placement city simulation (e.g. SimCity/Banished).
- Inventory Tetris or complex item crafting grids.
- Engine migration away from Phaser.

---

## 9. Definition of Done (Per Milestone)
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

## 10. Architectural References & Decision Log
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): System boundaries, simulation engine, and rendering adapters.
- [docs/OPEN_SOURCE_LEVERAGE.md](docs/OPEN_SOURCE_LEVERAGE.md): Category A/B/C/D evaluation ledger.
- [docs/ART_BIBLE.md](docs/ART_BIBLE.md): Visual thesis, silhouette tiers, color tokens, and normalization rules.
- [docs/DEPENDENCY_POLICY.md](docs/DEPENDENCY_POLICY.md): External package checklist and invariants.
- [docs/THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md): Legal ledger and full license notices.
- [assets/ASSET_MANIFEST.json](assets/ASSET_MANIFEST.json): Machine-readable asset index.
- [SESSION_HANDOFF.md](SESSION_HANDOFF.md): Workstream continuity and session state.
