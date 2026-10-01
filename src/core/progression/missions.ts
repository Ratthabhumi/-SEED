// Age missions — every age teaches/uses a different gameplay layer.
// Pure data + progress evaluation. The advancement predicate consumes
// missionProgress(); the HUD checklist renders the SAME function output,
// so display and predicate can never disagree (contract-tested).
import type { AgeId } from "../tech/graph";
import type { EnKeys } from "../../i18n/en";

export type MissionKind = "cull" | "claim" | "slayElite" | "hold" | "upgrade" | "raid" | "signal" | "guardian" | "breakthrough";

export interface MissionStep {
  kind: MissionKind;
  need: number;
  labelKey: EnKeys;
}

export interface AgeMission {
  targetAge: AgeId;
  steps: MissionStep[];
}

/** One mission per age transition (stone has none — it IS the tutorial).
 * Missions are combat/exploration/mastery actions; territory COUNTS live in
 * the Dominion gate, never here (no exact-requirement duplication). */
export const AGE_MISSIONS: Record<Exclude<AgeId, "stone">, AgeMission> = {
  bronze: {
    targetAge: "bronze",
    steps: [{ kind: "cull", need: 10, labelKey: "mission.bronze" }],
  },
  iron: {
    targetAge: "iron",
    steps: [{ kind: "cull", need: 40, labelKey: "mission.iron.cull" }],
  },
  industrial: {
    targetAge: "industrial",
    steps: [
      { kind: "slayElite", need: 1, labelKey: "mission.industrial.elite" },
      { kind: "breakthrough", need: 1, labelKey: "mission.industrial.build" },
    ],
  },
  atomic: {
    targetAge: "atomic",
    steps: [
      { kind: "upgrade", need: 1, labelKey: "mission.atomic.upgrade" },
      { kind: "slayElite", need: 2, labelKey: "mission.atomic.elite" },
    ],
  },
  space: {
    targetAge: "space",
    steps: [
      { kind: "signal", need: 1, labelKey: "mission.space.signal" },
      { kind: "guardian", need: 2, labelKey: "mission.space.guardian" },
    ],
  },
};

/** Minimal mission-readable state (structural — any object with these fields). */
export interface MissionState {
  ageKills: number;
  territoriesClaimed: number;
  elitesAge: number;
  outpostsTier2: number;
  raidsSurvived: number;
  signalSecured: boolean;
  breakthroughs: number;
}

export interface MissionStepProgress {
  kind: MissionKind;
  need: number;
  have: number;
  done: boolean;
  labelKey: EnKeys;
}

export function stepHave(kind: MissionKind, ms: MissionState): number {
  switch (kind) {
    case "cull": return ms.ageKills;
    case "claim": return ms.territoriesClaimed;
    case "slayElite": return ms.elitesAge;
    case "hold": return ms.territoriesClaimed;
    case "upgrade": return ms.outpostsTier2;
    case "raid": return ms.raidsSurvived;
    case "signal": return ms.signalSecured ? 1 : 0;
    case "guardian": return ms.elitesAge;
    case "breakthrough": return ms.breakthroughs;
  }
}

export function missionProgress(targetAge: Exclude<AgeId, "stone">, ms: MissionState): MissionStepProgress[] {
  return AGE_MISSIONS[targetAge].steps.map((st) => {
    const have = Math.min(stepHave(st.kind, ms), st.need);
    return { kind: st.kind, need: st.need, have, done: have >= st.need, labelKey: st.labelKey };
  });
}

/** Single predicate shared by simulation advancement and HUD display. */
export function missionDone(targetAge: Exclude<AgeId, "stone">, ms: MissionState): boolean {
  return missionProgress(targetAge, ms).every((p) => p.done);
}
