# ADR 0005 — Readability / Wayfinding Remediation (presentation-only branch)

Status: accepted (v0.1.1, human operator authorized).

## Context

Human Gate A returned `FAIL_BLOCKING_READABILITY`: a real 10:15 EPOCH-GOLDEN-001
run reached Space with 0 bosses and 0 ascensions, affirming every feedback
category except stutter. Simultaneous "too hard + too easy" reads as
`PERCEIVED_DIFFICULTY_INCONSISTENT` — unstable perceived difficulty from poor
combat readability, not proven numeric imbalance. Source audit confirmed the
mechanism: every enemy family, projectile, pickup, mine, and POI rendered as a
circle differentiated by color alone, over procedural dot/box/triangle decor.

## Decision

- Remediate on a NEW branch (`fix/v011-readability-20260929`); the stabilization
  branch stays untouched as the known-good rollback point.
- Presentation-first: `src/game/render/*` owns canvas drawing behind the
  `docs/VISUAL_LANGUAGE.md` token contract (shape + outline + fill, never
  color-alone). `RunSimulation` stays authoritative; no worldgen/balance/RNG/
  threshold changes; no version bumps.
- No world hard-bounds (infinite world is a differentiator): finite attention
  instead — POI beacons, nearest-interest compass, off-screen boss indicator,
  onboarding hints, HUD priority tiers. Full minimap deferred until re-test.
- Human re-validation is staged: `?visual=1` two-minute vocabulary check FIRST,
  full `?qa=1` run only after the lab reads clearly.
- E2E per-test timeout 60s → 120s: the office i5 + software WebGL needs >60s
  wall-clock for real-time gameplay tests. Assertions unchanged; hangs still fail.

## Consequences

- New query surface `?visual=1` (lab scene, presentation-only) alongside `?qa=1`.
- Additive save-settings field `contrast` (sanitized default; no schema bump).
- During verification, a missing `id="qa-gate"` on the committed title gate was
  found (parent E2E evidence for `qa.spec` recorded as suspect); fixed here and
  re-verified green with full-output logs, not exit codes alone.
