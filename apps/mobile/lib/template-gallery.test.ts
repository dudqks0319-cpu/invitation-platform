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

const barunsonCategoryAnimeCategories = [
  "wedding",
  "dol",
  "housewarming",
  "hwangap",
  "bridal",
  "birthday",
  "baby",
  "graduation",
  "business"
];

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

  it("marks textless uploaded wedding images for list-only sample text overlay", () => {
    expect(getMobileTemplateById("wedding-envelope-photo")?.sampleTextOverlay).toBe(true);
    expect(getMobileTemplateById("wedding-anime-textspace-10")?.sampleTextOverlay).toBe(true);
    expect(getMobileTemplateById("wedding-classic")?.sampleTextOverlay).toBeUndefined();
  });

  it("keeps the simplified home sections backed by template cards", () => {
    const sections = getHomeTemplateSections();
    const weddingTemplates = getMobileTemplatesByCategory("wedding");
    const partyTemplateCount = ["birthday", "housewarming", "baby", "graduation", "business"].reduce(
      (count, category) => count + getMobileTemplatesByCategory(category).length,
      0
    );

    expect(sections.map((section) => section.key)).toEqual(homeTemplateSections.map((section) => section.key));
    expect(sections[0].title).toBe("청첩장 템플릿");
    expect(sections.every((section) => section.templates.length >= 3)).toBe(true);
    expect(sections[0].templates).toHaveLength(weddingTemplates.length);
    expect(sections.find((section) => section.key === "party")?.templates).toHaveLength(partyTemplateCount);
    expect(sections.flatMap((section) => section.templates).map((template) => template.id).sort()).toEqual(
      mobileTemplateGallery.map((template) => template.id).sort()
    );
  });

  it("shows the Barunson-style anime set as three templates per category", () => {
    const barunsonAnimeTemplates = mobileTemplateGallery.filter((template) =>
      template.id.includes("barunson-anime")
    );

    expect(barunsonAnimeTemplates).toHaveLength(27);

    for (const category of barunsonCategoryAnimeCategories) {
      const categoryTemplates = barunsonAnimeTemplates.filter((template) => template.category === category);

      expect(categoryTemplates.map((template) => template.id)).toEqual([
        `${category}-barunson-anime-01`,
        `${category}-barunson-anime-02`,
        `${category}-barunson-anime-03`
      ]);
      expect(categoryTemplates.every((template) => template.sampleTextOverlay)).toBe(true);
    }
  });
});
