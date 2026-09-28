# ADR 0002 — Deterministic Seeding

## Decision

FNV-1a seed derivation → independent `xoshiro128**` substreams per subsystem +
stateless `Math.imul` coordinate hashing for spatial features. `Math.random()`
banned from all deterministic paths (cosmetic-only exceptions marked).

## Rationale

Separating streams means new cosmetic RNG can never shift terrain/tech/bosses —
the classic procedural pitfall. Stateless spatial hashing makes chunk results
order-independent (visit order, streaming radius, and frame timing can't change
what a coordinate contains).

## Compatibility

`WORLDGEN_VERSION / CONTENT_VERSION / SAVE_SCHEMA_VERSION = 1`. Seed identity is
master + worldgen + difficulty; any intentional generator break bumps the version
instead of silently forking histories.
