import { describe, it, expect } from "vitest";
import { classifySite, frontierObjective, type FrontierSite } from "../../src/game/frontier/sites";

const BASE = { discovered: true, claimed: false, disabled: false, underAttack: false, foes: 0, inReach: false };

function site(over: Partial<FrontierSite> = {}): FrontierSite {
  return {
    poiId: "poi-1", poiType: "ruin", x: 100, y: 0, dist: 100, foes: 0,
    state: "DISCOVERED", ...over,
  };
}

describe("site states", () => {
  it("classifies every documented state", () => {
    expect(classifySite({ ...BASE, discovered: false })).toBe("UNSEEN");
    expect(classifySite(BASE)).toBe("DISCOVERED");
    expect(classifySite({ ...BASE, foes: 3 })).toBe("CONTESTED");
    expect(classifySite({ ...BASE, inReach: true })).toBe("CLAIMABLE");
    // Foes beat reach: a threatened site is contested, never claimable.
    expect(classifySite({ ...BASE, foes: 1, inReach: true })).toBe("CONTESTED");
    expect(classifySite({ ...BASE, claimed: true })).toBe("CLAIMED");
    expect(classifySite({ ...BASE, claimed: true, underAttack: true })).toBe("UNDER_ATTACK");
    expect(classifySite({ ...BASE, claimed: true, disabled: true, underAttack: true })).toBe("DISABLED");
  });
});

describe("frontier objective priority", () => {
  const inp = {
    raid: null,
    stronghold: null,
    bossActive: false,
    openSites: [] as FrontierSite[],
    dominionHave: 0,
    dominionNeed: 1,
  };
  it("raid defense outranks everything", () => {
    const o = frontierObjective({
      ...inp,
      raid: { poiId: "p", x: 1, y: 2, tMinus: 9 },
      stronghold: { x: 0, y: 0, revealed: true },
      openSites: [site({ state: "CLAIMABLE" })],
    });
    expect(o?.kind).toBe("raid");
  });
  it("stronghold beats claim/clear/dominion once revealed", () => {
    const o = frontierObjective({
      ...inp,
      stronghold: { x: 5, y: 6, revealed: true },
      openSites: [site({ state: "CLAIMABLE" }), site({ state: "CONTESTED" })],
    });
    expect(o?.kind).toBe("stronghold");
    expect(o?.site?.x).toBe(5);
  });
  it("claim beats clear beats dominion beats navigate", () => {
    expect(frontierObjective({ ...inp, openSites: [site({ state: "CLAIMABLE" }), site({ state: "CONTESTED" })] })?.kind).toBe("claim");
    expect(frontierObjective({ ...inp, openSites: [site({ state: "CONTESTED" })] })?.kind).toBe("clear");
    expect(frontierObjective({ ...inp })?.kind).toBe("dominion");
    expect(frontierObjective({ ...inp, dominionHave: 1, openSites: [site()] })?.kind).toBe("site");
    expect(frontierObjective({ ...inp, dominionHave: 1 })).toBeNull();
  });
});
