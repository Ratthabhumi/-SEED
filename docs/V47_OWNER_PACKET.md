# V4.7 — Core Fun Recovery

V4.7 เป็น engineering candidate สำหรับตรวจและ Human retest สถานะ verification/SHA สุดท้ายอ้างอิง frozen receipt ใน Draft PR เดียว ไม่มี merge/release/deploy คะแนนจากเจ้าของยังเป็น Combat Feel1/5, Upgrade Impact2/5 และอยากลอง Build อื่นแต่ยังไม่สนุกพอ

## 1. ฐานงานและหลักฐานมนุษย์
เริ่มที่57df3d1b5e27e31bc10893b5ef61c106eb38bf0d / Draft PR37 / feat/v46-combat-defense-20261103 ใน C:\Users\MewMew\Desktop\Co-op\-SEED โค้ด tracked สะอาด มี .cursor/ และ Play-SEED-QA.bat ของเจ้าของอยู่เดิม สร้าง feat/v47-core-fun-20261104 ตรงจากฐานนี้ ไม่มี stale main หรือการใช้ worktree v39

รายงานส่วนตัวล่าสุดตรงกับ57df3d1 แต่ยัง NOT_FINISHED, elapsed0 และไม่มีคะแนน/ความเห็น ส่วน terminal ล่าสุดที่หาเจอเป็น7847d7b target-complete ที่120.2s จึงไม่ยืม PLAYTEST COMPLETE มาเป็นผลรับรอง V4.6 ใช้คะแนนที่เจ้าของระบุใน directive เป็นหลักฐานใหม่โดยตรง ไม่อัปโหลด raw QA/session identifiers

## 2. บั๊กที่ทำซ้ำและการแก้
|เรื่อง|ก่อน|หลัง/หลักฐานที่ต้องยืนยัน|
|---|---|---|
|Space ข้ามการเลือก|Draft ถูกป้องกัน แต่ focused Outpost รับ Space ผ่าน native button activation|capture boundary ครอบคลุมทุก blocking choice; fresh Enter/pointer เลือก, Tab ใช้งานได้; held/repeated Enter ข้าม Legacy→Origin ไม่ได้|
|WASD ค้างข้ามหน้าต่าง|keys ที่กดระหว่าง Pause/choice อาจตกค้างหลังปิด|quarantine ตอน close/resume; คง release/blur และ fresh Dash regressions|
|Escape หลังตั้งค่า|เมื่อโฟกัส input ตัว editable guard กลืน Escape และ Tab; พบผ่าน6 browser failures|ยกเว้น Escape/Tab จาก typing guard ให้ focus trap/close ทำงาน โดยข้อความอื่นยังไม่ส่ง gameplay shortcuts|
|POI แสดงช้า|Civ Map แสดงพิกัด POI รอบข้าง แต่ world ซ่อนจนเข้า chunk/ค้นพบ|แสดงจุดหมายก่อนค้นพบ; ไม่เปลี่ยน reward/discovery/claim; sprite preparation อิง camera sweep ทั้ง chunk และมี glyph บอกประเภทแม้ art pool เต็ม|
|ธนูลอยแต่ตัวต่อย|ทุก primary release สั่ง body attack และเพิ่ม animation revision|float release หันทิศ/ยิงจาก muzzle เดิมโดย body idle/walk ต่อเนื่อง; hand mode, hurt, dash และ active gesture คงอยู่|
|Industrial energy อ่อนผิดข้อมูล|ข้อมูล count2 แต่ dispatch ยิงค่าคงที่1|ใช้ st.count จริง; actual release indexes0/1 และ projectile slots แยกกัน|
|ตัวเลขผลอัปเกรด|แสดง bonus counter หรือจำนวนทศนิยม/เกิน cap|แสดงผล weapon ที่ active จริง ใช้ ceil ตาม execution loop และ guardian cap6; saturated upgrade ไม่โฆษณาหน่วยที่ไม่เกิด|

