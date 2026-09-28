# Architecture (v0.1.1)

```
src/
  core/            ← authoritative game logic. MUST NOT import Phaser, DOM,
                     storage, audio, or browser globals (AGENTS.md).
    seed/          hash.ts rng.ts streams.ts runRng.ts versions.ts
    sim/           RunSimulation.ts RunState.ts RunConfig.ts InputFrame.ts
                   SimEvent.ts stateHash.ts chunkCache.ts
                   fixedStep.ts (60 Hz accumulator, XP curve)
                   progression.ts (canonical gainKnowledge + applyTechEffect)
    world/         noise.ts biome.ts chunks.ts poi.ts validator.ts
    tech/          graph.ts generator.ts validator.ts synergy.ts
    combat/        weapons.ts (family × tier configs)
    director/      director.ts (threat budget + era weights + affix defs)
    progression/   ages.ts meta.ts
    save/          save.ts (versioned localStorage, runtime-validated)
  content/         content.ts (lineages, biomes, civ layers — tuning here)
  game/            Phaser presentation + DOM UI (adapter only)
    scenes/        TitleScene.ts GameScene.ts
    audio/         sfx.ts (Web Audio synth)
    ui.ts          DOM helpers (Thai-safe text)
  i18n/            en.ts th.ts i18n.ts
  main.ts styles.css
tests/  seed/ world/ tech/ director/ sim/ i18n/ save/ balance/
e2e/    smoke.spec.ts (Playwright, production build)
```

## Simulation boundary

- One `RunSimulation` instance == one run attempt. Restart constructs a NEW
  instance; Phaser Scene reuse can never leak transient state.
- Fixed-step 60 Hz accumulator with capped catch-up; the adapter samples the
  keyboard into `InputFrame{moveX,moveY,dashPressed}` per step.
- Documented phase order per step: input → player → spawn → enemy move →
  spatial rebuild → weapons/collisions → mines → pickups → POI → events.
- `stateHash()` covers gameplay state only (never spatial indices, scratch
  buffers, or render-only data) — the deterministic replay contract.
- Balance numbers live in `core/` formulas + `content/` data, never in scenes.

## Performance

- Object pools (650 enemies / 1000 projectiles / 400 pickups / 60 mines).
- Spatial hash (128u cells) with reused bucket arrays; no `slice()` in hot loops.
- Bounded `ChunkCache` (world-nonce keyed) for descriptors; ground redrawn only
  on chunk/age/world change while the camera moves every frame.
- Cosmetic VFX degrades first; simulation accuracy never scales with FPS.
- Status: targets defined, p50/p95 instrumentation shipped (F3), hardware
  measurement NOT YET performed — see PERFORMANCE_BUDGET.md.
