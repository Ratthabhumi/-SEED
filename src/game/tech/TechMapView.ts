/**
 * TechMapView — Presentation component for the civilization Technology Tree.
 *
 * Architecture boundaries:
 * - Uses TechGraphLayout (Dagre) for deterministic presentation coordinates.
 * - Uses @panzoom/panzoom ONLY on the presentation canvas.
 * - Presentation-only: canonical simulation state is never mutated here.
 * - Defensive fallback: if Panzoom fails to initialize, falls back to a static scrollable view.
 */
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import type { RunSimulation } from "../../core/sim/RunSimulation";
import { AGES, type AgeId, type TechNode } from "../../core/tech/graph";
import { BREAKTHROUGHS } from "../../core/tech/synergy";
import { ORIGINS, activeFamilies, originById } from "../../core/progression/origins";
import { t } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { layoutTechGraph, type TechGraphLayoutResult, type LayoutNode, type LayoutEdge } from "./TechGraphLayout";
import { SEED_ASSETS } from "../assets/seedAssets";

export interface TechMapViewOptions {
  sim: RunSimulation;
  selectedId?: string;
  onSelect?: (nodeId: string) => void;
  onPin?: (nodeId: string) => void;
  onClose?: () => void;
}

export class TechMapView {
  private sim: RunSimulation;
  private selectedId: string;
  private onSelect?: (nodeId: string) => void;
  private onPin?: (nodeId: string) => void;
  private onClose?: (nodeId: string) => void;

  private layoutResult!: TechGraphLayoutResult;
  private panzoom: PanzoomObject | null = null;
  private screenEl: HTMLElement | null = null;
  private viewportEl: HTMLElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private sideEl: HTMLElement | null = null;
  private nodeButtons = new Map<string, HTMLButtonElement>();
  private edgePaths: Array<{ el: SVGPathElement; edge: LayoutEdge }> = [];
  private wheelListener: ((e: WheelEvent) => void) | null = null;
  private isFallbackMode = false;

  constructor(options: TechMapViewOptions) {
    this.sim = options.sim;
    this.selectedId = options.selectedId ?? "";
    this.onSelect = options.onSelect;
    this.onPin = options.onPin;
    this.onClose = options.onClose;
  }

  /**
   * Mounts the Tech Map DOM into the provided root container.
   */
  mount(root: HTMLElement): HTMLElement {
    this.destroy();

    const s = this.sim.state;
    this.layoutResult = layoutTechGraph(this.sim.techGraph());

    const screen = document.createElement("div");
    screen.id = "techmap-screen";
    screen.className = "screen";

    const wrap = document.createElement("div");
    wrap.className = "techmap-wrap";

    // Header
    const head = this.createHeader();
    wrap.appendChild(head);

    // Body (Graph viewport + Detail sidebar)
    const body = document.createElement("div");
    body.className = "techmap-body";

    // Graph Viewport
    const viewport = document.createElement("div");
    viewport.className = "techmap-viewport";
    viewport.id = "techmap-viewport";
    this.viewportEl = viewport;

    // Canvas container (panned and zoomed)
    const canvas = document.createElement("div");
    canvas.className = "techmap-canvas";
    canvas.id = "techmap-canvas";
    canvas.style.width = `${Math.ceil(this.layoutResult.width)}px`;
    canvas.style.height = `${Math.ceil(this.layoutResult.height)}px`;
    this.canvasEl = canvas;

    // SVG layer for age lanes and connecting edges
    const svg = this.createSvgLayer();
    canvas.appendChild(svg);

    // Age columns container for layout structure and test discovery
    const cols = document.createElement("div");
    cols.className = "techmap-cols";
    for (const age of AGES) {
      const col = document.createElement("div");
      col.className = `techmap-col techmap-col-${age}`;
      col.dataset.age = age;
      cols.appendChild(col);
    }
    canvas.appendChild(cols);

    // Node buttons layer
    const nodesLayer = this.createNodesLayer();
    canvas.appendChild(nodesLayer);

    viewport.appendChild(canvas);
    body.appendChild(viewport);

    // Sidebar
    const side = document.createElement("div");
    side.className = "techmap-side techmap-no-pan";
    this.sideEl = side;
    this.renderSidebarContent();
    body.appendChild(side);

    wrap.appendChild(body);
    screen.appendChild(wrap);
    root.appendChild(screen);
    this.screenEl = screen;

    // Initialize Panzoom with defensive fallback boundary
    this.initPanzoom();

    return screen;
  }

