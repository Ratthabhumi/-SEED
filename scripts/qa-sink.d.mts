export declare const QA_SINK_MAX_BYTES: number;
export declare const QA_REPORT_DIR: string;
export declare function validateQaPayload(body: unknown): { ok: boolean; reason?: string };
export declare function sanitizeSeed(seed: string): string;
export declare function stampOf(date: Date): string;
export declare function qaFileNames(now: Date, seed: string): {
  json: string;
  md: string;
  sJson: string;
  sMd: string;
};
export declare function storeQaReport(
  rootDir: string,
  body: { seed: string; markdown: string; data: unknown; reason?: string },
  now: Date,
  write?: (path: string, text: string) => void,
  mkdir?: (path: string) => void,
): { dir: string; files: string[] };
export declare function processReportPost(
  rootDir: string,
  bodyText: string,
  byteSize: number,
  now: Date,
): { status: number; body: Record<string, unknown> };
export declare function qaSinkPlugin(): {
  name: string;
  configureServer(server: {
    middlewares: { use: (path: string, fn: (req: unknown, res: unknown, next: () => void) => void) => void };
  }): void;
};
