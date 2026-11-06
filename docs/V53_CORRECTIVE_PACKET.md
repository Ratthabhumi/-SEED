# V5.3 corrective — paired baseline recovery

Status: candidate pending final verification. Same DraftPR44; no new PR/merge/release/deploy. Start450f9e2 onfeat/v53-visual-weapons-20261105 in the primary owner checkout. Upstream0/0; preserved owner modifications/privateQA/.cursor/launcher. Previous final CI is now fully known: render_evidence passed both events; full browser37fail/299pass/1skip, verify failed ClassC, analyze skipped. Those failures remain historical evidence.

## สรุปสำหรับเจ้าของเกม

รอบนี้แก้ PR44 เดิม ไม่เปิดPR45 ชุดเริ่มต้นคืนเป็นอาวุธคู่เดิมของแต่ละOriginภายใต้Weapon Instanceจริง และยังหาเพิ่มช่องที่สามได้ตามปกติ ไม่เพิ่มดาเมจ/HPหรือเปลี่ยนศัตรูเพื่อกลบผล

พบและแก้สาเหตุเพิ่มสองจุด: อาวุธช่องสามเปลี่ยนเป้าขณะเล็งจนไม่ยิง กับSave4ที่ปฏิเสธค่าRNGติดลบที่ระบบสร้างได้จริง ตรวจการบันทึก/โหลด/เล่นต่อและWorld2ด้วยregressionจริง Content29ยังรับcheckpoint Content28โดยคงอาวุธที่บันทึกไว้ ไม่แอบให้อาวุธเพิ่ม

คืนชุดคู่เพียงอย่างเดียวยังไม่ผ่านClassC จึงแก้หนึ่งจุดที่สาเหตุ: ไม่แทรกบังคับอาวุธใหม่ก่อนTechประจำOriginในสองตัวเลือกช่วงเปิดเกม อาวุธใหม่ยังสุ่มเสนอได้ และจะถูกนำเสนอชัดหลังช่วงเปิดเกม ผลJSDผ่านเกณฑ์เดิม ไม่ปรับน้ำหนัก/ลดเกณฑ์/แก้บอต

ผล45/45เฉพาะส่วนและClassCผ่านแล้ว แต่ต้องรอfull check, Natural36ทั้งสองนโยบาย, packageและexact-source Push+PR CIครบก่อนรับรอง HUMAN_RETEST_READY ผลเสียของ450f9e2ยังเก็บทั้งหมด ([37Browser failures](evidence/v53-corrective/previous-browser-failures.json), Historical36เดิมและdefender-awareในPRreceiptก่อนหน้า)

การเลือกอาวุธรองก่อนเริ่มเกมเลื่อนไว้โดยมีเหตุผล: ต้องเพิ่มsetup inputและตรวจsave/World2/สมดุลหลายชุด เพิ่มขอบเขตเกินการฟื้นbaselineรอบนี้ อาวุธคู่เดิมและการเลือกช่องสามทำงานก่อน ไม่มีinventoryซ้ำ

เมื่อผ่านEngineeringแล้ว ให้เล่นรอบใหม่ผ่านBATเดิมเพื่อให้คะแนนความสนุก/การต่อสู้/Tech/การป้องกันฐาน/บอส/อยากเล่นซ้ำตามจริง คะแนนเดิม1/5ยังไม่ถูกแทนที่ และงานภาพต้นฉบับกับnative60Hzยังเป็นคนละgate รายงานผลสุดท้ายภาษาไทยอยู่PR44receipt

## Changes and causes
- Restore each configured Origin pair as two real owned instances; third slot is a legal progression choice. Hunters=Kinetic+Field; Engineers=Kinetic+Defense; Resonant=Energy+Field; Sentinels=Energy+Defense. Same stage stats/HP/damage/difficulty/director and three-slot cap. Archive Energy uses the third slot once; no duplicates.
- One-starter removal suppressed the original secondary damage/coverage and changed eligibility. Three-case180s ownership A/B supports early recovery, not a full causal claim about Boss deaths: Hunters HP100→171, Engineers100.6→142, Sentinels82.8→151. Policy choices/maximum HP can differ; do not treat rawHP as normalized survival. [Raw experiment](evidence/v53-corrective/starting-pair-ablation.json) includes first-Tech timing, kills, damage, firing families and HP samples.
- Simply restoring the pair did not pass offer divergence (HE0.0044, HR0.0029, HS0.0080). Root cause: forcing a globally accessible acquisition ahead of opening tactics consumed distinctive offer space. One targeted correction preserves the existing Origin tactic opportunity during the first two opening choices. Acquisitions remain in the weighted legal pool then are explicitly surfaced after that opening; no weights/seeds/controller/threshold edits.
- Corrected ClassC: offerJSD HE0.2607/HR0.1617/HS0.4577, first-pick HE0.4438/HR0.4642/HS1.0, all above unchanged thresholds. Focused core/offer/save45/45PASS (plus ClassC in separate17-test batch).
- Actual third-emitter regression: a moving rig repeatedly changed nearest targets and never settled to release. Each rig now retains one live in-range target through aim/release, reacquiring after invalidation. Target pool index is canonical, hashed and saved. Real dense-target multi-weapon regression is GREEN; no synthetic damage/events.
- Actual Save4 defect: RNG snapshots legitimately contain signed32-bit XOR words, previously rejected as invalid unsigned values after Field deployment. Restore validates signed/unsigned32-bit words without normalization, preserving exact state and future replay.

