// Translation lookup with Unicode-safe handling (never split Thai by UTF-16 units).
import { en, type EnKeys } from "./en";
import { th } from "./th";
import type { Lang } from "../core/save/save";

const TABLES: Record<Lang, Record<string, string>> = { en, th };

let current: Lang = "en";

export function setLang(l: Lang): void {
  current = l;
  document.documentElement.lang = l === "th" ? "th" : "en";
}

export function getLang(): Lang {
  return current;
}

/** Unicode-safe translate: keys only, values rendered whole (no per-char splitting). */
export function t(key: EnKeys): string {
  const table = TABLES[current];
  const v = table[key];
  if (typeof v === "string") return v;
  const fallback = (en as Record<string, string>)[key];
  return typeof fallback === "string" ? fallback : key;
}

/** Unicode-safe length (code points, not UTF-16 units). */
export function ulen(s: string): number {
  return Array.from(s).length;
}

export function allKeys(): EnKeys[] {
  return Object.keys(en) as EnKeys[];
}
