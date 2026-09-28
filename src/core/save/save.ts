// localStorage persistence with schema versioning + safe-corruption handling.
import { SAVE_SCHEMA_VERSION } from "../seed/versions";

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

export function loadSave(storage: Pick<Storage, "getItem">): SaveData {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (typeof parsed !== "object" || parsed === null) return defaultSave();
    if (parsed.schema !== SAVE_SCHEMA_VERSION) return defaultSave(); // fail safe, never crash launch
    const d = defaultSave();
    return {
      schema: SAVE_SCHEMA_VERSION,
      settings: { ...d.settings, ...(parsed.settings ?? {}) },
      archive: Array.isArray(parsed.archive) ? parsed.archive.filter((x) => typeof x === "string") : [],
      best: { ...d.best, ...(parsed.best ?? {}) },
      history: Array.isArray(parsed.history) ? parsed.history.filter((x) => typeof x === "string").slice(0, 50) : [],
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
