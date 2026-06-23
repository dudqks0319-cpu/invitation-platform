import { describe, expect, it } from "vitest";
import { normalizeSafeTemplate, type SafeTemplate } from "@/lib/safe-templates";
import { mergeSafeTemplates, toTemplateInsert } from "@/lib/template-repository";

function buildTemplate(overrides: Partial<SafeTemplate> = {}) {
  return normalizeSafeTemplate({
    id: "custom-wedding",
    title: "운영 검수 템플릿",
    category: "wedding",
    subtitle: "QA 대상",
    badge: "OPS",
    backgroundHex: "#FFF9F4",
    accentHex: "#D8B8AA",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "https://example.com/templates/custom-wedding.jpg",
    backgroundImagePath: "templates/custom-wedding.jpg",
    textAreaTop: 0.28,
    textAreaBottom: 0.24,
    textAreaHorizontal: 0.14,
    primaryTextHex: "#2C2A2A",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "text-free watercolor border",
    generatorName: "in-house",
    licenseNote: "owned by InviteHub",
    qaNote: "no embedded text, faces, or brands",
    ...overrides
  });
}

describe("template repository", () => {
  it("exposes only active templates that passed QA and license checks publicly", () => {
    const templates = mergeSafeTemplates([
      buildTemplate({ id: "approved-template" }),
      buildTemplate({ id: "pending-qa-template", qaState: "pending" }),
      buildTemplate({ id: "rejected-license-template", licenseState: "rejected" }),
      buildTemplate({ id: "inactive-template", isActive: false })
    ]);

    const ids = templates.map((template) => template.id);
    expect(ids).toContain("approved-template");
    expect(ids).not.toContain("pending-qa-template");
    expect(ids).not.toContain("rejected-license-template");
    expect(ids).not.toContain("inactive-template");
  });

  it("keeps non-public templates visible for admin review", () => {
    const templates = mergeSafeTemplates(
      [
        buildTemplate({ id: "pending-qa-template", qaState: "pending" }),
        buildTemplate({ id: "rejected-license-template", licenseState: "rejected" }),
        buildTemplate({ id: "inactive-template", isActive: false })
      ],
      { includeInactive: true }
    );

    const ids = templates.map((template) => template.id);
    expect(ids).toContain("pending-qa-template");
    expect(ids).toContain("rejected-license-template");
    expect(ids).toContain("inactive-template");
  });

  it("writes QA and rights provenance fields to Supabase inserts", () => {
    const insert = toTemplateInsert(
      buildTemplate({
        qaState: "passed",
        licenseState: "approved",
        rightsSourceType: "ai_generated",
        generatorName: "Genspark",
        generationPrompt: "minimal text-free wedding invitation background",
        licenseNote: "commercial use allowed",
        qaNote: "no text or identifiable people"
      }),
      "user-123"
    );

    expect(insert).toMatchObject({
      qa_state: "passed",
      license_state: "approved",
      rights_source_type: "ai_generated",
      generator_name: "Genspark",
      generation_prompt: "minimal text-free wedding invitation background",
      license_note: "commercial use allowed",
      qa_note: "no text or identifiable people",
      created_by: "user-123"
    });
  });
});
