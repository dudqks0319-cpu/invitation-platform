import { describe, expect, it } from "vitest";
import {
  getStoreProviderReference,
  isAllowedAnyStoreProductId,
  isAllowedStoreProductId,
  sanitizeStoreVerification
} from "@/lib/payments/store-entitlements";

describe("store entitlements", () => {
  it("allows only configured publish products", () => {
    expect(isAllowedStoreProductId("apple_iap", "com.invitehub.publish.credit")).toBe(true);
    expect(isAllowedStoreProductId("apple_iap", "other.sku")).toBe(false);
    expect(isAllowedStoreProductId("google_play", "publish.credit.android")).toBe(true);
    expect(isAllowedStoreProductId("google_play", "other.sku")).toBe(false);
    expect(isAllowedAnyStoreProductId("com.invitehub.publish.credit")).toBe(true);
    expect(isAllowedAnyStoreProductId("publish.credit.android")).toBe(true);
    expect(isAllowedAnyStoreProductId("other.sku")).toBe(false);
  });

  it("redacts sensitive verification payloads", () => {
    expect(
      sanitizeStoreVerification("google_play", {
        productId: "publish.credit.android",
        purchaseToken: "secret-token",
        orderId: "order-1",
        purchaseState: 0
      })
    ).toEqual({
      acknowledgementState: null,
      consumptionState: null,
      orderId: "order-1",
      productId: "publish.credit.android",
      purchaseState: 0
    });
  });

  it("uses a non-secret provider reference for Google purchases", () => {
    expect(
      getStoreProviderReference("google_play", {
        orderId: "order-1",
        purchaseToken: "secret-token"
      })
    ).toBe("order-1");
  });
});
