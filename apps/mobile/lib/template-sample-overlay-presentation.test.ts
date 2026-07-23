import { describe, expect, it } from "vitest";
import { getTemplateSampleOverlayPresentation } from "./template-sample-overlay-presentation";

function channel(value: string, offset: number) {
  const component = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
  return component <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
}

function luminance(value: string) {
  return channel(value, 1) * 0.2126 + channel(value, 3) * 0.7152 + channel(value, 5) * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe("template sample overlay presentation", () => {
  it.each([false, true])("uses opaque high-contrast tokens for compressed=%s", (compressed) => {
    const presentation = getTemplateSampleOverlayPresentation(compressed);

    expect(presentation.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(contrastRatio(presentation.textColor, presentation.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    expect(Math.min(
      presentation.headlineFontSize,
      presentation.badgeFontSize,
      presentation.titleFontSize,
      presentation.detailFontSize
    )).toBeGreaterThanOrEqual(9);
  });

  it("removes decoration in constrained safe areas while retaining required copy sizes", () => {
    const compressed = getTemplateSampleOverlayPresentation(true);
    expect(compressed.showDecoration).toBe(false);
    expect(compressed.titleFontSize).toBeGreaterThan(compressed.detailFontSize);
    const requiredTextHeight = compressed.titleLineHeight * compressed.titleNumberOfLines
      + compressed.detailLineHeight
      + compressed.detailLineHeight * compressed.detailNumberOfLines;
    expect(requiredTextHeight).toBeLessThanOrEqual(42);
  });
});
