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
});
