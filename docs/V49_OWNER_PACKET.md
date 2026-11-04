# V4.9 — จัดระบบ UX/UI และตรวจประสบการณ์หลัก

สถานะ: engineering candidate; ผลตรวจและ SHA สุดท้ายอ้างอิง receipt ใน Draft PR รอบนี้ ไม่ถือว่าแก้ครบ37ข้อหรือผ่านความสนุกแล้ว

## ฐานงานและขอบเขต

เริ่มจาก `f4cc34169bf89c4d2e3d70de405fcbd5a6e38050` / `feat/v48-build-rhythm-20261104` / Draft PR39 ใน `C:\Users\MewMew\Desktop\Co-op\-SEED` โค้ด tracked สะอาด สร้าง `feat/v49-unified-ux-20261104` จากฐานจริง ไม่ใช้ main เก่าหรือ worktree v39

รักษา .cursor, Play-SEED-QA.bat และ private QA รวม8174ไฟล์ มี hash ก่อนเริ่มและตรวจท้ายงาน ไม่เผยแพร่ raw QA/session identifiers ข้อมูลรายงานส่วนตัวล่าสุดยังอ้างอิง57df3d1 จึงไม่ยืมมาเป็นผล Human Acceptance ของ V4.8/4.9 คะแนนที่เจ้าของให้ยัง Combat1/5, Upgrade2/5 และอยากลอง Build อื่นแต่เกมยังไม่สนุกพอ

ไม่มี external research, framework/dependency ใหม่, ระบบเงิน/Inventory ซ้ำ หรือการ merge/release/deploy/force-push

## หน้าจอที่ Audit

ใช้ DOM จริงและภาพ TH720p ของ runtime ก่อน/หลัง พร้อม EN/TH/200% regressions เฉพาะส่วนที่เปลี่ยน หน้าที่ KEEP รักษาระบบเดิม ไม่ขยายงานเพียงเพื่อเพิ่มจำนวนไฟล์

|หน้าจอ/บริบท|การตัดสิน|หลักฐาน/การเปลี่ยน|
|---|---|---|
|Title/Main|CONSOLIDATE|Seed/Origin เดิมไม่หายเมื่อกลับ Settings; Help เข้าถึงได้; ปุ่มเล่นยังเป็น primary|
|Origin บน Main|CONSOLIDATE|ตัวเลือกแนวนอนกระชับ; รายละเอียดพลัง/แนวทางเปิดอ่านได้ ไม่เปลี่ยน loadout|
|Archive/Collection|CONSOLIDATE|ห้ารายการ canonical เดิม; แถวกระชับและรายละเอียดปลดล็อก; equip/focus/save เดิม|
|Settings|REMOVE_DUPLICATE|Main/Pause ใช้ settingsControls เดียวกันและ fresh Save3 transaction; volume/contrast มีทั้งคู่|
|Controls/Help|REMOVE_DUPLICATE|Guide เดียวกัน มีชื่อ dialog, Back/Escape, คืน focus; ปิด Help ไม่ resume เกม|
|Pause/ESC|REDESIGN|แยก Resume/Help/Run ออกจาก disclosure ของ Settings/Origin/clear-save; ไม่วาง Collection เต็มหน้า|
|Tech Draft|KEEP|สามการ์ด/ผล canonical/ตัวเลือก deliberate เดิม; ข้อความยาวยังใช้ scroll region เดียวและ Tab เข้าถึงปุ่มได้|
|Age advancement|KEEP|ภาพฉลองยุคเป็นข้อมูลแบบ timed beat; Expansion เป็น mandatory decision แยกกัน ไม่เปลี่ยนให้เกิด modal friction ใหม่|
|Civilization Map|CONSOLIDATE|แก้ POI สำรวจแล้วแต่ยังไม่ยึดหาย; รูปทรง+สี/legend/counts ใกล้ตัว; named optional dialog|
|POI Information|KEEP|context/approaching identifier เดิม; ทดสอบ P0 ก่อนเข้า chunk ไม่เปลี่ยน discovery/reward|
|Outpost claim/spec/upgrade|KEEP|Later/Close และ canonical validation เดิม; upgrade อยู่ในแผนที่/ledger ไม่สร้างหน้าซ้ำ|
|Combat HUD|KEEP|HP/เป้าหมาย/เวลา/ความรู้และ ability dock เดิม แยก lane บอส; theme tokens ร่วมกัน|
|Boss/Raid warnings|KEEP|immediate attack/target-base/HP/time แยกกันเดิม; ไม่เพิ่มเอฟเฟกต์บัง telegraph|
|Results/Chronicle|CONSOLIDATE|เพิ่มชื่อ dialog/initial heading focus/Tab boundary/Back-to-Main หลัง settlement เดิม|
|World2/Ascension|KEEP|Legacy→Origin/Expansion→child intro และกติกาเดิม; mandatory input guards เดิม|
|QA overlays|KEEP|ตรวจ gate/REC/F10 inspector; completion/report flow อยู่ใน existing QA E2E ไม่แก้ Recorder/Report contract|

