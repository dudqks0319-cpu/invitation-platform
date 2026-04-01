import appJson from "./app.json";

const baseConfig = appJson.expo;
const variant = process.env.APP_VARIANT ?? "development";
const isProduction = variant === "production";
const bundleId = process.env.APP_BUNDLE_ID || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const androidPackage = process.env.APP_ANDROID_PACKAGE || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");

const config = {
  ...baseConfig,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FDF8F3"
  },
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: bundleId
  },
  android: {
    ...baseConfig.android,
    package: androidPackage
  },
  extra: {
    ...baseConfig.extra,
    appVariant: variant
  }
};

export default config;
