// Presentation adapter for the procedural Tech DAG layout using Dagre.
// Strict boundary: presentation only, never mutates canonical TechNode,
// never stored in RunState, never hashed in stateHash.
import dagre from "@dagrejs/dagre";
import type { TechNode, AgeId, Domain } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";

export interface LayoutNode {
  id: string;
  x: number; // left
  y: number; // top
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  age: AgeId;
  domain: Domain;
  node: TechNode;
}

export interface LayoutEdge {
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
}

export interface AgeLane {
  age: AgeId;
  minX: number;
  maxX: number;
}

export interface TechGraphLayoutResult {
  width: number;
  height: number;
  nodes: LayoutNode[];
  nodeMap: Map<string, LayoutNode>;
  edges: LayoutEdge[];
  lanes: AgeLane[];
}

export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 68;

/**
 * Compute deterministic 2D presentation coordinates for the Tech DAG.
 * Left-to-Right layout matches civilization progression (Stone → Space).
 */
export function layoutTechGraph(
  nodes: readonly TechNode[],
  options?: {
    nodeWidth?: number;
    nodeHeight?: number;
    nodeSep?: number;
    rankSep?: number;
    marginX?: number;
    marginY?: number;
  }
): TechGraphLayoutResult {
  const w = options?.nodeWidth ?? NODE_WIDTH;
  const h = options?.nodeHeight ?? NODE_HEIGHT;
  const nodeSep = options?.nodeSep ?? 24;
  const rankSep = options?.rankSep ?? 64;
  const marginX = options?.marginX ?? 40;
  const marginY = options?.marginY ?? 40;

  const g = new dagre.graphlib.Graph({ multigraph: false, compound: false });
  g.setGraph({
    rankdir: "LR",
    nodesep: nodeSep,
    ranksep: rankSep,
    marginx: marginX,
    marginy: marginY,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Sort input deterministically by age order then id so layout is 100% stable
  const sorted = [...nodes].sort((a, b) => {
    const ageDiff = AGES.indexOf(a.age) - AGES.indexOf(b.age);
    if (ageDiff !== 0) return ageDiff;
    return a.id.localeCompare(b.id);
  });

  for (const n of sorted) {
    g.setNode(n.id, { width: w, height: h });
  }

  for (const n of sorted) {
    for (const prereqId of n.prerequisites) {
      // Only set edge if prerequisite exists in the graph
      if (g.hasNode(prereqId)) {
        g.setEdge(prereqId, n.id);
      }
    }
  }

  dagre.layout(g);

  const layoutNodes: LayoutNode[] = [];
  const nodeMap = new Map<string, LayoutNode>();

  for (const n of sorted) {
    const dagreNode = g.node(n.id);
    const cx = dagreNode ? dagreNode.x : marginX;
    const cy = dagreNode ? dagreNode.y : marginY;
    const ln: LayoutNode = {
      id: n.id,
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
      centerX: cx,
      centerY: cy,
      age: n.age,
      domain: n.domain,
      node: n,
    };
    layoutNodes.push(ln);
    nodeMap.set(n.id, ln);
  }

  const layoutEdges: LayoutEdge[] = [];
  for (const e of g.edges()) {
    const edgeData = g.edge(e);
    const pts = edgeData?.points ? edgeData.points.map((p: { x: number; y: number }) => ({ x: p.x, y: p.y })) : [];
    layoutEdges.push({
      from: e.v,
      to: e.w,
      points: pts,
    });
  }

  // Calculate age lane horizontal bounds
  const lanes: AgeLane[] = [];
  for (const age of AGES) {
    const ageNodes = layoutNodes.filter((ln) => ln.age === age);
    if (ageNodes.length > 0) {
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      for (const an of ageNodes) {
        if (an.x < minX) minX = an.x;
        if (an.x + an.width > maxX) maxX = an.x + an.width;
      }
      lanes.push({
        age,
        minX: minX - rankSep / 4,
        maxX: maxX + rankSep / 4,
      });
    }
  }

  const graphData = g.graph();
  const totalWidth = (graphData?.width ?? 1200) + marginX;
  const totalHeight = (graphData?.height ?? 800) + marginY;

  return {
    width: Math.max(totalWidth, 800),
    height: Math.max(totalHeight, 600),
    nodes: layoutNodes,
    nodeMap,
    edges: layoutEdges,
    lanes,
  };
}
