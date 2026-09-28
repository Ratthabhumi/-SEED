// Canonical progression operations. EXACTLY-ONCE multiplier semantics:
//
//   gainKnowledge(base, source): total = base * knowledgeMul()
//     -> xp += total, knowledgeTotal += total, stats[source] += total
//
// Callers must NEVER pre-multiply. A "+15% Knowledge" tech does what it says:
// it scales the single canonical gain, which feeds BOTH level XP and the
// civilization age-gate total (they are the same resource by design).
import type { TechEffect } from "../tech/graph";

/** Mutable build stats owned by the simulation. Applied by applyTechEffect. */
export interface EffectTarget {
  damageMul: number;
  maxHp: number;
  hp: number;
  speed: number;
  pickupR: number;
  cooldownMul: number;
  bonusProjectiles: number;
  bonusGuardians: number;
  bonusAura: number;
  bonusOrbit: number;
  bonusMines: number;
  beamUnlocked: boolean;
  regen: number;
  knowledgeMul: number;
}

export function defaultEffectTarget(): EffectTarget {
  return {
    damageMul: 1, maxHp: 100, hp: 100, speed: 220, pickupR: 90, cooldownMul: 1,
    bonusProjectiles: 0, bonusGuardians: 0, bonusAura: 0, bonusOrbit: 0,
    bonusMines: 0, beamUnlocked: false, regen: 0, knowledgeMul: 1,
  };
}

/** Single canonical effect application for techs AND breakthroughs. */
export function applyTechEffect(t: EffectTarget, e: TechEffect): void {
  switch (e.kind) {
    case "damageMul": t.damageMul *= 1 + e.value; break;
    case "maxHpAdd": t.maxHp += e.value; t.hp = Math.min(t.maxHp, t.hp + e.value); break;
    case "moveMul": t.speed *= 1 + e.value; break;
    case "pickupMul": t.pickupR *= 1 + e.value; break;
    case "cooldownMul": t.cooldownMul = Math.max(0.3, t.cooldownMul * (1 + e.value)); break;
    case "projectileAdd": t.bonusProjectiles += e.value; break;
    case "summonAdd": t.bonusGuardians += e.value; break;
    case "auraAdd": t.bonusAura += e.value; break;
    case "orbitAdd": t.bonusOrbit += e.value; break;
    case "mineAdd": t.bonusMines += e.value; break;
    case "beamAdd": t.beamUnlocked = true; break;
    case "regenAdd": t.regen += e.value; break;
    case "dashCdMul": break; // reserved
    case "knowledgeMul": t.knowledgeMul *= 1 + e.value; break;
    case "weaponEvolve": break; // handled by simulation (needs age/weapon tables)
  }
}

/** Exactly-once knowledge scaling. Pure — the simulation adds the result. */
export function scaleKnowledge(baseAmount: number, knowledgeMul: number): number {
  return Math.max(0, baseAmount) * Math.max(0, knowledgeMul);
}
