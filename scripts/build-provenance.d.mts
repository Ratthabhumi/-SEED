export interface BuildProvenance { buildSha: string; buildDirty: boolean | "UNKNOWN"; }
export declare function readBuildProvenance(rootDir?: string): BuildProvenance;
export declare function reconcileBuildProvenance(bundled: Partial<BuildProvenance>, saved: BuildProvenance): BuildProvenance & { reportSavedSha: string };
