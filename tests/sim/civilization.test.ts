// Civilization command-loop contracts (v021): tech map truth, draft agency,
// missions == predicate, territory once, outpost single-spec, raid/squad
// determinism, replay/restart equality, minimap fog, HP-bar purity.
import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { canAdvanceAge, ageGates, AGE_DEFS, dominionProgress } from "../../src/core/progression/ages";
import { missionDone, type MissionState } from "../../src/core/progression/missions";
import { AGES } from "../../src/core/tech/graph";
import { BREAKTHROUGHS } from "../../src/core/tech/synergy";
import {
  CLAIM_REACH_RADIUS, RAID_INTERVAL, activeTerritories,
  territoryKnowledgeBonus, militaryBonusSlots, outpostUpgradeCost,
} from "../../src/core/world/territory";
import { SQUAD_BASE_CAP, squadCap } from "../../src/core/combat/squad";
import { minimapCells } from "../../src/game/render/NavigationRenderer";
import {
  shouldShowHpBar, playerTrim, originGlyph, enemyTrim,
  familyShape, affixMarker, bossShapeId,
} from "../../src/game/render/VisualLanguage";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function testSim(seed = "EPOCH-GOLDEN-001"): RunSimulation {
  return new RunSimulation({ masterSeed: seed, originId: "engineers" });
}

/** Open a level draft with a fat pool to choose from. */
function openDraft(sim: RunSimulation): void {
  const ev: never[] = [];
  sim.gainKnowledge(200000, "test", ev);
  expect(sim.state.draftOpen).toBe(true);
}

function clearField(sim: RunSimulation): void {
  for (const e of sim.state.enemies) e.active = false;
  for (const p of sim.state.projs) p.active = false;
}

