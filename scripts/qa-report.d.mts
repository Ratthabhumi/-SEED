export declare function buildSanitizedMarkdown(snap: unknown): string;
export declare function sanitizePrivacy(text: unknown): string;
export declare function getReportOutputPath(snap: unknown, rootDir?: string): string;
export declare function getSessionReportPath(snap: any, rootDir?: string): string | null;
export declare function readLatestQaSnapshot(rootDir?: string, read?: (path:string)=>string, list?: (path:string)=>string[]): {snap:any;recovered:boolean};
