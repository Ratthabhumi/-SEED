# Session Handoff

## Timestamp

2026-09-29 ~03:05 Asia/Bangkok. Documentation-only checkpoint; no code, test,
dependency, or build change in this pass.

## Repository

`Ratthabhumi/-SEED` — `-SEED: เมล็ดพันธุ์แห่งอารยธรรม`

## Branch

`fix/v011-stabilization-20260929` — **UNMERGED, UNTAGGED** (deliberate;
human gates still open).

## Origin Main

`5e6d5c65ea905bc3859f115e73bfd02913988d45` (unchanged; no merge performed).

## Implementation Checkpoint

`b5750f1212927163e1903782108f61de8e036474`

SESSION_HANDOFF.md may be one documentation-only commit ahead of this
implementation checkpoint. On resume, `git rev-parse HEAD` is authoritative
for the branch HEAD. (This distinction is explicit to avoid infinite
self-reference: the handoff commit's own SHA is never placed inside itself.)

## Product

-SEED: เมล็ดพันธุ์แห่งอารยธรรม. One survivor run = one civilization
Stone → Space, deterministic seed-shareable worlds, seeded Tech DAG,
endless Ascension. Official v0.1 languages: EN + TH. Thai rendering and
localization remain release-blocking.

## Current Release Candidate

**v0.1.1 release candidate / stabilization branch** (NOT released, NOT tagged).
Package version: `0.1.1`. Expected ZIP: `release/seed-web-v0.1.1.zip`.
Do NOT claim v0.1.1 has been released.

## Current Playable State

Title (seed input, random seed, EN/ไทย, settings) → run (WASD/arrows, dash
i-frames, 4 auto-weapon families evolving per age, 4 enemy lineages, elites +
affixes, threat director) → 3-card drafts → 6 ages (time + knowledge + kill
objectives, spine auto-grant) → POI discovery → Space boss → Ascension offer →
child world (build kept, difficulty up) → death → Run Chronicle + copy seed.
F3 diagnostics, pause menu with mid-run language switch, responsive HUD with
age-progress block (knowledge / objective / time).

## Architecture State

- Pure `RunSimulation` under `src/core/sim` (one instance per run; restart =
  new instance). GameScene is a render/input adapter.
- `src/core` has zero Phaser / DOM / localStorage / Web Audio / navigator
  dependencies (AGENTS.md enforced, CI-greppable).
- Input crosses as `InputFrame` via `InputLatch` (dash edges survive zero-step
  frames); effects exit as `SimEvent` (toast/sound/shake).
- Weapon execution dispatches on `WeaponStage.archetype`; boss spawns are
  transactional with deterministic slot reclaim; draft UI is state-driven
  (exactly one surface); HUD action buttons live in a persistent container.
- `?e2e` query-gated test hook only (grant/kill/readyAscend/hash/snapshot);
  inert during normal play.

## Determinism State

- `RunRngStreams` (event/enemy/draft/loot/boss), fresh per world; draft
  separated from loot; Ascension recreates child-world streams (proven by real
  10k-draw-per-stream isolation test).
- `canonicalSnapshot()` covers gameplay + RNG (cosmetics excluded); same seed
  + versions + same input trace = same canonical state (replay-tested,
  restart ≡ fresh instance).
- World-scoped POI ids (`poi-{nonce}-…`); per-world discovery vs run totals.
- `gainKnowledge` exactly-once; pickup overflow conserves value; death
  persists exactly once; splitter rewards captured before pooled reuse.
- Run-level stats (`runElapsed/runHighestAge/runKills`) survive Ascension.
- 300-seed fuzz corpus validates graphs/world/threat in CI.

## Localization State

EN + TH key parity enforced by test (release-blocking). Critical UI fully
keyed (rarities, boss, POIs, breakthroughs, ascend, fallback cards with
numbers matching effects, family names). Mid-run EN↔TH switch preserves the
canonical snapshot (E2E-proven). Noto Sans Thai bundled (OFL-1.1). Automated
parity does NOT prove typography — Thai visual QA remains a human gate.

## Release / CI State

- GitHub Actions `ci`: Node 22 + Node 24 verify jobs (`npm ci`, `check`,
  fresh `zip`, `release:verify`) + Chromium E2E job. Latest: run 36505017447,
  all SUCCESS on the pushed branch HEAD.
- Verified artifact `seed-web-v0.1.1` uploaded from CI (14-day retention;
  CI-built copy measured 846,545 bytes, downloadable).
- `release:verify` = 17 checks (root index.html, relative refs, itch limits,
  licenses, basic known-pattern secret scan — honest wording, not proof of
  absence). Fresh-ZIP-only script (old ZIP deleted first).

## Automated Verification

- `npm run typecheck` — PASS
- `npm run test` — 22 files / 164 tests PASS
- `npm run build` — PASS
- `npm run check` — PASS
- `npm run zip` — PASS (`release/seed-web-v0.1.1.zip`)
- `npm run release:verify` — 17/17 PASS
- `npm run test:e2e` — 6/6 PASS, verified across two consecutive local runs
- GitHub Actions run 36505017447 — Node 22 verify PASS, Node 24 verify PASS,
  Chromium E2E PASS, artifact `seed-web-v0.1.1` downloadable.
- This is NOT a human-release approval.

## Audit Round 3 Findings Closed

P1-01 (duplicate drafts) · P1-02 (dash edge loss) · P1-03 (boss pool loss) ·
P1-04 (Space kinetic archetype) · P1-05 (canonical hash) · P2-01 (restart seed) ·
P2-02 (run/world stats) · P2-03 (double persist) · P2-04 (splitter reward) ·
P2-05 (director era/budget contract) · real-10k isolation test · E2E expansion
(restart/draft/death/language/ascension) · fallback text/effect consistency ·
step-only F3 metric · POI marker refresh · version single-sourcing · UTF-8
.gitignore · CI artifact · honest verifier wording. Plus one genuine E2E find:
HUD action button recreated per refresh broke click stability → persistent
container fix. Prior v0.1.1 contracts preserved (streams, pure sim, import
bans, world POIs, conservation, exactly-once knowledge, typed breakthroughs,
5 affixes, parity, save sanitization, clipboard fallback, wide frontier,
design A, age HUD, chunk cache, rebuild-after-move, world-space ground,
rolling F3, fresh ZIP, verifier, notices, smoke E2E).

## Human Gates Still Required (NOT YET PASSED — HUMAN REQUIRED)

- Gate A — Full gameplay: run `EPOCH-GOLDEN-001` Stone → Bronze → Iron →
  Industrial → Atomic → Space → Boss → Ascension. Check feel + progression.
- Gate B — Real hardware performance: record hardware, browser, resolution,
  FPS p50/p95, sim p50/p95/p99, frame p50/p95/p99, max enemies/projectiles,
  pool saturation, chunk-cache behavior. Do not invent values.
- Gate C — Thai visual QA: tone marks, upper/lower vowels, line height, card
  wrapping, HUD/toast clipping, small-window layout, long descriptions.
- Gate D — Manual Firefox browser run.
- Gate E — itch.io draft embed: upload verified ZIP to a non-public/draft
  project; verify launch, relative assets, Thai fonts, audio unlock,
  fullscreen, clipboard fallback, keyboard input, Ascension. Do NOT publish.

## Known Limitations

- Nearest-enemy targeting still uses a linear scan (R3.4 follow-up).
- Performance targets NOT validated on human target hardware.
- Firefox manual verification pending; itch embed verification pending.
- `?e2e` test hook exists but is query-gated/inert during normal play.
- Commercial/trademark clearance for "-SEED" is not complete.
- None of the above are claimed as release blockers except Thai rendering.

## Compatibility / Version Decisions (actual source values)

- `WORLDGEN_VERSION = 2` (was 1): seed normalization gained Unicode NFC, so
  some non-ASCII seeds map differently. All ASCII seeds (incl. every
  `EPOCH-*` seed) are byte-identical under NFC → identical worlds to v0.1.
- `CONTENT_VERSION = 2` (was 1): wide-frontier branches + age-transition spine
  auto-grant change generated Tech DAGs for identical seeds vs v0.1.
- `SAVE_SCHEMA_VERSION = 1` (unchanged): saves remain compatible; runtime
  validation sanitizes malformed values with safe fallback.
- Old v0.1 ASCII seeds generate identical WORLDS but different TECH GRAPHS
  under v0.1.1 — an intentional, documented compatibility decision, never
  a silent fork.

## Release Artifact

- Local: `release/seed-web-v0.1.1.zip` (git-ignored build output; regenerate
  via `npm run build && npm run zip && npm run release:verify`).
- CI: artifact `seed-web-v0.1.1` from the green run above.
- No GitHub Release, no tag (deliberate).

## Git Safety State

- Branch `fix/v011-stabilization-20260929` tracks
  `origin/fix/v011-stabilization-20260929`; working tree clean at handoff.
- No force-push, no rewritten history, no merge to main, no tags.
- 11 commits above `origin/main` (`5e6d5c6`), milestone-structured.

## Exact Resume Procedure

Fresh machine:

```powershell
git clone https://github.com/Ratthabhumi/-SEED.git
cd -SEED
git fetch origin
git checkout fix/v011-stabilization-20260929
git pull --ff-only origin fix/v011-stabilization-20260929
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
npm ci
npm run check
```

Existing repository:

```powershell
cd <existing-repo>
git status
git fetch origin
git checkout fix/v011-stabilization-20260929
git pull --ff-only origin fix/v011-stabilization-20260929
git status
git rev-parse HEAD
npm ci
npm run check
```

Safety rule: if `git status` is not clean before pulling — STOP, inspect local
changes, do not reset/delete them automatically. NEVER use `git reset --hard`,
`git clean -fd`, or force checkout as routine resume steps.

At the office: sync/check ONLY first (`status`, `fetch`, `checkout`,
`pull --ff-only`, `status`, `rev-parse`, `npm ci`, `npm run check`). If green
and SHA matches this handoff, begin the human gates (full run → F3 numbers →
Thai → Firefox → itch draft) before any editing.

## Next Three Actions

1. Human full-run playtest: `EPOCH-GOLDEN-001`, Stone → Space → Ascension.
   Record feel + F3 performance values.
2. Thai + Firefox manual QA at normal and smaller desktop windows, in Thai
   and English modes. Record problems before editing.
3. If both acceptable: `npm run check`, `npm run zip`, `npm run release:verify`,
   then upload `seed-web-v0.1.1.zip` to itch as DRAFT/restricted test only.
   Verify embed before requesting merge/tag approval. Do NOT begin V0.2 before
   this gate unless explicitly authorized by the human operator.

## Do-Not-Break Invariants

- No Math.random in deterministic gameplay paths.
- `src/core` must not import Phaser.
- `src/core` must not depend on DOM, browser storage, audio, or navigator.
- Renderer does not own canonical simulation state.
- Same seed + versions + same input trace = same canonical gameplay state.
- Ascension child world must not depend on old-world RNG consumption.
- Draft RNG and loot RNG remain independent.
- Restart preserves the same master seed.
- Run-level Chronicle statistics survive Ascension.
- Pool saturation may not destroy progression-critical rewards.
- Boss progression may not silently fail because a pool is full.
- All selectable elite affixes must have real behavior.
- Player-facing EN/TH text must use localization.
- Thai rendering bugs are release-blocking.
- Worldgen-visible compatibility changes require deliberate version review.
- Tests may not be removed merely to obtain green status.
- Do not merge or tag without human approval.
