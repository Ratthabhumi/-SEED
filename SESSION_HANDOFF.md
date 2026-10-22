## V3.1 retained ground investigation —2026-10-22 (current)

Clean fetched parent PR20/4827b9a; main unchanged5e6d5c65. One child branch
feat/v31-ground-geometry-20261022. Official PR19/20 matched1080p HC40-row
diagnosis completed; all negative windows retained. Instrumented PR20 A/A
again identifies repeated static ground replay. ADR0041 tests complete native
triangle retention, distinct from rejected per-path and framebuffer prototypes.
Development opt-in groundGeometry=prepared only; no production acceptance yet.
Early native96 exact-pixel cases PASS (four biomes/six ages/two zooms/native
720/1080/fractional translation); source was dirty development4827b9a, not a
clean release. Initial zero-hit test caught Phaser4's captured render step;
corrected using its public render-step API. Targeted three lifetime/fallback
tests and typecheck passed before the native gate. Clean candidate matched
performance, full regression, exact-head CI and final physical gates follow.
No core/content/balance/art/dependency/version changes; existing31 identities,
preferred painted Boss, Human art/fun OPEN and painted anatomy BLOCKED retained.
Do not merge/tag/release or claim the historical12/24 failures fixed yet.

## V3 painted Boss recovery —2026-10-22 (historical)

Fetched and verified PR19 HEAD9b5c1facd4bbab891b452051b392e5e460c76353, Draft
on PR18. New branch feat/v3-painted-recovery-20261022; no merge/release/main
change. Existing three user QA files preserved, including clean9b session
bc09b0fe (Boss540.23→595.13s, child+120.07s, no ratings). Owner explicitly
REJECTED PR19 vector boss artwork; this verdict overrides its pending gate.
ADR0040 restores original painted lava golem by default; old rig only loads
with bossArt=rig. Existing real cells render windup/impact/rest/hit/defeat;
canonical-time secondary motion, Reduced Effects and world/reset cleanup.
HUD/observer/POI corrections retained. Three HC projectile source silhouettes
share Canvas/cache geometry; optional float holds a shoulder station instead
of crossing through the hero each orbit. Hand stays default. No canonical,
version, balance, dependency or source artwork changes. Full painted anatomy,
human art/fun and strict performance remain separate gates. See V3_VISUAL_RECOVERY
and original31 issue delta. Early native comparison precedes expensive validation;
final exact-SHA receipts belong in the new stacked Draft PR, not older stamps.
Precommit complete check527tests/93files,62provenance and production build PASS.
Matched official PR18/PR19/dirty-candidate native comparison PASS before the
large suite; focused inherited native19PASS. Five new painted cases receive
their corrected numeric-frame/tick-boundary retest and clean CI receipts in PR.

## Original Boss rig / responsive lane / discovered POI —2026-10-17 (historical)

Final lifecycle correction:4a7cab8 is the first published checkpoint, not
the final source. Real language changes rebuild HUD; release the previous
ResizeObserver immediately and clean the current observer at scene shutdown.
New browser regression verifies bounded native observer count across EN/TH.
Preserve4a7cab8 CI/packages/24 physical cases under their original SHA; final
corrective source receives fresh complete checks and exact-head receipts.
Reproduction: active observers1→2 after one language switch on4a7cab8.
Corrected check523/91 plus native observer/restart and EN/TH glyph tests3/3
PASS before corrective commit; full clean-source receipts follow in PR19.

Start fetched PR18 cf5aaf69277c992ca964ab25ac679d9750fdad0d. Branch
feat/player-experience-visual-overhaul-20261016 stacks on PR18; no main
merge, retarget, tag, release, force push or canonical version change3/18/2.
ADR0039: new original nine-plate editable SVG boss (14 articulated images,
1024x768 raster/3MiB), canonical-time joint tracks, pooled defeat; not an
upscale or newly painted source. Boss HUD stats/HP/phase now flow in one
center lane with measured notification clearance. Discovered POI IDs bypass
only the unexplored-neighbor-chunk guard, correcting reward-before-art near
a chunk boundary. Optional equipment=float compares one tethered cosmetic
primary with existing default hand mount; no projectile-origin change.
Export, alpha-density report and source hashes preserved. Human art/fun
acceptance remains OPEN; other actors' layered painted sources still missing.
Final precommit check523/91,62 provenance/build PASS; new native rig/HUD/POI/
mount/defeat/World2/restart7/7 PASS. Initial focused27/29 is retained below;
the corrected POI/mount retest2/2 also passed. Exact clean-source full E2E,
physical and both GitHub event receipts are separate final PR evidence.
Full local/exact-head CI/native/physical/package receipts belong in the new
Draft PR, with failed attempts retained and strict8ms/4ms unchanged.
Initial local check523/91 and focused native27/29: obsolete fixture searched
inside60u despite worldgen's64u margin (fixed to real<69u border candidates);
one boot timeout occurred during overlapping verification/build activity.
Final browser runs must use an immutable completed build, isolated from
rebuilds and expensive profiling. Never restamp precommit captures as clean.
See PLAYER_EXPERIENCE_OVERHAUL and the original31 ledger delta.

New real sanitized PR18 session6666c57f3b1bc2cfd78a175a is retained. It reached
Boss kill827.72s and World2+120.12s with no console/assertion errors; no human
subjective ratings were provided. HUMAN_FUN_PENDING; raw private QA excluded.

## Playable slice / warning union —2026-10-16

Start clean local/fetched PR17 f6281228d711ab206b2e1285ccffb534a4bbc231.
Branch feat/content18-playable-slice-stabilization-20261016 targets PR17.
ADR0038: finite Cross hit-union perimeter/interior and dark warning backing;
no canonical rule/version change (3/18/2). Small physical diagnostic found
ground/Combat comparable; FillPath and prepared StrokePath prototypes did
not show repeatable benefit and were removed. Rejected dirty receipts remain
in docs/evidence/content18-slice, never restamped as final source. Performance
OPEN; no proven performance optimization claimed. profile-matched-control
records clean-source A/A frozen hashes/host telemetry before a future change.
Animation remains BLOCKED on actual layered painted limb/timeline source;
no new generated gait or fake rig. Same31 ledger. Human QA procedure and
seven requested real ratings: docs/CONTENT18_PLAYABLE_SLICE.md.
PR17 official Push Node22 is the pinned comparison source; digest checked
before capture. Full local/final exact-head CI/native/package/representative
physical receipts belong in the new Draft PR; pending is not PASS. No main
integration, tag, release, retarget or public-history rewrite.

## Pinned visual-baseline preflight correction —2026-10-16

Completed9236b75 render CI exposed a tool defect after measurements: capture
still hardcoded PR15 while the measurement caller correctly pinned PR16.
Preserve the failure. Pass expected PR16 explicitly, preserve PR15 legacy
default, and reject wrong/dirty compiled parents before any lengthy benchmark.
Two regression tests protect the contract. No renderer/core/runtime source
changes. Physical32fbff6 data remains labelled32fbff6; verify runtime/source
and normalized compiled-bundle identity if relating it to this tooling-only
HEAD. Never restamp older physical measurements. New exact-head CI/packages
and native captures/videos are required. Final receipts live in PR17.

## Native video publication correction —2026-10-16

