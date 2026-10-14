import type {RunState} from "../../core/sim/RunState";
import {activeFamilies,originById} from "../../core/progression/origins";
import {getWeaponStage} from "../../core/combat/weapons";
import {legacyDefById} from "../../core/progression/legacies";
import {t} from "../../i18n/i18n";
import type {EnKeys} from "../../i18n/en";
import {COMBAT_ASSETS} from "../assets/combatAssets";
import {originRow} from "../render/combatSpriteIdentity";
import {BREAKTHROUGHS} from "../../core/tech/synergy";
export class AbilityLoadout {
 private entries=new Map<string,HTMLButtonElement>();
 readonly node:HTMLElement;
 constructor(){this.node=document.createElement("section");this.node.id="ability-loadout";this.node.setAttribute("aria-label",t("ui.loadout"));}
 update(s:RunState):void {
  const origin=originById(s.originId);
  const rows:Array<{id:string;name:string;description:string;frame:number}>=[{id:"origin",name:`${t(origin.ability.nameKey)} [F]${s.abilityCd>0?` · ${Math.ceil(s.abilityCd)}s`:""}`,description:t(origin.ability.descKey),frame:originRow(s.originId)*6+s.ageIndex}];
  for(const family of activeFamilies(s.originId,s.expansionFamily)){
   const stage=getWeaponStage(family,s.weaponStage[family]);
   rows.push({id:family,name:t(stage.nameKey as EnKeys),description:`${t(`family.${family}` as EnKeys)} · ${t(`power.${stage.archetype}` as EnKeys)}`,frame:originRow(s.originId)*6+s.weaponStage[family]});
  }
  for(const id of s.legacies){const def=legacyDefById(id);if(def)rows.push({id:`legacy-${id}`,name:t(def.nameKey),description:`${t("power.inherited")} · ${t(def.descKey)}`,frame:originRow(s.originId)*6+5});}
  const families=activeFamilies(s.originId,s.expansionFamily);
  if(s.build.chainUnlocked&&families.includes("energy"))rows.push({id:"conduction",name:t("tech.conduction.name"),description:t("tech.conduction.description"),frame:originRow(s.originId)*6+4});
  if(s.build.relayUnlocked)rows.push({id:"relay",name:t("tech.relay.name"),description:t("tech.relay.description"),frame:originRow(s.originId)*6+3});
  for(const id of s.breakthroughs){const def=BREAKTHROUGHS.find(d=>d.id===id);if(def)rows.push({id:`synergy-${id}`,name:t(def.titleKey),description:t(def.descriptionKey),frame:originRow(s.originId)*6+5});}
  if(s.build.regen>0)rows.push({id:"regen",name:`${t("effect.regenAdd")}: ${s.build.regen.toFixed(1)}`,description:t("effect.regenAdd"),frame:originRow(s.originId)*6+2});
  if(s.build.bonusOrbit>0&&(families.includes("field")||families.includes("defense")&&getWeaponStage("defense",s.weaponStage.defense).archetype==="orbit"))rows.push({id:"bonus-orbit",name:`${t("power.orbit")} +${s.build.bonusOrbit}`,description:t("power.orbitBonus"),frame:originRow(s.originId)*6+s.ageIndex});
  if(s.build.bonusAura>0&&families.includes("energy"))rows.push({id:"bonus-aura",name:t("power.aura"),description:t("power.auraBonus"),frame:originRow(s.originId)*6+s.ageIndex});
  const live=new Set(rows.map(r=>r.id));for(const [id,node] of this.entries)if(!live.has(id)){node.remove();this.entries.delete(id);}
  for(const row of rows){
   let button=this.entries.get(row.id);
   if(!button){button=document.createElement("button");button.type="button";button.className="loadout-power";button.dataset.power=row.id;this.entries.set(row.id,button);this.node.append(button);}
   const label=`${row.name} — ${row.description}`;
   if(button.title===label)continue;
   button.title=label;button.setAttribute("aria-label",label);
   const icon=document.createElement("span");icon.className="loadout-icon";icon.style.backgroundImage=`url("${COMBAT_ASSETS.equipment}")`;icon.style.backgroundPosition=`${-(row.frame%6)*40}px ${-Math.floor(row.frame/6)*40}px`;
   const text=document.createElement("span");text.textContent=row.name;button.replaceChildren(icon,text);
   if(button.classList.contains("expanded")){const small=document.createElement("small");small.textContent=row.description;button.append(small);}
   button.setAttribute("aria-expanded",String(button.classList.contains("expanded")));
   // Focus/click exposes the same description as hover, including touch users.
   button.onclick=()=>{button.classList.toggle("expanded");button.setAttribute("aria-expanded",String(button.classList.contains("expanded")));const detail=button.querySelector("small");if(detail)detail.remove();else{const small=document.createElement("small");small.textContent=row.description;button.append(small);}};
  }
 }
}
