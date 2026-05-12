export type StoreVerificationProvider = "apple_iap" | "google_play";

export type StoreVerificationPurchase = {
  productId?: string;
  purchaseToken?: string | null;
  transactionId?: string;
  transactionReceipt?: string | null;
};

export type StoreVerifyResult = {
  success?: boolean;
  paymentConfirmed?: boolean;
  publishBlocked?: boolean;
  message?: string;
  invitationId?: string;
  slug?: string;
};

export type StoreVerifyOutcome =
  | {
      status: "published";
      shouldFinishTransaction: true;
      invitationId: string;
      slug: string;
      message: string;
    }
  | {
      status: "publish-blocked";
      shouldFinishTransaction: true;
      invitationId: string;
      slug: string;
      message: string;
    }
  | {
      status: "failed";
      shouldFinishTransaction: false;
      message: string;
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

export function getStoreVerifyOutcome(responseOk: boolean, result: StoreVerifyResult): StoreVerifyOutcome {
  if (result.paymentConfirmed && result.publishBlocked) {
    return {
      status: "publish-blocked",
      shouldFinishTransaction: true,
      invitationId: result.invitationId ?? "",
      slug: result.slug ?? "",
      message: result.message || "결제는 확인됐습니다. 필요한 정보를 입력한 뒤 발행을 완료해 주세요."
    };
  }

  if (!responseOk || !result.success || !result.invitationId || !result.slug) {
    return {
      status: "failed",
      shouldFinishTransaction: false,
      message: result.message || "스토어 결제 검증에 실패했습니다."
    };
  }

  return {
    status: "published",
    shouldFinishTransaction: true,
    invitationId: result.invitationId,
    slug: result.slug,
    message: "스토어 결제가 완료되어 초대장을 발행했습니다."
  };
}
