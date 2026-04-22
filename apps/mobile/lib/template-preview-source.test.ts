import { describe, expect, it } from "vitest";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

describe("template-preview-source", () => {
  it("bundles local previews for shipped mobile templates", () => {
    expect(bundledTemplatePreviewIds).toContain("wedding-classic");
    expect(bundledTemplatePreviewIds).toContain("house-warm");
    expect(bundledTemplatePreviewIds).toContain("business");
    expect(bundledTemplatePreviewIds).toContain("birthday-ocean-shark");
    expect(bundledTemplatePreviewIds).toContain("dol-eucalyptus");
    expect(bundledTemplatePreviewIds).toContain("hwangap-branch");
    expect(bundledTemplatePreviewIds).toContain("wedding-flower-garden");
    expect(bundledTemplatePreviewIds).toContain("wedding-starry-garden");
    expect(bundledTemplatePreviewIds).toContain("wedding-soft-pastel");
    expect(bundledTemplatePreviewIds).toContain("wedding-watercolor-bloom");
  });

  it("returns false for templates without a bundled image", () => {
    expect(bundledTemplatePreviewIds).not.toContain("house-modern");
    expect(bundledTemplatePreviewIds).not.toContain("business-dark");
  });
});
