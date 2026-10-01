# Session Handoff

## CURRENT CANONICAL STATE — READ THIS FIRST

- Active branch: `feat/v023-frontier-purpose-20261001`
- Current HEAD: tip of `feat/v023-frontier-purpose-20261001` (docs-only delta
  over the CI-verified code SHA below; code identical)
- Current code SHA: `00960ed` (Phase A landed:
  `4382fef` modal/seed-truth fixes, `530ce79` ordered-state + engagement
  contracts, `bbc6df3` QA pipeline retarget to v023, `00960ed` docs reconcile)
- Exact-SHA CI: run 36875075100 — 3/3 GREEN (verify Node 22 SUCCESS, verify
  Node 24 SUCCESS, e2e SUCCESS). v0.23 TECHNICAL BASELINE frozen at `00960ed`.
- Current milestone: v0.23 TECHNICAL CLOSURE (no new gameplay; auditor HOLD on
  human testing until exact-SHA CI is 3/3 green)
- Current blockers: none locally — (1) industrial modal test FIXED +
  race-proofed, (2) QA seed truth FIXED (custom-seed E2E asserts snapshot +
  report carry `EPOCH-CUSTOM-42`), (3) qa-report emits v023 path/title FIXED
- Next exact action: v0.23 TECHNICAL BASELINE frozen — create
  `fix/v0231-interaction-clarity-20261001` for the next milestone
- Everything below the `HISTORICAL ARCHIVE` marker is prior-milestone evidence.
  Do NOT use old resume instructions for current work.

---

## Timestamp

2026-10-01 office session. v0.23 Frontier Purpose & Late-Game Performance — ACTIVE on `feat/v023-frontier-purpose-20261001` (branched from exact green `f2cd458`).

**v0.22.1 truth correction (auditor-verified):**
- Technical gate: ✅ GREEN at `f2cd458` — GitHub Actions run 36815319757 (verify Node 22 SUCCESS, verify Node 24 SUCCESS, e2e SUCCESS). The earlier `1ffc625` claim of AUTOMATED VERIFIED was false (its run 36798489922 had E2E FAILURE, 23/6); that report must not be cited as a closed milestone.
- Human usability gate: NOT ACCEPTED — HUD overlap, UI-scale breakage at 150–200%, unclear territory purpose, Tech Map overflow, late-Space FPS drops all still observed.
- Therefore: v0.22.1 = 🟠 CORRECTIVE / TECHNICAL PASS, superseded into v0.23 corrective work. v0.22.1 branch stays frozen; no more docs-only tips on it.

**v0.23 direction (auditor-owned design, implementation here):** frontier purpose loop EXPLORE→…→ASCEND on existing Strategic Sites (no free placement), Dominion age gate replacing the abstract stabilization timer, scale-aware adaptive HUD + Tech Map, deterministic spatial nearest-neighbor, CONTENT 4→5, no new dependencies.

---

2026-10-01 ~07:53 Asia/Bangkok. v0.22.1 First-Run Clarity & Presentation Corrective — MILESTONE COMPLETE.

**Status: AUTOMATED VERIFIED — HUMAN AUDIT PENDING**
- Branch: `fix/v0221-first-run-clarity-20261001`
- Commit: `1ffc625` — pushed to origin
- E2E clarityAuditV0221.spec.ts: **4/4 PASS** (QA telemetry, readability, UI scale, visual capture)
- Unit tests: **295/295 PASS** (35 test files)
- TypeScript: **0 errors**
- Third-party verify: **ALL CHECKS PASSED**
- Production build: **PASS** (8.22s)

Changes in this milestone:
- **CSS typography tokens**: `--font-body: 18px` base, calc-scaled by `--ui-scale`
- **`.draft-stays` fix**: corrected from `--font-caption` (16px) to `--font-body` (18px)
- **Semantic modal sizes**: `.panel-sm/.panel-md/.panel-lg/.panel-xl/.panel-full`
- **5-zone HUD IA**: top-left objective, top-right age card, bottom-left status, bottom-center knowledge, bottom-right minimap
- **UI Scale picker** (100%/125%/150%/200%) in Settings with `UiScale` type in `Settings`
- **TechMapView R2**: CURRENT/OVERVIEW/100%/-/+ controls, `focusCurrent()` on open
- **TutorialDirector** (`src/game/onboarding/TutorialDirector.ts`): 2-part intro modal, progressive steps, skip/reset
  - CRITICAL FIX: `this.tutorial.start()` moved AFTER `buildHUD()` so `clearUI()` cannot wipe `#tutorial-intro-screen`
- **VFX cleanup**: ADD blend mode on all pool images; geometric sparks for ordinary deaths; raster reserved for boss/elite
- **QA telemetry**: `sessionId`, `reportSequence`, `#qa-rec-indicator`, F10 toggle, `onPlayerDied()` terminal emit
- **Visual evidence**: 13 screenshots captured to `docs/visual_audit_v0221/`

Next recommended step: Human plays the game and provides audit verdict.

---

