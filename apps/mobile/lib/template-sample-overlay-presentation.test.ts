import { describe, expect, it } from "vitest";
import { getTemplateDiscoveryCardWidth } from "./template-discovery-layout";
import {
  getTemplateCardExternalMetadata,
  getTemplateSampleOverlayPresentation
} from "./template-sample-overlay-presentation";

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
  it("fits one fixed title line in the narrowest reviewed 18% safe area at 375px", () => {
    const cardWidth = getTemplateDiscoveryCardWidth(375, 1);
    const artworkHeight = Math.max(220, Math.min(420, Math.round(cardWidth * 1.3)));
    const safeAreaHeight = artworkHeight * 0.18;
    const presentation = getTemplateSampleOverlayPresentation({ safeAreaHeight, fontScale: 1 });

    expect(cardWidth).toBe(165);
    expect(artworkHeight).toBe(220);
    expect(safeAreaHeight).toBeCloseTo(39.6);
    expect(presentation.showTitle).toBe(true);
    expect(presentation.titleLineHeight + presentation.paddingVertical * 2)
      .toBeLessThanOrEqual(safeAreaHeight);
  });

  it("does not scale or overflow the decorative title at font scale 2", () => {
    const safeAreaHeight = 220 * 0.18;
    const regular = getTemplateSampleOverlayPresentation({ safeAreaHeight, fontScale: 1 });
    const largeText = getTemplateSampleOverlayPresentation({ safeAreaHeight, fontScale: 2 });

    expect(largeText).toEqual(regular);
    expect(largeText.allowFontScaling).toBe(false);
    expect(largeText.requiredHeight).toBeLessThanOrEqual(safeAreaHeight);
  });

  it("hides the decorative title when its measured safe area cannot contain it", () => {
    const presentation = getTemplateSampleOverlayPresentation({ safeAreaHeight: 29, fontScale: 2 });
    expect(presentation.requiredHeight).toBe(30);
    expect(presentation.showTitle).toBe(false);
  });

  it("uses opaque high-contrast paper and ink tokens", () => {
    const presentation = getTemplateSampleOverlayPresentation({ safeAreaHeight: 40, fontScale: 2 });

    expect(presentation.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(presentation.textColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(contrastRatio(presentation.textColor, presentation.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves complete external card metadata instead of shortening it for artwork", () => {
    const name = "아주 긴 템플릿 이름도 카드 아래에서 전부 보여요";
    const desc = "상세 설명은 장식용 그림 안에 넣지 않고 카드 메타데이터 영역에서 축약 없이 제공합니다.";

    expect(getTemplateCardExternalMetadata({ name, desc })).toEqual({ name, description: desc });
  });
});
