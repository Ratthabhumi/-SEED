import hunters from "../../../assets/seed/actors/hunters.svg";
import engineers from "../../../assets/seed/actors/engineers.svg";
import resonant from "../../../assets/seed/actors/resonant.svg";
import sentinels from "../../../assets/seed/actors/sentinels.svg";
import chaser from "../../../assets/seed/actors/chaser.svg";
import ranged from "../../../assets/seed/actors/ranged.svg";
import tank from "../../../assets/seed/actors/tank.svg";
import swarm from "../../../assets/seed/actors/swarm.svg";
import boss from "../../../assets/seed/actors/boss.svg";
import bossV2 from "../../../assets/seed/actors/boss-v2.png";
import enemiesV2 from "../../../assets/seed/actors/enemies-v2.png";
import guardian from "../../../assets/seed/actors/guardian.svg";
/** Original editable MIT vector strips, cached once and sliced into gait frames. */
export const ACTOR_ASSETS = { hunters, engineers, resonant, sentinels, chaser, ranged, tank, swarm, boss, guardian } as const;
export type ActorId = keyof typeof ACTOR_ASSETS;
export const BOSS_ASSET_V2=bossV2;
export const ENEMIES_ASSET_V2=enemiesV2;
export function actorFor(origin: string): ActorId { return (["hunters","engineers","resonant","sentinels"] as string[]).includes(origin) ? origin as ActorId : "hunters"; }
