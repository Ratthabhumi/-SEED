import { AGES, type TechNode, type Domain, type TechEffect } from "./graph";
import { createStreamRng } from "../seed/streams";
import type { WorldLaws } from "../emergence/worldLaws";

export const WEB_DOMAINS: Domain[] = ["science", "warfare", "industry", "culture"];
export const WEB_NODE_CAP = 128;
export const WEB_DEPTH_CAP = 10;
export const WEB_SLOT_CAP = 8;
export interface WebContext { originId: string; ownedTags: readonly string[]; owned: readonly string[]; ageIndex: number; laws: WorldLaws }

export const WEB_WEAVES: Record<string, { effects: TechEffect[]; tags: string[] }> = {
  "science-warfare": { effects: [{ kind: "damageMul", value: .06 }, { kind: "knowledgeMul", value: .05 }], tags: ["precision", "offense"] },
  "science-industry": { effects: [{ kind: "knowledgeMul", value: .06 }, { kind: "pickupMul", value: .06 }], tags: ["tools", "economy"] },
  "science-culture": { effects: [{ kind: "maxHpAdd", value: 12 }, { kind: "knowledgeMul", value: .05 }], tags: ["medicine", "survival"] },
  "warfare-industry": { effects: [{ kind: "damageMul", value: .06 }, { kind: "moveMul", value: .04 }], tags: ["rail", "mobility"] },
  "warfare-culture": { effects: [{ kind: "maxHpAdd", value: 12 }, { kind: "damageMul", value: .05 }], tags: ["armor", "defense"] },
  "industry-culture": { effects: [{ kind: "pickupMul", value: .06 }, { kind: "regenAdd", value: .3 }], tags: ["breeding", "economy"] },
};

export function eligibleTech(n: TechNode, owned: ReadonlySet<string>, ageIndex: number, families: ReadonlySet<string>): boolean {
  // Domain markers open the four starting paths; age milestones are automatic.
  // Neither is a purchasable upgrade. Legacy fixtures retain content-8 rules.
  if (n.web?.kind === "foundation" || n.web?.kind === "milestone") return false;
  return !owned.has(n.id) && n.prerequisites.every((p) => owned.has(p))
    && !n.exclusions.some((p) => owned.has(p)) && AGES.indexOf(n.age) <= ageIndex + (n.web ? 0 : 1)
    && n.effects.every((e) => !e.family || families.has(e.family));
}

export function attachWebMetadata(nodes: TechNode[]): void {
  const slots = new Map<string, number>();
  const depths = new Map<string, number>();
  for (const n of nodes) {
    const required = n.prerequisites.length ? 1 + Math.max(...n.prerequisites.map((id) => depths.get(id) ?? 0)) : 0;
    const depth = n.id.startsWith("foundation-") ? required : n.tags.includes("spine") ? (n.id === "spine-tools" ? 0 : AGES.indexOf(n.age) + 1) : Math.max(required, AGES.indexOf(n.age) + 2);
    depths.set(n.id, depth);
    const key = `${n.domain}:${depth}`;
    const slot = slots.get(key) ?? 0;
    slots.set(key, slot + 1);
    n.web = { depth, slot, kind: !depth ? "root" : n.id.startsWith("foundation-") ? "foundation" : n.tags.includes("spine") ? "milestone" : n.id.startsWith("weave-") ? "weave" : "authored" };
  }
}

const PRIMITIVES: Record<Domain, TechEffect[]> = {
  science: [{ kind: "knowledgeMul", value: 0.06 }, { kind: "pickupMul", value: 0.06 }],
  warfare: [{ kind: "damageMul", value: 0.06 }, { kind: "cooldownMul", value: -0.04 }],
  industry: [{ kind: "moveMul", value: 0.04 }, { kind: "knowledgeMul", value: 0.06 }],
  culture: [{ kind: "maxHpAdd", value: 12 }, { kind: "regenAdd", value: 0.3 }],
};

/** Lazy, bounded compositional frontier. Dedicated stream never consumes offer RNG.
 * Parent choice, origin, world rules and acquired tags causally alter packages.
 * Universal primitives cannot strand a branch behind another weapon family. */
export function expandTechWeb(nodes: TechNode[], parent: TechNode, seed: string, context: WebContext): TechNode[] {
  if (parent.id.startsWith("fb-") || parent.tags.includes("spine") || !parent.web || parent.web.depth >= WEB_DEPTH_CAP) return [];
  const added: TechNode[] = [];
  const rng = createStreamRng(seed, `frontier:${parent.id}:${context.originId}:${context.ageIndex}:${[...context.ownedTags].sort().join(",")}:${JSON.stringify(context.laws)}`);
  const depth = parent.web.depth + 1;
  for (let branch = 0; branch < 2 && nodes.length + added.length < WEB_NODE_CAP; branch++) {
    const id = `web:${parent.id}:${branch}`;
    if (nodes.some((n) => n.id === id)) continue;
    const investments = nodes.filter((n) => context.owned.includes(n.id) && !n.tags.includes("spine") && n.web && n.web.kind !== "foundation" && n.web.depth <= parent.web!.depth);
    const alternatives = WEB_DOMAINS.filter((d) => d !== parent.domain && investments.some((n) => n.domain === d));
    if (branch === 1 && alternatives.length === 0) continue;
    const weights = alternatives.map((d) => Math.max(.1, context.laws.domainBias[d]));
    let draw = rng.nextFloat() * weights.reduce((a, b) => a + b, 0);
    let selected = alternatives[alternatives.length - 1]!;
    for (let i = 0; i < alternatives.length; i++) { draw -= weights[i]!; if (draw <= 0) { selected = alternatives[i]!; break; } }
    const domain = branch === 0 ? parent.domain : selected;
    const slot = [...nodes, ...added].filter((n) => n.domain === domain && n.web?.depth === depth).length;
    if (slot >= WEB_SLOT_CAP) continue;
    const pool = PRIMITIVES[domain];
    const chosen = pool[rng.nextInt(0, pool.length - 1)]!;
    const effects = [{ ...chosen }];
    const prerequisites = [parent.id];
    if (domain !== parent.domain) {
      const supporting = investments.filter((n) => n.domain === domain).sort((a,b) => b.web!.depth - a.web!.depth || (a.id < b.id ? -1 : 1))[0]!;
      prerequisites.push(supporting.id);
      effects.push({ ...PRIMITIVES[parent.domain].find((e) => e.kind !== chosen.kind)! });
    }
    added.push({ id, titleKey: `web.${domain}.name`, descriptionKey: `web.${domain}.description`,
      age: AGES[Math.min(Math.max(AGES.indexOf(parent.age), context.ageIndex + (depth > 4 ? 1 : 0)), AGES.length - 1)]!, domain,
      prerequisites, exclusions: [], effects, tags: [domain, domain === "warfare" ? "offense" : domain === "culture" ? "survival" : "economy"],
      synergyTags: [...parent.synergyTags], rarity: "common", weight: 45 + rng.nextInt(0, 30),
      web: { depth, slot, kind: "frontier" } });
  }
  return added;
}
