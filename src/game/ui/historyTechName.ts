import type { TechNode } from "../../core/tech/graph";
import { t } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";

/** IDs remain canonical evidence; only the player-facing history is translated. */
export function historyTechName(id: string, nodes: readonly TechNode[]): string {
  const node = nodes.find(n => n.id === id);
  if (node) return t(node.titleKey as EnKeys) + (node.web?.kind === "frontier" ? ` ${node.web.depth}.${node.web.slot + 1}` : "");
  const fallback = /^fb-(dmg|hp|spd)-\d+$/.exec(id);
  if (fallback) return t(`tech.fallback.${fallback[1]}.name` as EnKeys);
  // Ascension replaces the world graph while preserving run history.
  return t("chronicle.previousTech");
}
