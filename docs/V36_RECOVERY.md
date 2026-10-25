# V3.6 — combat readiness and measured performance diagnosis

Parent: DraftPR25/fe04927d0a03f1478cdf4b57bb4aee40a68256dd. One child workstream.
[ADR0045](ADR/0045-final-anchor-weapon-readiness.md) records the actual correction
and the rejected target-lock alternative. This is a review candidate, not a
release or a human acceptance certificate.

## Combat evidence

All36 PR24/PR25 outcomes and hashes are preserved in
[the reference](evidence/v36-recovery/reference-pr24-pr25.json). The table has
9 lost wins,6 gained wins,8 lost Boss reaches and6 newly reached Bosses. Changed
coarse outcomes remain UNVERIFIED_OUTCOME_CAUSE: intentional muzzle/collision
changes do not prove that any particular defeat is a bug.

Readiness defects are separately reproduced with fixed inputs and the same
fixtures. Final-anchor ordering and near-muzzle retraction are implemented;
damage/HP/turn speed/cooldown/geometry are not tuned to obtain a score. The
controlled96-case ablation eliminated4 zero-volley fixtures and improved130
volleys to156. Locking targets alone produced126 and is rejected for this scope.

Fifteen changed-win policy trajectories were observed on each version. The first
parent runner completed its15 canonical hash assertions but exited with an
onTaskUpdate RPC timeout: it is retained as a failed run. Yielding between cases
corrected the harness; the parent15 then passed cleanly. Candidate15 also passed.
These developmental reports predate the final observer's resolved-damage and
missing-target-wait refinements. They are not the final full-cohort verdict.

The final Natural36 run compares exact PR25 with the candidate, retains every
loss/unreachable case, verifies each baseline hash and repeats the candidate
without observers. Its receipts carry the source SHA and all36 diagnostics.
Actual Boss HP DPS is distinct from raw Chronicle damage, and unresolved
projectiles/waits are not counted as misses/zero latency.

Development validation: full check555 tests/98 files, provenance and build PASS.
The staged owner route passed the native720EN pilot. A new ordinary-QA check
initially expected its inspector visible; the established contract intentionally
hides it. The failed trace is retained. The corrected check verifies REC,
hidden inspector and F10 expansion, and passed. This isolated correction is not
reported as a clean full browser run; the final CI receipt reports that separately.

Reproduce offline (never imported by production):

```powershell
node scripts/run-combat-regression.mjs parent
node scripts/run-combat-regression.mjs candidate
node scripts/run-combat-regression.mjs ablation
node scripts/run-natural-boss.mjs
```

## Short controlled performance investigation

The immutable official PR24/PR25 packages were served on one host with the same
Chromium/IntelANGLE-D3D11 backend,1920x1080 viewport, default browser scale,
seed, normal/HC modes and a warm paused500-enemy/800-projectile fixture. The
short pilot ran18 uninstrumented windows plus2 separate instrumented windows;
all completed, with no page errors. No tests, build or video encoding ran during
the pilot. Fresh contexts and seeded fixtures are not an OS-cache eviction claim.
Browser default scale was controlled by configuration but not separately sampled.

|Warm paused render p95 ms|Identical P25 A/A|Paired P24|Paired P25|
|--|--|--|--|
|Normal1080|9.0 /4.8|7.7 /7.2|8.3 /6.0|
|HC1080|17.1 /15.0|17.1 /16.1|12.2 /19.7|

Same-code variation overlaps the historical differences; no isolated P25 renderer
regression or causal speedup is established. Live normal1080 windows also failed
budgets on both versions: P24 render11.3–12.9/sim4.1–5.0ms; P25 render11.9–14.2/
sim4.0–6.1ms. Exact4 fails. Live retirements/inputs diverge across canonical versions,
so the live windows are not identical physics workloads.

