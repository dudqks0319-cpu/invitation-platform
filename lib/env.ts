export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
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
