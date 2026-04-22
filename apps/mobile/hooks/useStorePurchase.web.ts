import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { getStoreBillingNotice, getStoreBillingProvider } from "@/lib/payments/store-billing";

type StorePurchaseOptions = {
  accessToken?: string;
  invitationId?: string;
  onBeforePurchase?: () => Promise<{ invitationId: string } | null>;
  onVerified?: (result: { invitationId: string; slug: string }) => void;
};

export function useStorePurchase(_options: StorePurchaseOptions = {}) {
  void _options;
  const provider = useMemo(() => getStoreBillingProvider(Platform.OS), []);
  const [error, setError] = useState("");
  const [message] = useState("");

  async function purchase() {
    setError("웹 미리보기에서는 스토어 결제를 사용할 수 없습니다.");
  }

  return {
    canPurchase: false,
    connected: false,
    error,
    message,
    notice: getStoreBillingNotice(Platform.OS),
    pendingPurchase: false,
    product: null,
    productIds: [],
    provider,
    purchase
  };
}
