import { describe, expect, it } from "vitest";
import { buildStoreVerifyBody, getStoreVerifyOutcome } from "./store-verification";

describe("buildStoreVerifyBody", () => {
  it("builds the apple verification body from a transaction", () => {
    const body = buildStoreVerifyBody({
      invitationId: "invitation-1",
      provider: "apple_iap",
      purchase: {
        productId: "publish.credit.ios",
        transactionId: "tx-1"
      }
    });

    expect(body).toEqual({
      invitationId: "invitation-1",
      provider: "apple_iap",
      productId: "publish.credit.ios",
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
          productId: "publish.credit.ios"
        }
      })
    ).toThrow("transactionId");
  });

  it("treats verified payment with blocked publishing as a finishable partial success", () => {
    expect(
      getStoreVerifyOutcome(false, {
        success: false,
        paymentConfirmed: true,
        publishBlocked: true,
        message: "결제는 확인됐지만 공개 전 입력이 필요한 항목: 행사 일시",
        invitationId: "invitation-1",
        slug: "invite-123"
      })
    ).toEqual({
      invitationId: "invitation-1",
      message: "결제는 확인됐지만 공개 전 입력이 필요한 항목: 행사 일시",
      shouldFinishTransaction: true,
      slug: "invite-123",
      status: "publish-blocked"
    });
  });
});
