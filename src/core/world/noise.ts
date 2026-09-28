// Deterministic value-noise + fbm + domain warp. Pure functions, no RNG state.
import { hash2D, uint32ToFloat01 } from "../seed/hash";

function lattice(seedU32: number, salt: number, ix: number, iy: number): number {
  return uint32ToFloat01(hash2D(seedU32, ix, iy, salt));
}

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** 2D value noise in [0,1]. */
export function valueNoise2D(seedU32: number, salt: number, x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = lattice(seedU32, salt, ix, iy);
  const b = lattice(seedU32, salt, ix + 1, iy);
  const c = lattice(seedU32, salt, ix, iy + 1);
  const d = lattice(seedU32, salt, ix + 1, iy + 1);
  const ux = smootherstep(fx);
  const uy = smootherstep(fy);
  const ab = a + (b - a) * ux;
  const cd = c + (d - c) * ux;
  return ab + (cd - ab) * uy;
}

/** Fractal Brownian motion in [0,1]. */
export function fbm2D(seedU32: number, salt: number, x: number, y: number, octaves = 4): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise2D(seedU32, salt + o * 101, x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return norm > 0 ? sum / norm : 0;
}

/** Domain-warped fbm: adds organic region shapes. Still pure & deterministic. */
export function warpedFbm2D(seedU32: number, salt: number, x: number, y: number): number {
  const qx = fbm2D(seedU32, salt + 1001, x * 0.7 + 13.7, y * 0.7 + 7.1, 3);
  const qy = fbm2D(seedU32, salt + 2002, x * 0.7 + 3.3, y * 0.7 + 17.9, 3);
  const warp = 0.35;
  return fbm2D(seedU32, salt, x + warp * (qx - 0.5) * 4, y + warp * (qy - 0.5) * 4, 4);
}
