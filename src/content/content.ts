// Authored content data: enemy lineages (skins per age), biomes, anomalies, civ layers.
// Tuning lives here — systems in core/ stay generic.
import type { EnemyFamily } from "../core/director/director";
import type { AgeId } from "../core/tech/graph";
import type { BiomeId } from "../core/world/biome";

export const ENEMY_LINEAGE: Record<EnemyFamily, { names: Record<AgeId, string>; color: Record<AgeId, number>; hp: number; speed: number; dmg: number; radius: number }> = {
  chaser: {
    names: { stone: "Wild Wolf", bronze: "Raider", iron: "Legionnaire", industrial: "Assault Trooper", atomic: "Combat Drone", space: "Alien Hunter" },
    color: { stone: 0xb0653a, bronze: 0xc9852e, iron: 0x9aa3ad, industrial: 0x5a6b7d, atomic: 0x53e0c8, space: 0xb45cff },
    hp: 22, speed: 120, dmg: 8, radius: 14,
  },
  ranged: {
    names: { stone: "Slinger", bronze: "Archer", iron: "Crossbow", industrial: "Rifleman", atomic: "Laser Drone", space: "Void Sniper" },
    color: { stone: 0x7fae5c, bronze: 0x6fa04e, iron: 0x7a6a53, industrial: 0x4e6e8e, atomic: 0x53c8e0, space: 0x7a5cff },
    hp: 16, speed: 95, dmg: 7, radius: 12,
  },
  tank: {
    names: { stone: "Boar", bronze: "Shield Warrior", iron: "Knight", industrial: "Armored Vehicle", atomic: "Mech", space: "Bio Titan" },
    color: { stone: 0x8a5a44, bronze: 0x8c6a2e, iron: 0x707880, industrial: 0x3e4a56, atomic: 0x3a7d8c, space: 0x5c2e8c },
    hp: 70, speed: 62, dmg: 14, radius: 20,
  },
  swarm: {
    names: { stone: "Rat Pack", bronze: "Locust", iron: "Mite Swarm", industrial: "Scrap Mite", atomic: "Nano Swarm", space: "Void Mote" },
    color: { stone: 0xa89a6a, bronze: 0xb0a04a, iron: 0x909060, industrial: 0x707a80, atomic: 0x60d0a0, space: 0x9040ff },
    hp: 8, speed: 150, dmg: 5, radius: 9,
  },
};

export const BIOME_STYLE: Record<BiomeId, { ground: number; groundAlt: number; accent: number; nameKey: string }> = {
  verdant: { ground: 0x1d3a24, groundAlt: 0x24492c, accent: 0x4caf50, nameKey: "biome.verdant" },
  arid: { ground: 0x3a2f1d, groundAlt: 0x473a24, accent: 0xffc93c, nameKey: "biome.arid" },
  tundra: { ground: 0x22303a, groundAlt: 0x2a3c48, accent: 0xbfe9ff, nameKey: "biome.tundra" },
  badlands: { ground: 0x3a1f1f, groundAlt: 0x482727, accent: 0xff6b4a, nameKey: "biome.badlands" },
};

/** Civilization decorative layer per age (procedural shapes, not a sim). */
export const CIV_LAYER: Record<AgeId, { color: number; density: number }> = {
  stone: { color: 0xff9a3c, density: 3 },
  bronze: { color: 0xc9a227, density: 4 },
  iron: { color: 0xb8c4d0, density: 5 },
  industrial: { color: 0x8a8f98, density: 6 },
  atomic: { color: 0x53e0c8, density: 7 },
  space: { color: 0xbfe9ff, density: 8 },
};