PR17 source9236b75 completed local513/12native/16experimental and both CI193browser
checks; physical240 paused rows and12 live cases are retained as that exact
build. New nested Playwright warning videos were recorded locally but omitted
from the prior top-level-only Actions upload glob. Correct **/*.webm; this is
an evidence-delivery change only, with no runtime/source/art/balance change.
Re-run exact new-head CI/packages and physical receipts without restamping
9236b75 data. Existing natural-boss video was uploaded, but does not substitute
for verifying the eight new per-case clips. Final immutable receipts in PR17.

## Live floor/counterplay continuation —2026-10-16 (read first)

Start local/fetched remote PR16 a9d0af4460a9c38dd24d62e8075489ca6ee4d6fa,
clean; latest continuation PR16. Branch feat/content18-live-performance-counterplay-20261016
stacks on PR16. See docs/CONTENT18_LIVE_COUNTERPLAY.md and ADR0037.
Native physical attribution measured ground Graphics12.9ms p95 vs Combat3.7ms
(inclusive instrumented); do not assume Combat is the primary live cost.
Cull wholly offscreen decorative ink only, keep floors/sites/warnings intact;
no texture cache. ?decor=all retains the same-build comparator.
Unique drained POST_RENDER/step rows coexist with legacy overlapping rolling240
metrics. Original progressionPolicy/Natural36 are unchanged; explicitly separate
visible-locked-area-v1 evaluates150/300/450ms warning reaction in four adverse/
burst cases with exact Boss-entry equality. No core balance/input/version edit.
The first16-assertion evaluation encountered worker RPC starvation: error-free
runner with inter-test yields is required, no case/assertion reduction.
New exact-head full CI/physical/native/policy/package receipts belong to the
new stacked Draft PR; precommit data stays explicitly dirty. No blanket budget
PASS, no human/art approval, no merge/tag/release. Same31 ledger, versions3/18/2.
Animation remains BLOCKED by accepted editable painted-source dependency.

## Native render/warning continuation —2026-10-16 (read first)

Late review: clean3b19720 Windows full browser183PASS/1skip, but actual200%
draft image hid card names after SELECT autofocus. New EN/TH visibility tests
fail2/2 before; heading focus + name/effect priority correct it. Fresh Enter
uses DecisionInputBoundary; six input regressions in the first heading-only
experiment were fixed, not waived. Checkpoint PR CI camera test raced native
resize (expected zoom1, actual1.25); wait actual viewport/render before explicit
zoom. Same120 observations remain, grouped browser RAF reduces CDP overhead.
New source must receive its own full check/CI/package and physical receipt.
Corrected working tree: full check509/88files +61 provenance/build PASS;
30 focused native input/mobile/title tests PASS; resize-settled camera oracle
120 rows PASS. Final clean-head CI/packages and physical A/B still require
their own receipt at https://github.com/Ratthabhumi/-SEED/pull/16.

Parent local/remote PR15 b909802, clean; both exact-head workflows5/5 verified.
One feat/content18-render-boss-art-closure-20261016 branch targets PR15.
See docs/CONTENT18_RENDER_CLOSURE.md and ADR0036. Consecutive enemy Mesh runs
preserve native Images order/tint/flip/anchors with no extra atlas (two native
conditions exact; far positive/zoom1.25 differs11 channels by1/255, ADR0036);
Canvas and ?actors=images retain the old comparator. New native warning
regression exposed an offscreen Boss source hiding an on-screen locked Slam
(before0 changed pixels). Preserve the danger independently of body culling.
Actual Phaser camera formula agrees with groundViewport; verify using native
worldView/getWorldPoint and submitted bounds, never a copied formula.
Player damage-source telemetry adds diagnosis, not balance. Natural36 compares
against exact PR15 and asserts final canonical snapshot equality. Identity stays
Worldgen3/Content18/Save2; package version unchanged. No fabricated art source:
bounded GUI-install inventory found no DCC; painted continuous motion remains
BLOCKED. Same31 ledger/human gates retained. Local509-test check passed. Native
camera test passed (120 rows including World2); six further physical native
tests pass (3 actor conditions, missing warning, EN/TH glyph bounds). Selected
precommit evidence is in docs/evidence/content18; dirty provenance is explicit.
Full current-source browser suite, physical comparisons and exact-head CI/package receipts remain
pending until explicitly recorded in the new Draft PR. Do not certify an older
build as a newer source. No merge/tag/release or history rewrite.

## Home playable-quality recovery —2026-10-15 (historical)

Native review of the d5de023 CI artifact exposed percentage-label overlap in
Pause at1280x720/200% (EN and TH), despite earlier broad layout tests. New text
Range bounds regression fails2/2 before the fix and passes2/2 afterward. Compact
desktop nowrap/min-width0/equal shrink caused it; wrap with intrinsic minimum
label width instead. Font scale/Thai line-height and keyboard activation retained.
Before/after PNGs and exact provenance are under docs/evidence/recovery.
Digest follow-up: three JSON summaries normalize CRLF→LF in Git. The manifest
now verifies published Git-blob bytes and retains original Windows digests;
binary gzip/PNG and logical observations are unchanged. All11 entries rechecked.
No renderer/core/Content change in this correction: versions stay3/18/2.
Frozen d5 measurements (240 physical/480 Push CI rows,36 policies, official
packages) are durably committed with a manifest; they do not certify newer HEAD.
Require final new-head full checks/176-browser expectation/Push+PR5/5 and new
official package stamps in PR15's receipt. No thresholds/cases were reduced.

Starting local/remote7b9b164, PR14 verified latest open Draft. Three untracked
historical evidence files preserved with hashes in ignored scratch backup.
Baseline Windows Node24 check506/87files,61 provenance/build; terrain browser5/5.
Measured Intel UHD630 D3D11 HC ground13ms p95 inclusive diagnostic. Candidate
removes offscreen floor commands without extra textures, protects complete boss
recovery before half-HP escalation. Versions3/18/2; actual canonical timing change.
Focused boss10/10 and four-boundary raster/canonical parity browser1/1 pass.
Full exact-head gates pending. See docs/CONTENT17_RECOVERY.md and ADR0035.
Animation production remains BLOCKED, human visual/fun OPEN; no merge/tag/release.

Runtime correction checkpoint a754530 preserves the new followed actor's view
until the camera catches up during World2/teleport; original neighborhood cap
stays49. Current31-row ledger: docs/CONTENT17_HUMAN_ISSUES.md. One Draft PR15:
https://github.com/Ratthabhumi/-SEED/pull/15. Its durable final receipt records
the immutable final source/merge SHA, exact Push/PR jobs, official Node22/24
packages, complete policies and all measured failures. Earlier green checks
never certify a newer HEAD. Baseline diagnostic raw/screenshot are committed
under docs/evidence/recovery; they are not stamped product performance acceptance.
Final physical five-block source identity is read from the actually served bundle.

## Content16.1 continuation — 2026-10-15

Correction after c40cf0c's exact Push38685763415 and PR38685781809 both5/5:
direct-PNG default REJECTED. Source prep median28.8→0.7ms, but1080p normal cold
render median9.25→17.35ms (Push8.75→17.25ms). Four official packages were clean,
CRC/root/licenses passed; PR merge4655cd7 tree matched source.172 browser PASS
/1 skip per run. Those results certify c40cf0c only, not the correction.
Keep measured evidence in docs/evidence/content161/rejected-png-experiment.json.
Correction retains prebaked RGBA but restores parent CanvasTexture creation/
refresh for fallbacks. Runtime and rejected PNG routes remain diagnostics;
texture/upload causality is a hypothesis, not a proven shader/driver root cause.
The first PR benchmark's normal/reduced "warm" rows all retained16–31 terrain
jobs; HC's49 unused jobs are intentionally paused. Correct paired warm timing
to await active terrain drain, then1500ms settling and a new3s window. Retain
wait duration, all cold rows/populations/budgets. Old post-cold windows are not
the same protocol as drained warm samples. This is an evidence correction,
not evidence that cold hitches or physical performance are solved.
Canvas-path correction passed local Windows full check506/506 (135.13s) and
five focused browser tests (2.8min), including both diagnostic controls. The
three-path rotated Windows SwiftShader probe is retained as INCONCLUSIVE:
sparse/variable samples and large stalls cannot establish root cause or a
physical budget pass. Full corrected-head CI and a clean Intel/D3D11 paired
run are still required; use the original profiler with the corrected warm
barrier, retaining all cold rows and warm-up waits. Do not relabel old c40cf0c
measurements as proof of this correction. Final receipt belongs in PR14.
The same36 natural pairs reached24/36; phase2 attacks remained21/24 reached,
but total phase2 attacks67→86 and observed entry→first attack2.367→1.983s.
Kills22→21, player defeats0→1;12 unreached are11 before-Space time limits and
one revealed-Stronghold time limit. These are challenge data, not human fun PASS.

Initial local/remote4d1dc0cb8a6e992dfa450aa73989d2984fcf03b0; PR13 both
Push38677388790 and PR38677393143 verified5/5. New single workstream
feat/content16-production-quality-20261015 targets PR13's branch. Read
docs/CONTENT16_1_DELIVERY.md, CONTENT16_1_HUMAN_ISSUES.md and ADR0034.

Candidate: exact offline periodic PNG/RGBA material preparation;18 measured
painted site support anchors; shorter phase2 transition/approach downtime with
full warnings/recoveries unchanged; bounded terrain/site arrival observations.
Existing atlas/typed uploads/epoch guards/pools/FOG and one primary weapon stay.
CONTENT16→17 for actual canonical boss timing and existing child-law identity;
WORLDGEN3 / SAVE2 unchanged. No new dependency or fabricated artistic approval.

Windows audit now splits the same eight900s policies at transport boundaries
and yields every128 steps; CPU/wall/RSS/slices recorded. First attempt completed
all8 policy cases plus replay in166868ms under the unchanged600s aggregate
budget, while the full check FAILED3 asset-manifest assertions (502 passed).
Original-source/derivation manifest entries corrected; no assertion weakened.
Second full Windows npm run check PASS:87 files/506 tests, provenance61 assets,
production build; audit8 policies+replay142134ms. Focused new native browser
suite4/4 PASS (51.5s; D3D11 requested). Initial new fallback fixture mistakenly
read the snapshot's p array as an object; fixed to p[0]/p[1], assertions retained.
Pixel comparison: all1,048,576 material channels and fallback pixels equal;
cached bytes survive restart; Worker-unavailable fallback and source-ground
pivots verified. Staged teleport→real canonical discovery observed169.7ms to
CPU post-render in one sample; not physical display latency or human arrival.
Initial failed log retained in ignored scratch. Final full Windows/CI verdicts,
source vs compiled merge SHA, all measured modes and four official package
receipts belong to the final Draft PR, avoiding recursive evidence-SHA commits.

Continuous painted gait/complete action family still BLOCKED by actual editable
anatomy/timeline production. No new source frames or distorted whole-body walk
were enabled. Existing source/rejected rows preserved. Specific artist/operator
handoff: docs/research/CONTENT16_1_REMAINING.md. No broad Research repeated.
Human visual/fun and strict physical performance gates remain OPEN separately.
Raw human QA stays private/ignored. No merge/tag/release/history rewrite.

## Content15.3 continuation — 2026-10-15

Resumed Draft PR13 / feat/content153-playable-visual-boss-20261015 at
081ec5b802de5a715fd050a0587df458850a2911, stacked on PR12 at
ce63df35d52e8b3041d232f5e8e3438c087cecf8. Starting Push38657190200 and
PR38657196755 both FAILED:4/5 jobs passed; E2E had8 failures. The candidate
was not complete or release-ready. Historical/negative evidence below is intact.

Corrections: active reference texture/frame/Age checks for the separate attack
atlas,126/60 presentation sizes, Industrial burst instead of unsupported Space
burst, explicit legacy glyph mode for the glyph-cache test. No deleted assertion,
weaker gameplay/performance rule, canonical change or reduced entity cap.
WORLDGEN/CONTENT/SAVE stays3/16/2. Final exact-head Push/PR CI and Node22/24
ZIP receipts belong to PR13, avoiding a recursive evidence-commit SHA loop.

Local Windows check exposed the unchanged900s×8 frontier policy audit's explicit
180s timeout plus worker onTaskUpdate starvation (493/494 passed). It now yields
every1024 canonical steps and uses the existing Windows600s host allowance;
Linux retains180s. Seeds, simulation duration, policies, assertions and replay
comparison are unchanged. Failed/interrupted local logs remain in ignored
scratch/content153-continuation; no failed attempt is labeled PASS.
Native capture also waits for an actually rendered ordinary hostile source,
saves phase1/phase2 images and records explicit phase2-attack observation rather
than treating successful capture execution as boss-quality acceptance.

Durable selected prior evidence now in docs/evidence/content153/: four-build
material comparison (missing historical rasters marked),144 alpha projections,
boss encounter traces/builds for36 canonical policy pairs, all48 performance
condition summaries. These identify source081ec5b and compiled PR mergec74079f
separately, never certify the correction head.24/36 bosses reached and22 killed
before/after; phase2 attacks19→21. Twelve unreached cases and strict8ms software
CI cold failures remain. Intel hardware performance, authored continuous gait,
full six-era kits, natural human boss quality, HUMAN_ART_PASS and HUMAN_FUN_PASS
remain OPEN/BLOCKED individually. Rejected walk rows are not runtime assets.

Ready ChatGPT/artist brief: docs/research/CONTENT15_3_REMAINING_QUESTIONS.md.
No broad market research performed. Read-only stack audit:
docs/STACK_INTEGRATION_READINESS_20261015.md. PR1–13 base/head ancestry passes,
but PR1's own base still needs reviewed integration into main. No main merge,
rebase/reset/tag/public release performed or authorized.

Operator retest after engineering gates: npm run qa; open127.0.0.1:5173/?qa=1,
verify compiled SHA/clean state; fresh Stone→six Ages→Boss→World2. Record real
input, readability, terrain transitions, hostile art, actual phase exposure and
explicit art/fun feedback. Keep raw QA local/gitignored; review privacy before
committing sanitized evidence. Preserve reports402/403/session384.

## Content15 renderer/animation closure candidate — 2026-10-14

First b6d43bf PR CI38525799632:150 browser PASS/1 skip/1 failure. Numeric/cache
fixture assumed2.2 wall seconds guarantees an actual enemy shot, but software
rendering advances less canonical time and glyph count remained0. Wait/poll for
the actual rendered shot with30s cap; keep positive glyph and≤64 pool assertions.
This changes only test synchronization, not renderer/core or performance limits.
Failed CI log/artifact retained. Full exact corrected-head CI must supersede it.

Parent PR10 efef11ef9729c3bbc388061a45b605688b6a213e push38513285072/PR38513288712
CI4/4 each verified. New branch feat/content15-perf-animation-closure-20261014
targets that parent; no main merge/tag/public release or canonical version change.
Cached threat glyphs reduce measured Graphics CPU work; optional phase/GL/GPU
profiler and numeric-only prototype remain diagnostic. Original36-pose Hunters
Stone/Space reference, native clips, canonical-time/event playback, sockets and
PNG sequence roundtrip delivered; full animation/artist acceptance still pending.
15min live no-profiler renderer p95=4.7ms, sim1.5ms, zero page errors; boss/World2/
restart green. All240 ABBA/BAAB cold/warm rows retained: some render p95>8ms,
terrain upload lifetime worst31.6ms, small normal/reduced median regressions.
PERFORMANCE_GATE_OPEN and REPEATABILITY_UNRESOLVED; no universal no-regression
or HUMAN_FUN_PASS. See docs/CONTENT15_PERF_ANIMATION_DELIVERY.md and research/
CONTENT15_RENDERER_AND_ANIMATION_20261014.md for evidence and remaining Research.
Incoming clean-parent Engineers session384 preserved locally before edits and
published sanitized; target-complete is not a fun verdict. Exact final-head CI/
ZIP/sha receipt belongs in the new Draft PR, with local frozen dirty-build
measurements distinguished from official packages.

## Content15 evidence publication — 2026-10-14

Product SHA070098909d40cac810e2438311e54ba2c21d53ed verified push38500135128
and PR38500139907 CI4/4 each;480 unit/53 provenance/147 browser PASS,1 existing
capture-only skip. Official Node22 ZIP CRC/root/licensing/SHA verified.
Draft PR10 https://github.com/Ratthabhumi/-SEED/pull/10 stacks on PR9.
This evidence-only publication changes docs/captures, not product source.
See docs/CONTENT15_DELIVERY_RECEIPT.md for exact lineage, package hashes,
all successful/failed performance scopes and selected real fixture captures.
Final15min live500-foe run and boss/World2/restart have advancing canonical
clocks and zero page errors; renderer CPU/API p95=12ms exceeds8ms target.
Degraded repeat dense p95=50.1ms remains retained; fresh warm pair returns
near16.7–16.8ms but candidate ground worst9.6ms still exceeds8ms.
Performance/art/human gates remain open. Research is delegated to the user
via docs/CONTENT15_RESEARCH_HANDOFF.md; no market research performed.
Raw private QA preserved locally; sanitized evidence/source/original art
uploaded. No main merge/tag/release or HUMAN_FUN_PASS.

## Content15 coordinated quality pass — 2026-10-14

Corrective live-stress finding after e2c3811 publication: parent and candidate
restart retain destroyed floating Text canvases; actual stack is floatTextAt →
setColor → Frame.updateUVs/drawImage, not terrain upload. Reset Text/Image pools
and pending impacts at startRun. Corrected native energy-impact/restart/energy-
impact fails on archived parent and passes after reset; initial wrong-hook/pause/
CLI fixture attempts are retained separately. Skill icons now identify actual
Origin, projectile/trap/drone, regen and Legacy roles instead of repeated bows.
Final corrective exact-SHA/CI/package/hardware receipts supersede e2c3811.
Corrective frozen check480/480 across78 files/53 provenance/typecheck/build PASS;
native restart green and bilingual role-icon/notification checks3/3 PASS.
First exact e2c3811 push CI38494502177 passed both480/provenance/package jobs
and Analyze but native145/146 passed/one existing skip failed the old R2 assertion
requiring zero toast DOM nodes. Content15 deliberately preserves hidden alerts
under modals; R2 now requires zero VISIBLE toasts, preserving the no-overlap
invariant without deleting critical notifications. Failure/log/screenshot remain.
The strict visible assertion then exposed a real CSS transition: global
transition:all animated inherited visibility for350ms, so some children remained
visible while their parent was hidden. Restrict transitions to opacity/transform;
keep the zero-visible assertion. The intermediate R2 failure remains evidence.

Base PR9 fd171b239d00827d8100ae165d551d5766630cc7 verified local/origin/
OPEN Draft and both CI runs4/4. New branch feat/content15-combat-world-ui-quality.
Preserved6228 authentic incoming QA/handoff files with private SHA256 ledger.
Raw402/403 are one Resonant target-complete session on clean parent, boss699.62s/
child+120.10s/wall2071.36s. Ratings absent; operator22-issue quality feedback is
QUALITY_GATE_FAILED, not a new HUMAN_FUN_PASS or rewritten terminal outcome.

Native held-Space EN/TH failed before repair; capture held-key/release boundaries
preserve fresh keyboard selection and movement keyup. A second native red proves
queued drafts retain stale DOM; successful picks now replace it synchronously,
reject old/double callbacks and cancel pending dash edges at input transitions.
One canonical claimStatus and localized context/C/click rejection; free claims,
first-Signal full cost, Logistics ledger and FIFO remain. Actual effective tech
effects are copied to selection events/confirmation. Notification3/64 priority/
dedup/pause/overflow/reset, canonical family/Origin/cooldown/major power/Legacy HUD.

Boss approach/warning/commit/attack/recover/phase-transition, pattern-specific
warning/recovery and one half-health transition, living windup pose and EN/TH
feedback. Elite family rush/burst has actual bounded damage; hazard constants
share the unchanged14-unit collision/flight geometry. Painted orbit identities,
elite crowns, directional warning lanes and slam fractures preserve danger edges.
48 original weapon-neutral front/back six-era costume cells, single mounted
primary, larger enemy hierarchy,4 quiet periodic Worker floors with non-mirrored
sampling. Worldgen3 biome affinity changes types and version-derived laws;
unchanged density/coordinates/rewards, content15 intentional replay change/save2.
53 provenance assets, original prompts/sources retained; no runtime dependency.

Full authored animation and six-era enemy/Guardian/environment kits remain open;
do not call static poses/recoil finished animation or infer human acceptance.
Earlier full479 PASS;480 assertions passed but one onTaskUpdate RPC timeout under
concurrent native load was retained as a failed check. Quiet480/78 full retry PASS;
54 native physical-D3D11 cases passed before final phase fixture refinements;
final focused native19/19 passed (actual warning durations/phase living pose,
held Space/Enter/numbers, stale double-click, HUD and all body/combat families).
Final frozen check480/480 across78 files,53 provenance, TypeScript/build PASS;
Analyze6/6, local ZIP and release:verify PASS.
Final frozen check, focused native, Analyze, paired hardware/live canonical/
15-minute stress, exact-head CI and official ZIP receipts belong in the Draft and
ignored delivery receipt. No prospective green verdict, main merge/tag/publish/
v0.27 or mid-stage human playtest. See CONTENT15_QUALITY_PASS.md and ADR0030.

## Content14 terrain stutter / painted material corrective pass — 2026-10-13

Baseline PR8 exact8d52ecd34ca3de4cb5c1bb55293d663c3b515493, new
feat/content14-stutter-art-consistency-20261013; eventual Draft base PR8 branch.
Two new clean-build human terminal sessions (Hunters600.13s/Space and
Engineers70.10s/death) confirm failed performance/art acceptance, not fun approval.
Preserved5423 QA/handoff/evidence files privately with hashes; raw end reasons,
blank ratings and earlier INTERRUPTED_BY_BUG evidence remain unchanged.

Selected after measurement: exact252px floor pixels in one bounded Worker,
visible-priority/prewarm,64 slots, world/request guards, deterministic source-art
fallback/fade, one256KiB partial upload/frame; pause hidden floor work under HC.
Rejected fullscreen-GPU blend and Image-per-projectile prototypes after median
regressions. Default projectiles/traps/24 actual-tier weapons/POIs/Guardians/codex
now share original painted materials; three fixed-buffer Mesh2D batches prevent
hundreds of projectile display objects. Essential vectors/HC remain intentional.
Original48-asset hashes/prompts/layout rejection retained, no dependency or
core/content/worldgen/save/rule changes. QA adds optional copied cumulative
terrain counters, sparse2Hz (not a causal trace); PRE/POST_RENDER alias is a CPU/API
bracket, correcting earlier command-construction-only interpretation.

Frozen-source full check471/471 across72 files,48 provenance, typecheck/build
PASS. Earlier469-predecessor467 assertion run failed worker onTaskUpdate RPC;
failure retained, standard quiet retry passed without threshold changes. Initial
48-state art matrix in one case exceeded180s and produced a broken teardown trace;
split by Origin/language, same48 assertions/captures passed9/9 before batching.
Batched native traversal/engineer matrix2/2 and pixel/ordered-quad5/5 passed.
Final integrated native/Analyze/paired-repeat15min profiling/ZIP/exact-head CI
receipt remains required and belongs in the Draft after publication, not a
prospective green declaration. See PERFORMANCE_ART_INCIDENT.md,
PERFORMANCE_ART_CLOSURE.md and ADR0029. Full production animation, weapon-neutral
hero redraws, six-era body/Guardian/environment costumes, hardware60FPS and fresh
human visual/fun acceptance remain open. One final operator retest, no market
research, main merge, tag, release publication or v0.27.

## Integrated Gameplay/Visual closure experiment — 2026-10-13

Verified product input cause, superseding earlier fixture-only explanations:
50fa2e5 push CI38388086000 passed4/4, but PR integration still failed Pause.
Installed Phaser4 KeyboardManager emits PROCESS per DOM event; KeyboardPlugin
revisits the uncleared queue and compares only the immediately previous code/time/
type. Same-frame Escape down/up followed by a second key replays original Escape,
closing/recreating Pause behind Resume. A deterministic real-engine burst
regression failed before repair (scratch/integrated-phaser-keyburst-red.log/trace).
GameScene edge commands/F4 now consume each KeyboardEvent object once through
a WeakSet; fresh presses/repeat information/manual no-payload callbacks remain.
No third-party patch, dependency, canonical balance/worldgen/save change. Added
three unit contracts plus native burst; retained all earlier failures. Visual CI
artifacts now preserve failure traces/context/screenshots. Final corrected receipt
must supersede50fa2e5. See ADR0028 and integrated ledger.

Corrected input candidate: native key-burst/layout/full-Logistics/Signal/Escape/
Thai200%11/11 PASS; new input unit3/3 PASS. Full frozen-source check463/463 across
69 files,45 provenance, TypeScript/build PASS on standard retry. First full run
passed all463 assertions but reported Vitest worker onTaskUpdate timeout, so it
was retained as failed infrastructure evidence rather than called green. No
timeouts/assertions weakened. Final exact-SHA CI/ZIP receipt belongs in PR8.

Further fixture correction:7b65332 PR integration passed4/4, but exact push38383657714 still failed Pause closure at1920, disproving the initial Escape-only explanation. Added a regression marking the original menu, calling the shared openPause twice, and requiring that same menu plus actual resumed simulation. It failed before repair because openPause unconditionally toggled an already-visible Pause and recreated it. The helper now returns when Pause is already visible (language rebuild/automatic pause may already own it), leaving native keyboard Resume and all closure assertions intact. This changes test setup only, no product/balance. Preserve both failed CI runs and the local failing marker/trace. Final publication receipt supersedes7b65332.

Publication30b53f7 exact push CI38379774393 passed4/4: Node22/24 full460, provenance45, Analyze6 + comparative cohort8, native119 passed/one existing capture-only skip; official Node22 ZIP5110782bytes/76 entries CRC/root/licenses/full SHA PASS. PR8 Draft targets PR7. The concurrent PR integration run38379843730 passed118 native cases but failed Thai2560 Pause closure: layout navigation's Escape remained queued across a rendering boundary. Preserve the failed run/log; layout closes through the visible Resume control with native keyboard Enter and retains the zero-pause assertion. Dedicated Escape/softlock regressions remain unchanged. Production source and balance are unchanged by this test-only correction. Final corrected exact-head/ZIP receipt belongs in PR8.

Start2222002b84928fff38dedad9689bfbcd0b67edae (verified local/origin/PR7), branch feat/integrated-gameplay-art-closure-20261013; eventual Draft base PR7 branch. Preserved5187 authentic QA/playtest/handoff files in ignored scratch/integrated-closure-baseline-20261013 with SHA256 ledger. No new human verdict, main merge, tag or market research.

Content14/worldgen2/save2: actual reservation reconciliation and visible Logistics contract; normal raid cadence retained with bounded gate-aware preparation, actual spawned-unit credit, saturation recovery and hashed phase/readiness; one advisory gold recommended card; shared Origin/family/scale/equipment rig; three additional original biome floors and one bounded blended atlas; replace overlapping floor/building/old actor uploads. Four painted hero bodies remain, with new rigged equipment and real event-driven effects. Full authored animation/costume and hardware acceptance remain open; do not certify them as complete. See ADR0028. Focused core36 and presentation34 passed during implementation; early evolving-tree full check passed but is diagnostic, final frozen-source gates remain required. Earlier fixture failures retained and corrected to represent real6/6 reservations. Baseline performance from official PR7 ZIP measured on the same local software browser before optimization (scratch/integrated-before-performance.json); not a hardware certificate.

Frozen-source verification: full460/460 across68 files,45/45 provenance, TypeScript and production build PASS; Analyze6/6 PASS. Native integrated selection/raids/four-biome/viewport/boss/Origin matrix13 passed with one outpost fixture failure: real movement collected Knowledge and queued a draft before the codex check. Preserve failure/trace in scratch/integrated-native-v2; resolve real pending drafts and use fresh runs per specialization (avoids fixture-only recruited allies after direct territory replacement). Corrected outpost EN/TH2/2 PASS. Native images personally inspected for new ground, fork staff, scale, gold outline and bases. Single16MiB atlas rejected earlier blurry124px cells in favor of252px. Full browser/exact-head CI and official package still require final publication receipt; no prospective pass. No new human fun verdict.

Same unassisted canonical900s controller across4 Origins×2 seeds reached real boss/child1/8 before versus3/8 after. Adaptive trajectories differ; cohort never had Raid as sole gate, so no natural raid-wait benefit inferred. New CI Analyze job reruns the comparative receipt once. Sparse same-host SwiftShader parent/child command p95 improved7.9/14.8→4.1/4.7ms, vertices50700/60855→12318/17271; calls increased5/6→6/7. Hardware60FPS/full GPU/stress/15-minute memory remain OPEN. Comprehensive21-row ledger, intentional legacy retention and one consolidated human protocol: docs/INTEGRATED_GAMEPLAY_ART_CLOSURE.md. QA launcher serves clean source; official ZIP static preview is a distinct route with manual QA export.

## Content13 recovery and painted gameplay art review — 2026-10-13

Additional CI95a239d clarity2560/Thai fixture race: Escape is consumed on a Phaser frame; the test granted knowledge before confirming the pause surface closed. Await actual pause removal before staging the draft, matching the existing setScale contract. Preserve the failed run; no production guard or assertion removed. Isolated frontier-policy audit PASS49.47s under unchanged180s budget; the earlier full-check timeout remains part of the receipt.

Corrective validation checkpoint: stable age-objective DOM preserves real button focus; test-only draft setup releases its own pause before canonical draft handling; map tests select map nodes explicitly. Added a real Iron-to-Industrial regression with earned elite credit, canonical legal outposts and two actual ingredient picks, plus distinct Industry/Culture icons, 96-unit heroes/36-unit painted allies and projectile-range-matched boss warnings. Focused18 and TypeScript PASS; provenance42/42 and production build PASS. Complete local check:446/447 pass, frontierPolicy audit exceeded its unchanged180s budget and worker delivery timed out; do not label local full check green. Initial0a47847 CI Node22/24 and Analyze passed, browser110 passed/4 failed/1 existing skip; failure logs retained. Corrected native/exact-head CI and final ZIP receipt remain pending publication.

Branch feat/breakthrough-quality-closure-20261013, base PR6 exact36c0bbb. Preserved291 incoming human files with SHA256 ledger under scratch/quality-closure-baseline-20261013 and sanitized report143 in e72728b. Human PR6 Resonant run ended in Iron without combination; missing exact input replay prevents claiming the reported screenshot was reproduced. Older INTERRUPTED_BY_BUG retained.

Native corrective checkpoint95a239d:26/27 passed; all objective/actual recipe/EN-TH map/boss/hero/age cases passed. The family capture incorrectly asserted projectile damage at0.1s before flight completed; it now advances actual simulation until first resolved hit, capped at1.5s, retaining both positive damage and live bounded-impact assertions. No simulation rule or threshold changed.95a239d Node22/24 full check/ZIP/release and Analyze passed; official ZIP CRC/root/source SHA verified (SHA2560ea7ca57c8fc621365f0f0cd6306a7e96e886658a98099aa80ab06f3a5f44c2a). Final head receipt still required after this test-only correction.

Implemented guaranteed voluntary Fire/Tools graph/draft recovery and localized objective/map guidance, Warfare sword semantics, all-family release/impact/mines, four painted hero pose atlases, four painted enemy roles, three-stateful outpost rows, Verdant walkable floor, and a deterministic three-pattern boss with warnings/recovery/hashed state. Content13/worldgen2/save2. No dependency, merges or tags. Full production animation and painted six-era equipment/other biomes remain incomplete; human/hardware gates remain pending. Exact engineering/ZIP receipt belongs in PR/task after final validation; no prospective green claim. See docs/QUALITY_CLOSURE_REVIEW.md and ADR0027. Initial local mixed-tree failures retained, thresholds unchanged; targeted25 and Analyze6 passed during implementation.

## Event-driven combat and site identity checkpoint — 2026-10-12

Branch feat/combat-feedback-slice-20261012, based on verified PR5 exact2ea1191ca555dc7e00164702b0dd6f0c9fbc97ac. Preserve real session265/266 in37083d0: same session qa-13489-w2qem1 and terminal wallEnd1389083.5, target-complete, zero feedback/ratings and null comment. Raw originals, three incoming documents and SHA256 ledger copied to ignored scratch/combat-feedback-baseline-20261012. Older INTERRUPTED_BY_BUG evidence retained.

Delivered first review checkpoint: actual beam_fired/energy_impact/knowledge_collected observations; bounded Atomic Energy readiness/release/impact/audio/damage presentation and real Conduction before/after card selection. Beam aim captured before target slot recycling; attack lines retain actual shot origins. Simulation-time beams/impacts/arcs freeze during pause and reset on child/restart. Canonical balance/RNG unchanged; worldgen2/content12/save2, no dependency. Knowledge world/HUD share an open codex with compact-visible icon and localized collection explanation. Signal gains a unique monolith at existing coordinates/visibility. Ground now receives actual outpost spec/era/tier/damage/repair state, with three silhouettes and six geometry kits; remove generic Ruin observatory overlay after claim.

Verification: full npm run check435/435,61 files,31-asset provenance and production build PASS; Analyze6/6. Native16/16 passed for the initial integrated slice including EN/TH charge/impact/Reduced Effects, real Conduction selection/live parent-effect Ascension reset, three canonical claims/specs, Knowledge/Signal captures, Archive/parent-child performance and Logistics6/6/first-Signal/Later/Escape/FIFO/Thai200%. Final neutral-pad/known-only navigation changes passed full435 and targeted native14/14; exploration guidance viewport captures2/2. Free unassigned land now stays a neutral pad instead of implying an operational factory. Remove old undiscovered-coordinate compass scan; localized exploration guidance replaces it, retaining discovered/revealed bearings. Initial fixture-pause/restart and compact-hidden-icon failures retained in scratch logs; fix actual compact icon and fixture ownership without weakening production guards/assertions. ZIP/release and exact-head four-job CI receipt remain required after code commit; final receipt is recorded in the new Draft PR/task.

See GAMEPLAY_VISUAL_ACCEPTANCE.md, VFX_STYLE_GUIDE.md, OUTPOST_VISUAL_REGISTRY.md, POI_VISUAL_REGISTRY.md, ART_ASSET_PROVENANCE.md and ADR0026. This is a partial A–D corrective slice, not completion of the master plan. Three further polished weapon signatures, authored hero combat/death/mount poses, multi-pattern boss and Verdant production environment remain pending the first quality target; no production-art/HUMAN_FUN_PASS/60FPS claim. Latest sparse local software trace misses frame budget and child renderer CPU p95=9.1ms exceeds8ms; hardware/GPU/stress/15min memory validation remains pending and budgets unchanged. No extra market research, merging main, tags or v0.27.

## Upright actors and era counterplay slice — 2026-10-12

Based on verified PR4 head47aa8c6, separate feat/age-combat-evolution-20261012. Incoming uncommitted human245/246 evidence preserved: one session qa-27147-e9kpmj, same terminal wallEnd, target-complete, no written comment/ratings recorded. Raw evidence/hash backup in scratch/age-evolution-baseline-20261012. Older interrupted softlock evidence unchanged.

Implemented pending checks: upright hero/squad with authored front/back strips across four Origins×six Ages, stable movement/hold/idle history reset per world; distinct non-humanoid facing; source/spawn-tier projectile grammar; Guardian/aura/orbit visibility matches actual active families and Guardian equipment receives current Age. Two-Age canonical experiment: Stone ordinary chaser warning→locked rush→recovery; Industrial ordinary ranged warning→three fixed-aim shots→reload. Existing boss/elite/siege/director density preserved. Content12, worldgen2/save2; new state hashed and recycled. No dependency.

Highest-value human gate: compare Stone versus Industrial and upright movement; do not automatically expand unvalidated behavior to remaining Ages. Art remains working-prototype, attack/death/mount/boss polish partial; no HUMAN_FUN_PASS or60FPS. See AGE_COMBAT_EVOLUTION.md and ADR0025. Draft PR5 https://github.com/Ratthabhumi/-SEED/pull/5 targets PR4. Focused27/27 and committed rush/pool8/8, typecheck,31-asset provenance and build passed. Local full check421 passed/1 policy180s timeout plus worker onTaskUpdate timeout; no thresholds weakened. First browser run exposed POI-discovery interference and missed recovery while screenshotting; isolated the arena and used real fixed-step, temporarily frozen encounter captures. Corrected movement and24-state-per-language roster14/14 passed locally; encounter capture was canceled correctly by friendly knockback, so friendly fire is suppressed only in that isolated fixture. Added Guardian enablement/Age regression (focused9/9 passed). Final16-case matrix/48 Origin-Age-language captures and final exact-head CI/ZIP receipt are maintained in PR5 after completion.

## Unified art/UI corrective work — 2026-10-12

Work branch feat/unified-art-ui-repair-20261012, based on verified local/remote PR3 a1d74ca. Existing PR1/2/3 and main untouched. Incoming human report219 at a1d74ca preserved, raw and sanitized evidence never replaced by synthetic tests; private baseline copies in scratch/unified-art-baseline-20261012.

Implemented: typed theme + generated CSS/Phaser palette, bounded title/Archive regions with persistent Start footer, native Origin previews, original ten actor strips with six reusable equipment Ages and three frame slots (tank/boss gait still rigid). Production hero/enemy/guardian/squad body shapes suppressed; functional telegraphs remain. One pooled world repair label/bar reads canonical repairT/range, pauses/resets with simulation; mechanics unchanged. No version/dependency changes. All actor sources remain working-prototype, authored attack/death sequences and human visual approval pending.

Docs: UI_DESIGN_SYSTEM.md, ACTOR_COVERAGE.md, UNIFIED_ART_UI_REVIEW.md, ADR0024 and actor-family-board.svg. New tests cover contrast/asset coverage/no primitive body, repair derivation/real10s restoration and browser title matrix/repair pause-exit-resume. PR4 is a separate Draft targeting PR3. Focused17 tests/analyze6/typecheck/provenance/build/ZIP/release verification passed. Local full check exceeded frontier-policy180s timeout; log retained, no threshold changes. c9f3cb5 CI Node22/24/analyze passed; e2e found schema1 fixture wrongly accessing meta. Fixture corrected and48 combinations partitioned per viewport, funded purchase cases separate. Local corrected browser suite16/16 passed, covering48 viewport/scale/language combinations and native purchases/repair. Code checkpoint42ae39e has Node22/24 full CI checks passed; final four-job exact-head receipt and artifact links are recorded in PR4 after CI completes. See UNIFIED_ART_UI_REVIEW.md for evidence and performance limits. Never mark art complete or60FPS from synthetic tests.

## Living Frontier implementation checkpoint — 2026-10-12
Work branch: feat/visual-gameplay-evolution-20261011, based on PR2 head781687a. PR2/PR1/main remain untouched. Commits00f22e6 preserve real Content10 human evidence,1b22aab adds FPS/QA launcher,235be2c adds Archive; current milestone adds original vector slice, site previews, acquired combat behaviors/fusion, bounded feedback and responsive pause.

Delivered: schema2 migration with safe v1 fallback; idempotent defeat/voluntary boss-victory rewards; three optional one-time purchases; Attempt distinct from World. Content11 adds Conduction, Relay and acquired-tag fusion; all new flags/timers hashed/reset on child. Worldgen2 geometry unchanged; Verdant decorative terrain has no collision. MIT original assets have manifest hashes and bundled license; working prototype only. Site risk uses the exact canonical spatial query and first-Signal affordability exemption. Reduced Effects/Shake and max8 synthesized audio voices. Pause fits EN1920×1080 and TH1280×720 at100%;200% safely scrolls. Actual browser captures reviewed; no human fun verdict inferred.

Verification: npm run check passes407 tests, provenance and build; new browser suite4/4 passes. Existing playability cases11/11 passed in the preceding combined run; it exposed the new TH fit failure, subsequently fixed and rerun. Publication requires final check/analyze/ZIP/release verification plus exact pushed-SHA CI4/4 and two ZIP artifacts. Record authoritative CI completion in the PR/task without claiming green in advance. No merges, tags, public release or v0.27.

Evidence/design: docs/LIVING_FRONTIER_REVIEW.md, docs/ADR/0023-visual-gameplay-and-archive-slice.md, docs/frontier-style-board.svg, docs/playtests/frontier-policy-sanitized.json and frontier-performance-sanitized.json. Human terminal report296 and feedback revision297 share one session/wallEnd; console identifies sequence. Raw evidence copied with hashes under scratch/visual-evolution-evidence-20261011, never overwritten. Old INTERRUPTED_BY_BUG preserved. Tiny canonical policy cohort:1 victory,5 defeats,2 time limits; no target human win rate claimed.

Next gate: fresh human defeat → Archive purchase → Attempt2 and optional boss finish/World2, actual hardware stress performance, visual readability/style and fun feedback. The latest sparse local software-rendered trace misses frame and child renderer-CPU targets; no60FPS certificate or relaxed budget. See exact measured values and limitations in the review. Physical obstacles and expanded art families are deferred for validated navigation/style/performance. No additional market research performed per user request; existing research inputs retain their boundaries.

# Session Handoff

## Current review experiment — 2026-10-11

Branch: feat/content9-ascension-guidance-20261011, based on clean Content9 a09babd. Separate Draft PR against the Content9 branch; PR1 remains unchanged. Versions: worldgen2/content10/save1. Recovered report229 and genuine negative child-arrival feedback are in docs/playtests/content9-ascension-human-20261011.md. Raw evidence is privately preserved. Latest audit: docs/research/content10-ascension-guidance-audit-20261011.md; human follow-up: docs/playtests/ASCENSION_AB_CHECKLIST.md. Checkpoint tests394 PASS; standalone analyze6 PASS; focused browser6 PASS; exact-head delivery receipt and CI remain pending until publication. The older canonical/QA sections below are historical baselines, not certification of this experiment.


## Latest human playtest evidence

<!-- QA-ENGAGEMENT-START -->

# -SEED v0.26 Experience Evidence Human — Sanitized Evidence

> Auto-generated by `npm run qa:report` from local QA telemetry.
> Machine evidence only — fun and readability verdicts need a human.

## Run

- sessionId: qa-8696-wi3zu5
- reportSequence: 176
- buildSha: 9b5c1facd4bbab891b452051b392e5e460c76353
- buildDirty: false
- seed: EPOCH-GOLDEN-001
- origin: hunters
- package: 0.2.0-dev.0 / worldgen 3 / content 18 / save 2
- endReason: target-complete
- wallDuration: 913.49s
- viewport: 2560x1305 / refresh: ~36Hz

## Route
- [x] run started (0.00s)
- [x] Bronze (117.70s)
- [x] Iron (251.05s)
- [x] Industrial (278.37s)
- [x] Atomic (528.28s)
- [x] Space (529.12s)
- [x] boss spawned (540.23s)
- [x] boss killed (595.13s)
- [x] ascension offered (595.13s)
- [x] ascension started (0.00s)
- [x] child world (0.00s)
- [x] post-ascension +30s (30.10s)
- [x] post-ascension +60s (60.33s)
- [x] post-ascension +120s (120.07s)
- [ ] player died
- [x] run ended (120.07s)

## Civilization Command Loop Usage

- Tech Map opened: 1
- First Tech Map open: 254.50s sim
- Paths pinned: 1 [stone-tools]
- Reserve uses: 0 (attempts 0)
- Rerolls: 0 (attempts 0, unavailable 0)
- Skips: 0
- Breakthroughs completed: 2 [metallurgy, fortress]

- Territories claimed: 8 [ruin, ruin, signal, vault, meteor, ruin, ruin, ruin] (claim attempts 8)
- First territory time: 251.02s sim
- Outpost types: [Research: 2, Military: 2, Economy: 5]
- Outpost upgrades: 1 (attempts 1)
- Raids incoming: 2
- Raids defended: 1
- Raids lost: 1
- Outposts repaired: 1

- Rally commands (Q): 0
- Focus commands (E): 0
- Hold commands (R): 0
- Origin ability uses (F): 0
- Civ Map opens (M): 3

- Age gate block summary:
  - Stone dwell: 117.70s
  - Bronze dwell: 133.35s
  - Iron dwell: 27.32s
  - Industrial dwell: 249.92s
  - Atomic dwell: 0.83s
  - Space to Boss kill: 66.02s

## Engagement Identity
- @0.00s stone asc 0: origin hunters [energy+field+kinetic] lv1 k0e0d0f0 techs 0 knowledge 0 breakthroughs [-] legacies [-] poi [-]
- @117.70s bronze asc 0: origin hunters [energy+field+kinetic] lv9 k1e1d1f1 techs 11 knowledge 501 breakthroughs [-] legacies [-] poi [meteor+ruin+vault]
- @251.05s iron asc 0: origin hunters [energy+field+kinetic] lv17 k2e2d2f2 techs 20 knowledge 2224 breakthroughs [-] legacies [-] poi [meteor+ruin+signal+vault]
- @278.37s industrial asc 0: origin hunters [energy+field+kinetic] lv19 k3e3d3f3 techs 22 knowledge 2818 breakthroughs [metallurgy] legacies [-] poi [meteor+ruin+signal+vault]
- @528.28s atomic asc 0: origin hunters [energy+field+kinetic] lv32 k4e4d4f4 techs 35 knowledge 9902 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal+vault]
- @529.12s space asc 0: origin hunters [energy+field+kinetic] lv32 k5e5d5f5 techs 35 knowledge 9935 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal+vault]
- @595.13s space asc 0: origin hunters [energy+field+kinetic] lv34 k5e5d5f5 techs 37 knowledge 12197 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal+vault]
- @0.00s stone asc 1: origin engineers [defense+kinetic] lv1 k0e0d0f0 techs 40 knowledge 0 breakthroughs [-] legacies [affinity-kinetic] poi [-]
- @89.53s bronze asc 1: origin engineers [defense+kinetic] lv9 k1e1d1f1 techs 52 knowledge 500 breakthroughs [-] legacies [affinity-kinetic] poi [meteor+ruin+signal+vault]

## Knowledge At Age
- bronze @117.70s (asc 0): 501
- iron @251.05s (asc 0): 2224
- industrial @278.37s (asc 0): 2818
- atomic @528.28s (asc 0): 9902
- space @529.12s (asc 0): 9935
- bronze @89.53s (asc 1): 500

## Sim Decisions (ordered)
- [dominion] 0/0 @0.98s stone asc 0
- [mission_complete] bronze @9.45s stone asc 0
- [tech] stone-fire @14.17s stone asc 0
- [tech] application-kinetic-0 @23.63s stone asc 0
- [poi-major] meteor @28.33s stone asc 0
- [site_prompt] CLAIMABLE:meteor @28.35s stone asc 0
- [focus] poi-21e04aff--2-2-0 @28.35s stone asc 0
- [tech] web:application-kinetic-0:1 @28.35s stone asc 0
- [tech] application-field-1 @39.50s stone asc 0
- [poi-major] ruin @46.20s stone asc 0
- [site_prompt] CONTESTED:ruin @46.22s stone asc 0
- [focus] poi-21e04aff--2-0-0 @46.22s stone asc 0
- [tech] application-energy-0 @46.22s stone asc 0
- [tech] web:application-energy-0:0 @49.22s stone asc 0
- [focus] poi-21e04aff--2-2-0 @57.13s stone asc 0
- [poi-major] vault @58.00s stone asc 0
- [site_prompt] CONTESTED:vault @58.03s stone asc 0
- [focus] poi-21e04aff--1-2-0 @58.03s stone asc 0
- [tech] weave-stone-warfare-culture @58.03s stone asc 0
- [focus] poi-21e04aff--2-2-0 @59.57s stone asc 0
- [poi_discovered] vault:+61 @66.15s stone asc 0
- [site_prompt] CONTESTED:vault @66.17s stone asc 0
- [focus] poi-21e04aff--2-4-0 @66.17s stone asc 0
- [tech] web:web:application-kinetic-0:1:1 @66.17s stone asc 0
- [focus] poi-21e04aff--2-2-0 @71.70s stone asc 0
- [focus] poi-21e04aff--2-4-0 @72.82s stone asc 0
- [tech] web:weave-stone-warfare-culture:1 @73.30s stone asc 0
- [focus] poi-21e04aff--2-2-0 @75.93s stone asc 0
- [focus] poi-21e04aff--2-4-0 @77.07s stone asc 0
- [focus] poi-21e04aff--2-2-0 @82.67s stone asc 0
- [focus] poi-21e04aff--1-2-0 @84.90s stone asc 0
- [focus] poi-21e04aff--2-2-0 @86.03s stone asc 0
- [focus] poi-21e04aff--1-2-0 @87.15s stone asc 0
- [focus] poi-21e04aff--2-0-0 @88.30s stone asc 0
- [poi_discovered] meteor:+49 @98.07s stone asc 0
- [site_prompt] CONTESTED:meteor @98.10s stone asc 0
- [focus] poi-21e04aff--3-0-0 @98.10s stone asc 0
- [tech] web:web:weave-stone-warfare-culture:1:1 @98.10s stone asc 0
- [poi_discovered] ruin:+43 @111.58s stone asc 0
- [site_prompt] CONTESTED:ruin @111.62s stone asc 0
- [focus] poi-21e04aff--4-0-0 @111.62s stone asc 0
- [tech] web:application-field-1:0 @111.62s stone asc 0
- [age_reached] bronze @117.67s stone asc 0
- [focus] dominion @131.30s bronze asc 0
- [tech] application-energy-1 @132.72s bronze asc 0
- [focus] poi-21e04aff--4-0-0 @134.48s bronze asc 0
- [mission_complete] iron @137.68s bronze asc 0
- [focus] poi-21e04aff--2-2-0 @142.40s bronze asc 0
- [focus] poi-21e04aff--4-0-0 @143.52s bronze asc 0
- [focus] dominion @150.35s bronze asc 0
- [tech] application-field-0 @152.87s bronze asc 0
- [focus] poi-21e04aff--4-0-0 @153.40s bronze asc 0
- [focus] dominion @157.95s bronze asc 0
- [focus] poi-21e04aff--2-2-0 @164.73s bronze asc 0
- [poi-major] signal @165.82s bronze asc 0
- [site_prompt] CLAIMABLE:signal @165.83s bronze asc 0
- [focus] poi-21e04aff--3-2-0 @165.83s bronze asc 0
- [tech] web:web:application-kinetic-0:1:0 @165.83s bronze asc 0
- [focus] poi-21e04aff--2-2-0 @168.42s bronze asc 0
- [focus] poi-21e04aff--3-2-0 @169.55s bronze asc 0
- [focus] dominion @172.92s bronze asc 0
- [focus] poi-21e04aff--4-0-0 @175.18s bronze asc 0
- [focus] dominion @177.43s bronze asc 0
- [poi_discovered] meteor:+57 @186.05s bronze asc 0
- [site_prompt] CONTESTED:meteor @186.07s bronze asc 0
- [focus] poi-21e04aff--5--1-0 @186.07s bronze asc 0
- [tech] application-kinetic-1 @186.07s bronze asc 0
- [focus] poi-21e04aff--4-0-0 @188.53s bronze asc 0
- [focus] poi-21e04aff--5--1-0 @190.85s bronze asc 0
- [poi_discovered] ruin:+47 @191.20s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @192.00s bronze asc 0
- [focus] poi-21e04aff--4--2-0 @192.00s bronze asc 0
- [poi_discovered] signal:+95 @192.75s bronze asc 0
- [site_prompt] CONTESTED:signal @192.78s bronze asc 0
- [focus] poi-21e04aff--5--2-0 @192.78s bronze asc 0
- [tech] web:web:application-energy-0:0:1 @192.78s bronze asc 0
- [poi_discovered] meteor:+60 @195.25s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @196.25s bronze asc 0
- [focus] poi-21e04aff--5--3-0 @196.25s bronze asc 0
- [poi_discovered] ruin:+50 @198.70s bronze asc 0
- [site_prompt] CONTESTED:ruin @199.63s bronze asc 0
- [focus] poi-21e04aff--6--4-0 @199.63s bronze asc 0
- [poi_discovered] vault:+80 @201.10s bronze asc 0
- [site_prompt] CONTESTED:vault @201.12s bronze asc 0
- [focus] poi-21e04aff--6--5-0 @201.12s bronze asc 0
- [tech] web:application-kinetic-1:0 @201.12s bronze asc 0
- [poi_discovered] signal:+100 @202.60s bronze asc 0
- [site_prompt] CONTESTED:signal @203.23s bronze asc 0
- [focus] poi-21e04aff--7--5-0 @203.23s bronze asc 0
- [focus] poi-21e04aff--6--5-0 @205.47s bronze asc 0
- [poi_discovered] meteor:+60 @206.45s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @206.58s bronze asc 0
- [focus] poi-21e04aff--6--6-0 @206.58s bronze asc 0
- [poi_discovered] ruin:+50 @207.42s bronze asc 0
- [site_prompt] CONTESTED:ruin @207.45s bronze asc 0
- [tech] web:application-kinetic-0:0 @207.45s bronze asc 0
- [focus] poi-21e04aff--5--6-0 @209.00s bronze asc 0
- [focus] poi-21e04aff--6--5-0 @210.13s bronze asc 0
- [poi_discovered] ruin:+50 @210.50s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @211.27s bronze asc 0
- [focus] poi-21e04aff--5--7-0 @211.27s bronze asc 0
- [focus] poi-21e04aff--5--6-0 @212.40s bronze asc 0
- [poi_discovered] ruin:+50 @212.90s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @213.53s bronze asc 0
- [focus] poi-21e04aff--4--7-0 @213.53s bronze asc 0
- [focus] poi-21e04aff--5--7-0 @214.65s bronze asc 0
- [focus] poi-21e04aff--4--7-0 @215.80s bronze asc 0
- [poi_discovered] ruin:+50 @215.88s bronze asc 0
- [site_prompt] CONTESTED:ruin @216.95s bronze asc 0
- [focus] poi-21e04aff--3--7-0 @216.95s bronze asc 0
- [poi_discovered] ruin:+50 @218.53s bronze asc 0
- [site_prompt] CONTESTED:ruin @218.55s bronze asc 0
- [focus] poi-21e04aff--2--8-0 @218.55s bronze asc 0
- [tech] web:web:web:weave-stone-warfare-culture:1:1:1 @218.55s bronze asc 0
- [focus] poi-21e04aff--3--7-0 @221.45s bronze asc 0
- [focus] poi-21e04aff--2--8-0 @227.07s bronze asc 0
- [focus] poi-21e04aff--3--7-0 @228.18s bronze asc 0
- [poi_discovered] vault:+85 @228.92s bronze asc 0
- [site_prompt] CONTESTED:vault @229.30s bronze asc 0
- [focus] poi-21e04aff-0--6-0 @229.30s bronze asc 0
- [focus] dominion @231.58s bronze asc 0
- [poi_discovered] signal:+106 @231.67s bronze asc 0
- [site_prompt] CLAIMABLE:signal @232.73s bronze asc 0
- [focus] poi-21e04aff-0--7-0 @232.73s bronze asc 0
- [focus] poi-21e04aff-0--6-0 @233.85s bronze asc 0
- [tech] web:weave-stone-warfare-culture:0 @234.02s bronze asc 0
- [poi_discovered] vault:+85 @234.18s bronze asc 0
- [site_prompt] CONTESTED:vault @235.22s bronze asc 0
- [focus] poi-21e04aff--1--7-0 @235.22s bronze asc 0
- [focus] poi-21e04aff-0--7-0 @236.33s bronze asc 0
- [poi_discovered] meteor:+64 @238.35s bronze asc 0
- [site_prompt] CONTESTED:meteor @238.60s bronze asc 0
- [focus] poi-21e04aff-1--8-0 @238.60s bronze asc 0
- [focus] poi-21e04aff-0--7-0 @240.83s bronze asc 0
- [focus] poi-21e04aff--1--7-0 @243.10s bronze asc 0
- [focus] poi-21e04aff--2--8-0 @244.25s bronze asc 0
- [focus] poi-21e04aff--3--7-0 @247.65s bronze asc 0
- [focus] poi-21e04aff--4--7-0 @249.92s bronze asc 0
- [claim_attempt] poi-21e04aff--4--7-0 @251.02s bronze asc 0
- [territory_claimed] poi-21e04aff--4--7-0:ruin @251.02s bronze asc 0
- [focus] poi-21e04aff--5--7-0 @251.02s bronze asc 0
- [first_claim] 251.0s @251.02s bronze asc 0
- [dominion] 1/1 @251.02s bronze asc 0
- [outpost_spec] poi-21e04aff--4--7-0:military @251.02s bronze asc 0
- [age_reached] iron @251.02s bronze asc 0
- [claim_attempt] poi-21e04aff--5--7-0 @253.70s iron asc 0
- [territory_claimed] poi-21e04aff--5--7-0:ruin @253.70s iron asc 0
- [outpost_spec] poi-21e04aff--5--7-0:research @253.70s iron asc 0
- [focus] poi-21e04aff--5--6-0 @253.85s iron asc 0
- [dominion] 2/2 @253.85s iron asc 0
- [techmap_open] open @254.50s iron asc 0
- [focus] poi-21e04aff--3--7-0 @254.50s iron asc 0
- [pin] stone-tools @254.50s iron asc 0
- [poi_discovered] signal:+117 @258.48s iron asc 0
- [site_prompt] CONTESTED:signal @258.52s iron asc 0
- [focus] poi-21e04aff--4--8-0 @258.52s iron asc 0
- [tech] stone-tools @258.52s iron asc 0
- [breakthrough] metallurgy @258.52s iron asc 0
- [mission_complete] industrial @258.52s iron asc 0
- [focus] poi-21e04aff--2--8-0 @260.12s iron asc 0
- [focus] poi-21e04aff--4--8-0 @261.27s iron asc 0
- [focus] poi-21e04aff--2--8-0 @270.37s iron asc 0
- [focus] poi-21e04aff--4--8-0 @271.50s iron asc 0
- [poi_discovered] ruin:+74 @274.28s iron asc 0
- [site_prompt] CLAIMABLE:ruin @274.32s iron asc 0
- [focus] poi-21e04aff--5--11-0 @274.32s iron asc 0
- [tech] iron-ballistics @274.32s iron asc 0
- [poi_discovered] ruin:+74 @276.97s iron asc 0
- [site_prompt] CLAIMABLE:ruin @277.17s iron asc 0
- [focus] poi-21e04aff--6--12-0 @277.17s iron asc 0
- [focus] poi-21e04aff--5--11-0 @278.27s iron asc 0
- [poi_discovered] vault:+118 @278.32s iron asc 0
- [age_reached] industrial @278.33s iron asc 0
- [site_prompt] CLAIMABLE:vault @278.37s industrial asc 0
- [focus] poi-21e04aff--5--12-0 @278.37s industrial asc 0
- [focus] poi-21e04aff--5--11-0 @280.63s industrial asc 0
- [focus] poi-21e04aff--5--12-0 @281.77s industrial asc 0
- [focus] poi-21e04aff--5--11-0 @284.02s industrial asc 0
- [focus] poi-21e04aff--4--8-0 @286.28s industrial asc 0
- [claim_attempt] poi-21e04aff--4--8-0 @290.85s industrial asc 0
- [territory_claimed] poi-21e04aff--4--8-0:signal @290.85s industrial asc 0
- [focus] poi-21e04aff--5--11-0 @290.85s industrial asc 0
- [dominion] 3/3 @290.85s industrial asc 0
- [outpost_spec] poi-21e04aff--4--8-0:economy @290.85s industrial asc 0
- [tech] web:iron-ballistics:1 @293.33s industrial asc 0
- [poi_discovered] vault:+129 @297.43s industrial asc 0
- [claim_attempt] poi-21e04aff--6--8-0 @297.87s industrial asc 0
- [territory_claimed] poi-21e04aff--6--8-0:vault @297.87s industrial asc 0
- [dominion] 4/3 @297.87s industrial asc 0
- [outpost_spec] poi-21e04aff--6--8-0:economy @297.87s industrial asc 0
- [focus] poi-21e04aff--6--6-0 @299.28s industrial asc 0
- [focus] poi-21e04aff--5--6-0 @301.57s industrial asc 0
- [focus] poi-21e04aff--6--6-0 @302.70s industrial asc 0
- [claim_attempt] poi-21e04aff--6--6-0 @303.27s industrial asc 0
- [territory_claimed] poi-21e04aff--6--6-0:meteor @303.27s industrial asc 0
- [focus] poi-21e04aff--5--6-0 @303.27s industrial asc 0
- [dominion] 5/3 @303.27s industrial asc 0
- [outpost_spec] poi-21e04aff--6--6-0:research @303.27s industrial asc 0
- [claim_attempt] poi-21e04aff--5--6-0 @304.87s industrial asc 0
- [territory_claimed] poi-21e04aff--5--6-0:ruin @304.87s industrial asc 0

## Performance Summary
- bronze: n=207 fpsMin=39 frame 25.10/53.80/71.60ms sim 1.01/1.38/1.65ms ent 18/13/44
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 195/51118080 bytes; misses 195, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- iron: n=194 fpsMin=41 frame 22.10/54.00/72.10ms sim 1.00/1.29/1.37ms ent 23/22/125
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 489/128188416 bytes; misses 489, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- industrial: n=47 fpsMin=39 frame 21.70/65.60/105.30ms sim 1.18/1.48/1.51ms ent 26/21/147
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 561/147062784 bytes; misses 561, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- atomic: n=415 fpsMin=37 frame 23.80/55.00/65.30ms sim 1.05/1.41/1.55ms ent 29/36/347
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1281/335806464 bytes; misses 1281, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- space: n=2 fpsMin=38 frame 32.60/32.60/32.60ms sim 1.21/1.21/1.21ms ent 28/20/345
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1281/335806464 bytes; misses 1281, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- boss-spawn: n=16 fpsMin=39 frame 39.80/70.30/70.30ms sim 1.31/1.70/1.70ms ent 31/18/348
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1303/341573632 bytes; misses 1303, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- boss-fight: n=73 fpsMin=42 frame 24.70/53.10/79.30ms sim 1.21/1.68/1.83ms ent 32/22/362
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1384/362807296 bytes; misses 1384, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- post-ascension: n=25 fpsMin=36 frame 26.60/40.20/87.60ms sim 1.05/1.29/1.29ms ent 18/12/369
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1391/364642304 bytes; misses 1391, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- post-ascension+30s: n=49 fpsMin=45 frame 23.30/50.00/65.80ms sim 0.96/1.60/2.10ms ent 26/12/12
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1517/397672448 bytes; misses 1517, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- post-ascension+60s: n=50 fpsMin=47 frame 19.70/67.60/92.60ms sim 1.21/1.50/1.54ms ent 51/22/33
  terrain cumulative max: ground 36.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1609/421789696 bytes; misses 1609, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- post-ascension+120s: n=89 fpsMin=43 frame 20.80/48.80/64.50ms sim 1.12/1.27/1.36ms ent 54/38/74
  terrain cumulative max: ground 88.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1725/452198400 bytes; misses 1725, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.
- end: n=1 fpsMin=61 frame 36.20/36.20/36.20ms sim 1.04/1.04/1.04ms ent 20/17/59
  terrain cumulative max: ground 88.10ms, chunks 22.30ms, upload CPU call 53.40ms, worker 178.10ms; uploads 1725/452198400 bytes; misses 1725, pending 0, workerFailed false. Sparse telemetry, not a GPU/causal trace.

## Assertions / Errors
- failed assertions: 0
- console errors: 0

## Human Ratings (recorded, never inferred)
- not provided

## Human Feedback Marks (optional)
- none pressed (neutral — not positive, not negative)

## Human Comment (optional)

- comment: NOT PROVIDED

## Evidence & Gate Classification

- Machine Telemetry Status: AUTOMATED_CHECKS_PASS
- Human Subjective Evidence: PENDING_HUMAN_PLAYTEST
- Human Fun / Replay Verdict: HUMAN_FUN_PENDING (No automated fun claims allowed)

> RULE: Telemetry describes what happened; only living human players can rate fun and strategic agency.
> A report without genuine human subjective input MUST NOT be labeled as HUMAN_FUN_PASS.

<!-- QA-ENGAGEMENT-END -->

## Historical canonical state — 2026-10-08

- Codex review continuation (2026-10-08): retained the existing branch and baseline; corrected readiness blockers listed below. The prior CI run certifies `efb9f81` only; verify the correction commit's exact-SHA CI before calling the corrected build ready.

- Active branch: `feat/v0261-outpost-softlock-20261008`
- Base development commit: `5fe8f26506411869e1ec04f0f57b2d579481eeb2` on `feat/v026-experience-evidence-20261008` (v0.26 Experience Evidence).
- Certified v0.25 automated baseline: `12e172cba23fdf06cec4bf0057fcf3fcfb3a4d2d` on `feat/v025-player-visible-emergence-20261005` (exact-SHA CI run 37658953734 100% green: Node 22, Node 24, Chromium E2E, Analyze).
- Certified v0.24 technical baseline: `9c261e43c670ddf2208f8b4c38748879bcf167da` on `proto/v024-emergent-seed-core-20261002`.
- Canonical main: `5e6d5c65ea905bc3859f115e73bfd02913988d45` (105 commits behind feature lineage; unmerged pending human playtest evidence).
- Versions: `WORLDGEN_VERSION = 2` / `CONTENT_VERSION = 8` / `SAVE_SCHEMA_VERSION = 1` / package `0.2.0-dev.0`.
- Current milestone: `v0.26.1 Playtest Readiness & Evidence Truth`.
- Status verdicts:
  - `TECHNICAL_GATE = PASS` (Node 22/24 typecheck, 346 tests, 42 Playwright E2E, analyze audit, clean zip build).
  - `PLAYTEST_READINESS = READY` (`npm run qa:human` validated, port collision fixed, privacy sanitization enforced).
  - `HUMAN_FUN_VERDICT = PENDING` (Cannot be synthesized by bots or inferred from telemetry; awaiting genuine human testers).
  - `REPLAY_DESIRE_VERDICT = PENDING`.
- Next milestone gate: **Human Playtest Gate** via `docs/playtests/PLAYTEST_PROTOCOL_V0261.md`.

---

## v0.26.1 IMPLEMENTATION OVERVIEW

1. **Evidence Integrity & Audit Corrections (`tests/emergence/distribution.audit.test.ts`)**:
   - **Class A Metric Truth**:
     - Denominator explicitly bound to genuinely observed draft samples (`observedDraftSamples = 6000`).
     - Corrected collidingFingerprintGroupRate to divide by unique groups (historical 15.90% used drafts as denominator) from `duplicateDraftSampleFrequency` (53.97%, true duplicate sample frequency across all drafts).
     - Reroll pool alternative candidate availability verified at 56.50% (> 8%).
     - Real age buckets (stone..space) verified with zero age quality clamping (all 4 qualities present).
   - **Class B Simulation Boundary Clarification**:
     - Verified 48-run factorial simulation matrix (3 seeds × 4 origins × 4 policies).
     - Explicitly clarified that runs test up to 40 seconds of canonical simulation time (2,400 steps @ 60 Hz).
     - Distinguishes canonical physics progression (`sim.step`) and direct simulation API actions (`claimTerritory`, `tryAbility`) from human UI interactions. EXPANDER claims (54 outposts) and AGGRESSOR ability uses (20) prove autonomous simulation capability, NOT player onboarding or human enjoyment.
   - **Class C Scope Alignment**:
     - Renamed to `[Class C: Single-Draft Offer & First-Pick Heuristic Divergence]`.
     - Documented that this evaluates single-draft offer engine divergence after staged Knowledge injection (`gainKnowledge(2000)`), NOT full multi-draft player decision trajectories or strategic preference.
     - Preserved normalized base-2 Jensen-Shannon Divergence mathematics.

2. **Research-to-Runtime Ledger Reconciliation (`docs/research/v026-research-runtime-ledger.md`)**:
   - Corrected all non-existent paths from v0.26 ledger to verified repository paths:
     - `src/core/world/laws.ts` → `src/core/emergence/worldLaws.ts`
     - `src/core/tech/techGraph.ts` → `src/core/tech/graph.ts` & `src/core/emergence/offerEngine.ts`
     - `src/core/territory/` → `src/core/world/territory.ts` & `src/core/emergence/outpostLogistics.ts`
     - `src/renderer/scenes/TechMapScene.ts` → `src/game/tech/TechMapView.ts` & `src/game/tech/TechGraphLayout.ts`
     - `src/core/director/phasedDirector.ts` → `src/core/emergence/director.ts` (`SCAFFOLD_ONLY`)
     - `src/core/ecology/` → `src/core/emergence/enemyEcology.ts` (`SCAFFOLD_ONLY`)
     - `src/core/events/` → `src/core/emergence/events.ts` (`SCAFFOLD_ONLY`)
     - `src/renderer/audio/` → `src/game/audio/sfx.ts` (`PARTIAL`)
     - `src/renderer/assets/` → `src/game/assets/seedAssets.ts`
   - Every system classified across: Source Exists, Canonical Sim Invoked, UI Exposed, Automated Tests, and Human Evidence.

3. **Human QA Pipeline & Privacy Hardening**:
   - `scripts/qa-report.mjs`: Added `sanitizePrivacy` redacting local filesystem paths (`C:\Users\...`, `/home/...`, `file:///...`), emails, and non-loopback IPs from committable reports.
   - Added `Evidence & Gate Classification` section: forbids labeling any report as `HUMAN_FUN_PASS` without explicit recorded human ratings.
   - `docs/playtests/PLAYTEST_PROTOCOL_V026.md`: Fixed instructions so testers do not run `npm run dev` simultaneously with `npm run qa:human`, preventing port 5173 collisions.

4. **Games User Research Protocol (`docs/playtests/PLAYTEST_PROTOCOL_V0261.md`)**:
   - Replaced heavy 8-run burden for novices with a two-stage qualitative protocol:
     - **Stage A**: Unmoderated/lightly moderated 15-minute blind first-run (3–5 novices) + neutral interview + Likert ratings.
     - **Stage B**: Focused counterbalanced paired comparisons (Hunters vs Sentinels on same seed, or Seed Alpha vs Seed Beta on Engineers).
     - 8-run factorial matrix preserved in appendix for specialized balance audits.
   - Enforces observation vs interpretation vs recommendation separation.

---

## Codex review corrections — 2026-10-08

- Corrected Class A unique-group denominator: colliding groups / unique fingerprints = 34.54%; duplicate samples remain 53.97%. Kept the existing 35% unique-group acceptance threshold.
- Restored the QA handoff markers required by finalization. Watcher and CLI now both save independent, safely hashed session summaries; raw same-second session/revision archives no longer collide.
- Save terminal comments and ratings after initial completion; reportSequence makes the watcher accept each human-response revision. Added browser POST regression coverage.
- Sink records server-derived buildSha and buildDirty in raw JSON; sanitized summaries retain both. Keep the checkout fixed throughout a pilot and reject UNKNOWN provenance.
- Redact the whole sanitized report, including labels/telemetry; cover arbitrary Windows drives and IPv6. Hashed report filenames prevent client session identifiers from escaping the report directory. Redaction covers common patterns and still requires operator privacy review before commit.
- Corrected remaining ledger paths/symbols, C claim key, unverified seed-bias claims, and hardware-performance claims. Small-cohort scores are discussion prompts, not automatic v0.27 implementation gates.
- Launcher smoke: npm run qa:human started Vite on 127.0.0.1:5173 with strictPort and watcher; stopped after the smoke. No human pilot was performed. Historical playtest documents were not overwritten.
- Local npm run check PASS: typecheck, 348 tests in 45 files (including all 6 audit tests), license/provenance verification, production build. A prior local run passed tests but had a worker RPC timeout; the clean rerun exited 0.
- Focused Chromium regression PASS: e2e/qa-auto.spec.ts verifies completion POST, subsequent human-comment POST, increasing sequence, and saved rating POST. Full E2E coverage is delegated to the new exact-SHA GitHub CI.
- HUMAN_FUN_VERDICT = PENDING; REPLAY_DESIRE_VERDICT = PENDING. No merge, release, or v0.27 implementation is authorized by this review.

### First human pilot

1. Use the corrected commit with clean gameplay/tooling files; stop any other server on 5173 and run npm run qa:human (there is no npm run qa alias).
2. Open http://localhost:5173/?qa=1, choose Origin, and START PLAYTEST. Follow Stage A in docs/playtests/PLAYTEST_PROTOCOL_V0261.md: 15 minutes without coaching, then neutral interview and explicit ratings.
3. Save in-game ratings/comment after ending. Verify the per-session sanitized summary, tested SHA, and buildDirty=false; raw JSON stays in gitignored test-results/human-playtests/.
4. Put interview observations in a separate anonymous pilot notes file; review privacy before committing evidence. Choose v0.27 only after actual findings.

## VERIFICATION COMMANDS

```bash
# Typecheck, unit & integration tests, license & asset verify, production build
npm run check

# Emergence & experience distribution audit (Class A, B, C)
npm run analyze

# Full Playwright Chromium E2E (43 specs)
npm run test:e2e

# Production ZIP packaging and itch.io compliance verification
npm run zip
npm run release:verify

# Launch Human QA Environment (single command starts Vite + watcher)
npm run qa:human
```


## v0.26.1 P1 Outpost softlock correction — 2026-10-08

- Work branch: `feat/v0261-outpost-softlock-20261008`, verified parent `c310c20cb56fa095ad7a4da50e5d93be974cb29f`.
- Operator-observed Industrial 11:43 / Logistics 6/6 softlock recorded in `docs/playtests/v0261-outpost-softlock-20261008.md`; session `INTERRUPTED_BY_BUG`, human fun/replay verdicts PENDING.
- Shared read-only canonical specialization predicate; optional EN/TH Later/Esc and keyboard focus containment; deferred claims do not mask first Signal or free claim actions. FIFO blocking contract preserved.
- First-Signal charged capacity overflow is an intentional existing mission exemption (7/6 or 8/6), not new free Logistics. Ordinary/subsequent claims cannot specialize past capacity. No balance, version, dependency, save or worldgen changes.
- Added focused unit and Chromium regressions; no v0.27, main merge, public release or tag.
- Final validation results and exact-SHA CI are reported in the corrective delivery. Until exact-SHA CI and operator revalidation, no human-pass claim.

- Final local check: 353/353 tests in 45 files, typecheck, provenance verification and production build PASS. Analyze and standalone test PASS. ZIP + release:verify 17/17 PASS (46 files, 1114 KB).
- Final focused Chromium: 8/8 PASS (6 new softlock cases + 2 frontier cases), including Thai 200% at 1280×720. Thai screenshots visually inspected.
- Initial full browser sweep: 45 PASS, 2 failures repaired and verified by the focused rerun, 1 pre-existing capture-only skip (`SEED_CAPTURE=1`). Final full-suite certification remains the exact-SHA CI job.
- One concurrent check attempt timed out in the existing 60-second factorial audit plus worker RPC; after browser work stopped, unchanged `npm run check` passed in 20.38s. No timeout/acceptance threshold relaxed. Existing large-bundle warning and NO_COLOR/FORCE_COLOR warnings remain; hardware performance was not measured.


## 2026-10-11 — Civilization playability workstream

Branch: feat/civilization-playability-20261011, based on d3814a6.
Status: IMPLEMENTED_PENDING_VALIDATION. No new human fun/replay pass.

User supplied four screenshots and reported unresolved technology/map/UI work.
Atomic's T2 upgrade mission is genuinely blocked at full 6/6 logistics; the old
Later/Escape modal fix remains. Added explicit confirmed capacity reallocation,
shared upgrade/reroll validation, biome-specific research/supply tradeoffs,
responsive pause/draft workspaces and truthful localized effect previews.
Unsupported modifiers are withheld instead of claiming powers they never apply.

Implemented bounded four-domain technology web: one root, authored joins,
choice-triggered deterministic expansion, stable polar layout, shared eligibility
and canonical graph hashing. CONTENT_VERSION 9; worldgen 2/save schema 1.
This is bounded compositional content, not an infinite-content claim.

Evidence and retest: docs/playtests/civilization-playability-20261011.md.
Research: docs/research/market-and-quality-20261011.md.
Raw human reports were backed up privately with hashes. Playwright's output
folder is isolated from human archives. Regression fixtures retain the exact
content-8 generator for a conditioned before/after choice-supply comparison.
Existing natural distribution thresholds are preserved. Test workers are bounded
to one to limit startup/memory pressure on office hardware. Windows watchdogs
are 600s after the exact d3814a6 baseline itself timed out (192.93s Class B);
Linux caps and numerical acceptance criteria remain unchanged (ADR 0020).

Required before readiness: complete check, analyze, browser regressions/visual
inspection, zip/release:verify, source review, focused commit/push and exact-SHA
GitHub CI 4/4. No main merge/tag or v0.27 start. Fresh human playtest remains
required after those gates pass.

Local validation boundary so far: complete check typechecked and ran all 367
tests; 366 passed, one obsolete root-only Ascension expectation failed. The
content-9 reset expectation was corrected explicitly. Final frontier refinement
requires two purchased domains; targeted rerun passed 27 selected cases (16
unselected by name filter), including the reset, refund, joins, determinism and
cohort. Final cohort max is 117 nodes. Complete final-source suite certification
will be the unfiltered exact-SHA Node 22/24 CI checks; do not call the initial
local check green. Standalone Analyze passed 6/6; production build passed. Final browser/package gates remain pending.

Final-source TypeScript PASS; standalone Analyze 6/6 PASS with no worker RPC
errors. Statistical thresholds unchanged. Browser validation also covers the
mobile radial workspace; headings/node labels/sidebar use line-height >=1.7.

Browser first pass: 22/26 passed. Four failures were diagnosed: territory snapshot positional compatibility (new fields now appended), excess Thai pause paragraph margins (removed without reducing line-height), and EN/TH mobile fixtures leaving two queued drafts (drain now explicitly verifies closure). Final rerun is required after rebuilding. Local browser pass also verified Later/Esc/FIFO, affordability, first/second Signal, reallocation cancel/confirm, no-alternative reroll, 200% Thai toolbar, map pan/zoom/pin and repeated open/close.

Browser second pass: 10/11 passed, including the corrected snapshot and both mobile languages. Thai pause still overflowed because full-width section-button rules also stacked scale/language buttons; scoped wrapping-row widths now correct this root cause. Visual inspection found empty map focus after fallback rewards: focus now chooses only IDs in the actual layout and tests require visible graph content. Smaller UI-only XP fixtures preserve decision/queue assertions without staging unnecessary levels. Final rebuilt browser rerun pending.

Final local acceptance: source TypeScript and production build PASS. Browser coverage completed through focused reruns: desktop EN/TH pause/draft, Thai 200%, full-logistics reallocation, terminal-reroll/map focus, mobile EN/TH actual visible graph, radial EN/TH. Existing Later/Esc/FIFO/Signal and pan/zoom/pin regressions passed earlier; final unfiltered browser suite is a CI gate. Screenshots inspected and hashed separately as synthetic evidence. Precommit ZIP/release:verify passed all 17 artifact checks (46 files, 2.6 MB extracted). After commit, rebuild/package clean HEAD and verify its exact-SHA CI 4/4 before the next human run.

Delivery boundary: initial local unfiltered check was NOT green; corrected focused unit cases and Analyze passed. Final unfiltered check runs on both Node 22 and 24 in GitHub CI. The final task response/Actions run and ignored scratch/playability-delivery-receipt.json record delivery SHA/CI/artifact evidence; fetch and verify rather than infer a live CI result from this precommit handoff. Human fun/replay and hardware frame-time budget remain unvalidated. Rollback source reference: d3814a6b7e94182a05be66e341eb36c0914eabc0 (content 8); no main merge/tag/v0.27.

Exact-SHA CI e470d710fc4ca4927096805c71d1c103a999fe7a run 38130807280: verify Node 22/24 and Analyze passed; full browser suite had 56 passed, one pre-existing skip, one failure in the retained readability contract. The persistent-draft instruction was 16px; corrected to body text (18px at 100%) without changing the assertion or reducing Thai line-height. Revalidate affected readability/desktop cases, commit normally and require all four jobs at the new SHA.
Local readability retest passed 1/1; desktop EN/TH retest passed 2/2 after the 18px correction. Updated Thai draft evidence/hash. All gameplay and tests are unchanged in this final corrective commit.

CI artifact audit found zero attached ZIPs despite passing upload steps: workflow used seed-web-{version}.zip while make-zip writes seed-web-v{version}.zip. Corrected the path and made missing files an upload failure. Final delivery must include two actual Node 22/24 ZIP artifacts as well as exact-SHA CI 4/4. Gameplay code is unchanged by this packaging correction.

## 2026-10-11 — competitive-quality execution pass

Starting SHA83a3a2f6943039c6779b261277c3d31371ab9d71, branch feat/civilization-playability-20261011, parent feat/v0261-outpost-softlock-20261008. Initial exact-SHA Actions38131525167 passed4/4 with368 units/57 browser passes/one capture-only skip and two ZIPs. Main remains5e6d5c65ea905bc3859f115e73bfd02913988d45. No merge, tag or release publication.

Preserved the operator's pre-existing generated report/handoff changes, privacy-reviewed sanitized session9bbc4e64c35275c8a56ca785, and ignored raw evidence. The new report has no human ratings/comment; its negative wall duration and save-time-only SHA cannot certify a clean running bundle. Earlier Industrial11:43 and content8 failures remain INTERRUPTED_BY_BUG; HUMAN_FUN_PENDING.

Demonstrated fixes: milliseconds-versus-seconds at QA finalization; build provenance frozen into bundle with dirty/unknown reconciliation at report save; raw Chronicle technology IDs resolved for EN/TH/current graph/fallback with honest old-world label; five English-only map tooltips localized. Added npm run qa alias of the single QA launcher. Canonical simulation, RNG, balance, content9/worldgen2/save1 and existing modal/logistics contracts unchanged. ADR0021 records boundaries.

New quality audit: docs/research/content9-quality-audit-20261011.md (A–L,8 references, real runtime classification, bugsA–J, finite-web limits, pilot/demo/market gates). Historical content8 ledger metrics are explicitly dated. Operator checklist: docs/playtests/CONTENT9_PILOT_CHECKLIST.md. Target-hardware60FPS/render budget remains unverified; observed frame p95=37.41ms is not isolated renderer duration.

Regression-first clock and both EN/TH browser Chronicle tests failed against baseline. Corrected final npm run check passes; detailed logs remain scratch/audit-check-final.log. Initial expanded test run failed because the new unit fixture lacked document; fixture corrected, no assertions removed. Final exact-SHA CI, new browser tests and ZIP validation gate delivery; see Actions on this branch and the final delivery receipt. Human subjective validation remains pending. Next experiments: first-minute comprehension and recognition of actual upgrade effects; no speculative systems or v0.27.

Delivery follow-up: Draft PR#1 is open against the parent softlock branch. Local follow-up375tests and two EN/TH browser regressions passed; packaging/release:verify passed. A final inspection found downloaded raw Markdown omitted bundle provenance although sink JSON/sanitized summaries contained it; added explicit buildSha and startup dirty fields with a focused regression. Final head CI supersedes the first follow-up run38135567502. No subjective verdict inferred.

Ascension review follow-up: canonical IDs can recur across worlds. Chronicle now uses the latest child-root/Ascension history boundary, so older entries never borrow a same-ID node name from the new world. Focused regressions cover ID reuse and FIFO boundary trimming; canonical history stays unchanged. Final head supersedes earlier follow-up CI runs.

CI fixture finding: exact-source push run38136149735 had58browser passes/one capture-only skip/one failure (TH2560×1272 draft absent); parallel PR run38136152333 passed59browser tests. The responsive fixture assumed grant(30) always reaches the next level, despite prior picks, pickups and higher XP thresholds. It now stages the current canonical XP deficit normalized by the build Knowledge multiplier; outpost bonuses can only increase the result. All layout assertions and timeouts remain unchanged; no gameplay or balance change. Final CI must rerun on the corrective head.

## 2026-10-11 — separate Ascension and goal-guidance experiment

Base: clean Content9 a09babd; new branch feat/content9-ascension-guidance-20261011. Existing PR1 stays Draft/unmerged. Raw observed world2 report229 and 452 files preserved privately with hashes BEFORE edits. Negative feedback preserved separately; no end/rating/post120 invented.

Implemented canonical pure path guidance; actual inherited-effect arrival; two child-only research/raid conditions and a shared claim objective; simple EN/TH terms; keyboard choice/modal flow; Chronicle display translations; renderer CPU-submit instrumentation. ADR0022 explains content10/worldgen2/save1 and world-one c9 laws compatibility. First full check passed391tests; final checks/CI still pending at this checkpoint. See content10 audit, terminology guide, recovered human report and ASCENSION_AB_CHECKLIST. Human fun/replay and representative performance remain pending.

Browser regression exposed stale pin header; refreshPinState now updates the live header and progress. Combo goals have native pin controls. Guidance progress traverses owned ancestors too so denominators do not shrink as prerequisites are acquired.

Final browser fixture correction: canonical snapshot.lvl[6] holds offers (lvl[5] is draftOpen). The full map/pin/choice assertions are retained; completing-card checks use the actual pending offer.

Final follow-up: historical EN browser copy assertions updated without reducing behavior/layout checks; broken combo prerequisite alternatives rejected with a regression. Wall-clock frame telemetry replaces Phaser-smoothed delta for measurement only. Targeted browser6/6 PASS; software SwiftShader short-run evidence and reviewed screenshots are in docs/playtests/content10-evidence. Both worlds miss total60FPS target; dense/human hardware certification remains pending. PR2 is Draft against Content9; no merge/tag or PR1 change. Final exact-head CI/artifact receipt is linked from PR2 after publication.

CI follow-up:6fb36f9 PR run38149414529 passed62 browser cases;3 responsive matrix cases still referenced the previous Thai reroll text. Updated that expectation and the intentionally skipped visual-capture selector to the new Thai label. Assertions/layout contracts retained; functional source unchanged. Exact-source final CI pending this test-only commit.

Visual evolution checkpointA: preserved2821 current evidence files before editing; live baseline PR2 remains781687a / green CI. FPS HUD reuses real-frame samples at2Hz and follows the top-left flow. QA launcher uses Node+Vite arguments without Windows shell. Full check394 PASS before the Archive checkpoint. Human completion report297 contains actual child120s and a negative difficulty comment, not a fun certification.

CheckpointB: full check398 PASS. Schema2 migrates existing schema1 without erasing settings/history. Three bounded Archive purchases now have real root-start effects, explicit costs and guarded idempotent settlement; no first-attempt forced loss or hidden difficulty. QA observation completion is not a currency payout. See ADR0023.
## Content15.2 integrated quality workstream — 2026-10-14

Parent PR11 exact0fa6378 verified OPEN/Draft and CI4/4 push/PR. Branch
feat/content15-integrated-human-quality-20261014 targets PR11, not main.
Focused Space activation reproduced; native capture forbids Space throughout
Draft. Physical movement tracking/context reset and explicit Phaser reset cover
preventDefault keyups (KeyboardManager ignores them), blur/hidden/maps/pause.
Hand grip origins replace27u detached centers; live localized boss phase/recovery
cue; HUD typography bounded while full menu text scale remains available.
HC friendly geometry cache64glyphs/1000quads/2.25MiB allocated only on first HC
use, unchanged vector fallback and canonical counts. Terrain Worker transfers
reversed RGBA for typed partial GPU upload, backing Canvas retained; fallback
alternating mirroring removed. Versions3/15/2, no canonical/balance/new dependency.

First full local browser run157PASS/5FAIL/1oldskip retained. Two input fixtures:
stationary Dash cannot satisfy canonical direction requirement; new native
keyup reset prevents stale Phaser keys. Tech Map Center exposed offscreen
intermediate zoom/pan animation; explicit Current/Center now snaps. QA identity
test correctly rejected dirty precommit build; rerun on clean committed source.
Early fixture schema/negative timer mistakes and cohort RPC failure retained;
no assertion threshold/timeout changes. Complete final gates/paired measurement/
exact-SHA CI and official ZIP receipt follow in one final Draft PR.

This remains PARTIAL, not a completed human quality milestone: full authored
motion/threat art, natural boss DPS/exposure, historical terrain preference,
all-mode performance and human art/fun/replay gates remain open until measured.
See docs/CONTENT15_2_INTEGRATED_DELIVERY.md and independent31-row human ledger.
Content15.2 cohort correction: all8 cases passed but two complete runs failed
Vitest onTaskUpdate RPC acknowledgement after continuous CPU-bound execution.
The harness yields via Node setImmediate between unchanged cases; no timeout,
policy or assertion change. Retain both failed logs and require a clean retry.
Content15.2 clean6d00fce local full browser:162PASS/1oldskip,17.1minutes; full
check484/54 provenance, Analyze6, ZIP source gates PASS. Cohort setImmediate
yield retry8/8 PASS without RPC error. Final editable-focus guard prevents
typing from moving/triggering game commands; focused native/QA and exact-head CI
must cover it. Generated8×2 Hunter walk was withheld (foot-contact chronology
unverified), actual source in docs/evidence/content152; no runtime allocation.
Content15.2 GPU corrections: d500253 typed prototype double-flipped tiles.
Native WebGL1/2 old-flag reproduction2FAIL; explicit unpack=false correction
2PASS with midtone RGBA matching Canvas bytes. Before picture/probe retained.
HC full96px quads raised short diagnostic GPU p95 from8.655 to14.880ms despite
CPU savings. Crop transparent area using CPU alpha bounds+2px gutters; retain
all real pixels/canonical shots and original fallback. Same-build fullquad
comparator, alpha edge tests and final cropped measurements required.

Content15.2 final publication checkpoint (15 October2026): corrected clean
product105b6c8 check486/81files/54 provenance and native focused17/17 PASS.
Paired240 rows completed without page errors; HC1920 cold median9.0→7.1ms,
warm7.7→5.9ms. Strict render<8 still fails one candidate cold run at8.0ms;
normal/reduced mixed, upload lifetime max29ms remains. Independent advancing
Space901.313s/54,002 unique frames: sim p95=1.0ms, renderer=4.7ms, frame=16.7ms;
boss/child/restart20s each advance without pause/errors. Staged HP/roster are
explicit; not natural combat/fun evidence. All raw observations, corrected
four-Origin Stone/Space gallery and native WebM committed under content152.
Generated walk experiment remains withheld; source/runtime motion unchanged.
Final docs/evidence commit changes no canonical/runtime code after105b6c8.
One stacked Draft targets PR11; final exact-SHA push/PR CI and official Node22/24
ZIP hashes are maintained in its PR body to avoid a self-referential SHA loop.
Quality remains PARTIAL; research questions are in the targeted research brief.

## Content15.3 implementation in progress —15 October2026

Verified PR12 ce63df35d52e8b3041d232f5e8e3438c087cecf8, clean starting tree;
new feat/content153-playable-visual-boss-20261015. Original hostile painted
ordinary/burst/boss-fan atlas, eight selected Hunters front Stone/Space attack/
recovery poses via existing importer/sampler, shared periodic terrain fallback,
144-case source-alpha occupancy audit and +12.5% Hero visual size implemented.
Walk generation remains withheld: gait chronology unverified, no layered artist
file fabricated. Native art quality is unaccepted until actual captures/review.
Boss safe-boundary threshold and cross-first escalation changes canonical
timing: WORLDGEN/CONTENT/SAVE3/16/2, old replays remain Content15. No HP/damage
gate or lethal rescue. Exact-parent36 seeded arena comparison script added;
no HP/phase writes during measured combat. All gates/evidence still pending.
Local command startup/checks became exceptionally slow; redundant owned typecheck
and focused-test processes were terminated to reduce overlap. No user processes
or QA sessions targeted. Preserve unfinished logs; do not claim their completion.
One Draft, full checks, native evidence, exact-head CI and official ZIP verification
must finish before final delivery. No main merge/tag/release authorization.

First uploaded checkpoint43b751d CI38649134645 failed typecheck: offline arena
helper imported node:timers/promises without project Node type declarations.
Use a standard setTimeout macrotask yield; no new dependency/threshold change.
Failed CI is retained, not a gameplay failure or a pass. Add full no-grants
natural progression observer via the existing policy (4Origins×3seeds×3draft
priorities); default cohort policy remains unchanged. Every defeat/unreached/
phase-skipped result is retained; finite execution is not boss-quality approval.

18033fd checkpoint: Node22/24 verify and Analyze (including natural36-case
execution) succeeded; render evidence failed before measurement because4190
is a Fetch-forbidden port. Use previously supported4187/4188, not a network
security workaround. No rows from that infrastructure failure count as timing
evidence. Existing strict8ms/five-block/500-800 requirements remain. Asset IDs
are genuine Content15 original-art entries, not Kenney; metadata corrected,
not integrity/license tests. Final native videos/480rows/ZIP receipt pending.

Final source correction: initial release/recovery guard exposed a jump back to
legacy chest-center sockets. Keep historical36-pose metadata immutable and add
source-reviewed current hand overrides in the v2 supplement; guard→idle <12px
regression, no projectile-origin change. Coordinates remain initial artist
review candidates. Native capture records served binary identity, actual player
coordinates/zoom, matching D700ms/W500ms comparison input, and separate preparation
versus encounter wall times. Performance uses safe4187/4188 and preserves all
failed rows before enforcing paused-state hash/density invariants. No new gates
are certified until final exact-head CI/artifacts complete.
