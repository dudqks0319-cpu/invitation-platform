import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(join(process.cwd(), "apps/mobile/app/(tabs)/index.tsx"), "utf8");
const heroSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"),
  "utf8"
);

describe("home accessibility contract", () => {
  it("gives the login control an explicit role, label, and hint", () => {
    expect(homeSource).toContain('accessibilityRole="button"');
    expect(homeSource).toContain('accessibilityLabel="로그인"');
    expect(homeSource).toContain('accessibilityHint="로그인 화면을 엽니다."');
  });

  it("stacks the brand and login control before 200 percent text can overlap them", () => {
    expect(homeSource).toContain("useWindowDimensions()");
    expect(homeSource).toContain("const usesStackedHeader = fontScale >= 1.8");
    expect(homeSource).toContain('flexDirection: usesStackedHeader ? "column" : "row"');
    expect(homeSource).toContain('alignSelf: usesStackedHeader ? "stretch" : "auto"');
  });

  it("offers a wedding invitation entry without removing the existing event entries", () => {
    expect(heroSource).toContain('key: "wedding" as const');
    expect(heroSource).toContain('label: "청첩장"');
    expect(heroSource).toContain('key: "dol" as const');
    expect(heroSource).toContain('key: "hwangap" as const');
    expect(heroSource).toContain('key: "housewarming" as const');
    expect(heroSource).toContain('>("wedding")');
    expect(heroSource).toContain('preferredTemplateId: "wedding-barunson-anime-09"');
    expect(heroSource).toContain("? finishedHeroCompositeSource");
    expect(heroSource).toContain("height: 244");
  });
});
