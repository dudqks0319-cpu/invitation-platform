export type PaymentProvider =
  | "kakaopay"
  | "naverpay"
  | "credit_card"
  | "bank_transfer"
  | "apple_iap"
  | "google_play";

export type PaymentSurface = "web" | "app";

export type PaymentProviderMeta = {
  provider: PaymentProvider;
  label: string;
  description: string;
  surface: PaymentSurface;
  requiresStoreReviewSafeFlow: boolean;
};

export const paymentProviderMeta: Record<PaymentProvider, PaymentProviderMeta> = {
  kakaopay: {
    provider: "kakaopay",
    label: "카카오페이",
    description: "카카오페이 머니 또는 연결된 카드로 결제합니다.",
    surface: "web",
    requiresStoreReviewSafeFlow: false
  },
  naverpay: {
    provider: "naverpay",
    label: "네이버페이",
    description: "네이버페이 머니, 카드, 계좌이체로 결제합니다.",
    surface: "web",
    requiresStoreReviewSafeFlow: false
  },
  credit_card: {
    provider: "credit_card",
    label: "신용카드",
    description: "국내 PG를 통한 일반 카드 결제입니다.",
    surface: "web",
    requiresStoreReviewSafeFlow: false
  },
  bank_transfer: {
    provider: "bank_transfer",
    label: "계좌이체",
    description: "국내 PG를 통한 실시간 계좌이체입니다.",
    surface: "web",
    requiresStoreReviewSafeFlow: false
  },
  apple_iap: {
    provider: "apple_iap",
    label: "Apple 인앱결제",
    description: "iOS 앱에서는 Apple In-App Purchase를 사용합니다.",
    surface: "app",
    requiresStoreReviewSafeFlow: true
  },
  google_play: {
    provider: "google_play",
    label: "Google Play 결제",
    description: "Android 앱에서는 Google Play Billing을 사용합니다.",
    surface: "app",
    requiresStoreReviewSafeFlow: true
  }
};

export const webPaymentProviders: PaymentProvider[] = [
  "kakaopay",
  "naverpay",
  "credit_card",
  "bank_transfer"
];

export const appPaymentProviders: PaymentProvider[] = ["apple_iap", "google_play"];

export function isWebPaymentProvider(provider: PaymentProvider): boolean {
  return webPaymentProviders.includes(provider);
}

export function isAppPaymentProvider(provider: PaymentProvider): boolean {
  return appPaymentProviders.includes(provider);
}

export function getPaymentProviderMeta(provider: PaymentProvider) {
  return paymentProviderMeta[provider];
}
