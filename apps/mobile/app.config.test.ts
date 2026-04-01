import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  vi.resetModules();
  const module = await import("./app.config");
  return module.default;
}

describe("mobile app config", () => {
  afterEach(() => {
    delete process.env.APP_VARIANT;
    delete process.env.APP_BUNDLE_ID;
    delete process.env.APP_ANDROID_PACKAGE;
  });

  it("uses development identifiers by default", async () => {
    const config = await loadConfig();

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app.dev");
    expect(config.android.package).toBe("com.invitehub.app.dev");
  });

  it("uses production identifiers when APP_VARIANT=production", async () => {
    process.env.APP_VARIANT = "production";

    const config = await loadConfig();

    expect(config.ios.bundleIdentifier).toBe("com.invitehub.app");
    expect(config.android.package).toBe("com.invitehub.app");
  });
});
