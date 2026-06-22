import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

describe("invitation pricing", () => {
  it("keeps current templates free by default", () => {
    expect(getInvitationPricing(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("keeps user photos free", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/bg.jpg"
    });

    expect(getInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
    expect(getInvitationPricing(payload).breakdown).toContainEqual({
      label: "사진 업로드",
      amount: 0
    });
  });

  it("keeps gallery images free", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`)
    });

    expect(getInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });
});
