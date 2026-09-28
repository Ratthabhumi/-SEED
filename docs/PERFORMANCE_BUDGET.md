# Performance Budget (acceptance criteria)

- Desktop target 60 FPS with 400–600 enemies + 600–1000 projectiles in stress seed.
- Sim step (60 Hz) p95 < 4 ms on a mid laptop; render p95 < 8 ms.
- Zero allocation in hot loops: pools preallocated, scratch arrays reused.
- Collision via 128u spatial hash — never projectile×enemy full cross product.
- Ground redraw ≤ 4 Hz; F3 overlay shows FPS / sim ms / entities / queries /
  buckets / pools / chunk / seed / budget.
- Degradation order: particles → decor density → spawn cap (clamped, never
  rubber-banding difficulty). Collision quality NEVER degrades with FPS.
