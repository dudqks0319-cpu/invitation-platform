import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const templatesScreenSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");
const templateCardSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/templates/TemplateCard.tsx"),
  "utf8"
);
const heroSectionSource = readFileSync(join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"), "utf8");
const sampleOverlaySource = readFileSync(
  join(process.cwd(), "apps/mobile/components/templates/TemplateSampleTextOverlay.tsx"),
  "utf8"
);
const invitationPreviewSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/invitation/InvitationPreviewCard.tsx"),
  "utf8"
);

describe("template card sample overlay", () => {
  it("uses the measured title-only presentation contract instead of shrinking copy", () => {
    expect(sampleOverlaySource).toContain("getTemplateSampleOverlayPresentation({");
    expect(sampleOverlaySource).toContain("onLayout=");
    expect(sampleOverlaySource).toContain("allowFontScaling={presentation.allowFontScaling}");
    expect(sampleOverlaySource).not.toContain("minimumFontScale={0.56}");
    expect(sampleOverlaySource).not.toContain("adjustsFontSizeToFit");
  });

  it("gets reviewed layout-aware sample copy from the shared pure helper", () => {
    expect(sampleOverlaySource).toContain("export function TemplateSampleTextOverlay({");
    expect(templateCardSource).toContain("<TemplateSampleTextOverlay template={template} />");
    expect(sampleOverlaySource).toContain("getTemplateSampleOverlayContent({");
    expect(sampleOverlaySource).toContain("if (content.length === 0) return null");
  });

  it("keeps sample copy inside category-specific blank-space safe zones", () => {
    expect(sampleOverlaySource).toContain("resolveTemplateTextLayout({");
    expect(sampleOverlaySource).toContain("layout.areas.map((safeArea, index)");
    expect(sampleOverlaySource).toContain("top: `${safeArea.topPct}%`");
    expect(sampleOverlaySource).toContain("bottom: `${100 - safeArea.bottomPct}%`");
    expect(templateCardSource).toContain("aspectRatio: 941 / 1672");
  });

  it("uses a single finished fan composite in the home hero and retains recoverable card fallbacks", () => {
    const heroStackSource = heroSectionSource.slice(
      heroSectionSource.indexOf("function HeroStackCard"),
      heroSectionSource.indexOf("export function HeroSection")
    );
    const heroSource = heroSectionSource.slice(heroSectionSource.indexOf("export function HeroSection"));

    expect(heroStackSource).toContain("getFinishedHomeHeroSource(template.id)");
    expect(heroStackSource).toContain("usesFinishedHeroImage ? null : <TemplateSampleTextOverlay template={template} />");
    expect(heroStackSource).not.toMatch(/>\s*\{template\.name\}\s*<\/Text>/);
    expect(heroSource).toContain("getFinishedHomeHeroCompositeSource()");
    expect(heroSource).toContain("onOpenPreview(heroFeaturedTemplate)");
    expect(heroSource).toContain("resizeMode=\"cover\"");
    expect(heroSource).toContain("<HeroStackCard");
  });

  it("adds real invitation copy to the front wedding cards on home", () => {
    expect(heroSectionSource).toContain("template.sampleTextOverlay ? (");
    expect(heroSectionSource).toContain("<TemplateSampleTextOverlay template={template} />");
  });

  it("uses one shared overlay and keeps complete scalable details below decorative artwork", () => {
    expect(templateCardSource).toContain('import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";');
    expect(templateCardSource).toContain("getTemplateCardExternalMetadata(template)");
    expect(templatesScreenSource).not.toContain("function TemplateSampleTextOverlay(");
    expect(invitationPreviewSource).toContain("resolveTemplateTextLayout({");
    expect(invitationPreviewSource).toContain("artworkPresentation.zones.map((zone, index)");
    expect(invitationPreviewSource).toContain("backgroundColor: theme.colors.paper");
    expect(invitationPreviewSource).toContain("allowFontScaling={false}");
    expect(invitationPreviewSource).not.toContain("adjustsFontSizeToFit");
    expect(invitationPreviewSource).not.toContain("minimumFontScale");
    expect(invitationPreviewSource.indexOf("</ImageBackground>")).toBeLessThan(invitationPreviewSource.indexOf("{details.map((detail) => ("));
    const externalDetailsSource = invitationPreviewSource.slice(invitationPreviewSource.indexOf("{details.map((detail) => ("));
    expect(externalDetailsSource).not.toContain("numberOfLines");
  });
});
