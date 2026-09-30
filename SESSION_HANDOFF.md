# Session Handoff

## Timestamp

2026-09-29 ~03:05 Asia/Bangkok. Documentation-only checkpoint; no code, test,
dependency, or build change in this pass.

Office sync 2026-09-29 Asia/Bangkok: fresh `git clone` + checkout of
`fix/v011-stabilization-20260929` at
`544fb81d1375e85f13382a962d8c5f93185d4bfe` (= remote HEAD, one docs-only
commit ahead of implementation checkpoint `b5750f1`); working tree clean;
`npm ci` + `npm run check` green on this machine (typecheck PASS, 22 files /
164 tests PASS, production build PASS, EXIT 0).

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

`feat/v021-civilization-command-loop-20260930` — **UNMERGED, UNTAGGED, NO ITCH**
(deliberate; awaiting auditor review + next human test). Parent
`feat/v020-engagement-loop-20260930` (@`fb29b8c`, finalized FAIL evidence)
frozen and pushed. Readability `fix/v011-readability-20260929` remains the
technical baseline; stabilization `737ddf3` the deep rollback point.

## Origin Main

`5e6d5c65ea905bc3859f115e73bfd02913988d45` (unchanged; no merge performed).

## Implementation Checkpoint

v0.2 WORKING BRANCH (see `git log` for exact HEAD at push time).
Frozen baseline: readability `e4d4f8940cac2537fafd0a05895e1ea23b8f7ac2`
(CI green). No force-push, no history rewrite on any line.

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
- `npm run test` — 33 files / 273+ tests PASS (incl. 24 civilization
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

- ACTIVE branch `feat/v020-engagement-loop-20260930` tracks
  `origin/feat/v020-engagement-loop-20260930`; working tree clean at handoff.
- FROZEN baseline: readability `e4d4f8940cac2537fafd0a05895e1ea23b8f7ac2`
  (never modified by this line). Deep rollback: stabilization `737ddf3`.
- No force-push, no rewritten history, no merge to main, no tags, no itch.
- Branch HEAD verified at push time (local == remote; `origin/main` `5e6d5c6`).

## Exact Resume Procedure

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

Resume rule: the ACTIVE branch is `feat/v020-engagement-loop-20260930`.
Do NOT resume on `fix/v011-readability-20260929` (frozen v0.1.1 baseline) or
`fix/v011-stabilization-20260929` (deep rollback) unless rolling back. If green
and SHA matches this handoff, run the v0.2 engagement playtest
(`?qa=1`, EPOCH-GOLDEN-001, pick an Origin, reach Ascension, 2+ min in World #2,
answer the five 1–5 ratings) before any further editing.

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

# v0.2 Human Engagement Test — Sanitized Evidence

> Auto-generated by `npm run qa:report` from local QA telemetry.
> Machine evidence only — fun and readability verdicts need a human.

## Run

- seed: EPOCH-GOLDEN-001
- package: 0.2.0-dev.0 / worldgen 2 / content 3 / save 1
- endReason: player-died
- viewport: 1912x914 / refresh: ~100Hz

## Route
- [x] run started (0.00s)
- [x] Bronze (100.02s)
- [x] Iron (254.68s)
- [x] Industrial (350.57s)
- [x] Atomic (460.02s)
- [x] Space (583.93s)
- [x] boss spawned (598.97s)
- [ ] boss killed 
- [ ] ascension offered 
- [ ] ascension started 
- [ ] child world 
- [ ] post-ascension +30s 
- [ ] post-ascension +60s 
- [ ] post-ascension +120s 
- [x] player died (727.48s)
- [x] run ended (727.48s)

## Engagement Identity
- @0.00s stone asc 0: origin engineers [defense+kinetic] lv1 k0e0d0f0 techs 0 knowledge 0 breakthroughs [-] legacies [-] poi [-]
- @100.02s bronze asc 0: origin engineers [defense+kinetic] lv11 k1e1d1f1 techs 14 knowledge 764 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @254.68s iron asc 0: origin engineers [defense+kinetic] lv15 k2e2d2f2 techs 18 knowledge 1535 breakthroughs [bioforge+fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @350.57s industrial asc 0: origin engineers [defense+kinetic] lv19 k3e3d3f3 techs 22 knowledge 2830 breakthroughs [bioforge+fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @460.02s atomic asc 0: origin engineers [defense+energy+kinetic] lv24 k4e4d4f4 techs 27 knowledge 5219 breakthroughs [bioforge+fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @583.93s space asc 0: origin engineers [defense+energy+kinetic] lv27 k5e5d5f5 techs 30 knowledge 6504 breakthroughs [bioforge+fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @727.48s space asc 0: origin engineers [defense+energy+kinetic] lv30 k5e5d5f5 techs 33 knowledge 8529 breakthroughs [bioforge+fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]

## Knowledge At Age
- bronze @100.02s (asc 0): 764
- iron @254.68s (asc 0): 1535
- industrial @350.57s (asc 0): 2830
- atomic @460.02s (asc 0): 5219
- space @583.93s (asc 0): 6504

## Sim Decisions (ordered)
- [tech] stone-tools @19.20s stone asc 0
- [poi-major] meteor @23.55s stone asc 0
- [tech] spine-metallurgy @23.57s stone asc 0
- [tech] bronze-precision @25.00s stone asc 0
- [poi-major] ruin @28.12s stone asc 0
- [tech] fb-spd-3 @28.13s stone asc 0
- [tech] bronze-armor @41.05s stone asc 0
- [breakthrough] fortress @41.05s stone asc 0
- [tech] fb-spd-5 @45.50s stone asc 0
- [poi-major] signal @46.83s stone asc 0
- [tech] fb-spd-5 @46.85s stone asc 0
- [poi-major] vault @60.53s stone asc 0
- [tech] fb-spd-5 @60.55s stone asc 0
- [tech] fb-spd-6 @64.13s stone asc 0
- [tech] fb-spd-7 @69.53s stone asc 0
- [tech] fb-spd-8 @72.18s stone asc 0
- [tech] fb-spd-9 @78.32s stone asc 0
- [tech] bronze-rite @84.97s stone asc 0
- [tech] fb-spd-11 @95.35s stone asc 0
- [tech] spine-ironwork @119.67s bronze asc 0
- [tech] iron-breeding @155.00s bronze asc 0
- [tech] iron-medicine @161.72s bronze asc 0
- [breakthrough] bioforge @161.72s bronze asc 0
- [tech] iron-ballistics @247.23s bronze asc 0
- [tech] spine-steam @262.87s iron asc 0
- [tech] industrial-turret @289.27s iron asc 0
- [tech] industrial-rotary @309.53s iron asc 0
- [breakthrough] war-machine @309.53s iron asc 0
- [tech] industrial-rail @346.43s iron asc 0
- [expansion] energy @350.57s industrial asc 0
- [tech] spine-fission @356.05s industrial asc 0
- [tech] atomic-reactor @367.28s industrial asc 0
- [tech] atomic-plasma @391.67s industrial asc 0
- [tech] atomic-radar @402.42s industrial asc 0
- [tech] fb-spd-24 @414.40s industrial asc 0
- [tech] spine-orbital @461.97s atomic asc 0
- [tech] space-lance @520.95s atomic asc 0
- [tech] space-swarm @575.32s atomic asc 0
- [tech] space-anomaly @638.77s space asc 0
- [tech] fb-spd-29 @672.13s space asc 0
- [tech] fb-spd-30 @713.72s space asc 0

## Performance Summary
- bronze: n=478 fpsMin=69 frame 10.03/13.01/14.18ms sim 0.33/0.47/0.58ms ent 105/26/43
- iron: n=1156 fpsMin=60 frame 10.01/13.98/15.95ms sim 0.45/0.45/0.46ms ent 199/77/86
- industrial: n=337 fpsMin=52 frame 10.01/16.97/18.99ms sim 0.41/0.48/0.48ms ent 246/107/119
- atomic: n=308 fpsMin=51 frame 13.02/17.99/19.02ms sim 0.21/0.43/0.43ms ent 257/115/225
- space: n=876 fpsMin=34 frame 16.67/22.00/28.00ms sim 0.15/0.16/0.17ms ent 45/23/209
- boss-spawn: n=33 fpsMin=47 frame 15.99/19.00/24.00ms sim 0.18/0.20/0.20ms ent 31/13/224
- run-end: n=322 fpsMin=54 frame 14.00/18.01/21.00ms sim 0.18/0.21/0.21ms ent 51/35/287

## Assertions / Errors
- failed assertions: 0
- console errors: 0

## Human Ratings (recorded, never inferred)
- not provided

## Human Feedback Marks (optional)
- none pressed (neutral — not positive, not negative)

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
