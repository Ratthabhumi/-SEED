// v0.23.1 territory economy: OUTPOST CAPACITY per age + Knowledge upgrade
// cost from one canonical pure function each. Claims consume slots; a full
// frontier rejects with zero mutation; upgrades need hold + Knowledge and
// deduct exactly once. Progression can never softlock by construction.
import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { AGE_DEFS } from "../../src/core/progression/ages";
import {
  outpostCapacity,
  outpostUpgradeCost,
  canClaimMore,
  signalExempt,
  outpostsHeld,
  activeTerritories,
} from "../../src/core/world/territory";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function testSim(seed = "EPOCH-GOLDEN-001"): RunSimulation {
  return new RunSimulation({ masterSeed: seed, originId: "engineers" });
}

function clearField(sim: RunSimulation): void {
  for (const e of sim.state.enemies) e.active = false;
  for (const p of sim.state.projs) p.active = false;
}

/** Discover a POI and return its id (white-box staging, real discovery). */
function discoverOne(sim: RunSimulation): string {
  const s = sim.state;
  clearField(sim);
  outer: for (let r = 0; r < 6; r++) {
    for (let ox = -r; ox <= r; ox++) {
      for (let oy = -r; oy <= r; oy++) {
        const desc = sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          s.px = poi.wx;
          s.py = poi.wy;
          for (let i = 0; i < 10 && !s.poisWorld.includes(poi.id); i++) sim.step(1 / 60, IDLE);
          if (s.poisWorld.includes(poi.id)) return poi.id;
          continue outer;
        }
      }
    }
  }
  throw new Error("no discoverable POI found");
}

/** Claim + specialize via the real path (fails loudly if preconditions miss). */
function claimSpec(sim: RunSimulation): string {
  const id = discoverOne(sim);
  const ev = sim.claimTerritory(id);
  expect(ev.some((e) => e.type === "territory_claimed")).toBe(true);
  sim.setOutpostSpec(id, "research");
  return id;
}

/** Discover the nearest POI of a given type; returns id + world position. */
function discoverType(sim: RunSimulation, type: string): { id: string; x: number; y: number } {
  const s = sim.state;
  clearField(sim);
  for (let r = 0; r < 10; r++) {
    for (let ox = -r; ox <= r; ox++) {
      for (let oy = -r; oy <= r; oy++) {
        const desc = sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
        for (const poi of desc.poi) {
          if ((poi.type as string) !== type || s.poisWorld.includes(poi.id)) continue;
          return { id: poi.id, x: poi.wx, y: poi.wy };
        }
      }
    }
  }
  throw new Error(`no POI of type ${type} generated nearby`);
}

/** Nearest undiscovered POI that is NOT a signal (junk-fill staging). */
function discoverNonSignal(sim: RunSimulation): { id: string; x: number; y: number } {
  const s = sim.state;
  clearField(sim);
  for (let r = 0; r < 10; r++) {
    for (let ox = -r; ox <= r; ox++) {
      for (let oy = -r; oy <= r; oy++) {
        const desc = sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
        for (const poi of desc.poi) {
          if ((poi.type as string) === "signal" || s.poisWorld.includes(poi.id)) continue;
          return { id: poi.id, x: poi.wx, y: poi.wy };
        }
      }
    }
  }
  throw new Error("no non-signal POI generated nearby");
}

