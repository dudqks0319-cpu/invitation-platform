import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TemplateAdminStudio } from "@/components/admin/template-admin-studio";
import { normalizeSafeTemplate, type SafeTemplate } from "@/lib/safe-templates";

function buildTemplate(overrides: Partial<SafeTemplate> = {}) {
  return normalizeSafeTemplate({
    id: "approved-template",
    title: "승인 템플릿",
    category: "wedding",
    subtitle: "검수 완료",
    badge: "READY",
    backgroundHex: "#FFF9F4",
    accentHex: "#D8B8AA",
    typography: "serif",
    ornament: "imageBackground",
    backgroundImageURL: "https://example.com/templates/approved-template.jpg",
    backgroundImagePath: "templates/approved-template.jpg",
    textAreaTop: 0.28,
    textAreaBottom: 0.24,
    textAreaHorizontal: 0.14,
    primaryTextHex: "#2C2A2A",
    secondaryTextHex: "#8B7D73",
    isActive: true,
    qaState: "passed",
    licenseState: "approved",
    rightsSourceType: "in_house",
    generationPrompt: "",
    generatorName: "",
    licenseNote: "",
    qaNote: "",
    ...overrides
  });
}

describe("TemplateAdminStudio", () => {
  it("renders QA and rights controls for template publishing review", () => {
    const html = renderToStaticMarkup(
      <TemplateAdminStudio
        initialTemplates={[
          buildTemplate(),
          buildTemplate({
            id: "pending-template",
            title: "대기 템플릿",
            qaState: "pending",
            licenseState: "pending"
          })
        ]}
      />
    );

    expect(html).toContain("QA 상태");
    expect(html).toContain("라이선스 상태");
    expect(html).toContain("제작 출처");
    expect(html).toContain("생성 프롬프트 또는 제작 지시");
    expect(html).toContain("라이선스 메모");
    expect(html).toContain("QA 메모");
    expect(html).toContain("공개 가능");
    expect(html).toContain("비공개");
  });
});
