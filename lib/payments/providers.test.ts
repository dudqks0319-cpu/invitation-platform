import { describe, expect, it } from "vitest";
import {
  appPaymentProviders,
  getPaymentProviderMeta,
  isAppPaymentProvider,
  isWebPaymentProvider,
  webPaymentProviders
} from "@/lib/payments/providers";

describe("payment providers", () => {
  it("separates web and app provider groups", () => {
    expect(webPaymentProviders).toEqual(["kakaopay", "naverpay", "credit_card", "bank_transfer"]);
    expect(appPaymentProviders).toEqual(["apple_iap", "google_play"]);
  });

  it("classifies providers correctly", () => {
    expect(isWebPaymentProvider("kakaopay")).toBe(true);
    expect(isWebPaymentProvider("apple_iap")).toBe(false);
    expect(isAppPaymentProvider("google_play")).toBe(true);
    expect(isAppPaymentProvider("credit_card")).toBe(false);
  });

  it("exposes user-facing labels and review-safety hints", () => {
    expect(getPaymentProviderMeta("naverpay").label).toBe("네이버페이");
    expect(getPaymentProviderMeta("apple_iap").requiresStoreReviewSafeFlow).toBe(true);
  });
});
