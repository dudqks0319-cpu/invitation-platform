import { describe, expect, it } from "vitest";
import { getTemplateDiscoveryCardWidth } from "./template-discovery-layout";
import {
  getTemplateCardExternalMetadata,
  getTemplateSampleHeadline,
  getTemplateSampleOverlayContent,
  getTemplateSampleOverlayPresentation,
  templateOverlayTypography
} from "./template-sample-overlay-presentation";

describe("template sample overlay presentation", () => {
  it("fits real two-line invitation copy in the narrowest reviewed 18% safe area at 375px", () => {
    const cardWidth = getTemplateDiscoveryCardWidth(375, 1);
    const artworkHeight = Math.max(220, Math.min(420, Math.round(cardWidth * 1.3)));
    const artworkWidth = artworkHeight * 941 / 1672;
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    });
    const safeAreaHeight = artworkHeight * 0.18;
    const safeAreaWidth = artworkWidth * 0.84;
    const presentation = getTemplateSampleOverlayPresentation({
      safeAreaHeight,
      safeAreaWidth,
      fontScale: 1,
      content
    });

    expect(cardWidth).toBe(165);
    expect(artworkHeight).toBe(220);
    expect(safeAreaHeight).toBeCloseTo(39.6);
    expect(safeAreaWidth).toBeCloseTo(104.02, 1);
    expect(presentation.showContent).toBe(true);
    expect(presentation.requiredHeight).toBeLessThanOrEqual(safeAreaHeight);
  });

  it("does not scale or overflow the decorative title at font scale 2", () => {
    const safeAreaHeight = 220 * 0.18;
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    });
    const input = { safeAreaHeight, safeAreaWidth: 104, content };
    const regular = getTemplateSampleOverlayPresentation({ ...input, fontScale: 1 });
    const largeText = getTemplateSampleOverlayPresentation({ ...input, fontScale: 2 });

    expect(largeText).toEqual(regular);
    expect(largeText.allowFontScaling).toBe(false);
    expect(largeText.requiredHeight).toBeLessThanOrEqual(safeAreaHeight);
  });

  it("hides the decorative title when its measured safe area cannot contain it", () => {
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    });
    const presentation = getTemplateSampleOverlayPresentation({
      safeAreaHeight: 10,
      safeAreaWidth: 104,
      fontScale: 2,
      content
    });
    expect(presentation.requiredHeight).toBeGreaterThan(10);
    expect(presentation.showContent).toBe(false);
  });

  it("hides rather than truncating when the measured safe area is too narrow", () => {
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    });
    const presentation = getTemplateSampleOverlayPresentation({
      safeAreaHeight: 40,
      safeAreaWidth: 55,
      fontScale: 2,
      content
    });

    expect(presentation.requiredWidth).toBe(64);
    expect(presentation.showContent).toBe(false);
  });

  it("renders text directly on the reviewed blank area without a paper chip", () => {
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    });
    const presentation = getTemplateSampleOverlayPresentation({
      safeAreaHeight: 40,
      safeAreaWidth: 104,
      fontScale: 2,
      content
    });

    expect(presentation.textColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(presentation).not.toHaveProperty("backgroundColor");
    expect(presentation).not.toHaveProperty("paddingHorizontal");
    expect(presentation).not.toHaveProperty("paddingVertical");
  });

  it("shares one fixed typography scale and headline with every invitation preview renderer", () => {
    expect(templateOverlayTypography).toEqual({
      eyebrowFontSize: 10,
      eyebrowLineHeight: 13,
      titleFontSize: 14,
      titleLineHeight: 18,
      detailFontSize: 11,
      detailLineHeight: 15,
      lineGap: 2
    });
    expect(getTemplateSampleHeadline("wedding")).toBe("WE ARE GETTING MARRIED");
    expect(getTemplateSampleHeadline("unknown")).toBeNull();
  });

  it("does not guess a decorative label for an unknown category", () => {
    expect(getTemplateSampleOverlayContent({
      arrangement: "single",
      category: "unknown-event"
    })).toEqual([]);
  });

  it.each([
    ["wedding", "WE ARE GETTING MARRIED"],
    ["dol", "FIRST BIRTHDAY"],
    ["hwangap", "WITH GRATITUDE"],
    ["bridal", "BRIDAL SHOWER"],
    ["birthday", "HAPPY BIRTHDAY"],
    ["housewarming", "WELCOME HOME"],
    ["baby", "BABY SHOWER"],
    ["graduation", "GRADUATION"],
    ["business", "YOU ARE INVITED"]
  ])("uses real preview copy instead of a category placeholder for %s", (category, expectedEyebrow) => {
    const [content] = getTemplateSampleOverlayContent({
      arrangement: "single",
      category
    });

    expect(content?.eyebrow).toBe(expectedEyebrow);
    expect(content?.title.length).toBeGreaterThan(4);
    expect(content?.detail).toMatch(/^\d{4}\. \d{2}\. \d{2}\. \d{2}:\d{2}$/);
    expect(content?.venue).toBeTruthy();
    expect(content?.venue).not.toContain("예시");
  });

  it("preserves complete external card metadata instead of shortening it for artwork", () => {
    const name = "아주 긴 템플릿 이름도 카드 아래에서 전부 보여요";
    const desc = "상세 설명은 장식용 그림 안에 넣지 않고 카드 메타데이터 영역에서 축약 없이 제공합니다.";

    expect(getTemplateCardExternalMetadata({ name, desc })).toEqual({ name, description: desc });
  });

  it("uses the real preview names, date, and venue above and below centered artwork", () => {
    expect(getTemplateSampleOverlayContent({
      arrangement: "top-and-bottom",
      category: "wedding"
    })).toEqual([
      {
        eyebrow: "WE ARE GETTING MARRIED",
        title: "이도담 ♡ 김해온"
      },
      {
        title: "2026. 09. 20. 12:30",
        detail: "라비에별 가든홀 그랜드룸"
      }
    ]);
  });

  it("uses the same example copy as the real preview in a single middle gap", () => {
    expect(getTemplateSampleOverlayContent({
      arrangement: "single",
      category: "dol"
    })).toEqual([
      {
        eyebrow: "FIRST BIRTHDAY",
        title: "하람이의 반짝이는 첫 번째 생일",
        detail: "2026. 10. 11. 12:00",
        venue: "구름정원 패밀리홀"
      }
    ]);
  });
});
