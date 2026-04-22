import { readFileSync } from "node:fs";
import path from "node:path";

const appJson = JSON.parse(
  readFileSync(path.join(__dirname, "app.json"), "utf8")
);

const baseConfig = appJson.expo;
const buildProfile = process.env.EAS_BUILD_PROFILE ?? "";
const variant = process.env.APP_VARIANT ?? (buildProfile === "production" ? "production" : "development");
const isProduction = variant === "production";
const bundleId = process.env.APP_BUNDLE_ID || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const androidPackage = process.env.APP_ANDROID_PACKAGE || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME ?? "";
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "";
const productionRequiredEnv = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_WEB_BASE_URL",
  "EXPO_PUBLIC_IAP_PRODUCT_ID_IOS",
  "EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID",
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
  "GOOGLE_IOS_URL_SCHEME",
  "EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY"
];

if (isProduction) {
  const missingProductionEnv = productionRequiredEnv.filter((key) => !process.env[key]?.trim());
  if (missingProductionEnv.length > 0) {
    throw new Error(`Missing production mobile config: ${missingProductionEnv.join(", ")}`);
  }

  const webBaseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim() ?? "";
  const parsedWebBaseUrl = new URL(webBaseUrl);
  const host = parsedWebBaseUrl.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (parsedWebBaseUrl.protocol !== "https:" || isLocalHost) {
    throw new Error("Production mobile config must use an https public URL.");
  }
}

type ExpoPluginConfig = string | [string, Record<string, unknown>];

const basePlugins: ExpoPluginConfig[] = Array.isArray(baseConfig.plugins) ? baseConfig.plugins : [];
const mergedPlugins = [
  "expo-router",
  "expo-web-browser",
  "react-native-iap",
  [
    "expo-build-properties",
    {
      android: {
        kotlinVersion: "2.1.20",
        extraMavenRepos: [
          "https://devrepo.kakao.com/nexus/content/groups/public/"
        ]
      }
    }
  ],
  ...(googleIosUrlScheme
    ? [[
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: googleIosUrlScheme
        }
      ]]
    : []),
  ...(kakaoNativeAppKey
    ? [[
        "@react-native-kakao/core",
        {
          nativeAppKey: kakaoNativeAppKey,
          android: {
            authCodeHandlerActivity: true
          },
          ios: {
            handleKakaoOpenUrl: true
          }
        }
      ]]
    : [])
];

const appConfig = {
  ...baseConfig,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FDF8F3"
  },
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: bundleId,
    infoPlist: {
      ...(baseConfig.ios?.infoPlist ?? {}),
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    ...baseConfig.android,
    package: androidPackage
  },
  plugins: [
    ...mergedPlugins,
    ...basePlugins.filter((plugin: ExpoPluginConfig) => {
      if (typeof plugin === "string") {
        return !mergedPlugins.includes(plugin);
      }

      const pluginName = Array.isArray(plugin) ? plugin[0] : "";
      return !mergedPlugins.some((candidate) => Array.isArray(candidate) && candidate[0] === pluginName);
    })
  ],
  extra: {
    ...baseConfig.extra,
    appVariant: variant
  }
};

export default appConfig;
