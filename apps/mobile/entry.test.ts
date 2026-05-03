import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = join(process.cwd(), "apps/mobile");

describe("mobile entry", () => {
  it("uses the Expo Router entry so release bundles include the route context", () => {
    const entry = readFileSync(join(mobileRoot, "index.js"), "utf8");
    const packageJson = JSON.parse(readFileSync(join(mobileRoot, "package.json"), "utf8")) as {
      main?: string;
    };

    expect(packageJson.main).toBe("expo-router/entry");
    expect(entry.trim()).toBe('import "expo-router/entry";');
    expect(entry).not.toContain("require.context");
    expect(entry).not.toContain("ExpoRoot");
  });

  it("uses Expo Metro config so routerRoot is passed during release bundling", () => {
    const metroConfigPath = join(mobileRoot, "metro.config.js");
    const metroConfig = readFileSync(metroConfigPath, "utf8");

    expect(existsSync(metroConfigPath)).toBe(true);
    expect(metroConfig).toContain('require("expo/metro-config")');
    expect(metroConfig).toContain("getDefaultConfig(__dirname)");
  });

  it("loads the Expo Router Babel transform in the mobile workspace", () => {
    const babelConfig = readFileSync(join(mobileRoot, "babel.config.js"), "utf8");

    expect(babelConfig).toContain("babel-preset-expo/build/expo-router-plugin");
    expect(babelConfig).toContain("expoRouterBabelPlugin");
    expect(babelConfig).toContain("plugins: [expoRouterBabelPlugin]");
  });
});
