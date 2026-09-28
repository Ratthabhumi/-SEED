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
  (pre-ascension spam cannot move the child world), world-scoped POIs,
  knowledge exactly-once, pickup value conservation, breakthrough contracts,
  affix contracts, draft frontier width (≥3 at every age), 300-seed fuzz corpus.
- **i18n/** parity EN↔TH (release-blocking), no empties/undefined, Thai
  combining-mark preservation.
- **save/** defaults, corrupt/schema-mismatch fallback, round-trip + runtime
  validation (bad lang/volume/shake/best/history sanitized).
- **balance/** 8 seeds: valid graphs, finite threat, sane fields, monotonic XP,
  full weapon tables, satisfiable age gates.

`npm run test:e2e` (Playwright + Chromium, production build): title → random and
manual seed → run → movement → pause → mid-run EN↔TH (run continues) → F3 →
restart/quit-to-title, zero page errors. Firefox remains a manual gate.

Manual checklist before release: full run to Space on EPOCH-GOLDEN-001, boss,
ascend, death chronicle, Thai visual inspection (tone marks, clipping, wrapping,
small windows), `npm run check` + `npm run release:verify` green in CI.
