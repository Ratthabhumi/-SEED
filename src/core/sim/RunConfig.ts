// Run configuration — everything that defines a deterministic run besides inputs.
export interface RunConfig {
  /** Display/master seed (original user string, preserved for sharing). */
  masterSeed: string;
  /** Difficulty multiplier for the threat budget. */
  difficultyMul?: number;
}
