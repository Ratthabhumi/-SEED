# V4.4 — แฟ้มตัดสินใจของเจ้าของเกม

สาขา feat/v44-retention-defense-20261103 ต่อจาก PR34/caeeb5d โดยตรง ในโฟลเดอร์หลัก Desktop/Co-op/-SEED; ไม่ merge main, release หรือ deploy ข้อมูล SHA/CI และผลจำลองสุดท้ายอยู่ใน receipt ของ Draft PR รอบนี้ เพื่อไม่เปลี่ยน source หลังตรวจ CI

| หัวข้อ | งานจริงและขอบเขต |
|---|---|
| บอส/ฐาน | เลือกฐานห่างบอสไม่เกิน1000u ห่างผู้เล่น1200u และในแนวป้อม1600u บุก12s แล้วกลับเข้าปะทะด้วย cooldown24s การหมดเวลารอจบคำเตือน/การโจมตี/พักก่อน ไม่มี teleport หรือความเสียหายระยะไกล |
| การรับรู้ | HUD แสดงชื่อฐาน HP ทิศ ระยะ และเวลาบุก พร้อมลูกศรนอกจอและปุ่ม F/Q/E/R/M จากเป้าหมายจริง |
| ผลลัพธ์การละทิ้งฐาน | ใช้ HP การเสียฐานและซ่อมเดิม เมื่อเป้าหมายเสียจะกลับเข้าปะทะแทนไล่ฐานใหม่ต่อเนื่อง ไม่มีฐานใกล้ก็สู้ตามปกติ |
| Evolution | คงภาพตัวละคร/อาวุธตามยุคที่มีอยู่ เพิ่มเครื่องหมายเติบโต6ระดับข้างตัว รายการ6ยุคในหน้าขึ้นยุค และตัวเลขพลังโจมตีพื้นฐาน/ช่วงโจมตีจาก weaponStage กับ build จริง การ์ดเทคโนโลยียังคง before/after ที่คำนวณผลจริง |
| ของสะสม | Dawn:ถึงสำริด; Ward:ป้องกัน raid สำเร็จ; Prism:ถึงสำริดด้วย2 Origins; Star:ชนะบอส; Chronicle:Ascend ทุกชิ้นได้จาก event จริง ไม่มีสุ่ม/เงินจริง/เพิ่มพลัง |
| การสวมใส่ | Preview/สวม/ถอดบนหน้าเริ่ม เมนูหยุด และผลรอบ สัญลักษณ์ติดตัวอยู่ข้ามโลก Trail อิงตำแหน่งกระสุนหลักจริง จำกัด12เส้นต่อภาพและปิดเมื่อ Reduced Effects; ไม่มี damage emitter เพิ่ม |
| เซฟ | Save3 ย้ายจาก1/2 เก็บ Insight/ของซื้อ/ประวัติ/ภาษาเดิม ป้องกัน ID ไม่รู้จักและของสวมที่ยังไม่ปลดล็อก รางวัลซ้ำไม่เพิ่มรายการ ไม่มีการเดาย้อนหลังจาก best stats เพื่อแจกของ |
| เป้าหมาย3รอบแรก | รอบแรกมีโอกาสได้ Dawn/Ward; เปลี่ยน Origin รอบต่อไปเพื่อ Prism; ชนะบอส/Ascend เพื่อ Star/Chronicle เป็นโอกาสจากความสำเร็จ ไม่บังคับแจกตามหมายเลขรอบ |
| การควบคุม | คง Space/Draft และการปล่อยปุ่มเดิม แก้ Tab ใน pause ให้เข้าถึง summary/checkbox/control ที่มองเห็นด้วย ไม่จำกัดเฉพาะปุ่ม |
| อาวุธ/ภาพ | คง floating primary และ muzzle/beam geometry เดิม ไม่มีระบบยิงซ้ำ/อาวุธปลอม คง hostile glyph, hit feedback และ source art ที่มีอยู่ งานรอบนี้ไม่ได้ผลิต painted anatomy ใหม่ |
| การจำลอง | historical responsive-route-planner-v2 ไม่แก้ไข เพิ่ม defender-aware-intercept-v1 แยกชื่อและผล: อ่านบอสจริง/แนวสกัดฐาน ใช้คำสั่ง Focus จริง บันทึกเดินไล่/อยู่ในระยะ acquisition800u ของ beam ที่เปิดใช้งาน/phase2/ฐาน/ability/command พร้อม replay ทุกเส้นทาง |
| ข้อจำกัด metric | acquisition800u ไม่ใช่หลักฐานว่าโดนเป้าหมายหรือ cooldown พร้อม การเดินไล่นับเมื่อเคลื่อนอยู่นอก800u ความเสียหาย/การเสียฐานของ policy ใหม่เป็นทั้งรอบ ต้องไม่สับสนกับ boss-only accepted damage |
| ความเข้ากันได้ | Worldgen3 และ child laws18 คงเดิม Content23 ระบุการเปลี่ยน encounter replay; Save3 มี migration แยกจากข้อมูลจำลอง |
| QA/หลักฐาน | เก็บผลล้มเหลวและทุก non-win; การทดสอบภาพจัดฉากไม่ใช่ Human Playtest; เก็บรายงานส่วนตัวและ launcher เดิม ไม่แก้ Recorder/Report contracts |
| ประสิทธิภาพ | ยังไม่รับรอง native60Hz: baseline2550×1272/~48Hz, sampled worst66.50ms, simulation2.72ms, Boss CPU-submit p9514.90ms เป็นคนละ metric ไม่มีการลดเกณฑ์หรืออ้าง GPU/presentation จาก screenshot |
| สถานะรับงาน | รอผล final-source check/browser/สอง cohorts/CI ใน PR receipt เพื่อกำหนด HUMAN_RETEST_READY; HUMAN_FUN_PASS ยังไม่เกิด คะแนนสนุกเดิม1/5 คงอยู่จนได้ feedback ใหม่ |

