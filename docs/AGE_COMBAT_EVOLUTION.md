# Civilization combat evolution — first human-validation slice

Baseline PR4:47aa8c620166f92b11d61d9d58c480620c602052. Separate branch feat/age-combat-evolution-20261012 targets PR4; existing PRs/main never merged.

## Evidence and scope
Human reports245/246 at PR4 are revisions of session qa-27147-e9kpmj with the same terminal wallEnd and target-complete route, not two independent successful playtests. Incoming sanitized report and handoff preserved; raw files backed up with hashes under ignored scratch/age-evolution-baseline-20261012. User conversation reports unnatural body rotation and repetitive enemy handling; do not invent terminal written feedback or fun verdicts.

Highest-value safe slice: upright characters across all six equipment Ages, source/tier-aware projectiles, Stone versus Industrial enemy behavior. Expansion to four other Ages and new boss phases waits for the first genuine human counterplay/style validation. Other Ages retain existing family AI; not ENEMY_BEHAVIOR_EVOLUTION_VERIFIED across six Ages.

## Animation and art
ActorRenderer now selects explicit role policy. Four humanoid Origins and squads remain rotation0; authored front/back poses, stable horizontal flip, moving gait frames1/2 and idle0. ActorMotion uses observed canonical positions, fixed simulation time and short100ms persistence, with per-world/restart resets. Squad no longer faces the unrelated player position; hold stops gait, real inv damage flashes. Insect/drone orientation remains useful heading; boss body stays upright. Attack aiming remains canonical and independent of locomotion. Fully authored weapon mounts/attack/death animation remain partial.

Four36-frame original SVG strips:18 front +18 authored back, each six equipment Ages×three poses; no rotated directional artwork. Pivot32,32,64px frames; hero48px, squad28px. Other actors keep18 frames. Typed AgeVisualIdentity aligns materials with Stone(chipped tools), Bronze(cast guards), Iron(forged plates), Industrial(mechanical packs), Atomic(containment cells), Space(exosuits). All source copies MIT, hashed in existing manifest and working-prototype. New raw actor pixels≈3.94MiB, excluding engine overhead.

## Canonical adaptation contract
Family/era/elite are separate. Only ordinary non-boss/non-siege Stone chasers rush and Industrial ranged burst. Director weights, costs, density, HP, affixes and boss/raid contracts preserved. No RNG added.

| Adaptation | Activation | Warning/commitment | Resolution | Counterplay/bounds |
|---|---|---|---|---|
| Stone rush | cooldown expired, <=150u |0.75s stopped, locked target | up to0.35s at3×base movement, existing contact damage;0.9s recovery then3s cooldown | sidestep locked path; leaving activation range cancels warning; no bonus damage |
| Industrial burst | cooldown expired, <=300u |0.8s stopped, locked aim |3 shots at0.15s spacing, existing260u/s speed/radius; each dmg/3;1.2s recovery then3.3s cooldown | strafe fixed aim, close in recovery; leaving300u cancels pending attack; same total nominal damage per attack |

Adaptive arms-race lore: primal pursuers commit to scent trails; Industrial ranged organisms develop repeat-discharge organs. They keep family anatomy and are not arbitrarily replaced by human machines. This is an experimental cadence/handling change, not a validated difficulty improvement. Core evolution state includes timers/phase/locked coordinates/remaining shots in snapshot; recycling clears it, boss/siege/elite ignore it. Functional lines/rings use exact locked aim, survive Reduced Effects; localized global warning and bounded synthesized warning/fire sound follow real SimEvents.300u range is intended for supported desktop720px-height gameplay; narrow/short-screen threat readability still needs human validation.

## Projectile identity and compatibility
SimProj src remains authoritative provenance; visualTier captures actual weaponStage at spawn for four families, current Age for squad/ability/enemy. Presentation never guesses identity from color or switches a flying shot on Age transition. Chipped shards→arrows→forged bolts→ballistics→plasma→photon trails; energy uses contained rings, support uses tether-role outlines. Trails<=24u and removed by Reduced Effects; hostile arrowheads retain distinct silhouette. Existing beam/aura/orbit/summon/mine mechanics and Conduction/Relay remain.

Content12 intentionally changes combat/replay results and hashes new adaptation/visualTier data. Worldgen2 and save schema2 unchanged; persistent settings/Archive compatible. Old content11 input traces are not certified against12. No dependency added.

## Acceptance and next human gate
Automated orientation, pool reuse, pause/hold/reset, canonical warning/locked aim/recovery/damage/replay and source-tier tests required; final exact-head full check/analyze/browser/ZIP/release verification and CI receipt recorded in the Draft PR. E2E captures are staged actual simulation, not human play or videos. Test24Origin×Age states, Stone/Industrial warning and recovery, EN1280/1920 and TH720px, Reduced Effects/high contrast/dense combat.

Human checklist: start four Origins, walk four directions, hold/focus squad, reach Industrial; identify rush versus burst before being hit, sidestep rush and strafe burst, exploit recovery; confirm own advancing equipment/projectiles remain readable; test restart/Ascension/Logistics and existing fusion; compare real p50/p95/p99 without a60FPS claim. Record new distinct session and actual written feedback. HUMAN_GAMEPLAY_REVALIDATION_PENDING / ART_PRODUCTION_PARTIAL.

## Verification receipt (pending final CI)
Local focused27/27 and stronger committed-rush/pooling8/8 passed; typecheck/provenance/build passed. First real-time browser capture exposed an exploration POI draft in the movement fixture and a missed short recovery window while screenshotting. Isolated local generated POIs in the test-only arena and split24-state matrix by Age. Encounter captures now use real fixed simulation steps frozen only for screenshot timing, explicitly staged; runtime unit tests prove damage/counterplay. No timeout/physics/assertion thresholds weakened. Local full check exceeded frontier-policy180s at189.1s; its policy outputs and log are preserved, distribution6 passed, final summary421 passed/1 frontier-policy timeout, plus1 worker onTaskUpdate timeout; no local full-check PASS claimed. Exact-head Node22/24 checks are authoritative automated gates, not hardware certification.
