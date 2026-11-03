# V4.5 — Core quality owner decision packet

## Source and scope
Verified primary owner checkout C:\Users\MewMew\Desktop\Co-op\-SEED. The pasted Co-op-SEED path is not used. Starting tracked tree clean, HEAD c12c8f71111a87b29b58ddbc2e5f310ae49ca7ee, branch/upstream feat/v44-retention-defense-20261103, Draft PR35 open. New branch feat/v45-core-quality-20261103 descends directly from that HEAD. Original untracked .cursor/ and Play-SEED-QA.bat remain private and unstaged. No old v39 checkout, main merge, deployment, publication or force push.

Worldgen3 / Content24 / Save3 / child laws18. No core/content/controller/save/reward changes, dependencies or threshold changes. A presentation-focused campaign is justified by reproduced failures; no new human V4.4 feedback warrants speculative boss balance or new systems. Exact final SHA, CI and ZIP receipts belong in the Draft PR, avoiding a source change after verification.

## Player-visible changes and evidence
|Area|Before → after|Status / verification|
|---|---|---|
|Keyboard collection|Equip replaces the focused DOM node → focus restored to the same Equip/Unequip control, saved state retained|FIXED_ENGINEERING; reproduced EN/TH RED, same browser case GREEN|
|Map defense|Only ordinary raids in ledger/detail/map → actual active boss assault has a named base, remaining assault time, square marker and dashed physical boss-to-base line|FIXED_ENGINEERING; EN/TH RED→GREEN; clicking remains focused, canonical snapshot unchanged|
|Boss rhythm|Assault destination alone → separate current strike label (base vs player), preserving the committed strike when the cycle increments at fire|IMPROVED_PENDING_HUMAN; boundary tests, no AI/rhythm/damage changes|
|Origin|Generic first-use F prompt → named ability and situational advice; can recur after first use for crowd/near Nova targets, real boss recovery, or low health respectively|IMPROVED_PENDING_HUMAN; actual cooldown respected, Nova uses canonical radius; optional only|
|Outposts|Role/benefit/price run together → structured role, actual bonus, tactical purpose and price; same Later/Escape and canonical affordability including Signal exemption|IMPROVED_PENDING_HUMAN; existing logistics6/6 regressions retained|
|Evolution/Tech|Current weapon stats already live → age milestone additionally shows observed previous→current active weapon names; already evolved/inactive families gain no fake transition|IMPROVED_PENDING_HUMAN; pure delta tests; canonical Tech effect previews retained|
|Cosmetics|Star/Chronicle identical triangles, colored HC → distinct authored geometric silhouettes shared by preview and world; HC white outlines|FIXED_ENGINEERING geometry/HC; art preference pending; no invented anatomy|
|Collection|Five cards without direction → earned count, suggested next actual unlock rule, persistent distinct-Origin Bronze count|IMPROVED_PENDING_HUMAN; same five rewards, no inventory/RNG/grants|
|Chronicle|Only current collection state → lists newly saved collectible IDs from this attempt, including its worlds, after real reward events|IMPROVED_PENDING_HUMAN; transient presentation only, no fabricated historical dates|

Visible artifacts: test-results/v45-visible/collection-en.png, collection-th.png, base-threat-en-1.png, base-threat-th-1.png (plus -2 for200% UI); CI uploads these. Staged browser fixtures are engineering evidence, not clean natural progression, native performance or human acceptance. Initial RED logs/traces preserved locally under scratch/v45-*-red.log and scratch/v45-red-browser/. No private human reports uploaded.

## Existing systems retained / scope decisions
VERIFIED_EXISTING: free claims, canonical specialization/Signal exception, Tech DAG/stat previews/synergy, world laws and biome POI weights, four powers/loadouts, real base HP/loss/repair, warning geometry and complete recovery, C24 geography and bounded assaults, six-age weapon evolution, actual Ascension/World2, Insight/Save3 and exactly-once earned collection. Combat variety remains existing archetypes/families/elite modifiers: optional Origin cues and base-threat information expose existing choices. No ecology/director scaffold activated, duplicate emitter or resource economy.

HUMAN_RETEST_REQUIRED: whether choices, travel, defense, boss rhythm, replay and perceived power are enjoyable. Owner baseline fun remains1/5. No old human complaint closed merely from automated tests. New recurring advice is a UI heuristic, not a new canonical ability condition. Multiple floating weapons require explicit emitter ownership and are DEFERRED_WITH_REASON, rather than drawing fake damaging equipment. Additional canonical balance is DEFERRED_WITH_REASON pending an actual V4.4/V4.5 natural-session observation.

## Natural36 and performance
No canonical or controller delta in this campaign. Baseline V4.4 historical29/36 reached,23 wins,3 deaths; defender-aware29/36 reached,25 wins,2 deaths. Boss-only base damage1715/1525, boss-window losses5/4. Travel/engagement/damage and all non-wins are in PR35's full36-case receipt; no new metrics inferred from UI changes. Final inherited CI runs the independent policies; compare exact-source artifacts against c12 before stating equality. If CI differs, preserve and investigate. Do not substitute defender-aware for historical or optimize win percentages.

