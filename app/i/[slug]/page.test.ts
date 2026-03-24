import publicInvitationPage from "@/app/invitations/[slug]/page";
import aliasInvitationPage from "@/app/i/[slug]/page";

describe("/i/[slug] public invitation alias", () => {
  it("reuses the existing public invitation page export", () => {
    expect(aliasInvitationPage).toBe(publicInvitationPage);
  });
});
