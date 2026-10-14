// Minimal DOM UI helpers. All player-facing text via i18n keys (no hardcoded strings).
import { t } from "../i18n/i18n";
import type { EnKeys } from "../i18n/en";
import {NotificationManager,type NotificationPriority} from "./ui/NotificationManager";
let notifications:NotificationManager|undefined;
export function clearNotifications():void {notifications?.dispose();notifications=undefined;}
export function notificationCounts():{visible:number;queued:number}{return notifications?.counts()??{visible:0,queued:0};}

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
  clearNotifications();
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
  notifications??=new NotificationManager(uiRoot());
  const priority:NotificationPriority=titleKey.startsWith("combat.boss.")||["ui.bossWarning","ui.raidIncoming","ui.outpostLost"].includes(titleKey)?"critical":titleKey.startsWith("claim.")||["ui.techAcquired","ui.ageReached","ui.missionComplete","ui.raidRepelled"].includes(titleKey)?"important":"info";
  notifications.push(titleParam?`${t(titleKey)} — ${titleParam}`:t(titleKey),sub,ms,priority);
}

/** Apply player-selected UI scale via CSS variable. */
export function applyUiScale(scale: number): void {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--ui-scale", String(scale));
  }
}

/**
 * Keyboard auto-repeat gate (v0.24): Q/E/R/F gameplay commands must be
 * edge-triggered — one intentional command per physical press. Held-key
 * auto-repeat otherwise floods squad telemetry (568 phantom follows) and
 * double-fires abilities. Movement stays level-polled (never gated here).
 */
export function isKeyRepeat(ev: { repeat?: boolean } | undefined | null): boolean {
  return ev?.repeat === true;
}