  private createHeader(): HTMLElement {
    const s = this.sim.state;
    const head = document.createElement("div");
    head.className = "techmap-head techmap-no-pan";

    // Title with icon
    const titleGroup = document.createElement("div");
    titleGroup.className = "techmap-title-group";

    const promptIcon = document.createElement("img");
    promptIcon.src = SEED_ASSETS.prompts.t;
    promptIcon.className = "techmap-prompt-icon";
    promptIcon.alt = "T";
    titleGroup.appendChild(promptIcon);

    const title = document.createElement("span");
    title.className = "techmap-title";
    title.textContent = t("ui.techMap");
    titleGroup.appendChild(title);
    head.appendChild(titleGroup);

    // Zoom and Navigation controls
    const controls = document.createElement("div");
    controls.className = "techmap-controls";

    const btnFit = document.createElement("button");
    btnFit.className = "btn techmap-btn-fit techmap-no-pan";
    btnFit.textContent = t("ui.fit" as EnKeys) || "FIT";
    btnFit.title = "Fit graph to viewport";
    btnFit.addEventListener("click", () => this.fit());
    controls.appendChild(btnFit);

    const btnReset = document.createElement("button");
    btnReset.className = "btn techmap-btn-reset techmap-no-pan";
    btnReset.textContent = "1:1";
    btnReset.title = "Reset zoom to 100%";
    btnReset.addEventListener("click", () => this.reset());
    controls.appendChild(btnReset);

    const btnZoomOut = document.createElement("button");
    btnZoomOut.className = "btn techmap-btn-zoom-out techmap-no-pan";
    btnZoomOut.textContent = "−";
    btnZoomOut.title = "Zoom out";
    btnZoomOut.addEventListener("click", () => this.zoomOut());
    controls.appendChild(btnZoomOut);

    const btnZoomIn = document.createElement("button");
    btnZoomIn.className = "btn techmap-btn-zoom-in techmap-no-pan";
    btnZoomIn.textContent = "+";
    btnZoomIn.title = "Zoom in";
    btnZoomIn.addEventListener("click", () => this.zoomIn());
    controls.appendChild(btnZoomIn);

    head.appendChild(controls);

    // Pin indicator in header
    const pinGroup = document.createElement("div");
    pinGroup.className = "techmap-pin-group";
    if (s.pinnedTarget !== "") {
      const pinLabel = document.createElement("span");
      pinLabel.className = "techmap-pin";
      const targetNode = this.sim.techGraph().find((n) => n.id === s.pinnedTarget);
      const titleStr = targetNode ? t(targetNode.titleKey as EnKeys) : s.pinnedTarget;
      pinLabel.textContent = `${t("ui.buildPlan")}: ${titleStr}`;
      pinGroup.appendChild(pinLabel);

      const unpinBtn = document.createElement("button");
      unpinBtn.className = "btn techmap-no-pan";
      unpinBtn.textContent = t("ui.unpin");
      unpinBtn.addEventListener("click", () => {
        this.triggerPin("");
      });
      pinGroup.appendChild(unpinBtn);
    }
    head.appendChild(pinGroup);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "btn techmap-btn-close techmap-no-pan";
    closeBtn.textContent = "✕ [T]";
    closeBtn.addEventListener("click", () => {
      if (this.onClose) this.onClose("");
    });
    head.appendChild(closeBtn);

    return head;
  }

  private createSvgLayer(): SVGSVGElement {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "techmap-svg");
    svg.setAttribute("width", String(Math.ceil(this.layoutResult.width)));
    svg.setAttribute("height", String(Math.ceil(this.layoutResult.height)));

