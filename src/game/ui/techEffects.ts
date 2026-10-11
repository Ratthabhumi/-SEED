import type { TechEffect } from "../../core/tech/graph";
import type { EnKeys } from "../../i18n/en";
import { t } from "../../i18n/i18n";

const LABELS: Record<TechEffect["kind"], EnKeys> = {
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
    if (effect.kind === "beamAdd" || effect.kind === "weaponEvolve") return label;
    const percent = effect.kind.endsWith("Mul");
    const amount = Number((effect.value * (percent ? 100 : 1)).toFixed(2));
    return `${label} ${amount >= 0 ? "+" : ""}${amount}${percent ? "%" : ""}`;
  }).join(" · ");
}
