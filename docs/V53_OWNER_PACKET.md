# V5.3 — อาวุธจริงหลายชิ้นและเลือกด้วยภาพ

**PARTIAL / FAILED_REGRESSION: ยังไม่อนุมัติ clean playtest หรือ release**

เริ่มจาก7c8fc553e22a3ffc7e4eafaa2da5c4ac1930fe70 บนfeat/v52-closure-combat-20261105 / DraftPR43 ตรวจPush41941538766และPR41941584623สำเร็จ12/12 สร้างfeat/v53-visual-weapons-20261105จากHEADนี้ ใช้primary owner checkoutที่บ้าน ไม่ใช้v39 worktree ไม่ทำresearch ไม่เพิ่มdependencies ไม่merge/publish/force-push

## สิ่งที่เห็นและเล่นได้จริง
- ก่อนมีorigin-pairเปิดฟรีแต่rigหลักเดียว ตอนนี้defaultเริ่มsignature1ชิ้น เพิ่มผ่านTechยุคหินได้ทุกOrigin สูงสุด3unique families มีID/ownerจริง ไม่ต้องซื้อArchive อาวุธยิงkinetic/energyลอยแยก ใช้rig/clock/ปากกระบอกตนเอง ผ่านpoolเดิม ไม่เพิ่มdamageซ้ำ Fieldคือกับดักในโลก Defenseคือorbit/guardianจริง
- แก้multi-target bugที่เล็งจากemitterแต่ยิงเลือกเป้าจากตัวละคร ทำให้รอเล็งตลอด ตอนนี้เล็ง/ยิงใช้queryเดียวกัน แยกaura/hit clocks ไม่แย่งกัน และorbitเดินหนึ่งครั้งต่อstep
- การ์ดใช้ภาพatlasต้นฉบับ คำสั้น ผลจริง และstaticแนวโจมตีที่รองรับ ข้อมูลเทคนิค/คุณภาพ/แผนอยู่Detailsเดียว Tab/Escapeกลับได้ ปุ่มเลข/EnterในDetailsไม่เลือกDraft เผยคำอธิบายปุ่มผ่านHelp ไม่ลบทิ้ง
- หน้าOriginมีstarter pictureและตัวอย่างBuild HUDแสดงช่อง/ขั้น/cooldownตามownership TechMap/charge/guardianไม่แสดงfamilyที่ยังไม่มี
- Save4บันทึกทั้งรอบผ่านPause→บันทึกแล้วกลับหน้าหลัก→เล่นต่อ กู้5RNGstreams อาวุธและจังหวะยิง ไม่เริ่มattemptใหม่ ไม่ปลูกloadoutในรอบใหม่ รักษาประวัติของสะสมในattempt Save1–3เก็บInsight/collectionเดิม Checkpointผิดเวอร์ชัน/เสียหายถูกปฏิเสธ
- World2คงIDอาวุธและกลับขั้นแรก เปลี่ยนOriginจะเปลี่ยนsignature ถ้า3/3และยังไม่มีsignatureใหม่จะแทนช่องหลักเดิม มีข้อความแจ้ง ไม่แอบให้ช่องเพิ่ม

Worldgen3 / Content28 / Save4 / child-laws18. Archive energy startที่เลือกเองเดิมยังอยู่และกินช่องจริง ไม่ใช่starterฟรีสากล

## หลักฐาน3Build
Controlled600steps/10s, seedEPOCH-GOLDEN-001, stationary high-HP targets, squad/spawn suppressed; acquisition/tacticผ่านchooseDraftจริง ไม่ใช่Natural36หรือhuman fun:

|Build|Damageจริงในfixture|
|---|---|
|Hunters projectile+chain|kinetic132, energy100, chain75|
|Hunters projectile+traps|kinetic132, Field616|
|Resonant energy+orbit|energy100, Defense200|

ใช้พิสูจน์การทำงาน ไม่ใช้เทียบDPS/สมดุลเพราะจัดสนามเพื่อทดสอบ ฟิกซ์เจอร์เดิมที่เคยได้secondaryฟรีเปลี่ยนให้acquireผ่านTechจริง ไม่ลบtests ไม่แก้historical/defender-aware controllers

