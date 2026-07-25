import { describe, expect, it } from "vitest";
import {
  isTemplateTextSafeArea,
  resolveTemplateTextLayout,
  resolveTemplateTextSafeArea
} from "./template-text-safe-area";

describe("template text safe areas", () => {
  it("resolves reviewed template-specific zones and backdrops", () => {
    expect(resolveTemplateTextSafeArea({
      templateId: "wedding-barunson-anime-04",
      category: "wedding",
      textPlacement: "bottom"
    })).toEqual({ topPct: 75, bottomPct: 94, leftPct: 8, rightPct: 92, backdrop: "none" });
    expect(resolveTemplateTextSafeArea({ templateId: "dol-barunson-anime-13", category: "dol" })).toMatchObject({
      topPct: 20,
      bottomPct: 48
    });
    expect(resolveTemplateTextSafeArea({ templateId: "dol-blue", category: "dol" })).toMatchObject({
      topPct: 62,
      bottomPct: 86,
      backdrop: "light"
    });
    expect(resolveTemplateTextSafeArea({ templateId: "baby-barunson-anime-05", category: "baby" })).toMatchObject({
      topPct: 42,
      bottomPct: 66
    });
    expect(resolveTemplateTextSafeArea({ templateId: "birthday-barunson-anime-03", category: "birthday" })).toMatchObject({
      backdrop: "light"
    });
    expect(resolveTemplateTextSafeArea({
      templateId: "business",
      category: "business",
      textPlacement: "bottom"
    })).toMatchObject({
      topPct: 20,
      bottomPct: 44
    });
    expect(resolveTemplateTextSafeArea({
      templateId: "graduation",
      category: "graduation",
      textPlacement: "bottom"
    })).toMatchObject({
      topPct: 24,
      bottomPct: 50
    });
    expect(resolveTemplateTextSafeArea({
      templateId: "house-warm",
      category: "housewarming",
      textPlacement: "bottom"
    })).toMatchObject({
      topPct: 42,
      bottomPct: 66
    });
  });

  it("keeps current placement and category-centered defaults for unreviewed templates", () => {
    expect(resolveTemplateTextSafeArea({ templateId: "dol-barunson-anime-16", category: "dol" })).toMatchObject({
      topPct: 22,
      bottomPct: 57
    });
    expect(resolveTemplateTextSafeArea({ templateId: "unreviewed", category: "wedding", textPlacement: "top" })).toMatchObject({
      topPct: 8,
      bottomPct: 43
    });
    expect(resolveTemplateTextSafeArea({ templateId: "unreviewed", category: "wedding", textPlacement: "bottom" })).toMatchObject({
      topPct: 57,
      bottomPct: 92
    });
  });

  it("strictly validates normalized bounds", () => {
    const valid = resolveTemplateTextSafeArea({ templateId: "dol-blue", category: "dol" });
    expect(isTemplateTextSafeArea(valid)).toBe(true);
    expect(isTemplateTextSafeArea({ ...valid, topPct: -1 })).toBe(false);
    expect(isTemplateTextSafeArea({ ...valid, bottomPct: 101 })).toBe(false);
    expect(isTemplateTextSafeArea({ ...valid, topPct: valid.bottomPct })).toBe(false);
    expect(isTemplateTextSafeArea({ ...valid, extra: true })).toBe(false);
  });

  it.each([
    "wedding-barunson-anime-04",
    "wedding-barunson-anime-09",
    "wedding-barunson-anime-10"
  ])("uses reviewed top and bottom blank zones around centered artwork for %s", (templateId) => {
    expect(resolveTemplateTextLayout({ templateId, category: "wedding" })).toEqual({
      arrangement: "top-and-bottom",
      areas: [
        { topPct: 8, bottomPct: 25, leftPct: 8, rightPct: 92, backdrop: "none" },
        { topPct: 76, bottomPct: 94, leftPct: 8, rightPct: 92, backdrop: "none" }
      ]
    });
  });

  it.each([
    "wedding-barunson-anime-25",
    "wedding-barunson-anime-26",
    "wedding-barunson-anime-27",
    "wedding-barunson-anime-28",
    "wedding-barunson-anime-29",
    "wedding-barunson-anime-30",
    "wedding-barunson-anime-31",
    "wedding-barunson-anime-32",
    "wedding-barunson-anime-33",
    "wedding-barunson-anime-34"
  ])("uses the reviewed middle gap between top and bottom artwork for %s", (templateId) => {
    expect(resolveTemplateTextLayout({ templateId, category: "wedding" })).toEqual({
      arrangement: "single",
      areas: [
        { topPct: 24, bottomPct: 60, leftPct: 8, rightPct: 92, backdrop: "none" }
      ]
    });
  });

  it("keeps an explicit catalog safe area for unreviewed templates", () => {
    const fallbackSafeArea = {
      topPct: 30,
      bottomPct: 62,
      leftPct: 10,
      rightPct: 90,
      backdrop: "light" as const
    };

    expect(resolveTemplateTextLayout({
      templateId: "remote-reviewed-elsewhere",
      category: "wedding",
      fallbackSafeArea
    })).toEqual({ arrangement: "single", areas: [fallbackSafeArea] });
  });
});
