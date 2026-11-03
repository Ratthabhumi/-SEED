# V4.6 — Combat & Civilization Field Feedback

## สถานะและต้นทาง
เริ่มจาก9be405c9d20ddc72971c0ff4587909a9439c7bdc / DraftPR36 บน feat/v45-core-quality-20261103, tracked tree สะอาดใน C:\Users\MewMew\Desktop\Co-op\-SEED มี .cursor/ และ Play-SEED-QA.bat ไม่ติดตามไว้เดิม สาขาใหม่ feat/v46-combat-defense-20261103 ต่อจาก HEAD จริง; ไม่ใช้ path พิมพ์ตกหรือ v39 worktree ไม่ merge/release/deploy/force-push

คำสั่งเจ้าของในไฟล์แนบเป็นขอบเขตงาน Research มาจาก ChatGPT แล้ว ไม่ค้นภายนอก ใช้ source inspection/TDD กับหนึ่ง whole-branch code review รางวัล/ภาพ/ความสนุกไม่ถูกรับรองด้วย CI คะแนนสนุกเดิม1/5 ไม่มีคำตอบใหม่

## งานที่ผู้เล่นเห็นในสนามจริง
|ระบบ|ก่อน → หลัง|เกณฑ์/สถานะ|
|---|---|---|
|Hit confirmation|Reduced Effects ตัด impact ทั้งหมด → hit จริงมี tick เล็กคงที่/กรอบ shield ไม่มี particles/texture flash; damage0ไม่แสดง hit|FIXED_ENGINEERING เมื่อ RED→GREEN และ final CI ครบ|
|Impact/ยุค|Impact/muzzle ใช้ tier0 → material/รูปทรงใช้ weaponStage จริง ณเวลา contact/fire; projectile birth, damage และ muzzle transform ไม่เปลี่ยน|IMPROVED_PENDING_HUMAN; ทดสอบ Hunters stage0/5 ต่าง geometry ไม่แก้ event|
|เห็นการโจมตี|ภาพ impact ใหญ่/สว่างทับใจกลาง → raster เดิมเบาลงและเล็กลง ไม่มี white fill กลางตัว เหลือเส้น family/shield อ่าน pose เดิมได้|IMPROVED_PENDING_HUMAN; ไม่มีการผลิต anatomy หรือแทน action pose|
|เสียง|มี fire/kill แต่ไม่เชื่อม actual impact → family/shield impact จาก resolved damage จริง เลือกหนึ่ง cue ต่อ batch จำกัด75ms และ voice cap8เดิม|FIXED_ENGINEERING routing/limits; คุณภาพเสียงต้องฟังจริง ไม่ถือว่าทดสอบความไพเราะ|
|ฐานในสนาม|ต้องเปิด map เพื่อดู HP → damaged/disabled base มี HP bar จากค่าจริง; แสดงเขต economy และเครื่องหมาย+เมื่อฟื้นพลังได้จริง|IMPROVED_PENDING_HUMAN; range800ใช้ constantเดียวกับ canonical function, ไม่เพิ่มการ heal|
|ผลป้องกันฐาน|ข้อมูล loss/repair อยู่ใน HUD → world-space confirmation จาก boss hit/loss/repair event จริง; เก็บ HP/การเสียโบนัส/ซ่อมเดิม|IMPROVED_PENDING_HUMAN; ทดสอบ actual warned boss assault ทำลายฐาน1HPที่จัดฉาก และ canonical repair กลับมาฟื้นพลัง|
|Evolution/Breakthrough/Phase2|มี toast/ชื่อเดิม → bounded world-space beat ตำแหน่งจริง ใช้ canonical elapsed, pause/หมดอายุ/resetตามโลก|IMPROVED_PENDING_HUMAN; ไม่สร้างอาวุธหรือ damage emitter เพิ่ม|

การเพิ่มนี้เป็น feedback และ affordance ที่ใช้งานระหว่างต่อสู้/ยืนป้องกันฐาน ไม่เพิ่มข้อความ HUD เป็นหลัก เป้าหมายคือให้รู้ว่าโจมตีโดนอะไร เปลี่ยนยุคแล้วเครื่องมือเปลี่ยน และฐานเสียมีผลต่อการฟื้นพลังจริง ความสนุกยังต้องวัดจากเจ้าของ

