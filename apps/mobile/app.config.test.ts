import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const PRODUCTION_ENV = {
  EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  EXPO_PUBLIC_WEB_BASE_URL: "https://invitehub.co.kr",
  EXPO_PUBLIC_IAP_PRODUCT_ID_IOS: "publish.credit.ios",
  EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID: "publish.credit.android",
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client-id",
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id",
  GOOGLE_IOS_URL_SCHEME: "com.googleusercontent.apps.example",
  EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY: "kakao-native-key"
};

async function loadConfig(envPatch: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ...envPatch
  };

  const configModule = await import("./app.config");
  return configModule.default as {
    ios: { bundleIdentifier: string };
    android: { package: string };
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("mobile app config", () => {
  it("uses production identifiers for production EAS builds", async () => {
    const config = await loadConfig({
      ...PRODUCTION_ENV,
      APP_VARIANT: undefined,
      EAS_BUILD_PROFILE: "production"
    });

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app");
    expect(config.android.package).toBe("com.invitehub.app");
  });

  it("keeps dev identifiers outside production builds", async () => {
    const config = await loadConfig({
      APP_VARIANT: undefined,
      EAS_BUILD_PROFILE: "development"
    });

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app.dev");
    expect(config.android.package).toBe("com.invitehub.app.dev");
  });
});
