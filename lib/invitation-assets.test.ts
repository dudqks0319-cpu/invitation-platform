import { describe, expect, it } from "vitest";
import {
  buildPublishedAssetUrl,
  buildPublishedInvitationAssetPayload,
  getStoredInvitationAssetPaths,
  isOwnedInvitationAssetPath,
  isSafeSignedAssetUrl,
  MAX_GALLERY_ASSET_PATHS,
  withInvitationAssetTimeout
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
        galleryImagePaths: ["gallery/1.jpg", "gallery/2.jpg"]
      })
    ).toEqual(["main/path.jpg", "gallery/1.jpg", "gallery/2.jpg"]);
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

  it("bounds and deduplicates gallery paths before public or owner signing", () => {
    const galleryImagePaths = Array.from(
      { length: MAX_GALLERY_ASSET_PATHS + 10 },
      (_, index) => `owner/${index}.jpg`
    );
    galleryImagePaths[1] = galleryImagePaths[0];
    expect(getStoredInvitationAssetPaths({ galleryImagePaths })).toHaveLength(MAX_GALLERY_ASSET_PATHS);
  });

  it("binds canonical object keys to one owner and rejects traversal", () => {
    const ownerId = "11111111-1111-4111-8111-111111111111";
    expect(isOwnedInvitationAssetPath(`${ownerId}/${"a".repeat(64)}.webp`, ownerId)).toBe(true);
    expect(isOwnedInvitationAssetPath(`${ownerId}/../${"a".repeat(64)}.webp`, ownerId)).toBe(false);
    expect(isOwnedInvitationAssetPath(`22222222-2222-4222-8222-222222222222/${"a".repeat(64)}.webp`, ownerId)).toBe(false);
  });

  it("allows redirects only to the configured Storage origin", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(isSafeSignedAssetUrl("https://example.supabase.co/storage/v1/object/sign/file")).toBe(true);
    expect(isSafeSignedAssetUrl("https://evil.example/storage/v1/object/sign/file")).toBe(false);
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("times out a stalled database or Storage signing dependency", async () => {
    await expect(withInvitationAssetTimeout(new Promise(() => undefined), 5)).rejects.toThrow(
      "invitation_asset_timeout"
    );
  });
});
