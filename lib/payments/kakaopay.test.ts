import { defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";
import { getCheckoutPrice } from "@/lib/payments/kakaopay";

describe("kakaopay helpers", () => {
  it("returns zero for the current free template selection", () => {
    expect(getCheckoutPrice(defaultInvitationDraft)).toMatchObject({
      amount: 0,
      currency: "KRW"
    });
  });

  it("returns addon price when photos are attached", () => {
    const payload = normalizeDraft({
      ...defaultInvitationDraft,
      mainImageUrl: "https://example.com/main.jpg",
      backgroundImageUrl: "https://example.com/background.jpg"
    });

    expect(getCheckoutPrice(payload).amount).toBe(1000);
  });
});
