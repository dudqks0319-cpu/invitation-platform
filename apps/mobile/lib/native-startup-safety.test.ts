import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = join(process.cwd(), "apps/mobile");

describe("native startup safety", () => {
  it("does not load optional auth/browser native modules during the first home render", () => {
    const useAuth = readFileSync(join(mobileRoot, "hooks/useAuth.ts"), "utf8");
    const share = readFileSync(join(mobileRoot, "lib/share.ts"), "utf8");
    const home = readFileSync(join(mobileRoot, "app/(tabs)/index.tsx"), "utf8");

    expect(useAuth).not.toContain('import * as AppleAuthentication from "expo-apple-authentication"');
    expect(useAuth).not.toContain('import * as WebBrowser from "expo-web-browser"');
    expect(useAuth).not.toContain("WebBrowser.maybeCompleteAuthSession");
    expect(useAuth).toContain('await import("expo-apple-authentication")');

    expect(share).not.toContain('import * as WebBrowser from "expo-web-browser"');
    expect(share).toContain('await import("expo-web-browser")');

    expect(home).not.toContain('from "@/hooks/useAuth"');
    expect(home).not.toContain('from "@/lib/drafts"');
    expect(home).not.toContain('from "@/lib/auth-access"');
    expect(home).toContain('await import("@/lib/drafts")');
  });

  it("builds React Native iOS from source to avoid duplicate prebuilt runtime classes", () => {
    const podfileProperties = JSON.parse(
      readFileSync(join(mobileRoot, "ios/Podfile.properties.json"), "utf8")
    ) as Record<string, string>;

    expect(podfileProperties["ios.buildReactNativeFromSource"]).toBe("true");
  });

  it("keeps Expo Constants manifest generation safe when project paths contain spaces", () => {
    const podfile = readFileSync(join(mobileRoot, "ios/Podfile"), "utf8");

    expect(podfile).toContain("patch_expo_constants_manifest_script_for_paths_with_spaces");
    expect(podfile).toContain('PROJECT_DIR_BASENAME=$(basename "$PROJECT_DIR")');
    expect(podfile).toContain('cd "$PROJECT_ROOT" || exit');
    expect(podfile).toContain('"$RESOURCE_DEST"');
  });

  it("keeps ignored development Android package sources out of release compilation", () => {
    const buildGradle = readFileSync(join(mobileRoot, "android/app/build.gradle"), "utf8");

    expect(buildGradle).toContain("java.exclude '**/dev/**'");
    expect(buildGradle).toContain("tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)");
    expect(buildGradle).toContain("exclude '**/dev/**'");
  });
});
