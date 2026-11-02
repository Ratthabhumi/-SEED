# V4.3 consolidated gameplay recovery — 2026-11-02

Primary owner checkout: `C:\Users\MewMew\Desktop\Co-op\-SEED`.
Branch `feat/v43-gameplay-recovery-20261102`, base PR33/7847d7b, main725cc79b.
One campaign/Draft; no main merge, history rewrite, release or deployment.
Original .cursor, launcher and private reports are preserved. No external research.

## Evidence and implementation

Human session qa-37482-vk8rai used clean7847d7b, Golden001/Hunters,2550x1272
at about48Hz.117 and118 are terminal snapshots of the same completed605.62s
session. The subsequently saved91 is an earlier incomplete snapshot of that
same identity, not another completed run. Latest correctly remains118. Natural
progression reached Space/Boss defeat/World2; no Origin power, squad orders or
Civ Map usage and no ratings were recorded. Usage absence is a discoverability
signal, not proof the powers are broken. Existing sanitized reports are retained.

Confirmed rendering defect: repeated damage selected the hit cell instead of
windup/release cells and added a continuously oscillating hit rotation. Two new
regressions fail before the fix. Production now retains the actual action pose,
existing damage tint and settled recovery. Idle hit art and the explicit old
baseline remain. Eight256px painted source cells are legitimate existing art;
no in-between anatomy, professional motion completion or new art is claimed.

Authorized encounter design improvement (ADR0049): phase2 strafes between
attacks; warnings use80% of phase1 duration (actual minimum .92s), with complete
stationary recovery retained. A .2s prediction capped72u is frozen when the
warning begins. Fan expands6→10 lanes around the same safe center gap; renderer
and simulation share the lane list and warning duration. No HP/invulnerability
increase. One nearby owned specialized outpost may receive a12s warned raid using the existing model on phase2 entry; no replacing another raid, remote targeting or immediate
damage. Existing spawned units, HP, repair and repel logic own consequences.

Usability/presentation: contextual F-ready prompt during nearby combat until
first power use; Q/E/R/M reminder after establishing a base. No forced tutorial
or manufactured usage. Friendly painted projectiles retain authored family/
Origin frames but have family-dependent aspect ratios; hostile art, collision
radii, high-contrast and reduced-effects paths remain intact. Floating primary
rig and actual muzzle ownership are preserved rather than fabricated duplicates.

Content20→21 intentionally versions changed encounter traces. Worldgen3,
Save2 and child-law content18 stay pinned. Updated version/timing assertions
document that intentional contract; no tests or acceptance gates removed.

## Verification and measurements

Before/after captures at720/1080/2550x1272 EN/TH use staged existing hooks and
live outside disposable browser output in test-results/v43-visible. Their build
identity/dirty state is explicit. Screenshots are not physical scanout evidence.
Existing POI border regression checks canonical discovery, draw submission and
actual screenshot pixel differences; CPU post-render timestamps are not GPU or
monitor presentation latency. The tested border case produced2912 changed site pixels and1.2ms CPU
post-render observation; this is not physical display latency. No invented worldgen
fix. Worker terrain readiness is independent of the immediate POI ground/art pass.

Baseline Natural36 recorded36 replay-equal observations at loaded7847d7b:
29 reached Boss,26 won,0 player deaths,425 committed attacks. Seven unreached
and three reached-but-not-won cases remain. The Vitest process reported one
onTaskUpdate RPC timeout after long synchronous computation: these observations
are retained, not called a clean test PASS. before-natural36.json contains all
36 outcomes and the error. A yield between candidate and replay computations
addresses runner event-loop starvation without changing sim or time thresholds.
Final exact-source CI runs the established Natural36 once; its outcomes and
baseline comparison belong in the final PR receipt, not a source-changing
documentation commit just to record CI state. New outpost counters in the
existing observer cover only the boss window; older absent counters stay null.

Targeted boss/pose suites and EN/TH parity are run during implementation. Final
check/build completes before browser execution; no concurrent dist mutation.
Exact command outcomes, CI URLs, seed-level failures and final counts follow in
the consolidated PR. No predetermined Boss-win or player-death percentage.

Native performance remains inconclusive: the human66.50ms sampled worst frame,
2.72ms sim step and14.90ms boss CPU-submit p95 at48Hz are separate metrics. No
controlled physical host or causal GPU evidence justifies a renderer rewrite or
a fresh24-case matrix. Parsec is not stopped; strict budgets remain unchanged.

## All33 owner issues

Each status is limited to its evidence. Automated coverage does not close a
human complaint. Evidence labels: U=targeted unit, B=targeted browser/capture,
N=Natural36 including unreachable/failure rows, H=owner retest still required.
Before/after source identities and final receipts are on the campaign PR.

