import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import type { Territory } from "../../src/core/world/territory";
import { territoryKnowledgeBonus, economyRegenAt } from "../../src/core/world/territory";
import { biomeSpecializationMultiplier } from "../../src/core/world/biomeRules";
import { WEB_NODE_CAP, WEB_DEPTH_CAP, WEB_SLOT_CAP, expandTechWeb } from "../../src/core/tech/web";
import { validateTechGraph } from "../../src/core/tech/validator";
import { layoutTechGraph } from "../../src/game/tech/TechGraphLayout";
import { en } from "../../src/i18n/en";
import { th } from "../../src/i18n/th";
import { canAdvanceAge } from "../../src/core/progression/ages";

function sim(seed = "EPOCH-GOLDEN-001") { return new RunSimulation({ masterSeed: seed, originId: "engineers" }); }
function site(id: string, spec: Territory["spec"] = "research", poiType: Territory["poiType"] = "ruin"): Territory {
  return { poiId: id, poiType, x: 0, y: 0, spec, tier: 1, hp: 120, maxHp: 300, disabled: false, garrisoned: false, heldSince: 0, repairT: 0 };
}

describe("human-observed logistics allocation", () => {
  it("full Industrial logistics blocks the Atomic upgrade mission until explicit reallocation", () => {
    const x = sim(); const s = x.state;
    s.ageIndex = 3; s.elapsed = 703; s.logistics = s.maxLogistics = 6;
    s.knowledgeTotal = 5000; s.elitesAge = 2; s.raidsSurvived = 1;
    s.territories.push(...[0,1,2].map((i) => site(`post-${i}`, "military")));
    const canAdvance = () => canAdvanceAge(4, s.knowledgeTotal, {
      ageKills: s.ageKills, territoriesClaimed: 3, elitesAge: s.elitesAge,
      outpostsTier2: s.territories.filter((t) => !t.disabled && t.tier === 2).length,
      raidsSurvived: s.raidsSurvived, signalSecured: s.signalSecured, breakthroughs: s.breakthroughs.length,
    }, { active: 3, specialized: s.territories.filter((t) => t.spec).length,
      tier2: s.territories.filter((t) => t.tier === 2).length, raidsSurvived: s.raidsSurvived });
    expect(canAdvance()).toBe(false); expect(x.upgradeOutpost("post-0")).toEqual([]);
    x.dismantleOutpost("post-2"); x.upgradeOutpost("post-0");
    expect(s.logistics).toBe(5); expect(canAdvance()).toBe(true);
    const events = x.step(1 / 60, { moveX: 0, moveY: 0, dashPressed: false });
    expect(events).toContainEqual({ type: "age_reached", age: "atomic" });
    expect(s.ageIndex).toBe(4); expect(s.maxLogistics).toBe(7);
  });
  it("6/6 upgrade is rejected atomically and reports its exact missing capacity", () => {
    const x = sim(); const s = x.state;
    s.ageIndex = 3; s.elapsed = 100; s.logistics = s.maxLogistics = 6; s.knowledgeTotal = 1000;
    s.territories.push(site("r"));
    expect(x.outpostUpgradeStatus("r")).toMatchObject({ allowed: false, reason: "logistics", logisticsCost: 1 });
    const before = x.snapshot(); expect(x.upgradeOutpost("r")).toEqual([]); expect(x.snapshot()).toBe(before);
  });
  it("reallocation returns charged capacity, keeps land and damage, then permits upgrade", () => {
    const x = sim(); const s = x.state;
    s.ageIndex = 3; s.elapsed = 100; s.logistics = s.maxLogistics = 6; s.knowledgeTotal = 1000;
    const released = site("release", "military"); released.tier = 2;
    // All six committed points must have actual reservations, not a phantom counter.
    s.territories.push(released, site("upgrade"),site("reserved","military"));
    expect(x.dismantleOutpost("release")).toEqual([{ type: "outpost_dismantled", poiId: "release", released: 3 }]);
    expect(s.logistics).toBe(3); expect(s.knowledgeTotal).toBe(1000); expect(released).toMatchObject({ spec: "", tier: 1, hp: 120, heldSince: 100 });
    expect(s.territories).toHaveLength(3); expect(x.dismantleOutpost("release")).toEqual([]);
    expect(x.upgradeOutpost("upgrade").some((e) => e.type === "outpost_upgraded")).toBe(true);
    expect(s.logistics).toBe(4);
  });
  it("Signal overflow cannot be farmed by dismantling and respecializing", () => {
    const x = sim(); const s = x.state;
    s.logistics = s.maxLogistics = 6; s.ageIndex = 3;
    s.territories.push(...[0,1,2].map(i=>site(`reserved-${i}`,"military")),site("signal", "", "signal"));
    expect(x.canSetOutpostSpec("signal", "military")).toBe(true);
    x.setOutpostSpec("signal", "military"); expect(s.logistics).toBe(8);
    x.dismantleOutpost("signal"); expect(s.logistics).toBe(6);
    expect(s.signalSecured).toBe(true); expect(x.canSetOutpostSpec("signal", "military")).toBe(false);
  });
  it("returns a living garrison member within the reduced cap without healing", () => {
    const x = sim(); const t = site("garrison"); t.garrisoned = true;
    x.state.territories.push(t); x.state.logistics = 1;
    const reserve = x.state.squad[0]!; reserve.active = false; reserve.hp = 7;
    for (const ally of x.state.squad.slice(1)) ally.active = false;
    x.dismantleOutpost(t.poiId);
    expect(reserve.active).toBe(true); expect(reserve.hp).toBe(7);
  });
  it("raid target cannot be dismantled to cancel an attack", () => {
    const x = sim(); x.state.territories.push(site("target"));
    x.state.raid = { poiId: "target", tMinus: 10, landed: false };
    const before = x.snapshot(); expect(x.dismantleOutpost("target")).toEqual([]); expect(x.snapshot()).toBe(before);
  });
  it("disabled bases keep damage and disabled state after releasing their committed cost", () => {
    const x = sim(); const t = site("lost"); t.disabled = true; t.hp = 0;
    x.state.territories.push(t); x.state.logistics = 1;
    x.dismantleOutpost(t.poiId); expect(t.disabled).toBe(true); expect(t.hp).toBe(0); expect(x.state.logistics).toBe(0);
  });
});

