import { defaultInvitationDraft } from "@/lib/invitation-payload";
import { hasPaidEditImpact } from "@/lib/payments/entitlements";

describe("paid edit entitlements", () => {
  it("ignores free text/date/location edits", () => {
    const next = {
      ...defaultInvitationDraft,
      title: "새 제목",
      venueName: "새 장소"
    };

    expect(hasPaidEditImpact(defaultInvitationDraft, next)).toBe(false);
  });

  it("flags template and image changes", () => {
    expect(
      hasPaidEditImpact(defaultInvitationDraft, {
        ...defaultInvitationDraft,
        templateId: "wedding-modern"
      })
    ).toBe(true);

    expect(
      hasPaidEditImpact(defaultInvitationDraft, {
        ...defaultInvitationDraft,
        mainImageUrl: "https://example.com/new.png"
      })
    ).toBe(true);
  });
});
