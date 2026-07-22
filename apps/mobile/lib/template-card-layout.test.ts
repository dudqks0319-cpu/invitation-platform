import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const templatesScreenSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");
const heroSectionSource = readFileSync(join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"), "utf8");
const sampleOverlaySource = readFileSync(
  join(process.cwd(), "apps/mobile/components/templates/TemplateSampleTextOverlay.tsx"),
  "utf8"
);

describe("template card sample overlay", () => {
  it("keeps the main sample title on one line and shrinks it to fit narrow two-column cards", () => {
    expect(sampleOverlaySource).toMatch(
      /numberOfLines=\{1\}[\s\S]{0,180}adjustsFontSizeToFit[\s\S]{0,180}minimumFontScale=\{0\.56\}/
    );
  });

  it("uses event-specific sample copy instead of wedding copy for every category", () => {
    expect(sampleOverlaySource).toContain("function TemplateSampleTextOverlay({ category }");
    expect(templatesScreenSource).toContain("<TemplateSampleTextOverlay category={template.category} />");

    for (const category of [
      "wedding",
      "dol",
      "hwangap",
      "bridal",
      "birthday",
      "housewarming",
      "baby",
      "graduation",
      "business"
    ]) {
      expect(sampleOverlaySource).toContain(`${category}: {`);
    }
  });

  it("keeps sample copy inside category-specific blank-space safe zones", () => {
    expect(sampleOverlaySource).toContain("const templateSampleSafeZones");
    expect(sampleOverlaySource).toContain("top: safeZone.top");
    expect(sampleOverlaySource).toContain("bottom: safeZone.bottom");
    expect(templatesScreenSource).toContain("aspectRatio: 941 / 1672");
  });

  it("replaces template-name labels with real invitation copy in the home hero stack", () => {
    const heroStackSource = heroSectionSource.slice(
      heroSectionSource.indexOf("function HeroStackCard"),
      heroSectionSource.indexOf("export function HeroSection")
    );

    expect(heroStackSource).toContain("WeddingHeroInvitationOverlay");
    expect(heroStackSource).not.toMatch(/>\s*\{template\.name\}\s*<\/Text>/);
    expect(heroSectionSource).toContain("이준서 ♥ 김은재");
    expect(heroSectionSource).toContain("라비에벨 가든홀");
  });

  it("adds real invitation copy to the front wedding cards on home", () => {
    expect(heroSectionSource).toContain("template.sampleTextOverlay ? (");
    expect(heroSectionSource).toContain("<TemplateSampleTextOverlay category={template.category} />");
  });
});
