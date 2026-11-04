/** Existing ordinary director, after the first real choice in World1 only.
 * Three packet boundaries per396ticks (6.6s): two1.2s gaps, one4.2s recovery.
 * Absolute tick boundaries avoid accumulating fractional cooldown drift.
 * Initial survival, Boss scheduling and child worlds retain2.2s cadence. */
export function ordinaryWaveInterval(elapsed:number,ascension:number,hasChosenTech:boolean,bossSpawned:boolean):number{
 if(!hasChosenTech||ascension>0||bossSpawned)return 2.2;
 const phase=Math.round(elapsed*60)%396;
 const next=phase<72?72:phase<144?144:396;
 // Entering this rhythm partway through a cycle must leave time to react.
 return Math.max(1.2,(next-phase)/60);
}
