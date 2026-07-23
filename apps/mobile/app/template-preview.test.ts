import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const routeSource = readFileSync(join(process.cwd(), "apps/mobile/app/template-preview.tsx"), "utf8");
const templatesSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");
const homeSource = readFileSync(join(process.cwd(), "apps/mobile/app/(tabs)/index.tsx"), "utf8");
const heroSource = readFileSync(join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"), "utf8");
const invitationPreviewSource = readFileSync(
  join(process.cwd(), "apps/mobile/components/invitation/InvitationPreviewCard.tsx"),
  "utf8"
);

describe("template preview route", () => {
  it("resolves catalog IDs and records only a recent template ID without draft mutation on open", () => {
    expect(routeSource).toContain("findById(templateId)");
    expect(routeSource).toContain("recordRecentlyViewedTemplate(template.id)");
    expect(routeSource).toContain("getDraftOwnerId(user)");
    expect(routeSource).toContain("inspectDraftsForTemplatePreview(ownerId)");
    expect(routeSource).toContain("isValidTemplatePreviewIntentKey(previewIntentKey)");
    expect(routeSource).not.toContain("listDrafts");
    expect(routeSource).not.toMatch(/useEffect[\s\S]{0,500}createAndPersistDraft/);
  });

  it("shows the intentional CTA, busy state, failure retry, list return, and explicit existing-draft choices", () => {
    expect(routeSource).toContain("이 디자인으로 시작하기");
    expect(routeSource).toContain("초대장을 만드는 중");
    expect(routeSource).toContain("accessibilityState={actionAccessibility.accessibilityState}");
    expect(routeSource).toContain("다시 시도");
    expect(routeSource).toContain("다시 확인");
    expect(routeSource).toContain("디자인 목록으로 돌아가기");
    expect(routeSource).toContain("이어서 편집");
    expect(routeSource).toContain("새로 시작");
  });

  it("renders an example-labelled safe preview plus a readable wrapping information region", () => {
    expect(routeSource).toContain("InvitationPreviewCard");
    expect(routeSource).toContain("TemplateSampleTextOverlay");
    expect(routeSource).toContain("예시 초대장 미리보기");
    expect(routeSource).toContain("예시 행사 정보");
    expect(routeSource).toContain("flexWrap: \"wrap\"");
  });

  it("keeps the image slot stable on failure and exposes one image focus", () => {
    expect(routeSource).toContain("function TemplatePreviewImage");
    expect(routeSource).toContain('accessibilityRole="image"');
    expect(routeSource).toContain("aspectRatio: 941 / 1672");
    expect(routeSource).toContain("onError={() => setImageFailed(true)}");
    expect(routeSource).toContain("미리보기 이미지를 표시할 수 없어요");
    expect(routeSource).toContain('importantForAccessibility="no-hide-descendants"');
  });

  it("announces busy and error states, honors reduced motion, and keeps actions at least 44pt", () => {
    expect(routeSource).toContain('accessibilityRole="progressbar"');
    expect(routeSource).toContain("accessibilityState={{ busy: true }}");
    expect(routeSource).toContain('accessibilityLiveRegion="assertive"');
    expect(routeSource).toContain("reduceMotionEnabled ? null : <ActivityIndicator");
    expect(routeSource).not.toContain("theme.colors.textLight");
    expect(invitationPreviewSource).toContain("minHeight: 44");
    expect(invitationPreviewSource).toContain("accessibilityState={{ disabled:");
  });
});

describe("all card entry points", () => {
  it("routes both discovery and Home/Hero cards to preview without draft creation", () => {
    expect(templatesSource).toContain("createTemplatePreviewDestination(template.id)");
    expect(homeSource).toContain("createTemplatePreviewDestination(template.id)");
    expect(homeSource).not.toContain("createAndPersistDraft");
    expect(heroSource).toContain("미리보기");
    expect(heroSource).not.toContain("제작 페이지로 이동");
    expect(heroSource).not.toContain("제작을 시작합니다");
  });
});
