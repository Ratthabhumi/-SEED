// Six ages: knowledge + mission + dominion (v023 frontier contract).
// The abstract stabilization timer is GONE (auditor decision): pacing comes
// from territorial control plus real objectives. Mission steps are combat /
// exploration / mastery actions; territory COUNTS live only in Dominion.
import type { AgeId } from "../tech/graph";
import { missionProgress, type MissionState, type MissionStepProgress } from "./missions";
import type { EnKeys } from "../../i18n/en";

export interface DominionReq {
  /** Active (non-disabled) outposts controlled. */
  outposts: number;
  /** Of those, with a chosen specialization. */
  specialized: number;
  /** Of those, at tier 2. */
  tier2: number;
  /** Raids survived (persistent frontier-defense proof). */
  raids: number;
}

/** Live dominion state derived from territories (disabled excluded). */
export interface DominionState {
  active: number;
  specialized: number;
  tier2: number;
  raidsSurvived: number;
}

export interface AgeDef {
  id: AgeId;
  index: number;
  knowledgeThreshold: number;
  objectiveKey: string;
  dominion: DominionReq;
}

export const AGE_DEFS: AgeDef[] = [
  { id: "stone", index: 0, knowledgeThreshold: 0, objectiveKey: "objective.stone", dominion: { outposts: 0, specialized: 0, tier2: 0, raids: 0 } },
  { id: "bronze", index: 1, knowledgeThreshold: 500, objectiveKey: "objective.bronze", dominion: { outposts: 0, specialized: 0, tier2: 0, raids: 0 } },
  { id: "iron", index: 2, knowledgeThreshold: 1500, objectiveKey: "objective.iron", dominion: { outposts: 1, specialized: 0, tier2: 0, raids: 0 } },
  { id: "industrial", index: 3, knowledgeThreshold: 2800, objectiveKey: "objective.industrial", dominion: { outposts: 2, specialized: 1, tier2: 0, raids: 0 } },
  { id: "atomic", index: 4, knowledgeThreshold: 4500, objectiveKey: "objective.atomic", dominion: { outposts: 3, specialized: 0, tier2: 0, raids: 1 } },
  { id: "space", index: 5, knowledgeThreshold: 6500, objectiveKey: "objective.space", dominion: { outposts: 4, specialized: 0, tier2: 1, raids: 1 } },
];

export interface DominionSub {
  labelKey: EnKeys;
  have: number;
  need: number;
  done: boolean;
}

/** Dominion sub-requirements with live progress (only need > 0 shown in HUD). */
export function dominionProgress(nextIndex: number, ds: DominionState): DominionSub[] {
  const def = AGE_DEFS[nextIndex];
  if (!def) return [];
  const req = def.dominion;
  const rows: DominionSub[] = [
    { labelKey: "dominion.outposts", have: Math.min(ds.active, req.outposts), need: req.outposts, done: ds.active >= req.outposts },
    { labelKey: "dominion.specialized", have: Math.min(ds.specialized, req.specialized), need: req.specialized, done: ds.specialized >= req.specialized },
    { labelKey: "dominion.tier2", have: Math.min(ds.tier2, req.tier2), need: req.tier2, done: ds.tier2 >= req.tier2 },
    { labelKey: "dominion.raids", have: Math.min(ds.raidsSurvived, req.raids), need: req.raids, done: ds.raidsSurvived >= req.raids },
  ];
  return rows.filter((r) => r.need > 0);
}

export interface AgeGate {
  id: "knowledge" | "mission" | "dominion";
  labelKey: "gate.knowledge" | "gate.mission" | "gate.dominion";
  have: number;
  need: number;
  done: boolean;
  /** Mission step detail for the HUD checklist (empty for other gates). */
  mission: MissionStepProgress[];
  /** Dominion sub-requirement detail (empty for other gates). */
  sub: DominionSub[];
}

/**
 * THE advancement contract — exactly three gates. The simulation predicate
 * and the HUD checklist consume this single function, so display and logic
 * can never disagree (contract-tested).
 */
export function ageGates(nextIndex: number, totalKnowledge: number, ms: MissionState, ds: DominionState): AgeGate[] {
  const def = AGE_DEFS[nextIndex];
  if (!def || nextIndex === 0) return [];
  const mission = missionProgress(def.id as Exclude<AgeId, "stone">, ms);
  const dom = dominionProgress(nextIndex, ds);
  return [
    {
      id: "knowledge", labelKey: "gate.knowledge",
      have: Math.floor(totalKnowledge), need: def.knowledgeThreshold,
      done: totalKnowledge >= def.knowledgeThreshold, mission: [], sub: [],
    },
    {
      id: "mission", labelKey: "gate.mission",
      have: mission.filter((m) => m.done).length, need: mission.length,
      done: mission.every((m) => m.done), mission, sub: [],
    },
    {
      id: "dominion", labelKey: "gate.dominion",
      have: dom.filter((d) => d.done).length, need: dom.length,
      done: dom.every((d) => d.done), mission: [], sub: dom,
    },
  ];
}

/** Advance iff every gate passes. */
export function canAdvanceAge(nextIndex: number, totalKnowledge: number, ms: MissionState, ds: DominionState): boolean {
  if (nextIndex <= 0 || nextIndex >= AGE_DEFS.length) return false;
  return ageGates(nextIndex, totalKnowledge, ms, ds).every((g) => g.done);
}

export function ageIndexOf(id: AgeId): number {
  return AGE_DEFS.findIndex((a) => a.id === id);
}