2026-10-01 ~06:35 Asia/Bangkok. v0.22 Integrated Human Revalidation completed.
Status:
- **v0.22**: `AUTOMATED VERIFIED` | `HUMAN REVALIDATION EVIDENCE CAPTURED` | `AUDITOR VERDICT PENDING`
- Branch: `feat/v022-open-source-leverage-20260930`
- QA Telemetry & Harness: Extended with Civilization Command Loop usage metrics, optional post-run comment prompt, and canonical evidence path `docs/playtests/latest-v022-human-revalidation.md`.
- Human Run Evidence Summary:
  - Seed: `EPOCH-GOLDEN-001`
  - Origin: `hunters` (families: `field+kinetic`)
  - End Reason: `player-died` at 63.70s sim (174.41s wall time) in Stone age
  - Level: 4 | Knowledge: 73 | Techs Taken: 5 (`spine-metallurgy`, `bronze-precision`, `bronze-armor`, `bronze-rite`, `stone-tools`)
  - Breakthroughs Completed: 1 (`fortress` at 30.67s)
  - POIs Discovered: 2 major (`vault` at 30.65s, `ruin` at 33.33s)
  - Bronze Mission: Completed at 9.37s sim
  - Tech Map Opens: 0 | Pinned Targets: 0 | Reserves/Rerolls/Skips: 0
  - Territories Claimed: 0 | Outposts: 0 | Raids: 0
  - Squad Commands (Q/E/R): 0 | Ability Uses (F): 0 | Civ Map Opens (M): 0
  - Technical Quality: 0 failed assertions, 0 console errors, 0 UI overflows, 42 FPS min / 16.07ms frame p50
  - Optional Human Comment: NOT PROVIDED (natural unprompted stop)
  - Discoverability Takeaway: Human naturally engaged core survivor movement, POI discovery, drafting, and breakthrough choices, but did not discover/open Tech Map (T), Civ Map (M), or squad command hotkeys before early Stone age death. Valuable objective baseline for external auditor.

2026-10-01 ~05:45 Asia/Bangkok. v0.22 Final Provenance + Visual Corrective Pass R2 completed.
Branch `feat/v022-open-source-leverage-20260930` continued from tip `23d732e6f93e174add7804fcddcd1bf3a947fe4f`.
Corrective Implementation:
- Kenney Provenance Reconciled: Extracted archive `License.txt` files verified:
  - `board-game-icons`: `Board Game Icons (1.1)` -> `EXACT_VERSION_VERIFIED` (1.1)
  - `input-prompts`: `Input Prompts (1.5A)` -> `EXACT_VERSION_VERIFIED` (1.5a)
  - `particle-pack`: `Particle Pack (1.1)` -> `EXACT_VERSION_VERIFIED` (1.1)
  - `ui-pack-sci-fi`: `UI Pack: Sci-fi (2.0)` -> `EXACT_VERSION_VERIFIED` (2.0)
  - `sci-fi-rts`: `RTS Pack: Sci-Fi` -> `VERSION_UNVERIFIED_CURRENT_SOURCE` (1.0 official page latest; verified source download as of 2026-10-01)
  - Preserved original `License.txt` into `assets/vendor/kenney/*/License.txt`.
- Truthful Asset Ledger: `modified: false`, `modifications: "None at file level"`, `status: "production-selected"`, explicit `presentationTransform` metadata for runtime scaling/tinting/anchoring. Added SHA256 hashes (`vendorSourceSha256`, `productionSha256`) and `byteSize`.
- Upgraded `verify:third-party.mjs` and test suite: verified exact package.json and lockfile resolutions (3.1.1 & 4.6.2), lockfile MIT licenses, real file SHA256 integrity, no duplicate IDs/paths, all `assets/seed/` files manifested, zero personal `file:///` URLs.
- Documentation Portability: Eliminated all `file:///` local paths in `ROADMAP.md`, `docs/THIRD_PARTY_LICENSES.md`, `docs/OPEN_SOURCE_LEVERAGE.md`. Corrected `@panzoom/panzoom` integration path to `TechMapView.ts`. Updated status to `AUTOMATED VERIFIED — HUMAN AUDIT PENDING`.
- Tech Map Usability & Localization: Added `ui.fit` to EN ("Fit") and TH ("พอดีหน้าจอ") with 100% key parity. Removed `contain: "outside"` and `transform-origin: 0 0` on `.techmap-canvas`. Implemented unconstrained centered `fit()` and `reset()` (1:1 centered). Added high-contrast colored Age lane header pills.
- Outpost Modal Collision: Dismissed active toasts upon `showBlockingFresh()` and set `#ui .screen` `z-index: 50`.
- Visual Audit R2 Evidence: Captured 11 clean screenshots in `docs/visual_audit_v022_r2/` (1280x720, zero godmode/debug values, realistic HP 100/100). Status: `EVIDENCE_CAPTURED — HUMAN_REVIEW_PENDING`.
- Verification: typecheck PASS, 35 unit test files (295 tests) PASS, verify:third-party PASS, production build PASS, 25/25 E2E tests PASS.
- Canonical versions intact: WORLDGEN_VERSION=2, CONTENT_VERSION=4, SAVE_SCHEMA_VERSION=1. Zero core simulation diff.



Office QA-harness session 2026-09-29 Asia/Bangkok (human-authorized): added
read-only `src/qa/` playtest harness (`?qa=1`), 14 new unit tests
(26 files / 178 tests PASS), new `e2e/qa.spec.ts` (E2E 7/7 PASS), full
`typecheck/test/build/check/zip/release:verify/test:e2e` green on office
machine. No gameplay/balance/worldgen change. See `docs/ADR/0004-qa-harness.md`.