## Compatibility and presentation
Worldgen3/Content29/Save4/child-laws18. No schema redesign. Content28 Save4 checkpoints remain accepted and keep their exact saved inventory (including one weapon), rather than receiving free paired weapons. Save1–3 profiles/Insight/collection retained. Fresh restart returns to the configured pair. World2 preserves acquired IDs and explicit signature transition; it never duplicates the fresh template's secondary.

Keep visual cards/Details/HUD/720p/200%/floating-body separation. No UI redesign. Origin text now accurately describes paired starters. Staged review hooks previously changed Origin metadata without changing actual ownership; they now initialize real owned pairs too. Old browser expectations enter the existing Details/path disclosure and single-axis large-text scroll, retaining their original assertions on actual information. Thai uses currentplaincopy ความรู้. No fabricated extra sprites/damage.

Starting-secondary selection UI: DEFERRED_WITH_REASON. It would add setup inputs, checkpoint/child lifecycle and balance combinations during this corrective baseline recovery. The historical default and legal third-weapon choice are preserved first. No duplicate inventory.

## Final gates and human acceptance
Final exact-source checks, two unchanged Natural36 policies, all negative cases, package checksum and Push+PR CI belong in the final PR44 receipt. Current candidate is not HUMAN_RETEST_READY until mandatory gates finish and severe unexplained regression is absent. No scores invented; previous ownerfun1/5 remains baseline. Original art and physical native60Hz remain separate gates. All43 issue IDs retained in V53_ISSUE_LEDGER; no blanket closure.

Launch: C:\Users\MewMew\Desktop\Co-op\-SEED → existingPlay-SEED-QA.bat or npm run qa:human; readiness at127.0.0.1:5173 then/?qa=1; stopCtrl+C and preserve QA finalization. After engineering acceptance, use a fresh run to assess paired identity, voluntary third weapon, meaningful upgrades, independent muzzle/clock, Save/Continue, World2 and actual fun/replay interest. Resume is not a fresh-start clean session.

## Local frozen-source verification

npm run check PASS:676/676 tests in134files, typecheck, provenance/core isolation and production build. Affected browser94/98; targeted five-case correction pass5/5 (atomic icon snapshot, ignore intentional hover, truthful local dirty provenance; CI still demands clean). Full exact-source CI remains mandatory. [Verification](evidence/v53-corrective/local-verification.json) · [Thai720p](evidence/v53-corrective/choices-th-1.png) · [EN200%](evidence/v53-corrective/choices-en-2.png). No production changes after the original98-case browser batch.

## Mandatory CI observation at 113a0da (preserved intermediate failure)

Both analyze jobs passed on the same Git tree: push 42168704012 and PR 42168710213. [All 72 raw cases, source identities and report checksums](evidence/v53-corrective/cohorts-113a0da.json). Historical reached/won/died: 25/24/3 (failed V5.3:21/6/20; V5.2:17/16/5). Defender-aware:25/23/4 (failed V5.3:21/4/22; V5.2:17/15/6). Replay36/36 each. Push/PR case rows identical; no controller changes; acquisition Tech selected0/36 each. This is recovery evidence, not human enjoyment evidence.

Historical Boss chase23.32s / original800u range proxy635.12s, base damage1323, base losses0 within Boss observation window. Defender-aware chase29.35s / range proxy560.98s, base damage1078, base losses23 over whole attempt. Loss scopes differ. Range proxy does not prove muzzle visibility or successful shots. Boss fight duration min/median/max:6.72/17.68/81.43s historical,5.12/14.43/59.60s defender-aware. Eleven cases per policy did not reach Boss. Three historical deaths are Resonant Golden001 damage/survival and Golden002 balanced; defender-aware also loses Hunters Golden002 survival. Two historical wins have no Phase2 attacks (Hunters Golden002 damage, Engineers Stress001 damage): retain as manual pacing concerns, do not inflate Boss stats to target a win rate.

Push browser result:332PASS/4FAIL/1expected skip. Three failures were obsolete fixtures trying to acquire an already-owned Field weapon; tests now assert the genuine starter ownership and retain automatic mine/trail/accessibility checks. The fourth waited idle after a five-pixel move; the first-Draft smoke now uses only ordinary keyboard inputs to collect on-screen drops within the original90s bound. No grants, canonical time steps, threshold changes or production/controller changes. Final exact-source CI remains required after these test corrections.
