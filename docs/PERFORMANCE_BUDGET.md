# Performance Budget (v0.1.1 — TARGETS, not yet verified on hardware)

- Desktop target 60 FPS with 400–600 enemies + 600–1000 projectiles in stress seed.
- Sim step (60 Hz) p95 < 4 ms on a mid laptop; render p95 < 8 ms.
- Pools preallocated; spatial bucket arrays reused; no `slice()` in combat loops.
- Known remaining per-candidate cost: linear nearest-enemy scan per weapon tick
  (R3.4 spatial-nearest upgrade deferred until profiling justifies it).
- Collision via 128u spatial hash, rebuilt AFTER enemy movement, BEFORE weapons.
- Ground redraw only on chunk/age/world change; camera follows every frame.
- F3 overlay reports rolling p50/p95 for sim-step and frame times (bounded 240
  samples), entities, queries, buckets, pool saturation, chunk-cache hit rate.
  The sim metric measures `RunSimulation.step()` durations ONLY — event/DOM/
  audio handling is timed separately and never labeled as simulation work.
- Degradation order: particles → decor density → spawn cap (clamped, never
  rubber-banding difficulty). Collision quality NEVER degrades with FPS.

## Measurement status: NOT YET MEASURED

No human hardware run has been recorded. The next step is the manual playtest
gate (EPOCH-GOLDEN-001, Stone → Space → Ascension) documenting hardware,
browser, resolution, FPS p50/p95, sim p95, maxima, and saturation. Until then,
do not claim these targets are met.
