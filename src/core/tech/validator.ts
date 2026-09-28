// Tech DAG validator: acyclic, reachable spine, viable choices.
import type { TechGraph } from "./graph";
import { CRITICAL_SPINE, AGES } from "./graph";

export interface ValidationResult { ok: boolean; errors: string[]; }

export function validateTechGraph(g: TechGraph): ValidationResult {
  const errors: string[] = [];
  const byId = new Map(g.nodes.map((n) => [n.id, n]));

  // Prereq existence.
  for (const n of g.nodes) {
    for (const p of n.prerequisites) {
      if (!byId.has(p)) errors.push(`missing prereq ${p} for ${n.id}`);
      if (p === n.id) errors.push(`self prereq ${n.id}`);
    }
    for (const e of n.exclusions) {
      if (e === n.id) errors.push(`self exclusion ${n.id}`);
    }
  }

  // Acyclic (Kahn).
  const indeg = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const n of g.nodes) { indeg.set(n.id, 0); children.set(n.id, []); }
  for (const n of g.nodes) {
    for (const p of n.prerequisites) {
      if (!byId.has(p)) continue;
      indeg.set(n.id, (indeg.get(n.id) ?? 0) + 1);
      children.get(p)?.push(n.id);
    }
  }
  const queue = [...indeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  let visited = 0;
  while (queue.length) {
    const id = queue.pop() as string;
    visited++;
    for (const c of children.get(id) ?? []) {
      const d = (indeg.get(c) ?? 1) - 1;
      indeg.set(c, d);
      if (d === 0) queue.push(c);
    }
  }
  if (visited !== g.nodes.length) errors.push("graph has a cycle");

  // Spine reachable: every spine node present and reachable from root.
  const reachable = new Set<string>();
  const roots = g.nodes.filter((n) => n.prerequisites.length === 0).map((n) => n.id);
  const stack = [...roots];
  while (stack.length) {
    const id = stack.pop() as string;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const c of children.get(id) ?? []) stack.push(c);
  }
  for (const s of CRITICAL_SPINE) {
    if (!byId.has(s.id)) errors.push(`missing spine ${s.id}`);
    else if (!reachable.has(s.id)) errors.push(`spine unreachable ${s.id}`);
  }
  // Final space node reachable.
  if (!reachable.has("spine-orbital")) errors.push("final Space node unreachable");

  // Per-age meaningful choices.
  for (const age of AGES) {
    const count = g.nodes.filter((n) => n.age === age).length;
    if (count < 2) errors.push(`age ${age} has <2 choices`);
  }

  // Combat viability: at least one offense / defense-ish / mobility-economy option.
  const hasOffense = g.nodes.some((n) => n.effects.some((e) => ["damageMul", "projectileAdd", "beamAdd", "auraAdd", "orbitAdd"].includes(e.kind)));
  const hasDefense = g.nodes.some((n) => n.effects.some((e) => ["maxHpAdd", "regenAdd", "summonAdd"].includes(e.kind)));
  const hasMobEcon = g.nodes.some((n) => n.effects.some((e) => ["moveMul", "pickupMul", "knowledgeMul", "cooldownMul"].includes(e.kind)));
  if (!hasOffense) errors.push("no offensive option");
  if (!hasDefense) errors.push("no defensive option");
  if (!hasMobEcon) errors.push("no mobility/economy option");

  // Exclusion deadlock: A excludes B while B requires A (direct).
  for (const n of g.nodes) {
    for (const p of n.prerequisites) {
      const pre = byId.get(p);
      if (pre && (pre.exclusions.includes(n.id) || n.exclusions.includes(p))) {
        errors.push(`exclusion deadlock ${n.id} <-> ${p}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
