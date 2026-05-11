import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadConfig(envPatch: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ...envPatch
  };

  const configModule = await import("./app.config");
  const appJson = await import("./app.json");
  return configModule.default({ config: appJson.default.expo } as never) as {
    scheme: string;
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
});