## สถานะปัญหา33ข้อเดิม

รหัสเดิมครบทุกข้อ VERIFIED_EXISTING หมายถึงหลักฐานทางวิศวกรรมเดิม ไม่ใช่เจ้าของรับรองความสวย/สนุก ข้อที่ทำซ้ำไม่ได้เปลี่ยนเป็น HUMAN_RETEST_REQUIRED ผล V4.4 เพิ่มอยู่ท้ายตาราง

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

V4.4 ขยายข้อ5/17/28/32 ด้วยกรอบบุกและการกลับเข้าปะทะ; ข้อ18/20 ด้วย earned collection กับคำแนะนำป้องกัน; ข้อ1/2/7/14/27 ด้วยเครื่องหมายยุคและการแสดงค่าจริง; ข้อ26 เพิ่ม keyboard traversal ของ pause ข้อ15ยัง ART_SOURCE_BLOCKED; ข้อ12/29ยังไม่ขยายระบบ ภาพและความสนุกทั้งหมดต้องผู้เล่นประเมิน

## งานภาพต้นฉบับที่ยังขาด

ต้องมีภาพ full-body ตาม6ยุค พร้อม idle/walk/turn/windup/release/recovery/hit/death, timing, foot/grip anchors, โปร่งใส และ source/license/checksum ที่ตรวจได้ บอสมี256px authored cells เดิม; ไม่ใช้ upscale หรือดัดภาพนิ่งเป็น anatomy ต่อเนื่องมารับรอง งานของสะสมรอบนี้เป็นสัญลักษณ์/เส้นเรขาคณิตที่เขียนเองประกอบภาพที่มีอยู่ ไม่ใช่ชุด Fashion painted ใหม่ ไม่ต้อง Research ตลาดเพิ่มเพื่อทำส่วนที่ส่งแล้ว

## เปิดเกมและทดสอบด้วยตัวเอง

ปิดหน้าต่าง QA Server เดิมหรือ Ctrl+C แล้วดับเบิลคลิก C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat เปิด ?qa=1 ตามระบบเดิม ไม่แตะ .cursor/launcher/รายงานส่วนตัว

เล่นธรรมชาติด้วย Golden001/Hunters: ถึงสำริดตรวจ Dawn, ป้องกัน raid ตรวจ Ward, ลอง F/คำสั่ง/M ตอนฐานถูกคุกคาม ช่วงบอสเลือกได้ว่าจะสกัดหรือโจมตีโดยตรง สังเกตว่าฐานเสียจริง/ซ่อมได้และบอสไม่พาวิ่งนานเกินไป รอบถัดไปลอง Origin อื่นถึงสำริดเพื่อตรวจ Prism แล้วชนะบอส/Ascend เพื่อตรวจ Star/Chronicle และการคงของสวมในโลก2/หลังเปิดเกมใหม่ ไม่มี debug grants ใน clean playtest

ส่งคะแนนจริงใหม่: สนุก/เห็น Evolution/สู้บอส/ป้องกันฐาน อย่างละ1–5 และอยากเล่นซ้ำ Yes/No พร้อม seed/build/จุดหยุด/การขัดจังหวะ ไม่เติมคะแนนหรือ HUMAN_FUN_PASS จากผลอัตโนมัติ

## Local verification before final source commit

Full check PASS:607 tests/108 files, typecheck, third-party notices and production build. First full check retained a schema2 expectation failure; the version assertion now follows SAVE_SCHEMA_VERSION while all data/Insight assertions remain. Focused initial browser16/16 passed; final sequential browser22/22 passed across EN/TH and720/1080/2550x1272, including keyboard collection entry, paused canonical equality under cosmetic/settings changes and actual canonical World2 transition/Chronicle unlock in the staged browser fixture. ZIP/release:verify PASS after sequencing.

One browser attempt failed because concurrent Windows Compress-Archive locked a served PNG (EBUSY) and Vite preview stopped. It is retained as a harness failure, not called a gameplay pass; the identical browser suite passed once packaging finished. No thresholds or tests removed. Final compiled artifact/CI/cohort receipts will identify the committed source in the Draft PR.

Previously protected7735-file set:7733 unchanged. Only mutable human-playtests/latest.json/latest.md pointers differ from the prior-session snapshot; those current pointers and all raw historical files are retained, not reverted or published. Additional newer private files were not enumerated by that older manifest. No claim that an existing QA process represents a clean V4.4 human session; owner must restart it.
