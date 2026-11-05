# V5.2 — verified engineering, visible source detail, honest41-item closure

## Baseline and source
เริ่มใน C:\Users\MewMew\Desktop\Co-op\-SEED จาก2f48b37476305b7663b3ae9ff2c536c2b32ca75e / DraftPR42. ตรวจ Push41903595554 และ PR41903625455 แล้วสำเร็จ12/12; final receipt ของPR42อัปเดตแล้ว ไม่มีการรันซ้ำ
Branch feat/v52-closure-combat-20261105 จากHEADจริงหลังfetch ไม่ใช่mainเก่า. ก่อนเริ่มมี owner edits2เอกสารและ .cursor/launcher/private report; สำรองในscratchและแยกจากpublic index
Final source/PR/CI/decisionอยู่ใน V5.2 Draft PR receipt. ห้ามใช้ข้อความpendingในpacketแทนผลจริง

## สิ่งที่เปลี่ยนจริง
|สิ่งที่ผู้เล่นเห็น|ก่อน|หลัง|ขอบเขต|
|---|---|---|---|
|การ์ดดาเมจ|Damage1→1.12 ชวนเข้าใจว่าเป็นดาเมจต่อhit|ตัวคูณ×1→×1.12 และKinetic base hit12→13.44แยกกัน|ค่าพื้นฐานก่อนเกราะ/คริติคอล ไม่สัญญาDPSหรือว่าทุกนัดโดน|
|การ์ดจำนวน/คูลดาวน์|โบนัส0→1เหมือนจำนวนกระสุนทั้งหมด|ระบุว่าเป็นโบนัส; จำนวนยิงจริงยังแสดง1→2; ช่วงห่างยิงจริง0.9→0.81s|เคารพfloor×0.3 ไม่อ้างว่ากับดัก/ออร่าซึ่งใช้นาฬิกาคงที่จะเร็วขึ้น|
|High Contrast +Reduced Field mine|ยังใช้สีตระกูลและกะพริบ แม้เปิดaccessibility|ขอบตัวกับดัก/วงรัศมีขาวคงที่ หยุดกะพริบเมื่อReduced|รัศมีและตำแหน่งcanonicalเดิม ไม่เพิ่มhitboxหรือeffect engine|
|ตัวละครชุดหกยุคที่ใช้จริง|atlas128px/cell ลดรายละเอียดจากsource|resliceต้นฉบับหน้า/หลัง48ช่องเป็น256px/cell|ขนาดตัว126u จุดเท้า116/128 และframe IDsเดิม ไม่มีท่าใหม่|

ภาพต้นฉบับfront/back1536×1024รองรับการresliceนี้จริง ไม่ได้ขยายbitmap128เดิม. Atlasจริง768×1024→1536×2048; sourcePNGเดิมไม่เปลี่ยน; logical alpha-boundต่างสูงสุด1pxจากresampling. Base-levelRGBAเพิ่ม9MiB; ไม่เรียกค่านี้ว่าGPU memoryที่วัดจริง และไม่รับรอง60Hz
ตรวจเส้นทางrendererแล้วจึงเลือกatlasที่ใช้จริง ไม่ส่งการขยายlegacy4-Origin posesที่ไม่ใช่playercostumeหลัก. Hunters Stone/Space reference/attack clipsเดิมยังอยู่ ไม่มีการแทนด้วยท่าถือปืนผิดยุค

## P0 และ41รายการ
[ทุกID1–41](V52_ISSUE_LEDGER.md) แสดงowner wordingที่มี, root/hypothesis, previous fix, remaining gap, V5.2 action, evidence, dispositionและhuman gateแยกกัน
P0ใช้regressionเดิม: held Space/Enter/WASD, age acknowledgement, movement release, queued decisions, map-known POIและfloating body/muzzle. เคสที่ไม่reproduceยัง HUMAN_RETEST_REQUIRED ไม่อ้างว่าcomplaintหายจากunitPASS
ไม่มีการรื้อinputarchitecture/menus/sharedUI. Thai/English,200%,keyboard selectionและnaturalfirstdraftเป็นbrowsergate; worldauditมีexploration/dense/Bossที่720/1080/2550 แต่ไม่ใช่physicalperformance

