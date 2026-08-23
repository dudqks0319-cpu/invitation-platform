import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(join(process.cwd(), "apps/mobile/app/(tabs)/index.tsx"), "utf8");
const heroSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"),
  "utf8"
);

describe("home accessibility contract", () => {
  it("gives the invitation-list control an explicit role, label, and hint", () => {
    expect(homeSource).toContain('accessibilityRole="button"');
    expect(homeSource).toContain('accessibilityLabel="내 초대장"');
    expect(homeSource).toContain('accessibilityHint="저장한 초대장 목록을 엽니다."');
  });

  it("stacks the brand and login control before 200 percent text can overlap them", () => {
    expect(homeSource).toContain("useWindowDimensions()");
    expect(homeSource).toContain("const usesStackedHeader = fontScale >= 1.8");
    expect(homeSource).toContain('flexDirection: usesStackedHeader ? "column" : "row"');
    expect(homeSource).toContain('alignSelf: usesStackedHeader ? "stretch" : "auto"');
  });

  it("offers the three applied event cards and keeps all other events one action away", () => {
    expect(heroSource).not.toContain('key: "wedding" as const');
    expect(heroSource).toContain('key: "dol" as const');
    expect(heroSource).toContain('key: "hwangap" as const');
    expect(heroSource).toContain('key: "housewarming" as const');
    expect(heroSource).toContain('>("dol")');
    expect(heroSource).toContain('accessibilityLabel="다른 행사로 만들기"');
    expect(heroSource).toContain('onOpenCategory("all")');
    expect(heroSource).toContain("height: 244");
  });
});
