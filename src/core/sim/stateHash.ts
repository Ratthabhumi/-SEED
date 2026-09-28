// Deterministic state hash for replay contracts. Covers gameplay state only —
// never spatial indices, scratch buffers, or render-only data (beam flash).
import { fnv1a32 } from "../seed/hash";
import type { RunState } from "./RunState";

function r6(n: number): number {
  const v = Math.round(n * 1e6) / 1e6;
  return v === 0 ? 0 : v;
}

/** Canonical snapshot → fnv1a hex. Same seed + same inputs ⇒ identical hash. */
export function stateHash(s: RunState): string {
  const enemies: string[] = [];
  for (const e of s.enemies) {
    if (!e.active) continue;
    enemies.push([r6(e.x), r6(e.y), r6(e.hp), r6(e.shield), e.family, e.elite ? e.affix : "", e.boss ? 1 : 0].join(","));
  }
  enemies.sort();
  const projs: string[] = [];
  for (const p of s.projs) {
    if (!p.active) continue;
    projs.push([r6(p.x), r6(p.y), r6(p.vx), r6(p.vy), r6(p.dmg), r6(p.life), p.friendly ? 1 : 0, p.src].join(","));
  }
  projs.sort();
  const picks: string[] = [];
  for (const k of s.pickups) {
    if (!k.active) continue;
    picks.push([r6(k.x), r6(k.y), r6(k.value)].join(","));
  }
  picks.sort();
  const b = s.build;
  const snap = {
    w: s.worldSeed, a: s.ascension, age: s.ageIndex,
    t: r6(s.elapsed), ta: r6(s.ageElapsed), ak: s.ageKills,
    p: [r6(s.px), r6(s.py), r6(s.dashT), r6(s.dashCd), r6(s.iframe)],
    b: [r6(b.hp), r6(b.maxHp), r6(b.speed), r6(b.damageMul), r6(b.cooldownMul), r6(b.pickupR), r6(b.regen), r6(b.knowledgeMul), b.bonusProjectiles, b.bonusGuardians, b.bonusAura, b.bonusOrbit, b.bonusMines, b.beamUnlocked ? 1 : 0],
    lvl: [s.level, r6(s.xp), s.xpNext, r6(s.knowledgeTotal), s.pendingLevels, s.draftOpen ? 1 : 0],
    o: [...s.owned].sort(), bt: [...s.breakthroughs].sort(),
    ws: [s.weaponStage.kinetic, s.weaponStage.energy, s.weaponStage.defense, s.weaponStage.field],
    tm: [r6(s.spawnT), r6(s.eliteT), r6(s.mineT), r6(s.auraT), r6(s.weaponCd.kinetic), r6(s.weaponCd.energy), r6(s.weaponCd.defense), r6(s.weaponCd.field), r6(s.guardianAng), r6(s.orbitAng)],
    ch: [...s.chunksWorld].sort(), po: [...s.poisWorld].sort(),
    bs: [s.bossSpawned ? 1 : 0, s.ascendReady ? 1 : 0, s.bossIndex, s.over ? 1 : 0],
    st: [s.stats.kills, s.stats.elites, s.stats.bosses, s.stats.techsTaken, s.stats.chunksTotal, s.stats.poisTotal, r6(s.stats.knowledgeEarned)],
    e: enemies, pr: projs, k: picks,
  };
  const str = JSON.stringify(snap);
  return fnv1a32(str).toString(16).padStart(8, "0");
}
