import { describe, expect, it } from "vitest";
import { normalizeSupportEmail } from "./support-contact";

describe("normalizeSupportEmail", () => {
  it("returns a trimmed valid support email", () => {
    expect(normalizeSupportEmail(" support@example.com ")).toBe("support@example.com");
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(normalizeSupportEmail(undefined)).toBe("");
    expect(normalizeSupportEmail("")).toBe("");
    expect(normalizeSupportEmail("support")).toBe("");
    expect(normalizeSupportEmail("support@example")).toBe("");
    expect(normalizeSupportEmail("support @example.com")).toBe("");
  });
});