## Combat slice และข้อสรุปที่ไม่ฝืนหลักฐาน
|เส้นทางเดิม|เริ่ม|Techแรกที่เปลี่ยนพฤติกรรม|ตำแหน่งและข้อแลกเปลี่ยน|
|---|---|---|---|
|Hunters Kinetic|1นัดเล็งเป้า|Split volleyเพิ่มเป็น2นัดจากreleaseจริง|นัดแรกเล็งเดิม อีกนัดแยกแนว; ไม่รับประกันว่าทุกนัดโดนเป้าเดียว|
|Resonant Energy|กระสุนโดนเป้าเดียว|First arcโดนศัตรูที่อยู่ใกล้ต่อจริง|ใช้คลัสเตอร์; existingConductionไม่มีpushback จึงมีความเสี่ยงด้านพื้นที่|
|Hunters Field|วางกับดักด้านหลัง1จุด|Layered trapsวาง2จุดจริง|เดินล่อแนวไล่ตาม; ไม่วางกับดัก/ให้ความเสียหายปลอมในUI|
Canonical Content27เดิมและreal emission/damage/collision regressionsยังใช้. V5.2เพิ่มความชัดของผล ไม่เพิ่มHP/damage/density/cadence. First-opportunity audit12/12และnegative balanced smoke3/4ไม่เลือกพฤติกรรมยังคงไว้ ไม่แต่งfun score
ข้อสงสัยshared aura timerถูกทดสอบก่อน: fixtureแรกเลือกEngineersซึ่งไม่มีFieldเป็นข้อผิดพลาดของผู้เขียน; แก้เป็นHuntersแล้วการนับimpactของทั้งสองออร่าไม่หาย จึงไม่แก้runtimeจากhypothesisนี้

## Boss, World2 และsimulation evidence
V48มีfixed-cadenceablationเดิมซึ่งให้ผลเชิงพื้นที่ผสมกัน ไม่ใช่fullNatural36causaldiagnosis. V5.1C27แย่ลงจากC26: historicalถึงBoss23→17 ชนะ20→16 ตาย4→5; defender-aware23→17,19→15,5→6. ไม่โยนสาเหตุทั้งหมดให้cadenceหรือปรับบอตเพื่อให้เปอร์เซ็นต์ดี
ดู [ผลสองนโยบายจริง](evidence/v52/v51-ci-cohorts.json). Replay36/36ทั้งสอง; Push/PRrowsเหมือนกัน. Historicalbase losses1เป็นช่วงBoss; aware20เป็นทั้งattempt จึงไม่เทียบข้ามscope
V5.2ไม่เปลี่ยนsrc/coreหรือsrc/contentแม้แต่ไฟล์เดียว: [source identity](evidence/v52/canonical-identity.json). Worldgen3/Content27/Save3/child18เดิม; Save migration/childinheritance/replayคงcontract. Natural36ไม่รันซ้ำในเครื่อง; mandatoryCIใช้กติกาเดิม
Boss phases/actualOutpost assaults/HP/loss/repair/warnings/lockedgeometryคงเดิม. ไม่เพิ่มBossHP/Damageโดยไม่มีหลักฐาน. World2ยังใช้Eclipse, scarcity,Researchmultiplier,actualraidและdefer/trackจากV5.1 ไม่สร้างeconomyหรือDirectorใหม่

## Original art และmulti-weapon
**IMPROVED_PENDING_HUMAN** เฉพาะรายละเอียดของ48costume posesที่มีจริง. **ART_SOURCE_BLOCKED** สำหรับcontinuousauthoredgait,turn/windup/release/recoveryทุกOrigin/Age/direction,consistentBossposesและterrainproductionที่ยังขาด
Inputsใช้ [production manifest](art/V46_ANIMATION_PRODUCTION.json) และ [animation contract](ANIMATION_PRODUCTION_CONTRACT.md):แต่ละOrigin/Age/action,จำนวนเฟรม/เวลา,หน้า/หลัง,RGBAโปร่งใส,editableoriginal,foot/pivot,weapon socket/muzzle,sha256และlicense/provenance. ไม่มีการผลิต192ลำดับปลอม. Environmentใช้WORLD_ART_SPECIFICATION.mdเดิม
**DEFERRED_WITH_REASON** สำหรับหลายprimary: weaponRig/weaponTransform/primary releaseยังมีownerเดียวและหนึ่งsocket. Secondaryprojectile/orbit/guardianมีcanonicaldamageจริง แต่ไม่ได้มีprimaryemitter identityอิสระสำหรับอาวุธหลายชิ้น
Minimum contractก่อนขยาย: stableemitterId+canonicalowner/family/stage,ownrig+releaseclock,sharedboundedpool,projectile→emitterbinding,canonicalmuzzle→renderer socket,swap/equipreplay/save compatibility และไม่มีdouble damage. ไม่เพิ่มอาวุธประดับที่ดูเหมือนยิงโดยไม่มีownership

