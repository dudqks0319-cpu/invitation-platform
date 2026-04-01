export type StoreVerificationProvider = "apple_iap" | "google_play";

export type StoreVerificationPurchase = {
  productId?: string;
  purchaseToken?: string | null;
  transactionId?: string;
  transactionReceipt?: string | null;
};

export function buildStoreVerifyBody(options: {
  invitationId: string;
  provider: StoreVerificationProvider;
  purchase: StoreVerificationPurchase;
  environment?: "sandbox" | "production";
}) {
  const { environment, invitationId, provider, purchase } = options;

  if (!purchase.productId) {
    throw new Error("productId is required");
  }

  if (provider === "apple_iap") {
    if (!purchase.transactionId) {
      throw new Error("transactionId is required");
    }

    return {
      invitationId,
      provider,
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      ...(purchase.transactionReceipt ? { receiptData: purchase.transactionReceipt } : {}),
      ...(environment ? { environment } : {})
    };
  }

  if (!purchase.purchaseToken) {
    throw new Error("purchaseToken is required");
  }

  return {
    invitationId,
    provider,
    productId: purchase.productId,
    purchaseToken: purchase.purchaseToken
  };
}
