# V3.9 — CI infrastructure recovery and dense inspection

## Source and authorization

Continue `feat/v39-frame-interval-evidence-20261030` from7909bfa, main725cc79b.
Owner V3.7 checkout/untracked files/private QA and Parsec are preserved. PR30
caf6777 and PR31 remain Draft/open, unmerged. Current research packet permits
one coherent CI-recovery Draft to main; no new stack or micro-PR is needed.
Worldgen3 / Content20 / Save2 / child-law18 / accepted bow are unchanged.

Old exact-source CI41096719423: verify22/24 and analyze passed;235 browser
tests/1 skip passed before historical downloads failed. Both failed jobs depended
on run38918375553. GitHub now reports no PR18/19 artifacts. PR21/25 artifacts
were rechecked available before inventory; their retention is not permanence.

## Durable inputs, original integrity and evidence migration

See ADR0048 and `docs/evidence/legacy-baselines/manifest.json`. Each pinned Git
source and package-lock hash is checked before using an archive/cache or building.
Only explicitly supplied archive paths are inspected; no user-directory sweep.
Supplied wrong original bytes fail instead of silently rebuilding. Without a
verified original, clone detached source and run locked historical tooling.
Clean source and embedded build identity are mandatory. Runtime receipts contain
ZIP SHA256, per-file SHA256/size, normalized content-tree hash and exact producer
tools. ZIP traversal/symlink/duplicate/size guards apply before extraction.

Small original inventory records provenance/anchors without committing binaries:

|Baseline|Pinned source|Original remote at check|Verified original archive|
|--|--|--|--|
|PR18|cf5aaf69|absent|local archive matches immutable5a88... anchor|
|PR19|9b5c1fac|absent|local archive matches historical push22 receipt|
|PR21|835a25f8|available, finite retention|fresh official Node22 archive; clean stamp checked|
|PR25|fe04927d|available, finite retention|local archive matches historical package receipt|

All four source reconstructions were rehearsed locally; normalized extracted
trees matched the respective originals, while fresh ZIP hashes differ. The
committed PR18 rehearsal is precommit evidence, not final-source CI. Do not
claim byte-identical historical ZIPs or human art parity from reconstruction.
Final CI supplies its own clean producer receipts and toolchain-specific hashes.

The shared `baselines` job validates cache or rebuilds on miss/rejection, then
uploads a current-run handoff. Other jobs consume that handoff, not historical
run IDs. Missing required baselines make the workflow fail. Original comparison
V1 is not counted as passed by source comparison V2. All comparison outputs
include provenance and normalized-original parity. Current test assertions and
the established benchmark workloads/thresholds are retained.

```powershell
# Node24 + npm, Python3, Git; source history must include all pinned commits.
node scripts/resolve-legacy-baselines.mjs
# Optional explicit authorized archive map {"pr18":"...zip", ...}:
node scripts/resolve-legacy-baselines.mjs --archives path-to-map.json
# Shared validated directories/receipts appear in scratch/legacy-baselines.
node scripts/measure-content153.mjs --resolved
node scripts/capture-v3-recovery.mjs self
node scripts/capture-v32-slice.mjs test-results/v36-final scratch/legacy-baselines/pr25/dist fe04927d0a03f1478cdf4b57bb4aee40a68256dd pr25
```

Optional archives are not required for CI. Cache is an accelerator, not a durable
authority. Invalid-cache rejection and UNAVAILABLE receipts are retained. Test
fixtures exercise original/reconstructed/failure/cache/layout/provenance paths
without rebuilding four games in each unit invocation. Missing-module RED and
negative fixtures remain in ignored scratch logs; targeted13 tests pass.

## Dense encounter investigation

Use `node scripts/inspect-dense-boss.mjs` against a clean production build. One
owned preview/browser captures8 paused warning OFF/ON pairs across EN/TH,
720/1080 and Normal/HC. Initial density is exactly501 enemies including Boss and
800 shots. The warning-disabled image is a same-source visibility reference,
not a historical bug-fix BEFORE image. Existing geometry/visibility regressions
remain required. No new renderer or canonical damage geometry is introduced.

Exactly two10s live Normal windows inspect representative dense simulation,
using the existing fixed-step stress fixture and histogram/diagnostics. The
initial800 shots retire naturally; endpoint/checkpoint density is recorded,
never called a sustained800-shot workload. High HP/zero-damage enemy staging
is explicit. No second RAF or new profiler. Raw staged PNG/JSON stays ignored;
CI uploads it as evidence. Timing and image collection completion are not strict
physical acceptance or proof a player-facing defect was fixed.

Final-source native results and any real defect/before-after findings belong
in the final Draft/Issue29 receipt. If no defect reproduces, retain the evidence
gap and original31 statuses. Do not fabricate a product fix. No animation is
invented in lieu of genuine authored frames. Historical strict physical12/24,
human/art/production quality and release gates remain separate and OPEN.

## Verification and delivery

Run targeted resolver/geometry tests, full check, analyze, ZIP/release verification;
complete final exact-source CI runs the entire browser suite and all comparisons.
Natural36 is explicitly NOT_RUN_NO_CANONICAL_DELTA for this infrastructure-only
change; no fresh cohort pass is claimed. Candidate/push and PR merge source/tree
identities must be distinguished. Record final results in Issue29/Draft without
another source change merely to update CI status. No merge/release/deploy allowed.
