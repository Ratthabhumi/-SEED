import {previewTechEffects,type EffectTarget} from "../../core/sim/progression";
import type { TechEffect } from "../../core/tech/graph";
import type { EnKeys } from "../../i18n/en";
import { t } from "../../i18n/i18n";

const LABELS: Record<TechEffect["kind"], EnKeys> = {
  chainAdd: "effect.chainAdd", relayAdd: "effect.relayAdd", relayChain: "effect.relayChain",
  damageMul: "effect.damageMul", maxHpAdd: "effect.maxHpAdd", moveMul: "effect.moveMul",
  pickupMul: "effect.pickupMul", cooldownMul: "effect.cooldownMul", projectileAdd: "effect.projectileAdd",
  auraAdd: "effect.auraAdd", orbitAdd: "effect.orbitAdd", summonAdd: "effect.summonAdd",
  mineAdd: "effect.mineAdd", beamAdd: "effect.beamAdd", regenAdd: "effect.regenAdd",
  dashCdMul: "effect.dashCdMul", knowledgeMul: "effect.knowledgeMul", weaponEvolve: "effect.weaponEvolve",
};

/** Resolved canonical values, including quality. No rounding to whole percents. */
export function effectSummary(effects: readonly TechEffect[]): string {
  return effects.map((effect) => {
    const label = t(LABELS[effect.kind]);
    if (["chainAdd","relayAdd","relayChain"].includes(effect.kind) || effect.kind === "beamAdd" || effect.kind === "weaponEvolve") return label;
    const percent = effect.kind.endsWith("Mul");
    const amount = Number((effect.value * (percent ? 100 : 1)).toFixed(2));
    return `${label} ${amount >= 0 ? "+" : ""}${amount}${percent ? "%" : ""}`;
  }).join(" · ");
}

const FIELDS:Partial<Record<TechEffect["kind"],keyof EffectTarget>>={
 damageMul:"damageMul",maxHpAdd:"maxHp",moveMul:"speed",pickupMul:"pickupR",cooldownMul:"cooldownMul",projectileAdd:"bonusProjectiles",summonAdd:"bonusGuardians",auraAdd:"bonusAura",orbitAdd:"bonusOrbit",mineAdd:"bonusMines",beamAdd:"beamUnlocked",regenAdd:"regen",knowledgeMul:"knowledgeMul",chainAdd:"chainUnlocked",relayAdd:"relayUnlocked",relayChain:"relayChain"
};
export function effectBeforeAfter(build:EffectTarget,effects:readonly TechEffect[]):string {
 const next=previewTechEffects(build,effects),seen=new Set<keyof EffectTarget>();
 const format=(v:number|boolean)=>typeof v==="boolean"?t(v?"ui.active":"ui.inactive"):String(Number(v.toFixed(2)));
 return effects.flatMap(effect=>{
 const field=FIELDS[effect.kind];if(!field||seen.has(field))return [];seen.add(field);
 return [t(LABELS[effect.kind])+": "+format(build[field])+" → "+format(next[field])];
 }).join(" · ");
}
