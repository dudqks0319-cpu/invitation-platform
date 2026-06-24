import {
  buildPublicInvitationSharePath,
  buildPublicInvitationShareUrl,
  buildPublicQrImagePath
} from "@/lib/public-share-assets";

describe("public share asset helpers", () => {
  it("builds encoded paths for invitation links and QR images", () => {
    expect(buildPublicInvitationSharePath("kim lee/demo")).toBe("/invitations/kim%20lee%2Fdemo");
    expect(buildPublicQrImagePath("kim lee/demo")).toBe("/api/qr/kim%20lee%2Fdemo");
  });

  it("builds absolute public invitation URLs for QR content", () => {
    expect(buildPublicInvitationShareUrl("kim-lee-demo", "https://invitehub.test")).toBe(
      "https://invitehub.test/invitations/kim-lee-demo"
    );
  });
});
