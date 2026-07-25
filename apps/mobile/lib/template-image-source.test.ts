import { describe, expect, it, vi } from "vitest";
import type { MobileTemplateGalleryItem } from "./template-gallery";

vi.mock("./template-preview-source", () => ({
  getBundledTemplateCanvasSource: vi.fn(() => 101),
  getBundledTemplatePreviewSource: vi.fn(() => 202)
}));

import { getTemplateCanvasSource, getTemplatePreviewSource } from "./template-image-source";

const remoteOnlyTemplate: MobileTemplateGalleryItem = {
  id: "remote-only",
  category: "wedding",
  name: "원격 전용",
  badge: "결혼식",
  desc: "새 배포 템플릿",
  tags: [],
  previewUrl: "https://invitation-platform-plum.vercel.app/images/custom/new.png?v=v1-deadbeef",
  sampleTextOverlay: true,
  textPlacement: "bottom",
  remote: true
};

describe("template image source", () => {
  it("uses the remote HTTPS image for remote-only browser and builder records", () => {
    const expected = { uri: remoteOnlyTemplate.previewUrl };

    expect(getTemplatePreviewSource(remoteOnlyTemplate)).toEqual(expected);
    expect(getTemplateCanvasSource(remoteOnlyTemplate)).toEqual(expected);
  });

  it("keeps curated corrected artwork bundled even when the remote catalog is available", () => {
    const curatedRemoteTemplate = { ...remoteOnlyTemplate, id: "house-warm" };

    expect(getTemplatePreviewSource(curatedRemoteTemplate)).toBe(202);
    expect(getTemplateCanvasSource(curatedRemoteTemplate)).toBe(101);
  });

  it("keeps bundled assets as the local fallback", () => {
    const bundled = { ...remoteOnlyTemplate, id: "wedding-classic", remote: false, previewUrl: undefined };

    expect(getTemplatePreviewSource(bundled)).toBe(202);
    expect(getTemplateCanvasSource(bundled)).toBe(101);
  });
});