Age/Breakthrough splash ที่ตั้งเวลา1.1s ยังเป็น timed presentation; อย่าสับสนกับ mandatory Legacy/Origin/Expansion/Draft ซึ่งต้องเลือกโดยตั้งใจ CPU post-render ไม่ใช้รับรอง GPU/physical latency

## 3. Combat slice ที่วัดจริง
Worldgen3 / Content25 / Save3 / child laws18 เปลี่ยนเฉพาะ canonical energy volley ตามข้อมูลเดิม ไม่มีเพิ่ม HP/damage/cooldown, boss หรือ director

เทียบ parent source กับ candidate ใน12เงื่อนไข:3 builds ×ก่อน/หลังอัปเกรด ×ยืน/เคลื่อนที่ แต่ละเงื่อนไขตรวจ candidate replay equality ฉากจัดเป้าหมาย18ตัว HPสูง ไม่ใช่ natural pressure/kill density/ความสนุก ไม่ตั้งค่า enemy pressure จากฉากนี้

ผลยืน12s (resolved HP damage รวมระบบของ Origin ที่ยัง active):
|Build|V4.6 ก่อน→หลังอัปเกรด|V4.7 ก่อน→หลังอัปเกรด|ผลจริง|
|---|---|---|---|
|Kinetic fan|36→72 shots;544→1008 damage|เหมือน V4.6|อัปเกรดเพิ่ม coverage; VERIFY_EXISTING ไม่อ้างว่าเพิ่งสร้างใหม่|
|Energy chain|33 shotsทั้งคู่;0→64 arcs;1528→1960 damage|66 shotsทั้งคู่;0→130 arcs;1730→2607.5 damage|volley ที่หายไปกลับมา; chain กระจาย hit จริง|
|Mine control|5→13 detonations;702→1638 damage|เหมือน V4.6|พื้นที่ควบคุมเพิ่มจากอัปเกรดเดิม ไม่มีระบบใหม่|

ดู machine-readable comparison ใน docs/evidence/v47-combat-comparison.json ตัวเลขการยิงไม่สัญญาว่าทุกนัดโดน เป้าหมาย HPสูงจึงไม่ใช้เป็นหลักฐานความสะใจจากการฆ่า

การ์ด Draft เพิ่มผลที่เล่นได้จริง เช่น นัดต่อชุดยิง, mine placement, aura radius, chain และ beam on/off จาก canonical effect application ใช้ข้อความ EN/TH จริง ไม่ใส่ animation ที่แกล้งทำว่ามีกลไกใหม่

## 4. Main / Pause / Collection / Draft
Main เป็นสองคอลัมน์ที่มีขอบเขตความสูงแน่นอน:เริ่มเกม/Origin/Settings ซ้าย; Collection5ชิ้นและ Archive ขวากลางใน scroll region เดียว แก้ต้นเหตุการมี component ที่สามสร้าง grid row ล้น ไม่ยัด Collection ไว้ Pause อีก

ของที่ล็อกยังแสดง requirement/preview และกด equip ไม่ได้ ของที่มีแล้วแสดง equipped ผ่านปุ่ม/aria-pressed ใช้ save transaction เดิม คง focus หลัง equip/unequip และเปิดเกมจากค่าที่บันทึกจริง ไม่มี grant/currency/inventory ใหม่ Chronicle ยังใช้ Collection เดิมได้

Pause คง Resume, settings, guide/tutorial, run actions และการป้องกัน destructive reset เดิม; Collection ถูกถอดออก เป้าหมาย720p normal scale ไม่มี panel overflow; scale200% อนุญาต deliberate scroll แต่ทุก control ต้องเข้าถึงได้ ภาพ EN/TH/720p/1080p/2550×1272 และ Draft อยู่ใน evidence gallery และ exact-source CI artifacts

## 5. Compatibility และขอบเขต
Content24→25 จำเป็นเพราะ replay combat ต่างตามเจตนา Geometry/seed placement, persistent Save3 migration, Insight, rewards และ child laws18 คงเดิม Core ไม่ import DOM/Phaser RNG streams ยัง deterministic ไม่มี new dependency ไม่มีเปลี่ยน historical/defender-aware policies เพื่อแต่งผล

