import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "react-native.config.js");
const ORIGINAL_ENV = { ...process.env };

function loadReactNativeConfig(flags: {
  paidPublishing?: string;
  nativeSocialAuth?: string;
}) {
  delete require.cache[require.resolve(configPath)];
  process.env = {
    ...ORIGINAL_ENV,
    EXPO_PUBLIC_ENABLE_PAID_PUBLISH: flags.paidPublishing,
    EXPO_PUBLIC_ENABLE_NATIVE_SOCIAL_AUTH: flags.nativeSocialAuth
  };

  return require(configPath) as {
    dependencies: Record<string, { platforms?: { android?: null; ios?: null } }>;
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete require.cache[require.resolve(configPath)];
});

describe("react-native autolinking config", () => {
  it("excludes RevenueCat native modules for the free first submission", () => {
    const config = loadReactNativeConfig({});

    expect(config.dependencies["react-native-purchases"]?.platforms?.ios).toBeNull();
  });

  it("excludes native Google and Kakao modules by default", () => {
    const config = loadReactNativeConfig({});

    expect(config.dependencies["@react-native-google-signin/google-signin"]?.platforms?.ios).toBeNull();
    expect(config.dependencies["@react-native-kakao/core"]?.platforms?.ios).toBeNull();
    expect(config.dependencies["@react-native-kakao/user"]?.platforms?.ios).toBeNull();
  });

  it("keeps RevenueCat native modules available when paid publishing is enabled", () => {
    const config = loadReactNativeConfig({ paidPublishing: "true" });

    expect(config.dependencies["react-native-purchases"]).toBeUndefined();
  });

  it("keeps native social modules available only when explicitly enabled", () => {
    const config = loadReactNativeConfig({ nativeSocialAuth: "true" });

    expect(config.dependencies["@react-native-google-signin/google-signin"]).toBeUndefined();
    expect(config.dependencies["@react-native-kakao/core"]).toBeUndefined();
    expect(config.dependencies["@react-native-kakao/user"]).toBeUndefined();
  });
});
