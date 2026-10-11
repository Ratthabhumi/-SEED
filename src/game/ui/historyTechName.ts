import type { TechNode } from "../../core/tech/graph";
import { t } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";

/** IDs remain canonical evidence; only the player-facing history is translated. */
export function historyTechName(id: string, nodes: readonly TechNode[], previousWorld = false): string {
  const node = previousWorld ? undefined : nodes.find(n => n.id === id);
  if (node) return t(node.titleKey as EnKeys) + (node.web?.kind === "frontier" ? ` ${node.web.depth}.${node.web.slot + 1}` : "");
  const fallback = /^fb-(dmg|hp|spd)-\d+$/.exec(id);
  if (fallback) return t(`tech.fallback.${fallback[1]}.name` as EnKeys);
  // Ascension replaces the world graph while preserving run history.
  return t("chronicle.previousTech");
}

/** Child-world root grants precede the explicit Ascension marker in canonical history. */
export function currentWorldHistoryStart(history: readonly {kind:string;label:string}[]): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]!.kind !== "ascension") continue;
    for (let j = i - 1; j >= 0; j--) {
      if (history[j]!.kind === "tech" && history[j]!.label === "spine-tools") return j;
      if (history[j]!.kind === "ascension") break;
    }
    return i;
  }
  return 0; // FIFO may have dropped the boundary: remaining decisions are current.
}
