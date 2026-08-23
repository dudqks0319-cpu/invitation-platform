import { createHash } from "crypto";

type StoreProvider = "apple_iap" | "google_play";

function splitConfiguredIds(raw: string | undefined, fallback: string) {
  return (raw ?? fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getAllowedStoreProductIds(provider: StoreProvider) {
  if (provider === "apple_iap") {
    return splitConfiguredIds(
      process.env.STORE_PUBLISH_PRODUCT_IDS_IOS ??
        process.env.EXPO_PUBLIC_IAP_PRODUCT_IDS_IOS ??
        process.env.EXPO_PUBLIC_IAP_PRODUCT_ID_IOS,
      "com.invitehub.publish.credit"
    );
  }

  return splitConfiguredIds(
    process.env.STORE_PUBLISH_PRODUCT_IDS_ANDROID ??
      process.env.EXPO_PUBLIC_IAP_PRODUCT_IDS_ANDROID ??
      process.env.EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID,
    "publish.credit.android"
  );
}

export function isAllowedStoreProductId(provider: StoreProvider, productId: string) {
  return getAllowedStoreProductIds(provider).includes(productId);
}

export function isAllowedAnyStoreProductId(productId: string) {
  return isAllowedStoreProductId("apple_iap", productId) || isAllowedStoreProductId("google_play", productId);
}

export function sanitizeStoreVerification(provider: StoreProvider, verification: Record<string, unknown>) {
  if (provider === "apple_iap") {
    return {
      bundleId: verification.bundleId ?? null,
      environment: verification.environment ?? null,
      originalTransactionId: verification.originalTransactionId ?? null,
      productId: verification.productId ?? null,
      transactionId: verification.transactionId ?? null
    };
  }

  return {
    acknowledgementState: verification.acknowledgementState ?? null,
    consumptionState: verification.consumptionState ?? null,
    orderId: verification.orderId ?? null,
    productId: verification.productId ?? null,
    purchaseState: verification.purchaseState ?? null
  };
}

export function getStoreProviderReference(provider: StoreProvider, verification: Record<string, unknown>) {
  if (provider === "apple_iap") {
    return String(verification.transactionId ?? "");
  }

  const orderId = verification.orderId;
  if (typeof orderId === "string" && orderId.trim()) {
    return orderId;
  }

  const purchaseToken = verification.purchaseToken;
  if (typeof purchaseToken === "string" && purchaseToken.trim()) {
    return createHash("sha256").update(purchaseToken).digest("hex");
  }

  return "";
}
