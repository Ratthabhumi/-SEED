// Six ages: min time + knowledge threshold + objective.
import type { AgeId } from "../tech/graph";

export interface AgeDef {
  id: AgeId;
  index: number;
  minTimeSec: number;
  knowledgeThreshold: number;
  objectiveKey: string;
}

export const AGE_DEFS: AgeDef[] = [
  { id: "stone", index: 0, minTimeSec: 0, knowledgeThreshold: 0, objectiveKey: "objective.stone" },
  { id: "bronze", index: 1, minTimeSec: 100, knowledgeThreshold: 500, objectiveKey: "objective.bronze" },
  { id: "iron", index: 2, minTimeSec: 220, knowledgeThreshold: 1500, objectiveKey: "objective.iron" },
  { id: "industrial", index: 3, minTimeSec: 340, knowledgeThreshold: 2800, objectiveKey: "objective.industrial" },
  { id: "atomic", index: 4, minTimeSec: 460, knowledgeThreshold: 4500, objectiveKey: "objective.atomic" },
  { id: "space", index: 5, minTimeSec: 580, knowledgeThreshold: 6500, objectiveKey: "objective.space" },
];

/** Can advance from current age to nextIndex given total time + age dwell + knowledge + objective. */
export function canAdvanceAge(
  nextIndex: number,
  elapsedTotalSec: number,
  ageElapsedSec: number,
  totalKnowledge: number,
  objectiveDone: boolean,
): boolean {
  const def = AGE_DEFS[nextIndex];
  if (!def) return false;
  return (
    elapsedTotalSec >= def.minTimeSec &&
    ageElapsedSec >= dwellFor(nextIndex) &&
    totalKnowledge >= def.knowledgeThreshold &&
    objectiveDone
  );
}

/** Minimum dwell time inside current age before breakthrough allowed. */
export function dwellFor(nextIndex: number): number {
  return [0, 70, 80, 80, 80, 80][nextIndex] ?? 80;
}

export function ageIndexOf(id: AgeId): number {
  return AGE_DEFS.findIndex((a) => a.id === id);
}
