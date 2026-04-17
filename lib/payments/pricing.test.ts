import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

describe("invitation pricing", () => {
  it("keeps current templates free by default", () => {
    expect(getInvitationPricing(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("stays free even when photos are added", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/bg.jpg"
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });

  it("stays free even when multiple gallery images exist", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`)
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });
});