Strict native60Hz remains HUMAN_RETEST_REQUIRED/uncontrolled hardware. UI screenshots and synthetic WebGL submission counts do not measure GPU completion/presentation or a physical monitor. No remote/Parsec changes, threshold changes, or broad render rewrite without a reproduced high-cost path. Added cosmetic segments are static bounded arrays, no textures/actors/tweens created per frame. All performance CI measurements remain visible, including failures.

## All33 inherited complaints
The following is the V4.4 engineering ledger, preserved without promoting human acceptance. V4.5 additions above extend1/5/18/20/26/28/32 and decision clarity6/13. Rendering15 remains ART_SOURCE_BLOCKED; terrain12 and extra emitter29 stay deferred. Source locations in inherited rows refer to the parent implementation, not claims that V4.5 changed core.

|ID|สถานะ|จุดตรวจ|พฤติกรรม/ข้อจำกัดเดิม|หลักฐาน/งานค้าง|
|---|---|---|---|---|
|1|IMPROVED_PENDING_HUMAN|GameScene, campaign PR|Fragmented requests → one coherent campaign|Full checks; H overall quality|
|2|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Uniform shot ratios → distinct family ratios, same real Origin frames|B; H identity|
|3|HUMAN_RETEST_REQUIRED|game/render/WorldRenderer.ts|Existing measured grounded sites retained; no blind enlargement|B3 viewports; H scale|
|4|VERIFIED_EXISTING|core/emergence/outpostLogistics.ts|Canonical6/6/Later/Signal validation already live|outpostSoftlock B; H purpose|
|5|IMPROVED_PENDING_HUMAN|core/sim/RunSimulation.ts|Ordinary raid only → actual boss base assault sharing HP/repair|U/N; H defensibility|
|6|VERIFIED_EXISTING|game/scenes/GameScene.ts|Existing pins/effect previews retained|decision browser tests; H choice quality|
|7|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Same-sized friendly shots → role-specific aspect ratios|B; H cohesion|
|8|HUMAN_RETEST_REQUIRED|game/render/ActorRenderer.ts|Existing camera/actor hierarchy retained|B3 viewports; H FOV|
|9|VERIFIED_EXISTING|styles.css, GameScene|Existing flow-layout boss/stats lane retained|B rectangle oracle; H aesthetics|
|10|HUMAN_RETEST_REQUIRED|game/render/siteArrival.ts|Existing discovered-site draw path; no new delay cause proven|B real pixel difference + CPU observation; physical latency open|
|11|VERIFIED_EXISTING|core/world/poi.ts|Existing biome-weighted POIs retained|Worldgen tests; H strategic meaning|
|12|DEFERRED_WITH_REASON|game/render/TerrainPainter.ts|Existing baked periodic materials/worker pipeline retained|Source parity tests; new preferred terrain needs concrete artwork/reference|
|13|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Existing canonical rejection reasons retained|Outpost browser/unit; H clarity|
|14|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Space family emitters kept; shot proportions clarified|Emitter/browser tests; H impact|
|15|ART_SOURCE_BLOCKED|game/render/ReferenceAnimation.ts|Existing real poses; no continuous six-age anatomy source|Asset/source tests; original frames required|
|16|VERIFIED_EXISTING|game/render/HeroEquipment.ts|One accepted floating mount and canonical muzzle retained|weaponMuzzle/release tests; H smoothness|
|17|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Similar cadence → strafe, bounded lead, denser fan, actual base assault|U/N; H challenge/fairness|
|18|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Legacy/family inheritance already live|Ascension/World2 tests; H replay interest|
|19|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Space throughout Draft already guarded|Queued/focused/repeat B; H original complaint|
|20|IMPROVED_PENDING_HUMAN|GameScene, i18n/en.ts, th.ts|No observed F use → contextual ready prompt|EN/TH B; H discoverability|
|21|VERIFIED_EXISTING|game/ui/NotificationManager.ts|One encounter slot/priority fix already in7847|Notification + boss B; H obstruction|
|22|VERIFIED_EXISTING|scripts/qa-sink.mjs|117/118 terminal; late91 rejected as latest|Actual private provenance + sequence tests; no ratings invented|
|23|HUMAN_RETEST_REQUIRED|GameScene.refreshGround, siteArrival.ts|Canonical-discovery/explored-chunk boundary already fixed|POI screenshot pixel oracle; physical latency unknown|
|24|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Held/repeated/focused Space already blocked during Draft|inputContext/decisionBoundary B; fresh Dash retained|
|25|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts, hostileArt.ts|Real hostile sources preserved; friendly family shape separation improved|B/HC regressions; H threat clarity|
|26|VERIFIED_EXISTING|game/ui/DecisionInputBoundary.ts|Physical release/context/blur guard already live|Draft/Pause/Tech/Civ/blur B plus new EN/TH picker case; H original failure|
|27|HUMAN_RETEST_REQUIRED|game/render/VisualLanguage.ts|No universal multiplier or changed collision size|B3 viewports; H perceived size|
|28|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Phase2 pattern labels → actual strafe/lead/fan/base-assault escalation|U/N; H perception|
|29|DEFERRED_WITH_REASON|HeroEquipment.ts, core/combat/weaponGeometry.ts|One authoritative primary rig; no per-extra-weapon muzzle model|Existing float foundation retained; extra weapons need explicit canonical emitter design|
|30|HUMAN_RETEST_REQUIRED|GameScene.refreshGround, TerrainPainter.ts|Sites drawn independently of asynchronous terrain preparation|POI pixel/arrival B; no physical latency certification|
|31|FIXED_ENGINEERING|game/render/paintedBossPose.ts|Continuous hit pose/jitter hides attacks → action pose + tint|2 RED→GREEN regressions; H art/pixel preference still open|
|32|IMPROVED_PENDING_HUMAN|RunSimulation, SimEvent.ts|Boss walks to a named owned base and damages it only through actual warned attacks|U/N, existing repair/defense; H meaningful response|
|33|IMPROVED_PENDING_HUMAN|bossEncounter.ts, BossTelegraph.ts|Pure snapshot aim → bounded pre-warning prediction, frozen afterward|U shared warning/shot geometry; H fairness|


