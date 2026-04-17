import { describe, expect, it } from "vitest";
import {
  appPaymentProviders,
  getPaymentProviderMeta,
  isAppPaymentProvider
} from "@/lib/payments/providers";

describe("payment providers", () => {
  it("keeps only app-store billing providers", () => {
    expect(appPaymentProviders).toEqual(["apple_iap", "google_play"]);
  });

  it("classifies providers correctly", () => {
    expect(isAppPaymentProvider("google_play")).toBe(true);
    expect(isAppPaymentProvider("apple_iap")).toBe(true);
  });

  it("exposes user-facing labels and review-safety hints", () => {
    expect(getPaymentProviderMeta("google_play").label).toBe("Google Play 결제");
    expect(getPaymentProviderMeta("apple_iap").requiresStoreReviewSafeFlow).toBe(true);
  });
});
