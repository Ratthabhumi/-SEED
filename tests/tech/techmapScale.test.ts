import { describe, it, expect } from "vitest";
import { layoutTechGraph, techNodeBox, NODE_WIDTH, NODE_HEIGHT } from "../../src/game/tech/TechGraphLayout";
import { generateTechGraph } from "../../src/core/tech/generator";

// Scale-aware layout contract (§15): Dagre receives the effective rendered
// box, so node footprints always match layout coordinates.
describe("tech map scale-aware layout", () => {
  it("techNodeBox is deterministic and monotonic in uiScale", () => {
    expect(techNodeBox(1)).toEqual({ w: NODE_WIDTH, h: NODE_HEIGHT });
    expect(techNodeBox(1)).toEqual(techNodeBox(1));
    const s125 = techNodeBox(1.25);
    const s150 = techNodeBox(1.5);
    const s200 = techNodeBox(2);
    expect(s125.w).toBeGreaterThanOrEqual(NODE_WIDTH);
    expect(s150.w).toBeGreaterThanOrEqual(s125.w);
    expect(s200.w).toBeGreaterThanOrEqual(s150.w);
    expect(s200.h).toBeGreaterThanOrEqual(NODE_HEIGHT);
  });

  it("layout node boxes equal the effective box for every scale", () => {
    const graph = generateTechGraph("EPOCH-GOLDEN-001", 0).nodes;
    for (const scale of [1, 1.25, 1.5, 2]) {
      const box = techNodeBox(scale);
      const layout = layoutTechGraph(graph, { nodeWidth: box.w, nodeHeight: box.h });
      expect(layout.nodes.length).toBeGreaterThan(20);
      for (const n of layout.nodes) {
        expect(n.width).toBe(box.w);
        expect(n.height).toBe(box.h);
      }
    }
  });

  it("scaled layout stays deterministic and connected", () => {
    const graph = generateTechGraph("EPOCH-GOLDEN-001", 0).nodes;
    const box = techNodeBox(2);
    const a = layoutTechGraph(graph, { nodeWidth: box.w, nodeHeight: box.h });
    const b = layoutTechGraph(graph, { nodeWidth: box.w, nodeHeight: box.h });
    expect(a.nodes.map((n) => [n.id, n.x, n.y])).toEqual(b.nodes.map((n) => [n.id, n.x, n.y]));
    for (const e of a.edges) {
      expect(e.points.length).toBeGreaterThanOrEqual(2);
    }
  });
});
