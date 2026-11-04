# V4.8 — Core Fun Experiment

Engineering candidate; final verification and exact-source CI receipts are in the linked Draft PR. No HUMAN_FUN_PASS, BUG_FREE or native60Hz claim.

## Source and scope

Primary checkout: C:\Users\MewMew\Desktop\Co-op\-SEED. Started tracked-clean at1edd86ee7a3d5a0e3d54898050996f9687edfff4, feat/v47-core-fun-20261104 / Draft PR38. Branch feat/v48-build-rhythm-20261104 starts from that exact parent. Existing .cursor, Play-SEED-QA.bat and private QA preserved. No stale-main base, old v39 worktree, merge, deploy or published release.

Owner baseline remains Combat1/5, Upgrade Impact2/5. No new owner answers or clean-session result were inferred from unfinished/private reports.

## Player-visible changes

|Build|Before|After|Tradeoff / acceptance|
|---|---|---|---|
|Kinetic|An even volley removes the directly aimed ray|First ray stays aimed; added rays alternate flanks|Two-shot volley is asymmetric; owner must judge control/coverage|
|Energy + Conduction|Primary impact pushes the chain target away|Conduction retains enemy position; base Energy still pushes|Less defensive separation; actual chain damage/range unchanged|
|Field|Moving placement scatters in a300-unit square|Rear trail follows movement; upgrades widen a barrier|Requires positioning; stationary scatter and finite lifetime remain|
|Ordinary pressure|Flat2.2s gaps|After actual first choice in World1: two1.2s gaps then4.2s recovery|Same steady packet density; all transition phases leave at least1.2s; not a difficulty/fun guarantee|
|Draft|Counts/stat consequences without positioning advice|Localized tactics on relevant canonical behavior upgrades|No fake previews or tactical claims on unrelated stat cards|

Worldgen3 / Content26 / Save3; child laws18 pinned. No new artwork, damage/HP/cooldown buff, resource economy or Boss retune. Existing Origin identity, Tech DAG, logistics validation, actual base damage/repair, earned five-item Collection and World2 remain in place.

## Evidence and negative results

See ADR0054 and the sanitized comparison receipt. Staged probes compare exact parent source against this runtime, with repeated candidate snapshots. Mine event RNG draws match. Moving Field rear offsets are approximately-72units instead of arbitrary forward/back scatter. Kinetic upgraded aimed first hit is preserved. Conduction primary displacement14→0 with unchanged damage.

Bounded180s historical controller is unchanged and uses no health/Tech grants. First kills improve4.117→3.317s in the two sampled Origins, but Hunter first chosen Tech worsens14.567→16.633s in the initial experiment. Initial Hunter kills347→345; Resonant324→332. These are seed/controller observations, not human acceptance or broad balance conclusions. Final post-boundary-fix values: Hunter345kills, empty-near30091.983s; Resonant327kills,96.617s. Parent values347/77.400s and324/65.333s. Longest kill gap4.117→3.317s both. Full values: [experiment.json](evidence/v48/experiment.json). More nearby-empty time is retained as a negative spatial observation, not labeled downtime.

One fixed-cadence ablation with the new weapons was enough to stop further sweeps. Empty-near300 is spatial occupancy, not empty travel or no combat. Retain all unfavorable results. Both independent Natural36 cohorts run through mandatory CI; compare against V47 historical27 reached/23wins/0dead, defender-aware27/23/3. Historical boss-window metrics and defender-aware whole-attempt metrics have different scopes.

Initial local browser smoke:11PASS/3FAIL. Mine Thai polling skipped its0.3-second freshness window; sample every50ms while preserving the same position/age predicate. Draft tests incorrectly required behavior text on stat-only initial offers. A second bounded offer-advancement attempt exhausted the100-knowledge queue (2PASS/2FAIL); replace it with V48-UI-4, an offline-selected initial behavior-offer fixture, using the same canonical generator. This is UI coverage only; no cohort or gameplay seed changed. Production behavior was not changed to satisfy these test assumptions. Failed logs/traces remain locally. Full check:641tests/124files PASS, typecheck/notices/build PASS. Analyze6PASS. Final relevant browser/ZIP/CI receipt is in the Draft PR.

Author review found a genuine first-choice scheduling edge: entering near a boundary could schedule the next packet in one tick. New exhaustive396-phase RED test failed; minimum1.2s implementation passed with actual cadence/density tests. Independent reviewer unavailable due provider quota; not retried and no independent-review PASS claimed.

## Complaint ledger — all37 references remain open to human evidence

The full original33-item descriptions and evidence remain in [V47_OWNER_PACKET.md](V47_OWNER_PACKET.md#8-ledger33ข้อและ37-references). No original complaint is silently deleted or marked human-accepted. The source supplied only grouped references for34–37, so their exact wording is not invented.

|References|V4.8 status / delta|
|---|---|
|2,6,14,18,20,25,28,33|IMPROVED_PENDING_HUMAN: three controllable builds and bounded pressure; boss geometry/rhythm remains existing; threat readability and fairness need owner retest|
|19,24,26,37|FIXED_ENGINEERING in V47, VERIFIED_EXISTING via selected real keyboard boundary regressions; original stuck-input complaint still HUMAN_RETEST_REQUIRED|
|10,23,30,35|VERIFIED_EXISTING V47 known/approaching POI regressions; no extra POI generator or hidden source-art completion|
|9,21,36|VERIFIED_EXISTING pause/draft layout and EN/TH glyph checks; new tactics tested in affected UI; collection/technology usability HUMAN_RETEST_REQUIRED|
|16,34|VERIFIED_EXISTING floating bow real release/no body punch; no art replacement|
|1,3,4,5,7,8,11,12,13,15,17,22,27,29,31,32|Inherited V47 item-specific statuses and limits unchanged; not newly fixed by this campaign|

Remaining ART_SOURCE_BLOCKED: complete original anatomy/pose animation and genuine high-resolution source art. Existing small atlases cannot establish that production is complete. Native strict60Hz is HUMAN_RETEST_REQUIRED on physical hardware; CI screenshots/timing do not certify it. Multiple primary emitters remain DEFERRED_WITH_REASON pending canonical emitter design. No new research needed for this bounded experiment; optional asset-production research can be done by ChatGPT.

## Owner retest

After final CI confirms exact source, close old QA server with Ctrl+C and double-click C:\Users\MewMew\Desktop\Co-op\-SEED\Play-SEED-QA.bat. It launches http://127.0.0.1:5173/?qa=1. Verify the final SHA shown in the PR receipt, start a NEW run without debug/review grants, retain the same seed for comparison.

1. Try WASD/Space immediately before Draft and Outpost choices; release, Tab, deliberately Enter. No skipped choice or stuck motion.
2. Hunters: aim Kinetic at a target, then add shots; move to leave Field mines behind, turn to intercept pursuers. Observe both base and upgraded behavior.
3. Resonant: compare Energy before/after Conduction; check clustered hits and danger from reduced pushback.
4. After a real first Tech, judge attack/recovery rhythm. Record the exact interval if travel or pressure feels wrong. Check POIs, Logistics full/close/resume and actual base defense/Boss.
5. EN/TH UI, reduced effects and preferred UI scale. Confirm existing collection/equip and World2 when reached naturally.

Report only actual answers: fun, combat feel, visible evolution, meaningful Tech, base defense, Boss, replay interest(each1–5), start another run(Yes/No), and the worst concrete moment. Existing1/5 baseline is not replaced until answered. HUMAN_RETEST_READY depends on final test/CI receipt; HUMAN_FUN_PASS remains pending regardless.
