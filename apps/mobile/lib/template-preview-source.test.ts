import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { latestGeneratedInvitationTemplates, mobileTemplateGallery } from "./template-gallery";
import { bundledTemplateCanvasIds, bundledTemplatePreviewIds } from "./template-preview-manifest";

describe("template-preview-source", () => {
  it("includes every mobileTemplateGallery item in bundledTemplatePreviewIds", () => {
    const bundledIds = new Set<string>(bundledTemplatePreviewIds);
    const galleryIds = mobileTemplateGallery.map((template) => template.id);
    const missingBundledPreviewIds = galleryIds.filter((id) => !bundledIds.has(id));

    expect(missingBundledPreviewIds).toEqual([]);
  });

  it("uses blank template canvases for every editable invitation preview", () => {
    const canvasIds = new Set<string>(bundledTemplateCanvasIds);
    const missingCanvasIds = mobileTemplateGallery.map((template) => template.id).filter((id) => !canvasIds.has(id));

    expect(missingCanvasIds).toEqual([]);
  });

  it("keeps preview and canvas ids aligned so one bundled asset set can be reused", () => {
    expect([...bundledTemplatePreviewIds]).toEqual([...bundledTemplateCanvasIds]);
  });

  it("ships every newly generated PNG inside the mobile bundle source tree", () => {
    const missingAssetIds = latestGeneratedInvitationTemplates
      .filter((template) => {
        const [category, , , index] = template.id.split("-");
        const assetPath = resolve(
          process.cwd(),
          "apps/mobile/assets/template-previews/custom/barunson-category-anime-2026",
          `${category}-${index}.png`
        );

        return !existsSync(assetPath);
      })
      .map((template) => template.id);

    expect(missingAssetIds).toEqual([]);
  });
});
