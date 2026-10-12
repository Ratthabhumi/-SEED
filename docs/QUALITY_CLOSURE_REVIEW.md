# Content13 progression recovery and painted gameplay art — 2026-10-13

Review branch: feat/breakthrough-quality-closure-20261013, stacked on PR6
36c0bbb11a1de1fd5f503058488c657af9ec22e8. Main remains untouched.
This coordinated checkpoint addresses more than Energy, but does **not** certify
the entire production-art master plan, human visual acceptance, fun or release readiness.

## Evidence and correction

Preserved incoming PR6 human session qa-15265-zp5pb9, terminal report143:
clean build36c0bbb, Resonant, EPOCH-GOLDEN-001, player-died at608.48 simulation
seconds, Iron reached, no Industrial, no earned combination. Raw telemetry does
not contain a complete replayable input history. The reported10,707/2,800 image
is human progression-failure evidence; its exact frame provenance is unconfirmed.
Do not claim an exact replay of that screenshot or a proven technical softlock.
All291 incoming files/raw revisions are privately copied with SHA256 ledger in
scratch/quality-closure-baseline-20261013; sanitized documents committed separately
in e72728b. Older INTERRUPTED_BY_BUG evidence is retained, never HUMAN_FUN_PASS.

Code defect/risk: generated Stone modules could omit Fire or Tools, while the
Industrial mission requires a combination and pinning only weights random offers.
Content13 reserves the universal, non-exclusive Fire/Tools pair within the **same
module-count budget**, without extra RNG draws. Before Industrial and before any
combination is earned, every level draft retains an eligible missing recipe card.
It occupies a non-reserved slot toward the end, preserving origin-specific first
choices and existing diversity thresholds. Players still choose/pay with their
level opportunity; no free tags, bonuses, logistics or advancement are granted.
POI filters remain separate. Reroll's forced swap cannot remove the recovery card.
An intentionally skipped recipe is an informed player decision, not an impossible
random gate. Metallurgy applies through existing canonical chooseDraft exactly once.

One pure combinationRoute predicate drives draft reservation, acquired ingredient
checks and objective/map advice. The mission says Complete1 Tech Combination /
ค้นพบเทคโนโลยีผสม1ชุด and opens the pinned recipe in the actual map. Fire and Tools
are shown separately with ownership marks and their real damage/Knowledge reward.
No future-age or incompatible provider is advertised as immediately available.

The preregistered cohort is203 seeds × four Origins × generation worlds0/1/2 =
2,436 cases, including the human seed. Exhausting all unrelated nodes is a stronger
over-approximation of adverse investments: neither recipe component is excluded.
Real level drafts and canonical pick effects are separately tested; equal traces
have equal snapshots. This proves recovery availability, not every conceivable
human policy's survival or eventual voluntary acceptance of the recipe.

## Original art production

The operator explicitly requested replacing the weak old art. Built-in OpenAI
imagegen produced eight original raster atlases/floor images; unchanged source PNGs
are retained in assets/original. Prompts/tool calls: art/GENERATION_RECORD.json.
No existing game's code/art was copied. Editable vector sword source is retained;
raster originals are paintable source images, not vector rigs or skeletal animations.
Manifest records generated authorship, source/production hashes, alpha-preserving
slicing/resize, actual dimensions, and art-review-pending status. MIT project assets
do not change Kenney CC0 provenance. No new runtime dependency.

- Four Origin hero atlases,16 front/back poses each,128px cells,72u displayed hero.
  Actual shot, hurt, dash, death and ability state select different poses. Walk has
  two stride poses. These are **posed combat states**, not completed multi-frame
  attack/death animation sequences or six fully authored equipment eras.
- Four enemy silhouettes,16 cached frames in one atlas; existing rush/burst,
  elite identity, canonical facing/target and attack warnings remain functional.
- Eight boss poses selected by real warning/recovery/fire/hurt state. Actual boss
  has locked slam, six-projectile fan with a central gap, and low-HP cross lanes.
  Warning1.15s, stationary recovery1.6s. HP unchanged. No density/RNG changes.
  New boss state is canonical, hashed and reset on pool reuse. Squad area damage
  is resolved by the same attack geometry. Recovery provides safe attack opportunity.
- Three outpost rows × Tier1/Tier2/destroyed/repairing. Real spec/tier/disabled/repairT
  choose frames on the existing ground-cache invalidation. Neutral unassigned pad
  stays neutral. Military has no fictional firing turrets. Existing six-era vector
  foundation remains; six separate painted building/hero equipment eras are pending.
- Verdant painted moss/fern/slate floor is cosmetic and walkable. Cached chunk
  image pool; no collision, routing, terrain RNG or hidden coordinate changes.
  High Contrast uses existing plain terrain. Tile seams and density need native
  review; other biome production artwork and living scenery are pending.

Kinetic muzzle/material impacts, guardian release/triangular impacts and actual
mine soil-fracture detonation join Energy in the existing bounded CombatFeedback.
Eight muzzle slots,32 shared impact slots, existing eight impact sprites; no second
weapon engine, false damage rings or per-frame particle spawning. Reduced Effects
suppresses cosmetic additions; boss warnings remain. All timers use simulation time.
Audio retains eight-voice/mute/throttling guards. Spread projectiles now initialize
visualTier on reuse (covered by Content13 compatibility change).

## Acceptance matrix