Separate instrumented windows yielded valid non-disjoint GPU p95 roughly10.36ms
normal/10.91ms HC,167/152 valid samples and no captured >50ms long tasks. Nested
CPU/API spans identify actor preparation, Graphics and Mesh submission as costly
existing paths, not exclusive/additive totals. Warm texture-upload calls were
absent; drawElements counts were only3/4. GC and host scheduling were not isolated.
The shared GPU/CPU/driver contribution remains uncertain.

PreparedGround already retains native flat triangles. A reported18,493 HC
command-buffer entries is **not** proof that every command is tessellated again
each frame. Actor and friendly-projectile batching also already exist. Do not
invent another cache or infer a fix by subtracting inclusive percentiles. Existing
rejected cache approaches stay rejected; no speculative renderer change is made.

This pilot diagnoses uncertainty; it does not replace the existing paired
protocol or physical24 gate. The final physical24 campaign uses the unchanged
strict render<8ms AND sim<4ms predicate, retains every failure and stays separate
from CI/software-runner measurements. Do not label CLEAN_PLAYTEST_READY while
that gate remains open.

## Research and art disposition

|Topic|Status|Decision|
|--|--|--|
|Fixed step, seeded RNG, source sockets, physical muzzle|APPLIED|Retain; deterministic tests and release checks|
|Final-anchor aim and minimum barrel clearance|APPLIED|Reproduced defects; coherent correction|
|Target-lock counterfactual|REJECTED this cycle|Fewer controlled releases; no new target state|
|Blind aim-speed/damage/HP boosts|REJECTED|Do not manufacture21 wins|
|Prepared ground/actor/projectile batching|APPLIED, gate PARTIAL|Existing paths retained; no speculative cache|
|Physical timing and GPU diagnostics|PARTIAL|Controlled variance, unresolved production bottleneck|
|HQ painted lava Boss and weapon/projectile art|APPLIED|Unchanged source assets/provenance|
|Genuine painted animation layers|NOT IMPLEMENTED / OPEN|Artist must supply real source layers/frames,
anchors, sockets and timing; no vector stand-ins or fake anatomy|
|Original31 human readability/fun judgments|PARTIAL / OPEN|No automated result closes an issue|
|Market research / new gameplay systems|NOT IMPLEMENTED this cycle|Not needed to correct readiness|

## Owner diagnostic route (about3–5 minutes)

1. Preserve the old round. Start the existing **Play-SEED-QA.bat**, unchanged.
2. In a **private/incognito browser window**, open
   `http://127.0.0.1:5173/?e2e=1&combatReview=1` and start
   `EPOCH-GOLDEN-001`. This route deliberately does not record natural Human QA.
3. Use the labeled staged buttons: Bow, Near/Hand, Stationary/Moving,
   Left/Right, Multishot and Beam. Watch actual turn/release timing; use WASD.
4. Boss starts a real warned Slam with500HP; move out of its warned area.
   World2 stages eligibility, then uses the normal legacy/origin/intro UI.
   Esc pauses and collapses the review panel; test Restart and F3 frame pacing.
5. Repeat in Reduced/HC using settings at the actual gameplay viewport. Report
   aim, spacing, frame pacing and artistic judgments separately from scores.

Staging changes age/target HP and makes a weapon due for inspection. It is neither
a natural progression run nor a fire-rate/DPS benchmark. A failed/assisted human
round remains bug evidence; do not convert it to HUMAN_FUN_PASS.

## Integration readiness

Verified stack base: main5e6d5c65ea905bc3859f115e73bfd02913988d45. PR1 targets
feat/v0261-outpost-softlock-20261008 at d3814a6b7e94182a05be66e341eb36c0914eabc0,
which is108 commits above main. PR25 adds another86 commits through the stack:
194 above main before this workstream. This work adds its focused commit(s);
final receipts report the actual count. Prerequisites are not silently accepted.

Future integration needs review of that108-commit prerequisite and each stacked
delta, dependency-ordered current checks, final compatibility/provenance evidence,
resolved performance acceptance, real owner feedback and separate explicit owner
authorization for an exact integration plan. This task does not merge, retarget,
rebase, force-push, tag, release or change main.