## กฎเกมและความเข้ากันได้
Worldgen3 / Content24 / Save3 / child laws18 คงเดิม Core เปลี่ยนเพียงดึง literal800เป็น ECONOMY_REGEN_RADIUS แชร์กับ renderer; เงื่อนไข <=800, rate, tier และ biome multiplier เดิมทั้งหมด ไม่มี balance/AI/HP/Damage/boss cadence, director, rewards, controllers หรือ save schema ใหม่ ต้องเทียบ72เคสจากสองนโยบายแยกกันใน final exact-source CI และคงทุก non-win

VERIFIED_EXISTING: floating primary/actual release rig, authored age/weapon framesเดิม, Tech DAG/stat preview/synergy, สี่พลัง Origin/คำสั่ง squad, bounded C24 boss phase/target/assault/recovery, free claim/Logistics6/6/Later/Signal, Insight/five collectibles/World2, input boundary, camera/reduced/HC settings ระบบเหล่านี้ใช้ต่อ ไม่สร้าง engine/inventory ซ้ำ

ไม่ทำ cosmetic hit-stop เพราะยังไม่มี presentation-clock contract ที่รับรองว่าค้างภาพแล้ว muzzle/telegraph/input จะสัมพันธ์กัน ไม่เปลี่ยน simulation timescaleเพื่อความสวย ไม่ขยายทุก actor ไม่เพิ่มความยากจาก HP/Damage หรือปรับ win rate ตาม bots การรับ/เสียฐานและการฟื้นพลังมาจากระบบเดิมทั้งหมด

## ภาพที่ยังต้องผลิตและอาวุธหลายชิ้น
ART_SOURCE_BLOCKED: docs/art/V46_ANIMATION_PRODUCTION.json ระบุ4 Origins ×6 Ages ×8 actions =192ชุดท่า, อย่างน้อย816framesต่อdirection, front/back, source512×512โปร่งใสและeditable, foot anchor(.5,.875), measured grip/muzzleต่อframe, timing preview/normalized canonical phase, license/provenance/checksum และ contact sheet ตาม3ขนาดจอ มี sourceFramesProduced=0 ชัดเจน ตัวเลขเหล่านี้เป็น production request ไม่ใช่ภาพที่สร้างเสร็จ

Boss atlas เดิม1024×512 ช่อง256px และ reference animationเดิมที่ตรวจแล้วใช้ต่อ ไม่อ้าง upscale เป็น hi-res หรือดัดภาพไม่กี่เฟรมเป็น anatomy ครบหกยุค

DEFERRED_WITH_REASON: หลาย orbiting primary ยังไม่มี emitterId/rig pose/shot ownership ต่อ instance ที่บันทึก replayได้ การทำต่อจำเป็นต้อง1)ระบุตัวตน weapon instance2)ผูก PrimaryRelease/SimProj กับเจ้าของจริง3)ให้ทุกinstanceมี canonical birth/muzzle/heading/stage4)renderจากข้อมูลเดียว5)ทดสอบ snapshot/RNG/World2/version compatibility ไม่วาดอาวุธปลอมที่ไม่มี emitter ศัตรู/guardian/field emitters เดิมแยกจาก primaryอยู่แล้ว

## Performance และหลักฐาน
Impact32/beam8/raster8 และ world beats8เป็น pool คงที่ มิติ/อายุ/เสียงมีขอบเขต ไม่มี tween/anatomy loopหรือ per-hit texture upload เส้น support boundary แสดงเฉพาะฐาน economy ที่ใกล้ที่สุด, healthbarเฉพาะฐานเสียหาย/disabled ไม่มีการแก้ remote/Parsec หรือเกณฑ์ CI

แยก simulation / renderer CPU submit / frame interval / GPU completion /physical presentation เสมอ ~48Hz environment ของเจ้าของยังไม่รับรอง strict native60Hz screenshotและCIไม่ทดแทนการวัดจอจริง ต้องใช้ผล job/negative samples จริง ไม่ซ่อนค่าล้มเหลว

## Negative evidence และ review
RED semantic2กรณีจาก parent: reduced hit0แทน1 และ zero damage impact1แทน0; เพิ่ม RED toggle mine→reducedแล้วแสดงhitเทียม ก่อนแก้ให้detonationไม่เป็นhit mark ขยายทดสอบ tier geometry/read-only lifecycle, actual800 edge, audio coalescing/gate, world beat expiry/reset

การเปลี่ยน unit expectations2แห่งของเดิมมีเหตุผลตรง contract: Reduced Effects ต้องคง static actual hit แต่ปิด mine expansion/particles ไม่ลบทดสอบหรือผ่อน capacity/state equality

