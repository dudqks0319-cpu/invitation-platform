const { readFileSync } = require("node:fs");
const path = require("node:path");

const appJson = JSON.parse(
  readFileSync(path.join(__dirname, "app.json"), "utf8")
);

const baseConfig = appJson.expo;
const buildProfile = process.env.EAS_BUILD_PROFILE ?? "";
const variant = process.env.APP_VARIANT ?? (buildProfile === "production" ? "production" : "development");
const isProduction = variant === "production";
const bundleId = process.env.APP_BUNDLE_ID || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");
const androidPackage = process.env.APP_ANDROID_PACKAGE || (isProduction ? "com.invitehub.app" : "com.invitehub.app.dev");

module.exports = {
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
