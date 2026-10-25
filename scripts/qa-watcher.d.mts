export declare const TERMINAL_REASONS: Set<string>;
export declare function reportIdentity(snap: any): string;
export declare function isTerminalReport(snap: any): boolean;
export declare class ReportDetector {
  constructor(initialIdentity?: string);
  shouldFinalize(snap: any): boolean;
}
export declare function getInitialReportIdentity(reportPath: string): string;
export declare function finalizeReport(
  snap: any,
  rootDir?: string,
  write?: (path: string, content: string) => void,
  read?: (path: string) => string,
  mkdir?: (path: string) => void,
  exists?: (path: string) => boolean,
): { outPath: string; handoffPath: string; md: string };
export declare function checkAndFinalize(
  reportPath: string,
  detector: ReportDetector,
  rootDir?: string,
  onFinalized?: ((res: any) => void) | null,
  read?: (path: string) => string,
  exists?: (path: string) => boolean,
  finalize?: (snap: any, rootDir: string) => any,
): any;
export declare function startReportWatcher(options: {
  reportPath: string;
  rootDir?: string;
  detector?: ReportDetector;
  pollIntervalMs?: number;
  onFinalized?: ((res: any) => void) | null;
}): { stop(): void };
