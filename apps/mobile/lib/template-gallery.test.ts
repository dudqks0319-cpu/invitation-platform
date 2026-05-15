import { describe, expect, it } from "vitest";
import {
  featuredMobileTemplateIds,
  getFeaturedMobileTemplates,
  getHomeTemplateSections,
  getMobileTemplateById,
  getMobileTemplatesByCategory,
  homeTemplateSections,
  mobileTemplateGallery
} from "./template-gallery";

describe("mobile template gallery", () => {
  it("keeps featured templates backed by real gallery entries", () => {
    const featuredTemplates = getFeaturedMobileTemplates();

    expect(featuredTemplates).toHaveLength(featuredMobileTemplateIds.length);
    expect(featuredTemplates.map((template) => template.id)).toEqual([...featuredMobileTemplateIds]);
  });

  it("shows wedding invitations first on the home showcase", () => {
    const featuredTemplates = getFeaturedMobileTemplates();
    const firstNonWeddingIndex = featuredTemplates.findIndex((template) => template.category !== "wedding");

    expect(firstNonWeddingIndex).toBeGreaterThanOrEqual(6);
  });

  it("finds templates by id and category", () => {
    expect(getMobileTemplateById("wedding-modern")?.category).toBe("wedding");
    expect(getMobileTemplatesByCategory("wedding").length).toBeGreaterThan(1);
    expect(getMobileTemplatesByCategory("missing")).toEqual([]);
    expect(mobileTemplateGallery.every((template) => template.id.length > 0)).toBe(true);
  });

  it("keeps the simplified home sections backed by template cards", () => {
    const sections = getHomeTemplateSections();

    expect(sections.map((section) => section.key)).toEqual(homeTemplateSections.map((section) => section.key));
    expect(sections[0].title).toBe("청첩장 템플릿");
    expect(sections.every((section) => section.templates.length >= 3)).toBe(true);
  });

  it("shows the generated image template set on the home showcase", () => {
    const sections = getHomeTemplateSections();
    const templateIds = sections.flatMap((section) => section.templates.map((template) => template.id));

    expect(templateIds).toEqual(
      expect.arrayContaining([
        "wedding-anime-blossom",
        "wedding-peach-morning",
        "dol-teddy-pastel",
        "dol-candy-balloon",
        "hwangap-royal-bojagi",
        "hwangap-champagne-peony",
        "house-cozy-sage",
        "house-sunny-kitchen"
      ])
    );
  });

  it("provides ten modern generated templates for each core event category", () => {
    for (const category of ["wedding", "dol", "hwangap", "housewarming"]) {
      const generatedTemplates = getMobileTemplatesByCategory(category).filter((template) =>
        template.previewPath?.includes("/generated-2026/")
      );

      expect(generatedTemplates).toHaveLength(10);
    }
  });
});
