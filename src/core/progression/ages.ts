// Six ages: knowledge + mission + stabilization (v021 three-gate contract).
// The old global absolute-run-time gate is GONE: pacing comes from minimum
// time inside the CURRENT age (stabilization) plus real objectives.
import type { AgeId } from "../tech/graph";
import { missionProgress, type MissionState, type MissionStepProgress } from "./missions";

export interface AgeDef {
  id: AgeId;
  index: number;
  /** Minimum seconds inside the CURRENT age before advancing (pacing). */
  stabilizationSec: number;
  knowledgeThreshold: number;
  objectiveKey: string;
}

export const AGE_DEFS: AgeDef[] = [
  { id: "stone", index: 0, stabilizationSec: 0, knowledgeThreshold: 0, objectiveKey: "objective.stone" },
  { id: "bronze", index: 1, stabilizationSec: 100, knowledgeThreshold: 500, objectiveKey: "objective.bronze" },
  { id: "iron", index: 2, stabilizationSec: 120, knowledgeThreshold: 1500, objectiveKey: "objective.iron" },
  { id: "industrial", index: 3, stabilizationSec: 120, knowledgeThreshold: 2800, objectiveKey: "objective.industrial" },
  { id: "atomic", index: 4, stabilizationSec: 120, knowledgeThreshold: 4500, objectiveKey: "objective.atomic" },
  { id: "space", index: 5, stabilizationSec: 120, knowledgeThreshold: 6500, objectiveKey: "objective.space" },
];

export interface AgeGate {
  id: "knowledge" | "mission" | "stabilization";
  labelKey: "gate.knowledge" | "gate.mission" | "gate.stabilization";
  have: number;
  need: number;
  done: boolean;
  /** Mission step detail for the HUD checklist (empty for other gates). */
  mission: MissionStepProgress[];
}

/**
 * THE advancement contract — exactly three gates. The simulation predicate
 * and the HUD checklist consume this single function, so display and logic
 * can never disagree (contract-tested).
 */
export function ageGates(nextIndex: number, ageElapsedSec: number, totalKnowledge: number, ms: MissionState): AgeGate[] {
  const def = AGE_DEFS[nextIndex];
  if (!def || nextIndex === 0) return [];
  const mission = missionProgress(def.id as Exclude<AgeId, "stone">, ms);
  return [
    {
      id: "knowledge", labelKey: "gate.knowledge",
      have: Math.floor(totalKnowledge), need: def.knowledgeThreshold,
      done: totalKnowledge >= def.knowledgeThreshold, mission: [],
    },
    {
      id: "mission", labelKey: "gate.mission",
      have: mission.filter((m) => m.done).length, need: mission.length,
      done: mission.every((m) => m.done), mission,
    },
    {
      id: "stabilization", labelKey: "gate.stabilization",
      have: Math.floor(ageElapsedSec), need: def.stabilizationSec,
      done: ageElapsedSec >= def.stabilizationSec, mission: [],
    },
  ];
}

/** Advance iff every gate passes. */
export function canAdvanceAge(nextIndex: number, ageElapsedSec: number, totalKnowledge: number, ms: MissionState): boolean {
  if (nextIndex <= 0 || nextIndex >= AGE_DEFS.length) return false;
  return ageGates(nextIndex, ageElapsedSec, totalKnowledge, ms).every((g) => g.done);
}

/** Minimum dwell time inside current age before breakthrough allowed. */
export function dwellFor(nextIndex: number): number {
  return [0, 70, 80, 80, 80, 80][nextIndex] ?? 80;
}

export function ageIndexOf(id: AgeId): number {
  return AGE_DEFS.findIndex((a) => a.id === id);
}