รูปก่อน/หลังที่เปลี่ยนจริงอยู่ใน `docs/evidence/v49/` และ artifact ของ CI ภาพเป็น staged engineering evidence ไม่ใช่ natural human playtest หรือ physical performance measurement

Audit ครั้งแรกถ่าย Draft ที่แทรกจากรางวัลค้นพบ แต่ตั้งชื่อภาพเป็น POI/Map/Outpost เก็บผลนั้นไว้ใน scratch และไม่ใช้ยืนยันสามหน้านี้ รอบแก้ไข resolve การเลือกจริงและ assert ชื่อหน้าก่อนถ่ายครบ รวม Age/QA อีกชุด ไม่ปิดบังความผิดพลาดของ harness

## Design system และ input

ใช้ spacing/type/semantic colors/radius/focus tokens เดิม ปรับ panel, input, button และ collection surface ให้ใช้ร่วมกัน คง Thai line-height1.8 และ EN/TH parity ไม่มี global actor/FOV scaling หรือ asset upscaling ลบเฉพาะกฎ Pause Collection ที่ไม่มีผู้ใช้แล้ว ไม่กวาด CSS ที่ยังพิสูจน์ไม่ได้

Main มี view state ของ Seed/Origin; Settings/Guide ใช้ native keyboard navigation ที่คาดเดาได้ Shift+Tab จาก initial heading ไป Back ถูกแก้ด้วย RED→GREEN ปุ่ม/slider/checkbox มีชื่อเข้าถึงได้ Pause Settings มี volume/contrast/reduced/shake/language/scale ครบและเปิดเมื่อผู้เล่นต้องใช้ การบันทึกไม่สำเร็จแสดงข้อความจริงและคืนค่า slider

Mandatory Draft/Legacy/Origin/Expansion ยังคง DecisionInputBoundary และ modal queue เดิม ไม่ใช้ Escape helper สำหรับเมนู optional ไปปิด mandatory choice ปิด map กลับ gameplay ผ่าน boundary เดิม ไม่ย้าย focus ไปปุ่ม HUD ที่ Space อาจเผลอกดแทน dash

แผนที่ใช้ triangle=ผู้เล่น, diamond=ยังไม่สำรวจ/Boss(แยกสี), ring=สำรวจแล้ว, square=ฐาน, cross=ฐานสูญเสีย, stronghold ring พร้อม legend ที่มีสถานะ canonical ของบริเวณใกล้เคียง Visited ที่ยังไม่ยึดไม่หายและไม่ให้รางวัลซ้ำ โครงข่าย frontier ยังเชื่อมเฉพาะสถานที่ยังไม่สำรวจตามเดิม จุดที่ซ้อนผู้เล่นอาจซ้อนรูปกัน แต่เมื่อเดินออกจะยังมี marker และมี state count ให้อ่าน

## Core experience — สิ่งที่รู้และยังไม่รู้

**Core/content ไม่เปลี่ยน**: Worldgen3 / Content26 / Save3 / child18 คงเดิม กฎยิง/damage/HP/จำนวนศัตรู/cadence/Boss/อาวุธ/Origin/reward/RNG ไม่ถูกปรับเพื่อให้ UI ดูดีขึ้น

