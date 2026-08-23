import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(join(process.cwd(), "apps/mobile/app/(tabs)/index.tsx"), "utf8");
const heroSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"),
  "utf8"
);
const startSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/home/InvitationStartSection.tsx"),
  "utf8"
);
const eventOptionsSource = readFileSync(
  join(process.cwd(), "apps/mobile/lib/uiux-preview-flow.ts"),
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
    expect(eventOptionsSource).toContain('key: "wedding"');
    expect(eventOptionsSource).toContain('label: "청첩장"');
    expect(eventOptionsSource).toContain('key: "dol"');
    expect(eventOptionsSource).toContain('key: "hwangap"');
    expect(eventOptionsSource).toContain('key: "housewarming"');
    expect(heroSource).toContain('>("wedding")');
    expect(eventOptionsSource).toContain('preferredTemplateId: "wedding-barunson-anime-09"');
    expect(startSource).toContain("? weddingCompositeSource");
    expect(startSource).toContain("height: 244");
  });
});
