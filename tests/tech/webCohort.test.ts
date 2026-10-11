import { describe, it, expect } from "vitest";
import { generateTechGraph as content8Graph } from "../fixtures/content8TechGraph";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { generateWorldLaws } from "../../src/core/emergence/worldLaws";
import { ORIGINS } from "../../src/core/progression/origins";
import { layoutTechGraph, techNodeBox } from "../../src/game/tech/TechGraphLayout";

describe("content 8 versus bounded web: conditioned choice cohort", () => {
  it("reduces exhausted pools across 8 seeds × 4 origins × 36 staged choices", () => {
    // This compares choice supply, not natural age completion, performance or fun.
    // No combat, territorial income, reroll spending, or pinning in either arm.
    const totals = { baseline: { real: 0, fallback: 0, alternatives: 0 }, web: { real: 0, fallback: 0, alternatives: 0 } };
    let maxNodes = 0;
    for (let seedIndex = 0; seedIndex < 8; seedIndex++) for (const origin of ORIGINS) {
      const seed = `WEB-COHORT-${seedIndex}`;
      for (const arm of ["baseline", "web"] as const) {
        const x = new RunSimulation({ masterSeed: seed, originId: origin.id });
        if (arm === "baseline") {
          x.state.techNodes = content8Graph(seed).nodes;
          x.state.owned = ["spine-tools"];
          x.state.ownedTags = ["spine", "stone"];
          x.state.worldLaws = generateWorldLaws(seed, 2, 8);
        }
        for (let choice = 0; choice < 36; choice++) {
          x.state.ageIndex = Math.min(5, Math.floor(choice / 6));
          // A staged age includes its canonical automatic milestones.
          for (const n of x.techGraph()) if (n.tags.includes("spine") && ["stone","bronze","iron","industrial","atomic","space"].indexOf(n.age) <= x.state.ageIndex && !x.state.owned.includes(n.id)) x.state.owned.push(n.id);
          if (!x.state.draftOpen) x.gainKnowledge(100000, "conditioned-probe", []);
          for (const card of x.state.draftOffers) totals[arm][card.nodeId.startsWith("fb-") ? "fallback" : "real"]++;
          if (x.canRerollDraft()) totals[arm].alternatives++;
          x.chooseDraft(0);
          maxNodes = Math.max(maxNodes, x.techGraph().length);
        }
        if (arm === "web") for (const scale of [1, 1.25, 1.5, 2]) {
          const box = techNodeBox(scale);
          const nodes = layoutTechGraph(x.techGraph(), { nodeWidth: box.w, nodeHeight: box.h }).nodes;
          for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i]!; const b = nodes[j]!;
            const overlaps = a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
            if (overlaps) throw new Error(`overlap ${seed}/${origin.id}/${scale}: ${a.id}, ${b.id}`);
          }
        }
      }
    }
    console.log("WEB_CONDITIONED_COHORT", JSON.stringify({ seeds: 8, origins: 4, choices: 36, totals, maxNodes }));
    expect(totals.web.fallback).toBeLessThan(totals.baseline.fallback);
    expect(totals.web.alternatives).toBeGreaterThan(totals.baseline.alternatives);
    expect(maxNodes).toBeLessThanOrEqual(128);
  });
});
