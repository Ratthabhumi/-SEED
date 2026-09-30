import { describe, it, expect } from "vitest";
import {
  validateQaPayload,
  sanitizeSeed,
  stampOf,
  qaFileNames,
  storeQaReport,
  processReportPost,
  QA_SINK_MAX_BYTES,
} from "../../scripts/qa-sink.mjs";

const VALID = {
  kind: "qa-report",
  seed: "EPOCH-GOLDEN-001",
  reason: "target-complete",
  markdown: "# report",
  data: { seed: "EPOCH-GOLDEN-001", checkpoints: [] },
};

/** In-memory filesystem double — no node:fs import needed in tests. */
function memfs() {
  const files = new Map<string, string>();
  const dirs: string[] = [];
  return {
    files,
    write: (p: string, t: string): void => {
      files.set(p, t);
    },
    mkdir: (p: string): void => {
      dirs.push(p);
    },
  };
}

describe("qa sink validation", () => {
  it("accepts a valid QA payload", () => {
    expect(validateQaPayload(VALID)).toEqual({ ok: true });
  });

  it("rejects wrong kind, bad seed, bad reason, bad shape", () => {
    expect(validateQaPayload({ ...VALID, kind: "x" }).ok).toBe(false);
    expect(validateQaPayload({ ...VALID, seed: "" }).ok).toBe(false);
    expect(validateQaPayload({ ...VALID, reason: 42 }).ok).toBe(false);
    expect(validateQaPayload({ ...VALID, markdown: 42 }).ok).toBe(false);
    expect(validateQaPayload(null).ok).toBe(false);
    expect(validateQaPayload("str").ok).toBe(false);
  });

  it("rejects oversized payloads before parsing", () => {
    const out = processReportPost("/nope", "{}", QA_SINK_MAX_BYTES + 1, new Date());
    expect(out.status).toBe(400);
    expect((out.body as { reason: string }).reason).toBe("too-large");
  });

  it("rejects bad JSON and invalid payloads", () => {
    expect(processReportPost("/nope", "{oops", 6, new Date()).status).toBe(400);
    expect(processReportPost("/nope", JSON.stringify({ kind: "x" }), 12, new Date()).status).toBe(400);
  });
});

describe("qa sink filenames", () => {
  it("sanitizes hostile seeds and stamps without colons", () => {
    expect(sanitizeSeed("../../etc/passwd")).toBe("______etc_passwd");
    expect(sanitizeSeed("")).toBe("seed");
    expect(stampOf(new Date(Date.UTC(2026, 8, 30, 0, 30, 15)))).toBe("2026-09-30T003015Z");
    const names = qaFileNames(new Date(Date.UTC(2026, 8, 30)), "EPOCH-GOLDEN-001");
    expect(names).toEqual({
      json: "latest.json",
      md: "latest.md",
      sJson: "2026-09-30T000000Z-EPOCH-GOLDEN-001.json",
      sMd: "2026-09-30T000000Z-EPOCH-GOLDEN-001.md",
    });
    for (const n of Object.values(names)) {
      expect(n).not.toContain("/");
      expect(n).not.toContain("..");
      expect(n).not.toContain(":");
    }
  });
});

describe("qa sink storage", () => {
  it("writes only latest + stamped copies under the fixed directory", () => {
    const fs = memfs();
    const stored = storeQaReport(
      "/root", VALID, new Date(Date.UTC(2026, 8, 30, 1, 2, 3)), fs.write, fs.mkdir,
    );
    expect(stored.files).toHaveLength(4);
    const keys = [...fs.files.keys()].map((p) => p.split(/[\\/]/).pop() as string).sort();
    expect(keys).toEqual([
      "2026-09-30T010203Z-EPOCH-GOLDEN-001.json",
      "2026-09-30T010203Z-EPOCH-GOLDEN-001.md",
      "latest.json",
      "latest.md",
    ]);
    const latest = [...fs.files.entries()].find(([p]) => p.endsWith("latest.json"))?.[1] as string;
    expect(JSON.parse(latest).seed).toBe("EPOCH-GOLDEN-001");
  });

  it("latest report updates on repeat POSTs", () => {
    const fs = memfs();
    const root = "/root";
    const now = new Date(Date.UTC(2026, 8, 30));
    const put = (reason: string): void => {
      storeQaReport(root, { ...VALID, reason, data: { seed: VALID.seed, reason } }, now, fs.write, fs.mkdir);
    };
    put("autosave");
    put("target-complete");
    const latest = [...fs.files.entries()].find(([p]) => p.endsWith("latest.json"))?.[1] as string;
    expect(JSON.parse(latest).reason).toBe("target-complete");
  });
});
