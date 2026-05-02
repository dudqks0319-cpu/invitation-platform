import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "react-native.config.js");
const ORIGINAL_ENV = { ...process.env };

function loadReactNativeConfig(flagValue: string | undefined) {
  delete require.cache[require.resolve(configPath)];
  process.env = {
    ...ORIGINAL_ENV,
    EXPO_PUBLIC_ENABLE_PAID_PUBLISH: flagValue
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
  it("excludes StoreKit native modules for the free first submission", () => {
    const config = loadReactNativeConfig(undefined);

    expect(config.dependencies["react-native-iap"]?.platforms?.ios).toBeNull();
    expect(config.dependencies["react-native-nitro-modules"]?.platforms?.ios).toBeNull();
  });

  it("keeps StoreKit native modules available when paid publishing is enabled", () => {
    const config = loadReactNativeConfig("true");

    expect(config.dependencies).toEqual({});
  });
});
