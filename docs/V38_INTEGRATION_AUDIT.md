# V3.8 — integration audit and candidate (decision packet)

Read-only audit plus one narrow compliance correction. No merge, retarget,
rebase, force push, release or `main` change. Gameplay unchanged:
Worldgen 3 / Content 20 / Save 2; the owner-accepted bow stays frozen.

## Facts

|Item|SHA|
|--|--|
|`main`|`5e6d5c65ea905bc3859f115e73bfd02913988d45`|
|Prerequisite tip (`feat/v0261-outpost-softlock-20261008`)|`d3814a6b7e94182a05be66e341eb36c0914eabc0`|
|PR26|`d4b66c2802b39e648edc11051e2268258fcf4a3f`|
|PR27 audited head (CI 10/10)|`95910baa5782f1dfcb2706e61b30eac33223107f`, tree `00206621`|

At PR27: 200 commits ahead of `main`, 0 behind (108 prerequisite + 92 across
PR1–PR27). The history is linear with no merge commits. `main` has no branch
protection; merge, squash and rebase are all enabled.

## Prerequisite audit (108 commits, full diff)

Tool: `scripts/audit-prerequisite.mjs` (read-only, full `git diff`, not the
GitHub compare API). Evidence: [`evidence/v38/prerequisite-audit.json`](evidence/v38/prerequisite-audit.json),
whole stack: [`evidence/v38/full-stack-audit.json`](evidence/v38/full-stack-audit.json).

Coverage: 300 files. By area: core simulation 34, game presentation 19, QA
runtime 6, tests 58, original art 18, vendor art 23, licenses 3, CI 1,
dependencies 2, scripts 13, agent tooling 26, docs 85. 85 binaries, none over
1 MB. Versions move from Worldgen 1 / Content 1 / Save 1 to 2 / 8 / 1.

|Finding|Class|Evidence/disposition|
|--|--|--|
|Runtime deps `@dagrejs/dagre` 3.1.1, `@panzoom/panzoom` 4.6.2 (MIT, exact pins), dev `@playwright/test`, engines Node ≥22|VERIFIED-SAFE|Recorded in `DEPENDENCY_POLICY.md` / `THIRD_PARTY_LICENSES.md` at the prerequisite tip; versions and lock licenses enforced by `verify-third-party`|
|Shipped `THIRD_PARTY_NOTICES.txt` omitted dagre and panzoom although both are bundled (MIT requires the notice in copies)|**CONFIRMED BLOCKER → FIXED**|Verbatim `licenses/DAGRE-MIT.txt`, `licenses/PANZOOM-MIT.txt`, notice entries; `verify-third-party` and `release:verify` now enforce them|
|`Math.random` in `src/core`|VERIFIED-SAFE|The only hits are comments stating "No Math.random"|
|Phaser/DOM/storage in `src/core`|VERIFIED-SAFE|No imports; the hits are comment words ("warning window", a save.ts header)|
|Secrets / private keys in the added lines|NONE FOUND||
|Personal paths in the added lines|VERIFIED-SAFE|Only sanitizer test fixtures and docs about redaction|
|`console.log` added under `src`|NONE|Script and test output only|
|CI jobs download artifacts by fixed historical run IDs|PLAUSIBLE RISK (P2, CI)|Artifacts expire with retention; the render-evidence job will need refreshed baselines. Not a code-integration blocker|
|`.agents/skills` (26 files) is agent tooling in the repo|NOTE|Not bundled into the game; can be kept or moved at review time|

Not done, deliberately: running the test suite at the prerequisite tip alone.
Integration lands the final tree, not that intermediate tree, so it is
validated at the final candidate instead.

## Integration rehearsal

- `git merge-tree --write-tree main 95910ba` produces tree `00206621`, identical
  to the head tree. There are no conflicts and no altered content; it is a
  fast-forward-equivalent.
- The candidate adds only this audit, its evidence and the notice/license
  correction on top of `95910ba`.
- Version chain: Worldgen 1→3, Content 1→20, Save 1→2. Save migration and
  archive tests (`tests/save/save.test.ts`, `tests/sim/archiveLedger.test.ts`)
  run in the unit suite. Child World Laws keep the historical Content 18 seed.
- Packaging: `build`, `zip`, `release:verify` PASS locally. The ZIP has 90 files,
  10.4 MB, all four license texts and no secret files.

**Method comparison**

- A. Native stacked merging needs the prerequisite branch merged first. PR1
  targets that branch, not `main`, so it would take 28 sequential merges plus
  27 retargets. Each step re-runs CI on intermediate trees nobody intends to
  ship. Rejected as slow and noisy.
- B (recommended). One Draft PR from `integration/v38-candidate-20261025` to
  `main`. Merge it with **"Create a merge commit"**, which keeps all 200+
  original SHAs, so the history and the stacked PRs stay traceable. The tree
  equals the reviewed candidate. Squash would erase the audited history, and
  rebase would rewrite SHAs. After the merge, close PR1–PR27 as superseded,
  referencing the merge SHA. The existing PRs are not modified now.

## Performance

- Strict physical gate: still **12/24** from PR26; not re-measured.
  `PHYSICAL_RETEST_BLOCKED_BY_UNCONTROLLED_HOST_STATE`: `parsecd` holds one UDP
  socket and one established TCP connection. That is consistent with an active
  or idle remote session that may be the owner's access path, and it was not
  touched.
- Real gameplay (existing human session, 25 Oct 15:58, build `8edbc5b5` = PR24,
  not this candidate): window **2550x1272** on a 2560x1440 screen, DPR 1,
  reported refresh ~46 Hz (suggestive of a streamed or virtual display),
  UHD 630. From Bronze to Boss fight: frame p95 **40–51 ms**, p99 up to 89 ms,
  min FPS 36–54, render p95 11–14 ms, sim p95 ≤2 ms.
- That play surface is ~1.56× the pixels of 1080p, so the stutter fits the V3.7
  fill-rate diagnosis. Simulation is not the bottleneck.

## Human QA

That session has no ratings, no comment and an empty `endReason` (not
finalized). There is no newer session. `REAL_GAMEPLAY_1080P_HUMAN_ACCEPTANCE_PENDING`.
The normal `?qa=1` route and the operator-only `?combatReview=1` route remain
separate, and the rating UI already exists (V3.7).

## Art

Accepted and applied: the HQ painted lava Boss, painted enemy and hero atlases,
weapon and projectile art. Outstanding: authored layered animation per the V3.7
brief. No source layers exist in the repo, so this is an external
asset-production dependency, not engineering work.

## Gates (separate)

|Gate|Status|
|--|--|
|Engineering integration|**READY FOR ENGINEERING INTEGRATION** once candidate CI is green; owner authorization required|
|PERFORMANCE_ACCEPTANCE|OPEN (strict 12/24; real play at 2550x1272 has p95 40–51 ms)|
|HUMAN_FUN_PASS|OPEN (bow only)|
|ART_COMPLETE|OPEN (authored animation missing)|
|RELEASE_READY|NO|

## Next cycle priority

1. Performance at the owner's real play surface. Measure one session with the
   stream disconnected and a 1920x1080 window before any renderer change. If it
   is still fill-bound, consider an explicitly labelled, optional render-scale
   setting with visual-quality review; it would never count as native 1080p.
   Otherwise reduce actor and terrain fill.
2. Then authored animation and game feel against the Original 31.
