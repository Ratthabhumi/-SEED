# Visual Language — -SEED v0.1.1 Readability Pass

Binding spec for presentation. Gameplay numbers live in `core/` + `content/`;
this document owns **how things look**, never what they do. Visual changes must
not bump `WORLDGEN_VERSION`, `CONTENT_VERSION`, or `SAVE_SCHEMA_VERSION`.

Evidence: Human Gate A `FAIL_BLOCKING_READABILITY` (EPOCH-GOLDEN-001, 10:15,
Space, 0 bosses, 0 ascensions; feedback affirmed everything except stutter).
"ยากเกิน + ง่ายเกิน" together = `PERCEIVED_DIFFICULTY_INCONSISTENT`, not a
balance verdict. Fix readability first, re-run, then judge numbers.

## Hierarchy (paint order + salience)

1. **PLAYER** — always the primary focal point.
2. **IMMEDIATE HOSTILE THREATS** — enemy bodies, enemy attacks, danger zones, boss.
3. **PLAYER ATTACKS / BUILD FEEDBACK** — projectiles, beam, aura edge, orbit, summons, mines.
4. **KNOWLEDGE / REWARDS / INTERACTABLE POIs** — pickups, undiscovered-POI beacons.
5. **NAVIGATION / LANDMARKS** — compass, beacons, objective readout.
6. **ENVIRONMENT / DECORATION** — ground, biome washes, civ decoration. Must
   never compete with 1–4. Background = low-frequency large shapes; gameplay =
   high-contrast sharp silhouettes. No decoration may resemble a projectile,
   pickup, enemy, mine, or POI.

## Rules (never color-alone)

- Every gameplay-critical distinction uses **shape + outline + fill**, with
  color as reinforcement only.
- Friendly vs hostile is a geometry channel: player-side = round/soft cores
  with light outlines; hostile = angular/sharp with dark outlines.
- Family identity is stable across ages (ages change internal marks/accents
  only, never the base silhouette).

## Shape tokens

| Token | Geometry | Meaning |
|---|---|---|
| `player-core` | bright disc + dark outline + directional chevron | the player |
| `chaser` | forward triangle (points along velocity) | chaser family |
| `ranged` | diamond/kite + aim tick before firing | ranged family |
| `tank` | square, heavy double outline, largest mass | tank family |
| `swarm` | tiny paired-dot, smallest | swarm family |
| `elite-ring` | gold/white outer ring layered over family shape | elite |
| `affix-swift` | speed chevrons | swift elite |
| `affix-armored` | square brackets / double plate | armored elite |
| `affix-volatile` | hazard spokes, pulses before detonation | volatile elite |
| `affix-splitter` | two-lobe mark | splitter elite |
| `affix-shielded` | cyan shield ring | shielded elite |
| `boss` | large hex + crown spikes + red/white outline (never a big tank) | boss |
| `proj-friendly` | capsule/circle, light core + light outline | player projectile |
| `proj-hostile` | sharp diamond, dark outline | enemy projectile |
| `knowledge` | shard/diamond, teal glow core | progression currency |
| `mine` | ground device: base plate + blinking core | player mine |
| `poi-beacon` | vertical light pillar + floating icon diamond | undiscovered POI |
| `poi-done` | dim small ring | discovered POI |
| `danger-radius` | dashed red ring, drawn pre-event | telegraph zone |
| `beam` | origin→target bar with bright core | beam attack |
| `aura` | thin area edge, translucent | aura archetype |
| `orbit` | tether line to player + blade dots | orbit blades |
| `summon` | round ally with cyan outline + tether | allied summon |

## Conventions

- **Outlines:** player 3px dark; hostiles 2px dark; elites +gold ring; boss
  4px red/white. Outlines scale readability, never removed for style.
- **Hit feedback:** white flash 80ms on any enemy hit; red edge pulse + knock
  tick on player hurt; death = expanding ring + fade (no particle spam).
- **Telegraphs:** ranged pre-fire aim tick ~0.35s; volatile pre-explosion
  dashed radius; boss wind-up scale pulse. Telegraphs are presentation-only
  reads of existing sim timers (e.g. `shootT`), never new mechanics.
- **Environment:** biome ground washes stay, but tiny gameplay-sized dots go:
  decoration uses large soft patches at ≤40% of entity contrast. Civ layer
  density kept, marks enlarged and dimmed.
- **POI beacons:** visible from ≥1.5 chunks; pillar + icon + localized name on
  approach; discovered POIs collapse to dim rings.
- **Navigation:** on-screen compass strip (nearest undiscovered POI + boss when
  active), world-space beacon pillars, off-screen edge indicators for boss and
  critical threats. No minimap in this pass. No invisible walls — infinite
  world + finite attention.
- **HUD priority:** PRIMARY = HP, age, next objective; SECONDARY = level,
  knowledge, timer; TERTIARY = seed/debug. Objective line answers "what am I
  waiting for: kills / knowledge / time?" at a glance.
- **Onboarding:** one-line contextual hints (move → auto-attack → knowledge →
  draft → gated-age explanation → POI beacon), auto-dismiss, EN+TH, no obstruction.
- **Thai:** all player-facing strings via i18n keys (parity test enforced);
  line-height ≥1.7; no vertical clipping of tone marks; buttons/cards wrap and
  expand instead of shrinking text.
- **Contrast:** gameplay-critical text/UI targets ≥4.5:1; entities carry dark
  outlines so identity never depends on background luminance. Optional
  High-contrast setting raises outlines/beacon/hostile-projectile contrast
  without fullscreen filters.

## Verification

Contract tests (`tests/visual/*`): every family has a distinct shape token
stable across ages; friendly ≠ hostile projectile token; pickup ≠ projectile;
POI ≠ enemy; all 5 affixes have distinct markers; boss profile ≠ tank profile;
visual/QA modes dormant without their query flags. Playwright covers
`?visual=1` content, EN↔TH, and `?qa=1`/`/` regression.
