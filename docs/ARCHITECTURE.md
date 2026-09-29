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
    scenes/        TitleScene.ts GameScene.ts VisualLabScene.ts (?visual=1)
    render/        VisualLanguage.ts paths.ts EnemyRenderer.ts PlayerRenderer.ts
                   ProjectileRenderer.ts WorldRenderer.ts NavigationRenderer.ts
                   (canvas drawing; may use Phaser, never owns canonical state)
    audio/         sfx.ts (Web Audio synth)
    ui.ts          DOM helpers (Thai-safe text)
  i18n/            en.ts th.ts i18n.ts
  qa/              qaMode.ts PerformanceSampler.ts PlaytestRecorder.ts
                   PlaytestReport.ts VisualChecks.ts qaPanel.ts (read-only
                   ?qa=1 human-gate harness; observes sim/DOM, never canonical)
  main.ts styles.css
tests/  seed/ world/ tech/ director/ sim/ i18n/ save/ balance/ qa/
e2e/    smoke.spec.ts (Playwright, production build)
       regression.spec.ts + qa.spec.ts (?qa=1 gate flow, read-only)
```

## Simulation boundary

- One `RunSimulation` instance == one run attempt. Restart constructs a NEW
  instance; Phaser Scene reuse can never leak transient state.
- Fixed-step 60 Hz accumulator with capped catch-up. Edge-triggered input
  latches in the adapter (`InputLatch`): a zero-step frame keeps the dash edge;
  the first consumed step takes it exactly once. Draft picks and ascend clicks
  are direct method calls while stepping is paused (no edge-loss class).
- Draft UI is a pure function of canonical state (`syncDraftUI`): exactly one
  surface while `draftOpen`, zero otherwise.
- Documented phase order per step: input → player → spawn → enemy move →
  spatial rebuild → weapons/collisions → mines → pickups → POI → events.
- Weapon execution dispatches on `WeaponStage.archetype` (never family name).
- Boss spawns are transactional (deterministic slot reclaim under saturation).
- `canonicalSnapshot()` covers all gameplay state + RNG snapshots (cosmetics
  excluded); tests compare snapshots directly, `hash()` is debug shorthand.
- Balance numbers live in `core/` formulas + `content/` data, never in scenes.
- `?e2e` query param exposes a test-only hook (grant/kill/readyAscend/hash/
  snapshot/seed/setLang) with zero balance impact; never active in normal play.

## Performance

- Object pools (650 enemies / 1000 projectiles / 400 pickups / 60 mines).
- Spatial hash (128u cells) with reused bucket arrays; no `slice()` in hot loops.
- Bounded `ChunkCache` (world-nonce keyed) for descriptors; ground redrawn only
  on chunk/age/world change while the camera moves every frame.
- Cosmetic VFX degrades first; simulation accuracy never scales with FPS.
- Status: targets defined, p50/p95 instrumentation shipped (F3), hardware
  measurement NOT YET performed — see PERFORMANCE_BUDGET.md.