## Verification และข้อจำกัด
RED: missingactualhit/interval facts, minecontrast/reduced flags,256sourceatlas/frame registration,oldbrowsercard. GREENและfinalcountsอ่านreceiptตามจริง
เก็บlocalfailures:ผิดOriginในaura fixture,Thaiimportinsertionerrorระหว่างแก้,preflighttypecheckใช้Nodeimport/Array.atไม่ตรงES2020. แก้ตามexistingtesttooling ไม่เพิ่มdependencyหรือเปลี่ยนthreshold
ภาพworldauditเป็นsoftware/headlessbrowserstaging ไม่ใช่humanrunหรือphysical60Hz. Simulation,renderCPU,frameinterval,GPUcompletion/presentationเป็นคนละชั้น. **PERFORMANCE_INCONCLUSIVE** สำหรับphysicaldisplay;ไม่แตะParsec/remoteaccess
มีauthorreviewและtargetedtests;ไม่มีการอ้างfreshindependentreviewที่ไม่ได้ทำ. Fullcheck/package/exact-sourcePush+PRเป็นfinalgates ไม่ลดงบหรือassertionsเพื่อให้เขียว

## เปิดเล่นและเกณฑ์ให้คุณยืนยัน
หลังfinalCIผ่าน:ปิดQAเก่าด้วยCtrl+Cแล้วดับเบิลคลิก C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat หรือnpm run qa:human ในโฟลเดอร์นี้ เปิด http://127.0.0.1:5173/?qa=1. ใช้รอบใหม่และseed EPOCH-GOLDEN-001;ไม่ใช้debuggrant/teleportในcleanplaytest
1. Hunters:ยิงเริ่มต้น→เลือกSplitvolleyหรือLayeredtrapsเอง→ลองเปลี่ยนแนวและเดินล่อ. Resonantอีกหนึ่งรอบลองFirstarcกับกลุ่มศัตรู
2. อ่านตัวคูณ/ดาเมจ/ช่วงห่างบนTech;ปล่อยปุ่มเดินแล้วใช้Tab/Enterเลือก. ทดสอบageContinue/Logisticsเต็มLater/กลับมาเดินตามเส้นทางเดิม
3. ลองEngineers/Resonant/Sentinelsที่ยุคต่างกันเพื่อตรวจรายละเอียดcostume;HuntersStone/Spaceยังเป็นreferenceclipsเดิม. ลองHC/Reduced/TH200%ตามที่ใช้จริง
4. Bossโจมตีฐานจริง→ป้องกัน/ซ่อม→AscendWorld2→Researchvsกลับป้องกันraidจริง. การเดินทางและการตัดสินใจต้องให้คุณรับรอง
ให้คะแนนจริง1–5:Fun,Combatfeel,Visibleevolution,MeaningfulTech,Basedefense,Boss,Replayinterest;WantanotherRunYes/No. BaselineยังCombat1/5และUpgrade2/5 ไม่สร้างคะแนนใหม่. Bugให้INTERRUPTED_BY_BUG
Nextownerdecisions:ภาพชุดที่ละเอียดขึ้นยอมรับหรือไม่,buildไหนเล่นสนุกกว่า,ช่วงใดติดขัด,จะผลิตsourceartคลิปใดก่อน. ไม่ต้องทำexternalresearchใหม่สำหรับการแก้สองบั๊กนี้

Fullcheckก่อนแก้metadata662PASS/1FAIL: assetcontractต้องระบุslicing/resizeในmodifications; ปรับคำบรรยายให้ตรงoperationจริง ไม่เปลี่ยนassertion/thresholdหรือsourceimage แล้วรันfinalcheckใหม่เพราะfailureนี้

Owner checkoutยังมีtrackedprivate-document edits จึงอาจแสดงbuildDirty=trueตามจริง ห้ามลบ/ซ่อนเพื่อเปลี่ยนcleanflag;ตรวจsource/SHAและcodeidentityในreceiptแยกกัน การเล่นไม่ใช้debugยังเป็นhumanretestได้ แต่ไม่อ้างclean-buildcertificationจากflagที่ไม่ผ่าน

Final local evidence: npm run check PASS663/663testsใน130files รวมtypecheck/provenance/build; frozen relevantbrowser39/39PASS รวมnaturalfirstdraft,heldinput,ageack,POI,float,TH/EN200%,newcostumeidentitiesและrealmines. รูปก่อน/หลังกับrawtimingsอยู่ในdocs/evidence/v52/README.md
Shortheadlesswindow:simulationp95~0.6ms,renderCPUsubmissionp95~1.9ms,browserframeintervalp95~36.3ms(82/83samples). ไม่ผ่าน16.67msในwindowนี้ ไม่ใช้แทนGPUcompletion/physicalpresentation และไม่เปลี่ยนthreshold. รอexact-sourceCI/packagereceiptก่อนHUMAN_RETEST_READY