V4.8 Natural36 ที่ต้องรักษา: historical reached/win/dead23/20/4; defender-aware23/19/5 เทียบ V4.7 แล้วแย่ลงทั้งสองแบบ ไม่ตั้งเป้าชนะใหม่แล้วจูนให้เข้าเป้า CI เดิมอาจบังคับรันซ้ำจาก main ancestry; ไม่รัน cohort แพงซ้ำในเครื่องเพียงเพราะเปลี่ยน UI

ใช้ bounded real-browser opening โดยไม่ grant/เพิ่มเลือด: เคลื่อนที่จริง ต่อสู้ รับ Draft และเลือกจริง เก็บเวลา canonical/kills/ข้อเสนอ/จำนวน behavior previews ใน `opening.json` เป็นเส้นทางหนึ่ง ไม่ใช่คะแนนความสนุกและไม่ใช่ controller เดียวกับ180s policy เดิม จึงไม่เทียบเวลาแล้วสรุปผล causal

โอกาสที่มีหลักฐานรองรับ:

1. **Navigation friction**: Escape/Back และ Seed/Origin ที่หาย, setting สองหน้าต่างไม่เท่ากัน และ Collection/Pause ที่แน่น เป็นข้อบกพร่อง UX ทำซ้ำได้และแก้รอบนี้แล้ว แต่ยังต้องให้เจ้าของยืนยันว่าใช้ง่ายขึ้น
2. **First meaningful upgrade/pressure tradeoff**: เส้นทางที่วัดอาจให้ตัวเลือก stat-only ก่อนเปลี่ยนรูปแบบอาวุธจริง ขณะที่หลายกลไก V4.8 เปลี่ยนพร้อมกันและผลจำลองถอยลง ยังไม่มีหลักฐานแยกว่าตายจาก cadence, เสีย pushback หรือ positioning จึงไม่เดา balance ใหม่ รอ timestamp/choice/death context จากคนเล่น

## Verification / negative evidence

- Initial menu regressions2RED แล้ว EN/TH4GREEN; reverse-Tab RED→GREEN
- Targeted browser28PASS/1FAIL: legacy Clear Save test ไม่เปิด Danger disclosure ใหม่ แก้การเดินเมนูเท่านั้น คง native-confirm/dismissal/save assertions
- Fresh whole-change reviewหนึ่งรอบ:2Important (Chronicle focus, visited-unclaimed POI) และ minor failed-save slider ทั้งสามมี browser RED แล้วแก้หนึ่งรอบ ไม่เปิด review-agent loop
- Fix-pass แรก3PASS/1FAIL: accessible description อ่านเพียงชื่อ legend แทนสถานะ แก้ semantic reference และรอ canonical discovery ก่อนเปิด map; regression เดิมไม่ถูกลดเกณฑ์
- Full check/browser/package/exact-source CI และ source SHA สุดท้ายอยู่ใน receipt ของ Draft PR เก็บ failed logs ใน scratch ครบ แต่ trace บางรอบใน output ชั่วคราวถูก Playwright ล้างตอนเริ่มรอบถัดไป จึงไม่อ้างว่ายังเก็บ trace เหล่านั้นอยู่ ไม่สร้างหลักฐานย้อนหลัง และไม่อ้าง independent re-review หลัง fix pass

## งานค้างและ Human retest

งานภาพหกยุค/ท่าร่างกายครบต้องใช้ original frames จริง ดู input specification เดิมใน `docs/art/V46_ANIMATION_PRODUCTION.json` ไม่ถือว่า UI polish เป็น ART_COMPLETE งาน native strict60Hz ต้องทดสอบบนจอ/GPUจริง CI และ staged screenshots ไม่รับรองแทน Multi-emitter ยัง DEFERRED_WITH_REASON ไม่สร้าง emitter ซ้อนระบบเดิม

ปิด QA เก่าด้วย Ctrl+C แล้วดับเบิลคลิก `C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat` เปิด `http://127.0.0.1:5173/?qa=1` ตรวจ SHA ตาม receipt เริ่มรอบใหม่ไม่มี grants/review hooks

