import type { ConfigContext, ExpoConfig } from "expo/config";

type ExpoPlugin = string | [string] | [string, Record<string, unknown>];

export default function createExpoConfig({ config }: ConfigContext): ExpoConfig {
  const baseConfig = config;
  const buildProfile = process.env.EAS_BUILD_PROFILE ?? "";
  const variant = process.env.APP_VARIANT ?? (buildProfile === "production" ? "production" : "development");
  const isProduction = variant === "production";
  const bundleId = process.env.APP_BUNDLE_ID || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
  const androidPackage = process.env.APP_ANDROID_PACKAGE || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
  const scheme = process.env.APP_SCHEME || (isProduction ? "invitehub" : "invitehub-dev");
  const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME ?? "";
  const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? "";
  const basePlugins = (Array.isArray(baseConfig.plugins) ? baseConfig.plugins : []) as ExpoPlugin[];
  const googleSignInPlugin: ExpoPlugin | null = googleIosUrlScheme
    ? [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: googleIosUrlScheme
        }
      ]
    : null;
  const kakaoPlugin: ExpoPlugin | null = kakaoNativeAppKey
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
    "react-native-iap",
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

  return {
    ...baseConfig,
    name: baseConfig.name ?? "InviteHub",
    slug: baseConfig.slug ?? "invitehub",
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
      package: androidPackage
    },
    plugins: [
      ...mergedPlugins,
      ...basePlugins.filter((plugin) => {
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
}
