// Frontier gate staging contracts (Phase A): the exact preconditions the
// E2E readyExpansion() hook stages must satisfy the CURRENT canonical gates,
// so age_reached + expansion_offered fire from real code — never assumed.
// Also covers the Space → Stronghold → boss canonical flow.
import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { ageGates } from "../../src/core/progression/ages";
import type { MissionState } from "../../src/core/progression/missions";
import type { DominionState } from "../../src/core/progression/ages";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function testSim(seed = "EPOCH-GOLDEN-001"): RunSimulation {
  return new RunSimulation({ masterSeed: seed, originId: "engineers" });
}

function clearField(sim: RunSimulation): void {
  for (const e of sim.state.enemies) e.active = false;
  for (const p of sim.state.projs) p.active = false;
}

/** Teleport to the nearest undiscovered POI of a given type and discover it. */
function discoverType(sim: RunSimulation, type: string): string {
  const s = sim.state;
  for (let r = 0; r < 10; r++) {
    for (let ox = -r; ox <= r; ox++) {
      for (let oy = -r; oy <= r; oy++) {
        const desc = sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
        for (const poi of desc.poi) {
          if (poi.type !== type || s.poisWorld.includes(poi.id)) continue;
          clearField(sim);
          s.px = poi.wx;
          s.py = poi.wy;
          for (let i = 0; i < 10 && !s.poisWorld.includes(poi.id); i++) sim.step(1 / 60, IDLE);
          if (s.poisWorld.includes(poi.id)) return poi.id;
        }
      }
    }
  }
  throw new Error(`no discoverable POI of type ${type}`);
}
function claimN(sim: RunSimulation, n: number, spec: "research" | "military" | "economy" = "research"): string[] {
  const s = sim.state;
  const claimed: string[] = [];
  outer: for (let r = 0; r < 8 && claimed.length < n; r++) {
    for (let ox = -r; ox <= r && claimed.length < n; ox++) {
      for (let oy = -r; oy <= r && claimed.length < n; oy++) {
        const desc = sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          clearField(sim);
          s.px = poi.wx;
          s.py = poi.wy;
          for (let i = 0; i < 10 && !s.poisWorld.includes(poi.id); i++) sim.step(1 / 60, IDLE);
          if (!s.poisWorld.includes(poi.id)) continue;
          sim.claimTerritory(poi.id);
          sim.setOutpostSpec(poi.id, spec);
          claimed.push(poi.id);
          if (claimed.length >= n) break outer;
        }
      }
    }
  }
  return claimed;
}

describe("industrial staging satisfies the current canonical gates", () => {
  it("age_reached(industrial) + expansion_offered fire from real code", () => {
    const sim = testSim();
    const s = sim.state;
    // Mirror of the E2E readyExpansion() contract: iron age, thresholds met,
    // elite evidence, two genuine claims + specs, coherent breakthrough tags.
    s.ageIndex = 2;
    s.elapsed = 400;
    s.ageElapsed = 130;
    s.knowledgeTotal = 2800;
    s.ageKills = 120;
    s.elitesAge = 1;
    clearField(sim);
    for (const t of ["fire", "tools"]) if (!s.ownedTags.includes(t)) s.ownedTags.push(t);
    if (!s.breakthroughs.includes("metallurgy")) s.breakthroughs.push("metallurgy");
    const claimed = claimN(sim, 2);
    expect(claimed).toHaveLength(2);

    const seen: string[] = [];
    for (let i = 0; i < 5 && s.ageIndex < 3; i++) {
      for (const e of sim.step(1 / 60, IDLE)) seen.push(e.type);
    }
    expect(s.ageIndex).toBe(3);
    expect(seen).toContain("age_reached");
    expect(seen).toContain("expansion_offered");
  });
});