Local browser ครั้งแรกเริ่มก่อน buildเสร็จ ทำให้preview timeout เก็บเป็น harness failure ไม่ใช่เกมผ่าน รอบถัดมา6/8ผ่าน อีกสองรายการคือ startup15s timeout และ testตั้งReducedผ่านpauseแต่naturalDraftกำลังครองEsc เก็บไว้ทั้งหมด แก้ fixtureให้seedsettingก่อนเริ่ม ไม่แก้input guardหรือเพิ่มtimeout

Whole-branch reviewหนึ่งรอบพบ P2 assertiongap: direct-disableไม่ทดสอบoutpost_lost และ<=8ยอมรับ0 แก้หนึ่งpassเป็น actual canonical boss attack/repair พร้อม positive impacts/beats ก่อน expiry จัดฉากbase1HP/HPสำหรับสังเกตhealอย่างเปิดเผย ไม่มีการใช้เป็นHuman QA/Natural policyผลลัพธ์

Final frozen check/analyze/browser/package/CI และ row comparisons อยู่ใน receiptของ Draft PR เพื่อตรึง source ไม่ commitวนตามผลCI เก็บ failed logs/tracesในscratch/v46-* และ publicnegative summaryที่ไม่มี private QA

## สถานะ33ข้อเดิม
คง ledger จากV4.5ครบทุกข้อ ไม่อัปเกรดเป็น HUMAN_FUN_PASS จาก tests V4.6ขยายข้อ5/7/14/17/20/25/28/32ด้านhit/เสียง/ภาพสนาม/ฐาน ส่วน control/POI latency/ขนาด/terrain/ภาพต่อเนื่องยังต้องทดสอบมนุษย์ตามเดิม

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



## วิธีเปิดและ Human acceptance
ปิด QA Server เดิมด้วย Ctrl+C แล้วเปิด C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat ตรวจ SHAจาก final receipt เปิด http://127.0.0.1:5173/?qa=1 ใช้ build/seed/Origin/viewport/UI scaleเดียวในการบันทึก ไม่ใช้ review/debug grants แล้ว END PLAYTEST ตามระบบเดิม

ลองหนึ่งรอบธรรมชาติ Golden001/Hunters ฟัง hitต่างจากfire/kill, ดูshield/HP, ลองReduced/HC, เปลี่ยนยุค/รับBreakthroughแล้วสังเกตเครื่องมือจริง เลือกeconomyเมื่อเจ็บและสังเกตขอบเขต/การฟื้น เลือกmilitary/researchตามbuildเดิม สกัดbossที่ฐานจริงและสังเกตHP/loss/repair ต่อWorld2และของสวม ถ้าค้าง/ใช้workaroundให้บันทึกINTERRUPTED_BY_BUG

ให้คะแนนจริง1–5:สนุก,combat feel,visible evolution,Tech choices,base defense,boss,replay interest และอยากเริ่มอีกรอบ Yes/No พร้อมจุดติดขัด/seed/build อย่ากรอกคะแนนแทนเจ้าของ งานถัดไปตัดสินจากการเล่นจริงและsource art/native performance gates ไม่เพิ่มระบบใหญ่เพียงเพื่อจำนวนฟีเจอร์

## Actual render ownership correction
Raster inspection plus source confirmed combat Graphics depth0 below enemy images. Active pool counts alone did not prove visibility. Added a browser RED (received0, expected depth>6), then one fixed Graphics layer at38 for contact/milestone ink; beams/muzzles keep their existing layer. Browser now asserts actual foreground depth and nonempty Graphics command buffer alongside positive canonical impact and frozen state. This costs one bounded Graphics object, no new textures. Final profiling/CI remain mandatory.

Targeted final ownership/actual-event browser8/8 PASS EN/TH all3 viewports including HC/reduced, canonical boss loss/repair and active foreground hit marks. Captured actual white contact ink visible over actor, no filled anatomy overlay. Command buffer stays bounded/equal across paused frames. Frozen final-source suite/CI results follow in PR receipt.

## Existing browser contract migration
Frozen runtime check624/117 and analyze6 PASS. The60-case relevant browser sweep retained two EN/TH failures:old Reduced Effects impact expectation0 received3 actual hits. Research-directed contract already requires minimal actual hit confirmation, so the existing browser assertions now require positive hits AND expiry, preserving actual HP damage, beam, pause, restart and all other checks. Only test/docs change after this sweep; runtime source remains identical. Final affected-file pass/exact-source full CI decide acceptance; do not relabel the failed sweep as60/60.
