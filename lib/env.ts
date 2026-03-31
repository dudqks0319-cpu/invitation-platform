export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  kakaoPayCid: process.env.KAKAOPAY_CID ?? "",
  kakaoPaySecretKey: process.env.KAKAOPAY_SECRET_KEY ?? "",
  portOneStoreId: process.env.PORTONE_STORE_ID ?? "",
  portOneChannelKey: process.env.PORTONE_CHANNEL_KEY ?? "",
  revenueCatAppleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? "",
  revenueCatGoogleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? "",
  appleAppStoreIssuerId: process.env.APPLE_APP_STORE_ISSUER_ID ?? "",
  appleAppStoreKeyId: process.env.APPLE_APP_STORE_KEY_ID ?? "",
  appleAppStorePrivateKey: process.env.APPLE_APP_STORE_PRIVATE_KEY ?? "",
  appleBundleId: process.env.APPLE_BUNDLE_ID ?? "",
  googlePlayPackageName: process.env.GOOGLE_PLAY_PACKAGE_NAME ?? "",
  googlePlayServiceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ?? ""
};

export function isSupabaseEnabled() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isKakaoPayEnabled() {
  return Boolean(env.kakaoPayCid && env.kakaoPaySecretKey);
}

export function isPortOneEnabled() {
  return Boolean(env.portOneStoreId && env.portOneChannelKey);
}

export function isAppleStoreVerificationEnabled() {
  return Boolean(
    env.appleAppStoreIssuerId &&
      env.appleAppStoreKeyId &&
      env.appleAppStorePrivateKey &&
      env.appleBundleId
  );
}

export function isGooglePlayVerificationEnabled() {
  return Boolean(env.googlePlayPackageName && env.googlePlayServiceAccountJson);
}
