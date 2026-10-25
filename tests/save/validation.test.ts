import { describe, it, expect } from "vitest";
import { loadSave, SAVE_KEY } from "../../src/core/save/save";

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

describe("save runtime validation", () => {
  it("invalid lang falls back to en (never breaks translation runtime)", () => {
    const raw = JSON.stringify({ schema: 1, settings: { lang: "xx", volume: 0.5, shake: true } });
    expect(loadSave(memStorage({ [SAVE_KEY]: raw })).settings.lang).toBe("en");
  });

  it("volume is clamped to a finite 0..1", () => {
    const mk = (v: unknown): number => {
      const raw = JSON.stringify({ schema: 1, settings: { lang: "en", volume: v, shake: true } });
      return loadSave(memStorage({ [SAVE_KEY]: raw })).settings.volume;
    };
    expect(mk(999)).toBe(1);
    expect(mk(-5)).toBe(0);
    expect(mk("loud")).toBe(0.6);
  });

  it("non-boolean shake falls back to default", () => {
    const raw = JSON.stringify({ schema: 1, settings: { lang: "en", volume: 0.5, shake: "yes" } });
    expect(loadSave(memStorage({ [SAVE_KEY]: raw })).settings.shake).toBe(true);
  });

  it("invalid best fields are sanitized", () => {
    const raw = JSON.stringify({
      schema: 1,
      settings: { lang: "th", volume: 0.5, shake: false },
      best: { bestTimeSec: -10, bestKills: NaN, bestAge: "atlantean", bestAscension: 2, runs: 3 },
      archive: ["ok", 42, ""],
      history: ["EPOCH-A", 7, "x".repeat(200)],
    });
    const s = loadSave(memStorage({ [SAVE_KEY]: raw }));
    expect(s.best.bestTimeSec).toBe(0);
    expect(s.best.bestAge).toBe("stone");
    expect(s.archive).toEqual(["ok"]);
    expect(s.history).toEqual(["EPOCH-A"]);
    expect(s.settings.lang).toBe("th"); // valid values preserved
  });
});
