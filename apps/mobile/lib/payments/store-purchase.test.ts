import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getRevenueCatApiKey,
  getRevenueCatPublishPackageId,
  getStoreProductIds,
  splitStoreProductIds
} from "./store-purchase";

describe("store purchase helpers", () => {
  it("splits comma-separated product ids without empty values", () => {
    expect(splitStoreProductIds(" com.invitehub.publish.credit, ,publish.credit.alt ")).toEqual([
      "com.invitehub.publish.credit",
      "publish.credit.alt"
    ]);
  });

  it("reads platform product ids from explicit plural env first", () => {
    expect(
      getStoreProductIds("apple_iap", {
        EXPO_PUBLIC_IAP_PRODUCT_IDS_IOS: "ios.primary,ios.extra",
        EXPO_PUBLIC_IAP_PRODUCT_ID_IOS: "ios.fallback"
      })
    ).toEqual(["ios.primary", "ios.extra"]);

    expect(
      getStoreProductIds("google_play", {
        EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID: "android.single"
      })
    ).toEqual(["android.single"]);
  });

  it("reads RevenueCat keys and publish package ids", () => {
    expect(
      getRevenueCatApiKey("apple_iap", {
        EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: "ios-key"
      })
    ).toBe("ios-key");
    expect(
      getRevenueCatApiKey("google_play", {
        EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY: "google-key"
      })
    ).toBe("google-key");
    expect(getRevenueCatPublishPackageId({})).toBe("publish_credit_1");
    expect(getRevenueCatPublishPackageId({ EXPO_PUBLIC_REVENUECAT_PUBLISH_PACKAGE_ID: "custom_package" })).toBe("custom_package");
  });

  it("uses RevenueCat packages instead of direct StoreKit purchase requests", () => {
    const hookSource = readFileSync(join(process.cwd(), "apps/mobile/hooks/useStorePurchase.ts"), "utf8");

    expect(hookSource).toContain("react-native-purchases");
    expect(hookSource).toContain("Purchases.configure");
    expect(hookSource).toContain("ensureRevenueCatIdentity(Purchases, revenueCatApiKey, userId)");
    expect(hookSource).toContain("Purchases.isConfigured");
    expect(hookSource).toContain("Purchases.getAppUserID");
    expect(hookSource).toContain("Purchases.logIn(userId)");
    expect(hookSource).toContain("Purchases.getOfferings");
    expect(hookSource).toContain("Purchases.purchasePackage(storePackage)");
    expect(hookSource).toContain("Purchases.restorePurchases");
    expect(hookSource).toContain("/api/payments/revenuecat/publish");
    expect(hookSource).toContain("/api/payments/revenuecat/credits");
    expect(hookSource).toContain("서버에서 확인된 미사용 발행권");
    expect(hookSource).not.toContain("/api/payments/store/verify");
    expect(hookSource).not.toContain("requestPurchase");
  });

  it("does not treat the client purchase result as publish authority", () => {
    const hookSource = readFileSync(join(process.cwd(), "apps/mobile/hooks/useStorePurchase.ts"), "utf8");
    const purchaseFunctionIndex = hookSource.indexOf("async function purchase()");
    const tokenGuardIndex = hookSource.indexOf("발행권 구매에는 로그인 세션이 필요합니다.");
    const purchaseIndex = hookSource.indexOf("await Purchases.purchasePackage(storePackage)");
    const publishIndex = hookSource.indexOf("const result = await publishWhenWebhookArrives(invitationId)");
    const verifiedIndex = hookSource.indexOf("onVerifiedRef.current?.({");

    expect(purchaseFunctionIndex).toBeGreaterThan(-1);
    expect(tokenGuardIndex).toBeGreaterThan(purchaseFunctionIndex);
    expect(tokenGuardIndex).toBeLessThan(purchaseIndex);
    expect(purchaseIndex).toBeGreaterThan(-1);
    expect(publishIndex).toBeGreaterThan(purchaseIndex);
    expect(verifiedIndex).toBeGreaterThan(publishIndex);
    expect(hookSource).toContain("provider && revenueCatApiKey && userIdRef.current && accessTokenRef.current && storePackage");
    expect(hookSource).toContain("await ensureRevenueCatIdentity(Purchases, revenueCatApiKey, userIdRef.current)");
    expect(hookSource).toContain("결제가 완료되었습니다. RevenueCat 웹훅으로 발행권을 확인하는 중입니다.");
    expect(hookSource).toContain("발행권을 사용해 공개 링크를 발행했습니다.");
    expect(hookSource).toContain("publishWhenWebhookArrives(invitationId)");
    expect(hookSource).toContain("publishWithCredit(invitationId)");
    expect(hookSource).toContain("/api/payments/revenuecat/publish");
    expect(hookSource).not.toContain("/api/payments/store/verify");
    expect(hookSource).not.toMatch(/const\s+\w+\s*=\s*await\s+Purchases\.purchasePackage\(storePackage\)/);
  });

  it("keeps the mobile purchase card review-safe and restore-capable", () => {
    const cardSource = readFileSync(join(process.cwd(), "apps/mobile/components/payments/StorePurchaseCard.tsx"), "utf8");

    expect(cardSource).toContain("Apple 인앱결제");
    expect(cardSource).toContain("Google Play 결제");
    expect(cardSource).toContain("프리미엄 발행권");
    expect(cardSource).toContain("발행권 구매하기");
    expect(cardSource).toContain("구매 복원");
    expect(cardSource).toContain("초대장 1개 최종 발행");
    expect(cardSource).toContain("RSVP");
    expect(cardSource).toContain("방명록");
    expect(cardSource).toContain("지도와 계좌 표시");
    expect(cardSource).not.toMatch(/웹\s*결제|웹결제|외부\s*결제|카카오페이|토스(?:페이)?|계좌이체|PortOne|포트원|PG\s*결제/);
  });
});