describe("space → stronghold → boss canonical flow", () => {
  it("atomic staging reaches space, reveals the stronghold, spawns the boss on approach", () => {
    const sim = testSim();
    const s = sim.state;
    s.elapsed = 500;
    s.ageIndex = 4;
    s.ageElapsed = 200;
    s.ageKills = 300;
    s.elitesAge = 2;
    s.raidsSurvived = 1;
    clearField(sim);
    for (const t of ["fire", "tools"]) if (!s.ownedTags.includes(t)) s.ownedTags.push(t);
    if (!s.breakthroughs.includes("metallurgy")) s.breakthroughs.push("metallurgy");
    const claimed = claimN(sim, 3);
    expect(claimed).toHaveLength(3);
    // Space entry requires a secured signal: claim one explicitly.
    const sigId = discoverType(sim, "signal");
    clearField(sim);
    sim.claimTerritory(sigId);
    expect(s.signalSecured).toBe(true);
    // Tier-2 upgrade on the first outpost (hold time satisfied + atomic
    // Knowledge cost covered — v0.23.1 opportunity cost).
    const terr = s.territories[0];
    if (terr) terr.heldSince = s.elapsed - 200;
    s.knowledgeTotal = 2000;
    expect(sim.upgradeOutpost(claimed[0] as string).some((e) => e.type === "outpost_upgraded")).toBe(true);
    // Knowledge last so no premature advancement mid-setup.
    s.knowledgeTotal = 6500;

    const seen: string[] = [];
    for (let i = 0; i < 5 && s.ageIndex < 5; i++) {
      for (const e of sim.step(1 / 60, IDLE)) seen.push(e.type);
    }
    expect(s.ageIndex).toBe(5);
    expect(seen).toContain("age_reached");
    expect(seen).toContain("stronghold_revealed");
    expect(s.stronghold?.revealed).toBe(true);

    // Approach the revealed stronghold: the boss answers proximity.
    s.px = s.stronghold?.x ?? 0;
    s.py = s.stronghold?.y ?? 0;
    let warned = false;
    for (let i = 0; i < 10 && !s.bossSpawned; i++) {
      for (const e of sim.step(1 / 60, IDLE)) {
        seen.push(e.type);
        if (e.type === "boss_warning") warned = true;
      }
    }
    expect(s.bossSpawned).toBe(true);
    expect(warned).toBe(true);
  });
});

describe("staged industrial gates match the canonical predicate", () => {
  it("the exact E2E hook preconditions satisfy ageGates(industrial)", () => {
    // Mirror of readyExpansion(): what the hook stages must pass ageGates —
    // if the contract moves, this (not a silent E2E timeout) must fail first.
    const ms: MissionState = {
      ageKills: 120, territoriesClaimed: 2, elitesAge: 1, outpostsTier2: 0,
      raidsSurvived: 0, signalSecured: false, breakthroughs: 1,
    };
    const ds: DominionState = { active: 2, specialized: 1, tier2: 0, raidsSurvived: 0 };
    const gates = ageGates(3, 2800, ms, ds);
    expect(gates).toHaveLength(3);
    for (const g of gates) expect(g.done).toBe(true);
  });
});

describe("contested sites cannot be claimed", () => {
  it("foes within the clear radius block the claim; clearing unblocks it", () => {
    const sim = testSim();
    const s = sim.state;
    clearField(sim);
    const poiId = discoverType(sim, "ruin");
    // Enemies converging on the POI contest it (deterministic placement).
    const ev: never[] = [];
    const a = sim.spawnEnemy("chaser", false, false, 0, 100, ev);
    const b = sim.spawnEnemy("chaser", false, false, Math.PI, 120, ev);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    sim.step(1 / 60, IDLE); // rebuild index, foes close in
    const listed = sim.claimablePOIs().find((c) => c.poiId === poiId);
    expect(listed).toBeDefined();
    expect(listed?.clear).toBe(false);
    expect(sim.claimTerritory(poiId)).toEqual([]);
    expect(s.territories).toHaveLength(0);
    // Clearing the field (real kills, same as combat) unblocks the claim.
    for (let i = 0; i < s.enemies.length; i++) {
      if (s.enemies[i]?.active) sim.debugDamageEnemy(i, 99999);
    }
    sim.step(1 / 60, IDLE);
    expect(sim.claimablePOIs().find((c) => c.poiId === poiId)?.clear).toBe(true);
    expect(sim.claimTerritory(poiId).some((e) => e.type === "territory_claimed")).toBe(true);
    expect(s.territories).toHaveLength(1);
  });
});