describe("outpost capacity", () => {
  it("canonical values per age (provisional balance, single function)", () => {
    expect([0, 1, 2, 3, 4, 5].map(outpostCapacity)).toEqual([1, 2, 3, 4, 5, 6]);
    // Clamped, never zero/negative (UI divides nothing by it, but be safe).
    expect(outpostCapacity(-5)).toBe(1);
    expect(outpostCapacity(99)).toBe(6);
  });

  it("claim consumes one capacity slot; full frontier rejects with zero mutation", () => {
    const sim = testSim();
    const s = sim.state;
    expect(s.ageIndex).toBe(0);
    expect(outpostCapacity(0)).toBe(1);
    const first = claimSpec(sim);
    expect(outpostsHeld(s.territories)).toBe(1);
    expect(canClaimMore(s.territories, s.ageIndex)).toBe(false);
    // Second distinct site: rejected, territories + snapshot untouched.
    const other = discoverOne(sim);
    expect(other).not.toBe(first);
    const before = sim.snapshot();
    expect(sim.claimTerritory(other)).toEqual([]);
    expect(s.territories).toHaveLength(1);
    expect(sim.snapshot()).toBe(before);
  });

  it("another valid site succeeds while capacity remains", () => {
    const sim = testSim();
    claimSpec(sim);
    // Bronze frontier holds two.
    sim.state.ageIndex = 1;
    expect(canClaimMore(sim.state.territories, 1)).toBe(true);
    const second = claimSpec(sim);
    expect(sim.state.territories).toHaveLength(2);
    expect(second).not.toBe(sim.state.territories[0]?.poiId);
  });

  it("first signal claim is exempt (mission-critical, never capacity-blocked)", () => {
    // EPOCH-GOLDEN-001 is proven to generate nearby signals (frontierGate).
    const sim = testSim();
    const s = sim.state;
    // Fill the stone frontier with a NON-signal outpost.
    const junk = discoverNonSignal(sim);
    clearField(sim);
    s.px = junk.x;
    s.py = junk.y;
    for (let i = 0; i < 10 && !s.poisWorld.includes(junk.id); i++) sim.step(1 / 60, IDLE);
    expect(sim.claimTerritory(junk.id).some((e) => e.type === "territory_claimed")).toBe(true);
    sim.setOutpostSpec(junk.id, "research");
    expect(s.signalSecured).toBe(false);
    expect(canClaimMore(s.territories, 0)).toBe(false);
    // A signal appears: the FIRST one bypasses the full frontier.
    const sig = discoverType(sim, "signal");
    clearField(sim);
    s.px = sig.x;
    s.py = sig.y;
    for (let i = 0; i < 10 && !s.poisWorld.includes(sig.id); i++) sim.step(1 / 60, IDLE);
    expect(s.poisWorld.includes(sig.id)).toBe(true);
    for (let i = 0; i < 5 && sim.claimTerritory(sig.id).length === 0; i++) {
      clearField(sim);
      sim.step(1 / 60, IDLE);
    }
    expect(s.signalSecured).toBe(true);
    expect(s.territories).toHaveLength(2); // grandfathered over capacity
    // Exemption predicate is exactly first-signal-on-full-frontier, nothing else.
    expect(signalExempt(s.territories, 0, "signal", true)).toBe(false);
    expect(signalExempt(s.territories, 0, "ruin", false)).toBe(false);
    expect(signalExempt([], 0, "signal", false)).toBe(false);
  });

  it("disabled outposts free their slot; repair never evicts (grandfathered)", () => {
    const sim = testSim();
    const first = claimSpec(sim);
    // Knock it out (white-box siege outcome) — slot frees explicitly.
    const t0 = sim.state.territories[0];
    if (!t0) throw new Error("unreachable");
    t0.disabled = true;
    t0.hp = 0;
    expect(outpostsHeld(sim.state.territories)).toBe(0);
    expect(canClaimMore(sim.state.territories, 0)).toBe(true);
    const second = claimSpec(sim);
    expect(second).not.toBe(first);
    // Repair the first while at capacity: allowed, both active (no eviction).
    const back = sim.state.territories.find((t) => t.poiId === first);
    if (!back) throw new Error("unreachable");
    sim.state.px = back.x;
    sim.state.py = back.y;
    back.repairT = 10;
    sim.step(1 / 60, IDLE);
    expect(back.disabled).toBe(false);
    expect(activeTerritories(sim.state.territories)).toHaveLength(2);
    expect(outpostsHeld(sim.state.territories)).toBe(2);
  });
});

describe("outpost upgrade cost", () => {
  it("canonical values ≈9% of next age threshold, readable 25s", () => {
    expect([0, 1, 2, 3, 4, 5].map(outpostUpgradeCost)).toEqual([50, 125, 250, 400, 575, 575]);
    expect(outpostUpgradeCost(-3)).toBe(50);
    expect(outpostUpgradeCost(99)).toBe(575);
  });

  it("upgrade needs hold + Knowledge; deducts exactly once", () => {
    const sim = testSim();
    const id = claimSpec(sim);
    const cost = outpostUpgradeCost(0);
    // Hold missing → rejected.
    expect(sim.upgradeOutpost(id)).toEqual([]);
    sim.state.elapsed += 200;
    const t = sim.state.territories[0];
    if (t) t.heldSince = sim.state.elapsed - 200;
    // Knowledge missing → rejected, zero mutation.
    sim.state.knowledgeTotal = cost - 1;
    const before = sim.snapshot();
    expect(sim.upgradeOutpost(id)).toEqual([]);
    expect(sim.snapshot()).toBe(before);
    // Exact cost → success, deducted once, tier applied, single event.
    sim.state.knowledgeTotal = cost * 3;
    const ev = sim.upgradeOutpost(id);
    expect(ev.filter((e) => e.type === "outpost_upgraded")).toHaveLength(1);
    expect(sim.state.territories[0]?.tier).toBe(2);
    expect(sim.state.knowledgeTotal).toBe(cost * 2);
    // Tier 2 again → rejected (no double charge).
    expect(sim.upgradeOutpost(id)).toEqual([]);
    expect(sim.state.knowledgeTotal).toBe(cost * 2);
  });
});

describe("no progression softlock", () => {
  it("every age's capacity covers the next age's dominion need", () => {
    for (let i = 0; i < AGE_DEFS.length - 1; i++) {
      const need = AGE_DEFS[i + 1]?.dominion.outposts ?? 0;
      expect(outpostCapacity(i), `age ${i} capacity for next need ${need}`).toBeGreaterThanOrEqual(need);
      // Headroom: the gate never demands the entire frontier.
      expect(outpostCapacity(i)).toBeGreaterThanOrEqual(Math.min(need + 1, 6));
    }
  });

  it("upgrade cost is always earnable inside its age (fraction of next gate)", () => {
    for (let i = 0; i < AGE_DEFS.length; i++) {
      const cost = outpostUpgradeCost(i);
      const gate = (AGE_DEFS[Math.min(i + 1, AGE_DEFS.length - 1)]?.knowledgeThreshold ?? 1) || 1;
      expect(cost).toBeGreaterThan(0);
      expect(cost / gate).toBeLessThanOrEqual(0.1);
    }
  });
});