Readability branch 2026-09-29 (human-authorized, presentation-only):
new branch `fix/v011-readability-20260929` from `737ddf3`; stabilization branch
kept as rollback point. FAIL_BLOCKING_READABILITY remediation implemented;
`npm run typecheck/test(27 files / 187 tests)/build/check/zip/release:verify`
PASS + E2E 9/9 PASS on office machine. Parent-branch note: committed
`TitleScene` gate lacked `id="qa-gate"` while `e2e/qa.spec.ts` asserts it —
recorded as suspect parent E2E evidence; fixed on this branch (`gate.id`) and
re-verified green. E2E per-test timeout raised 60s → 120s (slow office
machine accommodation; assertions unchanged).

Truth repair 2026-09-29 home machine (docs-only, this pass): fixed stale
current-state metadata that still pointed at the stabilization branch —
active branch is `fix/v011-readability-20260929`, code checkpoint
`35f6b73e2d14aa413ac1db7b66851b7643aac8c6`, rollback
`737ddf3b57d14ab3bc26d191261d01d92a378340`, CI run `36589398303` green on the
exact readability SHA. No history removed; failed-gate evidence preserved.

Visual Review Round 2, 2026-09-29 home machine (this session,
presentation-only, same branch): human Round-1 verdict NOT PASSED
(hostile/Knowledge silhouette collision, debug-marker POIs, swarm identity,
isolated specimens, Thai unverified). Remediation: hostile→arrowhead-spike,
Knowledge→vertical crystal + halo, swarm→tri-cluster, unique POI glyph per
all 6 families (+ missing megasite/worldtree i18n names), deterministic
Verdant/Arid composite clash panels, lab grayscale toggle, 1x/2x inspection
scales, Thai strings + wrap-review box, token×biome contrast matrix.
Screenshots self-reviewed (composites readable, POI pillar/glyph boosted,
boss-HP/title overlap fixed). No balance/worldgen/sim/RNG/threshold change.

v0.2 engagement pass, 2026-09-30 home machine (this session, NEW branch
`feat/v020-engagement-loop-20260930` from readability HEAD `e4d4f89`):
human Gate A evidence was NOT preservable (game closed before END PLAYTEST) —
thresholds are provisional from auditor observations, to be re-confirmed by the
first instrumented v0.2 run. Implemented: Origins (2-family identity +
Industrial expansion), synergy plan UI + breakthrough beats, distinct POI
rewards, evidence-calibrated Knowledge gates, legacy-prestige Ascension
(Level 1 child worlds), age-transition payoff, per-age civ dressing, QA
feedback semantics + 1–5 ratings + compact panel + F4-off default. See
`docs/ADR/0006-engagement-loop.md` and
`docs/playtests/2026-09-30-golden-001-readability.md`.

## Repository

`Ratthabhumi/-SEED` — `-SEED: เมล็ดพันธุ์แห่งอารยธรรม`

## Branch

`feat/v022-open-source-leverage-20260930` — **UNMERGED, UNTAGGED, NO ITCH**
(deliberate; awaiting auditor review + human Tech Map usability check).
Parent `feat/v021-civilization-command-loop-20260930` (@`181558d`) verified and untouched.

## Origin Main

`5e6d5c65ea905bc3859f115e73bfd02913988d45` (unchanged; no merge performed).

## Implementation Checkpoint

v0.22 WORKING BRANCH HEAD: `6fd3e79ef7815d0707143dc4ea869f96de63ebf9`
(CI run 36757840977 green: Node 22 PASS, Node 24 PASS, E2E PASS).
No force-push, no history rewrite on any line.

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

**v0.2.0-dev.0 development line** (NOT released, NOT tagged, NO itch).
Package version: `0.2.0-dev.0`. v0.1.1 remains frozen on the readability
branch; this branch is where gameplay-contract changes land.

## Current Playable State

Title (seed input, random seed, EN/ไทย, settings, **Origin picker: Hunters /
Engineers / Resonant / Sentinels**) → run (**2 active weapon families**,
4 enemy lineages, elites + affixes, threat director) → 3-card drafts (**domain
+ synergy progress + COMPLETES preview**) → 6 ages (**real Knowledge gates**,
spine auto-grant, **~1s payoff moment**) → **Industrial expansion unlock**
→ POI discovery (**distinct first-discovery rewards**) → Space boss →
Ascension offer → **Legacy choice (1 of 3) + child Origin choice** → fresh
Level-1 child world with bounded inheritance → death → Run Chronicle (+ origin
/ legacies) → copy seed. F3 diagnostics, pause menu with mid-run language
switch, HUD with age-progress + **build-goals panel**.
`?qa=1` harness: unambiguous feedback, 1–5 ratings, compact panel, F4 off.

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
  10k-draw-per-stream isolation test). Origin/Legacy/POI candidate derivation
  consumes NO gameplay RNG.
- `canonicalSnapshot()` covers gameplay + RNG + origin/expansion/legacies/
  POI-claims/draft-context (cosmetics excluded); same seed + versions +
  choices + same input trace = same canonical state (replay-tested,
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
  fresh `zip`, `release:verify`) + Chromium E2E job. v0.2 branch CI status:
  recorded at push time below (exact SHA required green).
- History: run 36621627791 executed on code SHA
  `29961a57f53d80b5f14898f7418014afd2b68df6` (all green). The branch HEAD
  `079f692` was one docs-only commit ahead — do NOT call that run exact-SHA
  verification for `079f692`. Same rule applies going forward: CI verifies
  code SHAs; docs-only commits ahead are noted, not re-verified as code.
