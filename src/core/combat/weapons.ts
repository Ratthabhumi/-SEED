// Weapon families × 6 age tiers. Archetypes reuse the same projectile/aura/orbit systems.
export type WeaponFamily = "kinetic" | "energy" | "defense" | "field";
export type Archetype = "projectile" | "beam" | "aura" | "orbit" | "summon" | "mine";

export interface WeaponStage {
  nameKey: string;
  archetype: Archetype;
  damage: number;
  cooldown: number;
  count: number;
  speed: number;
  radius: number;
  color: number;
}

export const WEAPON_TIERS: Record<WeaponFamily, WeaponStage[]> = {
  kinetic: [
    { nameKey: "weapon.kinetic.0", archetype: "projectile", damage: 12, cooldown: 0.9, count: 1, speed: 420, radius: 6, color: 0xd8c49a },
    { nameKey: "weapon.kinetic.1", archetype: "projectile", damage: 14, cooldown: 0.8, count: 1, speed: 460, radius: 6, color: 0xc9a227 },
    { nameKey: "weapon.kinetic.2", archetype: "projectile", damage: 16, cooldown: 0.7, count: 2, speed: 500, radius: 6, color: 0xb8c4d0 },
    { nameKey: "weapon.kinetic.3", archetype: "projectile", damage: 20, cooldown: 0.45, count: 2, speed: 560, radius: 6, color: 0x8a8f98 },
    { nameKey: "weapon.kinetic.4", archetype: "projectile", damage: 34, cooldown: 0.8, count: 2, speed: 800, radius: 7, color: 0x7fd4ff },
    { nameKey: "weapon.kinetic.5", archetype: "beam", damage: 90, cooldown: 1.6, count: 1, speed: 0, radius: 14, color: 0xbfe9ff },
  ],
  energy: [
    { nameKey: "weapon.energy.0", archetype: "projectile", damage: 10, cooldown: 1.0, count: 1, speed: 360, radius: 7, color: 0xff9a3c },
    { nameKey: "weapon.energy.1", archetype: "projectile", damage: 13, cooldown: 0.9, count: 1, speed: 380, radius: 8, color: 0xff7b1c },
    { nameKey: "weapon.energy.2", archetype: "aura", damage: 8, cooldown: 0.5, count: 1, speed: 0, radius: 90, color: 0xffb03c },
    { nameKey: "weapon.energy.3", archetype: "projectile", damage: 18, cooldown: 0.35, count: 2, speed: 480, radius: 7, color: 0xffc93c },
    { nameKey: "weapon.energy.4", archetype: "beam", damage: 45, cooldown: 1.2, count: 1, speed: 0, radius: 12, color: 0xc07fff },
    { nameKey: "weapon.energy.5", archetype: "beam", damage: 110, cooldown: 1.8, count: 1, speed: 0, radius: 16, color: 0xfff07f },
  ],
  defense: [
    { nameKey: "weapon.defense.0", archetype: "orbit", damage: 10, cooldown: 0.4, count: 1, speed: 2.4, radius: 70, color: 0x9fe08a },
    { nameKey: "weapon.defense.1", archetype: "orbit", damage: 12, cooldown: 0.4, count: 2, speed: 2.4, radius: 78, color: 0x9fe08a },
    { nameKey: "weapon.defense.2", archetype: "summon", damage: 14, cooldown: 1.4, count: 1, speed: 300, radius: 8, color: 0x7fb8ff },
    { nameKey: "weapon.defense.3", archetype: "summon", damage: 16, cooldown: 1.0, count: 2, speed: 340, radius: 8, color: 0x7fb8ff },
    { nameKey: "weapon.defense.4", archetype: "summon", damage: 22, cooldown: 0.8, count: 3, speed: 420, radius: 8, color: 0x9fd8ff },
    { nameKey: "weapon.defense.5", archetype: "summon", damage: 40, cooldown: 1.0, count: 3, speed: 520, radius: 10, color: 0xd0f0ff },
  ],
  field: [
    { nameKey: "weapon.field.0", archetype: "mine", damage: 22, cooldown: 1.6, count: 1, speed: 0, radius: 60, color: 0xc9b458 },
    { nameKey: "weapon.field.1", archetype: "mine", damage: 26, cooldown: 1.5, count: 2, speed: 0, radius: 62, color: 0xc9b458 },
    { nameKey: "weapon.field.2", archetype: "mine", damage: 40, cooldown: 1.4, count: 2, speed: 0, radius: 70, color: 0xff6b4a },
    { nameKey: "weapon.field.3", archetype: "aura", damage: 14, cooldown: 0.5, count: 1, speed: 0, radius: 110, color: 0x7fd4ff },
    { nameKey: "weapon.field.4", archetype: "orbit", damage: 26, cooldown: 0.5, count: 3, speed: 1.8, radius: 120, color: 0xb48cff },
    { nameKey: "weapon.field.5", archetype: "aura", damage: 60, cooldown: 0.8, count: 1, speed: 0, radius: 150, color: 0x1a1a2e },
  ],
};

export function getWeaponStage(family: WeaponFamily, ageIndex: number): WeaponStage {
  const tiers = WEAPON_TIERS[family];
  const idx = Math.max(0, Math.min(tiers.length - 1, ageIndex));
  return tiers[idx] as WeaponStage;
}
