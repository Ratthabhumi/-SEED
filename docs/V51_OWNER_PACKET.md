# V5.1 — Early Build Identity / owner packet

เริ่มจาก18ec2b51b2af5ee90231a9eb7235ba7d6fd56d2f / Draft PR41 บนโฟลเดอร์หลัก `C:\Users\MewMew\Desktop\Co-op\-SEED`; branch `feat/v51-early-tactics-20261105` จากHEADจริง ไม่ใช่mainเก่า
เริ่มงานมีowner edits2เอกสาร, .cursor, Play-SEED-QA.bat และรายงานQAส่วนตัว สำรองไว้ในscratch/v51-owner-backupและไม่รวมข้อมูลส่วนตัวขึ้นGitHub
FinalSHA/PR/CI/decisionให้อ้างอิงreceiptในDraft PRรอบนี้ เอกสารนี้บันทึกขอบเขต ไม่ถือpendingว่าPASS

## งานที่ผู้เล่นเห็น

|ระบบ|V5.1|สถานะ|
|---|---|---|
|Early TechทุกOrigin|4branchถูกกฎหมายบนfoundationเดิม; เลือกกระสุนแยกแนว/อาร์ก/กับดักซ้อน/ใบมีดวงพิทักษ์ จากmechanicsจริง|IMPROVED_PENDING_HUMAN|
|Offer|ก่อนเลือกTechครบ2ครั้งในWorld1 Stone leveldraft ปกป้อง1โอกาสพฤติกรรมจากGumbelrankเดิม; ตัวเลข/recipe/reserveยังอยู่ ผู้เล่นไม่ถูกบังคับเลือก|FIXED_ENGINEERINGเฉพาะช่องว่างopportunity|
|Combat|ปล่อยกระสุน1→2จริง, chainส่งdamageต่อจริง, ทุ่นระเบิด1→2จริง, ใบมีดโดนอีกด้านจริง; HP/damage/cooldown/enemy/Bossไม่ได้ถูกbuffทั้งเกม|IMPROVED_PENDING_HUMAN|
|Tech UI|คำอธิบายวิธีใช้ใบใหม่และbefore/afterจากcanonicaleffects; รายละเอียดยาวเลื่อนภายในการ์ด ปุ่มเลือก/สำรองประจำที่ ใช้sharedUI/assetเดิม|IMPROVED_PENDING_HUMAN|
|World2|แสดงknowledge multiplierจริงก่อน/หลังResearch ณฐานที่เป็นเจ้าของ พร้อมraidจริง; เลือกลงทุนหรือเลื่อนไว้แล้วtrackฐานถูกบุก ไม่มีteleport/รางวัลฟรี|IMPROVED_PENDING_HUMAN|
|World2dialog|ภาพ720pเดิมปุ่มป้องกันฐานหลุดfold → grid3ตัวเลือก+footerที่เห็นได้ในขนาดปกติ; 200%ยังเลื่อนและใช้keyboardได้|FIXED_ENGINEERING / HUMAN_RETEST_REQUIRED|
|P0เดิม|ageacknowledgement/body-facing/Space/WASD/POI/6of6ใช้ระบบที่มีแล้ว ไม่เขียนซ้ำ|VERIFIED_EXISTINGเมื่อfinaltestsผ่าน; ยังต้องเล่นยืนยัน|

## ก่อน/หลัง Early Offer

ดู [audit](evidence/v51/early-offer-audit.json), reproduce `node node_modules/vite-node/vite-node.mjs scripts/audit-v51-early-tactics.mjs` (เขียนscratchเท่านั้น)

|3seeds ×4Origins|V5.0 / C26|V5.1 / C27|
|---|---:|---:|
|มีbasebehavior nodeถูกกฎหมาย|4/12|12/12|
|firstleveldraftเสนอbasebehaviorจริง|2/12|12/12|

