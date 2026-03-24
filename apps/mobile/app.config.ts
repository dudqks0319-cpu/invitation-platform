import type { ExpoConfig, ConfigContext } from "expo/config";

const IS_PROD = process.env.APP_ENV === "production";

const bundleId = IS_PROD
  ? "kr.co.invitehub.app"
  : "kr.co.invitehub.app.dev";

const scheme = IS_PROD ? "invitehub" : "invitehub-dev";

const config = ({ config: baseConfig }: ConfigContext): ExpoConfig => ({
  ...baseConfig,
  name: IS_PROD ? "InviteHub" : "InviteHub Dev",
  slug: "invitehub",
  version: "1.0.0",
  orientation: "portrait",
  scheme,
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF"
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: bundleId,
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false
    },
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [scheme]
        }
      ],
      NSPhotoLibraryUsageDescription: "초대장에 사진을 추가하려면 사진 접근 권한이 필요합니다.",
      NSCameraUsageDescription: "초대장에 사진을 촬영하려면 카메라 접근 권한이 필요합니다."
    },
    associatedDomains: [
      `applinks:${IS_PROD ? "invitehub.co.kr" : "dev.invitehub.co.kr"}`
    ]
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication"
  ],
  extra: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://invitehub.co.kr",
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? ""
    }
  }
});

export default config;