- `release:verify` = 17 checks (root index.html, relative refs, itch limits,
  licenses, basic known-pattern secret scan — honest wording, not proof of
  absence). Fresh-ZIP-only script (old ZIP deleted first).

## Automated Verification (v0.2 working branch)

- `npm run typecheck` — PASS
- `npm run test` — 33 files / 273 tests PASS (incl. 24 civilization
  contracts + engaged-bot pacing sim: all origins reach Space)
- `npm run build` — PASS
- `npm run check` — PASS
- `npm run zip` — PASS (`release/seed-web-v0.2.0-dev.0.zip`, dev only)
- `npm run release:verify` — PASS
- `npm run test:e2e` — 18/18 PASS (12 prior + 5 civilization: tech map/pin,
  draft agency, claim→minimap/civmap, squad keys/ability, 3-gate/TH card)
- GitHub Actions run 36650409241 — Node 22 verify PASS, Node 24 verify PASS,
  Chromium E2E PASS on the v020 baseline. v021 CI pending after push.
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

- `WORLDGEN_VERSION = 2` (unchanged in v0.2): world generation positions
  untouched — identical seeds generate identical worlds.
- `CONTENT_VERSION = 3` (was 2): identical seeds now have different Tech
  availability (origin-gated drafts), POI reward semantics (major first
  discoveries), and Ascension progression (legacy prestige reset). Worlds look
  the same; what you can build in them differs.
- `SAVE_SCHEMA_VERSION = 1` (unchanged): saves remain compatible; runtime
  validation sanitizes malformed values with safe fallback. Legacies live in
  run state, not persisted metas.
- Package `0.2.0-dev.0` (dev line; no tag, no itch release).

## Release Artifact

- Local: `release/seed-web-v0.2.0-dev.0.zip` (git-ignored dev build output;
  regenerate via `npm run build && npm run zip && npm run release:verify`).
- No GitHub Release, no tag, no itch upload from this line (deliberate).

## Git Safety State

> ⛔ HISTORICAL ARCHIVE — this section describes the v020-era branch layout.
> Current active branch is `feat/v023-frontier-purpose-20261001` (see CURRENT
> CANONICAL STATE at top). Do NOT checkout v020 unless rolling back.

- (v020 era) ACTIVE branch `feat/v020-engagement-loop-20260930` tracked
  `origin/feat/v020-engagement-loop-20260930`; working tree clean at handoff.
- FROZEN baseline: readability `e4d4f8940cac2537fafd0a05895e1ea23b8f7ac2`
  (never modified by this line). Deep rollback: stabilization `737ddf3`.
- No force-push, no rewritten history, no merge to main, no tags, no itch.
- Branch HEAD verified at push time (local == remote; `origin/main` `5e6d5c6`).

## Exact Resume Procedure

> ⛔ HISTORICAL ARCHIVE — commands below check out the frozen v020 branch.
> For current work, replace `feat/v020-engagement-loop-20260930` with
> `feat/v023-frontier-purpose-20261001` (see CURRENT CANONICAL STATE at top).

Fresh machine:

```powershell
git clone https://github.com/Ratthabhumi/-SEED.git
cd -SEED
git fetch origin
git checkout feat/v020-engagement-loop-20260930
git pull --ff-only origin feat/v020-engagement-loop-20260930
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
git checkout feat/v020-engagement-loop-20260930
git pull --ff-only origin feat/v020-engagement-loop-20260930
git status
git rev-parse HEAD
npm ci
npm run check
```

Safety rule: if `git status` is not clean before pulling — STOP, inspect local
changes, do not reset/delete them automatically. NEVER use `git reset --hard`,
`git clean -fd`, or force checkout as routine resume steps.

Resume rule (SUPERSEDED — see CURRENT CANONICAL STATE at top): the commands
above check out the frozen v020 line. The ACTIVE branch is now
`feat/v023-frontier-purpose-20261001`. Do NOT resume on
`fix/v011-readability-20260929` (frozen v0.1.1 baseline),
`fix/v011-stabilization-20260929` (deep rollback), or
`feat/v020-engagement-loop-20260930` (frozen v0.2 line) unless rolling back.

## QA Harness (Human Gate Tooling)

- Activation: `http://localhost:5173/?qa=1` → gate panel → START PLAYTEST
  (golden seed `EPOCH-GOLDEN-001`, no typing). Normal `/` launch unchanged.
- Auto-records: age/boss/ascension/death checkpoints (sim + wall time),
  knowledge-at-age, engagement identity (origin/families/techs/breakthroughs/
  legacies/POIs/weapons per age), 2 Hz perf samples + checkpoint snapshots
  (FPS, frame/sim p50/p95/p99, entities, pools, queries, buckets, chunk cache),
  environment, console errors/warnings, draft/seed/age/boss/ascension runtime
  assertions, EN↔TH snapshot invariance, DOM overflow findings, pool
  saturation. Human only plays + taps categorized feedback + answers five
  1–5 ratings at END PLAYTEST.
- Feedback is unambiguous events (read/feel/balance/positive/note), never
  scored. Panel is compact by default (expandable); F4 overlay OFF by
  default; recording continues regardless.
- Read-only: no XP/kill/teleport/age/damage/RNG cheats. No world hard-bounds.
- Report: END PLAYTEST (or death, or Ascension+60s window) →
  DOWNLOAD `playtest-report.md` + `playtest-report.json` (local only).
  Verdict is `AUTOMATED_CHECKS_PASS/FAIL` — never a human-gate PASS.
