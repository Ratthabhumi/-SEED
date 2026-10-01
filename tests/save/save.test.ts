import { describe, it, expect } from "vitest";
import { defaultSave, loadSave, storeSave, SAVE_KEY } from "../../src/core/save/save";
import { SAVE_SCHEMA_VERSION } from "../../src/core/seed/versions";

function memStorage(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: (k: string, v: string) => { m.set(k, v); },
    removeItem: (k: string) => { m.delete(k); },
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  } as Storage;
}

describe("save data", () => {
  it("defaults carry current schema version", () => {
    expect(defaultSave().schema).toBe(SAVE_SCHEMA_VERSION);
  });

  it("missing data returns defaults", () => {
    expect(loadSave(memStorage())).toEqual(defaultSave());
  });

  it("corrupted data fails safe (never throws, game can launch)", () => {
    expect(loadSave(memStorage({ [SAVE_KEY]: "{not json!!!" }))).toEqual(defaultSave());
    expect(loadSave(memStorage({ [SAVE_KEY]: "42" }))).toEqual(defaultSave());
  });

  it("schema mismatch fails safe", () => {
    const bad = JSON.stringify({ ...defaultSave(), schema: 999 });
    expect(loadSave(memStorage({ [SAVE_KEY]: bad }))).toEqual(defaultSave());
  });

  it("round-trips settings and sanitizes uiScale and tutorialCompleted", () => {
    const st = memStorage();
    const d = defaultSave();
    d.settings.lang = "th";
    d.settings.uiScale = 1.25;
    d.settings.tutorialCompleted = true;
    storeSave(st, d);
    const loaded = loadSave(st);
    expect(loaded.settings.lang).toBe("th");
    expect(loaded.settings.uiScale).toBe(1.25);
    expect(loaded.settings.tutorialCompleted).toBe(true);

    // Old save without uiScale defaults safely to 1
    const oldSave = JSON.stringify({
      schema: SAVE_SCHEMA_VERSION,
      settings: { lang: "en", shake: true, volume: 0.5, contrast: "normal" },
      archive: [],
      best: { bestTimeSec: 0, bestKills: 0, bestAge: "stone", bestAscension: 0, runs: 0 },
      history: [],
    });
    const loadedOld = loadSave(memStorage({ [SAVE_KEY]: oldSave }));
    expect(loadedOld.settings.uiScale).toBe(1);
    expect(loadedOld.settings.tutorialCompleted).toBe(false);
  });
});
