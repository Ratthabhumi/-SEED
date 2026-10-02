// v0.24 command edge-triggering: held-key auto-repeat must never count as
// an intentional command (it flooded squad telemetry with phantom follows).
import { describe, it, expect } from "vitest";
import { isKeyRepeat } from "../../src/game/ui";

describe("command key repeat gate", () => {
  it("ignores held-key auto-repeat, accepts real presses and edge cases", () => {
    expect(isKeyRepeat({ repeat: true })).toBe(true);
    expect(isKeyRepeat({ repeat: false })).toBe(false);
    expect(isKeyRepeat({})).toBe(false);
    expect(isKeyRepeat(undefined)).toBe(false);
    expect(isKeyRepeat(null)).toBe(false);
  });
});
