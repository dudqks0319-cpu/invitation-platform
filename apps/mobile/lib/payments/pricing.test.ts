import { describe, expect, it } from "vitest";
import { createEmptyInvitationDraft } from "../invitation-shared";
import { getMobileInvitationPricing, requiresStorePurchase } from "./pricing";

describe("mobile invitation pricing", () => {
  it("keeps the default draft free", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;

    expect(getMobileInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
    expect(requiresStorePurchase(payload)).toBe(false);
  });

  it("requires store purchase when paid photo add-ons are present", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.photos.mainUri = "file:///main.jpg";
    payload.photos.backgroundUri = "file:///bg.jpg";
    payload.photos.gallery = Array.from({ length: 11 }, (_, index) => ({
      uri: `file:///gallery-${index}.jpg`,
      order: index
    }));

    expect(getMobileInvitationPricing(payload)).toMatchObject({
      amount: 3300,
      isFree: false
    });
    expect(requiresStorePurchase(payload)).toBe(true);
  });
});