- Code: `src/qa/{qaMode,PerformanceSampler,PlaytestRecorder,PlaytestReport,VisualChecks,qaPanel}.ts`
  (`src/core` untouched/pure); `docs/ADR/0004-qa-harness.md`.

## Latest Human Engagement Test (auto-updated)

<!-- QA-ENGAGEMENT-START -->

# -SEED v0.22.1 Human Revalidation — Sanitized Evidence

> Auto-generated by `npm run qa:report` from local QA telemetry.
> Machine evidence only — fun and readability verdicts need a human.

## Run

- sessionId: qa-2337-3u93uz
- reportSequence: 140
- seed: EPOCH-GOLDEN-001
- package: 0.2.0-dev.0 / worldgen 2 / content 5 / save 1
- endReason: player-died
- viewport: 1920x911 / refresh: ~51Hz

## Route
- [x] run started (0.00s)
- [x] Bronze (145.60s)
- [x] Iron (303.43s)
- [ ] Industrial 
- [ ] Atomic 
- [ ] Space 
- [ ] boss spawned 
- [ ] boss killed 
- [ ] ascension offered 
- [ ] ascension started 
- [ ] child world 
- [ ] post-ascension +30s 
- [ ] post-ascension +60s 
- [ ] post-ascension +120s 
- [x] player died (405.73s)
- [x] run ended (405.73s)

## Civilization Command Loop Usage

- Tech Map opened: 2
- First Tech Map open: 93.00s sim
- Paths pinned: 0 [-]
- Reserve uses: 0
- Rerolls: 1
- Skips: 0
- Breakthroughs completed: 2 [fortress, metallurgy]

- Territories claimed: 4 [ruin, signal, meteor, meteor]
- First territory time: 183.82s sim
- Outpost types: [Research: 0, Military: 4, Economy: 0]
- Outpost upgrades: 3
- Raids incoming: 1
- Raids defended: 0
- Raids lost: 0
- Outposts repaired: 0

- Rally commands (Q): 87
- Focus commands (E): 35
- Hold commands (R): 12
- Origin ability uses (F): 3
- Civ Map opens (M): 1

- Age gate block summary:
  - Stone dwell: 145.60s
  - Bronze dwell: 157.83s

## Engagement Identity
- @0.00s stone asc 0: origin hunters [field+kinetic] lv1 k0e0d0f0 techs 0 knowledge 0 breakthroughs [-] legacies [-] poi [-]
- @145.60s bronze asc 0: origin hunters [field+kinetic] lv9 k1e1d1f1 techs 11 knowledge 500 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal]
- @303.43s iron asc 0: origin hunters [field+kinetic] lv15 k2e2d2f2 techs 17 knowledge 1504 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal]
- @405.73s iron asc 0: origin hunters [field+kinetic] lv16 k2e2d2f2 techs 18 knowledge 1858 breakthroughs [fortress+metallurgy] legacies [-] poi [meteor+ruin+signal]

## Knowledge At Age
- bronze @145.60s (asc 0): 500
- iron @303.43s (asc 0): 1504