| # | Disposition | Actual source | Before → change / reason | Verification / remaining |
|---|---|---|---|---|
|1|IMPROVED_PENDING_HUMAN|GameScene, campaign PR|Fragmented requests → one coherent campaign|Full checks; H overall quality|
|2|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Uniform shot ratios → distinct family ratios, same real Origin frames|B; H identity|
|3|REPRO_NOT_CONFIRMED|game/render/WorldRenderer.ts|Existing measured grounded sites retained; no blind enlargement|B3 viewports; H scale|
|4|VERIFIED_EXISTING|core/emergence/outpostLogistics.ts|Canonical6/6/Later/Signal validation already live|outpostSoftlock B; H purpose|
|5|IMPROVED_PENDING_HUMAN|core/sim/RunSimulation.ts|Ordinary raid only → one bounded nearby phase2 siege|U/N; H defensibility|
|6|VERIFIED_EXISTING|game/scenes/GameScene.ts|Existing pins/effect previews retained|decision browser tests; H choice quality|
|7|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Same-sized friendly shots → role-specific aspect ratios|B; H cohesion|
|8|REPRO_NOT_CONFIRMED|game/render/ActorRenderer.ts|Existing camera/actor hierarchy retained|B3 viewports; H FOV|
|9|VERIFIED_EXISTING|styles.css, GameScene|Existing flow-layout boss/stats lane retained|B rectangle oracle; H aesthetics|
|10|REPRO_NOT_CONFIRMED|game/render/siteArrival.ts|Existing discovered-site draw path; no new delay cause proven|B real pixel difference + CPU observation; physical latency open|
|11|VERIFIED_EXISTING|core/world/poi.ts|Existing biome-weighted POIs retained|Worldgen tests; H strategic meaning|
|12|DEFERRED_WITH_REASON|game/render/TerrainPainter.ts|Existing baked periodic materials/worker pipeline retained|Source parity tests; new preferred terrain needs concrete artwork/reference|
|13|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Existing canonical rejection reasons retained|Outpost browser/unit; H clarity|
|14|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Space family emitters kept; shot proportions clarified|Emitter/browser tests; H impact|
|15|ART_SOURCE_BLOCKED|game/render/ReferenceAnimation.ts|Existing real poses; no continuous six-age anatomy source|Asset/source tests; original frames required|
|16|VERIFIED_EXISTING|game/render/HeroEquipment.ts|One accepted floating mount and canonical muzzle retained|weaponMuzzle/release tests; H smoothness|
|17|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Similar cadence → strafe, bounded lead, denser fan, nearby siege|U/N; H challenge/fairness|
|18|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Legacy/family inheritance already live|Ascension/World2 tests; H replay interest|
|19|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Space throughout Draft already guarded|Queued/focused/repeat B; H original complaint|
|20|IMPROVED_PENDING_HUMAN|GameScene, i18n/en.ts, th.ts|No observed F use → contextual ready prompt|EN/TH B; H discoverability|
|21|VERIFIED_EXISTING|game/ui/NotificationManager.ts|One encounter slot/priority fix already in7847|Notification + boss B; H obstruction|
|22|VERIFIED_EXISTING|scripts/qa-sink.mjs|117/118 terminal; late91 rejected as latest|Actual private provenance + sequence tests; no ratings invented|
|23|REPRO_NOT_CONFIRMED|GameScene.refreshGround, siteArrival.ts|Canonical-discovery/explored-chunk boundary already fixed|POI screenshot pixel oracle; physical latency unknown|
|24|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Held/repeated/focused Space already blocked during Draft|inputContext/decisionBoundary B; fresh Dash retained|
|25|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts, hostileArt.ts|Real hostile sources preserved; friendly family shape separation improved|B/HC regressions; H threat clarity|
|26|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Physical release/context/blur guard already live|Draft/Pause/Tech/Civ/blur B plus new EN/TH picker case; H original failure|
|27|REPRO_NOT_CONFIRMED|game/render/VisualLanguage.ts|No universal multiplier or changed collision size|B3 viewports; H perceived size|
|28|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Phase2 pattern labels → actual strafe/lead/fan/siege escalation|U/N; H perception|
|29|DEFERRED_WITH_REASON|HeroEquipment.ts, core/combat/weaponGeometry.ts|One authoritative primary rig; no per-extra-weapon muzzle model|Existing float foundation retained; extra weapons need explicit canonical emitter design|
|30|REPRO_NOT_CONFIRMED|GameScene.refreshGround, TerrainPainter.ts|Sites drawn independently of asynchronous terrain preparation|POI pixel/arrival B; no physical latency certification|
|31|FIXED_ENGINEERING|game/render/paintedBossPose.ts|Continuous hit pose/jitter hides attacks → action pose + tint|2 RED→GREEN regressions; H art/pixel preference still open|
|32|IMPROVED_PENDING_HUMAN|RunSimulation, SimEvent.ts|No boss-directed outpost pressure → one real nearby warned siege|U/N, existing repair/defense; H meaningful response|
|33|IMPROVED_PENDING_HUMAN|bossEncounter.ts, BossTelegraph.ts|Pure snapshot aim → bounded pre-warning prediction, frozen afterward|U shared warning/shot geometry; H fairness|

## Owner retest and blockers

Open the existing Play-SEED-QA.bat in the primary owner checkout after final
verification; use its existing report/watcher workflow. Play Golden001/Hunters
with actual F and optional squad/base controls, observe both boss phases, leave
a warned attack and defend/repair a threatened nearby base. Do not use debug
grants or phase skips in a clean test. Record actual stopping point, interruptions,
seed/build, challenge, phase readability, outpost agency, weapons, controls and
enjoyment. Zero tool-manufactured ratings; no HUMAN_FUN_PASS inferred.

ART_SOURCE_BLOCKED specification: original painted full-body frame sequences
matching the current six-age hero/enemy silhouettes, transparent edges, measured
foot/grip anchors, walk/idle/windup/release/recovery/hit/death poses with timing
and licensing/source files. Existing256px boss cells support the current240u
presentation; higher-detail enlargement requires genuine higher-resolution
painted cells, not upscaling or a rejected replacement rig. Native60Hz validation
requires a controlled host; a48Hz trace cannot certify strict60FPS acceptance.
Next campaign should use actual retest findings and delivered source animation,
not another speculative content subsystem. No external research dependency here.
