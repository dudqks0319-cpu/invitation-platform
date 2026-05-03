import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { getStoreBillingNotice, getStoreBillingProvider } from "@/lib/payments/store-billing";

type Product = {
  displayName?: string;
  displayPrice?: string;
  id: string;
};

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
  const product = useMemo<Product | null>(() => (productIds[0] ? { id: productIds[0] } : null), [productIds]);

  void options;

  async function purchase() {
    setError("스토어 결제는 이번 TestFlight 안정화 빌드에서 비활성화했습니다.");
  }

  return {
    canPurchase: false,
    connected: false,
    error,
    message: "",
    notice: getStoreBillingNotice(Platform.OS),
    pendingPurchase: false,
    product,
    productIds,
    provider,
    purchase
  };
}
