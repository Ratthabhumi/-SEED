# Session Handoff — v0.1.1 Round-3 corrective pass (branch, NOT merged)

## Timestamp

2026-09-29 ~02:45 Asia/Bangkok. Corrective stabilization after independent
audit Round 3. No V0.2 content. No merge, no tag, no force-push.

## Branch / HEAD

Branch: `fix/v011-stabilization-20260929` (pushed, unmerged).
HEAD: see `git rev-parse HEAD` — handoff records code HEAD `62480a2`-lineage;
final SHA reported separately (branch moved forward with corrective commits).
`origin/main` = `5e6d5c65ea905bc3859f115e73bfd02913988d45` (unchanged).

## Starting State (verified)

Branch HEAD was `3b590698999c04637b973bdd700c767a49effe47`, tree clean,
baseline green (typecheck, 112 tests, build, zip, release:verify, e2e).

## Findings Closed (root cause → fix → regression → result)

- P1-01 queued drafts → duplicate screens: UI owned recursively. Fix:
  state-driven `syncDraftUI` (exactly-one guard). Tests: sim multi-level
  drain + E2E queued-draft completion. PASS.
- P1-02 dash lost on zero-step frames: `JustDown()` sampled inside step timing.
  Fix: `InputLatch` (adapter latches, first consumed step takes it). Tests:
  8+9/17/4+4+9/33/16×3/100ms patterns ⇒ exactly one dash. PASS.
- P1-03 boss lost when pool full: `bossSpawned=true` before alloc. Fix:
  transactional `spawnEnemy → handle|null` + deterministic reclaim; flag set
  only on success. Test: saturated pool ⇒ boss spawns, Ascension reachable. PASS.
- P1-04 Space kinetic beam misconfigured: family-hardcoded projectiles. Fix:
  archetype dispatch for all families; defense orbit/summon split. Tests: all
  24 family×tier combos deal damage + no stationary projectiles. PASS.
- P1-05 weak hash (mines/RNG invisible): `canonicalSnapshot()` covers gameplay
  + RNG (cosmetics excluded); tests compare snapshots; hash is debug-only. PASS.
- P2-01 Restart generated a new seed: `restartRun()` preserves masterSeed.
  E2E asserts identical displayed seed. PASS.
- P2-02 Ascension erased run timer: new `runElapsed/runHighestAge/runKills`
  survive Ascension; chronicle/best use run-level data. Tests + E2E. PASS.
- P2-03 double persist (`runs +2`): idempotent `deathPersisted` guard; persist
  lives on the terminal transition. E2E: N → N+1 across frames. PASS.
- P2-04 splitter reward lost via pooled reuse: capture-before-deactivation
  ordering. Test: parent 5 preserved + 2 children. PASS.
- P2-05 Stone milestone tanks + undocumented free elites: `eligibleFamilies()`
  single gate; model B documented (budget waves + bounded milestones); wave
  loop no longer mints free elites. Tests: Stone zero-tank incl. sim
  milestones; cost ≤ budget. PASS.
- TEST-DEFECT: isolation test now spams a REAL 10k draws per stream pre-ascend
  (public readonly `streams` + `streamSnapshots()`); child prefixes +
  trajectories identical. PASS.
- Localization: dedicated fallback keys matching effects (contract-tested);
  localized family names in chronicle; E2E language-invariance via snapshots.
- F3: sim metric is step-only (event/DOM timed separately); POI discovery
  refreshes markers next frame.
- Version: package.json 0.1.1 → ZIP `seed-web-v0.1.1.zip` → verifier derives
  the same version. UTF-8 `.gitignore` (+test-results/playwright-report/
  blob-report); CI uploads verified ZIP artifact (14d retention).
- Verifier/docs language honest (known-pattern checks, NOT YET MEASURED kept).

## Preserved v0.1.1 Fixes (untouched, suites still green)

Stream isolation, draft stream, pure sim, core import bans, world POIs, pickup
conservation, exactly-once knowledge, typed breakthroughs, 5 affixes, parity,
save sanitization, clipboard fallback, wide frontier, design A, age HUD, chunk
cache, rebuild-after-move, world-space ground, rolling F3, Node CI, fresh ZIP,
verifier, notices, smoke E2E.

## Verification (final, this machine)

- `npm run typecheck` PASS · `npm run test` 164 PASS · `npm run build` PASS ·
  `npm run check` PASS · `npm run zip` (seed-web-v0.1.1.zip) ·
  `npm run release:verify` 17/17 PASS · `npm run test:e2e` 6/6 PASS (Chromium).
- CI status for pushed SHA: check GitHub Actions (artifact `seed-web-v0.1.1`).

## Known Limitations / HUMAN-ONLY Gates (never auto-PASS)

Full EPOCH-GOLDEN-001 Stone→Space→Ascension playthrough; hardware perf capture;
Thai typography review; Firefox; itch draft embed.

## Next Three Actions

1. Auditor Round 4: diff `3b59069…HEAD`, code/tests/CI-artifact review.
2. Human playtest gate → record results here.
3. Merge (no squash) → tag v0.1.1 → then V0.2 planning.

## Do-Not-Break Invariants

Same seed+inputs=same snapshot; isolated streams; world POIs; exactly-once
knowledge/persist; transactional bosses; archetype dispatch; eligibleFamilies
everywhere; TH/EN parity; core import bans; no merge/tag; no V0.2 on this branch.
