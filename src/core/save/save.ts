// localStorage persistence with schema versioning + runtime validation.
// Corrupt OR schema-valid-but-nonsense data must fail safe — never throw, never
// let a bad value (e.g. lang "xx") reach the runtime.
import { SAVE_SCHEMA_VERSION } from "../seed/versions";
import { AGES } from "../tech/graph";

export type Lang = "en" | "th";

export interface Settings { lang: Lang; shake: boolean; volume: number; }

export interface BestStats {
  bestTimeSec: number; bestKills: number; bestAge: string; bestAscension: number; runs: number;
}

export interface SaveData {
  schema: number;
  settings: Settings;
  archive: string[];
  best: BestStats;
  history: string[];
}

export const SAVE_KEY = "seed-game-save-v1";

export function defaultSave(): SaveData {
  return {
    schema: SAVE_SCHEMA_VERSION,
    settings: { lang: "en", shake: true, volume: 0.6 },
    archive: [],
    best: { bestTimeSec: 0, bestKills: 0, bestAge: "stone", bestAscension: 0, runs: 0 },
    history: [],
  };
}

function cleanSettings(raw: unknown): Settings {
  const d = defaultSave().settings;
  if (typeof raw !== "object" || raw === null) return { ...d };
  const r = raw as Record<string, unknown>;
  const lang = r.lang === "th" ? "th" : "en"; // "xx" and friends fall back to en
  const volume = typeof r.volume === "number" && Number.isFinite(r.volume)
    ? Math.min(1, Math.max(0, r.volume))
    : d.volume;
  const shake = typeof r.shake === "boolean" ? r.shake : d.shake;
  return { lang, volume, shake };
}

function cleanBest(raw: unknown): BestStats {
  const d = defaultSave().best;
  if (typeof raw !== "object" || raw === null) return { ...d };
  const r = raw as Record<string, unknown>;
  const num = (v: unknown, fb: number): number =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fb;
  const age = typeof r.bestAge === "string" && (AGES as string[]).includes(r.bestAge) ? r.bestAge : d.bestAge;
  return {
    bestTimeSec: num(r.bestTimeSec, d.bestTimeSec),
    bestKills: num(r.bestKills, d.bestKills),
    bestAge: age,
    bestAscension: num(r.bestAscension, d.bestAscension),
    runs: num(r.runs, d.runs),
  };
}

function cleanStrings(raw: unknown, cap: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 64).slice(0, cap);
}

export function loadSave(storage: Pick<Storage, "getItem">): SaveData {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (typeof parsed !== "object" || parsed === null) return defaultSave();
    if (parsed.schema !== SAVE_SCHEMA_VERSION) return defaultSave();
    return {
      schema: SAVE_SCHEMA_VERSION,
      settings: cleanSettings(parsed.settings),
      archive: cleanStrings(parsed.archive, 64),
      best: cleanBest(parsed.best),
      history: cleanStrings(parsed.history, 50),
    };
  } catch {
    return defaultSave(); // corrupt data must never prevent launch
  }
}

export function storeSave(storage: Pick<Storage, "setItem">, data: SaveData): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // quota errors are non-fatal
  }
}