1. พิมพ์ Seed เลือก Origin เข้า Settings เปลี่ยนภาษา/scale แล้ว Back/Escape ต้องรักษาสิ่งที่เลือก
2. เปิดเงื่อนไข Collection และ equip ของที่มีจริง ตรวจโฟกัส/สวมใส่/กลับมาแล้วยังคงอยู่
3. Pause: Resume เด่น เปิด Settings/Help แล้ว Escape ย้อนถูกชั้น ไม่เดินค้างหรือเปลี่ยน simulation ระหว่างหยุด
4. เทียบ POI สำรวจแล้วแต่ยังไม่ยึดบนแผนที่กับโลกจริง ลอง Later เมื่อ logistics เต็ม ตรวจ marker/ฐานถูกโจมตี
5. เล่นช่วงต้น เลือก Tech จริง ป้องกันฐาน/สู้ Boss และ World2 เมื่อถึงตามธรรมชาติ จดจังหวะที่ไม่สนุกและสิ่งที่เลือกก่อนหน้า

แยกคะแนน UI ใช้ง่ายขึ้นหรือไม่ ออกจาก Combat/Fun(1–5), Upgrade Impact(1–5), Replay interest และอยากเริ่มอีกครั้ง Yes/No ไม่สร้างคะแนนแทนเจ้าของ ถ้า Combat ยัง1/5หลังทดลองจริง ให้เลือก prototype combat จำกัด2–3แบบจากประสบการณ์ก่อนเปลี่ยนทั้งเกม ไม่เพิ่ม density/ฟีเจอร์/กาชาเพื่อกลบปัญหา

HUMAN_RETEST_READY ต้องอ้างอิง final engineering receipt เท่านั้น HUMAN_FUN_PASS / BUG_FREE / ART_COMPLETE ยังไม่ผ่านตามหลักฐานที่มี

## Ledger37 — historical descriptions และสถานะรอบนี้

ตารางต่อไปเก็บคำอธิบาย33รายการจาก ledger เดิม พร้อม delta V4.9 แยกจากการยอมรับของคนเล่น หมายเลข34–37มีเพียง grouped references ใน owner directive จึงไม่แต่งถ้อยคำต้นฉบับขึ้นเอง ทุกข้อยังต้อง human acceptance ตามคอลัมน์ท้าย

