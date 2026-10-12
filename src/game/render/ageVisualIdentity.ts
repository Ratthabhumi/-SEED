import type {SimProj} from '../../core/sim/RunState';
export const AGE_VISUAL_IDENTITY=[
 {id:'stone',material:'chipped stone/leather',form:'shard',trail:0},
 {id:'bronze',material:'cast bronze/early shields',form:'arrow',trail:4},
 {id:'iron',material:'forged plates/bolts',form:'bolt',trail:8},
 {id:'industrial',material:'mechanical packs/ballistics',form:'bullet',trail:12},
 {id:'atomic',material:'containment cells/plasma',form:'plasma',trail:18},
 {id:'space',material:'exosuits/photon conduits',form:'tracer',trail:24},
] as const;
export function projectileIdentity(p:SimProj){return AGE_VISUAL_IDENTITY[Math.max(0,Math.min(5,Math.floor(p.visualTier??0)))]!;}
export function projectileRole(p:SimProj):'energy'|'defense'|'squad'|'ability'|'kinetic' {
 if(p.src==='energy'||p.src==='defense'||p.src==='squad'||p.src==='ability')return p.src;
 return 'kinetic';
}