FirstbehaviorIDsที่ปรากฏมีtactical-kinetic, tactical-energy, tactical-defense, stone-trap ไม่ได้สุ่มซ้ำจนได้ใบที่ต้องการ ไม่แอบข้ามprerequisite/ให้Techฟรี และไม่แทนstatทั้งหมด
100knowledgeในmatrixเป็นstagingเพื่อเปิดdraft ไม่ใช่เวลาจากการเล่นธรรมชาติ ค่าsourceSHA256LFผูกกับไฟล์canonicalที่ตรวจแล้ว

## Short core-loop smoke — เก็บผลด้านลบ

ใช้historicalbalancedcontrollerเดิม1seed/4Origins capped60sim seconds ไม่มีgrants/teleports/HP editsในsmokeนี้

|Origin|firstbehavioroffer|firstchoice|firsteffectivepatternobserved|kills/60s|
|---|---:|---:|---:|---:|
|Hunters|16.617|16.633|ไม่พบใน60s|111|
|Engineers|14.150|14.167|ไม่พบใน60s|95|
|Resonant|14.383|14.400|49.867|110|
|Sentinels|14.283|14.300|ไม่พบใน60s|84|

ทุกcaseจบtime-limitที่60s/Stone ไม่ตาย ไม่ถือว่าเป็นvictoryหรือhumanplaytest Botยังให้น้ำหนักFire/Toolsrecipe จึงไม่เลือกใบพฤติกรรมใน3/4cases ห้ามปรับbotเพื่อให้ผลดูดีขึ้น ไม่เทียบเวลา180sprotocolคนละแบบแล้วอ้างimprovement
Owner Combat1/5 /Upgrade2/5 และอยากลองbuildแต่ยังไม่สนุก ยังคงเป็นคะแนนล่าสุด ไม่มีคะแนนใหม่

## Compatibility และ Civilization loop

Worldgen3 / **Content27** / Save3 / childlaws18
เพิ่มTechcontentและlevel-offerpolicyอย่างตั้งใจ; seed/replayidentityเปลี่ยนตามContentversion ไม่มีSave schemaใหม่ ไม่มีduplicateeconomy/director/Inventory
Techgraphในchildมีใบใหม่ด้วย แต่openingprotectionไม่ใช้ในchild; scarcity×0.8/researchbonusสองเท่าและraidintervalเดิมไม่เปลี่ยน
Originloadout/ability, Outpost Research/Military/Economy, Bossassault/repair/realHP, Archive/Insight/5cosmetics และWorld2inheritanceเป็นระบบเดิม ไม่อ้างว่าเขียนใหม่
งานBoss/Multi-emitter/192animationไม่ขยายในรอบนี้ ไม่มีการจูนwinpercentage แก้ดาเมจรวมหรือmassdensity

## 41ข้อและงานภาพ

ดู [ledger41รายID](V51_ISSUE_LEDGER.md) คงทุกหมายเลข พร้อมrootcause/status/delta/evidence/human gate ใช้ถ้อยคำกลุ่มตรงตามเอกสารowner ไม่แต่งข้อความต้นฉบับรายข้อที่ไม่มีให้
ภาพที่เปลี่ยนจริงคือtacticalcardและscarcitydialog EN/TH720/1080/2550; hero/enemy/Boss/FOV/hitbox/sourceartไม่ถูกขยายเพื่ออ้างhighresolution
ART_SOURCE_BLOCKED: authoredanatomy/pose/frames/fashion/terrainproductionตาม [contract](ANIMATION_PRODUCTION_CONTRACT.md), [frame manifest](art/V46_ANIMATION_PRODUCTION.json), [world spec](WORLD_ART_SPECIFICATION.md). Runtimepalette/scaleไม่แทนsourceart
Native60Hz/physicalGPU presentation/Parsecยังไม่รับรอง ไม่มีการแตะremoteaccessหรือthresholds

## Verification และข้อผิดพลาดที่คงไว้

