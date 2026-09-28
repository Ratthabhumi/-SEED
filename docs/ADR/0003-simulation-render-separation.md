# ADR 0003 — Simulation / Render Separation

## Decision

`src/core/**` is framework-free and must never import Phaser. Rules, generation,
validation, and balance live there and are tested headless. `src/game/**`
renders state, captures input, and synthesizes audio — it owns no canonical rules.

## Rationale

Survivor balance and procedural correctness need hundreds of cheap deterministic
assertions per second of developer time; booting an engine per test would kill
that loop. Separation also keeps the Phaser 3 fallback path (ADR 0001) trivial.

## Enforcement

- Type-level: code review + `grep -r "phaser" src/core` must stay empty
  (add to CI when CI exists).
- Tests import only from `src/core`, `src/content`, `src/i18n`.
- Fixed 60 Hz accumulator with capped catch-up; FPS drops degrade cosmetics first.
