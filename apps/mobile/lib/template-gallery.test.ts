import { describe, expect, it } from "vitest";
import { isTemplateTextSafeArea } from "@invitehub/shared";
import {
  featuredMobileTemplateIds,
  getFeaturedMobileTemplates,
  getHomeHeroTemplates,
  getHomeTemplateSections,
  getMobileTemplateById,
  getMobileTemplatesByCategory,
  homeTemplateSections,
  homeHeroTemplateIds,
  latestGeneratedInvitationTemplates,
  mobileTemplateGallery
} from "./template-gallery";
import { templateCatalogContract } from "./template-catalog.contract.fixture";

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

const latestGeneratedCategoryRanges = {
  wedding: [25, 34],
  dol: [16, 25],
  birthday: [5, 14],
  baby: [5, 14],
  housewarming: [10, 19],
  hwangap: [8, 17]
} as const;

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

  it("uses Floral Ceremony 04 and two wedding photo concepts in the home hero", () => {
    const heroTemplates = getHomeHeroTemplates();

    expect(heroTemplates).toHaveLength(3);
    expect(heroTemplates.map((template) => template.id)).toEqual([...homeHeroTemplateIds]);
    expect(heroTemplates.map((template) => template.id)).toEqual([
      "wedding-barunson-anime-09",
      "wedding-barunson-anime-04",
      "wedding-barunson-anime-10"
    ]);
  });

  it("keeps audited bundled hero artwork ahead of remote catalog entries", () => {
    const remoteWeddingTemplate = {
      ...mobileTemplateGallery.find((template) => template.category === "wedding")!,
      id: "remote-wedding-hero",
      name: "원격 웨딩",
      previewPath: undefined,
      previewUrl: "https://example.com/remote-wedding.png",
      remote: true
    };

    expect(getHomeHeroTemplates([remoteWeddingTemplate, ...mobileTemplateGallery]).map((template) => template.id)).toEqual([
      ...homeHeroTemplateIds
    ]);
  });

  it("finds templates by id and category", () => {
    expect(getMobileTemplateById("wedding-modern")?.category).toBe("wedding");
    expect(getMobileTemplatesByCategory("wedding").length).toBeGreaterThan(1);
    expect(getMobileTemplatesByCategory("missing")).toEqual([]);
    expect(mobileTemplateGallery.every((template) => template.id.length > 0)).toBe(true);
  });

  it("assigns valid audited safe areas to every bundled template", () => {
    expect(mobileTemplateGallery).toHaveLength(templateCatalogContract.bundledTemplateCount);
    expect(mobileTemplateGallery.every((template) => isTemplateTextSafeArea(template.textSafeArea))).toBe(true);
    expect(getMobileTemplateById("dol-barunson-anime-16")?.textSafeArea).toMatchObject({ topPct: 22, bottomPct: 57 });
    expect(getMobileTemplateById("dol-blue")?.textSafeArea).toMatchObject({ topPct: 62, bottomPct: 86, backdrop: "light" });
  });

  it("has no duplicate IDs or missing required metadata in the bundled catalog", () => {
    const ids = new Set(mobileTemplateGallery.map((template) => template.id));

    expect(ids.size).toBe(templateCatalogContract.bundledTemplateCount);
    expect(
      mobileTemplateGallery.filter((template) =>
        templateCatalogContract.bundledRequiredMetadata.some((field) => {
          const value = template[field as keyof typeof template];
          return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
        })
      )
    ).toEqual([]);
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

  it("shows the expanded Barunson-style anime set", () => {
    const barunsonAnimeTemplates = mobileTemplateGallery.filter((template) =>
      template.id.includes("barunson-anime")
    );

    expect(barunsonAnimeTemplates).toHaveLength(90);

    for (const category of barunsonCategoryAnimeCategories) {
      const categoryTemplates = barunsonAnimeTemplates.filter((template) => template.category === category);

      expect(categoryTemplates).toHaveLength(
        category === "wedding" ? 16 : category in latestGeneratedCategoryRanges ? 13 : 3
      );
      expect(categoryTemplates.every((template) => template.sampleTextOverlay)).toBe(true);
    }
  });

  it("places all 60 newly generated templates first in their categories", () => {
    expect(latestGeneratedInvitationTemplates).toHaveLength(60);
    expect(mobileTemplateGallery.slice(0, 60).map((template) => template.id)).toEqual(
      latestGeneratedInvitationTemplates.map((template) => template.id)
    );

    for (const [category, [start, end]] of Object.entries(latestGeneratedCategoryRanges)) {
      const expectedIds = Array.from({ length: end - start + 1 }, (_, index) =>
        `${category}-barunson-anime-${String(start + index).padStart(2, "0")}`
      );

      expect(getMobileTemplatesByCategory(category).slice(0, 10).map((template) => template.id)).toEqual(expectedIds);
    }

    const latestIds = new Set(latestGeneratedInvitationTemplates.map((template) => template.id));
    expect(getFeaturedMobileTemplates().every((template) => latestIds.has(template.id))).toBe(true);
  });
});