ไม่มีงานภาพต้นฉบับใหม่ ไม่มี upscale อ้างว่าเป็น hi-res ภาพ anatomy ต่อเนื่องยังต้อง source art ตาม V46 production request แต่แผน192ชุดถูกลดความสำคัญตามคำสั่งล่าสุด Extra primary weapons, worlds/currency/ecology/new cosmetics ยัง DEFERRED_WITH_REASON

Director pressure, boss balance และ global actor scale ไม่ถูกปรับโดยเดาตัวเลข คะแนน1/5ชี้ว่าต้องปรับ feel แต่ยังไม่ระบุช่วง encounter ที่ควร retune อย่างยุติธรรม ให้เจ้าของระบุช่วงเดินว่าง/รุม/อัปแล้วไม่ต่างจาก build นี้ใน retest ก่อนขยายการปรับค่า

## 6. Verification และ negative evidence
Receipt ของ frozen source/SHA, check, browser, analyze, Natural36ทั้งสองชุด, ZIP และ Push+PR CI อ้างอิงใน Draft PR เพื่อไม่ commit วนเพียงเพื่อใส่ SHA ของตัวเอง

เก็บ RED:Space Outpost EN/TH, unknown POI hidden, title layout expectation, floating body attack, energy1แทน2, fractional preview, same-chunk art culling และ painted fallback ที่ไร้ identity รันทดสอบเปลี่ยนเฉพาะ affected subsystems ระหว่างทำงาน Full check ครั้งเดียวบน runtime สุดท้าย; หากมี failure ต้องแสดงและแก้สาเหตุโดยไม่ลดเกณฑ์

รอบ browser ก่อน review:41/47 PASS;6 failures ใน collection regression เกิดจาก Escape ถูก editable input กลืนหลังตั้งค่า เก็บ log/traces ไว้ scratch/v47-browser-pre-review และเพิ่มการแก้ตัว guard ไม่ยกเลิก assertions ของ canonical equality/World2/save/keyboard

Fresh whole-branch review พบ2P2:current-position POI cull และ fractional/capless preview ทั้งคู่มี RED→GREEN unit regressions หนึ่ง fix pass ไม่มี re-review loop Minor ที่เลื่อนไป:comparison script trusts extracted cache existence; extraction รอบนี้สร้างจาก exact57df3d1และตรวจ blob identities แยกก่อนรับหลักฐาน ความเสี่ยงสำหรับการใช้ cache ที่แก้เองในอนาคตต้องตรวจ/สร้างใหม่

Rulings:ใช้ owner authority commit/push/Draft PR ได้เลย ไม่ต้องถามซ้ำ; ไม่ลบแผน/negative evidence หลังจบ; timed splash ไม่แปลงเป็น mandatory choice; ไม่แก้ minors เพิ่มเป็นแคมเปญใหม่ Cost หากตัดสินผิดคือการรับรอง UX/pressure หรือ source provenance เกินหลักฐาน จึงคง human/physical gates และระบุ cache limitation

## 7. Human retest
ปิด QA Server เดิมด้วย Ctrl+C แล้วดับเบิลคลิก C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat เปิด http://127.0.0.1:5173/?qa=1 ตรวจ SHA ใน receipt เริ่มรอบใหม่โดยไม่มี review/debug grants

ลองเคลื่อนที่/กด Space ก่อน modal; mandatory choice ต้องค้างจนใช้ Enter หรือ pointer, หลังเลือกต้องปล่อยปุ่มก่อนเคลื่อนใหม่ เดินหา POI ที่เห็นใน Civ Map ตรวจว่าเห็นจุดหมายก่อนเข้าใกล้ จากนั้นลอง build ที่ต่างกันจริงอย่างน้อยสองรอบ เปรียบเทียบทันทีหลังเลือก tech โดยเฉพาะ Industrial energy และ chain

