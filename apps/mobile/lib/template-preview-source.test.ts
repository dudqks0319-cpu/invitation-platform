import { describe, expect, it } from "vitest";
import { bundledTemplatePreviewIds } from "./template-preview-manifest";

describe("template-preview-source", () => {
  it("bundles local previews for shipped mobile templates", () => {
    expect(bundledTemplatePreviewIds).toContain("wedding-classic");
    expect(bundledTemplatePreviewIds).toContain("house-warm");
    expect(bundledTemplatePreviewIds).toContain("business");
  });

  it("returns false for templates without a bundled image", () => {
    expect(bundledTemplatePreviewIds).not.toContain("house-modern");
    expect(bundledTemplatePreviewIds).not.toContain("business-dark");
  });
});
