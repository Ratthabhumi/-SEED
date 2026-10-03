import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { legacyCandidates } from "../../src/core/progression/legacies";
import { ORIGINS } from "../../src/core/progression/origins";
import { WORLDGEN_POI_FAMILIES, POI_DRAFT_FILTERS, POI_MAJOR_KIND } from "../../src/core/world/poi";
import type { WeaponFamily } from "../../src/core/combat/weapons";

// Corrective audit pass: ordered state, world-vs-run evidence, compatibility.
describe("canonical ordered state (P1-03)", () => {
  it("different draft order → different snapshot", () => {
    const mk = (): RunSimulation => {
      const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
      sim.state.spawnT = 99999;
      sim.state.eliteT = 99999;
      return sim;
    };
    const grant = (sim: RunSimulation, n: number): void => {
      const ev: never[] = [];
      sim.gainKnowledge(n, "test", ev);
    };
    const a = mk();
    const b = mk();
    grant(a, 100000);
    grant(b, 100000);
    expect(a.state.draftOpen && b.state.draftOpen).toBe(true);
    // Force distinct orders by reversing one choice list (same elements).
    b.state.draftOffers = [...b.state.draftOffers].reverse();
    expect(a.snapshot()).not.toBe(b.snapshot());
  });

  it("different Legacy FIFO order → different snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const b = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    a.state.legacies = ["affinity-kinetic", "trait-swift"];
    b.state.legacies = ["trait-swift", "affinity-kinetic"];
    expect(a.snapshot()).not.toBe(b.snapshot());
  });

  it("set-like ownedTags order → same snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const b = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    a.state.ownedTags = ["fire", "tools", "kinetic"];
    b.state.ownedTags = ["kinetic", "tools", "fire"];
    expect(a.snapshot()).toBe(b.snapshot());
  });
});

describe("world-vs-run legacy evidence (P1-04)", () => {
  it("offers describe the current world, not old worlds", () => {
    const kinetic = legacyCandidates({ breakthroughs: ["metallurgy"], topDamageSource: "kinetic", ascension: 0 });
    expect(kinetic.map((d) => d.id)).toContain("heir-metallurgy");
    const energy = legacyCandidates({ breakthroughs: ["grid"], topDamageSource: "energy", ascension: 1 });
    expect(energy.map((d) => d.id)).toContain("heir-grid");
    expect(energy.map((d) => d.id)).toContain("affinity-energy");
    expect(energy.map((d) => d.id)).not.toContain("heir-metallurgy");
  });

  it("inherited breakthroughs are not world-earned evidence", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    // Simulate an heir recorded without earning (as ascend() does).
    sim.state.breakthroughs.push("metallurgy");
    expect(sim.state.worldBreakthroughsEarned).not.toContain("metallurgy");
    const offers = sim.legacyOffers().map((d) => d.id);
    expect(offers).not.toContain("heir-metallurgy");
  });

  it("ascend resets world evidence but keeps run totals", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.worldDamageBySource = { kinetic: 500 };
    sim.state.worldTopDamageSource = "kinetic";
    sim.state.worldBreakthroughsEarned = ["metallurgy"];
    sim.state.damageBySource = { kinetic: 500 };
    sim.state.topDamageSource = "kinetic";
    sim.state.ascendReady = true;
    sim.ascend("heir-metallurgy", "hunters");
    expect(sim.state.worldDamageBySource).toEqual({});
    expect(sim.state.worldTopDamageSource).toBe("");
    expect(sim.state.worldBreakthroughsEarned).toEqual([]);
    expect(sim.state.damageBySource["kinetic"]).toBe(500);
    // New world earns its own evidence: offers must not echo the old world.
    const offers = sim.legacyOffers().map((d) => d.id);
    expect(offers).not.toContain("heir-metallurgy");
  });
});

describe("legacy/origin compatibility (P1-05)", () => {
  const compatible = (legacyId: string): string[] => {
    const req =
      legacyId.startsWith("affinity-")
        ? (legacyId.slice("affinity-".length) as WeaponFamily)
        : undefined;
    return ORIGINS.filter((o) =>
      !req || (o.families as readonly string[]).includes(req)).map((o) => o.id);
  };

  it("every affinity legacy has exactly two compatible current origins", () => {
    expect(compatible("affinity-kinetic").sort()).toEqual(["engineers", "hunters"]);
    expect(compatible("affinity-energy").sort()).toEqual(["resonant", "sentinels"]);
    expect(compatible("affinity-defense").sort()).toEqual(["engineers", "sentinels"]);
    expect(compatible("affinity-field").sort()).toEqual(["hunters", "resonant"]);
  });

  it("incompatible pairing is rejected canonically with no state change", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.ascendReady = true;
    const before = sim.snapshot();
    // affinity-kinetic requires Kinetic; Resonant lacks it.
    expect(sim.ascend("affinity-kinetic", "resonant")).toEqual([]);
    expect(sim.snapshot()).toBe(before);
    expect(sim.state.ascension).toBe(0);
  });

  it("compatible affinity is immediately active in the new world", () => {
    const cases: Array<[string, string, WeaponFamily, (s: RunSimulation["state"]) => number]> = [
      ["affinity-kinetic", "hunters", "kinetic", (s) => s.build.bonusProjectiles],
      ["affinity-energy", "resonant", "energy", (s) => (s.build.beamUnlocked ? 1 : 0)],
      ["affinity-defense", "engineers", "defense", (s) => s.build.bonusGuardians],
      ["affinity-field", "hunters", "field", (s) => s.build.bonusMines],
    ];
    for (const [legacy, origin, fam, read] of cases) {
      const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
      sim.state.worldTopDamageSource = fam; // offers then include this affinity
      sim.state.ascendReady = true;
      expect(sim.legacyOffers().map((d) => d.id), legacy).toContain(legacy);
      const ev = sim.ascend(legacy, origin);
      expect(ev.some((e) => e.type === "ascended"), `${legacy}+${origin}`).toBe(true);
      expect(read(sim.state), `${legacy}+${origin}`).toBeGreaterThan(0);
    }
  });

  it("every candidate always has at least one valid origin", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    for (const d of sim.legacyOffers()) {
      expect(compatible(d.id).length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("POI reachability truth (P2-02)", () => {
  it("exactly four families are worldgen-integrated; two stay dormant", () => {
    expect([...WORLDGEN_POI_FAMILIES].sort()).toEqual(["meteor", "ruin", "signal", "vault"]);
    expect(Object.keys(POI_DRAFT_FILTERS)).toHaveLength(6);
    expect(POI_MAJOR_KIND["megasite"]).toBe("cache");
    expect(POI_MAJOR_KIND["worldtree"]).toBe("draft");
  });
});
