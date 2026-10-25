# Test Plan (v0.1.1)

`npm run test` (Vitest, node env — core never boots Phaser):

- **seed/** determinism (sequences, cross-seed difference, stream independence,
  derived/ascension seeds, order-independent spatial hash, snapshots, formats)
  + **unicode** (NFC: composed/decomposed Thai seeds identical).
- **world/** chunks (descriptor/biome/POI determinism, origin safe spawn,
  cross-seed difference, chunk math, no-NaN sweep).
- **tech/** graph (deterministic generation, validator green incl. ascension,
  rejects bad prereqs/cycles).
- **director/** budgets finite + growing, strict era gating (zero tanks in stone),
  bounded at ascension 100, elite chance clamped, deterministic composition,
  era diversity (no 90%+ single family).
- **sim/** replay contract (same seed+inputs → same 8-hex state hash; different
  inputs/seeds diverge; 3600-step stress stays finite), RNG/ascension isolation
  (real 10k-draw spam per stream vs none → identical child prefixes +
  trajectories), world-scoped POIs, knowledge exactly-once, pickup value
  conservation, breakthrough contracts, affix contracts, draft frontier width
  (≥3 at every age), 300-seed fuzz corpus, canonical snapshots (mines/RNG
  covered, cosmetics excluded), 24 archetype executions, boss saturation,
  input-latch patterns, splitter rewards, director era/budget paths, fallback
  text/effect consistency, long-run edge cases.
- **i18n/** parity EN↔TH (release-blocking), no empties/undefined, Thai
  combining-mark preservation.
- **save/** defaults, corrupt/schema-mismatch fallback, round-trip + runtime
  validation (bad lang/volume/shake/contrast/best/history sanitized).
- **balance/** 8 seeds: valid graphs, finite threat, sane fields, monotonic XP,
  full weapon tables, satisfiable age gates.
- **qa/** recorder exactly-once checkpoints, FAIL dedupe + bounds, report
  sections, sampler percentiles/worst-case counters/buffer caps, overflow
  analysis, mode gating.
- **visual/** token contracts (distinct family shapes incl. all 5 affix markers,
  boss ≠ tank, friendly ≠ hostile, pickup/POI channels, archetype coverage),
  navigation math, mode dormancy, EN/TH key presence for readability-critical
  labels.

`npm run test:e2e` (Playwright + Chromium, production build, `?e2e` hook):
smoke (title/seed/run/move/pause/EN↔TH/F3/quit) + regressions (restart keeps
seed, queued multi-draft single-surface completion, death persists exactly once,
language switch leaves canonical snapshot identical, ascension child-world with
run stats retained) + qa (gate → golden start → live panel → report download) +
visual (`?visual=1` samples + EN/TH toggle; `/` and `?qa=1` expose no lab UI).
Per-test timeout 120s: the office i5 + software WebGL needs >60s wall-clock for
real-time gameplay tests; assertions unchanged, hangs still fail. Firefox
remains a manual gate.

Manual checklist before release: full run to Space on EPOCH-GOLDEN-001, boss,
ascend, death chronicle, Thai visual inspection (tone marks, clipping, wrapping,
small windows), `npm run check` + `npm run release:verify` green in CI.
