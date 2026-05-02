import { describe, expect, it } from "vitest";
import { parsePublicBooleanFlag } from "./release-flags";

describe("parsePublicBooleanFlag", () => {
  it("keeps paid publishing disabled by default", () => {
    expect(parsePublicBooleanFlag(undefined)).toBe(false);
  });

  it("parses supported public flag values", () => {
    expect(parsePublicBooleanFlag("yes")).toBe(true);
    expect(parsePublicBooleanFlag("no", true)).toBe(false);
  });
});
