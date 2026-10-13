# Content14 integrated gameplay and visual review

Starting SHA:2222002b84928fff38dedad9689bfbcd0b67edae (PR7).
Branch:feat/integrated-gameplay-art-closure-20261013, stacked on PR7.
Final SHA, exact-head CI, official ZIP hashes and downloadable visual evidence
are recorded in the Draft PR publication receipt, after this document is committed.
Main, tags, package version and market research remain unchanged.

This is one coordinated engineering delivery and one human retest handoff.
Authored production animation, painted costumes for every Age, hardware60FPS and
human enjoyment remain open acceptance gates. No COMPLETE_GAME, FUN_CERTIFIED,
HUMAN_FUN_PASS or RELEASE_READY is implied.

## Evidence boundaries

Before edits,5187 incoming QA/playtest/handoff files were privately preserved with
SHA256 ledger in scratch/integrated-closure-baseline-20261013. Earlier human
INTERRUPTED_BY_BUG records remain unchanged. Operator photos/FPS32–45 mentioned
in the incoming plan are reports, not a newly captured exact-SHA hardware trace.
No staged browser fixture is represented as a clean human playtest.

Full frozen-source local check:460 tests across68 files,45 asset provenance
records, TypeScript and production build passed. Focused canonical cases cover
3840 seeded reservation mutations, genuine6/6 first-Signal/ordinary posts,
disabled reservations, upgrades/dismantling, garrison quota and real raid credit.
Native screenshot fixtures are explicitly staged but use actual renderer and
canonical selection/raid/combat paths. Full browser/Analyze and exact-head CI
publication results belong in the final receipt; no prospective pass is claimed.

## Integrated issue ledger

Paths below are repository-relative. Native evidence filenames are produced in
test-results/browser and distributed in the final exact-head Actions visual artifact.
Short core paths are under src/core; presentation files are under src/game/render,
GameScene under src/game/scenes. Complete implementation decisions are in ADR0028.

