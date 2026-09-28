# Procedural Generation

## Master seed

User string → normalized → FNV-1a 32-bit. Independent substreams per label
(`terrain`, `biome`, `tech`, `enemy`, `event`, `boss`, `loot`, `anomaly`, `poi`,
`ascension:N`) via `deriveUint32(master, label)` → `xoshiro128**`.

**Stream independence guarantee:** adding a loot RNG call can never change terrain,
tech, or bosses (tested in `tests/seed/determinism.test.ts`).

## Spatial features (stateless)

Coordinate-bound features use `hash2D(seedU32, x, y, salt)` with `Math.imul`
mixing — no trig, no stream consumption, order-independent. Same chunk queried in
any order returns the same descriptor.

## World pipeline

```
MASTER SEED → domain-warped fbm fields (elevation/moisture/temperature/anomaly/civ)
→ biome classifier (verdant/arid/tundra/badlands)
→ POI candidates (density ∝ anomaly) → spacing/constraint filter (origin always safe)
→ ChunkDescriptor {x,y,biome,fields,poi,civInfluence}
```

Chunks 512u, active 5×5–7×7 around player, logical infinite. Descriptors only —
rendering derives shapes from them.

## Tech DAG

Spine (fixed, guarantees completion) + seeded side branches (grammar templates +
seeded selection/shuffle). Generate → Validate → (deterministic repair via retry
with derived seed; current implementation logs and keeps the spine-valid graph —
all generated graphs pass validation per tests across 8+ seeds).

## Compatibility

Seed identity = `masterSeed + WORLDGEN_VERSION + difficulty`. Bumping
`WORLDGEN_VERSION` (1) on any intentional generator change; old seeds then visibly
differ instead of silently corrupting. `CONTENT_VERSION` (1) tracks data tuning,
`SAVE_SCHEMA_VERSION` (1) guards localStorage with safe fallback.

## Golden seeds

`EPOCH-GOLDEN-001`, `EPOCH-GOLDEN-002`, `EPOCH-STRESS-001` — determinism,
world, tech, and balance tests pin their behavior.