ตรวจ Main/Pause/Collection EN/TH และ UI scale ที่ใช้งานจริง จบรอบผ่าน END PLAYTEST ให้คะแนนจริง Combat Feel, Upgrade Impact, Fun, Visible Evolution, Tech Choices, Base Defense, Boss และ Replay Interest1–5 พร้อมอยากเริ่มอีกรอบ Yes/No ระบุเวลา/seed/build ของช่วงที่ไม่สนุกหรือบั๊ก workaround ต้องลง INTERRUPTED_BY_BUG

เป้าทดลอง Combat/Upgrade≥3/5 เป็นเป้าจากเจ้าของ ไม่ใช่มาตรฐานภายนอกหรือผลที่เกิดแล้ว ยังไม่มี HUMAN_FUN_PASS, ART_COMPLETE, BUG_FREE หรือ strict physical60Hz acceptance

## 8. Ledger33ข้อและ37 references
ตารางด้านล่างรักษารายการ33เดิมจาก V4.6 เป็น historical baseline ไม่ถือว่าคำว่า VERIFIED_EXISTING ปิด human complaint ใหม่ Delta รอบนี้เปิด input19/24/26/37 และ POI10/23/30/35ใหม่ แล้วตรวจ implementation; UI9/21/36, bow16/34, combat2/6/14/18/20/25/28/33 ต้องให้เจ้าของรับรองใหม่ ข้อ34–37มีเพียง category references ใน directive จึงไม่สร้างรายละเอียดต้นฉบับขึ้นเอง

