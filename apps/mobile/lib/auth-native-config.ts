import { parsePublicBooleanFlag } from "./release-flags";

export const nativeAuthConfig = {
  nativeSocialAuthEnabled: parsePublicBooleanFlag(process.env.EXPO_PUBLIC_ENABLE_NATIVE_SOCIAL_AUTH, false),
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  googleIosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME ?? "",
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? ""
};

export function isNativeGoogleConfigured() {
  return Boolean(
    nativeAuthConfig.nativeSocialAuthEnabled &&
      nativeAuthConfig.googleWebClientId &&
      (nativeAuthConfig.googleIosClientId || nativeAuthConfig.googleIosUrlScheme)
  );
}

export function isNativeKakaoConfigured() {
  return Boolean(nativeAuthConfig.nativeSocialAuthEnabled && nativeAuthConfig.kakaoNativeAppKey);
}
