export type PaymentProvider =
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

export const appPaymentProviders: PaymentProvider[] = ["apple_iap", "google_play"];

export function isAppPaymentProvider(provider: PaymentProvider): boolean {
  return appPaymentProviders.includes(provider);
}

export function getPaymentProviderMeta(provider: PaymentProvider) {
  return paymentProviderMeta[provider];
}
