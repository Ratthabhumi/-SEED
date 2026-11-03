import type{SimEvent}from'../../core/sim/SimEvent';
import type{WeaponFamily}from'../../core/combat/weapons';
export interface ImpactCue{family:WeaponFamily;shield:boolean;damage:number}
/** One actual contact per event batch; shield contact wins over ordinary HP. */
export function impactCue(events:readonly SimEvent[]):ImpactCue|undefined{
 let selected:ImpactCue|undefined;
 for(const e of events){if(e.type!=='weapon_impact'&&e.type!=='energy_impact')continue;
  const damage=e.hpDamage+e.shieldDamage;if(damage<=0)continue;
  const shield=e.shieldDamage>0;
  if(!selected||(shield&&!selected.shield)||(shield===selected.shield&&damage>selected.damage))selected={family:e.type==='weapon_impact'?e.family:'energy',shield,damage};
 }
 return selected;
}
export class ImpactSoundGate{
 private last=-Infinity;
 allow(time:number):boolean{if(!Number.isFinite(time)||time-this.last<.075)return false;this.last=time;return true;}
}