| Issue | Root cause | Fix | Files changed | Automated evidence | Visual evidence | Remaining work | Verdict |
|---|---|---|---|---|---|---|---|
|1 Logistics overflow|Stored reservations and fixed squad-pool labels could diverge; first Signal deliberately overcommits|Reconcile full specialized tier costs, including disabled posts; actual mobile quota|core/emergence/outpostLogistics.ts; core/sim/RunSimulation.ts; GameScene|integratedLogistics, playability, territoryEconomy; seeded mutation ledger|integrated-raid-warning-en/th; outpost picker|Human allocation readability|LOGISTICS_INVARIANTS_VERIFIED|
|2 Signal exception|UI must distinguish intentional one-time charged exception from unlimited capacity|Canonical first-Signal predicate preserved; permanent consumed flag, explanatory label|RunSimulation; i18n/en/th; GameScene|first Signal6/6→8/6, dismantle/loss nonrenewal; outpostSoftlock|Signal picker/monolith captures|Human explanation comprehension|LOGISTICS_INVARIANTS_VERIFIED|
|3 Raid wait/progression|Unconditional180s preparation, random distant target, full pool could produce empty raid credit|Accelerate only sole raid gate; keep30s warning; closest active target; bounded12 wave, reclaim ordinary slots/retry protected saturation; no empty credit|core/world/raidReadiness.ts; RunSimulation; RunState; stateHash; GameScene|raidReadiness5; native actual warning→spawn→combat→defense→Atomic|integrated-raid-warning/fight/defended-en/th|Real-player pacing; natural cohort never had raid as sole gate|RAID_PACING_VERIFIED|
|4 Pin gold recommendation|Relation text lacked one obvious truthful offered-card recommendation|Pure ranked advice, one gold outline/label, none if irrelevant; rarity/focus preserved|core/tech/pathGuidance.ts; GameScene; styles; i18n|pathGuidance; ascensionGuidance actual offered pin + computed gold outline + empty/unpin|recommended-draft-en/th; no-relevant-combo|Human route comprehension|PIN_RECOMMENDATION_VERIFIED|
|5 Hunters identity|Shared family visuals and tiny actors obscured Origin|Early bow/arrows, later physical mechanical equipment; gold volley feedback|combatPresentation; HeroEquipment; ProjectileRenderer; CombatFeedback; sfx|presentation family/stage tests; actual family damage; pose tests|hero-v2-hunters-*; family-v2-kinetic|Full authored bow attack/costume animation|COMBAT_IDENTITY_VERIFIED|
|6 Engineers identity|Shared kinetic grammar|Copper ribbed mechanical rig/recoil, real Overdrive activation|same presentation files|distinct descriptor, real events and unchanged combat regressions|hero-v2-engineers-*|Full authored mechanical attack/costumes|COMBAT_IDENTITY_VERIFIED|
|7 Resonant identity|Energy rig looked mechanical; generic beams|Fork staff, branch beam/impact, Nova at actual cast origin/radius|HeroEquipment; CombatFeedback; ProjectileRenderer; sfx|actual Atomic release/damage/Conduction/reset/Reduced Effects|hero-v2-resonant-*; signature-impact; conduction-after|Authored staff and casting sequences|COMBAT_IDENTITY_VERIFIED|
|8 Sentinels identity|Shared Energy grammar|Teal prism/facets; Bulwark only during real iframe window; Guardian retained|same presentation files|distinct descriptor; canonical ability/Guardian tests|hero-v2-sentinels-*|Authored shield/Guardian attack sequences|COMBAT_IDENTITY_VERIFIED|
|9 Entity/camera scale|Hero/base/squad hierarchy was weak; viewport culling assumed zoom1|Shared112/56/48 actor scale,176/208 bases,44–78 enemies, boss≥196; zoom1–1.25; worldView culling and HUD counter-transform|combatPresentation; ActorRenderer; EnemyRenderer; NavigationRenderer; GameScene|four viewport nonempty actors/size/zoom/atlas bounds; existing layouts|integrated-scale-1280/1600/1920/2560|Human readability under dense combat|VISUAL_SCALE_VERIFIED|
|10 Six-Age art|Old six-era SVG equipment replaced by painted pose bodies without six painted costumes|Six material/equipment stages layered on current painted actors; original Guardian eras retained|combatPresentation; HeroEquipment; ART_BIBLE; ACTOR_COVERAGE|six distinct materials; ageEvolution roster/contracts|hero pose and six-age roster captures|Six independently painted costumes and broader environmental era art|ART_INTEGRATION_VERIFIED|
|11 Animation quality|Pose atlases and rigid motion lack full authored sequences|Actual release recoil, two-frame walk, hurt/dash/ability poses, pooled0.3s kill fall/fade|HeroEquipment; DeathResponse; SimEvent; GameScene|event/pose/reset/Reduced Effects and actual kill tests|hero-v2-*; actual combat captures|Production walking/attack/death frame sequences remain OPEN|HUMAN_ACCEPTANCE_PENDING|
|12 Enemy evolution|Size/facing could hide existing era tells|Painted role hierarchy and upright boss preserve actual chaser rush/ranged volley states|ActorRenderer; EnemyRenderer; GameScene|ageEvolution/rush/pool canonical tests, unchanged timings|six-age roster; boss captures|More authored era variants; human counterplay approval|ART_INTEGRATION_VERIFIED|
|13 Boss combat|Huge actor/hazard readability depends on scale and viewport|Boss≥196, retained three real warning/release/recovery patterns; zoom-aware edge indicator|GameScene; NavigationRenderer; DeathResponse|bossCounterplay; native actual slam dodge/fan six shots/cross, EN/TH|boss-v2-warning/release-*|Full authored attacks/death and player difficulty judgment|ENGINEERING_VERIFIED|
|14 Outpost visuals|112u art competed with96u hero and duplicate geometric buildings; atlas registration already existed|176/208 painted states; retire duplicate default superstructure, retain neutral/HC semantics|GameScene; WorldRenderer; ActorRenderer|actual three spec selections assert176u correct frames; reservation/repair tests|outpost-research/military/economy-en/th after real movement|Era-specific painted base kits, human occlusion review|ART_INTEGRATION_VERIFIED|
|15 Biome transitions|Flat colored chunk rectangles/one painted biome|Four original floor sources, continuous bilinear biome mix, mirrored tile edges, extruded single atlas|TerrainPainter; terrainBlend; WorldRenderer; assets/manifest/generation record|continuity/negative-edge partition tests; actual four generated-biome site captures|integrated-biome-verdant/arid/tundra/badlands|Human seam/style approval; mirrored patterns may repeat|ART_INTEGRATION_VERIFIED|
|16 POI/Signal/Knowledge|Small functional pickups and generic landmarks|Larger codex, retained actual Signal monolith/known-only exploration, no hidden bearing|GameScene; existing WorldRenderer/Nav paths|combatFeedback actual codex collection/known-only EN/TH; prior biome role contracts|knowledge-codex; signal-monolith/exploration|More original painted POI variants|ART_INTEGRATION_VERIFIED|
|17 Legacy cleanup|Old uploads/decor/superstructures overlap painted presentation|Delete VerdantTerrain; one TerrainPainter; retire9 old actor gameplay uploads, default decor glyphs and duplicate base geometry|GameScene; ActorRenderer; WorldRenderer; TerrainPainter; heroPortrait|asset provenance/core-isolation; cached sprite calls|all default/native and HC captures|Archived sources and diagnostic fallbacks retained intentionally|ENGINEERING_VERIFIED|
|18 Performance|Repeated actor texture/style work; old floor glyph load; sparse measurement mislabeled render/GPU|Cache sprite state; batch bounded64-tile16MiB atlas; cull worldView; measure actual driver and WebGL submissions|ActorRenderer; TerrainPainter; GameScene; evolution.spec|idle60 draws one style application; atlas cap; paired sparse profile|evolution-child; integrated-scale|Hardware stress400–600 enemies/600–1000 shots,15-minute memory and full GPU timing OPEN|HARDWARE_PERFORMANCE_PENDING|
|19 EN/TH/accessibility|New status/recommendation text must not expose raw keys or break navigation|Parity/localized labels, existing Thai1.8 line-height and keyboard modal coordinator preserved|i18n/en/th; styles; helpers; GameScene|parity/uiKeys; softlock Escape/Enter/FIFO/Thai200%; layout suite|Thai recommended/raid/child/pause captures|Human language/readability approval|ENGINEERING_VERIFIED|
|20 Deterministic replay|Raid landed/allocation/readiness phases were missing from hash|Hash actual raid phases; seeded tie choice; no new RNG/dependency; CONTENT14|RunState; stateHash; versions; raidReadiness|replay/snapshot finite bounded; ledger sequences; unchanged distribution audit|Gameplay evidence is supplementary, not replay proof|Historical Content13 hashes intentionally differ|ENGINEERING_VERIFIED|
|21 QA/release|Repeated partial handoffs and dirty/local package ambiguity|One stacked Draft PR, preserved5187 files, full checks, exact-head four-job CI and official package receipt|SESSION_HANDOFF; this review; scripts/progressionPolicy; run-progression-cohort|full460; provenance45; release/ZIP and CI receipt required|Actions exact-head visual artifact|One consolidated clean human retest; no fun verdict yet|HUMAN_ACCEPTANCE_PENDING|

