// Simulation → renderer events. Payloads are ids/keys/numbers only —
// the adapter maps them to toasts, sounds, and screen shake. No English here.
import type { AgeId } from "../tech/graph";
import type { POIType } from "../world/poi";
import type { WeaponFamily } from "../combat/weapons";
import type { OutpostSpec } from "../world/territory";
import type { SquadMode } from "../combat/squad";

export type SimEvent =
  | { type: "draft_opened"; context: "level" | "poi" }
  | { type: "tech_selected"; techId: string }
  | { type: "draft_reserved"; techId: string }
  | { type: "draft_rerolled"; rerollsLeft: number }
  | { type: "draft_skipped" }
  | { type: "pin_set"; target: string }
  | { type: "breakthrough"; id: string }
  | { type: "age_reached"; age: AgeId }
  | { type: "mission_complete"; age: AgeId }
  | { type: "poi_discovered"; poiType: POIType; knowledge: number }
  | { type: "poi_major"; poiType: POIType }
  | { type: "territory_claimed"; poiId: string; poiType: POIType }
  | { type: "outpost_spec"; poiId: string; spec: OutpostSpec }
  | { type: "outpost_upgraded"; poiId: string }
  | { type: "outpost_lost"; poiId: string }
  | { type: "outpost_repaired"; poiId: string }
  | { type: "raid_incoming"; poiId: string; seconds: number }
  | { type: "raid_repelled"; poiId: string }
  | { type: "squad_command"; mode: SquadMode }
  | { type: "ability_used"; id: string }
  | { type: "expansion_offered"; families: [WeaponFamily, WeaponFamily] }
  | { type: "expansion_unlocked"; family: WeaponFamily }
  | { type: "boss_warning" }
  | { type: "boss_killed" }
  | { type: "ascension_ready" }
  | { type: "legacy_granted"; id: string }
  | { type: "ascended"; worldSeed: string; ascension: number }
  | { type: "player_hurt"; damage: number }
  | { type: "player_died" }
  | { type: "enemy_killed"; elite: boolean; boss: boolean; x: number; y: number };
