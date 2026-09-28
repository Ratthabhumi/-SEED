// xoshiro128** — deterministic sequential PRNG for simulation & generation.
// Reference algorithm by Vigna & Blackman. Seeded via splitmix32.

function splitmix32(state: { s: number }): number {
  state.s = (state.s + 0x9e3779b9) | 0;
  let z = state.s;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

export class Xoshiro128StarStar {
  private s: [number, number, number, number];

  constructor(seedU32: number) {
    const st = { s: seedU32 >>> 0 };
    this.s = [splitmix32(st), splitmix32(st), splitmix32(st), splitmix32(st)];
    // Avoid all-zero state (splitmix makes this ~impossible, but guard anyway).
    if ((this.s[0] | this.s[1] | this.s[2] | this.s[3]) === 0) this.s[0] = 0xdeadbeef;
  }

  nextUint32(): number {
    const s = this.s;
    const result = (Math.imul(rotl(Math.imul(s[1], 5), 7), 9)) >>> 0;
    const t = (s[1] << 9) >>> 0;
    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 11);
    return result >>> 0;
  }

  nextFloat(): number {
    return this.nextUint32() / 4294967296;
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    const span = maxExclusive - minInclusive;
    if (span <= 0) return minInclusive;
    return minInclusive + Math.floor(this.nextFloat() * span);
  }

  nextRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("pick() of empty array");
    return arr[Math.floor(this.nextFloat() * arr.length)] as T;
  }

  shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextFloat() * (i + 1));
      const tmp = arr[i] as T;
      arr[i] = arr[j] as T;
      arr[j] = tmp;
    }
    return arr;
  }

  /** Snapshot state for serialization tests. */
  snapshot(): [number, number, number, number] {
    return [this.s[0], this.s[1], this.s[2], this.s[3]];
  }

  /** Restore a snapshot (canonical-hash coverage + tests). */
  restore(snap: readonly [number, number, number, number]): void {
    this.s = [snap[0], snap[1], snap[2], snap[3]];
  }
}
