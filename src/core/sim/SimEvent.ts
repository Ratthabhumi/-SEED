// Simulation → renderer events. Payloads are ids/keys/numbers only —
// the adapter maps them to toasts, sounds, and screen shake. No English here.
import type { AgeId } from "../tech/graph";
import type { POIType } from "../world/poi";
import type { WeaponFamily } from "../combat/weapons";

export type SimEvent =
  | { type: "draft_opened"; context: "level" | "poi" }
  | { type: "tech_selected"; techId: string }
  | { type: "breakthrough"; id: string }
  | { type: "age_reached"; age: AgeId }
  | { type: "poi_discovered"; poiType: POIType; knowledge: number }
  | { type: "poi_major"; poiType: POIType }
  | { type: "expansion_offered"; families: [WeaponFamily, WeaponFamily] }
  | { type: "expansion_unlocked"; family: WeaponFamily }
  | { type: "boss_warning" }
  | { type: "boss_killed" }
  | { type: "ascension_ready" }
  | { type: "legacy_granted"; id: string }
  | { type: "ascended"; worldSeed: string; ascension: number }
  | { type: "player_hurt"; damage: number }
  | { type: "player_died" }
  | { type: "enemy_killed"; elite: boolean; boss: boolean };
