import type {RunState} from '../../core/sim/RunState';
import type {BossEncounter} from '../../core/combat/bossEncounter';
/** Read-only adapter: an assault target is distinct from the current alternating strike. */
export function bossThreat(s:RunState){
 const boss=s.enemies.find(e=>e.active&&e.boss);
 const encounter=boss?.encounter;
 const target=encounter?.outpostId?s.territories.find(t=>!t.disabled&&t.poiId===encounter.outpostId):undefined;
 // Canonical clearing happens only at a safe phase: the final warning/attack
 // and full recovery remain real even after the displayed budget reaches zero.
 return target&&encounter?{boss:boss!,encounter,target}:undefined;
}
export function bossStrikeTargetsBase(a:BossEncounter):boolean{
 const cycle=a.phase==='attack'||a.phase==='recover'?a.cycle-1:a.cycle;
 return !!a.outpostId&&cycle>=0&&cycle%2===0;
}