|ID|Historical engineering status|Source|Original behavior/limitation description|Existing evidence|V4.9 delta / human gate|
|---|---|---|---|---|---|
|1|IMPROVED_PENDING_HUMAN|GameScene, campaign PR|Fragmented requests → one coherent campaign|Full checks; H overall quality|IMPROVED_PENDING_HUMAN: shared menus/theme/disclosures; before/after+B; owner UX/fun still required|
|2|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Uniform shot ratios → distinct family ratios, same real Origin frames|B; H identity|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|3|HUMAN_RETEST_REQUIRED|game/render/WorldRenderer.ts|Existing measured grounded sites retained; no blind enlargement|B3 viewports; H scale|HUMAN_RETEST_REQUIRED: no blind actor/FOV multiplier|
|4|VERIFIED_EXISTING|core/emergence/outpostLogistics.ts|Canonical6/6/Later/Signal validation already live|outpostSoftlock B; H purpose|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|5|IMPROVED_PENDING_HUMAN|core/sim/RunSimulation.ts|Ordinary raid only → actual boss base assault sharing HP/repair|U/N; H defensibility|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|6|IMPROVED_PENDING_HUMAN|game/ui/combatChoicePreview.ts|Bonus counters → active whole weapon consequences, canonical effect preview and guardian cap|U RED→GREEN; Draft EN/TH; owner Upgrade2/5 retest|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|7|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Same-sized friendly shots → role-specific aspect ratios|B; H cohesion|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|8|HUMAN_RETEST_REQUIRED|game/render/ActorRenderer.ts|Existing camera/actor hierarchy retained|B3 viewports; H FOV|HUMAN_RETEST_REQUIRED: no blind actor/FOV multiplier|
|9|VERIFIED_EXISTING|styles.css, GameScene|Existing flow-layout boss/stats lane retained|B rectangle oracle; H aesthetics|IMPROVED_PENDING_HUMAN: shared menus/theme/disclosures; before/after+B; owner UX/fun still required|
|10|IMPROVED_PENDING_HUMAN|GameScene.refreshGround|Map-known undiscovered destinations were hidden → identify before chunk entry/discovery|B approaching-edge art/pixel evidence; physical latency remains unverified|IMPROVED_PENDING_HUMAN: visited/unclaimed map identity restored; approaching-world implementation unchanged; physical latency not measured|
|11|VERIFIED_EXISTING|core/world/poi.ts|Existing biome-weighted POIs retained|Worldgen tests; H strategic meaning|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|12|DEFERRED_WITH_REASON|game/render/TerrainPainter.ts|Existing baked periodic materials/worker pipeline retained|Source parity tests; new preferred terrain needs concrete artwork/reference|DEFERRED_WITH_REASON: no new terrain source/style specification|
|13|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Existing canonical rejection reasons retained|Outpost browser/unit; H clarity|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|14|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Space family emitters kept; shot proportions clarified|Emitter/browser tests; H impact|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|15|ART_SOURCE_BLOCKED|game/render/ReferenceAnimation.ts|Existing real poses; no continuous six-age anatomy source|Asset/source tests; original frames required|ART_SOURCE_BLOCKED: genuine anatomy/age frames required|
|16|FIXED_ENGINEERING|heroActions.ts, GameScene|Floating primary release no longer starts body punch or resets walk; real muzzle retained|U floating/hand priority; B real release idle; human smoothness pending|VERIFIED_EXISTING: floating muzzle/body ownership unchanged; smoothness retest|
|17|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Similar cadence → strafe, bounded lead, denser fan, actual base assault|U/N; H challenge/fairness|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|18|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Legacy/family inheritance already live|Ascension/World2 tests; H replay interest|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|19|FIXED_ENGINEERING|DecisionInputBoundary.ts|Draft-only Space protection → all mandatory blocking choices; held Enter cannot cross queued world choices|EN/TH native keyboard RED→GREEN; human original path retest|VERIFIED_EXISTING: mandatory guards/queue unchanged; P0 browser+CI; real hardware original path retest|
|20|IMPROVED_PENDING_HUMAN|GameScene, i18n/en.ts, th.ts|No observed F use → contextual ready prompt|EN/TH B; H discoverability|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|21|VERIFIED_EXISTING|game/ui/NotificationManager.ts|One encounter slot/priority fix already in7847|Notification + boss B; H obstruction|IMPROVED_PENDING_HUMAN: shared menus/theme/disclosures; before/after+B; owner UX/fun still required|
|22|VERIFIED_EXISTING|scripts/qa-sink.mjs|117/118 terminal; late91 rejected as latest|Actual private provenance + sequence tests; no ratings invented|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|23|IMPROVED_PENDING_HUMAN|landmarkVisibility.ts|Current-position culling → full chunk camera sweep, including negative chunks|Review regression RED→GREEN; approaching POI B; human arrival retest|IMPROVED_PENDING_HUMAN: visited/unclaimed map identity restored; approaching-world implementation unchanged; physical latency not measured|
|24|FIXED_ENGINEERING|DecisionInputBoundary.ts|No native Space selection in mandatory choices; deliberate fresh Enter/pointer preserved|B Draft/Outpost/Legacy→Origin; fresh Dash and Tab preserved|VERIFIED_EXISTING: mandatory guards/queue unchanged; P0 browser+CI; real hardware original path retest|
|25|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts, hostileArt.ts|Real hostile sources preserved; friendly family shape separation improved|B/HC regressions; H threat clarity|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|26|FIXED_ENGINEERING|DecisionInputBoundary.ts, GameScene|Release/resume quarantine and editable Tab/Escape forwarding|B draft/pause/maps/blur and6 setting-focus regressions; human original failure still retest|VERIFIED_EXISTING: mandatory guards/queue unchanged; P0 browser+CI; real hardware original path retest|
|27|HUMAN_RETEST_REQUIRED|game/render/VisualLanguage.ts|No universal multiplier or changed collision size|B3 viewports; H perceived size|HUMAN_RETEST_REQUIRED: no blind actor/FOV multiplier|
|28|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Phase2 pattern labels → actual strafe/lead/fan/base-assault escalation|U/N; H perception|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|29|DEFERRED_WITH_REASON|HeroEquipment.ts, core/combat/weaponGeometry.ts|One authoritative primary rig; no per-extra-weapon muzzle model|Existing float foundation retained; extra weapons need explicit canonical emitter design|DEFERRED_WITH_REASON: canonical multi-emitter architecture not expanded|
|30|IMPROVED_PENDING_HUMAN|WorldRenderer.ts|Painted fallback shadow → essential site-type glyph independent of art slot/terrain readiness|U identity RED→GREEN; B art/pixel checkpoints, not physical GPU presentation|IMPROVED_PENDING_HUMAN: visited/unclaimed map identity restored; approaching-world implementation unchanged; physical latency not measured|
|31|FIXED_ENGINEERING|game/render/paintedBossPose.ts|Continuous hit pose/jitter hides attacks → action pose + tint|2 RED→GREEN regressions; H art/pixel preference still open|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|32|IMPROVED_PENDING_HUMAN|RunSimulation, SimEvent.ts|Boss walks to a named owned base and damages it only through actual warned attacks|U/N, existing repair/defense; H meaningful response|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|33|IMPROVED_PENDING_HUMAN|bossEncounter.ts, BossTelegraph.ts|Pure snapshot aim → bounded pre-warning prediction, frozen afterward|U shared warning/shot geometry; H fairness|VERIFIED_EXISTING / HUMAN_RETEST_REQUIRED: inherited behavior, no canonical improvement claimed|
|34|Grouped reference only|Owner V4.9 directive|Floating Weapon grouped reference; original verbatim not supplied|Inherited V47/V48 evidence|VERIFIED_EXISTING: floating muzzle/body ownership unchanged; smoothness retest|
|35|Grouped reference only|Owner V4.9 directive|POI Visibility grouped reference; original verbatim not supplied|Inherited V47/V48 evidence|IMPROVED_PENDING_HUMAN: visited/unclaimed map identity restored; approaching-world implementation unchanged; physical latency not measured|
|36|Grouped reference only|Owner V4.9 directive|UI/UX grouped reference; original verbatim not supplied|Inherited V47/V48 evidence|IMPROVED_PENDING_HUMAN: shared menus/theme/disclosures; before/after+B; owner UX/fun still required|
|37|Grouped reference only|Owner V4.9 directive|Input/Draft grouped reference; original verbatim not supplied|Inherited V47/V48 evidence|VERIFIED_EXISTING: mandatory guards/queue unchanged; P0 browser+CI; real hardware original path retest|

