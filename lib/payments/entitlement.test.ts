import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getPaidChangeLabels, hasPaidChange } from "@/lib/payments/entitlement";

describe("payment entitlement", () => {
  it("does not require repurchase for free-edit fields", () => {
    const original = defaultInvitationDraft;
    const edited = normalizeDraft({ ...original, message: "새 메시지" });

    expect(hasPaidChange(edited, original)).toBe(false);
  });

  it("requires repurchase for template and image changes", () => {
    const original = defaultInvitationDraft;
    const edited = normalizeDraft({
      ...original,
      templateId: "wedding-modern",
      mainImageUrl: "https://example.com/changed.png"
    });

    expect(hasPaidChange(edited, original)).toBe(true);
    expect(getPaidChangeLabels(edited, original)).toEqual(["템플릿 변경", "메인 이미지 변경"]);
  });
});
