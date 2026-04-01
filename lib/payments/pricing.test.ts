import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

describe("invitation pricing", () => {
  it("keeps current templates free by default", () => {
    expect(getInvitationPricing(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("charges for main and background images separately", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/bg.jpg"
    });

    expect(getInvitationPricing(payload).amount).toBe(1000);
  });

  it("charges gallery by 10-image blocks", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`)
    });

    expect(getInvitationPricing(payload).amount).toBe(2000);
  });
});
