import { describe, expect, it } from "vitest";
import { buildStoreVerifyBody } from "./store-verification";

describe("buildStoreVerifyBody", () => {
  it("builds the apple verification body from a transaction", () => {
    const body = buildStoreVerifyBody({
      invitationId: "invitation-1",
      provider: "apple_iap",
      purchase: {
        productId: "com.invitehub.publish.credit",
        transactionId: "tx-1"
      }
    });

    expect(body).toEqual({
      invitationId: "invitation-1",
      provider: "apple_iap",
      productId: "com.invitehub.publish.credit",
      transactionId: "tx-1"
    });
  });

  it("builds the google verification body from a purchase token", () => {
    const body = buildStoreVerifyBody({
      invitationId: "invitation-1",
      provider: "google_play",
      purchase: {
        productId: "publish.credit.android",
        purchaseToken: "purchase-token"
      }
    });

    expect(body).toEqual({
      invitationId: "invitation-1",
      provider: "google_play",
      productId: "publish.credit.android",
      purchaseToken: "purchase-token"
    });
  });

  it("rejects incomplete store purchase payloads", () => {
    expect(() =>
      buildStoreVerifyBody({
        invitationId: "invitation-1",
        provider: "apple_iap",
        purchase: {
          productId: "com.invitehub.publish.credit"
        }
      })
    ).toThrow("transactionId");
  });
});
