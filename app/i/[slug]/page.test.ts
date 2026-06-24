import publicInvitationPage, { generateMetadata as publicGenerateMetadata } from "@/app/invitations/[slug]/page";
import aliasInvitationPage from "@/app/i/[slug]/page";
import { generateMetadata as aliasGenerateMetadata } from "@/app/i/[slug]/page";

describe("/i/[slug] public invitation alias", () => {
  it("reuses the existing public invitation page export", () => {
    expect(aliasInvitationPage).toBe(publicInvitationPage);
  });

  it("reuses the existing public invitation metadata export", () => {
    expect(aliasGenerateMetadata).toBe(publicGenerateMetadata);
  });
});
