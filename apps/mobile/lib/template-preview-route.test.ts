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
    expect(routeSource).toContain("이 디자인으로 시작");
    expect(routeSource).toContain("초대장을 만드는 중");
    expect(routeSource).toContain("accessibilityState={actionAccessibility.accessibilityState}");
    expect(routeSource).toContain("다시 시도");
    expect(routeSource).toContain("다시 확인");
    expect(routeSource).toContain("디자인 목록으로 돌아가기");
    expect(routeSource).toContain("이어서 편집");
    expect(routeSource).toContain("새로 시작");
  });

  it("requires explicit consent before quarantining and resetting corrupt draft storage", () => {
    expect(routeSource).toContain("isCorruptDraftStorageError(error)");
    expect(routeSource).toContain("Alert.alert(");
    expect(routeSource).toContain("원본을 별도 백업에 그대로 보관한 뒤");
    expect(routeSource).toContain('{ text: "취소", style: "cancel" }');
    expect(routeSource).toContain('{ text: "백업 후 초기화", style: "destructive"');
    expect(routeSource).toContain("await quarantineAndResetCorruptDraftStorage()");
  });

  it("distinguishes catalog loading from an invalid ID and retains the first validated selection", () => {
    expect(routeSource).toContain("source: catalogSource");
    expect(routeSource).toContain('catalogSource === "loading"');
    expect(routeSource).toContain("디자인을 불러오는 중이에요.");
    expect(routeSource).toContain("retainFirstValidatedTemplateSelection(");
    expect(routeSource).toContain("retainedTemplateSelection !== selectedTemplateSnapshot");
  });

  it("renders exactly one example-labelled template image plus a readable wrapping information region", () => {
    expect(routeSource).not.toContain("InvitationPreviewCard");
    expect(routeSource).toContain("TemplateSampleTextOverlay");
    expect(routeSource).toContain("예시 초대장 미리보기");
    expect(routeSource).toContain("예시 행사 정보");
    expect(routeSource).toContain("flexWrap: \"wrap\"");
  });

  it("keeps the image slot stable on failure and exposes one image focus", () => {
    expect(routeSource).toContain("function TemplatePreviewImage");
    expect(routeSource).toContain('accessibilityRole="image"');
    expect(routeSource).toContain("aspectRatio: 941 / 1672");
    expect(routeSource).toContain("resolveRecoverableTemplateImage");
    expect(routeSource).toContain("setImageState({ sourceIdentity, failed: true })");
    expect(routeSource).toContain("미리보기 이미지를 표시할 수 없어요");
    expect(routeSource).toContain('importantForAccessibility="no-hide-descendants"');
  });

  it("announces busy and error states, honors reduced motion, and keeps actions at least 44pt", () => {
    expect(routeSource).toContain('accessibilityRole="progressbar"');
    expect(routeSource).toContain("accessibilityState={{ busy: true }}");
    expect(routeSource).toContain('accessibilityLiveRegion="assertive"');
    expect(routeSource).toContain("effectiveReducedMotion ? null : <ActivityIndicator");
    expect(routeSource).not.toContain("theme.colors.textLight");
    expect(invitationPreviewSource).toContain("minHeight: 44");
    expect(invitationPreviewSource).toContain("accessibilityState={{ disabled:");
    expect(routeSource).toContain("createTemplatePreviewAnnouncementController");
  });

  it("applies the live-preview viewport and readability controls without weakening the preview gate", () => {
    expect(routeSource).toContain("실시간 미리보기");
    expect(routeSource).toContain("previewWidths");
    expect(routeSource).toContain("글자 크게 보기");
    expect(routeSource).toContain("저속 모드 미리보기");
    expect(routeSource).toContain("effectiveReducedMotion");
    expect(routeSource).toContain("getTemplatePreviewGate({");
  });

  it("does not wrap the interactive invitation preview in an accessible ancestor", () => {
    expect(routeSource).not.toContain("예시 초대장 미리보기 상세");
    expect(invitationPreviewSource).toContain("previewAccessibility.summary.label");
    expect(invitationPreviewSource).toContain("previewAccessibility.mapButtons");
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
