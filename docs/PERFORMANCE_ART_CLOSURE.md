# PR8 follow-up: performance and painted material integration

Baseline:8d52ecd34ca3de4cb5c1bb55293d663c3b515493, Content14/worldgen2/save2.
Branch:feat/content14-stutter-art-consistency-20261013. One Draft stacked on PR8;
no main merge, publication, tag, version bump, dependency or market research.
Final exact SHA, CI runs and official ZIP receipt are attached to the Draft after
validation. A partial production-art status is explicit, not hidden behind CI.

## Live inventory

| Element / actual renderer | Default art / footprint | Decision / classification |
|---|---|---|
| TerrainPainter | four source floors,252px cells displayed512u | Worker + partial atlas upload; keep source quality, review pending |
| ActorRenderer hero/squad | four16-pose painted atlases,112/56u | Keep; FUNCTIONAL_BUT_VISUALLY_WEAK animation and baked weapon props |
| HeroEquipment |24 painted canonical weapon-tier cells,56–66u | Replace procedural mount; reviewed asset family, human acceptance pending |
| EnemyRenderer/ActorRenderer | four families16 poses,44–78u; elite×1.4 | Keep; animation/era outfits incomplete |
| Boss ActorRenderer |8 poses,196u minimum | Keep actual warning/release/recovery; full animation incomplete |
| Guardian ActorRenderer | four painted Origin drone bodies48u | Replace default SVG; enabled age counts unchanged; full era kits open |
| Outpost landmark images |12 actual spec/tier/disabled/repair states176/208u | Keep single painted body; static repair/destruction poses incomplete |
| Neutral pad | canonical free claim, geometric empty foundation | Intentional LEGACY_FALLBACK / clear unassigned state |
| POI landmark images | six painted ruins/meteor/vault/signal/megasite/tree112–144u | Replace default monolith/glyph/observatory bodies; labels/reach preserved |
| CombatSprites friendly shots | source role + captured tier; directional32–52u art | Replace default lines/polygons; collision remains actual radius |
| CombatSprites mines | four painted trap bodies36u | Replace default devices; exact danger/reach ring remains |
| CombatSprites Knowledge | painted open codex30–36u, pool400 | Replace default book strokes; HUD keeps matching open-book semantics |
| ProjectileRenderer hostile | coral barbs/dark outline | FUNCTIONAL_BUT_VISUALLY_WEAK; essential directional danger preserved |
| CombatFeedback beams/chains | exact captured paths, bright core/dark separation | Keep truthful path geometry; authored VFX animation still open |
| Nova/Bulwark/Overdrive | real cast/iframe/boost timers and Origin palette | Functional rig; polished raster power sequences incomplete |
| Enemy/raid/boss warnings | actual hazard footprints/HP/text | Keep essential geometry under Reduced Effects/High Contrast |
| High Contrast equipment/POIs/Guardian | existing clear geometric/SVG silhouettes | Deliberate LEGACY_FALLBACK, not removed for aesthetics |
| Old unbound actor/floor paths | retained historical/licensed source | UNUSED in default gameplay, provenance preserved |
| World-prop impact cell11 | generated sample | UNUSED, no fake impact/animation completion claim |

All new imagery is original built-in imagegen output with raw sources, exact
generation/packing prompts, normalization details and SHA256 integrity in the
manifest. Three family atlases add≈3MiB uncompressed pixels, not per-entity
textures. Texture/collision/body scale and actual attack source remain separate.

Painted projectiles/pickups use three fixed-buffer Mesh2D batches on WebGL,
preserving the same art/camera/UVs with three display objects instead of hundreds
of Image objects. Canvas retains an Image fallback. A measured dense-image
prototype regression and High Contrast background-upload regression were
retained and corrected. See ADR0029 and the paired measurement receipt.

Final passes additionally trim only transparent quad margins with verified
bitmap-bound metadata, cache stable terrain-image assignments and enforce
prepared-result backpressure. These preserve visible pixels/detail, bound
per-frame work and keep memory independent of repeated visits. Both slower
and quiet-baseline measurements are retained; source repeat variability is
reported rather than selecting the worse baseline for a larger gain.

## Issue closure matrix

