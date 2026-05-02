import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadConfig(envPatch: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ...envPatch
  };

  const configModule = await import("./app.config");
  return configModule.default as {
    scheme: string;
    ios: { bundleIdentifier: string };
    android: { package: string };
    plugins: Array<string | [string, Record<string, unknown>?]>;
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("mobile app config", () => {
  it("uses production identifiers for production EAS builds", async () => {
    const config = await loadConfig({
      APP_VARIANT: undefined,
      EAS_BUILD_PROFILE: "production"
    });

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app");
    expect(config.android.package).toBe("com.invitehub.app");
    expect(config.scheme).toBe("invitehub");
  });

  it("keeps dev identifiers outside production builds", async () => {
    const config = await loadConfig({
      APP_VARIANT: undefined,
      EAS_BUILD_PROFILE: "development"
    });

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app.dev");
    expect(config.android.package).toBe("com.invitehub.app.dev");
    expect(config.scheme).toBe("invitehub-dev");
  });

  it("does not include IAP native config when paid publishing is disabled", async () => {
    const config = await loadConfig({
      EXPO_PUBLIC_ENABLE_PAID_PUBLISH: undefined
    });

    expect(config.plugins).not.toContain("react-native-iap");
  });

  it("includes IAP native config only when paid publishing is explicitly enabled", async () => {
    const config = await loadConfig({
      EXPO_PUBLIC_ENABLE_PAID_PUBLISH: "true"
    });

    expect(config.plugins).toContain("react-native-iap");
  });
});
