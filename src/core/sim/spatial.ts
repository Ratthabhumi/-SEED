// Deterministic spatial queries over the simulation enemy pool.
//
// nearestEnemySpatial() returns EXACTLY the same enemy as the legacy
// brute-force linear scan: minimum Math.hypot distance with strict `<`
// comparison, lowest pool index winning equal-distance ties. The rule is
// order-independent by construction, so bucket iteration order (including
// hash collisions merging distant cells) cannot change the result.
// Buckets and query counters are telemetry/indices only — never hashed.
import type { SimEnemy } from "./RunState";

export function cellKey(cx: number, cy: number): number {
  return cx * 73856093 ^ cy * 19349663;
}

/**
 * Pool index of the nearest active enemy within maxD, or -1.
 * `enemies` is the full pool (index = identity for tie-breaks).
 */
export function nearestEnemySpatial(
  enemies: readonly SimEnemy[],
  buckets: ReadonlyMap<number, readonly number[]>,
  cell: number,
  x: number,
  y: number,
  maxD: number,
): number {
  let best = -1;
  let bd = maxD;
  const x0 = Math.floor((x - maxD) / cell);
  const x1 = Math.floor((x + maxD) / cell);
  const y0 = Math.floor((y - maxD) / cell);
  const y1 = Math.floor((y + maxD) / cell);
  for (let cx = x0; cx <= x1; cx++) {
    for (let cy = y0; cy <= y1; cy++) {
      const bucket = buckets.get(cellKey(cx, cy));
      if (!bucket) continue;
      for (let bi = 0; bi < bucket.length; bi++) {
        const idx = bucket[bi] as number;
        const e = enemies[idx] as SimEnemy;
        if (!e.active) continue;
        const dx = e.x - x;
        const dy = e.y - y;
        if (Math.abs(dx) > bd || Math.abs(dy) > bd) continue;
        const d = Math.hypot(dx, dy);
        // Strict `<` mirrors the brute-force scan (which also excludes
        // d === maxD). The index clause reproduces its lowest-pool-index
        // tie-break; it can only fire once a strictly-closer best exists.
        if (d < bd || (best !== -1 && d === bd && idx < best)) {
          bd = d;
          best = idx;
        }
      }
    }
  }
  return best;
}
