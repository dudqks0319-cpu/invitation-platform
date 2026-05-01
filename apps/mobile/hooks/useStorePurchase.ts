import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { type Product, type Purchase, useIAP } from "react-native-iap";
import { getInviteHubBaseUrl } from "@/lib/web-links";
import { getStoreBillingNotice, getStoreBillingProvider } from "@/lib/payments/store-billing";
import { buildStoreVerifyBody } from "@/lib/payments/store-verification";

function splitProductIds(raw?: string) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

type StorePurchaseOptions = {
  accessToken?: string;
  invitationId?: string;
  onBeforePurchase?: () => Promise<{ invitationId: string } | null>;
  onVerified?: (result: { invitationId: string; slug: string }) => void;
};

export function useStorePurchase(options: StorePurchaseOptions = {}) {
  const provider = useMemo(() => getStoreBillingProvider(Platform.OS), []);
  const productIds = useMemo(() => {
    if (provider === "apple_iap") {
      return splitProductIds(process.env.EXPO_PUBLIC_IAP_PRODUCT_IDS_IOS ?? process.env.EXPO_PUBLIC_IAP_PRODUCT_ID_IOS);
    }

    if (provider === "google_play") {
      return splitProductIds(process.env.EXPO_PUBLIC_IAP_PRODUCT_IDS_ANDROID ?? process.env.EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID);
    }

    return [];
  }, [provider]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const [pendingFinishPurchase, setPendingFinishPurchase] = useState<Purchase | null>(null);
  const resolvedInvitationIdRef = useRef(options.invitationId ?? "");
  const accessToken = options.accessToken;
  const optionInvitationId = options.invitationId ?? "";
  const onBeforePurchase = options.onBeforePurchase;
  const onVerified = options.onVerified;

  const { connected, products, fetchProducts, finishTransaction, requestPurchase } = useIAP({
    onError: (caught) => {
      setError(caught.message);
    },
    onPurchaseError: (caught) => {
      setPendingPurchase(false);
      setError(caught.message);
    },
    onPurchaseSuccess: (purchase) => {
      setPendingFinishPurchase(purchase);
    }
  });

  useEffect(() => {
    if (!connected || productIds.length === 0) {
      return;
    }

    void fetchProducts({ skus: productIds, type: "in-app" }).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "스토어 상품 정보를 불러오지 못했습니다.");
    });
  }, [connected, fetchProducts, productIds]);

  useEffect(() => {
    resolvedInvitationIdRef.current = optionInvitationId;
  }, [optionInvitationId]);

  const product = useMemo<Product | null>(() => {
    if (productIds.length === 0) {
      return null;
    }

    return products.find((item) => productIds.includes(item.id)) ?? null;
  }, [productIds, products]);

  useEffect(() => {
    if (!pendingFinishPurchase) {
      return;
    }

    let active = true;
    const purchaseToFinish = pendingFinishPurchase;
    const invitationId = resolvedInvitationIdRef.current || optionInvitationId;
    const purchase = purchaseToFinish as Purchase & {
      productId?: string;
      purchaseToken?: string | null;
      transactionId?: string;
      transactionReceipt?: string | null;
    };

    async function verifyPendingPurchase() {
      if (!accessToken) {
        throw new Error("로그인 후 스토어 결제를 연결할 수 있습니다.");
      }

      if (!provider || !invitationId) {
        throw new Error("결제할 초대장을 먼저 서버에 저장해 주세요.");
      }

      const verificationBody = buildStoreVerifyBody({
        invitationId,
        provider,
        purchase: {
          productId: purchase.productId ?? product?.id ?? productIds[0],
          purchaseToken: purchase.purchaseToken ?? undefined,
          transactionId: purchase.transactionId,
          transactionReceipt: purchase.transactionReceipt ?? undefined
        },
        environment: provider === "apple_iap" ? (__DEV__ ? "sandbox" : "production") : undefined
      });

      const response = await fetch(`${getInviteHubBaseUrl()}/api/payments/store/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(verificationBody)
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        invitationId?: string;
        slug?: string;
      };

      if (!response.ok || !result.success || !result.invitationId || !result.slug) {
        throw new Error(result.message || "스토어 결제 검증에 실패했습니다.");
      }

      await finishTransaction({ purchase: purchaseToFinish, isConsumable: true });

      if (!active) return;
      onVerified?.({
        invitationId: result.invitationId,
        slug: result.slug
      });
      setMessage("스토어 결제가 완료되어 초대장을 발행했습니다.");
    }

    void verifyPendingPurchase()
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "스토어 결제 마무리에 실패했습니다.");
      })
      .finally(() => {
        if (!active) return;
        setPendingPurchase(false);
        setPendingFinishPurchase(null);
      });

    return () => {
      active = false;
    };
  }, [
    accessToken,
    finishTransaction,
    onVerified,
    optionInvitationId,
    pendingFinishPurchase,
    product,
    productIds,
    provider
  ]);

  async function purchase() {
    if (!accessToken) {
      setError("로그인 후 스토어 결제를 사용할 수 있습니다.");
      return;
    }

    let invitationId = resolvedInvitationIdRef.current || optionInvitationId;

    if (!invitationId && onBeforePurchase) {
      try {
        const prepared = await onBeforePurchase();
        invitationId = prepared?.invitationId ?? "";
        if (invitationId) {
          resolvedInvitationIdRef.current = invitationId;
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "결제 준비용 초안을 저장하지 못했습니다.");
        return;
      }
    }

    if (!invitationId) {
      setError("결제할 초대장을 먼저 서버에 저장해 주세요.");
      return;
    }

    if (!provider) {
      setError("이 기기에서는 스토어 결제를 지원하지 않습니다.");
      return;
    }

    if (productIds.length === 0) {
      setError("스토어 상품 ID가 설정되지 않았습니다.");
      return;
    }

    if (!product) {
      setError("스토어 상품 정보를 아직 불러오지 못했습니다.");
      return;
    }

    setError("");
    setMessage("");
    setPendingPurchase(true);

    try {
      if (provider === "apple_iap") {
        await requestPurchase({
          request: {
            apple: {
              sku: product.id
            }
          },
          type: "in-app"
        });
        return;
      }

      await requestPurchase({
        request: {
          google: {
            skus: [product.id]
          }
        },
        type: "in-app"
      });
    } catch (caught) {
      setPendingPurchase(false);
      setError(caught instanceof Error ? caught.message : "스토어 결제를 시작하지 못했습니다.");
    }
  }

  return {
    canPurchase: Boolean(product && provider),
    connected,
    error,
    message,
    notice: getStoreBillingNotice(Platform.OS),
    pendingPurchase,
    product,
    productIds,
    provider,
    purchase
  };
}
