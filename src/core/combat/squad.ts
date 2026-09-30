// Origin command squads + active abilities — pure defs.
// One small support group per origin (not an RTS army). Simulation owns
// positions/combat; renderer owns per-origin visuals; UI owns Q/E/R/F keys.
import type { OriginId } from "../progression/origins";
import type { EnKeys } from "../../i18n/en";

export type SquadMode = "follow" | "focus" | "hold";

export interface SimAlly {
  active: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  dmg: number;
  cd: number;
  /** Contact-damage immunity timer (canonical, decremented in squad update). */
  inv: number;
}

export const SQUAD_BASE_CAP = 2;
export const SQUAD_MAX = 6;
export const SQUAD_HP = 40;
export const SQUAD_DMG = 8;
export const SQUAD_SPEED = 260;
export const SQUAD_RANGE = 600;
export const SQUAD_CD = 0.9;

export const ORIGIN_SQUAD_NAME: Record<OriginId, EnKeys> = {
  hunters: "squad.hunters.name",
  engineers: "squad.engineers.name",
  resonant: "squad.resonant.name",
  sentinels: "squad.sentinels.name",
};

export type AbilityId = "volley" | "overdrive" | "nova" | "bulwark";

export interface AbilityDef {
  id: AbilityId;
  nameKey: EnKeys;
  descKey: EnKeys;
  cooldown: number;
}

export const ORIGIN_ABILITY: Record<OriginId, AbilityDef> = {
  hunters: { id: "volley", nameKey: "ability.volley.name", descKey: "ability.volley.description", cooldown: 25 },
  engineers: { id: "overdrive", nameKey: "ability.overdrive.name", descKey: "ability.overdrive.description", cooldown: 25 },
  resonant: { id: "nova", nameKey: "ability.nova.name", descKey: "ability.nova.description", cooldown: 25 },
  sentinels: { id: "bulwark", nameKey: "ability.bulwark.name", descKey: "ability.bulwark.description", cooldown: 30 },
};

export const OVERDRIVE_DURATION = 6;
export const NOVA_RADIUS = 260;
export const NOVA_DMG = 30;
export const VOLLEY_COUNT = 8;
export const VOLLEY_DMG = 12;
export const BULWARK_REPAIR = 50;
export const BULWARK_IFRAME = 2.5;

export function squadCap(militaryBonusSlots: number): number {
  return Math.min(SQUAD_MAX, SQUAD_BASE_CAP + militaryBonusSlots);
}
