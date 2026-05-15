import { describe, expect, it } from "vitest";
import { generatedTemplateIds } from "./generated-template-assets";
import { mobileTemplateGallery } from "./template-gallery";
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

  it("tracks the generated image templates in both thumbnail and canvas manifests", () => {
    expect(generatedTemplateIds).toHaveLength(40);
    expect(bundledTemplatePreviewIds).toEqual(expect.arrayContaining([...generatedTemplateIds]));
    expect(bundledTemplateCanvasIds).toEqual(expect.arrayContaining([...generatedTemplateIds]));
  });
});
