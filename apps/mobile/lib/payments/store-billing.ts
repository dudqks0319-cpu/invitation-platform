export type StoreBillingProvider = "apple_iap" | "google_play";

export function getStoreBillingProvider(platform: string): StoreBillingProvider | null {
  if (platform === "ios") {
    return "apple_iap";
  }

  if (platform === "android") {
    return "google_play";
  }

  return null;
}

export function getStoreBillingNotice(platform: string) {
  const provider = getStoreBillingProvider(platform);

  if (provider === "apple_iap") {
    return "iPhone 앱에서는 Apple 인앱결제로 초대장 발행권을 구매합니다.";
  }

  if (provider === "google_play") {
    return "Android 앱에서는 Google Play 결제로 초대장 발행권을 구매합니다.";
  }

  return "현재 기기에서는 스토어 결제를 지원하지 않습니다.";
}
