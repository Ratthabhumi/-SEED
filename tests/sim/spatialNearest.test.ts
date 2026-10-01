// Differential contract: spatial nearest == brute-force nearest, exactly.
// Reference is the pre-optimization linear scan (pool order, strict `<`,
// lowest index wins ties, d === maxD excluded). Seeded arrangements cover
// radii, cell boundaries, ties, boss/normal mixes, and empty results.
import { describe, it, expect } from "vitest";
import { nearestEnemySpatial, cellKey } from "../../src/core/sim/spatial";
import type { SimEnemy } from "../../src/core/sim/RunState";
import { SPATIAL_CELL } from "../../src/core/sim/RunState";

function makeEnemy(x: number, y: number, active = true): SimEnemy {
  return {
    active, x, y, hp: 10, maxHp: 10, shield: 0, family: "chaser",
    speed: 100, dmg: 5, radius: 12, xp: 1, elite: false, affix: "",
    flash: 0, shootT: 0, boss: false, hitCd: 0, siege: false,
  };
}

/** Pre-optimization reference: byte-for-byte the old nearestEnemy logic. */
function bruteForce(enemies: readonly SimEnemy[], x: number, y: number, maxD: number): number {
  let best = -1;
  let bd = maxD;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i] as SimEnemy;
    if (!e.active) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    if (Math.abs(dx) > bd || Math.abs(dy) > bd) continue;
    const d = Math.hypot(dx, dy);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

function buildBuckets(enemies: readonly SimEnemy[]): Map<number, number[]> {
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i] as SimEnemy;
    if (!e.active) continue;
    const k = cellKey(Math.floor(e.x / SPATIAL_CELL), Math.floor(e.y / SPATIAL_CELL));
    let b = buckets.get(k);
    if (!b) {
      b = [];
      buckets.set(k, b);
    }
    b.push(i);
  }
  return buckets;
}

// Deterministic PRNG (mulberry32) — no Math.random in tests.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("spatial nearest differential", () => {
  it("equals brute force across seeded arrangements", () => {
    const rand = rng(0xc10c);
    for (let iter = 0; iter < 200; iter++) {
      const n = 1 + Math.floor(rand() * 40);
      const enemies: SimEnemy[] = [];
      for (let i = 0; i < n; i++) {
        // Cluster near cell boundaries to stress bucket edges.
        const edge = rand() < 0.5;
        const x = edge
          ? Math.round(rand() * 8) * SPATIAL_CELL + (rand() - 0.5) * 4
          : (rand() - 0.5) * 3000;
        const y = edge
          ? Math.round(rand() * 8) * SPATIAL_CELL + (rand() - 0.5) * 4
          : (rand() - 0.5) * 3000;
        const e = makeEnemy(x, y, rand() < 0.8);
        if (rand() < 0.1) e.boss = true;
        enemies.push(e);
      }
      const buckets = buildBuckets(enemies);
      for (let q = 0; q < 5; q++) {
        const x = (rand() - 0.5) * 3000;
        const y = (rand() - 0.5) * 3000;
        const maxD = [0, 1, 64, 300, 700, 5000][Math.floor(rand() * 6)] as number;
        const expected = bruteForce(enemies, x, y, maxD);
        const actual = nearestEnemySpatial(enemies, buckets, SPATIAL_CELL, x, y, maxD);
        expect(actual, `iter=${iter} q=${q}`).toBe(expected);
      }
    }
  });

  it("exact ties resolve to the lowest pool index", () => {
    const enemies: SimEnemy[] = [
      makeEnemy(100, 0), // idx 0
      makeEnemy(-100, 0), // idx 1
      makeEnemy(0, 100), // idx 2
      makeEnemy(0, -100), // idx 3
      makeEnemy(0, 0, false), // idx 4 inactive
    ];
    const buckets = buildBuckets(enemies);
    expect(bruteForce(enemies, 0, 0, 500)).toBe(0);
    expect(nearestEnemySpatial(enemies, buckets, SPATIAL_CELL, 0, 0, 500)).toBe(0);
  });

  it("boundary radius and empty results match", () => {
    const enemies = [makeEnemy(300, 0), makeEnemy(0, 400)];
    const buckets = buildBuckets(enemies);
    // d === maxD is excluded by the strict comparison.
    expect(bruteForce(enemies, 0, 0, 300)).toBe(-1);
    expect(nearestEnemySpatial(enemies, buckets, SPATIAL_CELL, 0, 0, 300)).toBe(-1);
    expect(bruteForce(enemies, 0, 0, 300.0001)).toBe(0);
    expect(nearestEnemySpatial(enemies, buckets, SPATIAL_CELL, 0, 0, 300.0001)).toBe(0);
    // maxD = 0 matches nothing.
    expect(bruteForce(enemies, 300, 0, 0)).toBe(-1);
    expect(nearestEnemySpatial(enemies, buckets, SPATIAL_CELL, 300, 0, 0)).toBe(-1);
    // All inactive.
    const dead = [makeEnemy(10, 10, false)];
    const deadBuckets = buildBuckets(dead);
    expect(bruteForce(dead, 0, 0, 500)).toBe(-1);
    expect(nearestEnemySpatial(dead, deadBuckets, SPATIAL_CELL, 0, 0, 500)).toBe(-1);
  });
});