| Issue | Root cause | Implemented fix / files | Automated proof | Visual proof | Remaining work | Verdict |
|---|---|---|---|---|---|---|
| Breakthrough | Random missing components/weighted offers, unexplained gate | generator, combinationRoute, RunSimulation, GameScene, TechMapView, EN/TH | combinationRecovery; cohort2,436; snapshots; existing advancement regressions | combination-objective/map EN/TH captures | fresh human progression retest; exact old input unavailable | P1_REACHABILITY_AUDITED; human retest pending |
| Warfare sword | Shared military icon | original sword; SEED_ASSETS; DOMAIN_ICONS; draft/map | provenance; browser map/card | sword in actual cards/map | grayscale human readability | reviewable |
| Kinetic VFX | No release/resolved material effect | weapon_fired/impact; CombatFeedback; sfx | familyFeedback; spawn tier | hero/family combat captures | authored stage-specific VFX animation | partial |
| Energy VFX | First PR6 signature only | preserved beams/Conduction plus real hero attack | combatFeedback; existing Conduction E2E | existing beam/Conduction captures | richer authored effects | partial |
| Defense VFX | Generic support shapes | actual guardian shots/audio/impact identity | familyFeedback; Guardian age regression | roster captures | guardian art/mount animations | partial |
| Field VFX | Generic placement/detonation | actual mine event, bounded ground fractures/audio | familyFeedback | combat captures | mature placement/trigger animation | partial |
| Hero | Small prototype strips | four original painted atlases, HeroActions/ActorRenderer | heroActions; actual event mapping; pool tests | sixteen combat-pose captures; age roster | six equipment eras; multi-frame attack/death; ally redesign | HERO_ART_PARTIAL_OR_COMPLETE: PARTIAL |
| Enemies | Flat role art | four painted roles; actual attack pose | existing rush/burst/replay | encounter/roster captures | all-era authored behavior/art; death sequences | partial |
| Boss | HP/contact dominated | bossEncounter, state hash, BossTelegraph, painted atlas | bossCounterplay actual dodge/damage/projectiles/replay/reuse | three warning/release EN/TH captures | human difficulty/readability; animation transitions | counterplay reviewable |
| Research Outpost | Vector prototype | actual Observatory row, tier/damage/repair frame | canonical claim/spec/repair regressions; provenance | outpost-research captures | painted six-era kits | partial, actual identity mapped |
| Military Outpost | Vector prototype | actual Bastion row, no research overlay | same canonical transition regressions | outpost-military captures | painted six-era kits | partial, actual identity mapped |
| Economy Outpost | Vector prototype | actual Workshop row, real disabled/repair frame | same canonical transition regressions | outpost-economy captures | painted six-era kits | partial, actual identity mapped |
| World map | Flat fills/sparse marks | original Verdant floor; cached VerdantTerrain | seeded generation unchanged; provenance | native Verdant hero captures | seams/density; tall foliage/landmarks; other biomes | WORLD_ART_PARTIAL_OR_COMPLETE: PARTIAL |
| Signal | Recognition uncertain | retain PR6 unique monolith/known-only guidance | fog/Signal exemption regressions | Signal captures | unprompted human discovery | human acceptance pending |
| Knowledge | Recognition uncertain | retain codex/HUD/actual gain feedback | pickup regression | codex/HUD capture | unprompted human recognition | human acceptance pending |
| EN/TH accessibility | Objective terminology and icon semantics | localized recipe/boss instructions, native map button, keyboard paths | parity; EN/TH native tests; existing scale matrix | objective/map/boss captures | review all new art at narrow/200% | validation pending |
| Performance | Existing frame target unmet; added cached art | bounded pools, textures, optional plain high contrast | existing instrumentation/budgets unchanged | performance receipt in PR | hardware/GPU/stress/15min memory; no60FPS claim | BLOCKED for certification |

## Validation and limits

Initial local mixed working-tree check failed: policy180s/onTaskUpdate timeout,
recipe-slot first-choice diversity, old nine-option count and old asset/mock
assumptions. Keep logs. Correct slot ordering/count without lowering thresholds;
teach provenance tests the new **modified original** source/production contract,
retaining all old CC0 strict checks. Actual PNG source hashes remain independently
verified. Update renderer mock to include real Phaser setOrigin. Existing age
roster now asserts the replacement pose atlas while retaining Guardian's six-age
equipment checks; authored hero six-era coverage remains explicitly incomplete.
The preview launcher uses Node's installed Vite directly, avoiding npx startup;
its60s readiness limit and stale-server rejection stay unchanged.

Targeted25 tests and Analyze6 passed during implementation. Final frozen-tree
full check, native suite, pushed exact-SHA four-job CI and ZIP receipt are required
and will be recorded in PR/task. Never promote these earlier partial runs to final
ENGINEERING_VERIFIED, HUMAN_FUN_PASS, RELEASE_READY or60FPS_VERIFIED.

## Human retest after exact-head green CI

Stop the old local server, then npm run qa:human. Confirm new exact SHA and Content13.
Use EPOCH-GOLDEN-001/Resonant, choose Fire and Tools from level drafts, verify actual
Metallurgy bonus and Industrial gate. Ignoring the recipe must leave it available
later, not silently unlock it. Check mission map button, keyboard close and Thai
text. Verify Logistics6/6 Later/Escape and first-Signal exemption unchanged.
Compare four hero silhouettes/poses, actual three outpost specs and real10s repair.
Observe boss warning, step out of slam, find fan gap, dodge cross after half HP.
Compare normal/Reduced Effects and High Contrast. Report actual FPS/visual quality
and readability; do not reuse an interrupted session as a clean fun verdict.

Research handoff: no further market research performed. Useful future external
research is a production animation staffing/pipeline estimate, perceived combat
readability at72px and native GPU profiling approach. It does not replace the
pending local asset cleanup, authored eras, hardware evidence or human acceptance.
