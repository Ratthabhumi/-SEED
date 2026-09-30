import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { layoutTechGraph, NODE_WIDTH, NODE_HEIGHT } from "../../src/game/tech/TechGraphLayout";
import { AGES } from "../../src/core/tech/graph";
import { RunSimulation } from "../../src/core/sim/RunSimulation";

describe("TechGraphLayout (Dagre adapter)", () => {
  const seed = "EPOCH-GOLDEN-001";
  const graph = generateTechGraph(seed, 0);

  it("every canonical Tech node appears exactly once in layout", () => {
    const layout = layoutTechGraph(graph.nodes);
    expect(layout.nodes.length).toBe(graph.nodes.length);
    const seen = new Set<string>();
    for (const n of layout.nodes) {
      expect(seen.has(n.id)).toBe(false);
      seen.add(n.id);
      expect(n.width).toBe(NODE_WIDTH);
      expect(n.height).toBe(NODE_HEIGHT);
    }
  });

  it("every prerequisite edge appears in layout edges", () => {
    const layout = layoutTechGraph(graph.nodes);
    let expectedEdgeCount = 0;
    for (const n of graph.nodes) {
      expectedEdgeCount += n.prerequisites.length;
    }
    expect(layout.edges.length).toBe(expectedEdgeCount);

    for (const edge of layout.edges) {
      const target = graph.nodes.find((n) => n.id === edge.to);
      expect(target).toBeDefined();
      expect(target!.prerequisites).toContain(edge.from);
      expect(edge.points.length).toBeGreaterThanOrEqual(2);
      for (const pt of edge.points) {
        expect(Number.isFinite(pt.x)).toBe(true);
        expect(Number.isFinite(pt.y)).toBe(true);
      }
    }
  });

  it("all layout positions and dimensions are finite and positive", () => {
    const layout = layoutTechGraph(graph.nodes);
    expect(Number.isFinite(layout.width)).toBe(true);
    expect(Number.isFinite(layout.height)).toBe(true);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);

    for (const n of layout.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(Number.isFinite(n.centerX)).toBe(true);
      expect(Number.isFinite(n.centerY)).toBe(true);
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("layout result is 100% stable and deterministic for the same graph", () => {
    const layout1 = layoutTechGraph(graph.nodes);
    const layout2 = layoutTechGraph(graph.nodes);

    expect(layout1.width).toBe(layout2.width);
    expect(layout1.height).toBe(layout2.height);
    expect(layout1.nodes.length).toBe(layout2.nodes.length);

    for (let i = 0; i < layout1.nodes.length; i++) {
      const n1 = layout1.nodes[i]!;
      const n2 = layout2.nodes[i]!;
      expect(n1.id).toBe(n2.id);
      expect(n1.x).toBe(n2.x);
      expect(n1.y).toBe(n2.y);
    }
  });

  it("shuffling input node array does not change semantic connectivity or layout stability", () => {
    const shuffled = [...graph.nodes].reverse();
    const layoutOriginal = layoutTechGraph(graph.nodes);
    const layoutShuffled = layoutTechGraph(shuffled);

    expect(layoutShuffled.width).toBe(layoutOriginal.width);
    expect(layoutShuffled.height).toBe(layoutOriginal.height);
    for (const n of layoutOriginal.nodes) {
      const matching = layoutShuffled.nodeMap.get(n.id);
      expect(matching).toBeDefined();
      expect(matching!.x).toBe(n.x);
      expect(matching!.y).toBe(n.y);
    }
  });

  it("layout does not mutate canonical TechNode objects", () => {
    const originalSnapshot = JSON.stringify(graph.nodes);
    layoutTechGraph(graph.nodes);
    expect(JSON.stringify(graph.nodes)).toBe(originalSnapshot);
  });

  it("canonical simulation RunState never contains graph layout coordinates", () => {
    const sim = new RunSimulation({ masterSeed: seed, originId: "resonant" });
    const snap = sim.snapshot();
    expect(snap).not.toContain("centerX");
    expect(snap).not.toContain("centerY");
    expect(snap).not.toContain("rankdir");
    expect(snap).not.toContain("dagre");
  });

  it("age lanes preserve left-to-right progression order", () => {
    const layout = layoutTechGraph(graph.nodes);
    expect(layout.lanes.length).toBe(AGES.length);
    for (let i = 0; i < layout.lanes.length - 1; i++) {
      const cur = layout.lanes[i]!;
      const next = layout.lanes[i + 1]!;
      expect(cur.minX).toBeLessThan(next.minX);
    }
  });

  it("FIT scale stays in usable range for golden Tech graph", () => {
    const layout = layoutTechGraph(graph.nodes);
    const viewports = [
      { vw: 800, vh: 500 },
      { vw: 1280, vh: 720 },
      { vw: 1920, vh: 1080 },
    ];
    for (const { vw, vh } of viewports) {
      const padding = 56;
      const scale = Math.max(0.3, Math.min(1.0, Math.min((vw - padding) / layout.width, (vh - padding) / layout.height)));
      expect(scale).toBeGreaterThanOrEqual(0.3);
      expect(scale).toBeLessThanOrEqual(1.0);
    }
  });

  it("FIT places graph visual center inside viewport tolerance", () => {
    const layout = layoutTechGraph(graph.nodes);
    const vw = 1280;
    const vh = 720;
    const padding = 56;
    const scale = Math.max(0.3, Math.min(1.0, Math.min((vw - padding) / layout.width, (vh - padding) / layout.height)));
    const panX = (vw - layout.width) / (2 * scale);
    const panY = (vh - layout.height) / (2 * scale);

    // Panzoom transform: x_screen = bw/2 + scale * panX
    const visualCenterX = layout.width / 2 + scale * panX;
    const visualCenterY = layout.height / 2 + scale * panY;

    expect(Math.abs(visualCenterX - vw / 2)).toBeLessThan(0.01);
    expect(Math.abs(visualCenterY - vh / 2)).toBeLessThan(0.01);
  });

  it("first and last graph nodes have finite bounds and remain reachable", () => {
    const layout = layoutTechGraph(graph.nodes);
    expect(layout.nodes.length).toBeGreaterThan(0);
    const first = layout.nodes[0]!;
    const last = layout.nodes[layout.nodes.length - 1]!;

    expect(Number.isFinite(first.x)).toBe(true);
    expect(Number.isFinite(first.y)).toBe(true);
    expect(Number.isFinite(last.x)).toBe(true);
    expect(Number.isFinite(last.y)).toBe(true);

    expect(first.x).toBeGreaterThanOrEqual(0);
    expect(last.x + last.width).toBeLessThanOrEqual(layout.width + 1);
  });
});
