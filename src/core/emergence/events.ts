// v0.24 Events — memorable procedural moments
// Small grammar: trigger → location → choice → consequence

export type EffectType = 
  | "knowledge" 
  | "tech_offer" 
  | "outpost" 
  | "enemy" 
  | "resource" 
  | "legacy" 
  | "none"
  | "reveal_site"
  | "breakthrough"
  | "spawn_enemy"
  | "spawn_site"
  | "reveal"
  | "knowledge_burst"
  | "anomaly_resonance"
  | "morale"
  | "suppress"
  | "suppress_faction"
  | "ambush"
  | "legacy";

export type EventType = 
  | "meteor_migration" 
  | "hostile_signal" 
  | "ancient_cache" 
  | "civilization_schism" 
  | "enemy_incursion" 
  | "technology_anomaly";

export interface Event {
  id: string;
  type: EventType;
  trigger: EventType | { condition: string; params: Record<string, number> };
  location: {
    x: number;
    y: number;
    biome: string;
    nearSite?: string;
  };
  choices: Array<{
    id: string;
    labelKey: string;
    effect: {
      type: EffectType;
      params: Record<string, number | string>;
    };
  }>;
  consequence: {
    immediate: Array<{ type: string; params: Record<string, number | string> }>;
    delayed: Array<{ type: string; delay: number; params: Record<string, number | string> }>;
  };
  metadata: {
    rarity: "common" | "uncommon" | "rare" | "mythic";
    cooldown: number; // seconds before this event can fire again
    minAge: number; // ageIndex minimum
    maxAge: number; // ageIndex maximum
  };
}

export interface EventTemplate {
  type: EventType;
  trigger: EventType;
  choices: Array<{
    id: string;
    labelKey: string;
    effect: { type: EffectType; params: Record<string, number | string> };
  }>;
  consequence: {
    immediate: Array<{ type: string; params: Record<string, number | string> }>;
    delayed: Array<{ type: string; delay: number; params: Record<string, number | string> }>;
  };
  metadata: {
    rarity: "common" | "uncommon" | "rare" | "mythic";
    cooldown: number;
    minAge: number;
    maxAge: number;
  };
}

