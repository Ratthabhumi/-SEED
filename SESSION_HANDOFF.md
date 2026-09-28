# Session Handoff

## Timestamp

2026-09-29 ~01:10 UTC+7 (Asia/Bangkok), v0.1 vertical-slice build session.

## Branch

`main` (fresh repo; workstream branch `feat/epochseed-vertical-slice-20260929`
merged into main for the initial push — repo was empty, no unrelated history).

## HEAD

(to fill after commit) — `git log --oneline -3`.

## Product Goal

-SEED: one survivor run = one civilization stone → space, deterministic
seed-shareable worlds, seeded Tech DAG, endless ascension. v0.1 = playable,
tested, itch-ready vertical slice (TH/EN).

## Current Playable State

- Title: seed input, random seed, EN/ไทย toggle, settings (volume/shake).
- Run: WASD/arrows + dash i-frames, 4 auto-weapon families evolving per age,
  4 enemy lineages, elites + affixes, threat director, 6 ages with time +
  knowledge + kill objectives, POI discovery, space boss → ascension offer →
  child world (keeps build, +difficulty), death → Run Chronicle + copy seed.
- F3 overlay (FPS/sim/entities/queries/pools/chunk/seed/budget/ascension).
- 75 automated tests green, `npm run check` green, `dist/` builds, Thai fonts
  bundled locally.

## Completed Milestones

M0 foundation (Vite+TS+Phaser4.2.1+Vitest, docs, AGENTS, ADRs) · M1 determinism
(hash/RNG/streams/golden tests) · M2 combat (fixed-step, pools, spatial hash,
draft) · M3 civilization (6 ages, tech DAG+validator, synergies, weapon tiers,
civ visual layers) · M4 world (chunks, biomes, POIs, safe spawn) · M5 director
(budget, lineages, affixes, boss, ascension) · M6 polish (DOM UI, TH/EN parity,
Web Audio SFX, saves, F3) · M7 release (build, ZIP, docs).

## Verification

- `npm run typecheck` — PASS
- `npm run test` — 7 files / 75 tests PASS
- `npm run build` — PASS (dist ~2 MB, Thai woff2 bundled)
- `npm run zip` — release/seed-web-v0.1.0.zip (index.html at root)

## Golden Seeds

EPOCH-GOLDEN-001 / EPOCH-GOLDEN-002 / EPOCH-STRESS-001 — pinned by
seed/world/tech/balance tests (sequence, chunk, biome, POI, graph equality).

## Performance Snapshot

Budgets defined, not yet measured on hardware: pools 650/1000/400/60, 128u hash,
4 Hz ground redraw. F3 overlay in-game is the measurement tool. No stress-run
numbers captured yet — first playtest should record FPS/sim ms on target laptop.

## Known Issues

1. No real-device playtest yet (combat feel, pacing, Thai layout on small screens).
2. Phaser bundle ~1.75 MB — fine for itch, but code-split later if it grows.
3. Tech-graph "repair" path is log-and-continue (all generated graphs currently
   validate; deterministic retry seed reserved, not yet needed).
4. Mobile/touch controls deferred (stretch goal per contract).
5. Title starfield cosmetic uses Math.random (marked, allowed by AGENTS.md).

## Deferred Scope

V0.2+: 5th enemy family, doctrines wired into drafts, challenge/daily seeds,
minimap, civ traits/policies, extinction events, planet-network ascension view,
mobile controls. See ROADMAP.md.

## Architecture Decisions

ADR 0001 stack (Phaser 4.2.1 pinned, 3.90.0 fallback) · 0002 deterministic seeding
· 0003 sim/render separation. `src/core` has zero Phaser imports (grep-verified).

## Files Changed

Initial commit — all files (src/core 20 modules, content, i18n EN/TH, 2 scenes,
DOM UI, CSS, 7 test files, 12 docs + 3 ADRs, configs, zip script).

## Next Three Actions

1. **Playtest on real hardware:** run `npm run dev`, complete a full run to Space
   on EPOCH-GOLDEN-001, record F3 numbers + feel notes (movement, pacing, draft
   readability) into BALANCE.md/SESSION_HANDOFF.md.
2. **Upload itch alpha:** `npm run zip` → upload per docs/ITCH_RELEASE.md, verify
   iframe launch + Thai rendering in Chrome/Firefox.
3. **Start V0.2:** wire Archive doctrines into draft options + add Support enemy
   family (branch `feat/depth-YYYYMMDD`).

## Do-Not-Break Invariants

- No `Math.random()` in deterministic paths; `src/core` never imports Phaser.
- Version bumps: worldgen break → WORLDGEN_VERSION++; save change → migration/version++.
- TH/EN key parity + Thai rendering = release-blocking.
- Never delete tests to get green; perf budgets are acceptance criteria.
- Trademark/name clearance for "-SEED" NOT done — title still provisional.
