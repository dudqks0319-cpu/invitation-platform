import { describe, expect, it } from "vitest";
import { mobileTemplateGallery } from "./template-gallery";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

describe("template-preview-source", () => {
  it("includes every mobileTemplateGallery item in bundledTemplatePreviewIds", () => {
    const bundledIds = new Set<string>(bundledTemplatePreviewIds);
    const galleryIds = mobileTemplateGallery.map((template) => template.id);
    const missingBundledPreviewIds = galleryIds.filter((id) => !bundledIds.has(id));

    expect(missingBundledPreviewIds).toEqual([]);
  });
});