const EVENT_TEMPLATES: Record<string, {
  type: EventType;
  trigger: EventType;
  choices: Array<{
    id: string;
    labelKey: string;
    effect: { type: EffectType; params: Record<string, number | string> };
  }>;
  consequence: {
    immediate: Array<{ type: string; params: Record<string, number | string> }>;
    delayed: Array<{ type: string; delay: number; params: Record<string, number | string> }>;
  };
  metadata: {
    rarity: "common" | "uncommon" | "rare" | "mythic";
    cooldown: number;
    minAge: number;
    maxAge: number;
  };
}> = {
  meteor_migration: {
    type: "meteor_migration",
    trigger: "meteor_migration",
    choices: [
      {
        id: "harvest",
        labelKey: "event.meteor.harvest",
        effect: { type: "resource", params: { knowledge: 200, material: "meteorite" } },
      },
      {
        id: "study",
        labelKey: "event.meteor.study",
        effect: { type: "tech_offer", params: { domain: "science", quality: "uncommon" } },
      },
      {
        id: "ignore",
        labelKey: "event.meteor.ignore",
        effect: { type: "none", params: {} },
      },
    ],
    consequence: {
      immediate: [{ type: "spawn_enemy", params: { type: "chaser", count: 3 } }],
      delayed: [{ type: "spawn_site", params: { type: "meteor" }, delay: 120 }],
    },
    metadata: { rarity: "uncommon", cooldown: 300, minAge: 1, maxAge: 4 },
  },
  hostile_signal: {
    type: "hostile_signal",
    trigger: "hostile_signal",
    choices: [
      {
        id: "decrypt",
        labelKey: "event.signal.decrypt",
        effect: { type: "tech_offer", params: { domain: "science", quality: "rare" } },
      },
      {
        id: "jam",
        labelKey: "event.signal.jam",
        effect: { type: "enemy", params: { type: "suppress", duration: 60 } },
      },
      {
        id: "trace",
        labelKey: "event.signal.trace",
        effect: { type: "reveal_site", params: { type: "signal" } },
      },
    ],
    consequence: {
      immediate: [{ type: "reveal", params: { type: "signal" } }],
      delayed: [{ type: "spawn_enemy", params: { type: "ranged", count: 5 }, delay: 30 }],
    },
    metadata: { rarity: "rare", cooldown: 400, minAge: 2, maxAge: 5 },
  },
  ancient_cache: {
    type: "ancient_cache",
    trigger: "ancient_cache",
    choices: [
      {
        id: "claim",
        labelKey: "event.cache.claim",
        effect: { type: "resource", params: { knowledge: 500, tech: "random" } },
      },
      {
        id: "study",
        labelKey: "event.cache.study",
        effect: { type: "breakthrough", params: { progress: "random" } },
      },
      {
        id: "leave",
        labelKey: "event.cache.leave",
        effect: { type: "none", params: {} },
      },
    ],
    consequence: {
      immediate: [{ type: "spawn_enemy", params: { type: "tank", count: 2 } }],
      delayed: [{ type: "knowledge_burst", params: { amount: 100 }, delay: 10 }],
    },
    metadata: { rarity: "rare", cooldown: 500, minAge: 1, maxAge: 5 },
  },
  civilization_schism: {
    type: "civilization_schism",
    trigger: "civilization_schism",
    choices: [
      {
        id: "mediate",
        labelKey: "event.schism.mediate",
        effect: { type: "legacy", params: { type: "diplomatic" } },
      },
      {
        id: "support",
        labelKey: "event.schism.support",
        effect: { type: "outpost", params: { spec: "military", tier: 2 } },
      },
      {
        id: "suppress",
        labelKey: "event.schism.suppress",
        effect: { type: "enemy", params: { type: "suppress_faction", duration: 120 } },
      },
    ],
    consequence: {
      immediate: [{ type: "morale", params: { delta: 10 } }],
      delayed: [{ type: "spawn_site", params: { type: "vault" }, delay: 180 }],
    },
    metadata: { rarity: "mythic", cooldown: 800, minAge: 3, maxAge: 5 },
  },
  enemy_incursion: {
    type: "enemy_incursion",
    trigger: "enemy_incursion",
    choices: [
      {
        id: "defend",
        labelKey: "event.incursion.defend",
        effect: { type: "outpost", params: { spec: "military", tier: 1 } },
      },
      {
        id: "evacuate",
        labelKey: "event.incursion.evacuate",
        effect: { type: "resource", params: { knowledge: 300 } },
      },
      {
        id: "ambush",
        labelKey: "event.incursion.ambush",
        effect: { type: "enemy", params: { type: "ambush", count: 8 } },
      },
    ],
    consequence: {
      immediate: [{ type: "spawn_enemy", params: { type: "raider", count: 6 } }],
      delayed: [{ type: "raid", params: { intensity: "high" }, delay: 60 }],
    },
    metadata: { rarity: "uncommon", cooldown: 350, minAge: 2, maxAge: 5 },
  },
  technology_anomaly: {
    type: "technology_anomaly",
    trigger: "technology_anomaly",
    choices: [
      {
        id: "study",
        labelKey: "event.anomaly.study",
        effect: { type: "tech_offer", params: { domain: "science", quality: "mythic" } },
      },
      {
        id: "contain",
        labelKey: "event.anomaly.contain",
        effect: { type: "legacy", params: { type: "anomaly_containment" } },
      },
      {
        id: "harness",
        labelKey: "event.anomaly.harness",
        effect: { type: "tech_offer", params: { domain: "energy", quality: "rare" } },
      },
    ],
    consequence: {
      immediate: [{ type: "spawn_enemy", params: { type: "swarm", count: 4 } }],
      delayed: [{ type: "anomaly_resonance", params: { strength: 2 }, delay: 60 }],
    },
    metadata: { rarity: "mythic", cooldown: 1000, minAge: 3, maxAge: 5 },
  },
};

export function generateEvents(
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>,
  simState: {
    simTime: number;
    ageIndex: number;
    ascension: number;
    territories: Array<{ x: number; y: number; disabled: boolean }>;
    playerPos: { x: number; y: number };
    eventsFired: Map<string, number>;
  }
): Array<{ event: Event; x: number; y: number }> {
  const events: Array<{ event: Event; x: number; y: number }> = [];
  
  // Check cooldowns
  // For each template, check if cooldown expired and conditions met
  // Deterministic selection via RNG
  
  return [];
}

export function canFireEvent(
  template: EventTemplate,
  simState: {
    simTime: number;
    ageIndex: number;
    eventsFired: Map<string, number>;
  }
): boolean {
  if (simState.ageIndex < template.metadata.minAge) return false;
  if (simState.ageIndex > template.metadata.maxAge) return false;
  const lastFired = simState.eventsFired.get(template.type) || 0;
  if (simState.simTime - lastFired < template.metadata.cooldown) return false;
  return true;
}

export function fireEvent(
  template: EventTemplate,
  location: { x: number; y: number; biome: string },
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>
): Event {
  const event: Event = {
    id: `${template.type}_${Date.now()}_${rng.nextInt(0, 1000000)}`,
    type: template.type,
    trigger: template.trigger,
    location,
    choices: template.choices,
    consequence: template.consequence,
    metadata: template.metadata,
  };
  return event;
}