/** Teleport next to the nearest undiscovered POI and discover it. */
function discoverOne(sim: RunSimulation): string {
  const s = sim.state;
  clearField(sim);
  const { worldSeed, worldNonce } = s;
  outer: for (let r = 0; r < 6; r++) {
    for (let ox = -r; ox <= r; ox++) {
      for (let oy = -r; oy <= r; oy++) {
        const desc = sim.chunks.get(worldSeed, worldNonce, ox, oy);
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

describe("tech map truth", () => {
  it("nodeStates reflects the actual DAG with sim-identical availability", () => {
    const sim = testSim();
    const states = sim.nodeStates();
    expect(states.length).toBe(sim.techGraph().length);
    const avail = states.filter((x) => x.available);
    expect(avail.length).toBe(sim.generatedOptionsCount());
    // Owned nodes are never offered.
    openDraft(sim);
    sim.chooseDraft(0);
    const after = new Map(sim.nodeStates().map((x) => [x.id, x]));
    for (const id of sim.state.owned) {
      expect(after.get(id)?.available).toBe(false);
    }
  });

  it("owned tech never disappears after later picks", () => {
    const sim = testSim();
    openDraft(sim);
    const first = sim.state.draftChoices[0]?.id as string;
    sim.chooseDraft(0);
    for (let i = 0; i < 6; i++) {
      if (!sim.state.draftOpen) {
        const ev: never[] = [];
        sim.gainKnowledge(50000, "test", ev);
      }
      if (sim.state.draftOpen) sim.chooseDraft(0);
    }
    expect(sim.state.owned).toContain(first);
  });
});

describe("draft agency", () => {
  it("reserve persists exactly one compatible card across reroll and picks", () => {
    const sim = testSim();
    openDraft(sim);
    const realIdx = sim.state.draftChoices.findIndex((n) => !n.id.startsWith("fb-"));
    expect(realIdx).toBeGreaterThanOrEqual(0);
    const reserved = sim.state.draftChoices[realIdx]?.id as string;
    expect(sim.reserveCard(realIdx).some((e) => e.type === "draft_reserved")).toBe(true);
    expect(sim.state.reservedTech).toBe(reserved);
    // Reroll keeps the reservation and re-offers it (compatible pool).
    // v0.23.1 contract: either the redraw changes something (reroll spent)
    // or the pool is exhausted (reroll kept, explicit unavailable event) —
    // the reservation persists on both paths.
    const rerollEv = sim.rerollDraft();
    expect(sim.state.draftOpen).toBe(true);
    expect(sim.state.draftChoices.map((n) => n.id)).toContain(reserved);
    const rType = rerollEv[0]?.type;
    if (rType === "draft_rerolled") {
      expect(sim.state.rerolls).toBe(0);
    } else {
      expect(rType).toBe("draft_reroll_unavailable");
      expect(sim.state.rerolls).toBe(1);
    }
    // Picking another card keeps the reservation for the next draft.
    const other = sim.state.draftChoices.findIndex((n) => n.id !== reserved);
    sim.chooseDraft(other);
    expect(sim.state.reservedTech).toBe(reserved);
    // Reserving a fallback card is rejected.
    openDraft(sim);
    const fbIdx = sim.state.draftChoices.findIndex((n) => n.id.startsWith("fb-"));
    if (fbIdx >= 0) {
      expect(sim.reserveCard(fbIdx)).toEqual([]);
    }
  });

  it("reroll is bounded and deterministic", () => {
    const mk = (): RunSimulation => {
      const sim = testSim();
      openDraft(sim);
      return sim;
    };
    const a = mk();
    const b = mk();
    const before = a.snapshot();
    expect(b.snapshot()).toBe(before);
    // v0.23.1: success spends the use and changes the screen; an exhausted
    // tiny pool reports unavailable with zero mutation — both deterministic.
    const evA = a.rerollDraft();
    const evB = b.rerollDraft();
    expect(evB.map((e) => e.type)).toEqual(evA.map((e) => e.type));
    expect(b.snapshot()).toBe(a.snapshot());
    if (evA[0]?.type === "draft_rerolled") {
      expect(a.snapshot()).not.toBe(before);
    } else {
      expect(evA[0]?.type).toBe("draft_reroll_unavailable");
      expect(a.snapshot()).toBe(before);
    }
    // Bounded: a second reroll is exhausted — or was never spent because the
    // tiny pool had no alternative (v0.23.1: unavailable keeps the use).
    const second = a.rerollDraft();
    if (a.state.rerolls === 0) {
      expect(second).toEqual([]); // exhausted
    } else {
      expect(second.map((e) => e.type)).toEqual(["draft_reroll_unavailable"]);
    }
  });

  it("skip is deterministic with bounded consolation and chains queues", () => {
    const sim = testSim();
    openDraft(sim);
    const before = sim.state.knowledgeTotal;
    const level = sim.state.level;
    const mul = sim.state.build.knowledgeMul;
    const ev = sim.skipDraft();
    expect(ev.some((e) => e.type === "draft_skipped")).toBe(true);
    const gain = sim.state.knowledgeTotal - before;
    // Exact single canonical gain: (10 + 2/level) × build multiplier.
    expect(gain).toBeCloseTo((10 + level * 2) * mul, 6);
    // Bounded: always a fraction of what the next level costs.
    expect(gain).toBeLessThan(sim.state.xpNext);
  });

  it("pinned path contains target plus transitive unowned prerequisites", () => {
    const sim = testSim();
    // Pin a deep tech: path must include it and its prereq chain.
    const target = sim.techGraph().find((n) => n.prerequisites.length > 0 && !sim.state.owned.includes(n.id));
    expect(target).toBeTruthy();
    sim.pinTarget(target!.id);
    const path = sim.pinnedPathIds();
    expect(path.has(target!.id)).toBe(true);
    for (const p of target!.prerequisites) {
      if (!sim.state.owned.includes(p)) expect(path.has(p)).toBe(true);
    }
    // Pin a breakthrough: path carries nodes with its missing tags.
    const b = BREAKTHROUGHS[0]!;
    sim.pinTarget(b.id);
    const bpath = sim.pinnedPathIds();
    expect(bpath.size).toBeGreaterThan(0);
    // Unknown targets rejected.
    expect(sim.pinTarget("nope")).toEqual([]);
  });

  it("pinned weighting is deterministic for the same decision trace", () => {
    const mk = (): RunSimulation => {
      const sim = testSim();
      const target = sim.techGraph().find((n) => n.prerequisites.length > 0);
      sim.pinTarget(target!.id);
      openDraft(sim);
      return sim;
    };
    expect(mk().snapshot()).toBe(mk().snapshot());
  });
});

describe("missions == advancement predicate", () => {
  const poor: MissionState = { ageKills: 0, territoriesClaimed: 0, elitesAge: 0, outpostsTier2: 0, raidsSurvived: 0, signalSecured: false, breakthroughs: 0 };
  const rich: MissionState = { ageKills: 99, territoriesClaimed: 3, elitesAge: 5, outpostsTier2: 2, raidsSurvived: 2, signalSecured: true, breakthroughs: 2 };
  const domRich = { active: 5, specialized: 3, tier2: 2, raidsSurvived: 2 };
  const domPoor = { active: 0, specialized: 0, tier2: 0, raidsSurvived: 0 };

  it("checklist display and predicate agree on fuzzed states", () => {
    let seed = 12345;
    const rnd = (): number => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 300; i++) {
      const ms: MissionState = {
        ageKills: Math.floor(rnd() * 60),
        territoriesClaimed: Math.floor(rnd() * 4),
        elitesAge: Math.floor(rnd() * 4),
        outpostsTier2: Math.floor(rnd() * 3),
        raidsSurvived: Math.floor(rnd() * 3),
        signalSecured: rnd() > 0.5,
        breakthroughs: Math.floor(rnd() * 3),
      };
      const ds = {
        active: Math.floor(rnd() * 6),
        specialized: Math.floor(rnd() * 4),
        tier2: Math.floor(rnd() * 3),
        raidsSurvived: ms.raidsSurvived,
      };
      for (let age = 1; age < AGES.length; age++) {
        const gates = ageGates(age, Math.floor(rnd() * 9000), ms, ds);
        const target = AGE_DEFS[age]?.id;
        expect(gates).toHaveLength(3);
        if (target && target !== "stone") {
          const shown = gates.find((g) => g.id === "mission");
          expect(shown?.done).toBe(missionDone(target, ms));
        }
        expect(canAdvanceAge(age, 9000, rich, domRich)).toBe(
          ageGates(age, 9000, rich, domRich).every((g) => g.done),
        );
        expect(canAdvanceAge(age, 9000, poor, domPoor)).toBe(
          ageGates(age, 9000, poor, domPoor).every((g) => g.done),
        );
      }
    }
  });

  it("three gates only: knowledge, mission, dominion (no timer)", () => {
    const gates = ageGates(1, 0, poor, domPoor);
    expect(gates.map((g) => g.id)).toEqual(["knowledge", "mission", "dominion"]);
  });

  it("dominion requirements grow per age and ignore disabled posts", () => {
    // Bronze auto-satisfied; iron needs 1; industrial 2+1spec; atomic 3+raid; space 4+tier2+raid.
    expect(dominionProgress(1, domPoor).every((d) => d.done)).toBe(true);
    expect(dominionProgress(2, domPoor).every((d) => d.done)).toBe(false);
    expect(dominionProgress(2, { ...domPoor, active: 1 }).every((d) => d.done)).toBe(true);
    expect(dominionProgress(3, { ...domPoor, active: 2 }).every((d) => d.done)).toBe(false);
    expect(dominionProgress(3, { ...domPoor, active: 2, specialized: 1 }).every((d) => d.done)).toBe(true);
    expect(dominionProgress(4, { ...domPoor, active: 3 }).every((d) => d.done)).toBe(false);
    expect(dominionProgress(4, { ...domPoor, active: 3, raidsSurvived: 1 }).every((d) => d.done)).toBe(true);
    expect(dominionProgress(5, { ...domPoor, active: 4, tier2: 1, raidsSurvived: 1 }).every((d) => d.done)).toBe(true);
    expect(dominionProgress(5, { ...domPoor, active: 4, raidsSurvived: 1 }).every((d) => d.done)).toBe(false);
  });
});

describe("territory and outposts", () => {
  it("claim creates a territory exactly once with preconditions", () => {
    const sim = testSim();
    const poiId = discoverOne(sim);
    expect(sim.claimTerritory(poiId).some((e) => e.type === "territory_claimed")).toBe(true);
    expect(sim.state.territories).toHaveLength(1);
    expect(sim.claimTerritory(poiId)).toEqual([]); // second claim rejected
    expect(sim.state.territories).toHaveLength(1);
    expect(sim.state.history.some((h) => h.kind === "claim")).toBe(true);
  });

  it("outpost takes exactly one specialization; upgrade gated by hold time", () => {
    const sim = testSim();
    const poiId = discoverOne(sim);
    sim.claimTerritory(poiId);
    expect(sim.setOutpostSpec(poiId, "research").some((e) => e.type === "outpost_spec")).toBe(true);
    expect(sim.setOutpostSpec(poiId, "military")).toEqual([]); // irreversible
    expect(sim.state.territories[0]?.spec).toBe("research");
    expect(sim.upgradeOutpost(poiId)).toEqual([]); // not held long enough
    sim.state.elapsed += 200;
    const terr = sim.state.territories[0];
    if (terr) terr.heldSince = sim.state.elapsed - 200;
    // v0.23.1 opportunity cost: hold alone is not enough — Knowledge required.
    sim.state.knowledgeTotal = 0;
    expect(sim.upgradeOutpost(poiId)).toEqual([]);
    sim.state.knowledgeTotal = 1000;
    const before = sim.state.knowledgeTotal;
    expect(sim.upgradeOutpost(poiId).some((e) => e.type === "outpost_upgraded")).toBe(true);
    expect(sim.state.territories[0]?.tier).toBe(2);
    // Deducted exactly once (canonical stone-age cost).
    expect(before - sim.state.knowledgeTotal).toBe(outpostUpgradeCost(0));
  });

  it("research outposts scale knowledge through the single canonical gain", () => {
    const sim = testSim();
    const poiId = discoverOne(sim);
    sim.claimTerritory(poiId);
    sim.setOutpostSpec(poiId, "research");
    expect(territoryKnowledgeBonus(activeTerritories(sim.state.territories))).toBeCloseTo(0.1);
    const ev: never[] = [];
    const mul = sim.state.build.knowledgeMul;
    sim.gainKnowledge(100, "test", ev);
    expect(sim.state.knowledgeTotal).toBeCloseTo(100 * mul * 1.1, 6);
  });

  it("military outposts raise the squad cap and reinforce", () => {
    const sim = testSim();
    expect(squadCap(militaryBonusSlots(activeTerritories(sim.state.territories)))).toBe(SQUAD_BASE_CAP);
    const poiId = discoverOne(sim);
    sim.claimTerritory(poiId);
    sim.setOutpostSpec(poiId, "military");
    const cap = squadCap(militaryBonusSlots(activeTerritories(sim.state.territories)));
    expect(cap).toBe(SQUAD_BASE_CAP + 1);
    expect(sim.state.squad.filter((a) => a.active).length).toBeLessThanOrEqual(cap);
  });
});

describe("raids", () => {
  function raidedSim(): RunSimulation {
    const sim = testSim();
    const poiId = discoverOne(sim);
    sim.claimTerritory(poiId);
    sim.setOutpostSpec(poiId, "military");
    sim.state.build.hp = 1e9;
    sim.state.build.maxHp = 1e9;
    sim.state.lastRaidAt = sim.state.elapsed - RAID_INTERVAL;
    return sim;
  }

  it("raid warning then landing is deterministic", () => {
    const a = raidedSim();
    const b = raidedSim();
    for (let i = 0; i < 5; i++) {
      a.step(1 / 60, IDLE);
      b.step(1 / 60, IDLE);
    }
    expect(a.snapshot()).toBe(b.snapshot());
    expect(a.state.raid).not.toBeNull();
    // Fast-forward the warning, land the wave, repel it deterministically.
    if (a.state.raid) a.state.raid.tMinus = 0.01;
    for (let i = 0; i < 10; i++) a.step(1 / 60, IDLE);
    expect(a.state.raid?.landed).toBe(true);
    let siege = a.state.enemies.filter((e) => e.active && e.siege);
    expect(siege.length).toBeGreaterThan(0);
    // Player defends: destroy every siege unit via the debug hook.
    for (let i = 0; i < 600 && a.state.raid; i++) {
      a.state.enemies.forEach((e, idx) => {
        if (e.active && e.siege) a.debugDamageEnemy(idx, 1e6);
      });
      a.step(1 / 60, IDLE);
    }
    expect(a.state.raid).toBeNull();
    expect(a.state.raidsSurvived).toBe(1);
  });

  it("ignored raids disable the outpost (defend-or-lose)", () => {
    const sim = raidedSim();
    for (let i = 0; i < 5 && !sim.state.raid; i++) sim.step(1 / 60, IDLE);
    expect(sim.state.raid).not.toBeNull();
    if (sim.state.raid) sim.state.raid.tMinus = 0.01;
    for (let i = 0; i < 30; i++) sim.step(1 / 60, IDLE);
    expect(sim.state.raid?.landed).toBe(true);
    // Player abandons the post: teleport far so siege is undisturbed.
    sim.state.px += 3000;
    sim.state.py += 3000;
    const terr = sim.state.territories[0]!;
    terr.hp = 5; // siege contact finishes it quickly
    for (let i = 0; i < 3000 && !terr.disabled; i++) sim.step(1 / 60, IDLE);
    expect(terr.disabled).toBe(true);
    expect(sim.state.history.some((h) => h.kind === "outpost-lost")).toBe(true);
  });
});

describe("command squad and ability", () => {
  it("modes and focus are deterministic", () => {
    const a = testSim();
    const b = testSim();
    a.setSquadMode("hold");
    b.setSquadMode("hold");
    expect(a.snapshot()).toBe(b.snapshot());
    expect(a.state.squadMode).toBe("hold");
    a.setSquadMode("focus");
    b.setSquadMode("focus");
    expect(a.snapshot()).toBe(b.snapshot());
  });

  it("origin ability fires once per cooldown", () => {
    const sim = testSim(); // engineers → overdrive
    expect(sim.tryAbility().some((e) => e.type === "ability_used")).toBe(true);
    expect(sim.state.abilityCd).toBeGreaterThan(0);
    expect(sim.state.overdriveT).toBeGreaterThan(0);
    expect(sim.tryAbility()).toEqual([]); // cooling down
  });

  it("squad fire is deterministic for the same trace", () => {
    const mk = (): RunSimulation => {
      const sim = testSim();
      const ev: never[] = [];
      sim.spawnEnemy("chaser", false, false, 0, 300, ev);
      for (let i = 0; i < 120; i++) sim.step(1 / 60, IDLE);
      return sim;
    };
    expect(mk().snapshot()).toBe(mk().snapshot());
  });
});

describe("replay and restart with the new systems", () => {
  function drive(sim: RunSimulation): void {
    const ev: never[] = [];
    sim.gainKnowledge(3000, "test", ev);
    if (sim.state.draftOpen) sim.chooseDraft(1);
    sim.pinTarget("war-machine");
    sim.setSquadMode("focus");
    sim.tryAbility();
    for (let i = 0; i < 300; i++) sim.step(1 / 60, IDLE);
  }

  it("same decisions replay equally", () => {
    const a = testSim();
    const b = testSim();
    drive(a);
    drive(b);
    expect(a.snapshot()).toBe(b.snapshot());
    expect(a.hash()).toBe(b.hash());
  });

  it("restart equals a fresh instance after the same calls", () => {
    const a = testSim();
    drive(a);
    const snap = a.snapshot();
    const b = testSim();
    drive(b);
    expect(b.snapshot()).toBe(snap);
  });

  it("history is bounded and ordered", () => {
    const sim = testSim();
    for (let i = 0; i < 80; i++) {
      openDraft(sim);
      sim.chooseDraft(0);
    }
    expect(sim.state.history.length).toBeLessThanOrEqual(64);
    const times = sim.state.history.map((h) => h.t);
    const sorted = [...times].sort((x, y) => x - y);
    expect(times).toEqual(sorted);
  });
});

describe("presentation purity", () => {
  it("minimap model only marks visited chunks (fog structural)", () => {
    const cells = minimapCells(["0,0", "1,0", "0,1"], 0, 0, 2);
    expect(cells).toHaveLength(25);
    expect(cells.filter((c) => c.seen)).toHaveLength(3);
    const seenKeys = new Set(cells.filter((c) => c.seen).map((c) => `${c.ox},${c.oy}`));
    expect(seenKeys.has("0,0")).toBe(true);
    expect(seenKeys.has("1,0")).toBe(true);
    expect(seenKeys.has("0,1")).toBe(true);
  });

  it("HP-bar rule: elites/boss always, normals only when hit or focused", () => {
    const base = { elite: false, boss: false, flash: 0, focused: false };
    expect(shouldShowHpBar(base)).toBe(false);
    expect(shouldShowHpBar({ ...base, flash: 0.05 })).toBe(true);
    expect(shouldShowHpBar({ ...base, focused: true })).toBe(true);
    expect(shouldShowHpBar({ ...base, elite: true })).toBe(true);
    expect(shouldShowHpBar({ ...base, boss: true })).toBe(true);
  });

  it("visual tokens stay distinct and stable", () => {
    expect(new Set(["chaser", "ranged", "tank", "swarm"].map((f) => familyShape(f as "chaser"))).size).toBe(4);
    const affixes = ["swift", "armored", "volatile", "splitter", "shielded"].map((a) => affixMarker(a as "swift"));
    expect(new Set(affixes).size).toBe(5);
    expect(bossShapeId()).not.toBe("square");
    expect(playerTrim(0)).toBe("none");
    expect(new Set([0, 1, 2, 3, 4, 5].map(playerTrim)).size).toBe(6);
    expect(new Set(["hunters", "engineers", "resonant", "sentinels", "???"].map(originGlyph)).size).toBe(4);
    expect(enemyTrim(0)).toEqual({ plating: false, energy: false });
    expect(enemyTrim(2).plating).toBe(true);
    expect(enemyTrim(4).energy).toBe(true);
  });
});
