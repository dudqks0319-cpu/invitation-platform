import { describe, expect, it } from "vitest";
import { defaultSafeTemplates, safeTemplateCreateSchema, templateSlugFromTitle } from "@/lib/safe-templates";

const validTemplate = {
  title: "한국형 웨딩",
  category: "wedding",
  subtitle: "사방 장식",
  badge: "NEW",
  backgroundHex: "#FFF9F4",
  accentHex: "#D8B8AA",
  typography: "serif",
  backgroundImageURL: "https://example.com/template.jpg",
  backgroundImagePath: "user/templates/template.jpg",
  textAreaTop: 0.28,
  textAreaBottom: 0.24,
  textAreaHorizontal: 0.14,
  primaryTextHex: "#2C2A2A",
  secondaryTextHex: "#8B7D73"
} as const;

describe("safe template schema", () => {
  it("ships five built-in Korean image-background templates", () => {
    expect(defaultSafeTemplates).toHaveLength(5);
    expect(defaultSafeTemplates.every((template) => template.ornament === "imageBackground")).toBe(true);
    expect(defaultSafeTemplates.every((template) => template.qaState === "passed")).toBe(true);
    expect(defaultSafeTemplates.every((template) => template.licenseState === "approved")).toBe(true);
  });

  it("keeps newly uploaded templates unpublished until QA and license approval", () => {
    const parsed = safeTemplateCreateSchema.parse(validTemplate);

    expect(parsed.qaState).toBe("pending");
    expect(parsed.licenseState).toBe("pending");
  });

  it("rejects script-like image URLs", () => {
    expect(() =>
      safeTemplateCreateSchema.parse({
        ...validTemplate,
        backgroundImageURL: "javascript:alert(1)"
      })
    ).toThrow();
  });

  it("rejects unsafe text area values", () => {
    expect(() =>
      safeTemplateCreateSchema.parse({
        ...validTemplate,
        textAreaTop: 0.7
      })
    ).toThrow();
  });

  it("does not create non-ascii template ids from Korean titles", () => {
    expect(templateSlugFromTitle("한국형 웨딩")).toMatch(/^template-\d+$/);
  });
});