## Sim Decisions (ordered)
- [dominion] 0/0 @0.92s stone asc 0
- [poi-major] ruin @6.55s stone asc 0
- [site_prompt] CLAIMABLE:ruin @6.57s stone asc 0
- [focus] poi-fb9fb305--1--2-0 @6.57s stone asc 0
- [tech] spine-metallurgy @6.57s stone asc 0
- [mission_complete] bronze @8.98s stone asc 0
- [poi_discovered] ruin:+27 @14.83s stone asc 0
- [site_prompt] CONTESTED:ruin @14.85s stone asc 0
- [focus] poi-fb9fb305--2-0-0 @14.85s stone asc 0
- [tech] bronze-armor @14.85s stone asc 0
- [breakthrough] fortress @14.85s stone asc 0
- [tech] stone-trap @14.85s stone asc 0
- [focus] poi-fb9fb305--1--2-0 @20.68s stone asc 0
- [focus] poi-fb9fb305--2-0-0 @21.80s stone asc 0
- [focus] poi-fb9fb305--1--2-0 @24.02s stone asc 0
- [tech] stone-tools @29.67s stone asc 0
- [poi_discovered] ruin:+31 @32.82s stone asc 0
- [site_prompt] CONTESTED:ruin @33.65s stone asc 0
- [focus] poi-fb9fb305--2--3-0 @33.65s stone asc 0
- [tech] stone-fire @37.68s stone asc 0
- [breakthrough] metallurgy @37.68s stone asc 0
- [focus] poi-fb9fb305--1--2-0 @41.60s stone asc 0
- [focus] poi-fb9fb305--2-0-0 @43.83s stone asc 0
- [poi-major] meteor @52.98s stone asc 0
- [site_prompt] CLAIMABLE:meteor @53.00s stone asc 0
- [focus] poi-fb9fb305--3-2-0 @53.00s stone asc 0
- [tech] bronze-precision @53.00s stone asc 0
- [poi_discovered] meteor:+41 @54.72s stone asc 0
- [site_prompt] CLAIMABLE:meteor @54.73s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @54.73s stone asc 0
- [tech] bronze-rite @54.73s stone asc 0
- [focus] poi-fb9fb305--3-2-0 @57.30s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @58.40s stone asc 0
- [poi_discovered] meteor:+41 @59.03s stone asc 0
- [site_prompt] CONTESTED:meteor @59.50s stone asc 0
- [focus] poi-fb9fb305--1-2-0 @59.50s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @63.62s stone asc 0
- [tech] stone-hunt @63.62s stone asc 0
- [focus] poi-fb9fb305--1-2-0 @67.92s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @70.13s stone asc 0
- [focus] poi-fb9fb305--1-2-0 @72.35s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @74.57s stone asc 0
- [poi-major] signal @84.52s stone asc 0
- [site_prompt] CLAIMABLE:signal @84.53s stone asc 0
- [focus] poi-fb9fb305--1-6-0 @84.53s stone asc 0
- [tech] fb-dmg-7 @84.53s stone asc 0
- [poi_discovered] meteor:+41 @91.32s stone asc 0
- [site_prompt] CLAIMABLE:meteor @91.33s stone asc 0
- [focus] poi-fb9fb305--4-7-0 @91.33s stone asc 0
- [tech] fb-dmg-8 @91.33s stone asc 0
- [techmap_open] open @93.00s stone asc 0
- [techmap_open] open @93.88s stone asc 0
- [ability_used] volley @96.97s stone asc 0
- [squad_command] follow @100.12s stone asc 0
- [squad_command] follow @100.20s stone asc 0
- [squad_command] follow @100.83s stone asc 0
- [squad_command] follow @100.90s stone asc 0
- [squad_command] follow @101.03s stone asc 0
- [squad_command] follow @101.12s stone asc 0
- [squad_command] follow @101.23s stone asc 0
- [squad_command] follow @101.32s stone asc 0
- [squad_command] follow @101.42s stone asc 0
- [squad_command] follow @101.48s stone asc 0
- [squad_command] follow @101.63s stone asc 0
- [squad_command] follow @101.82s stone asc 0
- [squad_command] follow @102.03s stone asc 0
- [squad_command] follow @102.13s stone asc 0
- [squad_command] follow @102.22s stone asc 0
- [squad_command] follow @102.43s stone asc 0
- [squad_command] follow @102.62s stone asc 0
- [squad_command] follow @102.98s stone asc 0
- [squad_command] follow @103.12s stone asc 0
- [squad_command] follow @104.90s stone asc 0
- [squad_command] follow @104.93s stone asc 0
- [squad_command] follow @107.65s stone asc 0
- [squad_command] follow @107.80s stone asc 0
- [squad_command] follow @108.02s stone asc 0
- [squad_command] follow @108.12s stone asc 0
- [squad_command] follow @108.23s stone asc 0
- [squad_command] follow @108.43s stone asc 0
- [squad_command] follow @108.68s stone asc 0
- [squad_command] follow @108.93s stone asc 0
- [squad_command] follow @109.05s stone asc 0
- [squad_command] follow @109.32s stone asc 0
- [squad_command] follow @109.45s stone asc 0
- [squad_command] follow @109.52s stone asc 0
- [squad_command] follow @109.65s stone asc 0
- [squad_command] follow @109.90s stone asc 0
- [squad_command] follow @110.15s stone asc 0
- [squad_command] follow @110.38s stone asc 0
- [squad_command] follow @110.43s stone asc 0
- [squad_command] follow @110.65s stone asc 0
- [squad_command] follow @110.88s stone asc 0
- [squad_command] follow @110.98s stone asc 0
- [squad_command] follow @111.10s stone asc 0
- [squad_command] follow @111.37s stone asc 0
- [squad_command] follow @111.48s stone asc 0
- [squad_command] follow @111.58s stone asc 0
- [squad_command] follow @111.80s stone asc 0
- [squad_command] follow @112.00s stone asc 0
- [squad_command] follow @112.23s stone asc 0
- [squad_command] follow @112.43s stone asc 0
- [focus] poi-fb9fb305--3-3-0 @112.83s stone asc 0
- [squad_command] follow @112.85s stone asc 0
- [squad_command] follow @113.00s stone asc 0
- [focus] poi-fb9fb305--4-7-0 @113.93s stone asc 0
- [squad_command] follow @114.03s stone asc 0
- [squad_command] follow @114.27s stone asc 0
- [squad_command] follow @114.45s stone asc 0
- [squad_command] follow @114.65s stone asc 0
- [squad_command] follow @115.05s stone asc 0
- [squad_command] follow @115.90s stone asc 0
- [squad_command] follow @116.00s stone asc 0
- [squad_command] follow @116.32s stone asc 0
- [squad_command] follow @116.57s stone asc 0
- [squad_command] follow @116.77s stone asc 0
- [squad_command] follow @117.02s stone asc 0
- [squad_command] follow @117.22s stone asc 0
- [squad_command] follow @117.42s stone asc 0
- [squad_command] follow @117.87s stone asc 0
- [squad_command] follow @118.12s stone asc 0
- [poi_discovered] ruin:+34 @119.15s stone asc 0
- [squad_command] follow @119.43s stone asc 0
- [site_prompt] CLAIMABLE:ruin @119.47s stone asc 0
- [focus] poi-fb9fb305--5-7-0 @119.47s stone asc 0
- [squad_command] follow @119.65s stone asc 0
- [squad_command] follow @119.85s stone asc 0
- [draft_reroll] 0 left @120.15s stone asc 0
- [tech] fb-dmg-9 @120.15s stone asc 0
- [civmap_open] open @127.98s stone asc 0
- [squad_command] follow @128.95s stone asc 0
- [squad_command] follow @130.62s stone asc 0
- [squad_command] follow @130.85s stone asc 0
- [squad_command] follow @130.92s stone asc 0
- [squad_command] focus @131.87s stone asc 0
- [squad_command] focus @132.08s stone asc 0
- [squad_command] focus @132.28s stone asc 0
- [squad_command] focus @132.47s stone asc 0
- [squad_command] focus @132.68s stone asc 0
- [squad_command] focus @132.85s stone asc 0
- [squad_command] focus @133.03s stone asc 0
- [squad_command] focus @133.38s stone asc 0
- [squad_command] focus @133.60s stone asc 0
- [squad_command] focus @133.82s stone asc 0
- [squad_command] focus @134.02s stone asc 0
- [squad_command] focus @134.23s stone asc 0
- [squad_command] follow @134.63s stone asc 0
- [squad_command] follow @134.68s stone asc 0
- [squad_command] follow @136.08s stone asc 0
- [squad_command] follow @136.17s stone asc 0
- [squad_command] focus @136.30s stone asc 0
- [squad_command] follow @138.98s stone asc 0
- [squad_command] follow @139.07s stone asc 0
- [squad_command] focus @139.97s stone asc 0
- [squad_command] follow @143.45s stone asc 0
- [age_reached] bronze @145.58s stone asc 0
- [squad_command] focus @146.63s bronze asc 0
- [squad_command] focus @148.60s bronze asc 0
- [squad_command] focus @148.90s bronze asc 0
- [squad_command] focus @149.10s bronze asc 0
- [squad_command] focus @149.62s bronze asc 0
- [squad_command] focus @149.82s bronze asc 0
- [squad_command] focus @150.03s bronze asc 0
- [squad_command] focus @150.22s bronze asc 0
- [squad_command] focus @150.43s bronze asc 0
- [squad_command] focus @150.63s bronze asc 0
- [squad_command] focus @150.85s bronze asc 0
- [squad_command] focus @151.05s bronze asc 0
- [squad_command] focus @151.25s bronze asc 0
- [squad_command] focus @151.42s bronze asc 0
- [squad_command] focus @151.65s bronze asc 0
- [poi_discovered] meteor:+41 @151.65s bronze asc 0
- [squad_command] focus @151.67s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @151.67s bronze asc 0
- [focus] poi-fb9fb305--6-8-0 @151.67s bronze asc 0
- [tech] spine-ironwork @151.67s bronze asc 0
- [squad_command] focus @155.85s bronze asc 0
- [focus] poi-fb9fb305--5-7-0 @158.50s bronze asc 0
- [focus] poi-fb9fb305--6-8-0 @160.77s bronze asc 0
- [focus] poi-fb9fb305--5-7-0 @162.97s bronze asc 0
- [mission_complete] iron @167.98s bronze asc 0
- [squad_command] follow @173.85s bronze asc 0
- [squad_command] focus @175.55s bronze asc 0
- [squad_command] follow @178.32s bronze asc 0
- [squad_command] hold @181.92s bronze asc 0
- [squad_command] hold @182.78s bronze asc 0
- [squad_command] hold @182.98s bronze asc 0
- [squad_command] hold @183.18s bronze asc 0
- [territory_claimed] poi-fb9fb305--5-7-0:ruin @183.82s bronze asc 0
- [claim_key] poi-fb9fb305--5-7-0 @183.82s bronze asc 0
- [focus] poi-fb9fb305--6-8-0 @183.82s bronze asc 0
- [first_claim] 183.8s @183.82s bronze asc 0
- [dominion] 1/1 @183.82s bronze asc 0
- [outpost_spec] poi-fb9fb305--5-7-0:military @183.82s bronze asc 0
- [focus] poi-fb9fb305--4-7-0 @184.53s bronze asc 0
- [focus] poi-fb9fb305--6-8-0 @185.63s bronze asc 0
- [focus] poi-fb9fb305--4-7-0 @186.72s bronze asc 0
- [focus] poi-fb9fb305--6-8-0 @187.85s bronze asc 0
- [focus] poi-fb9fb305--4-7-0 @188.95s bronze asc 0
- [tech] iron-ballistics @189.88s bronze asc 0

