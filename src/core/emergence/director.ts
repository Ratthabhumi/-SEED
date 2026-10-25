// v0.24 Director — phased pacing with deterministic choices
// Phases: RELAX → BUILD → PEAK → RECOVER

import { createStreamRng } from "../seed/streams";

export type DirectorPhase = "RELAX" | "BUILD" | "PEAK" | "RECOVER";

type DirectorState = {
  phase: DirectorPhase;
  phaseTimer: number;
  phaseDuration: number;
  pressure: number;
  recentEvents: Array<{ type: string; simTime: number }>;
};

type DirectorConfig = {
  basePressure: number;
  pressurePerEnemy: number;
  pressurePerTerritory: number;
  relaxThreshold: number;
  buildThreshold: number;
  peakThreshold: number;
  recoverThreshold: number;
  phaseDurations: Record<string, { min: number; max: number }>;
}

const DEFAULT_DIRECTOR_CONFIG = {
  basePressure: 0.1,
  pressurePerEnemy: 0.02,
  pressurePerTerritory: 0.03,
  relaxThreshold: 0.2,
  buildThreshold: 0.4,
  peakThreshold: 0.7,
  recoverThreshold: 0.3,
  phaseDurations: {
    RELAX: { min: 30, max: 60 },
    BUILD: { min: 45, max: 90 },
    PEAK: { min: 60, max: 120 },
    RECOVER: { min: 20, max: 40 },
  },
};

function generateDirector(
  masterSeed: string,
  config: typeof DEFAULT_DIRECTOR_CONFIG = DEFAULT_DIRECTOR_CONFIG
) {
  const rng = createStreamRng(masterSeed, "director");

  function computePressure(sim: {
    player: { hp: number; maxHp: number; px: number; py: number };
    enemies: Array<{ active: boolean; x: number; y: number; hp: number }>;
    territories: Array<{ disabled: boolean; x: number; y: number }>;
    simTime: number;
    ageIndex: number;
  }): number {
    let p = 0.1;
    const activeEnemies = sim.enemies.filter(e => e.active).length;
    p += activeEnemies * 0.02;
    const activeTerritories = sim.territories.filter(t => !t.disabled).length;
    p += activeTerritories * 0.03;
    const hpRatio = sim.player.hp / sim.player.maxHp;
    if (hpRatio < 0.3) p += 0.2;
    if (hpRatio < 0.1) p += 0.3;
    return Math.min(1.0, Math.max(0.0, p));
  }

  let state = {
    phase: "RELAX" as "RELAX" | "BUILD" | "PEAK" | "RECOVER",
    phaseTimer: 0,
    phaseDuration: 45,
    pressure: 0.1,
    recentEvents: [] as Array<{ type: string; simTime: number }>,
  };

  function step(sim: {
    player: { hp: number; maxHp: number; px: number; py: number };
    enemies: Array<{ active: boolean; x: number; y: number; hp: number }>;
    territories: Array<{ disabled: boolean; x: number; y: number }>;
    simTime: number;
    ageIndex: number;
  }, dt: number) {
    state.pressure = computePressure(sim);
    state.phaseTimer += dt;

    const checkTransition = () => {
      const dur = state.phaseDuration;
      const pressure = state.pressure;
      let nextPhase = state.phase;

      switch (state.phase) {
        case "RELAX":
          if (state.pressure > 0.4) nextPhase = "BUILD";
          break;
        case "BUILD":
          if (state.pressure > 0.7) nextPhase = "PEAK";
          else if (state.pressure < 0.2 && state.phaseTimer > dur * 0.5) nextPhase = "RELAX";
          break;
        case "PEAK":
          if (state.pressure < 0.3) nextPhase = "RECOVER";
          break;
        case "RECOVER":
          if (state.pressure < 0.2) nextPhase = "RELAX";
          else if (state.pressure > 0.4) nextPhase = "BUILD";
          break;
      }

      if (nextPhase !== state.phase) {
        state.phase = nextPhase;
        state.phaseTimer = 0;
        state.phaseDuration = 45 + rng.nextFloat() * 30;
      }
    };

    checkTransition();
    state.phaseTimer += dt;
  }

  function checkTransition() {
    const dur = state.phaseDuration;
    const pressure = state.pressure;
    let nextPhase = state.phase;

    switch (state.phase) {
      case "RELAX":
        if (state.pressure > 0.4) nextPhase = "BUILD";
        break;
      case "BUILD":
        if (state.pressure > 0.7) nextPhase = "PEAK";
        else if (state.pressure < 0.2 && state.phaseTimer > dur * 0.5) nextPhase = "RELAX";
        break;
      case "PEAK":
        if (state.pressure < 0.3) nextPhase = "RECOVER";
        break;
      case "RECOVER":
        if (state.pressure < 0.2) nextPhase = "RELAX";
        else if (state.pressure > 0.4) nextPhase = "BUILD";
        break;
      }

      if (nextPhase !== state.phase) {
        state.phase = nextPhase;
        state.phaseTimer = 0;
        state.phaseDuration = 45 + rng.nextFloat() * 30;
      }
    }

    return { state, step, getState: () => state, rng };
  }

// export { generateDirector, type DirectorState, type DirectorConfig, DEFAULT_DIRECTOR_CONFIG };
export { generateDirector, type DirectorState, type DirectorConfig, DEFAULT_DIRECTOR_CONFIG };