import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const appJson = JSON.parse(
  readFileSync(path.join(__dirname, "app.json"), "utf8")
);
const resolveFromMobile = createRequire(path.join(__dirname, "package.json"));

type ExpoPlugin = string | [string, Record<string, unknown>?];

const baseConfig = appJson.expo;
const buildProfile = process.env.EAS_BUILD_PROFILE ?? "";
const variant = process.env.APP_VARIANT ?? (buildProfile === "production" ? "production" : "development");
const isProduction = variant === "production";
const bundleId = process.env.APP_BUNDLE_ID || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const androidPackage = process.env.APP_ANDROID_PACKAGE || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const scheme = process.env.APP_SCHEME || (isProduction ? "invitehub" : "invitehub-dev");
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME ?? "";
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "";
const basePlugins = (Array.isArray(baseConfig.plugins) ? baseConfig.plugins : []) as ExpoPlugin[];
const paidPublishingEnabled = parsePublicBooleanFlag(process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH);
const nativeSocialAuthEnabled = parsePublicBooleanFlag(process.env.EXPO_PUBLIC_ENABLE_NATIVE_SOCIAL_AUTH);

function hasPackage(packageName: string) {
  try {
    resolveFromMobile.resolve(`${packageName}/package.json`);
    return true;
  } catch {
    return false;
  }
}

function parsePublicBooleanFlag(value: string | undefined, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", ""].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

const paidPublishingNativeAvailable = paidPublishingEnabled && hasPackage("react-native-purchases");
const googleSignInNativeAvailable =
  nativeSocialAuthEnabled && hasPackage("@react-native-google-signin/google-signin");
const kakaoNativeAvailable =
  nativeSocialAuthEnabled && hasPackage("@react-native-kakao/core");

function isOptionalNativePluginEnabled(pluginName: string) {
  if (pluginName === "react-native-iap") {
    return paidPublishingNativeAvailable;
  }

  if (pluginName === "expo-iap") {
    return false;
  }

  if (pluginName === "@react-native-google-signin/google-signin") {
    return googleSignInNativeAvailable;
  }

  if (["@react-native-kakao/core", "@react-native-kakao/user"].includes(pluginName)) {
    return kakaoNativeAvailable;
  }

  return true;
}

const googleSignInPlugin: ExpoPlugin | null = googleSignInNativeAvailable && googleIosUrlScheme
  ? [
    "@react-native-google-signin/google-signin",
    {
      iosUrlScheme: googleIosUrlScheme
    }
  ]
  : null;
const kakaoPlugin: ExpoPlugin | null = kakaoNativeAvailable && kakaoNativeAppKey
  ? [
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
  ]
  : null;
const mergedPlugins: ExpoPlugin[] = [
  "expo-router",
  "expo-web-browser",
  [
    "expo-build-properties",
    {
      ios: {
        deploymentTarget: "15.1"
      },
      android: {
        kotlinVersion: "2.1.20",
        extraMavenRepos: [
          "https://devrepo.kakao.com/nexus/content/groups/public/"
        ]
      }
    }
  ],
  ...(googleSignInPlugin ? [googleSignInPlugin] : []),
  ...(kakaoPlugin ? [kakaoPlugin] : [])
];

const appConfig = {
  ...baseConfig,
  scheme,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FDF8F3"
  },
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: bundleId,
    config: {
      ...baseConfig.ios?.config,
      usesNonExemptEncryption: false
    }
  },
  android: {
    ...baseConfig.android,
    package: androidPackage,
    allowBackup: false
  },
  plugins: [
    ...mergedPlugins,
  ...basePlugins.filter((plugin) => {
    if (typeof plugin === "string") {
      if (!isOptionalNativePluginEnabled(plugin)) {
        return false;
      }

      return !mergedPlugins.includes(plugin);
    }

    const pluginName = Array.isArray(plugin) ? plugin[0] : "";
    if (!isOptionalNativePluginEnabled(pluginName)) {
      return false;
    }

    return !mergedPlugins.some((candidate) => Array.isArray(candidate) && candidate[0] === pluginName);
  })
  ],
  extra: {
    ...baseConfig.extra,
    appVariant: variant
  }
};

export default appConfig;
