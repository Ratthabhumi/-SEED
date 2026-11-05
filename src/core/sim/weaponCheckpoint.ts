import type {RunState} from './RunState';
import {WEAPON_FAMILIES,WEAPON_SLOT_CAP} from '../combat/weaponInstances';
/** Bounded corruption validation, not a trusted-client/anti-cheat mechanism. */
export function validCheckpointState(value:unknown,template:RunState):value is RunState {
 let count=0;const tree=(v:any,depth=0):boolean=>{if(++count>150000||depth>24)return false;if(v===null||typeof v==='boolean')return true;if(typeof v==='number')return Number.isFinite(v)&&Math.abs(v)<=1e12;if(typeof v==='string')return v.length<=65536;if(typeof v!=='object')return false;if(Array.isArray(v))return v.length<=10000&&v.every(x=>tree(x,depth+1));return Object.keys(v).every(k=>!['__proto__','constructor','prototype'].includes(k)&&tree(v[k],depth+1));};
 if(!value||!tree(value)||typeof value!=='object')return false;const s=value as RunState;
 for(const k of Object.keys(template) as (keyof RunState)[]){const t=template[k],v=s[k];if(t===null)continue;if(Array.isArray(t)){if(!Array.isArray(v))return false;}else if(typeof t!==typeof v)return false;}
 if(!s.build||!s.weaponStage||!s.weaponCd||!s.weaponRig||!s.stats||!s.worldLaws||!Number.isInteger(s.weaponSerial)||s.weaponSerial<s.weapons.length)return false;
 if(s.over||!Number.isInteger(s.ageIndex)||s.ageIndex<0||s.ageIndex>5||!Number.isInteger(s.ascension)||s.ascension<0)return false;
 for(const key of ['enemies','projs','pickups','mines']as const){if(s[key].length!==template[key].length)return false;const t:any=template[key][0];for(const item of s[key]){if(!item||typeof item!=='object')return false;for(const k of Object.keys(t))if(typeof (item as any)[k]!==typeof t[k])return false;}}
 if(!s.weapons.length||s.weapons.length>WEAPON_SLOT_CAP||new Set(s.weapons.map(w=>w.id)).size!==s.weapons.length||new Set(s.weapons.map(w=>w.family)).size!==s.weapons.length)return false;
 for(const [i,w]of s.weapons.entries()){if((i===0&&w.family!==template.weapons[0]!.family)||(i>0&&w.rig?.orbitSlot!==i)||w.slot!==i||w.owner!=='player'||!WEAPON_FAMILIES.includes(w.family)||typeof w.id!=='string'||!w.id||typeof w.auraCd!=='number'||!w.rig||!['hand','float'].includes(w.rig.mode))return false;for(const k of ['x','y','heading','firedAt']as const)if(typeof w.rig[k]!=='number')return false;if(typeof w.rig.flipY!=='boolean')return false;}
 if(JSON.stringify(s.weapons[0]!.rig)!==JSON.stringify(s.weaponRig))return false;
 for(const f of WEAPON_FAMILIES)if(!Number.isInteger(s.weaponStage[f])||s.weaponStage[f]<0||s.weaponStage[f]>5||typeof s.weaponCd[f]!=='number'||s.weaponCd[f]<0)return false;
 for(const k of Object.keys(template.build))if(typeof (s.build as any)[k]!==typeof (template.build as any)[k])return false;
 if(s.techNodes.length>512||s.squad.length>128)return false;
 for(const n of s.techNodes)if(!n||typeof n.id!=='string'||typeof n.titleKey!=='string'||typeof n.descriptionKey!=='string'||!['stone','bronze','iron','industrial','atomic','space'].includes(n.age)||!['science','warfare','industry','culture'].includes(n.domain)||!['common','uncommon','rare','mythic'].includes(n.rarity)||typeof n.weight!=='number'||!Array.isArray(n.effects)||!Array.isArray(n.prerequisites)||!Array.isArray(n.tags)||!Array.isArray(n.synergyTags)||!Array.isArray(n.exclusions)||n.weaponFamily&&!WEAPON_FAMILIES.includes(n.weaponFamily))return false;
 return true;
}