TDD: earlypool/offer3RED→GREEN, World2query2RED→GREEN, actual720pdefensecontrolRED(viewport ratio0)→responsivefix, already-unlockedchainRED→marginalopportunityguard
Targeted35testsPASSรวมRNGisolation/child/recipe/muzzle; strictversionassertเปลี่ยน26→27ตามversionedcontent ไม่เปลี่ยนruntimeให้เข้ากับassumptionเก่า
Browserfirstiteration8World2casesผ่านแล้วหยุดเพราะauthorใช้QA-onlyOriginselectorในe2e route; แก้ใช้OriginUIจริง อีกlayoutiteration11PASS/1FAILเพราะunscoped.terr-spec-btnชนhiddenHUDbutton แก้scope#spec-screen ไม่เปลี่ยนruntimeหรือใช้forceclick
Onefreshwhole-changereviewไม่พบactionableissue; reviewerไม่ได้รันtest/build ผลfinalfullcheck/browser/analyze/Natural36/package/CIต้องอ่านreceipt ไม่ยืมPASSเดิมมาเป็นSHAใหม่
Fullcheckรอบแรก654PASS/1FAILจากoldinitialpool≤9assertion: designเพิ่ม2legalbranchesต่อOriginไว้ตั้งแต่ต้น จึงคง≤9ให้non-tacticalpoolเดิม เพิ่มexactfamilybranchcountและassertactualhand3 ไม่ลดperformance/CIthreshold และไม่แก้runtimeเพื่อซ่อนpooldelta เก็บfailedlogไว้

Natural36 C26baseline: historicalreached23/won20/dead4; aware23/19/5 รวมฐานเสียหาย/death/outlierเดิมเป็นnegativeevidence รายงานผลC27จริงจากสองpolicyอิสระ ไม่เปลี่ยนcontroller ไม่มีtargetwinrate

## เปิดและทดสอบด้วยคน

ดับเบิลคลิก `C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat` หรือรัน `npm run qa:human` ในโฟลเดอร์นี้ เข้า `http://127.0.0.1:5173/?qa=1`; หยุดCtrl+Cแล้วรอworkflowfinalizeเดิม
Ownertrackedเอกสารส่วนตัวทำให้checkoutdirtyตามจริง ไม่ลบ/ซ่อนเพื่อหลอกcleanflag; sourcebranch/SHAและCIreceiptแยกชัดเจน

Owner route: World1เลือกใบพฤติกรรมจริงช่วงต้น → ทดลองยิงเข้ากลุ่ม/คุมแนวเข้าหา/เดินล่อผ่านกับดัก → สังเกตผลเทียบกับstat/recipe → อ่านAgeและเลือกต่อด้วยTab/Enter → claim6of6/Later → Bossป้องกันฐานตามเดิม → AscendWorld2 → เปิดฐานResearchขณะมีraidจริง → เปรียบเทียบลงทุนกับtrackฐานแล้วกลับไปป้องกัน
เล่นอย่างน้อยสองbuildที่ต่างกัน เลือกเอง ไม่ต้องทำตามbot ทดสอบจอ/ภาษา/200%/HC/reducedตามที่ใช้จริง
กรอกจริง1–5: Fun, Combatfeel, visibleevolution, meaningfulTech, basedefense, Boss, replayinterest; WantanotherRun Yes/No และจุดติดขัด พบbugให้INTERRUPTED_BY_BUG ไม่แต่งHUMAN_FUN_PASS

Decisionในfinalreceipt: **HUMAN_RETEST_READY**เมื่อengineeringgatesของSHAสุดท้ายผ่านครบ มิฉะนั้น**NOT_READY**พร้อมfailure/pendingที่ระบุจริง ยังไม่ถือว่าปิด41ข้อ/ART_COMPLETE/NATIVE_60HZ_PASS/BUG_FREE

การตรวจภาพท้ายรอบพบปุ่ม Select/Reserve หลุดขอบ720pจริง จึงเพิ่มviewport regression (RED) และแยกส่วนรายละเอียดที่เลื่อนออกจากปุ่มประจำที่ (ผล GREEN ใน final receipt); ไม่เปลี่ยนการเลือกหรือค่า simulation