## Performance Summary
- bronze: n=551 fpsMin=33 frame 16.01/22.01/25.00ms sim 0.40/0.57/0.73ms ent 18/18/115
- iron: n=490 fpsMin=38 frame 16.67/23.99/26.99ms sim 0.29/0.31/0.34ms ent 15/26/216
- run-end: n=218 fpsMin=44 frame 16.00/22.00/23.99ms sim 0.29/0.36/0.36ms ent 14/29/234

## Assertions / Errors
- failed assertions: 1
  - [FAIL] seed — Seed invariant: expected EPOCH-GOLDEN-001, got EPOCH-AET4-3SFC
- console errors: 0

## Human Ratings (recorded, never inferred)
- not provided

## Human Feedback Marks (optional)
- none pressed (neutral — not positive, not negative)

## Human Comment (optional)

- comment: NOT PROVIDED

<!-- QA-ENGAGEMENT-END -->

## Human Gate A Result — FAIL_BLOCKING_READABILITY (recorded, not erased)

- Seed `EPOCH-GOLDEN-001`: 10:15 survival, Space reached, 1258 kills, 56 elites,
  22 techs, 76 chunks, 26 landmarks, 0 bosses, ascension NOT reached.
- Feedback YES: ภาพอ่านยาก / ไม่รู้ว่าต้องไปไหน / ศัตรูดูไม่ออก / อาวุธดูไม่ออก /
  UI ภาษาไทยมีปัญหา / ยากเกิน / ง่ายเกิน. Feedback NO: เกมกระตุก.
