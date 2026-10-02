// v0.24 Emergence exports
export { generateWorldLaws, worldLawsAffix, type WorldLaws } from "./worldLaws";
export { 
  generateOffers, 
  gumbelTopK, 
  computeOfferScore, 
  DEFAULT_OFFER_CONFIG,
  type OfferCandidate,
  type OfferEngineConfig,
  type TechOfferContext 
} from "./offerEngine";
export { 
  ORIGIN_RULESETS, 
  getOriginRuleset, 
  applyOriginEffects,
  type OriginRuleset,
  type OriginRulesetId,
  // systems
  hunterMarkPrey,
  hunterOnMarkedKill,
  engineerFabricate,
  resonantAddHarmonic,
  resonantCheckCombo,
  sentinelLinkSites,
  sentinelNetworkBonus,
} from "./originRulesets";
export { 
  DEFAULT_OUTPOST_CONFIG,
  type OutpostConfig,
  type OutpostState,
  calculateMaxLogistics,
  calculateLogisticsCost,
  canFoundOutpost,
  applyFoundOutpost,
  applyUpgradeOutpost,
  calculateKnowledgeUpgradeCost,
  toggleGarrison,
  calculateGarrisonBenefit,
} from "./outpostLogistics";
export { 
  generateEcology, 
  composeEncounter, 
  getArchetypeCounterplay,
  type EnemyArchetype,
  type EcologyWeights,
} from "./enemyEcology";
export { 
  generateDirector, 
  type DirectorState, 
  type DirectorConfig,
  DEFAULT_DIRECTOR_CONFIG,
} from "./director";
export { 
  generateEvents, 
  canFireEvent, 
  fireEvent,
  type Event,
  type EventType,
} from "./events";