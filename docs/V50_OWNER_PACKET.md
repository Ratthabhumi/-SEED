# V5.0 — Quality consolidation / owner packet

สถานะ: implementation candidate; ยังไม่ปิด37ข้อ และยังไม่ผ่าน Human Fun Acceptance

## ต้นทางและขอบเขต

เริ่มจาก `556f1f040c8b084bb23efc9df18ad522fe311dad`, branch `feat/v49-unified-ux-20261104`, Draft PR#40; สร้าง `feat/v50-quality-eclipse-20261104` จาก HEAD นี้ ไม่ใช้mainเก่า ไม่merge/release/deploy

Primary playable checkout: `C:\Users\MewMew\Desktop\Co-op\-SEED`.
เริ่มงานมี owner edits ใน SESSION_HANDOFF และ latest human report พร้อม .cursor, launcher และรายงานส่วนตัวที่ยังไม่tracked เก็บสำรองใน scratch/v50-owner-backup และไม่รวมข้อมูลเหล่านี้ขึ้นGitHub เผยแพร่เฉพาะ aggregate ไม่มีsession identifiers

## Delta ที่ผู้เล่นเห็น

|Owner observation|ก่อน → หลัง|สถานะ / acceptance|
|---|---|---|
|หน้ายุคปิดก่อนอ่าน|1.1s timeoutทั้งที่มีContinue → อยู่จนกดContinue; heldSpace/WASDไม่เลือก, heldEnterไม่ข้ามchoiceถัดไป|FIXED_ENGINEERING / HUMAN_RETEST_REQUIRED; ageเป็นข้อมูล ไม่ใช่ตัวเลือกcanonicalที่สูญหาย|
|ตัวหันตามธนู|floating attackไม่เปลี่ยนposeแต่ยังเปลี่ยนfacing → bodyเดินตามmovementและคงทิศตอนidle; bowยังเล็งและยิงจากcanonical muzzle|FIXED_ENGINEERING / HUMAN_RETEST_REQUIRED|
|POIลอย/วงนีออน|glyphสูง148หน่วย+pillar/ring → อาคารเดิมเป็นidentity; fallbackรูปทรงfamilyติดพื้นและไม่กระพริบเมื่อไม่มีartslot; HCยังมีรูปทรง|IMPROVED_PENDING_HUMAN; ไม่เพิ่มขนาดactor/FOV|
|World2เหมือนโลกแรก|พื้น/วัสดุเดิม → Eclipse Frontierโทนmoonlit blue/violet + entry EN/TH; tintเฉพาะพื้น/สถาปัตย์ ไม่คลุมactor/กระสุน/คำเตือน|IMPROVED_PENDING_HUMAN; ยังไม่ใช่biome/animationใหม่|

ก่อน/หลังเชิงพฤติกรรม: regressionใหม่ล้มเหลวบนbaselineสำหรับageและfloating-facing แล้วผ่านหลังแก้; ภาพเป็นSTAGED_ENGINEERING ไม่ใช่ผลเล่นจริง/native60Hz ภาพmenuที่ไม่เปลี่ยนใช้V49เดิม ไม่สร้างUIอีกรอบ

|Surface|Disposition|
|---|---|
|Main / Pause / Settings / Help / Collection|KEEP: V49sharednavigation/theme; ภาพในevidence/v49|
|Draft / Civilization Map / Outpost / Chronicle|KEEP: canonicalpreview/identityและkeyboardเดิม; retestinput/6of6เดิม|
|Age / queuedOrigin-Expansion|FIX: readableacknowledgementและheldkeyboundary|
|HUD / POI world|FIXเฉพาะgroundedPOI; KEEP HUDdensity/FOV/actors|
|Boss defense|KEEP boundedContent26; HUMAN_RETEST_REQUIRED ไม่แอบจูนHP/shot/density|
|World2 entry / landscape|FIX materials+localizedentry; canonicalscarcity/researchเดิม|

## Gameplay / Offer / World2

Canonical core/contentไม่เปลี่ยน: 3/26/3, child18, RNG/eligibility/HP/damage/Origin/Tech/Outpost/Boss/rewardเดิม
World2มีกติกาความรู้×0.8กับresearch bonusสองเท่าเดิมอยู่แล้ว แสดงกติกาจริงในentryต่อจากชื่อภูมิทัศน์ ไม่อ้างว่าเพิ่มraidใหม่ World3ยังใช้raid interval75%เดิม

