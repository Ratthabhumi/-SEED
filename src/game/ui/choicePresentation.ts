import type {TechNode,TechEffect} from '../../core/tech/graph';import type {RunState} from '../../core/sim/RunState';
import {combatChoicePreview} from './combatChoicePreview';import {equippedFamilies} from '../../core/combat/weaponInstances';import {t} from '../../i18n/i18n';import type {EnKeys} from '../../i18n/en';
export function choicePresentation(n:TechNode,effects:readonly TechEffect[],s:RunState){
 const family=n.weaponFamily??effects.find(e=>e.family)?.family??(['kinetic','energy','field','defense']as const).find(f=>n.tags.includes(f))??equippedFamilies(s)[0]!;
 const facts=combatChoicePreview(s,effects),pattern=facts.find(f=>!['hitDamage','attackInterval'].includes(f.kind));
 const key=n.weaponFamily?'new':n.web?.kind==='weave'?'synergy':pattern?'upgrade':'passive';let description='';let outcome='';
 if(n.weaponFamily){description=t(('weapon.brief.'+family)as EnKeys);outcome=`${s.weapons.length}/3 → ${s.weapons.length+1}/3`;}
 else if(pattern){const amount=Math.max(0,pattern.after-pattern.before);description=t(('choice.'+pattern.kind)as EnKeys).replace('{n}',String(amount));outcome=pattern.kind==='chain'||pattern.kind==='beam'?t('ui.active'):`${pattern.before} → ${pattern.after}`;}
 else{const first=effects[0];const percent=first?.kind.endsWith('Mul');const amount=first?Math.abs(first.value*(percent?100:1)):0;description=t(('choice.'+(first?.kind??'technology'))as EnKeys).replace('{n}',String(Number(amount.toFixed(1))));if(description.startsWith('choice.'))description=t(n.descriptionKey as EnKeys);const fact=facts[0];if(fact)outcome=`${Number(fact.before.toFixed(2))} → ${Number(fact.after.toFixed(2))}${fact.kind==='attackInterval'?'s':''}`;}
 return {family,kind:key,description,outcome};
}
