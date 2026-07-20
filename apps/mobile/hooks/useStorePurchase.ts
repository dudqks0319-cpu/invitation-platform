import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { getStoreBillingNotice, getStoreBillingProvider } from "@/lib/payments/store-billing";
import {
  getRevenueCatApiKey,
  getRevenueCatPublishPackageId,
  getStoreProductIds
} from "@/lib/payments/store-purchase";
import { getInviteHubBaseUrl } from "@/lib/web-links";

type RevenueCatPurchases = typeof import("react-native-purchases").default;

type Product = {
  displayName?: string;
  displayPrice?: string;
  id: string;
  packageId: string;
};

type StorePurchaseOptions = {
  accessToken?: string;
  invitationId?: string;
  onBeforePurchase?: () => Promise<{ invitationId: string } | null>;
  onVerified?: (result: { invitationId: string; slug: string }) => void;
  userId?: string;
};

let configuredRevenueCatApiKey = "";
let loggedInRevenueCatUserId = "";

async function ensureRevenueCatIdentity(Purchases: RevenueCatPurchases, apiKey: string, userId: string) {
  const isConfigured = await Purchases.isConfigured();
  if (!isConfigured) {
    Purchases.configure({
      apiKey,
      appUserID: userId
    });
    configuredRevenueCatApiKey = apiKey;
    loggedInRevenueCatUserId = userId;
    return;
  }

  if (configuredRevenueCatApiKey && configuredRevenueCatApiKey !== apiKey) {
    throw new Error("RevenueCat SDK가 다른 API 키로 이미 설정되었습니다. 앱을 다시 실행한 뒤 결제를 시도해 주세요.");
  }

  configuredRevenueCatApiKey = configuredRevenueCatApiKey || apiKey;
  const currentAppUserId = await Purchases.getAppUserID().catch(() => loggedInRevenueCatUserId);
  if (currentAppUserId !== userId) {
    await Purchases.logIn(userId);
    loggedInRevenueCatUserId = userId;
  }
}