- Interpretation: NOT a performance failure; "ยากเกิน+ง่ายเกิน" together =
  PERCEIVED_DIFFICULTY_INCONSISTENT (readability, not numbers). No rebalancing
  until a readable re-run. Remediation lives on `fix/v011-readability-20260929`
  (presentation-only; see `docs/VISUAL_LANGUAGE.md`, `docs/ADR/0005-readability-remediation.md`).

## Visual Review Round 2 Result — PASS WITH NOTES (2026-09-29, human verdict)

Human confirmed all gates A–E on `?visual=1` at code checkpoint `35f6b73`:
silhouettes distinguishable; friendly/hostile/Knowledge/mines distinct without
color; 6 POI destination glyphs unique; Verdant/Arid composites show clear
gameplay hierarchy; Thai correct (no glyph/tone/wrap/clip issues); contrast
acceptable on all four biomes.
Watch-items for the real run (non-blocking): swarm contrast on Arid/Badlands,
affix recognition at 1x, POI recognition at gameplay distance,
chaser-vs-hostile clarity under density, late-game readability. Thai copy
polish noted (consistent "องค์ความรู้", common/uncommon wording) — deferred,
no text/balance change without playtest evidence.
Do NOT claim Human Gate A PASS. Proceeding to Phase 3 full run.

## Visual Review Round 1 Result — NOT PASSED (recorded, not erased)

Human/auditor assessment of Round-1 lab screenshots:
1. Player vs families PASS_WITH_NOTES (swarm read as decoration; samples small).
2. Friendly/hostile/Knowledge/Mine FAIL (hostile ◆ vs Knowledge ◆ collision).
3. POI FAIL (debug markers); Boss PASS.
4. Thai NOT YET VERIFIED. 5. Background PASS_WITH_NOTES. 6. Overall NOT PROVEN.
Round-2 remediation (this branch, presentation-only) addressed each item;
human Round-2 review has now PASSED WITH NOTES (see section above) —
Phase 3 full run authorized, no further presentation edits without new evidence.
Round-2 evidence captures (local only, gitignored under `test-results/`):
`lab-r2-normal-final.png`, `lab-r2-gray-final.png`, `lab-r2-poi-final.png`,
`lab-r2-thai-900-final.png`, `lab-r2-thai-game-final.png` — Verdant composite
readable in NORMAL and GRAYSCALE; 6 POI glyphs distinct with boosted pillars;
Thai strings + 300px wrap box correct at 900px. Auditor verdict pending.

## Next Three Actions

1. HUMAN (v0.2 engagement playtest): open `http://localhost:5173/?qa=1`,
   choose an Origin, play EPOCH-GOLDEN-001 to Ascension, 2+ min in World #2,
   answer the five 1–5 ratings at END PLAYTEST. Record whether you can
   describe your build in one sentence (acceptance Q1–Q7 in prompt).
2. Thai + Firefox manual QA at normal and smaller desktop windows, in Thai
   and English modes. Record problems before editing.
3. Return the playtest-report.md/json + ratings: auditor decides merge/tag
   (still gated), itch draft, and any evidence-driven tuning. Do NOT begin
   anything beyond v0.2 scope unless explicitly authorized.

## v021 Civilization Command Loop (implementation record)

- Base: v020 finalized evidence HEAD `fb29b8c` (pushed, frozen). No merge,
  no tag, no force-push, no V0.2 systems beyond the accepted spec.
- Human failures addressed: compact HUD (status card / knowledge bar /
  3-gate age checklist card), age missions per layer, Tech Map (T) on the real
  graph + pinning (bounded weight), reserve/reroll/skip + owned-stays truth,
  owned-build sidebar, explored-only minimap + civ map (M), claim/spec/tier
  territory, scheduled raids with warning + defend-or-lose, one command squad
  per origin (Q/E/R) + origin ability (F), conditional enemy HP bars, impact
  FX + damage numbers, origin/age player lineage, enemy age trim, per-age
  territory dressing, build history in Chronicle, single shared QA origin
  selector (+ `qa.banner` / `qa.recorded`).
- Gameplay contracts changed (intended): 3-gate advancement (global clock
  removed), missions, draft agency, territory/outposts/raids, squads. Numbers
  otherwise untouched (threat/XP/weapon/boss values identical).
- Versions: WORLDGEN 2 (unchanged), CONTENT 3 → 4, SAVE 1 (unchanged),
  package stays `0.2.0-dev.0`. No public release.
- Honest findings during verification: (1) committed v020 title gate lacked
  `id="qa-gate"` while `qa.spec` asserts it — recorded, fixed, re-verified;
  (2) full-suite E2E on the office i5 needs wall-clock headroom (120s cap,
  unchanged assertions); (3) E2E staging hook `readyExpansion` extended for
  the mission-inclusive contract (fields + real claim).
- Next human action: answer the 10 mastery questions in a new ?qa=1 run
  (Tech Map planning, build recall, territory care, macro/micro decisions).
  STOP before further feature development.

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
