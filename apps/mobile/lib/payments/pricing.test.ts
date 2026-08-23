import { afterEach, describe, expect, it } from "vitest";
import { createEmptyInvitationDraft } from "../invitation-shared";
import { getMobileInvitationPricing, requiresStorePurchase } from "./pricing";

describe("mobile invitation pricing", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH;
  });

  it("keeps the default draft free", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;

    expect(getMobileInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
    expect(requiresStorePurchase(payload)).toBe(false);
  });

  it("includes capped photos in the free release while paid publishing is off", () => {
    process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH = "false";
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.photos.mainUri = "file:///main.jpg";
    payload.photos.backgroundUri = "file:///bg.jpg";
    payload.photos.gallery = Array.from({ length: 11 }, (_, index) => ({
      uri: `file:///gallery-${index}.jpg`,
      order: index
    }));

    expect(getMobileInvitationPricing(payload)).toMatchObject({
      amount: 0,
      isFree: true
    });
    expect(requiresStorePurchase(payload)).toBe(false);
  });

  it("preserves the future store price only when paid publishing is explicitly on", () => {
    process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.photos.mainUri = "file:///main.jpg";

    expect(getMobileInvitationPricing(payload)).toMatchObject({
      amount: 3300,
      isFree: false
    });
    expect(requiresStorePurchase(payload)).toBe(true);
  });
});
