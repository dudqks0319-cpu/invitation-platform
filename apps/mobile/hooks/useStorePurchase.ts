import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { type Product, type Purchase, useIAP } from "react-native-iap";
import { getStoreBillingNotice, getStoreBillingProvider } from "@/lib/payments/store-billing";

function splitProductIds(raw?: string) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function useStorePurchase() {
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
    if (!pendingFinishPurchase) {
      return;
    }

    let active = true;

    void finishTransaction({ purchase: pendingFinishPurchase, isConsumable: false })
      .then(() => {
        if (!active) return;
        setMessage("스토어 결제가 완료되었습니다. 이제 서버 영수증 검증과 발행권 반영을 연결하면 됩니다.");
      })
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
  }, [finishTransaction, pendingFinishPurchase]);

  const product = useMemo<Product | null>(() => {
    if (productIds.length === 0) {
      return null;
    }

    return products.find((item) => productIds.includes(item.id)) ?? null;
  }, [productIds, products]);

  async function purchase() {
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
