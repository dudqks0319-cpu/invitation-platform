import { describe, expect, it } from "vitest";
import { getButtonStyleConfig } from "./button-styles";

describe("getButtonStyleConfig", () => {
  it("uses strong contrast for disabled primary buttons", () => {
    const config = getButtonStyleConfig("primary", true);

    expect(config.backgroundColor).not.toBe("#F0DEC8");
    expect(config.textColor).not.toBe("#fff");
  });

  it("keeps outline buttons readable when disabled", () => {
    const config = getButtonStyleConfig("outline", true);

    expect(config.borderColor).not.toBe("#C9935A");
    expect(config.textColor).toBeTruthy();
  });
});
