import { describe, expect, it } from "vitest";
import { templates } from "@/lib/templates";
import {
  MOBILE_TEMPLATE_CATALOG_MAX_BYTES,
  MOBILE_TEMPLATE_CATALOG_MAX_ITEMS,
  buildPublicMobileTemplateCatalog,
  toPublicMobileTemplate
} from "@/lib/mobile-template-catalog";
import { GET } from "@/app/api/mobile/v1/templates/route";
import { templateCatalogContract } from "@/apps/mobile/lib/template-catalog.contract.fixture";

describe("GET /api/mobile/v1/templates", () => {
  it("returns the canonical root catalog with versioned HTTPS assets", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload.schemaVersion).toBe(1);
    expect(payload.catalogVersion).toMatch(/^v1-[a-f0-9]{8}$/);
    expect(payload.meta).toEqual({ count: payload.templates.length, maxItems: MOBILE_TEMPLATE_CATALOG_MAX_ITEMS });
    expect(payload.templates[0].previewUrl).toMatch(
      /^https:\/\/invitation-platform-plum\.vercel\.app\/images\/.+\?v=v1-[a-f0-9]{8}$/
    );
    expect(payload.templates).toHaveLength(templateCatalogContract.remoteTemplateCount);
    expect(payload.templates.every((template: Record<string, unknown>) => !("textSafeArea" in template))).toBe(true);
    expect(new Set(payload.templates.map((template: { id: string }) => template.id)).size).toBe(
      templateCatalogContract.remoteTemplateCount
    );
    expect(
      payload.templates.filter((template: Record<string, unknown>) =>
        templateCatalogContract.remoteRequiredMetadata.some((field) => {
          const value = template[field];
          return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
        })
      )
    ).toEqual([]);
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(Number(response.headers.get("Content-Length"))).toBeLessThanOrEqual(MOBILE_TEMPLATE_CATALOG_MAX_BYTES);
  });

  it("rejects non-HTTPS or non-canonical asset origins", () => {
    const source = templates[0];
    expect(toPublicMobileTemplate({ ...source, html: '<img src="https://attacker.example/template.png" />' })).toBeNull();
    expect(toPublicMobileTemplate({ ...source, html: '<img src="http://invitation-platform-plum.vercel.app/template.png" />' })).toBeNull();
    expect(toPublicMobileTemplate({ ...source, html: '<img src="/images/genspark/excluded.jpg" />' })).toBeNull();
  });

  it("caps both item count and serialized response bytes", () => {
    const oversizedCatalog = Array.from({ length: MOBILE_TEMPLATE_CATALOG_MAX_ITEMS + 25 }, (_, index) => ({
      ...templates[0],
      id: `template-${index}`,
      name: `Template ${index}`,
      desc: "가".repeat(100)
    }));
    const { body, catalog } = buildPublicMobileTemplateCatalog(oversizedCatalog, "test-deploy");

    expect(catalog.templates.length).toBeLessThanOrEqual(MOBILE_TEMPLATE_CATALOG_MAX_ITEMS);
    expect(Buffer.byteLength(body, "utf8")).toBeLessThanOrEqual(MOBILE_TEMPLATE_CATALOG_MAX_BYTES);
  });

  it("includes all 60 latest generated template IDs without truncation", async () => {
    const payload = await (await GET()).json();
    const ids = new Set(payload.templates.map((template: { id: string }) => template.id));
    const ranges = [
      ["wedding", 25, 34],
      ["dol", 16, 25],
      ["birthday", 5, 14],
      ["baby", 5, 14],
      ["housewarming", 10, 19],
      ["hwangap", 8, 17]
    ] as const;

    for (const [category, start, end] of ranges) {
      for (let sequence = start; sequence <= end; sequence += 1) {
        expect(ids.has(`${category}-barunson-anime-${String(sequence).padStart(2, "0")}`)).toBe(true);
      }
    }
    expect(
      payload.templates.every((template: { previewUrl: string }) =>
        new URL(template.previewUrl).pathname.startsWith("/images/custom/")
      )
    ).toBe(true);
  });

  it("changes catalog and image cache versions between deployment seeds", () => {
    const first = buildPublicMobileTemplateCatalog(templates.slice(0, 1), "deploy-a").catalog;
    const second = buildPublicMobileTemplateCatalog(templates.slice(0, 1), "deploy-b").catalog;

    expect(first.catalogVersion).not.toBe(second.catalogVersion);
    expect(first.templates[0].previewUrl).not.toBe(second.templates[0].previewUrl);
    expect(new URL(first.templates[0].previewUrl).pathname).toBe(new URL(second.templates[0].previewUrl).pathname);
  });
});
