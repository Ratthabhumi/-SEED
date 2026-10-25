// Run configuration — everything that defines a deterministic run besides inputs.
export interface RunConfig {
  /** Display/master seed (original user string, preserved for sharing). */
  masterSeed: string;
  weaponMount?: import('../combat/weaponGeometry').WeaponMount;
  /** Difficulty multiplier for the threat budget. */
  difficultyMul?: number;
  /** Civilization origin id (validated against ORIGINS; default hunters). */
  originId?: string;
  archivePerks?: readonly string[];
  archiveEnergyStart?: boolean;
}