Audit12cases (3fixedseeds ×4Origins), stagedfirstdraft: behavior nodeถูกกฎหมายมี4/12, ถูกเสนอ2/12; อีก8/12ไม่มีตั้งแต่pool ไม่สามารถแก้ด้วยน้ำหนักอย่างเดียว รายละเอียดใน `evidence/v50/opening-offer-audit.json`.
Reproduce: `node node_modules/vite-node/vite-node.mjs scripts/audit-v50-opening-offers.mjs` เขียนเฉพาะscratch; ให้knowledge100ในstagingเพื่อเปิดdraftแรก ไม่ใช่การวัดเวลาเล่นจริง
DEFERRED_WITH_REASON: earlybehaviorupgradeที่ครอบคลุมทุกOriginต้องปรับlegalcontent/prerequisiteและContentversion พร้อมreplay/Natural36ใหม่ ไม่บังคับnode/แอบข้ามprerequisiteจากauditนี้ ใหม่Eclipsetacticalruleยังdeferredเพื่อไม่ซ้ำeconomy/raidและไม่แก้child18เงียบๆ

Historical Natural36จากC26เดิม: reached/win/dead23/20/4; defender-aware23/19/5 แย่ลงจากC25บางด้าน เก็บnegative evidenceไว้ ไม่เปลี่ยนbotหรือจูนwinrate การรันCIรอบนี้และexactSHAอยู่ในPRreceipt ไม่ใช้ผลจำลองแทนความสนุก

## Ledger37 + addendum4

