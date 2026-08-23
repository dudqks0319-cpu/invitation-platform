import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPublicMobileTemplateCatalog } from "../../../lib/mobile-template-catalog";
import { templates as canonicalTemplates } from "../../../lib/templates";
import {
  getTemplateCatalogSourceCopy,
  templateCatalogContract
} from "./template-catalog-contract";
import { mobileTemplateGallery } from "./template-gallery";

const catalogConsumers = [
  "apps/mobile/app/templates.tsx",
  "apps/mobile/lib/remote-template-catalog.ts",
  "apps/mobile/lib/template-catalog-state.ts",
  "apps/mobile/hooks/useTemplateCatalog.tsx",
  "lib/mobile-template-catalog.ts",
  "app/api/mobile/v1/templates/route.ts"
] as const;

describe("template catalog contract", () => {
  it("does not treat the observed legacy asset references as a current catalog count", () => {
    expect(templateCatalogContract.observedLegacyRootCheckout).toMatchObject({
      meaning: "runtime-preview-asset-references",
      isCurrentCatalogCount: false
    });
    expect(templateCatalogContract.observedLegacyRootCheckout.previewAssetReferenceCount).not.toBe(
      templateCatalogContract.bundledFallback.count
    );
    expect(templateCatalogContract.observedLegacyRootCheckout.previewAssetReferenceCount).not.toBe(
      templateCatalogContract.remoteCatalog.count
    );
  });

  it("keeps bundled fallback and remote catalog counts as distinct verified meanings", () => {
    const remoteCatalog = buildPublicMobileTemplateCatalog(canonicalTemplates, "catalog-contract-test").catalog;

    expect(mobileTemplateGallery).toHaveLength(templateCatalogContract.bundledFallback.count);
    expect(remoteCatalog.templates).toHaveLength(templateCatalogContract.remoteCatalog.count);
    expect(remoteCatalog.schemaVersion).toBe(templateCatalogContract.remoteCatalog.schemaVersion);
    expect(remoteCatalog.catalogVersion).toMatch(
      new RegExp(templateCatalogContract.remoteCatalog.catalogVersionPattern)
    );
  });

  it("reports the actual bundled fallback list size and keeps retries bounded", () => {
    expect(
      getTemplateCatalogSourceCopy("bundled-fallback", mobileTemplateGallery.length)
    ).toBe(`기본 디자인 ${mobileTemplateGallery.length}개를 보여드려요`);
    expect(templateCatalogContract.recovery.maxManualRetries).toBeGreaterThan(0);
    expect(templateCatalogContract.recovery.maxManualRetries).toBeLessThanOrEqual(3);
  });

  it("prevents catalog count literals from drifting into production consumers", () => {
    for (const relativePath of catalogConsumers) {
      const source = readFileSync(join(process.cwd(), relativePath), "utf8");
      expect(source, relativePath).not.toMatch(/\b(?:87|150|180)\b/);
    }
  });
});
