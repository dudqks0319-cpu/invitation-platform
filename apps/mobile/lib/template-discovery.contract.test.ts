import { describe, expect, it } from "vitest";
import { templateCatalogContract } from "./template-catalog.contract.fixture";
import { filterTemplateDiscoveryItems } from "./template-discovery";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "./template-gallery";

const remoteTemplates: MobileTemplateGalleryItem[] = [
  ...mobileTemplateGallery.map((template) => ({ ...template, remote: true })),
  ...mobileTemplateGallery.slice(0, 30).map((template, index) => ({
    ...template,
    id: `remote-fixture-${String(index + 1).padStart(2, "0")}`,
    name: `${template.name} 원격 추가`,
    remote: true
  }))
];

const catalogs = [
  ["bundled", mobileTemplateGallery, templateCatalogContract.bundledTemplateCount],
  ["remote", remoteTemplates, templateCatalogContract.remoteTemplateCount]
] as const;

describe("template discovery catalog contracts", () => {
  it.each(catalogs)("renders every %s item once", (_source, catalog, expectedCount) => {
    const results = filterTemplateDiscoveryItems(catalog, { query: "", category: "all", moods: [] }, mobileTemplateCategories);
    expect(results).toHaveLength(expectedCount);
    expect(new Set(results.map((item) => item.id)).size).toBe(expectedCount);
  });

  it.each(catalogs)("returns expected results for 9 categories x 3 representative %s queries", (_source, catalog) => {
    let queryCount = 0;

    for (const category of mobileTemplateCategories) {
      const expected = catalog.find((template) => template.category === category.key);
      expect(expected, `missing ${category.key} fixture`).toBeDefined();
      if (!expected) continue;

      const queries = [category.label, expected.name.slice(0, 2), expected.tags[0]];
      for (const query of queries) {
        const results = filterTemplateDiscoveryItems(
          catalog,
          { query, category: category.key, moods: [] },
          mobileTemplateCategories
        );
        expect(results.map((item) => item.id), `${category.key}: ${query}`).toContain(expected.id);
        expect(results.every((item) => item.category === category.key)).toBe(true);
        queryCount += 1;
      }
    }

    expect(queryCount).toBe(27);
  });
});
