import { describe, it, expect } from "vitest";
import { isQAMode, GOLDEN_QA_SEED, QA_QUERY_KEY } from "../../src/qa/qaMode";

describe("qa mode detection", () => {
  it("activates only with the explicit query flag", () => {
    expect(isQAMode("?qa=1")).toBe(true);
    expect(isQAMode("?qa=")).toBe(true);
    expect(isQAMode("?foo=1&qa=1&bar=2")).toBe(true);
    expect(isQAMode("")).toBe(false);
    expect(isQAMode("?e2e")).toBe(false);
    expect(isQAMode("?qax=1")).toBe(false);
    expect(isQAMode("not a query")).toBe(false);
  });

  it("pins the golden human-gate seed", () => {
    expect(GOLDEN_QA_SEED).toBe("EPOCH-GOLDEN-001");
    expect(QA_QUERY_KEY).toBe("qa");
  });
});