## Before/after canonical cohort

Reproduce with `node scripts/run-progression-cohort.mjs`. It archives exact PR7
core/content into ignored scratch and runs the identical responsive-route-planner-v2
against both versions: four Origins × EPOCH-GOLDEN-001/EPOCH-A7F2-K19X,900 total
simulation seconds each. No grants, teleports, god mode or hidden-POI inspection.
Ascension requires actual boss victory and legal Legacy choice, with child state
reset observed. Adaptive trajectories differ; this is not isolated causal proof.

|Origin|Golden before → after|A7F2 before → after|
|---|---|---|
|Hunters|Atomic → Atomic|Space/boss/child → Space/boss/child|
|Engineers|Atomic → Space/boss/child|Industrial → Industrial|
|Resonant|Atomic → Space/boss/child|Atomic → Atomic|
|Sentinels|Iron → Iron|Industrial → Industrial|

Real boss/child reached1/8 before and3/8 after; all8 survived the900s budget
with this expert scripted controller. Zero cohort seconds had Raid as the sole
gate in either version: **do not claim these runs measure raid-only wait savings**.
The bounded isolated gate test supplies that proof. Other requirements/exploration
still explain incomplete runs; these outcomes alone do not establish a softlock
or justify altering combat/HP/mission thresholds. Earlier weaker controller-v1
lost all8 before/after and its failed outcomes are privately retained alongside
v2, not erased. Human difficulty, enjoyment and Sentinel progression need review.