|---|---|---|
|ID|สถานะ|จุดตรวจ|พฤติกรรม/ข้อจำกัดเดิม|หลักฐาน/งานค้าง|
|---|---|---|---|---|
|1|IMPROVED_PENDING_HUMAN|GameScene, campaign PR|Fragmented requests → one coherent campaign|Full checks; H overall quality|
|2|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Uniform shot ratios → distinct family ratios, same real Origin frames|B; H identity|
|3|HUMAN_RETEST_REQUIRED|game/render/WorldRenderer.ts|Existing measured grounded sites retained; no blind enlargement|B3 viewports; H scale|
|4|VERIFIED_EXISTING|core/emergence/outpostLogistics.ts|Canonical6/6/Later/Signal validation already live|outpostSoftlock B; H purpose|
|5|IMPROVED_PENDING_HUMAN|core/sim/RunSimulation.ts|Ordinary raid only → actual boss base assault sharing HP/repair|U/N; H defensibility|
|6|IMPROVED_PENDING_HUMAN|game/ui/combatChoicePreview.ts|Bonus counters → active whole weapon consequences, canonical effect preview and guardian cap|U RED→GREEN; Draft EN/TH; owner Upgrade2/5 retest|
|7|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Same-sized friendly shots → role-specific aspect ratios|B; H cohesion|
|8|HUMAN_RETEST_REQUIRED|game/render/ActorRenderer.ts|Existing camera/actor hierarchy retained|B3 viewports; H FOV|
|9|VERIFIED_EXISTING|styles.css, GameScene|Existing flow-layout boss/stats lane retained|B rectangle oracle; H aesthetics|
|10|IMPROVED_PENDING_HUMAN|GameScene.refreshGround|Map-known undiscovered destinations were hidden → identify before chunk entry/discovery|B approaching-edge art/pixel evidence; physical latency remains unverified|
|11|VERIFIED_EXISTING|core/world/poi.ts|Existing biome-weighted POIs retained|Worldgen tests; H strategic meaning|
|12|DEFERRED_WITH_REASON|game/render/TerrainPainter.ts|Existing baked periodic materials/worker pipeline retained|Source parity tests; new preferred terrain needs concrete artwork/reference|
|13|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Existing canonical rejection reasons retained|Outpost browser/unit; H clarity|
|14|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts|Space family emitters kept; shot proportions clarified|Emitter/browser tests; H impact|
|15|ART_SOURCE_BLOCKED|game/render/ReferenceAnimation.ts|Existing real poses; no continuous six-age anatomy source|Asset/source tests; original frames required|
|16|FIXED_ENGINEERING|heroActions.ts, GameScene|Floating primary release no longer starts body punch or resets walk; real muzzle retained|U floating/hand priority; B real release idle; human smoothness pending|
|17|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Similar cadence → strafe, bounded lead, denser fan, actual base assault|U/N; H challenge/fairness|
|18|VERIFIED_EXISTING|core/sim/RunSimulation.ts|Legacy/family inheritance already live|Ascension/World2 tests; H replay interest|
|19|FIXED_ENGINEERING|DecisionInputBoundary.ts|Draft-only Space protection → all mandatory blocking choices; held Enter cannot cross queued world choices|EN/TH native keyboard RED→GREEN; human original path retest|
|20|IMPROVED_PENDING_HUMAN|GameScene, i18n/en.ts, th.ts|No observed F use → contextual ready prompt|EN/TH B; H discoverability|
|21|VERIFIED_EXISTING|game/ui/NotificationManager.ts|One encounter slot/priority fix already in7847|Notification + boss B; H obstruction|
|22|VERIFIED_EXISTING|scripts/qa-sink.mjs|117/118 terminal; late91 rejected as latest|Actual private provenance + sequence tests; no ratings invented|
|23|IMPROVED_PENDING_HUMAN|landmarkVisibility.ts|Current-position culling → full chunk camera sweep, including negative chunks|Review regression RED→GREEN; approaching POI B; human arrival retest|
|24|FIXED_ENGINEERING|DecisionInputBoundary.ts|No native Space selection in mandatory choices; deliberate fresh Enter/pointer preserved|B Draft/Outpost/Legacy→Origin; fresh Dash and Tab preserved|
|25|IMPROVED_PENDING_HUMAN|game/render/CombatSprites.ts, hostileArt.ts|Real hostile sources preserved; friendly family shape separation improved|B/HC regressions; H threat clarity|
|26|FIXED_ENGINEERING|DecisionInputBoundary.ts, GameScene|Release/resume quarantine and editable Tab/Escape forwarding|B draft/pause/maps/blur and6 setting-focus regressions; human original failure still retest|
|27|HUMAN_RETEST_REQUIRED|game/render/VisualLanguage.ts|No universal multiplier or changed collision size|B3 viewports; H perceived size|
|28|IMPROVED_PENDING_HUMAN|core/combat/bossEncounter.ts|Phase2 pattern labels → actual strafe/lead/fan/base-assault escalation|U/N; H perception|
|29|DEFERRED_WITH_REASON|HeroEquipment.ts, core/combat/weaponGeometry.ts|One authoritative primary rig; no per-extra-weapon muzzle model|Existing float foundation retained; extra weapons need explicit canonical emitter design|
|30|IMPROVED_PENDING_HUMAN|WorldRenderer.ts|Painted fallback shadow → essential site-type glyph independent of art slot/terrain readiness|U identity RED→GREEN; B art/pixel checkpoints, not physical GPU presentation|
|31|FIXED_ENGINEERING|game/render/paintedBossPose.ts|Continuous hit pose/jitter hides attacks → action pose + tint|2 RED→GREEN regressions; H art/pixel preference still open|
|32|IMPROVED_PENDING_HUMAN|RunSimulation, SimEvent.ts|Boss walks to a named owned base and damages it only through actual warned attacks|U/N, existing repair/defense; H meaningful response|
|33|IMPROVED_PENDING_HUMAN|bossEncounter.ts, BossTelegraph.ts|Pure snapshot aim → bounded pre-warning prediction, frozen afterward|U shared warning/shot geometry; H fairness|

Frozen-source verification note: full check first633PASS/1 obsolete-versionFAIL; corrected explicit Content25 assertion and full check634PASS/122files including typecheck/notices/build. No runtime threshold changed. Final browser/cohort/CI/ZIP outcome is the linked PR receipt.
