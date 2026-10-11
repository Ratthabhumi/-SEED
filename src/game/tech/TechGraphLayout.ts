// Presentation adapter for the procedural technology web layout.
// Strict boundary: presentation only, never mutates canonical TechNode,
// never stored in RunState, never hashed in stateHash.
import { WEB_DEPTH_CAP } from "../../core/tech/web";
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
 * Effective node footprint for a UI scale — THE box the radial adapter lays out AND the
 * box nodes render in (inline px + border-box + hidden overflow). One function
 * owns both sides, so layout can never disagree with rendering (§15).
 * Monotonic in scale; deterministic; LANG-independent (labels wrap/ellipsize
 * inside the box, full prose lives in the sidebar).
 */
export function techNodeBox(uiScale: number): { w: number; h: number } {
  const s = uiScale >= 2 ? 1.4 : uiScale >= 1.5 ? 1.2 : uiScale >= 1.25 ? 1.1 : 1;
  return { w: Math.round(NODE_WIDTH * s), h: Math.round(NODE_HEIGHT * s) };
}

/**
 * Compute deterministic 2D presentation coordinates for the Tech DAG.
 * Center-out domain sectors. Semantic metadata is independent of the renderer.
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
  // Fixed extent keeps existing coordinates stable as the bounded web expands.
  const step = Math.max(w * 3.2, h * 5);
  const center = (WEB_DEPTH_CAP + 1) * step;
  const width = center * 2;
  const sectors: Record<Domain, number> = { science: -3 * Math.PI / 4, warfare: -Math.PI / 4, industry: 3 * Math.PI / 4, culture: Math.PI / 4 };
  const sorted = [...nodes].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const counts = new Map<string, number>();
  const layoutNodes: LayoutNode[] = [];
  const nodeMap = new Map<string, LayoutNode>();
  for (const n of sorted) {
    const depth = n.web?.depth ?? (n.prerequisites.length ? AGES.indexOf(n.age) + 1 : 0);
    const key = `${n.domain}:${depth}`;
    const slot = n.web?.slot ?? counts.get(key) ?? 0;
    counts.set(key, slot + 1);
    const spread = slot === 0 ? 0 : Math.ceil(slot / 2) * (slot % 2 ? 1 : -1);
    // At depth >=2, adjacent slot chord exceeds the rendered box diagonal.
    const angle = sectors[n.domain] + spread * Math.PI / 18;
    const radius = depth === 1 ? step * .55 : depth * step;
    const cx = center + Math.cos(angle) * radius;
    const cy = center + Math.sin(angle) * radius;
    const ln: LayoutNode = { id: n.id, x: cx - w / 2, y: cy - h / 2, width: w, height: h,
      centerX: cx, centerY: cy, age: n.age, domain: n.domain, node: n };
    layoutNodes.push(ln); nodeMap.set(n.id, ln);
  }
  const edges: LayoutEdge[] = [];
  for (const n of sorted) for (const p of n.prerequisites) {
    const from = nodeMap.get(p); const to = nodeMap.get(n.id);
    if (from && to) edges.push({ from: p, to: n.id, points: [
      { x: from.centerX, y: from.centerY }, { x: to.centerX, y: to.centerY },
    ] });
  }
  // Legacy lane metadata now describes ordered age-ring radii.
  const lanes = AGES.map((age, i) => ({ age, minX: i * step, maxX: (i + 1) * step }));
  return { width, height: width, nodes: layoutNodes, nodeMap, edges, lanes };
}
