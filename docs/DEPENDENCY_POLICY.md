# Software Dependency Governance Policy
**Project**: -SEED  
**Status**: ENFORCED GATE

---

## 1. Governance Rules
Every external runtime package introduced to -SEED increases security surface area, build maintenance, bundle payload, and architectural fragility.

Therefore:
1. **Prefer Standard Library & Platform Primitives**: Native DOM, CSS Flex/Grid, Canvas API, and standard JS data structures are preferred over external utility libraries (e.g. no Lodash, no Ramda, no Axios).
2. **Prefer Existing Project Dependencies**: Before adding a package, prove that Phaser, Vitest, or TypeScript built-ins cannot solve the problem cleanly.
3. **Core Isolation**: **No third-party runtime package may ever be imported into `src/core/**`.** Simulation logic must run headlessly in pure Node/V8 environments with zero external runtime dependencies.
4. **No Vanity Dependencies**: No dependency may be added simply because "it looks cool," "it is popular on GitHub," or "it saves 5 lines of code."

---

## 2. Mandatory Approval Checklist
Any pull request or proposal adding an npm runtime dependency must record the following 6 fields in `docs/ADR/` or milestone documentation:

1. **Problem Statement**: What concrete engineering bottleneck or user-facing feature cannot reasonably be built in-house?
2. **License**: Is it MIT, BSD-3, Apache-2.0, or CC0? (GPL / AGPL / ambiguous licenses are strictly forbidden).
3. **Exact Pinned Version**: Specific semantic version (no loose `^` or `*` ranges).
4. **Bundle Impact**: What is the minified and gzipped byte cost added to `dist/`?
5. **Layer Classification**: Explicitly classified as Presentation Layer (`src/game/**`) or Build/Dev Tooling.
6. **Removal / Fallback Strategy**: If this package is abandoned or breaks, how easily can it be replaced or degraded without impacting core gameplay?

---

## 3. Approved Runtime Package Ledger (v0.22 Baseline)

### Phaser (`phaser: 4.2.1`)
- *Classification*: Presentation Engine (`src/game/**`)
- *Purpose*: WebGL/Canvas rendering, input dispatch, camera follow, audio playback.
- *Removal Strategy*: Project foundation; presentation adapter wraps all calls.

### Dagre (`@dagrejs/dagre: 3.1.1`)
- *Classification*: Presentation Layout Adapter (`src/game/tech/TechGraphLayout.ts`)
- *Purpose*: Computes deterministic 2D coordinates for procedural Tech DAG trees.
- *Removal Strategy*: Output is plain `{ id, x, y, width, height }`; could be replaced with manual columnar layout if removed.

### Panzoom (`@panzoom/panzoom: 4.6.2`)
- *Classification*: UI Interaction Adapter (`src/game/tech/TechMapModal.ts`)
- *Purpose*: Touch pan, drag, pinch zoom, mouse wheel scaling for DOM overlay.
- *Removal Strategy*: Degrades cleanly to native `overflow: auto` scrollable modal if library fails or is removed.
