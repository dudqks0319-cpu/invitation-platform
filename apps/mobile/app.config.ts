import type { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_ENV === "development";
const IS_STAGING = process.env.APP_ENV === "staging";

const getScheme = () => {
  if (IS_DEV) return "invitehub-dev";
  if (IS_STAGING) return "invitehub-staging";
  return "invitehub";
};

const getBundleId = () => {
  if (IS_DEV) return "kr.co.invitehub.app.dev";
  if (IS_STAGING) return "kr.co.invitehub.app.staging";
  return "kr.co.invitehub.app";
};

const getAppName = () => {
  if (IS_DEV) return "InviteHub (Dev)";
  if (IS_STAGING) return "InviteHub (Staging)";
  return "InviteHub";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "invitehub",
  version: "1.0.0",
  orientation: "portrait",
  scheme: getScheme(),
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF"
  },
  ios: {
    bundleIdentifier: getBundleId(),
    supportsTablet: false,
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription:
        "초대장에 넣을 사진을 촬영하기 위해 카메라 접근이 필요합니다.",
      NSPhotoLibraryUsageDescription:
        "초대장에 넣을 사진을 선택하기 위해 사진 라이브러리 접근이 필요합니다.",
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [getScheme()]
        },
        ...(process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY
          ? [
              {
                CFBundleURLSchemes: [
                  `kakao${process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY}`
                ]
              }
            ]
          : [])
      ]
    },
    associatedDomains: [
      "applinks:invitehub.co.kr",
      "webcredentials:invitehub.co.kr"
    ],
    entitlements: {
      "com.apple.developer.applesignin": ["Default"]
    }
  },
  android: {
    package: getBundleId().replace(/\.app/, ".app"),
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    }
  },
  plugins: [
    "expo-router",
    "expo-apple-authentication",
    "expo-image-picker",
    "expo-secure-store"
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? ""
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    siteUrl: process.env.EXPO_PUBLIC_SITE_URL ?? "https://invitehub.co.kr"
  }
});