## Frozen runtime local receipt

Full check **641tests/124files PASS**, typecheck/notices/build PASS. Final selected browser **20/20 PASS**, รวม EN/TH menus, snapshot pause invariance, real no-grant opening, P0 input/POI/bow, map threat720p/200%, Chronicle และ failed-save restoration. Local Natural36/analyze ไม่รันซ้ำเพราะ core/content ไม่เปลี่ยน; mandatory CI analysis/cohorts ต้องตรวจตาม workflowเดิม

[หลักฐานเปิดเกม](evidence/v49/opening.json): เส้นทางตัวอย่างนี้ first Draft22.183333canonical seconds,28kills, behavior preview0, ตัวเลือก knowledge+6%/damage+6%/damage+12% เป็นข้อมูล n=1 ไม่ใช่เวลามาตรฐานทุกSeedและไม่ใช่คะแนนความสนุก

[ก่อน Main](evidence/v49/before-main-th.png) / [หลัง Main](evidence/v49/main-th.png) · [ก่อน Pause](evidence/v49/before-pause-th.png) / [หลัง Pause](evidence/v49/pause-th.png) · [expanded Settings](evidence/v49/settings-th.png) · [visited map](evidence/v49/map-discovery.png) · [Chronicle](evidence/v49/chronicle.png)

Screenshotsเป็นcandidate runtimeก่อนcommitmetadata เปลี่ยนเป็นSHAสุดท้าย runtime codeคงเดิม; final source/CI/package receiptsอยู่ในDraft PRเพื่อไม่commitวนใส่SHAของตัวเอง Expanded Settings/Chronicle และการ์ดDraftที่ข้อความยาวยังใช้bounded scrollได้ โดยเฉพาะ200%; ไม่อ้างว่าเนื้อหาทั้งหมดต้องพอดีหน้าเดียว
