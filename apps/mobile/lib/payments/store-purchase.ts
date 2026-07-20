import type { StoreVerificationProvider } from "./store-verification";

type StoreProductEnv = Record<string, string | undefined> & {
  EXPO_PUBLIC_IAP_PRODUCT_IDS_ANDROID?: string;
  EXPO_PUBLIC_IAP_PRODUCT_IDS_IOS?: string;
  EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID?: string;
  EXPO_PUBLIC_IAP_PRODUCT_ID_IOS?: string;
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_PUBLISH_PACKAGE_ID?: string;
};

export function splitStoreProductIds(raw?: string) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getStoreProductIds(provider: StoreVerificationProvider | null, env: StoreProductEnv = process.env) {
  if (provider === "apple_iap") {
    return splitStoreProductIds(env.EXPO_PUBLIC_IAP_PRODUCT_IDS_IOS ?? env.EXPO_PUBLIC_IAP_PRODUCT_ID_IOS);
  }

  if (provider === "google_play") {
    return splitStoreProductIds(env.EXPO_PUBLIC_IAP_PRODUCT_IDS_ANDROID ?? env.EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID);
  }

  return [];
}

export function getRevenueCatApiKey(provider: StoreVerificationProvider | null, env: StoreProductEnv = process.env) {
  if (provider === "apple_iap") {
    return env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
  }

  if (provider === "google_play") {
    return env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? "";
  }

  return "";
}

export function getRevenueCatPublishPackageId(env: StoreProductEnv = process.env) {
  return env.EXPO_PUBLIC_REVENUECAT_PUBLISH_PACKAGE_ID?.trim() || "publish_credit_1";
}