describe("geography changes real specialization value", () => {
  it("research and supply advantages differ and disabled sites contribute nothing", () => {
    const t = site("research");
    const tundra = territoryKnowledgeBonus([t], () => biomeSpecializationMultiplier("tundra", "research"));
    const arid = territoryKnowledgeBonus([t], () => biomeSpecializationMultiplier("arid", "research"));
    expect(tundra).toBeCloseTo(.15); expect(arid).toBeCloseTo(.08);
    t.spec = "economy";
    expect(economyRegenAt([t], 0, 0, () => biomeSpecializationMultiplier("verdant", "economy"))).toBeCloseTo(2.25);
    expect(economyRegenAt([t], 801, 0)).toBe(0);
    t.disabled = true; expect(economyRegenAt([t], 0, 0)).toBe(0);
  });
  it("simulation scaling and site queries use canonical coordinates without consuming RNG", () => {
    const x = sim(); const t = site("r"); x.state.territories.push(t);
    const before = x.snapshot();
    const expected = x.state.build.knowledgeMul * (1 + .1 * x.siteMultiplier(t.x, t.y, "research"));
    expect(x.knowledgeMult()).toBeCloseTo(expected); expect(x.snapshot()).toBe(before);
  });
});

describe("bounded deterministic technology web", () => {
  it("four domain foundations radiate from one root; all generated labels are translated", () => {
    const x = sim(); const g = x.techGraph();
    expect(g.filter((n) => !n.prerequisites.length).map((n) => n.id)).toEqual(["spine-tools"]);
    const foundations = g.filter((n) => n.id.startsWith("foundation-"));
    expect(new Set(foundations.map((n) => n.domain)).size).toBe(4);
    expect(foundations.every((n) => n.prerequisites.join() === "spine-tools")).toBe(true);
    expect(g.filter((n) => n.id.startsWith("weave-")).every((n) => n.prerequisites.length === 2)).toBe(true);
    for (const n of g) { expect(n.titleKey in en).toBe(true); expect(n.titleKey in th).toBe(true); }
    const layout = layoutTechGraph(g); const root = layout.nodeMap.get("spine-tools")!;
    const quadrants = foundations.map((n) => { const p = layout.nodeMap.get(n.id)!; return `${Math.sign(p.centerX-root.centerX)},${Math.sign(p.centerY-root.centerY)}`; });
    expect(new Set(quadrants).size).toBe(4);
  });
  it("generated joins require purchased technologies in both domains, not free markers", () => {
    const x = sim(); const nodes = [...x.techGraph()];
    const parent = nodes.find((n) => n.id === "application-kinetic-0")!;
    const support = nodes.find((n) => n.id === "application-defense-0")!;
    const context = { originId: x.state.originId, ownedTags: x.state.ownedTags, ageIndex: 0, laws: x.state.worldLaws, owned: [...x.state.owned, parent.id] };
    const oneDomain = expandTechWeb(nodes, parent, "JOIN-INVESTMENT", context);
    expect(oneDomain).toHaveLength(1);
    const twoDomains = expandTechWeb(nodes, parent, "JOIN-INVESTMENT", {...context, owned:[...context.owned,support.id]});
    const join = twoDomains.find((n) => n.prerequisites.length === 2)!;
    expect(join.prerequisites).toEqual([parent.id,support.id]);
    expect(join.effects).toHaveLength(2);
    expect(join.domain).toBe(support.domain);
    expect(join.prerequisites.some((id) => id.startsWith("foundation-"))).toBe(false);
  });
  it("80 choices stay reproducible, bounded, legal and offer real alternatives", () => {
    const a = sim("WEB-TRACE"); const b = sim("WEB-TRACE");
    let expansions = 0; let alternatives = 0;
    for (let i = 0; i < 80; i++) {
      for (const x of [a,b]) {
        x.state.ageIndex = Math.min(5, Math.floor(i / 12));
        if (!x.state.draftOpen) x.gainKnowledge(100000, "probe", []);
      }
      const n = a.techGraph().length; if (a.canRerollDraft()) alternatives++;
      a.chooseDraft(0); b.chooseDraft(0);
      if (a.techGraph().length > n) expansions++;
      expect(a.snapshot()).toBe(b.snapshot());
      expect(validateTechGraph({ masterSeed: "WEB-TRACE", ascension: 0, nodes: [...a.techGraph()] }).ok).toBe(true);
    }
    expect(expansions).toBeGreaterThan(10); expect(alternatives).toBeGreaterThan(10);
    expect(a.techGraph().length).toBeLessThanOrEqual(WEB_NODE_CAP);
    for (const n of a.techGraph()) { expect(n.web!.depth).toBeLessThanOrEqual(WEB_DEPTH_CAP); expect(n.web!.slot).toBeLessThan(WEB_SLOT_CAP); }
  });
  it("read-only availability/layout queries leave both state and RNG intact", () => {
    const x = sim(); const before = x.snapshot();
    x.nodeStates(); x.canRerollDraft(); layoutTechGraph(x.techGraph());
    expect(x.snapshot()).toBe(before);
  });
  it("no unimplemented modifiers are advertised as gameplay", () => {
    const x = sim(); x.gainKnowledge(1000, "probe", []);
    expect(x.state.draftOffers.every((o) => o.modifierIds.length === 0)).toBe(true);
  });
});

