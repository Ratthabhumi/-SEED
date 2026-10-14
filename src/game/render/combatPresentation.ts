import type {WeaponFamily} from "../../core/combat/weapons";
export type CombatShape="arrow"|"mechanical"|"fork"|"prism"|"guardian"|"trap";
const originColors:Record<string,number>={hunters:0xffd166,engineers:0xe8bb84,resonant:0x9ac5ff,sentinels:0x74dfdb};
const materials=[0xbaa284,0xd4a36f,0xcbd6dc,0xc89b68,0x8ce5ec,0xb9a0ef];
/** Advisory artwork derived from real source/tier; cannot add a weapon or hit. */
export function combatPresentation(origin:string,family:WeaponFamily,tier:number){
  const stage=Math.max(0,Math.min(5,Math.floor(tier)));
  const shape:CombatShape=family==="field"?"trap":family==="defense"?"guardian":family==="kinetic"?(origin==="hunters"&&stage<2?"arrow":"mechanical"):(origin==="resonant"?"fork":"prism");
  return {origin,shape,stage,color:originColors[origin]??0xffd166,material:materials[stage]!,
    tail:Math.min(24,8+stage*3),weaponLength:18+stage*2};
}

export const WORLD_SCALE={hero:112,squad:56,guardian:48,outpost1:176,outpost2:208,
  enemy:{swarm:52,chaser:68,ranged:76,tank:92},boss:240} as const;
export function gameZoom(height:number){return Math.max(1,Math.min(1.25,height/900));}
export function enemyArtSize(family:keyof typeof WORLD_SCALE.enemy,radius:number,elite:boolean,boss:boolean){
  if(boss)return Math.max(WORLD_SCALE.boss,radius*3);
  return Math.max(WORLD_SCALE.enemy[family]*(elite?1.4:1),radius*3);
}
