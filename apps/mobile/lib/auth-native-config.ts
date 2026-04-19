export const nativeAuthConfig = {
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  googleIosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME ?? "",
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? ""
};

export function isNativeGoogleConfigured() {
  return Boolean(
    nativeAuthConfig.googleWebClientId &&
      (nativeAuthConfig.googleIosClientId || nativeAuthConfig.googleIosUrlScheme)
  );
}

export function isNativeKakaoConfigured() {
  return Boolean(nativeAuthConfig.kakaoNativeAppKey);
}
