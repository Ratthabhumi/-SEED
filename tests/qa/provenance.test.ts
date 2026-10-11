import { it, expect } from "vitest";
import { reconcileBuildProvenance } from "../../scripts/build-provenance.mjs";
import { buildSanitizedMarkdown } from "../../scripts/qa-report.mjs";
const a = "a".repeat(40), b = "b".repeat(40);
it("does not stamp a running old bundle with a newly committed SHA", () => {
  expect(reconcileBuildProvenance({buildSha:a, buildDirty:false}, {buildSha:b, buildDirty:false})).toEqual({buildSha:a, buildDirty:true, reportSavedSha:b});
});
it("keeps missing historical bundle provenance unknown", () => {
  expect(reconcileBuildProvenance({}, {buildSha:b, buildDirty:false}).buildSha).toBe("UNKNOWN");
});
it("a dirty bundle cannot become clean merely by committing it", () => {
  expect(reconcileBuildProvenance({buildSha:a, buildDirty:true}, {buildSha:a, buildDirty:false}).buildDirty).toBe(true);
  expect(reconcileBuildProvenance({buildSha:a, buildDirty:false}, {buildSha:a, buildDirty:false}).buildDirty).toBe(false);
});
it("flags historical negative durations without inventing a corrected duration", () => {
  const report = buildSanitizedMarkdown({wallStart:15000, wallEnd:720});
  expect(report).toContain("historical clock-unit mismatch");
  expect(report).not.toContain("-14.28s");
});