## ผลลบและข้อค้าง
npm run analyzeยังไม่ผ่านClassC: offer JSD Hunters/Sentinels0.081619(<เกณฑ์>0.10), first-pick JSD Hunters/Engineers0.0098(<เกณฑ์>0.035) หลังstarterเหลือหนึ่งชิ้น ตัวเลือกบางOriginคล้ายกันเกินcontractเดิม หยุดทดลองปรับน้ำหนักเพิ่ม ไม่ลดthreshold/เปลี่ยนบอต/เลือกseedเพื่อให้เขียว

Candidateรอบแรกมี36unit failures จากacquisitionขาดfoundationจนgraphหลายroot, fixturesสมมติsecondaryฟรี และaim/fireเลือกคนละเป้า แก้สาเหตุและเก็บnegative evidence ผลสุดท้าย/exact-SHA CIอยู่PR receipt ถ้ามีfailureยังถือว่าไม่ผ่าน

[ledger43ข้อ](V53_ISSUE_LEDGER.md)เก็บ41ข้อเดิมและเพิ่ม42/43 ไม่อ้างปิดหมด Boss/defense/terrain/director/collection economyคงเดิมและยังรอhuman acceptance Fun baselineยังเป็นowner1/5 ไม่มีคะแนนใหม่

Artใช้atlasเดิม ไม่อ้างต้นฉบับใหม่/animationครบ ส่วนที่ขาดยังART_SOURCE_BLOCKEDตาม[manifest](art/V46_ANIMATION_PRODUCTION.json)และ[contract](ANIMATION_PRODUCTION_CONTRACT.md) PerformanceยังINCONCLUSIVE: headless/CIไม่ใช่physical60HzหรือGPU/monitor completion

## เปิดและลองเล่น
ที่C:\Users\MewMew\Desktop\Co-op\-SEED ดับเบิลคลิกPlay-SEED-QA.batเดิม หรือnpm run qa:human รอserverพร้อมแล้วเปิดhttp://127.0.0.1:5173/?qa=1 หยุดด้วยCtrl+C รอfinalizationเดิม ไม่แก้launcher/.cursor/privateQA

ตอนนี้เป็นdiagnostic retest: เริ่มใหม่ตรวจ1อาวุธ เลือกTechเพิ่มจน2/3→3/3 ตรวจปากกระบอกแยก/ไม่ต่อย เปิดDetailsด้วยkeyboard เปลี่ยนEN/TH/200% Save→Title→Continue และWorld2 ห้ามเรียกcheckpoint resumeว่าfresh clean playtest

หลังgateผ่านค่อยให้ownerตอบFun, Combat feel, Visible evolution, Meaningful Tech, Base defense, Boss, Replay interestอย่างละ1–5 และอยากเริ่มอีกYes/No ใช้คำตอบจริงเท่านั้น

ให้ChatGPTช่วยตัดสินเฉพาะOrigin differentiation: ภายใต้starter1ชิ้นและ3ช่องอิสระ ควรทำให้Originต่างผ่านability/behavior/biasจุดใด และมีหลักฐานอะไรแยกความต่างที่คนรู้สึกจากdomain-first-pick proxyเดิม ไม่ลดเกณฑ์เพียงเพราะรอบนี้ไม่ผ่าน

## Local verification receipt
Fullcheck:670/672ผ่าน,2fail; energy-charge fixtureที่แก้metadataแทนownershipได้รับการแก้เป็นfresh unowned runและtargeted6/6ผ่าน เหลือClassC FAILED_REGRESSION Typecheck/provenance/production buildผ่าน Browsercandidate27/29ผ่าน สองfocus-order expectationsปรับตามHelpที่เพิ่ม แล้วfinal relevant7/7ผ่าน EN/TH200%/720p, acquisition/renderและSave/Continue

[ข้อมูลผลตรวจ](evidence/v53/local-verification.json) · [ภาพไทย720p](evidence/v53/choices-th-1.png) · [ภาพEnglish200%](evidence/v53/choices-en-2.png)
Exact-SHA build/package, Natural36และCIตามPR receipt ไม่เอาผลparentมาอ้างเป็นผลcandidate
