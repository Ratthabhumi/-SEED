// Minimal DOM UI helpers. All player-facing text via i18n keys (no hardcoded strings).
import { t } from "../i18n/i18n";
import type { EnKeys } from "../i18n/en";

/** Root overlay container (single instance over the Phaser canvas). */
export function uiRoot(): HTMLElement {
  let root = document.getElementById("ui");
  if (!root) {
    root = document.createElement("div");
    root.id = "ui";
    document.getElementById("app")?.appendChild(root);
  }
  return root;
}

export function clearUI(): void {
  uiRoot().innerHTML = "";
}

export function el(tag: string, cls: string, textKey?: EnKeys, textFallback?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (textKey) e.textContent = t(textKey);
  else if (textFallback !== undefined) e.textContent = textFallback;
  return e;
}

export function button(labelKey: EnKeys, onClick: () => void, cls = "btn"): HTMLButtonElement {
  const b = document.createElement("button");
  b.className = cls;
  b.textContent = t(labelKey);
  b.addEventListener("click", (ev) => { ev.stopPropagation(); onClick(); });
  return b;
}

/** Transient toast message (age transitions, breakthroughs, POIs). */
export function toast(titleKey: EnKeys, titleParam?: string, sub?: string, ms = 2600): void {
  const root = uiRoot();
  const d = document.createElement("div");
  d.className = "toast";
  const h = document.createElement("div");
  h.className = "toast-title";
  h.textContent = titleParam ? `${t(titleKey)} — ${titleParam}` : t(titleKey);
  d.appendChild(h);
  if (sub) {
    const s = document.createElement("div");
    s.className = "toast-sub";
    s.textContent = sub;
    d.appendChild(s);
  }
  root.appendChild(d);
  setTimeout(() => d.classList.add("show"));
  setTimeout(() => { d.classList.remove("show"); setTimeout(() => d.remove(), 400); }, ms);
}

/** Apply player-selected UI scale via CSS variable. */
export function applyUiScale(scale: number): void {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--ui-scale", String(scale));
  }
}
