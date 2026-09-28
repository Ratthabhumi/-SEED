# Architecture

```
src/
  core/            ← authoritative game logic. MUST NOT import Phaser.
    seed/          hash.ts rng.ts streams.ts versions.ts
    sim/           fixedStep.ts (60 Hz accumulator, XP curve)
    world/         noise.ts biome.ts chunks.ts poi.ts validator.ts
    tech/          graph.ts generator.ts validator.ts synergy.ts
    combat/        weapons.ts (family × tier configs)
    director/      director.ts (threat budget + composition)
    progression/   ages.ts meta.ts
    save/          save.ts (versioned localStorage)
  content/         content.ts (lineages, biomes, civ layers — tuning here)
  game/            Phaser presentation only
    scenes/        TitleScene.ts GameScene.ts
    audio/         sfx.ts (Web Audio synth)
    ui.ts          DOM helpers (Thai-safe text)
  i18n/            en.ts th.ts i18n.ts
  main.ts styles.css
tests/  seed/ world/ tech/ director/ i18n/ save/ balance/
```

## Rules

- Renderer never owns canonical state. GameScene holds run state but all rules,
  generation, and validation functions live in `core/` and are unit-tested without
  booting Phaser.
- Fixed-step 60 Hz simulation with capped catch-up; rendering interpolates nothing
  (positions are authoritative per step; visuals redrawn per frame).
- Balance numbers live in `core/` formulas + `content/` data, never buried in scenes.

## Performance

- Object pools (650 enemies / 1000 projectiles / 400 pickups / 60 mines).
- Spatial hash (128u cells) for projectile/enemy and aura/mine queries.
- Ground redrawn at 4 Hz or on chunk/age change; entities via two Graphics layers.
- Cosmetic VFX degrades first; simulation accuracy never scales with FPS.
