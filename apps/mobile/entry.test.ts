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

  it("keeps mobile routes and libraries in the EAS archive", () => {
    const rootEasIgnore = readFileSync(join(process.cwd(), ".easignore"), "utf8");

    expect(rootEasIgnore).not.toMatch(/^app\/$/m);
    expect(rootEasIgnore).not.toMatch(/^app\/\*\*$/m);
    expect(rootEasIgnore).not.toMatch(/^lib\/$/m);
    expect(rootEasIgnore).not.toMatch(/^lib\/\*\*$/m);
    expect(rootEasIgnore).not.toMatch(/^components\/$/m);
    expect(rootEasIgnore).not.toMatch(/^components\/\*\*$/m);
    expect(rootEasIgnore).toContain("/app/");
    expect(rootEasIgnore).toContain("/lib/");
    expect(rootEasIgnore).toContain("/components/");
    expect(existsSync(join(mobileRoot, "app/_layout.tsx"))).toBe(true);
    expect(existsSync(join(mobileRoot, "lib/drafts.ts"))).toBe(true);
  });

  it("uses the Korean app name for iOS crash dialogs and TestFlight metadata", () => {
    const infoPlist = readFileSync(join(mobileRoot, "ios/InviteHub/Info.plist"), "utf8");

    expect(infoPlist).toContain("<key>CFBundleDisplayName</key>");
    expect(infoPlist).toContain("<string>초대장허브</string>");
    expect(infoPlist).toContain("<key>CFBundleName</key>");
    expect(infoPlist).not.toContain("<string>$(PRODUCT_NAME)</string>");
  });
});
