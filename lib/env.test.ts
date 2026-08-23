import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

async function importFreshEnv(overrides: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = { ...originalEnv, ...overrides };
  return import("./env");
}

describe("env", () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("reads the canonical RevenueCat iOS key with the legacy Apple alias fallback", async () => {
    const canonical = await importFreshEnv({
      EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY: "legacy-apple-key",
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: "ios-key"
    });

    expect(canonical.env.revenueCatAppleApiKey).toBe("ios-key");

    const legacy = await importFreshEnv({
      EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY: "legacy-apple-key",
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: undefined
    });

    expect(legacy.env.revenueCatAppleApiKey).toBe("legacy-apple-key");
  });

  it("reads the RevenueCat Android key with the Google alias fallback", async () => {
    const canonical = await importFreshEnv({
      EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: "android-key",
      EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY: "google-key"
    });

    expect(canonical.env.revenueCatGoogleApiKey).toBe("android-key");

    const legacy = await importFreshEnv({
      EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: undefined,
      EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY: "google-key"
    });

    expect(legacy.env.revenueCatGoogleApiKey).toBe("google-key");
  });

  it("keeps legacy direct store verification disabled unless explicitly enabled", async () => {
    const disabled = await importFreshEnv({
      ENABLE_LEGACY_STORE_VERIFY: undefined
    });

    expect(disabled.isLegacyStoreVerificationEnabled()).toBe(false);

    const enabled = await importFreshEnv({
      ENABLE_LEGACY_STORE_VERIFY: "true"
    });

    expect(enabled.isLegacyStoreVerificationEnabled()).toBe(true);
  });
});