เก็บคำอธิบายรายข้อเดิมใน [V49 ledger](V49_OWNER_PACKET.md#ledger37--historical-descriptions-และสถานะรอบนี้) ไม่แต่งoriginalverbatim34–37ที่ยังไม่ได้รับ ตารางนี้จัดgroupตามownerปัจจุบันและระบุdeltaV50เท่านั้น

|IDs|สถานะV50 / สิ่งยังต้องทำ|
|---|---|
|19,24,26,37 Input|FIXED_ENGINEERINGเฉพาะageexpiry; queue/focus/Spaceguardsเดิมretest; HUMAN_RETEST_REQUIREDบนเครื่องจริง|
|10,23,30,35 POI|IMPROVED_PENDING_HUMAN: groundedidentity+actual-slotfallback; world/mapcanonicalcoordsและprediscoveryเดิม|
|16,34 Floating|FIXED_ENGINEERING bodyfacing ownership; muzzleเดิม; smoothness/feel HUMAN_RETEST_REQUIRED|
|9,21,36 UI|VERIFIED_EXISTING V49menus; age/childentrylocalizeddelta; ไม่รีดีไซน์ทั้งหมด|
|2,6,14,17,25,28,33 Combat|HUMAN_RETEST_REQUIRED; ไม่อ้างว่าcombat1/5ถูกแก้ด้วยvisualpatch|
|3,8,27 Actors|HUMAN_RETEST_REQUIREDเรื่องขนาด; ไม่เพิ่มscaleโดยไร้หลักฐาน|
|1,7,12,15,31 Art|IMPROVED_PENDING_HUMANเฉพาะPOI/materials; ART_SOURCE_BLOCKEDสำหรับauthoredanatomy/highresolution/ครบframes|
|29 Multiweapon|DEFERRED_WITH_REASON: canonicalmulti-emitter/socketยังไม่มี ไม่วาดของหลอก|
|4,5,11,13,18,20,22,32 Civilization|VERIFIED_EXISTING canonicalOrigin/Tech/Outpost/age/defense/legacy; W2visualdelta; newrule/earlycontent DEFERRED_WITH_REASON|
|Addendum Age / Facing|FIXED_ENGINEERING; ownerต้องยืนยันอ่านทันและไม่หันตามธนู|
|Addendum POI / World2|IMPROVED_PENDING_HUMAN; newtacticalruleยังไม่เสร็จ|

## Verification receipt

Initial exact-source CI at `f7d49a2f411741135dbe5bba2dfb5576ee1e70f5`: code/analyze/renderผ่านทั้งสองevent แต่ fullE2Eทั้งสองชุด301PASS/7FAIL/1expected skip เก็บผลเดิมใน [Push41853590201](https://github.com/Ratthabhumi/-SEED/actions/runs/41853590201) และ [PR41853690065](https://github.com/Ratthabhumi/-SEED/actions/runs/41853690065).
4FAILเป็นexpectationเก่าว่าfloatต้องหมุนbody ปรับให้handหมุน/floatคงทิศตามowner อีก3FAILเป็นregressionที่เพิ่มtintลงsharedreviewschema คืนรูปแบบเดิมและแยกherocolor diagnosticออก ไม่มีการแก้orderedrastertestหรือpixelthreshold ผลแก้ไขsourceสุดท้ายดูreceiptในPR#41 ไม่ยืมPASSของf7มานับเป็นSHAใหม่
Correctivepass: failing7cases +V50cases10 =17/17 PASS, nativeRGBA/parityassertionsเดิมครบ; corrected frozen `npm run check`644/125 +typecheck/provenance/build PASS. ส่งregularcommitต่อจากf7ในPRเดิม เก็บfailedrunsเดิม และรอPush/PRCIของcorrectedSHAตามreceipt

Natural36ของf7: historical23/20/4, aware23/19/5; replay36/36ทั้งสอง policy และ rowsSHA256ตรงV49ทุกbyte Push/PRตรงกันด้วย Historical chase6.383s/in-range1223.167s, boss-onlybase damage1357, all-outpostdamageในbosswindow2125, lost3; awarechase5.833s/in-range1053.117s, boss-base damage1078, lost26ทั้งattempt (scopeต่างกันห้ามเทียบlossตรงๆ). Encounterdurationmedian/max23.067/481.533s และ19.75/449.583sตามลำดับ เก็บoutlier/deathcasesไว้ในartifact ไม่ใช่funproof

Frozen `npm run check` PASS:125files /644tests +typecheck/third-party/build. `npm run analyze` PASS6tests. First targeted browser iteration9/9 PASS; final affected44cases, package verification and exact-source Push/PRCI pending at commit time. ผลสุดท้ายและSHAดูreceiptในDraftPR ไม่ถือpendingว่าPASS

เก็บnegativeobservations: firstfullcheck643pass/1failจากoldtestที่คาดให้floatหมุนbody; ปรับexpectationตามownercontractและทดสอบhandmountยังหันได้ Focused4/4GREEN ต่อมาaudithelper.tsติดnode:fstypecheck แก้เป็น.mjsไม่เพิ่มdependency รอบfrozen644ผ่าน ไม่มีthresholdลด/ลบเทสต์

ภาพ [POI Thai720](evidence/v50/working-captures/poi-th-1280.png), [POI EN720](evidence/v50/working-captures/poi-en-1280.png), [Eclipse Thai2550](evidence/v50/working-captures/eclipse-th-2550.png), [Eclipse EN2550](evidence/v50/working-captures/eclipse-en-2550.png), [Entry Thai720](evidence/v50/working-captures/eclipse-entry-th-1280.png) เป็นworkingcaptureจากfirst9testiterationก่อนปรับfallbackcapacity/HCและreviewhooksครั้งสุดท้าย ไม่อ้างexact-finalSHA ภาพfinalsourceทุกviewport/age/body/HC200%เก็บเป็นartifact `v50-visible` ในGitHubE2Eตามreceipt ไม่มีprivateQAภาพใดถูกนำขึ้น

## วิธีเปิดและตรวจด้วยคน

ดับเบิลคลิก `C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat` หรือเปิดPowerShellในโฟลเดอร์นี้แล้วรัน `npm run qa:human`; เข้า `http://127.0.0.1:5173/?qa=1` หลังserverพร้อม หยุดด้วยCtrl+Cและรอworkflowเดิมfinalize
Ownerdocsที่มีการแก้ส่วนตัวทำให้checkoutdirty: อย่าอ้างcleanQAหรือbuildDirtyfalseโดยลบข้อมูลเพื่อหลบgate ตรวจsourceSHA/dirtyflagในreportตามจริง

Clean owner route: เริ่มรอบใหม่ → วิ่ง/ยิงให้ธนูเล็งย้อนทางเดิน → หยุดแล้วปล่อยให้เป้าหมายเปลี่ยนทิศ → สำรวจPOI → อ่านหน้ายุคนานกว่า2วินาที → Tab/Enterเลือกต่อทีละหน้า → ทำฐานและป้องกันBoss → เลือกLegacy/Originเข้าWorld2 → อ่านscarcity/research → สำรวจและตั้งฐานวิจัย ตรวจEN/TH,720p/1080p/จอจริง,200%,reduced/HCตามที่ใช้จริง

ให้ownerกรอกจริงเท่านั้น: Fun, Combat feel, Visible evolution, Meaningful Tech, Base defense, Boss, Replay interest (1–5) และWant another run Yes/No พร้อมจุดติดขัด ถ้าเจอบัคให้INTERRUPTED_BY_BUG ห้ามแทนด้วยHUMAN_FUN_PASS

## สิ่งต้องตัดสินใจต่อ

1. OwnerยอมรับภาพPOI/Eclipseและbodyfacingหรือยัง? ตัวเลขhistoricalFun1/5ยังไม่เปลี่ยน
2. งานearlybehaviorทุกOriginต้องแก้existingapplication/eligibilityแบบเจาะจงและversioned พร้อมbudget/replay/cohort; ไม่บิดeligibilityด้วยweightอย่างเดียว
3. Originalartต้องการsourceframeตรงpose/age/direction/anchorsจริง; runtime tintไม่ใช่artproductionเสร็จ
   ใช้productioninputsเดิมใน [Animation contract](ANIMATION_PRODUCTION_CONTRACT.md), [V46 frame manifest](art/V46_ANIMATION_PRODUCTION.json), [World art spec](WORLD_ART_SPECIFICATION.md); ต้องส่งsourceแยกbody/weapon, transparentPNG, footpivot/socket, front/backและidle/walk/hurt/dash/death/specialที่ยังขาด พร้อมlicense/provenance ไม่ขยายspriteเล็กแล้วนับเป็นsourceartใหม่
4. Physical60Hz/Parsec/GPUpresentationยังไม่รับรอง ไม่ลดthresholdหรือแตะremoteaccess