export function useStorePurchase(options: StorePurchaseOptions = {}) {
  const provider = useMemo(() => getStoreBillingProvider(Platform.OS), []);
  const productIds = useMemo(() => getStoreProductIds(provider), [provider]);
  const packageId = useMemo(() => getRevenueCatPublishPackageId(), []);
  const revenueCatApiKey = useMemo(() => getRevenueCatApiKey(provider), [provider]);
  const userId = options.userId ?? "";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [productLookupCompleted, setProductLookupCompleted] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const [storePackage, setStorePackage] = useState<PurchasesPackage | null>(null);
  const accessTokenRef = useRef(options.accessToken ?? "");
  const invitationIdRef = useRef(options.invitationId ?? "");
  const onVerifiedRef = useRef(options.onVerified);
  const userIdRef = useRef(options.userId ?? "");

  useEffect(() => {
    accessTokenRef.current = options.accessToken ?? "";
    invitationIdRef.current = options.invitationId ?? invitationIdRef.current;
    onVerifiedRef.current = options.onVerified;
    userIdRef.current = userId;
  }, [options.accessToken, options.invitationId, options.onVerified, userId]);

  useEffect(() => {
    if (!provider || !revenueCatApiKey || !userId) {
      const timer = setTimeout(() => {
        setStorePackage(null);
        setProductLookupCompleted(true);
      }, 0);

      return () => clearTimeout(timer);
    }

    let mounted = true;

    async function loadOffering() {
      const Purchases = (await import("react-native-purchases")).default;
      if (!mounted) {
        return;
      }

      setProductLookupCompleted(false);
      await ensureRevenueCatIdentity(Purchases, revenueCatApiKey, userId);

      const offerings = await Purchases.getOfferings();
      const packages = offerings.current?.availablePackages ?? [];
      const matchingPackage =
        packages.find((item) => item.identifier === packageId) ??
        packages.find((item) => productIds.includes(item.product.identifier)) ??
        null;

      if (!mounted) {
        return;
      }

      setStorePackage(matchingPackage);
      if (!matchingPackage) {
        setError("RevenueCat Offering에서 발행권 상품을 찾지 못했습니다. publish_credit_1 패키지와 스토어 상품 연결을 확인해 주세요.");
      }
    }

    void loadOffering()
      .catch((caught: unknown) => {
        if (!mounted) {
          return;
        }

        setStorePackage(null);
        setError(caught instanceof Error ? caught.message : "RevenueCat 상품 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (mounted) {
          setProductLookupCompleted(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [packageId, productIds, provider, revenueCatApiKey, userId]);

  const product = useMemo<Product | null>(() => {
    if (storePackage) {
      return {
        displayName: storePackage.product.title,
        displayPrice: storePackage.product.priceString,
        id: storePackage.product.identifier,
        packageId: storePackage.identifier
      };
    }

    return productIds[0] ? { id: productIds[0], packageId } : null;
  }, [packageId, productIds, storePackage]);

  async function publishWithCredit(invitationId: string) {
    if (!accessTokenRef.current) {
      throw new Error("발행권 사용에는 로그인 세션이 필요합니다.");
    }

    const response = await fetch(`${getInviteHubBaseUrl()}/api/payments/revenuecat/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessTokenRef.current}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ invitationId })
    });
    const result = (await response.json().catch(() => ({}))) as {
      invitationId?: string;
      message?: string;
      remainingCredits?: number;
      slug?: string;
      success?: boolean;
    };

    if (!response.ok || !result.success || !result.invitationId || !result.slug) {
      throw new Error(result.message || "발행권 확인에 실패했습니다.");
    }

    return result as { invitationId: string; remainingCredits?: number; slug: string; success: true };
  }

  async function publishWhenWebhookArrives(invitationId: string) {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        return await publishWithCredit(invitationId);
      } catch (caught) {
        lastError = caught instanceof Error ? caught : new Error("발행권 확인에 실패했습니다.");
        if (!lastError.message.includes("발행권")) {
          throw lastError;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw lastError ?? new Error("RevenueCat 웹훅 확인이 지연되고 있습니다.");
  }

  async function fetchCreditBalance() {
    if (!accessTokenRef.current) {
      throw new Error("발행권 조회에는 로그인 세션이 필요합니다.");
    }

    const response = await fetch(`${getInviteHubBaseUrl()}/api/payments/revenuecat/credits`, {
      headers: {
        Authorization: `Bearer ${accessTokenRef.current}`
      }
    });
    const result = (await response.json().catch(() => ({}))) as {
      credits?: number;
      message?: string;
      success?: boolean;
    };

    if (!response.ok || !result.success) {
      throw new Error(result.message || "발행권 조회에 실패했습니다.");
    }

    return result.credits ?? 0;
  }

  async function purchase() {
    if (!provider) {
      setError("현재 기기에서는 스토어 결제를 지원하지 않습니다.");
      return;
    }

    if (!revenueCatApiKey) {
      setError("RevenueCat 공개 API 키가 설정되지 않았습니다.");
      return;
    }

    if (!userIdRef.current) {
      setError("RevenueCat 구매에는 로그인 계정이 필요합니다.");
      return;
    }

    if (!accessTokenRef.current) {
      setError("발행권 구매에는 로그인 세션이 필요합니다.");
      return;
    }

    if (!storePackage) {
      setError(
        productLookupCompleted
          ? "RevenueCat에서 발행권 상품을 찾지 못했습니다. Offering 설정을 확인해 주세요."
          : "RevenueCat 상품 정보를 확인하는 중입니다. 잠시 후 다시 시도해 주세요."
      );
      return;
    }

    setPendingPurchase(true);
    setError("");
    setMessage("초대장 정보를 저장한 뒤 스토어 결제를 시작합니다.");

    try {
      const prepared = await options.onBeforePurchase?.();
      const invitationId = prepared?.invitationId ?? options.invitationId ?? invitationIdRef.current;

      if (!invitationId) {
        throw new Error("결제 전 초대장을 서버에 저장하지 못했습니다.");
      }

      invitationIdRef.current = invitationId;

      const Purchases = (await import("react-native-purchases")).default;
      await ensureRevenueCatIdentity(Purchases, revenueCatApiKey, userIdRef.current);
      await Purchases.purchasePackage(storePackage);
      setMessage("결제가 완료되었습니다. RevenueCat 웹훅으로 발행권을 확인하는 중입니다.");

      const result = await publishWhenWebhookArrives(invitationId);
      setMessage(`발행권을 사용해 공개 링크를 발행했습니다. 남은 발행권: ${result.remainingCredits ?? 0}`);
      onVerifiedRef.current?.({
        invitationId: result.invitationId,
        slug: result.slug
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "RevenueCat 결제를 완료하지 못했습니다.");
    } finally {
      setPendingPurchase(false);
    }
  }

  async function restore() {
    if (!provider || !revenueCatApiKey || !userIdRef.current || !accessTokenRef.current) {
      setError("구매 복원에는 로그인 계정, 로그인 세션, RevenueCat 설정이 필요합니다.");
      return;
    }

    setPendingPurchase(true);
    setError("");
    setMessage("구매 내역을 복원하는 중입니다.");

    try {
      const Purchases = (await import("react-native-purchases")).default;
      await ensureRevenueCatIdentity(Purchases, revenueCatApiKey, userIdRef.current);
      await Purchases.restorePurchases();
      const credits = await fetchCreditBalance();
      setMessage(`구매 복원을 요청했습니다. 서버에서 확인된 미사용 발행권: ${credits}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "구매 복원에 실패했습니다.");
    } finally {
      setPendingPurchase(false);
    }
  }

  return {
    canPurchase: Boolean(provider && revenueCatApiKey && userId && options.accessToken && storePackage),
    connected: Boolean(revenueCatApiKey),
    error,
    message,
    notice: getStoreBillingNotice(Platform.OS),
    pendingPurchase,
    product,
    productIds,
    provider,
    purchase,
    restore
  };
}
