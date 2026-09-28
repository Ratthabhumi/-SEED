# Procedural Generation (v0.1.1)

## Master seed

User string → NFC normalize → FNV-1a 32-bit. One `RunRngStreams` object per world
(`event`, `enemy`, `draft`, `loot`, `boss`), created ONLY by `initRunRng(worldSeed)`.
Draft selection uses the dedicated `draft` stream — loot consumption can never
move tech cards. Ascension discards every stream and creates fresh ones from the
child seed: no child-world decision depends on prior-world RNG consumption
(regression-tested).

**Stream independence guarantee:** 10,000 loot/event draws do not move draft,
enemy, or boss streams (tested).

## Spatial features (stateless)

Coordinate-bound features use `hash2D(seedU32, x, y, salt)` with `Math.imul`
mixing — no trig, no stream consumption, order-independent.

## World pipeline

```
MASTER SEED → domain-warped fbm fields (elevation/moisture/temperature/anomaly/civ)
→ biome classifier (verdant/arid/tundra/badlands)
→ POI candidates (density ∝ anomaly; origin chunk always empty)
→ ChunkDescriptor {x,y,biome,fields,poi(world-scoped id),civInfluence}
```

Chunks 512u, active radius 2 (5×5 simulated), visual radius 3. Descriptors served
through a bounded nonce-keyed `ChunkCache` (performance-only, identical results).
POI ids are `poi-{worldNonce}-{cx}-{cy}-{i}`; discovery sets are per-world while
run totals accumulate separately.

## Tech DAG

Spine (fixed, guarantees completion) + seeded side branches hanging DIRECTLY off
each age's spine node (wide draft frontier — validated ≥3 generated options per
age across the corpus). Entering an age auto-grants that age's spine node
(design A, documented in GAME_DESIGN.md). Generation is constrained by
construction; `validator.ts` is the test-time contract (acyclic, reachable,
viable). There is NO runtime retry/repair loop — an invalid graph would be a
bug, and the corpus test would catch it.

## Compatibility

Seed identity = `masterSeed + WORLDGEN_VERSION + difficulty`.
- v0.1 → v0.1.1: `WORLDGEN_VERSION` 1 → 2 (NFC normalization changes mapping
  for some non-ASCII seeds; all ASCII `EPOCH-*` seeds generate identical worlds).
- `CONTENT_VERSION` 1 → 2 (wide-frontier branches + spine auto-grant change
  generated graphs for identical seeds).
Displayed seed strings are preserved verbatim for sharing.

## Golden seeds & corpus

`EPOCH-GOLDEN-001`, `EPOCH-GOLDEN-002`, `EPOCH-STRESS-001` pin determinism.
`tests/sim/fuzz.test.ts` additionally validates 300 generated seeds in CI.
