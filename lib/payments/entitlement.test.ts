import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getPaidChangeLabels, hasPaidChange } from "@/lib/payments/entitlement";

describe("payment entitlement", () => {
  it("does not require repurchase for free-edit fields", () => {
    const original = defaultInvitationDraft;
    const edited = normalizeDraft({ ...original, message: "새 메시지" });

    expect(hasPaidChange(edited, original)).toBe(false);
  });

  it("requires repurchase only for photo add-ons", () => {
    const original = defaultInvitationDraft;
    const edited = normalizeDraft({
      ...original,
      mainImageUrl: "https://example.com/changed.png",
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.png`)
    });

    expect(hasPaidChange(edited, original)).toBe(true);
    expect(getPaidChangeLabels(edited, original)).toEqual(["인물사진 추가", "갤러리 10장 단위 추가"]);
  });
});
