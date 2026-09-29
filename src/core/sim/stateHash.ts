// Canonical state contract (P1-05).
//
// canonicalSnapshot() serializes EVERYTHING gameplay-relevant with canonical
// ordering (unordered structures sorted by stable identity):
//   player stats/position/velocity, HP, timers/cooldowns, age/progression,
//   Knowledge/XP/level, owned tech, breakthroughs, origin/expansion/legacies,
//   POI family claims, enemies, projectiles,
//   pickups, mines, boss state, pending drafts (+choice ids), world/ascension,
//   gameplay RNG stream snapshots, director timers.
// Excluded (presentation/cosmetic only): beam flash, spatial indices, scratch
// buffers, camera/DOM/audio/particles/debug state.
//
// Tests compare canonicalSnapshot() strings directly; hash() is a compact
// fnv1a hex for debugging/F3, NOT collision-proof evidence on its own.
import { fnv1a32 } from "../seed/hash";
import type { RunState } from "./RunState";
import type { RunRngStreams } from "../seed/runRng";

function r6(n: number): number {
  const v = Math.round(n * 1e6) / 1e6;
  return v === 0 ? 0 : v;
}

export interface RngSnapshots {
  event: readonly [number, number, number, number];
  enemy: readonly [number, number, number, number];
  draft: readonly [number, number, number, number];
  loot: readonly [number, number, number, number];
  boss: readonly [number, number, number, number];
}

export function snapshotStreams(streams: RunRngStreams): RngSnapshots {
  return {
    event: streams.event.snapshot(),
    enemy: streams.enemy.snapshot(),
    draft: streams.draft.snapshot(),
    loot: streams.loot.snapshot(),
    boss: streams.boss.snapshot(),
  };
}

export function canonicalSnapshot(s: RunState, rng: RngSnapshots): string {
  const enemies: string[] = [];
  for (const e of s.enemies) {
    if (!e.active) continue;
    enemies.push(
      [r6(e.x), r6(e.y), r6(e.hp), r6(e.shield), e.family, e.elite ? e.affix : "", e.boss ? 1 : 0,
        r6(e.speed), r6(e.dmg), r6(e.radius), e.xp, r6(e.flash), r6(e.shootT), r6(e.hitCd)].join(","),
    );
  }
  enemies.sort();
  const projs: string[] = [];
  for (const p of s.projs) {
    if (!p.active) continue;
    projs.push([r6(p.x), r6(p.y), r6(p.vx), r6(p.vy), r6(p.dmg), r6(p.radius), r6(p.life), p.friendly ? 1 : 0, p.src, p.color].join(","));
  }
  projs.sort();
  const picks: string[] = [];
  for (const k of s.pickups) {
    if (!k.active) continue;
    picks.push([r6(k.x), r6(k.y), r6(k.value)].join(","));
  }
  picks.sort();
  const mines: string[] = [];
  for (const m of s.mines) {
    if (!m.active) continue;
    mines.push([r6(m.x), r6(m.y), r6(m.dmg), r6(m.radius), r6(m.life)].join(","));
  }
  mines.sort();
  const b = s.build;
  const dmgSrc = Object.keys(s.damageBySource).sort().map((k) => `${k}:${r6(s.damageBySource[k] as number)}`);
  const snap = {
    id: [s.masterSeed, s.worldSeed, s.worldNonce, s.ascension, s.difficultyMul],
    age: [s.ageIndex, r6(s.elapsed), r6(s.ageElapsed), s.ageKills, s.highestAge],
    run: [r6(s.runElapsed), s.runHighestAge, r6(s.runKills)],
    p: [r6(s.px), r6(s.py), r6(s.vx), r6(s.vy), r6(s.dashT), r6(s.dashCd), r6(s.iframe)],
    b: [r6(b.hp), r6(b.maxHp), r6(b.speed), r6(b.damageMul), r6(b.cooldownMul), r6(b.pickupR), r6(b.regen), r6(b.knowledgeMul),
      b.bonusProjectiles, b.bonusGuardians, b.bonusAura, b.bonusOrbit, b.bonusMines, b.beamUnlocked ? 1 : 0],
    lvl: [s.level, r6(s.xp), s.xpNext, r6(s.knowledgeTotal), s.pendingLevels, s.draftOpen ? 1 : 0,
      s.draftChoices.map((n) => n.id).sort(), s.draftContext],
    o: [[...s.owned].sort(), [...s.ownedTags].sort(), [...s.breakthroughs].sort()],
    origin: [s.originId, s.expansionFamily, [...s.legacies].sort(), [...s.poiFamiliesClaimed].sort()],
    ws: [s.weaponStage.kinetic, s.weaponStage.energy, s.weaponStage.defense, s.weaponStage.field],
    tm: [r6(s.spawnT), r6(s.eliteT), r6(s.mineT), r6(s.auraT),
      r6(s.weaponCd.kinetic), r6(s.weaponCd.energy), r6(s.weaponCd.defense), r6(s.weaponCd.field),
      r6(s.guardianAng), r6(s.orbitAng)],
    world: [[...s.chunksWorld].sort(), [...s.poisWorld].sort()],
    boss: [s.bossSpawned ? 1 : 0, s.ascendReady ? 1 : 0, s.bossIndex, s.over ? 1 : 0],
    st: [s.stats.kills, s.stats.elites, s.stats.bosses, s.stats.techsTaken, s.stats.chunksTotal, s.stats.poisTotal, r6(s.stats.knowledgeEarned)],
    dmg: dmgSrc,
    e: enemies, pr: projs, k: picks, mn: mines,
    rng: [s.worldSeed, [...rng.event].join(","), [...rng.enemy].join(","), [...rng.draft].join(","),
      [...rng.loot].join(","), [...rng.boss].join(",")],
  };
  return JSON.stringify(snap);
}

/** Compact debug hash of the canonical snapshot (not collision-proof alone). */
export function stateHash(s: RunState, rng: RngSnapshots): string {
  return fnv1a32(canonicalSnapshot(s, rng)).toString(16).padStart(8, "0");
}
