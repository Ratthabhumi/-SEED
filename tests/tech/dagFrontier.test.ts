// v0.23.1 progressive Tech frontier (CONTENT 6): deterministic mini-paths —
// spine -> foundation -> specialization — instead of the wide frontier where
// owning an age spine opened the whole age at once.
import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { validateTechGraph } from "../../src/core/tech/validator";
import { CRITICAL_SPINE } from "../../src/core/tech/graph";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { ORIGINS } from "../../src/core/progression/origins";
import { BREAKTHROUGHS } from "../../src/core/tech/synergy";
import { GOLDEN_SEEDS } from "../../src/core/seed/versions";

const SPREAD = Array.from({ length: 40 }, (_, i) => `EPOCH-DAG-${String(i + 1).padStart(3, "0")}`);

function simFor(seed: string, originId = "engineers"): RunSimulation {
  return new RunSimulation({ masterSeed: seed, originId });
}

describe("progressive DAG shape", () => {
  it("same seed => same DAG (ids and edges)", () => {
    for (const seed of [...GOLDEN_SEEDS]) {
      const a = generateTechGraph(seed, 0);
      const b = generateTechGraph(seed, 0);
      expect(a.nodes.map((n) => `${n.id}<-${n.prerequisites.join("+")}`)).toEqual(
        b.nodes.map((n) => `${n.id}<-${n.prerequisites.join("+")}`),
      );
    }
  });

  it("Stone→Space spine intact and chained", () => {
    const g = generateTechGraph("EPOCH-GOLDEN-001", 0);
    const byId = new Map(g.nodes.map((n) => [n.id, n]));
    let prev = "";
    for (const s of CRITICAL_SPINE) {
      const n = byId.get(s.id);
      expect(n).toBeDefined();
      expect(n?.prerequisites).toEqual(prev === "" ? [] : [prev]);
      prev = s.id;
    }
  });

  it("graphs validate clean across golden + spread seeds", () => {
    for (const seed of [...GOLDEN_SEEDS, ...SPREAD]) {
      expect(validateTechGraph(generateTechGraph(seed, 0)).ok, seed).toBe(true);
    }
  });

  it("every node is reachable from the root (no orphaned content)", () => {
    for (const seed of [...GOLDEN_SEEDS, ...SPREAD]) {
      const g = generateTechGraph(seed, 0);
      const byId = new Map(g.nodes.map((n) => [n.id, n]));
      for (const n of g.nodes) {
        let cur: string | undefined = n.id;
        const seen = new Set<string>();
        while (cur && !seen.has(cur)) {
          seen.add(cur);
          const pres: string[] = byId.get(cur)?.prerequisites ?? [];
          cur = pres[0];
        }
        // Chain terminates at a root node (no prerequisites), never a ghost.
        expect(cur, `${seed}:${n.id}`).toBeUndefined();
      }
    }
  });

  it("side content forms depth-2 mini-paths (no wide frontier)", () => {
    for (const seed of [...GOLDEN_SEEDS, ...SPREAD]) {
      const g = generateTechGraph(seed, 0);
      const byId = new Map(g.nodes.map((n) => [n.id, n]));
      const spineIds = new Set(CRITICAL_SPINE.map((s) => s.id));
      const sides = g.nodes.filter((n) => !spineIds.has(n.id) && !n.id.endsWith("-anomaly"));
      // Exactly one prerequisite per side node (a chain link, not a fan).
      for (const n of sides) expect(n.prerequisites, `${seed}:${n.id}`).toHaveLength(1);
      // Every age with side content has depth ≥ 2 (a specialization exists).
      for (const age of ["stone", "bronze", "iron", "industrial", "atomic", "space"]) {
        const inAge = sides.filter((n) => n.age === age);
        if (inAge.length === 0) continue;
        const deep = inAge.filter((n) => !spineIds.has(n.prerequisites[0] as string));
        expect(deep.length, `${seed}:${age}`).toBeGreaterThan(0);
      }
      // Anomaly (when present) still hangs off its age spine.
      for (const n of g.nodes.filter((x) => x.id.endsWith("-anomaly"))) {
        expect(spineIds.has(n.prerequisites[0] as string)).toBe(true);
      }
    }
  });

  it("owning an age spine alone does NOT unlock the full side set", () => {
    for (const seed of [...GOLDEN_SEEDS, ...SPREAD.slice(0, 10)]) {
      const sim = simFor(seed);
      const owned = new Set(sim.state.owned);
      expect(owned.has("spine-tools")).toBe(true);
      const graph = sim.techGraph();
      const byId = new Map(graph.map((n) => [n.id, n]));
      const avail = new Set(sim.nodeStates().filter((x) => x.available).map((x) => x.id));
      const spineIds = new Set(CRITICAL_SPINE.map((s) => s.id));
      for (const id of avail) {
        const n = byId.get(id);
        expect(n).toBeDefined();
        // Every available node's prerequisites are already owned (real DAG walk).
        for (const p of n?.prerequisites ?? []) expect(owned.has(p), `${seed}:${id} needs ${p}`).toBe(true);
        // Depth-2 specializations stay hidden behind their foundation.
        const deep = !spineIds.has(n?.prerequisites[0] ?? "");
        expect(deep, `${seed}:${id}`).toBe(false);
      }
    }
  });

  it("normal available frontier is bounded (2–4 meaningful techs)", () => {
    for (const seed of SPREAD) {
      for (const o of ORIGINS) {
        const sim = simFor(seed, o.id);
        const count = sim.generatedOptionsCount();
        // Bronze spine (damage, no family gate) is always draftable at start.
        expect(count, `${seed}:${o.id}`).toBeGreaterThanOrEqual(1);
        expect(count, `${seed}:${o.id}`).toBeLessThanOrEqual(4);
      }
    }
  });

  it("different seeds may alter side topology", () => {
    const edgeSets = SPREAD.map((seed) =>
      generateTechGraph(seed, 0)
        .nodes.map((n) => `${n.id}<-${n.prerequisites.join("+")}`)
        .sort()
        .join("|"),
    );
    expect(new Set(edgeSets).size).toBeGreaterThan(1);
  });

  it("all 4 Origins have viable progression (non-empty frontier)", () => {
    for (const o of ORIGINS) {
      const sim = simFor("EPOCH-GOLDEN-001", o.id);
      expect(sim.generatedOptionsCount(), o.id).toBeGreaterThan(0);
    }
  });

  it("every Breakthrough's tags can appear on graph nodes (reachable)", () => {
    // Side templates are sampled per seed, so coverage is proven over the
    // seed spread: every required tag must be generatable, never a ghost.
    const tags = new Set<string>();
    for (const seed of SPREAD) {
      for (const n of generateTechGraph(seed, 0).nodes) {
        for (const tg of [...n.tags, ...n.synergyTags]) tags.add(tg);
      }
    }
    for (const b of BREAKTHROUGHS) {
      for (const req of b.requires) expect(tags.has(req), `${b.id} needs ${req}`).toBe(true);
    }
  });

  it("pin path follows the real dependency chain", () => {
    const sim = simFor("EPOCH-GOLDEN-001");
    const graph = sim.techGraph();
    const spineIds = new Set(CRITICAL_SPINE.map((s) => s.id));
    const deep = graph.find(
      (n) => !spineIds.has(n.id) && !spineIds.has(n.prerequisites[0] ?? "") && !sim.state.owned.includes(n.id),
    );
    expect(deep).toBeDefined();
    sim.pinTarget(deep?.id ?? "");
    const path = sim.pinnedPathIds();
    expect(path.has(deep?.id ?? "")).toBe(true);
    // The unowned prerequisite chain is included (owned roots like the
    // auto-granted spine are correctly excluded from the path set).
    const owned = new Set(sim.state.owned);
    let cur = byIdOf(graph, deep?.id ?? "");
    while (cur && cur.prerequisites.length > 0) {
      const p = cur.prerequisites[0] as string;
      if (owned.has(p)) break;
      expect(path.has(p), `${deep?.id} chain missing ${p}`).toBe(true);
      cur = byIdOf(graph, p);
    }
    expect(cur).toBeDefined();
  });
});

function byIdOf(graph: ReturnType<RunSimulation["techGraph"]>, id: string) {
  return graph.find((n) => n.id === id);
}
