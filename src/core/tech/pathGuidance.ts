import { AGES, type TechNode } from "./graph";
import { BREAKTHROUGHS } from "./synergy";
import { eligibleTech } from "./web";

export type PathRelation = "complete" | "required" | "progress" | "indirect" | "unrelated";
export interface PathContext {
  target: string;
  owned: readonly string[];
  tags: readonly string[];
  unlocked: readonly string[];
  ageIndex: number;
  families: ReadonlySet<string>;
}
export interface PathGuidance {
  status: "none" | "active" | "complete" | "invalid";
  titleKey: string;
  have: number;
  need: number;
  next: string[];
  missingTags: string[];
  blockers: Array<"age" | "family" | "excluded" | "missing">;
  relations: Record<string, PathRelation>;
}

/** Derived advice only: no draws, mutation, quality or offer-weight changes. */
export function pathGuidance(nodes: readonly TechNode[], ctx: PathContext): PathGuidance {
  const out: PathGuidance = {
    status: ctx.target ? "invalid" : "none", titleKey: "", have: 0, need: 0,
    next: [], missingTags: [], blockers: [], relations: {},
  };
  if (!ctx.target) return out;
  const byId = new Map(nodes.map(n => [n.id, n]));
  const owned = new Set(ctx.owned);
  const tags = new Set(ctx.tags);
  const target = byId.get(ctx.target);
  const combo = BREAKTHROUGHS.find(b => b.id === ctx.target);
  if (!target && !combo) return out;
  out.titleKey = target?.titleKey ?? combo!.titleKey;
  if (!target && (ctx.unlocked.includes(combo!.id) || combo!.requires.every(t => tags.has(t)))) {
    out.status = "complete";
    out.have = out.need = combo!.requires.length;
    return out;
  }
  out.status = "active";
  const direct = new Set<string>();
  const indirect = new Set<string>();
  const all = new Set<string>();
  const addBlocker = (cause: PathGuidance["blockers"][number]) => {
    if (!out.blockers.includes(cause)) out.blockers.push(cause);
  };
  const visit = (id: string, set: Set<string>, seen = new Set<string>()) => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = byId.get(id);
    if (!node) { addBlocker("missing"); return; }
    all.add(id);
    if (!owned.has(id)) set.add(id);
    // Traverse owned ancestors too: progress denominator must remain stable.
    for (const parent of node.prerequisites) visit(parent, set, seen);
  };
  if (target) {
    visit(target.id, direct);
    out.need = all.size;
    out.have = [...all].filter(id => owned.has(id)).length;
    if (owned.has(target.id)) { out.status = "complete"; return out; }
  } else {
    out.missingTags = combo!.requires.filter(t => !tags.has(t));
    out.need = combo!.requires.length;
    out.have = out.need - out.missingTags.length;
    for (const node of nodes) {
      if (owned.has(node.id)) continue;
      if (![...node.tags, ...node.synergyTags].some(t => out.missingTags.includes(t))) continue;
      // Permanently excluded providers cannot justify an indirect recommendation.
      if (node.exclusions.some(id => owned.has(id))) continue;
      direct.add(node.id);
      for (const parent of node.prerequisites) visit(parent, indirect);
    }
  }
  const relevant = [...direct, ...indirect]
    .map(id => byId.get(id))
    .filter((node): node is TechNode => !!node && !owned.has(node.id));
  const causes = (node: TechNode): PathGuidance["blockers"] => {
    const result: PathGuidance["blockers"] = [];
    if (AGES.indexOf(node.age) > ctx.ageIndex + (node.web ? 0 : 1)) result.push("age");
    if (node.effects.some(e => e.family && !ctx.families.has(e.family))) result.push("family");
    if (node.exclusions.some(id => owned.has(id))) result.push("excluded");
    return result;
  };
  // Tech prerequisites are AND; missing-tag providers are alternative OR routes.
  for (const cause of ["age", "family", "excluded"] as const) {
    if (target ? relevant.some(n => causes(n).includes(cause))
      : relevant.length > 0 && relevant.every(n => causes(n).includes(cause))) addBlocker(cause);
  }
  if (!relevant.length && !target) addBlocker("missing");
  const blockedTech = !!target && (out.blockers.includes("excluded") || out.blockers.includes("missing"));
  out.next = blockedTech ? [] : relevant
    .filter(n => eligibleTech(n, owned, ctx.ageIndex, ctx.families)).map(n => n.id).sort();
  for (const node of nodes) {
    let relation: PathRelation = "unrelated";
    if (!blockedTech && eligibleTech(node, owned, ctx.ageIndex, ctx.families)) {
      if (target) {
        if (node.id === target.id) relation = "complete";
        else if (direct.has(node.id)) relation = "required";
      } else if (direct.has(node.id)) {
        const combined = new Set([...tags, ...node.tags, ...node.synergyTags]);
        relation = combo!.requires.every(t => combined.has(t)) ? "complete" : "progress";
      } else if (indirect.has(node.id)) relation = "indirect";
    }
    out.relations[node.id] = relation;
  }
  return out;
}
