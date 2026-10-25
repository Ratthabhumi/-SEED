# Visual Language — -SEED v0.1.1 Readability Pass

Binding spec for presentation. Gameplay numbers live in `core/` + `content/`;
this document owns **how things look**, never what they do. Visual changes must
not bump `WORLDGEN_VERSION`, `CONTENT_VERSION`, or `SAVE_SCHEMA_VERSION`.

Evidence: Human Gate A `FAIL_BLOCKING_READABILITY` (EPOCH-GOLDEN-001, 10:15,
Space, 0 bosses, 0 ascensions; feedback affirmed everything except stutter).
"ยากเกิน + ง่ายเกิน" together = `PERCEIVED_DIFFICULTY_INCONSISTENT`, not a
balance verdict. Fix readability first, re-run, then judge numbers.

## Round-1 human review: NOT PASSED (2026-09-29, Visual Lab screenshots)

1. Player vs families: PASS_WITH_NOTES (swarm read as decoration, samples small).
2. Friendly/hostile/Knowledge/Mine: FAIL — hostile projectile and Knowledge
   shared a diamond silhouette; color alone carried the distinction.
3. POI: FAIL (debug-marker beacons); Boss: PASS (hex-crown threat reads clearly).
4. Thai: NOT YET VERIFIED (review ran in English).
5. Background: PASS_WITH_NOTES (brown-ground contrast weak for some tokens).
6. Overall: NOT YET PROVEN — isolated specimens don't prove combined readability.

Round-2 remediation (this document, same branch, presentation-only):
R1 hostile→arrowhead-spike vs Knowledge→crystal-shard; R2 swarm→tri-cluster
pack; R3 unique POI destination glyph per family; R4 deterministic composite
clash panels (Verdant + Arid); R5 lab grayscale toggle; R6 1x/2x inspection
scales + responsive rows; R7 Thai strings + narrow wrap-review box;
R8 token×biome contrast matrix. No balance/worldgen/sim/RNG/threshold change.

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
| `swarm` | tri-cluster: leader body + two trailer wings + wake tick | swarm pack |
| `elite-ring` | gold/white outer ring layered over family shape | elite |
| `affix-swift` | speed chevrons | swift elite |
| `affix-armored` | square brackets / double plate | armored elite |
| `affix-volatile` | hazard spokes, pulses before detonation | volatile elite |
| `affix-splitter` | two-lobe mark | splitter elite |
| `affix-shielded` | cyan shield ring | shielded elite |
| `boss` | large hex + crown spikes + red/white outline (never a big tank) | boss |
| `proj-friendly` | capsule/circle, light core + light outline | player projectile |
| `proj-hostile` | 6-point arrowhead/spike + hot tip spark, dark outline | enemy projectile |
| `knowledge` | vertical elongated crystal + facet glint + halo ring | progression currency |
| `mine` | ground device: base plate + blinking core | player mine |
| `poi-broken-arch` | two pillars + broken lintel | Ancient Ruin destination |
| `poi-impact-star` | four-point impact star | Meteor destination |
| `poi-vault-lock` | square vault + inner lock | Machine Vault destination |
| `poi-signal-wave` | mast + radiating arcs | Alien Signal destination |
| `poi-hex-complex` | hexagon + inner nodes | Megasite destination |
| `poi-branch-tree` | trunk + branches + canopy nodes | World Tree destination |
| `poi-beacon` | vertical light pillar (secondary wayfinding only) | undiscovered POI |
| `poi-done` | dim small ring | discovered POI |
| `decor-plus` | sparse dim plus-marks (never dots/discs) | civ/background decor |
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
stable across ages (swarm = tri-cluster); hostile arrowhead-spike ≠ knowledge
crystal-shard; both ≠ background plus-mark decor; POI glyphs unique per all 6
implemented families; all 5 affixes have distinct markers; boss profile ≠ tank
profile; lab sections registry includes both composites; grayscale filter
contract; visual/QA modes dormant without their query flags. Playwright covers
`?visual=1` content, EN↔TH, grayscale toggle, and `?qa=1`/`/` regression.

The lab itself (`?visual=1`): specimen rows at 1x game scale + 2x inspection,
POI glyphs with localized names, token×biome contrast matrix, deterministic
Verdant/Arid composite clash panels, NORMAL/GRAYSCALE/HIGH contrast modes,
Thai strings + 300px wrap-review box. Grayscale is a CSS diagnostic on the lab
canvas only — never a gameplay setting.
