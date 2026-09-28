# Test Plan

`npm run test` (Vitest, node env — core never needs Phaser booted):

- **seed/** determinism: same-seed sequences, cross-seed differences, stream
  independence (1000 loot draws don't move tech), derived/ascension seeds,
  stateless-hash order independence, snapshot serialization, readable-seed format.
- **world/** chunks: descriptor/biome/POI determinism on golden seeds, origin safe
  spawn, cross-seed differences, chunk math, no-NaN field sweep.
- **tech/** graph: deterministic generation, validator green on golden + ascension
  graphs, rejects missing prereqs and cycles.
- **director/** budgets finite + growing, era constraints, bounded at ascension 100,
  elite chance clamped, composition deterministic.
- **i18n/** parity: EN↔TH key equality, no empties, no undefined render,
  Thai combining-mark preservation (release-blocking).
- **save/** defaults, missing/corrupt/schema-mismatch safe fallback, round-trip.
- **balance/** 8 generated seeds: valid graphs, finite threat curves, sane fields,
  monotonic XP, full weapon tables, satisfiable age gates.

Manual checklist before release: new run → draft → 3 ages → boss → ascend → death
chronicle → EN/TH switch mid-run → F3 → `npm run check` green.
