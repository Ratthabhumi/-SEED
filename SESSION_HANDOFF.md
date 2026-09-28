# Session Handoff — v0.1.1 stabilization (branch work, NOT merged)

## Timestamp

2026-09-29 ~02:00 Asia/Bangkok. Session: v0.1.1 stabilization & architecture
hardening on top of v0.1, per external audit. No V0.2 content added.

## Branch

`fix/v011-stabilization-20260929` tracking `origin/main`.
Base note: expected audit base was `7bc953d`, but `origin/main` had moved to
`5e6d5c6` ("Name", README title dash removal by Ratthabhumi). Pulled `--ff-only`
to `5e6d5c6` and branched from there — deviation recorded, no history rewritten.

## HEAD

Code state: `62480a2fc7d56059c7a76d54735ea07b76e19b36` (4 commits above `5e6d5c6`).
This handoff file's own record-commit moves branch HEAD forward without changing
code — read branch HEAD for the latest handoff, `62480a2` for the latest code.
Branch: `fix/v011-stabilization-20260929` (pushed, unmerged).
Base deviation: branched from `5e6d5c6`, not `7bc953d` (upstream README touch).

## Product Goal

Unchanged: -SEED — one survivor run = one civilization stone → space,
deterministic seed-shareable worlds, seeded Tech DAG, endless ascension, TH/EN.

## Current Playable State

Same v0.1 feature surface, with corrected runtime contracts:
- Ascension creates fully fresh RNG streams + world-scoped POIs (same seed =
  same history, proven by isolation + replay tests)
- Restart = new `RunSimulation` (fresh boot ≡ restart, hash-proven)
- Knowledge single-resource, exactly-once; pickups never lose value when pooled
- Breakthroughs do what their (localized) descriptions say; all 5 affixes real
- TH/EN complete for critical UI incl. mid-run switch; saves validated; clipboard
  truthful with manual fallback
- HUD shows knowledge/objective/time progress; ground scrolls smoothly under a
  following camera; F3 shows rolling p50/p95 + cache/pool stats

## Completed Milestones (this branch)

1. `fix: stabilize run rng lifecycle and progression invariants` (R0 core + tests)
2. `refactor: extract deterministic run simulation` (R1 + adapter + HUD/clipboard)
3. `ci/perf/release` + `docs` commits (pending at time of writing — see below)

## Verification

- `npm run typecheck` — PASS
- `npm run test` — 14 files / 112 tests PASS (incl. 300-seed fuzz)
- `npm run build` — PASS (dist ~2.1 MB, Thai woff2 + third-party notices bundled)
- `npm run zip` — fresh ZIP (old deleted first)
- `npm run release:verify` — 17/17 PASS
- `npm run test:e2e` — Chromium smoke PASS (title/seed/run/move/pause/EN↔TH/
  F3/quit, zero page errors). Firefox = manual gate, not done.

## Golden Seeds + Corpus

EPOCH-GOLDEN-001/002, EPOCH-STRESS-001 pinned; `tests/sim/fuzz.test.ts` runs
300 generated seeds through graph/world/threat validation in CI.

## Performance Snapshot

NOT YET MEASURED on human hardware. Instrumentation shipped (F3 rolling p50/p95
for sim + frame, entity/query/bucket/pool/cache stats). Budgets remain targets.

## Known Issues / Manual Gates (human required)

1. Full playtest Stone → Space → Ascension on EPOCH-GOLDEN-001 with recorded
   hardware/browser/resolution/FPS/sim-maxima — NOT DONE.
2. Thai visual inspection (tone marks, clipping, cards, small windows) — NOT DONE.
3. Firefox verification — NOT DONE. itch draft/restricted embed — NOT DONE.
4. Nearest-enemy is still a linear scan (documented R3.4 follow-up).
5. `?seed=` deep-link and daily/challenge seeds remain V0.2 scope.

## Deferred Scope

Everything V0.2 (doctrines, 5th family, bosses, minimap, galaxy) — untouched.

## Architecture Decisions (new)

- ADR 0001/0002/0003 stand; AGENTS.md hardened (core bans DOM/storage/audio too).
- Design A: age transition auto-grants the age spine (GAME_DESIGN.md).
- WORLDGEN 1→2 (NFC seed normalization), CONTENT 2 (wide frontier + design A).
- Phaser stays 4.2.1, license corrected to MIT; engines `>=22`; CI Node 22/24.

## Files Changed (branch vs origin/main)

New: `src/core/sim/*` (7), `runRng.ts`, `progression.ts`, `.github/workflows/ci.yml`,
`scripts/release-verify.mjs`, `public/THIRD_PARTY_NOTICES.txt`,
`public/licenses/*`, `e2e/smoke.spec.ts`, `playwright.config.ts`,
6 new test files. Rewritten: `RunSimulation` (new), `GameScene` (adapter),
`director.ts`, `synergy.ts`, `save.ts`, docs. See `git diff --stat`.

## Next Three Actions

1. **Human playtest gate** (see above) — record results here; only then consider
   merging to main.
2. **Reviewer pass**: diff `origin/main...fix/v011-stabilization-20260929`,
   determinism/CI/artifact audit (round 3), then merge (no squash — history is
   milestone-structured) and tag `v0.1.1`.
3. **Start V0.2** only after merge: doctrines + support family on a new branch.

## Do-Not-Break Invariants

- Same seed + same inputs = same hash; streams isolated; POIs world-scoped.
- Knowledge exactly-once; pickups conserve value; breakthroughs match text.
- Every pooled affix implemented + telegraphed; TH/EN parity release-blocking.
- `src/core` never imports Phaser/DOM/storage/audio (CI-greppable).
- Never merge this branch automatically; no V0.2 content on it.
- Title "-SEED" still provisional (no trademark clearance).
