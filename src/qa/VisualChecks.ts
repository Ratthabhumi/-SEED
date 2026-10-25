// Lightweight DOM structural overflow checks — Thai-readability aid.
// Pure analysis over injected rect entries (unit-testable); DOM collection is a
// thin adapter called only in QA mode. Structural overflow is NOT typography
// proof — human visual inspection still decides tone marks/vowels/legibility.
export interface RectEntry {
  selector: string;
  lang: string;
  viewport: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scrollW: number;
  scrollH: number;
  clientW: number;
  clientH: number;
}

export interface OverflowFinding {
  selector: string;
  lang: string;
  viewport: string;
  kind: "horizontal" | "vertical" | "offscreen";
  overBy: number;
}

export function analyzeRects(entries: RectEntry[], viewport: { w: number; h: number }): OverflowFinding[] {
  const out: OverflowFinding[] = [];
  for (const e of entries) {
    if (e.scrollW > e.clientW + 1) {
      out.push({ selector: e.selector, lang: e.lang, viewport: e.viewport, kind: "horizontal", overBy: e.scrollW - e.clientW });
    }
    if (e.scrollH > e.clientH + 1) {
      out.push({ selector: e.selector, lang: e.lang, viewport: e.viewport, kind: "vertical", overBy: e.scrollH - e.clientH });
    }
    const offRight = e.x + e.w - viewport.w;
    const offBottom = e.y + e.h - viewport.h;
    if (offRight > 1) {
      out.push({ selector: e.selector, lang: e.lang, viewport: e.viewport, kind: "offscreen", overBy: offRight });
    } else if (offBottom > 1) {
      out.push({ selector: e.selector, lang: e.lang, viewport: e.viewport, kind: "offscreen", overBy: offBottom });
    }
  }
  return out;
}

/** Player-facing surfaces worth scanning (capped per selector). */
export const OVERFLOW_SELECTORS = [
  ".hud",
  ".hud-top",
  ".hud-stats",
  ".hud-objective",
  "#draft-screen",
  "#draft-screen .card",
  "#draft-screen .card p",
  ".toast",
  ".toast-title",
  ".panel",
  "#pause-screen .panel",
  "#ascend-screen .panel",
  ".chron",
  ".logo",
  ".title-th",
];

const MAX_PER_SELECTOR = 12;

/** DOM adapter — call only in browser QA mode; never throws. */
export function collectRects(doc: Document, selectors: string[], lang: string): RectEntry[] {
  const out: RectEntry[] = [];
  try {
    const vw = doc.documentElement?.clientWidth ?? 0;
    const vh = doc.documentElement?.clientHeight ?? 0;
    const viewport = `${vw}x${vh}`;
    for (const sel of selectors) {
      let nodes: NodeListOf<Element>;
      try {
        nodes = doc.querySelectorAll(sel);
      } catch {
        continue;
      }
      const n = Math.min(nodes.length, MAX_PER_SELECTOR);
      for (let i = 0; i < n; i++) {
        const node = nodes[i] as HTMLElement;
        try {
          const r = node.getBoundingClientRect();
          out.push({
            selector: n > 1 ? `${sel}[${i}]` : sel,
            lang,
            viewport,
            x: r.x, y: r.y, w: r.width, h: r.height,
            scrollW: node.scrollWidth, scrollH: node.scrollHeight,
            clientW: node.clientWidth, clientH: node.clientHeight,
          });
        } catch {
          continue;
        }
      }
    }
  } catch {
    // QA must never break gameplay.
  }
  return out;
}
