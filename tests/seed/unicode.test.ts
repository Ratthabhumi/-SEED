import { describe, it, expect } from "vitest";
import { normalizeSeedString } from "../../src/core/seed/hash";
import { getChunkDescriptor } from "../../src/core/world/chunks";

describe("seed unicode normalization (NFC)", () => {
  it("canonically equivalent Thai seeds normalize identically", () => {
    const composed = "เมล็ดพันธุ์แห่งอารยธรรม";
    const decomposed = composed.normalize("NFD");
    expect(normalizeSeedString(composed)).toBe(normalizeSeedString(decomposed));
  });

  it("equivalent seeds generate identical chunks", () => {
    const a = normalizeSeedString("EPOCH-ไทย-001");
    const b = normalizeSeedString("EPOCH-ไทย-001".normalize("NFD"));
    expect(a).toBe(b);
    expect(getChunkDescriptor(a, 3, -7)).toEqual(getChunkDescriptor(b, 3, -7));
  });

  it("ASCII seeds are untouched by NFC", () => {
    expect(normalizeSeedString("EPOCH-GOLDEN-001")).toBe("EPOCH-GOLDEN-001");
  });
});