    const defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);

    // Render age lane background bands and headers
    for (const lane of this.layoutResult.lanes) {
      const laneRect = document.createElementNS(svgNS, "rect");
      laneRect.setAttribute("x", String(lane.minX - 16));
      laneRect.setAttribute("y", "0");
      laneRect.setAttribute("width", String(lane.maxX - lane.minX + 32));
      laneRect.setAttribute("height", String(this.layoutResult.height));
      laneRect.setAttribute("class", `techmap-lane-bg techmap-lane-${lane.age}`);
      svg.appendChild(laneRect);

      const laneText = document.createElementNS(svgNS, "text");
      laneText.setAttribute("x", String((lane.minX + lane.maxX) / 2));
      laneText.setAttribute("y", "28");
      laneText.setAttribute("text-anchor", "middle");
      laneText.setAttribute("class", "techmap-lane-title");
      laneText.textContent = t(`age.${lane.age}` as EnKeys);
      svg.appendChild(laneText);
    }

    // Render connecting edges
    const pinnedPath = this.sim.pinnedPathIds();
    this.edgePaths = [];

    for (const edge of this.layoutResult.edges) {
      const path = document.createElementNS(svgNS, "path");
      const d = this.buildEdgePathString(edge);
      path.setAttribute("d", d);

      const isPinnedEdge = pinnedPath.has(edge.from) && pinnedPath.has(edge.to);
      path.setAttribute("class", "techmap-edge" + (isPinnedEdge ? " pinned" : ""));
      path.dataset.from = edge.from;
      path.dataset.to = edge.to;

      svg.appendChild(path);
      this.edgePaths.push({ el: path, edge });
    }

    return svg;
  }

  private buildEdgePathString(edge: LayoutEdge): string {
    const pts = edge.points;
    if (pts.length < 2) return "";
    if (pts.length === 2) {
      const p0 = pts[0]!;
      const p1 = pts[1]!;
      const dx = (p1.x - p0.x) / 2;
      return `M ${p0.x} ${p0.y} C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    // Spline through Dagre routed points
    let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i]!;
      d += ` L ${p.x} ${p.y}`;
    }
    return d;
  }

  private createNodesLayer(): HTMLElement {
    const container = document.createElement("div");
    container.className = "techmap-nodes";

    const s = this.sim.state;
    const states = new Map(this.sim.nodeStates().map((x) => [x.id, x]));
    const pinnedPath = this.sim.pinnedPathIds();
    this.nodeButtons.clear();

    for (const ln of this.layoutResult.nodes) {
      const n = ln.node;
      const st = states.get(n.id);
      const isOwned = st?.owned ?? false;
      const isAvailable = st?.available ?? false;
      const isLocked = !isOwned && !isAvailable;
      const isPinned = s.pinnedTarget === n.id || pinnedPath.has(n.id);
      const isSelected = this.selectedId === n.id;

      const star = [...n.tags, ...n.synergyTags].some((tg) =>
        BREAKTHROUGHS.some((br) => !s.breakthroughs.includes(br.id) && br.requires.includes(tg)));

      const btn = document.createElement("button");
      btn.className = [
        "techmap-node",
        "techmap-no-pan",
        isOwned ? "owned" : isAvailable ? "available" : "locked",
        isPinned ? "pinned" : "",
        star ? "breakthrough" : "",
        isSelected ? "selected" : "",
      ].filter(Boolean).join(" ");

      btn.dataset.nodeId = n.id;
      btn.style.left = `${Math.round(ln.x)}px`;
      btn.style.top = `${Math.round(ln.y)}px`;
      btn.style.width = `${Math.round(ln.width)}px`;
      btn.style.height = `${Math.round(ln.height)}px`;

      // Status indicator mark
      const mark = document.createElement("span");
      mark.className = "techmap-node-mark";
      mark.textContent = isOwned ? "✓" : isAvailable ? "●" : "🔒";
      btn.appendChild(mark);

      // Node title
      const label = document.createElement("span");
      label.className = "techmap-node-label";
      label.textContent = t(n.titleKey as EnKeys);
      btn.appendChild(label);

      if (star) {
        const starSpan = document.createElement("span");
        starSpan.className = "techmap-node-star";
        starSpan.textContent = " ★";
        btn.appendChild(starSpan);
      }

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectNode(n.id);
      });

      container.appendChild(btn);
      this.nodeButtons.set(n.id, btn);
    }

    return container;
  }

  private initPanzoom(): void {
    if (!this.canvasEl || !this.viewportEl) return;

    try {
      this.panzoom = Panzoom(this.canvasEl, {
        minScale: 0.35,
        maxScale: 2.2,
        contain: "outside",
        excludeClass: "techmap-no-pan",
      });

      // Mouse wheel zoom on viewport
      this.wheelListener = (e: WheelEvent) => {
        e.preventDefault();
        this.panzoom?.zoomWithWheel(e);
      };
      this.viewportEl.addEventListener("wheel", this.wheelListener);

      // Initial view: fit into viewport
      requestAnimationFrame(() => {
        this.fit();
      });
    } catch (err) {
      console.warn("TechMapView: Panzoom initialization failed, degrading to static scrollable view", err);
      this.isFallbackMode = true;
      if (this.viewportEl) {
        this.viewportEl.style.overflow = "auto";
      }
    }
  }

  public fit(): void {
    if (!this.panzoom || !this.viewportEl) return;
    const vw = this.viewportEl.clientWidth || 800;
    const vh = this.viewportEl.clientHeight || 500;
    const bw = this.layoutResult.width;
    const bh = this.layoutResult.height;
    if (bw <= 0 || bh <= 0) return;

    const padding = 48;
    const scale = Math.max(0.35, Math.min(1.2, Math.min((vw - padding) / bw, (vh - padding) / bh)));
    const panX = Math.max(20, (vw - bw * scale) / 2);
    const panY = Math.max(20, (vh - bh * scale) / 2);

    this.panzoom.zoom(scale, { animate: true });
    this.panzoom.pan(panX, panY, { animate: true });
  }

  public reset(): void {
    if (!this.panzoom) return;
    this.panzoom.reset({ animate: true });
  }

  public zoomIn(): void {
    if (!this.panzoom) return;
    this.panzoom.zoomIn({ animate: true });
  }

  public zoomOut(): void {
    if (!this.panzoom) return;
    this.panzoom.zoomOut({ animate: true });
  }

  public selectNode(nodeId: string): void {
    this.selectedId = nodeId;

    // Update node selection styles
    for (const [id, btn] of this.nodeButtons) {
      if (id === nodeId) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    }

    this.renderSidebarContent();

    if (this.onSelect) {
      this.onSelect(nodeId);
    }
  }

  private triggerPin(nodeId: string): void {
    if (this.onPin) {
      this.onPin(nodeId);
    }
    this.refreshPinState();
  }

  public refreshPinState(): void {
    const s = this.sim.state;
    const pinnedPath = this.sim.pinnedPathIds();

    for (const [id, btn] of this.nodeButtons) {
      const isPinned = s.pinnedTarget === id || pinnedPath.has(id);
      if (isPinned) {
        btn.classList.add("pinned");
      } else {
        btn.classList.remove("pinned");
      }
    }

    for (const { el, edge } of this.edgePaths) {
      const isPinnedEdge = pinnedPath.has(edge.from) && pinnedPath.has(edge.to);
      if (isPinnedEdge) {
        el.classList.add("pinned");
      } else {
        el.classList.remove("pinned");
      }
    }

    this.renderSidebarContent();
  }

  private renderSidebarContent(): void {
    if (!this.sideEl) return;
    this.sideEl.innerHTML = "";

    const s = this.sim.state;
    const byId = new Map(this.sim.techGraph().map((n) => [n.id, n]));
    const sel = this.selectedId !== "" ? byId.get(this.selectedId) : undefined;

    if (sel) {
      const h = document.createElement("h3");
      h.textContent = t(sel.titleKey as EnKeys);
      this.sideEl.appendChild(h);

      const meta = document.createElement("div");
      meta.className = "techmap-meta";
      meta.textContent = `${t(`age.${sel.age}` as EnKeys)} · ${t(`domain.${sel.domain}` as EnKeys)} · ${t(`rarity.${sel.rarity}` as EnKeys)}`;
      this.sideEl.appendChild(meta);

      const desc = document.createElement("div");
      desc.className = "techmap-desc";
      desc.textContent = t(sel.descriptionKey as EnKeys);
      this.sideEl.appendChild(desc);

      // Requirements
      const reqTitle = document.createElement("div");
      reqTitle.className = "techmap-req-title";
      reqTitle.textContent = `${t("ui.requires")}:`;
      this.sideEl.appendChild(reqTitle);

      const req = document.createElement("div");
      req.className = "techmap-req";
      req.textContent = sel.prerequisites.length === 0
        ? "—"
        : sel.prerequisites.map((p) => {
            const pn = byId.get(p);
            return `${s.owned.includes(p) ? "✓" : "○"} ${pn ? t(pn.titleKey as EnKeys) : p}`;
          }).join(" · ");
      this.sideEl.appendChild(req);

      // Leads to
      const leadsTitle = document.createElement("div");
      leadsTitle.className = "techmap-req-title";
      leadsTitle.textContent = `${t("ui.leadsTo")}:`;
      this.sideEl.appendChild(leadsTitle);

      const leads = document.createElement("div");
      leads.className = "techmap-req";
      const leadsList = this.sim.techGraph()
        .filter((n) => n.prerequisites.includes(sel.id))
        .map((n) => t(n.titleKey as EnKeys));
      leads.textContent = leadsList.length > 0 ? leadsList.join(" · ") : "—";
      this.sideEl.appendChild(leads);

      // Pin / Unpin button
      const pinBtn = document.createElement("button");
      pinBtn.className = "btn primary techmap-pin-btn techmap-no-pan";
      const isPinned = s.pinnedTarget === sel.id;
      pinBtn.textContent = isPinned ? t("ui.unpin") : t("ui.pinPath");
      pinBtn.addEventListener("click", () => {
        this.triggerPin(isPinned ? "" : sel.id);
      });
      this.sideEl.appendChild(pinBtn);
    }

    // Current build summary section
    const buildTitle = document.createElement("h3");
    buildTitle.textContent = t("ui.ownedBuild");
    this.sideEl.appendChild(buildTitle);

    const origin = ORIGINS.find((o) => o.id === s.originId);
    const ob = document.createElement("div");
    ob.className = "techmap-req";
    const fams = activeFamilies(s.originId, s.expansionFamily).map((f) => t(`family.${f}` as EnKeys)).join("+");
    ob.textContent = `${origin ? t(origin.nameKey) : s.originId} (${fams})` +
      (s.expansionFamily !== "" ? ` +${t(`family.${s.expansionFamily}` as EnKeys)}` : "") +
      ` · ★ ${s.breakthroughs.map((id) => {
        const bb = BREAKTHROUGHS.find((x) => x.id === id);
        return bb ? t(bb.titleKey) : id;
      }).join(", ") || "—"}` +
      (s.reservedTech !== "" ? ` · ${t("ui.reserve")}: ${sel ? t(sel.titleKey as EnKeys) : s.reservedTech}` : "");
    this.sideEl.appendChild(ob);

    const domains = ["warfare", "industry", "science", "culture"] as const;
    for (const d of domains) {
      const list = s.owned
        .map((id) => byId.get(id))
        .filter((n) => n && n.domain === d)
        .map((n) => t((n as { titleKey: EnKeys }).titleKey));
      if (list.length === 0) continue;
      const row = document.createElement("div");
      row.className = "techmap-req";
      row.textContent = `${t(`domain.${d}` as EnKeys)}: ${list.join(" · ")}`;
      this.sideEl.appendChild(row);
    }
  }

  /**
   * Destroys Panzoom listeners and removes the Tech Map screen.
   */
  destroy(): void {
    if (this.viewportEl && this.wheelListener) {
      this.viewportEl.removeEventListener("wheel", this.wheelListener);
      this.wheelListener = null;
    }

    if (this.panzoom) {
      try {
        this.panzoom.destroy();
      } catch {
        // Safe destroy
      }
      this.panzoom = null;
    }

    this.nodeButtons.clear();
    this.edgePaths = [];

    if (this.screenEl) {
      this.screenEl.remove();
      this.screenEl = null;
    }
  }

  public getPanzoomInstance(): PanzoomObject | null {
    return this.panzoom;
  }

  public isFallback(): boolean {
    return this.isFallbackMode;
  }
}
