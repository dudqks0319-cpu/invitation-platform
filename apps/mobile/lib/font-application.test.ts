import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync
} from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mobileRoot = join(process.cwd(), "apps/mobile");
const rootLayoutSource = readFileSync(join(mobileRoot, "app/_layout.tsx"), "utf8");
const sampleOverlaySource = readFileSync(
  join(mobileRoot, "components/templates/TemplateSampleTextOverlay.tsx"),
  "utf8"
);
const invitationPreviewSource = readFileSync(
  join(mobileRoot, "components/invitation/InvitationPreviewCard.tsx"),
  "utf8"
);

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const target = join(directory, entry);
    return statSync(target).isDirectory()
      ? collectTsxFiles(target)
      : target.endsWith(".tsx")
        ? [target]
        : [];
  });
}

describe("mobile font application", () => {
  it("bundles every registered font face and its license", () => {
    [
      "GowunBatang-Regular.ttf",
      "GowunBatang-Bold.ttf",
      "Pretendard-Regular.otf",
      "Pretendard-Medium.otf",
      "Pretendard-SemiBold.otf",
      "Pretendard-Bold.otf",
      "Pretendard-ExtraBold.otf",
      "Pretendard-Black.otf",
      "GowunBatang-OFL.txt",
      "Pretendard-OFL.txt"
    ].forEach((asset) => {
      expect(existsSync(join(mobileRoot, "assets/fonts", asset))).toBe(true);
    });
  });

  it("loads the complete font pairing before rendering navigation", () => {
    expect(rootLayoutSource).toContain("useFonts({");
    expect(rootLayoutSource).toContain("Pretendard-Regular.otf");
    expect(rootLayoutSource).toContain("Pretendard-Black.otf");
    expect(rootLayoutSource).toContain("GowunBatang-Regular.ttf");
    expect(rootLayoutSource).toContain("GowunBatang-Bold.ttf");
    expect(rootLayoutSource.indexOf("if (!fontsLoaded && !fontError)")).toBeLessThan(
      rootLayoutSource.indexOf("<SafeAreaProvider>")
    );
  });

  it("routes app copy through AppText instead of the platform default font", () => {
    const uiFiles = [
      ...collectTsxFiles(join(mobileRoot, "app")),
      ...collectTsxFiles(join(mobileRoot, "components"))
    ].filter((file) => !file.endsWith("components/ui/AppText.tsx"));
    const directNativeTextImports = uiFiles.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /import\s*\{[^}]*\b(?:Text|TextInput)\b[^}]*\}\s*from\s*"react-native";/s.test(source);
    });

    expect(directNativeTextImports).toEqual([]);
  });

  it("uses Gowun Batang only for invitation identity copy", () => {
    expect(sampleOverlaySource).toContain("fontFamily: appFonts.invitationBold");
    expect(invitationPreviewSource).toContain("fontFamily: appFonts.invitationBold");
  });
});
