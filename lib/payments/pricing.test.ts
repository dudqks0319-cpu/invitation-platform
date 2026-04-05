import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

describe("invitation pricing", () => {
  it("keeps current templates free by default", () => {
    expect(getInvitationPricing(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("charges a single photo-inclusive publish pass when any photo is added", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/bg.jpg"
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });

  it("keeps the same fixed price even when multiple gallery images exist", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`)
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });
});
