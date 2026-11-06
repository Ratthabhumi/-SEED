import {equippedFamilies} from '../../core/combat/weaponInstances';
import {previewTechEffects,type EffectTarget} from '../../core/sim/progression';
import {activeFamilies} from '../../core/progression/origins';
import {getWeaponStage,type WeaponFamily} from '../../core/combat/weapons';
import type {RunState} from '../../core/sim/RunState';
import {MAX_PROJ,MAX_MINES} from '../../core/sim/RunState';
import type {TechEffect} from '../../core/tech/graph';
type Kind='volley'|'chain'|'mines'|'orbit'|'guardians'|'aura'|'beam'|'hitDamage'|'attackInterval';
export interface CombatChoiceFact{family:WeaponFamily;kind:Kind;before:number;after:number;}
/** Read-only active weapon consequences; counts do not promise every shot hits. */
export function combatChoicePreview(s:Pick<RunState,'originId'|'expansionFamily'|'weaponStage'|'build'> & Partial<Pick<RunState,'weapons'>>,effects:readonly TechEffect[]):CombatChoiceFact[]{
 const next=previewTechEffects(s.build,effects),out:CombatChoiceFact[]=[];
 for(const family of equippedFamilies(s)){
  const st=getWeaponStage(family,s.weaponStage[family]);
  const values=(b:EffectTarget):Partial<Record<Kind,number>>=>{
   if(family==='kinetic')return st.archetype==='projectile'?{volley:Math.min(MAX_PROJ,Math.ceil(st.count+b.bonusProjectiles))}:{};
   if(family==='energy')return {chain:Number(b.chainUnlocked),beam:Number(st.archetype==='beam'||b.beamUnlocked),aura:st.archetype==='aura'||b.bonusAura>0?st.radius+b.bonusAura*30:0};
   if(family==='defense')return {orbit:st.archetype==='orbit'?Math.ceil(Math.max(1,st.count+b.bonusOrbit)):0,guardians:Math.min(6,Math.ceil((st.archetype==='summon'?st.count:0)+b.bonusGuardians))};
   return {mines:Math.min(MAX_MINES,Math.ceil(1+b.bonusMines)),orbit:st.archetype==='orbit'||b.bonusOrbit>0?Math.ceil(2+b.bonusOrbit):0,aura:st.archetype==='aura'||b.bonusAura>0?st.radius+b.bonusAura*30:0};
  };
  const before=values(s.build),after=values(next);
  for(const kind of Object.keys(before) as Kind[])if(before[kind]!==after[kind])out.push({family,kind,before:before[kind]!,after:after[kind]!});
  // Base attack values, before armor/crit/chain falloff; fixed mine/aura clocks are excluded.
  if(s.build.damageMul!==next.damageMul)out.push({family,kind:'hitDamage',before:st.damage*s.build.damageMul,after:st.damage*next.damageMul});
  const timed=family==='kinetic'||family==='energy'&&(st.archetype==='projectile'||st.archetype==='beam'||s.build.beamUnlocked)||family==='defense'&&(st.archetype==='summon'||s.build.bonusGuardians>0);
  const interval=(b:EffectTarget)=>st.cooldown*Math.max(.3,b.cooldownMul)*(family==='defense'?1.6:1);
  if(timed&&interval(s.build)!==interval(next))out.push({family,kind:'attackInterval',before:interval(s.build),after:interval(next)});
 }return out;
}
