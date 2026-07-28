import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "apps/mobile/app/uiux-preview.tsx"), "utf8");

describe("오삼오삼 UI/UX 미리보기 화면", () => {
  it("실제 템플릿 카탈로그와 이미지 소스를 재사용한다", () => {
    expect(source).toContain("useTemplateCatalog()");
    expect(source).toContain("getTemplatePreviewSource(template)");
    expect(source).toContain("<TemplateSampleTextOverlay");
    expect(source).not.toContain("createAndPersistDraft");
    expect(source).not.toContain("publishGuestInvitation");
  });

  it("계획서의 핵심 화면과 개인정보 보호 문구를 보여준다", () => {
    for (const copy of [
      "어떤 초대를\\n만드시나요?",
      "돌잔치 디자인",
      "초대장 만들기",
      "실시간 미리보기",
      "게시 전 안심 점검",
      "초대장이 게시됐어요",
      "내 초대장",
      "참석 여부 알려주기",
      "검색 비공개",
      "행사 후 30일 만료"
    ]) {
      expect(source).toContain(copy);
    }
  });

  it("모든 화면 이동 버튼을 44포인트 이상으로 유지한다", () => {
    expect(source).toContain("minHeight: 48");
    expect(source).toContain("accessibilityRole=\"button\"");
  });
});