## Performance and legacy contract

Paired same-host sparse1920×1080 parent/child traces report actual
ANGLE/SwiftShader software driver. Baseline presentation-command p95 was7.9ms
parent/14.8ms child; frame p95 was78.2/98.3ms; draw-call p95 was5/6 and submitted
vertex p95 was50700/60855. Candidate presentation-command p95 was4.1/4.7ms,
frame p95 was69.9/71.2ms, draw-call p95 was6/7 and submitted vertex p95 was
12318/17271. Scene objects changed49→36 parent and72→47 child. Thus geometry
submission and command-building work decreased while draw calls rose by one;
do not claim fewer draw calls. Raw paired sparse receipts are retained in
docs/performance/content14-software-before.json and content14-software-after.json.
These scopes are not GPU execution or a target-hardware60FPS certificate. Budgets
in PERFORMANCE_BUDGET.md remain unchanged. Reduced Effects/High Contrast have
functional native regressions; no paired hardware-mode stress claim is made.

Keep: functional projectile/range/HP/affix/hazard geometry; neutral pads; High
Contrast floor; legacy VisualLab; Guardian six-era rig; archived original art,
licenses and old tests. Retire: repeated default flat biome rectangles/decor glyphs,
duplicate painted-base superstructures, obsolete VerdantTerrain and nine obsolete
actor texture uploads. Registration of outpost frames existed before this work;
the actual correction is footprint/occlusion/duplication, not missing registration.
Projectile tier already used canonical weaponStage; it was not a root-cause fix.

## One consolidated human retest

Use the final exact-head four-job green run and verify the publication SHA before
starting. `npm run qa:human` serves the clean source checkout with a local report
sink at http://localhost:5173/?qa=1; it does **not** serve the official ZIP. For a
package-based run, extract the official ZIP to scratch/integrated-official-dist
and run `node node_modules/vite/bin/vite.js preview --outDir scratch/integrated-official-dist --port 5173 --strictPort --host 127.0.0.1`,
then open http://localhost:5173/?qa=1. Static preview has no local report sink:
use the game's QA export and retain the downloaded report. Choose one route for
this review batch and label its source explicitly. Do not use `?e2e`.
Run EPOCH-GOLDEN-001 then EPOCH-A7F2-K19X as one review batch across four Origins.

1. Record hardware/browser/resolution/scale/driver and screenshot initial HUD.
2. Compare each Origin's movement, weapons, real ability, hits and sound through
   six Ages; judge silhouette, base occlusion, floor boundaries and enemy tells.
3. At full Logistics, claim free neutral land. Verify Later/Escape resumes; choose
   the first Signal once and observe charged7/6 or8/6. Upgrade only after legal
   reallocation; check disabled reservation, repair, garrison/recall and dismantle.
4. When Raid is the sole gate, follow the visible countdown/target. Fight the
   actual wave; credit arrives after attackers die, never just after a timer.
5. Pin a future technology, inspect truthful gold advice, reroll/reserve/unpin;
   no relevant choice must show no recommendation. Try EN/TH and100–200% UI.
6. Dodge boss warnings, earn victory, legally Ascend and verify child reset and
   inherited effects. Capture F3/F4 diagnostics, frame distribution and any defect.
7. Keep a15-minute dense hardware trace in normal/Reduced Effects modes and note
   maxima, saturation, restarts/Ascension and memory. Do not equate sparse FPS with
   performance-budget acceptance. If interrupted, retain evidence and mark
   INTERRUPTED_BY_BUG. Submit subjective art/fun ratings explicitly; automation
   never supplies HUMAN_FUN_PASS.

Outstanding production gates: authored multi-frame attack/walk/death, six painted
costumes/environment-era kits, human aesthetic/readability/enjoyment approval,
hardware stress60FPS/full GPU timing/15-minute memory. Engineering readiness is
conditional on the exact-head final CI/ZIP receipt, not on this document alone.
