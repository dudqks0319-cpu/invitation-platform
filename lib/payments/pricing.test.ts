import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

describe("invitation pricing", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH;
  });

  it("keeps current templates free by default", () => {
    expect(getInvitationPricing(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("includes external photos in the current free release", () => {
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "false";
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/bg.jpg"
    });

    expect(getInvitationPricing(payload)).toMatchObject({ amount: 0, isFree: true });
  });

  it("keeps the future photo pass price behind the paid release flag", () => {
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      galleryImages: Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`)
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });

  it("keeps image text overlay data images free", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      templateId: "image-text-overlay",
      mainImageUrl: "data:image/jpeg;base64,abc123"
    });

    expect(getInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
  });

  it("charges image text overlay external URLs only in a paid release", () => {
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      templateId: "image-text-overlay",
      mainImageUrl: "https://example.com/main.jpg"
    });

    expect(getInvitationPricing(payload).amount).toBe(3300);
  });
});
