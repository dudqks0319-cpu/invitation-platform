import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = join(process.cwd(), "apps/mobile");

describe("native startup safety", () => {
  it("does not load optional auth/browser native modules during the first home render", () => {
    const useAuth = readFileSync(join(mobileRoot, "hooks/useAuth.ts"), "utf8");
    const share = readFileSync(join(mobileRoot, "lib/share.ts"), "utf8");

    expect(useAuth).not.toContain('import * as AppleAuthentication from "expo-apple-authentication"');
    expect(useAuth).not.toContain('import * as WebBrowser from "expo-web-browser"');
    expect(useAuth).not.toContain("WebBrowser.maybeCompleteAuthSession");
    expect(useAuth).toContain('await import("expo-apple-authentication")');

    expect(share).not.toContain('import * as WebBrowser from "expo-web-browser"');
    expect(share).toContain('await import("expo-web-browser")');
  });

  it("builds React Native iOS from source to avoid duplicate prebuilt runtime classes", () => {
    const podfileProperties = JSON.parse(
      readFileSync(join(mobileRoot, "ios/Podfile.properties.json"), "utf8")
    ) as Record<string, string>;

    expect(podfileProperties["ios.buildReactNativeFromSource"]).toBe("true");
  });
});
