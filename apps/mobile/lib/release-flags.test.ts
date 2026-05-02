import { describe, expect, it } from "vitest";
import { parsePublicBooleanFlag } from "./release-flags";

describe("parsePublicBooleanFlag", () => {
  it("defaults to false when unset", () => {
    expect(parsePublicBooleanFlag(undefined)).toBe(false);
  });

  it("accepts explicit true values", () => {
    expect(parsePublicBooleanFlag("true")).toBe(true);
    expect(parsePublicBooleanFlag("1")).toBe(true);
    expect(parsePublicBooleanFlag("on")).toBe(true);
  });

  it("accepts explicit false values", () => {
    expect(parsePublicBooleanFlag("false", true)).toBe(false);
    expect(parsePublicBooleanFlag("0", true)).toBe(false);
    expect(parsePublicBooleanFlag("off", true)).toBe(false);
  });
});
