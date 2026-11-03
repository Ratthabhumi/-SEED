import type {RunState} from '../../core/sim/RunState';
import {NOVA_RADIUS} from '../../core/combat/squad';
/** Optional advice, never a tutorial gate or an automatic ability activation. */
export function powerOpportunity(s:RunState):boolean{
 if(s.over||s.abilityCd>0)return false;
 let nearby=0,insideNova=0,recovery=false;
 for(const e of s.enemies){if(!e.active)continue;const d=Math.hypot(e.x-s.px,e.y-s.py);if(d<600){nearby++;if(e.boss&&e.encounter?.phase==='recover')recovery=true;}if(d<=NOVA_RADIUS)insideNova++;}
 if(s.stats.abilityUses===0)return nearby>0;
 switch(s.originId){
  case 'hunters':return nearby>=3;
  case 'engineers':return recovery;
  case 'resonant':return insideNova>=3;
  case 'sentinels':return nearby>0&&s.build.hp<s.build.maxHp*.7;
  default:return false;
 }
}
