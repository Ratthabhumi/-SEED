# Changelog

## 0.1.1 — 2026-09-29 — Stabilization & architecture hardening (branch, unmerged)

Round-3 corrective pass (all P1/P2 audit findings closed with regressions):
- Canonical snapshot contract (mines, draft choices, RNG streams; cosmetics
  excluded; tests compare snapshots, hash is debug shorthand)
- Archetype-dispatched weapons (Space kinetic beam fixed; 24 combos proven);
  defense orbit/summon split; field mine signature preserved
- Transactional boss spawn (deterministic reclaim; Ascension never soft-locked)
- InputLatch: dash edges survive zero-step frames (pattern-tested)
- State-driven single draft surface; Restart keeps the master seed; death
  persists exactly once; splitter rewards captured before pooled reuse
- Run-level chronicle stats (runElapsed/runHighestAge/runKills) survive Ascension
- Director model B explicit (budget-paid waves + bounded eligible milestones)
- Fallback cards use dedicated keys matching effects; localized family names
- F3 sim metric is step-only; POI markers refresh on discovery
- Version single-sourced (package.json → 0.1.1 → ZIP → verifier); clean UTF-8
  .gitignore; CI uploads the verified ZIP artifact
- Verifier language honest (basic forbidden-file / known-pattern checks)
- 164 unit tests + 300-seed fuzz + 6 Chromium E2E, all green
- Status: automation complete; HUMAN gates still open (full playthrough, perf
  numbers, Thai visual check, Firefox, itch embed) — not release-declared

Round-2 foundation (same branch):
- Pure `RunSimulation` extracted (`src/core/sim`); GameScene is a render/input
  adapter. Deterministic replay contract via `stateHash()` (same seed + inputs
  → same hash; restart == fresh instance)
- Ascension stream isolation: fresh event/enemy/draft/loot/boss streams per
  child world; world-scoped POI ids; per-world discovery vs run totals
- Canonical `gainKnowledge` (exactly-once multiplier); value-preserving pickup
  overflow; typed Breakthrough effects through one effect system
- Data-first elite affixes (all 5 implemented; armored fixed); era-weighted
  director (tanks locked until bronze; elites paid from budget)
- Wide-frontier Tech DAG + age-transition spine auto-grant (design A);
  CONTENT_VERSION 2, WORLDGEN_VERSION 2 (NFC seed normalization)
- Complete EN/TH critical UI (rarities, boss, POIs, breakthroughs, ascend),
  mid-run language switch, truthful clipboard + manual fallback, validated saves
- Age-progress HUD, world-space ground + camera follow, rolling p50/p95 F3 stats
- CI (Node 22/24 + release verify + Chromium E2E smoke), `release:verify`
  (17 checks), third-party notices (Phaser MIT, OFL-1.1) in the artifact
- 112 unit tests at that point (now 164) + 300-seed fuzz + Chromium smoke
- Status: stabilization complete pending HUMAN playtest gate (perf numbers,
  Thai visual check, Firefox) — still not public-release declared

## 0.1.0 — 2026-09-29 — Vertical slice

- Deterministic seed core (FNV-1a, xoshiro128**, independent substreams, stateless
  spatial hashing) with golden-seed tests
- Procedural infinite chunk world: 4 biomes, 4 POI families, civ visual evolution
- Seeded Tech DAG with critical spine + validator (acyclic, reachable, viable)
- 6 ages with time + knowledge + objective gating
- Survivor combat: 4 weapon families × 6 tiers, dash + i-frames, 4 enemy lineages,
  elite affixes, threat-budget director, space boss, endless ascension
- Breakthrough synergy system (5 data-driven combos)
- TH/EN localization with parity tests, bundled Noto Sans Thai
- Procedural Web Audio SFX, F3 diagnostics, fixed-step 60 Hz sim, spatial hash,
  object pooling
- Run Chronicle, versioned localStorage saves, itch-ready static ZIP

## Credits & license

See `CREDITS.md` and `LICENSE`.
