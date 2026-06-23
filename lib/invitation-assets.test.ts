import { describe, expect, it } from "vitest";
import {
  buildPublishedAssetUrl,
  buildPublishedInvitationAssetPayload,
  getStoredInvitationAssetPaths
} from "@/lib/invitation-assets";

describe("invitation assets helpers", () => {
  it("builds a stable published asset url", () => {
    expect(buildPublishedAssetUrl("invite-123", "user-1/path/image.jpg")).toBe(
      "/api/public/assets?slug=invite-123&path=user-1%2Fpath%2Fimage.jpg"
    );
  });

  it("extracts asset paths from a stored payload", () => {
    expect(
      getStoredInvitationAssetPaths({
        mainImagePath: "main/path.jpg",
        backgroundImagePath: "",
        galleryImagePaths: ["gallery/1.jpg", "gallery/2.jpg"],
        photoPlacements: [
          {
            assetPath: "slots/main.webp"
          }
        ]
      })
    ).toEqual(["main/path.jpg", "gallery/1.jpg", "gallery/2.jpg", "slots/main.webp"]);
  });

  it("replaces published asset URLs with proxy URLs when paths exist", () => {
    expect(
      buildPublishedInvitationAssetPayload("invite-123", {
        mainImageUrl: "",
        mainImagePath: "main/path.jpg",
        backgroundImageUrl: "",
        backgroundImagePath: "bg/path.jpg",
        galleryImages: ["old-1", "old-2"],
        galleryImagePaths: ["gallery/1.jpg", "gallery/2.jpg"]
      })
    ).toMatchObject({
      mainImageUrl: "/api/public/assets?slug=invite-123&path=main%2Fpath.jpg",
      backgroundImageUrl: "/api/public/assets?slug=invite-123&path=bg%2Fpath.jpg",
      galleryImages: [
        "/api/public/assets?slug=invite-123&path=gallery%2F1.jpg",
        "/api/public/assets?slug=invite-123&path=gallery%2F2.jpg"
      ]
    });
  });
});
