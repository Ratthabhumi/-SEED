// Strategic Site states + single-objective selection — pure presentation logic.
// Sites are existing deterministic POIs; states are DERIVED (never persisted),
// so the worldgen contract is untouched. One shared focus feeds the HUD
// objective line, compass, minimap, and Civ Map (§22: one canonical identity).
import type { POIType } from "../../core/world/poi";

export type SiteState =
  | "UNSEEN"
  | "DISCOVERED"
  | "CONTESTED"
  | "CLAIMABLE"
  | "CLAIMED"
  | "UNDER_ATTACK"
  | "DISABLED";

export interface SiteInput {
  discovered: boolean;
  claimed: boolean;
  disabled: boolean;
  underAttack: boolean;
  /** Hostiles inside CLAIM_CLEAR_RADIUS. */
  foes: number;
  /** Player inside CLAIM_REACH_RADIUS. */
  inReach: boolean;
}

export function classifySite(v: SiteInput): SiteState {
  if (!v.discovered) return "UNSEEN";
  if (v.claimed && v.disabled) return "DISABLED";
  if (v.claimed && v.underAttack) return "UNDER_ATTACK";
  if (v.claimed) return "CLAIMED";
  if (v.foes > 0) return "CONTESTED";
  if (v.inReach) return "CLAIMABLE";
  return "DISCOVERED";
}

export interface FrontierSite {
  poiId: string;
  poiType: POIType;
  x: number;
  y: number;
  dist: number;
  foes: number;
  state: SiteState;
}

export type ObjectiveKind = "raid" | "stronghold" | "claim" | "clear" | "dominion" | "site";

export interface FrontierObjective {
  kind: ObjectiveKind;
  /** The site this objective points at (undefined for dominion counts). */
  site?: FrontierSite;
  /** Dominion progress for the "expand" objective. */
  dominionHave?: number;
  dominionNeed?: number;
}

export interface FrontierFocusInput {
  raid: { poiId: string; x: number; y: number; tMinus: number } | null;
  stronghold: { x: number; y: number; revealed: boolean } | null;
  bossActive: boolean;
  /** Discovered, unclaimed sites sorted nearest-first (any distance). */
  openSites: FrontierSite[];
  dominionHave: number;
  dominionNeed: number;
}

/**
 * ONE highest-priority macro objective (§11/20):
 * raid defense > stronghold > claimable site > clear site >
 * dominion expansion > navigate to nearest site.
 */
export function frontierObjective(inp: FrontierFocusInput): FrontierObjective | null {
  if (inp.raid) {
    return {
      kind: "raid",
      site: {
        poiId: inp.raid.poiId, poiType: "ruin", x: inp.raid.x, y: inp.raid.y,
        dist: 0, foes: 0, state: "UNDER_ATTACK",
      },
    };
  }
  if (inp.stronghold?.revealed && !inp.bossActive) {
    return {
      kind: "stronghold",
      site: {
        poiId: "stronghold", poiType: "megasite", x: inp.stronghold.x, y: inp.stronghold.y,
        dist: 0, foes: 0, state: "DISCOVERED",
      },
    };
  }
  if (inp.bossActive && inp.stronghold?.revealed) {
    return {
      kind: "stronghold",
      site: {
        poiId: "stronghold", poiType: "megasite", x: inp.stronghold.x, y: inp.stronghold.y,
        dist: 0, foes: 0, state: "CONTESTED",
      },
    };
  }
  const claimable = inp.openSites.find((s) => s.state === "CLAIMABLE");
  if (claimable) return { kind: "claim", site: claimable };
  const contested = inp.openSites.find((s) => s.state === "CONTESTED");
  if (contested) return { kind: "clear", site: contested };
  if (inp.dominionNeed > inp.dominionHave) {
    return { kind: "dominion", dominionHave: inp.dominionHave, dominionNeed: inp.dominionNeed };
  }
  const next = inp.openSites[0];
  if (next) return { kind: "site", site: next };
  return null;
}