| Issue | Root cause / fix | Before/after evidence and tests | Remaining risk / status |
|---|---|---|---|
| 1 Terrain streaming | synchronous per-pixel work → Worker, visible priority/prewarm | baseline cold134–211ms; paired profiler; exact pixel unit checks | Original hardware correlation pending; engineering bottleneck verified |
| 2 Texture refresh |16MiB full atlas →256KiB subregion, one/frame | upload counters, native traversal/cache; Phaser4.2.1 adapter | CPU call is not GPU completion; context adapter must be revalidated on upgrade |
| 3 Chunk/cache |64 slots, request/world tokens, bounded queue | repeated fast jumps/negative coords/cache revisits | Chunk generation remains deterministic main-thread work; timing reported separately |
| 4 Pacing/memory | RAF tails/long-task and optional15min trend | same-seed routes/settings/500+800 render workload | Hardware60FPS/GPU completion acceptance pending |
| 5 Style | unrelated procedural bodies → shared painted materials | actual-scale Origin/age/EN/TH captures; live inventory above | Baked hero weapons and full power/hostile animation remain incomplete |
| 6 Origin projectiles | canonical source-role mapped to four atlas columns | role unit tests + native releases | Beam/area families retain exact geometry; no hidden attack |
| 7 Equipment | procedural mounts →24 painted actual-tier frames | all four Origins×six tiers×two languages | Six hero costumes are separate unfinished work |
| 8 Powers/VFX | preserve actual release/impact/ability clocks and audio | existing real-damage/Conduction/pause/reset regressions | Full authored effects sequences open |
| 9 Scale | preserve shared entity/camera sizes; POI112–144u | existing four viewport/Origin/boss evidence | Human combat occlusion/readability acceptance pending |
| 10 Six-Age art | weapon objects now six tiers | frame/actual-tier matrix | Body, Guardian, environment six-era costumes incomplete |
| 11 Animation | retained posed walk/release/hurt/death fade | pose/event/pool tests | Multi-frame attack/death/recovery production sequences incomplete |
| 12 Enemies/boss | retain painted families and canonical tells | existing actual encounter/defeat tests | Complete authored era/animation library open |
| 13 Biomes/landmarks | preserved blended ground + six painted POIs | byte-exact floors/native actual biome captures | Biome-specific landmark variants and full ecology art open |
| 14 Logistics | PR8 reservation ledger/first-Signal untouched | canonical invariant +6/6/Later/Escape/FIFO/normal selection regressions | User interpretation/fresh human acceptance pending |
| 15 Raid | PR8 gate-aware preparation/genuine enemies untouched | allocation/saturation/defense tests +native countdown/combat | Natural human raid-only pacing comparison still open |
| 16 Gold Tech | PR8 truthful offered-card recommendation untouched | path/reroll/reserve/UI/EN/TH tests | No fake relevant card introduced |
| 17 Legacy cleanup | replace default POI/Guardian/projectile/equipment/pickup paths | native actual textures/role identity/pools | High Contrast, danger geometry and historical sources deliberately retained |
| 18 EN/TH | controls/fonts/text unchanged | parity/Thai scale/keyboard/modals +new48-state image matrix | Fresh human visual acceptance pending |
| 19 Determinism | no core/content/RNG/rule changes | full replay/state hash/progression suite | Rendering fixture is not canonical gameplay evidence |
| 20 QA history | two real sessions, unique terminal metadata | incident report, private ledger, original exports retained | Neither machine success nor blank ratings means HUMAN_FUN_PASS |
| 21 CI/ZIP | complete project gates, exact-head four jobs, official package audit | final Draft publication receipt | No prospective green claim, no main merge or release |

## One operator retest after final engineering receipt

Use the final reviewed ZIP or a clean checkout of the exact final SHA; record
which route was used. For source testing run `npm run qa:human`, open
`http://localhost:5173/?qa=1`, start a fresh GOLDEN run, record hardware/browser/
viewport/settings and test both ordinary walking and dash across biome edges.
Check real projectile release/impact and equipment tiers, recognizable POIs/
Guardian, Logistics6/6→Later/Escape→movement, retry when capacity permits,
real raid-only gate waiting and actual gold pinned recommendation. Continue
through a genuine boss win and child world; do not use staged E2E hooks.

Submit one terminal report and explicit feedback on stutter, material cohesion,
warning legibility and enjoyment. Preserve any failing run; only a fresh clean
human session can close human acceptance. Hardware trace is needed if stutter
persists. No repeated mid-delivery playtest request is required.
