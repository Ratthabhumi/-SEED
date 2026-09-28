// Meta progression: unlock possibility space, never raw stat inflation.
export interface ArchiveState { unlocked: string[]; }

export const ARCHIVE_OPTIONS = [
  { id: "doctrine-swarm", titleKey: "archive.swarm" },
  { id: "doctrine-wardens", titleKey: "archive.wardens" },
  { id: "anomaly-class-ii", titleKey: "archive.anomaly" },
  { id: "origin-nomads", titleKey: "archive.nomads" },
  { id: "origin-builders", titleKey: "archive.builders" },
] as const;

export function unlockArchive(a: ArchiveState, id: string): ArchiveState {
  if (a.unlocked.includes(id)) return a;
  return { unlocked: [...a.unlocked, id] };
}