## Missing source-art inputs
ART_SOURCE_BLOCKED: genuine painted six-age anatomy/Fashion. Produce original licensed transparent full-body frames for four Origins × six ages, with idle/walk/turn/windup/release/recovery/hit/death, frame timing, foot/grip/muzzle anchors and layered editable originals. For boss, provide matching-resolution authored poses with a stable body scale/pivot; current boss-v2 atlas uses authored256px cells. Deliver an atlas manifest (cell coordinates, intended world size, frame duration, action phase), license/source/checksum and EN/TH preview sheet. No enlargement is claimed to create detail. New V4.5 collection symbols are bounded vector ornamentation, not painted costume completion. Research is not needed for the changes shipped here.

## Verification contract and negative evidence
Initial RED:2 geometry/HC unit failures and4 browser failures (EN/TH focus and missing boss-map marker). Focused geometry/intent/opportunity/evolution GREEN5 tests; first focused browser13/13 passed, including original pause no-scroll (TH1280×720 client=scroll675px; EN1080p783px) and World2 collection. Further final-source results and exact CI belong in the PR receipt. Run full check once after source freeze, full appropriate Playwright, analyze, sequential ZIP and release:verify. There is no npm run release script; release:verify validates the local package and does not publish.

## Clean owner protocol / decision
1. Close the old QA server window or Ctrl+C yourself; don't reuse an existing old-build process. Double-click C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat. Browser must open http://127.0.0.1:5173/?qa=1. Record shown build SHA/seed/Origin/viewport/UI scale. Original launcher/reporting preserved.
2. Play naturally without review/debug grants. Try two different Origins over two attempts. Observe first ability opportunity, Tech before/after, age form change and Dawn/Prism progress. Claim a real base, choose a role, inspect6/6 Later/Signal behavior as naturally encountered. Log any interruption, not a clean pass.
3. During a real boss assault use M: compare named target/HP/time with the world; observe base/player strike labels, dodge, intercept and punish recovery. Log actual base loss/repair, unfair or empty-travel intervals. No staged reward is human evidence.
4. Equip/unequip with Tab/Space, check same focus and persistence, inspect HC/reduced effects, Chronicle actual earned list and World2 appearance. Thai default720p pause must stay usable; larger scales may use accessible scrolling.
5. Supply actual1–5 scores: fun, combat feel, visible evolution, meaningful Tech choices, base defense, boss encounter, replay interest; desire another run Yes/No. Include seed/build, death/quit point and one concrete frustration. No default scores or HUMAN_FUN_PASS.

Next owner decision: accept/reject specific visible changes after natural play; then choose the most harmful observed loop issue or commission the source-art packet. Engineering verification alone is not Playable Alpha fun acceptance. No merge/release/deploy is authorized.

## Screenshot-discovered map layout regression
The first73-case browser run passed text/state checks, but manual raster inspection showed the selected base detail and Back control below the720p viewport. New EN/TH viewport assertions reproduced2 failures against that build; logs/traces preserved in scratch/v45-map-layout-red*. The civilization map now uses a bounded two-pane layout, selected detail before ledger, independently scrollable information and a fixed visible Back control; narrow screens stack accessibly. Add100%/200% EN/TH cases. Original73-case result is pre-layout evidence; latest focused layout/input/paused-state checks and final exact-source CI decide the new candidate. No threshold lowered, test removed or source-art completion claimed.

## Final layout raster check
Post-layout focused browser24/24 PASS:claim/Tech/Draft/control paths, original EN/TH pause/World2 and100%/200% boss-map views. Inspected Thai1280x720 rasters:actual base status visible beside the map and Back fixed inside the viewport;200% preserves large text with independent information scrolling. Simultaneous boss/raid countdowns now have separate labels. Public negative record:docs/evidence/v45-red-regressions.json. Final frozen check, six direct UI cases and exact-source CI receipts remain in the Draft PR; do not transfer the pre-layout73 cases as final frozen-source proof.
