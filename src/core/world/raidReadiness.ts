/** Gate-aware acceleration keeps the normal interval and full warning window. */
export const RAID_GATE_WAIT = 30;
export const RAID_CLAIM_GRACE = 45;
export const RAID_RETRY_SECONDS = 5;
export const RAID_MAX_UNITS = 12;

export function raidDelay(elapsed: number, lastRaidAt: number, normalInterval: number, readySince: number | null): number {
  const normal = lastRaidAt + normalInterval;
  const due = readySince === null ? normal
    : Math.min(normal, Math.max(lastRaidAt + RAID_CLAIM_GRACE, readySince + RAID_GATE_WAIT));
  return Math.max(0, due - elapsed);
}
