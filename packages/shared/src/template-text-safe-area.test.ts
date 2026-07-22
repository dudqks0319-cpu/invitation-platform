import { describe, expect, it } from "vitest";
import { isTemplateTextSafeArea, resolveTemplateTextSafeArea } from "./template-text-safe-area";

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
});
