import {
  buildPublicCalendarPath,
  buildPublicInvitationSharePath,
  buildPublicInvitationShareUrl,
  buildPublicQrImagePath,
  buildPublicShareImagePath,
  isPublicShareImageFormat,
  PUBLIC_SHARE_IMAGE_SIZES
} from "@/lib/public-share-assets";

describe("public share asset helpers", () => {
  it("builds encoded paths for invitation links and QR images", () => {
    expect(buildPublicInvitationSharePath("kim lee/demo")).toBe("/invitations/kim%20lee%2Fdemo");
    expect(buildPublicQrImagePath("kim lee/demo")).toBe("/api/qr/kim%20lee%2Fdemo");
    expect(buildPublicCalendarPath("kim lee/demo")).toBe("/api/calendar/kim%20lee%2Fdemo");
    expect(buildPublicShareImagePath("kim lee/demo", "instagram")).toBe("/api/share/instagram/kim%20lee%2Fdemo");
    expect(buildPublicShareImagePath("kim lee/demo", "a4")).toBe("/api/share/a4/kim%20lee%2Fdemo");
  });

  it("builds absolute public invitation URLs for QR content", () => {
    expect(buildPublicInvitationShareUrl("kim-lee-demo", "https://invitehub.test")).toBe(
      "https://invitehub.test/invitations/kim-lee-demo"
    );
  });

  it("defines supported share image formats and dimensions", () => {
    expect(isPublicShareImageFormat("instagram")).toBe(true);
    expect(isPublicShareImageFormat("a4")).toBe(true);
    expect(isPublicShareImageFormat("story")).toBe(false);
    expect(PUBLIC_SHARE_IMAGE_SIZES.instagram).toEqual({ width: 1080, height: 1080 });
    expect(PUBLIC_SHARE_IMAGE_SIZES.a4).toEqual({ width: 1240, height: 1754 });
  });
});
