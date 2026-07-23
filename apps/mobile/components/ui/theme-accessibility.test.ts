import { describe, expect, it } from "vitest";
import { theme } from "./theme";

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("mobile theme text contrast", () => {
  it("keeps gold text readable on both cream and white surfaces", () => {
    expect(contrastRatio(theme.colors.gold, theme.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.colors.gold, theme.colors.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
