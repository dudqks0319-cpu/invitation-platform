import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function loadConfig(envPatch: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ...envPatch
  };

  const module = await import("./app.config");
  return module.default as {
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
