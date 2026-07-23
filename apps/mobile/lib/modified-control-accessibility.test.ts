import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");
const templatesSource = read("apps/mobile/app/templates.tsx");
const previewSource = read("apps/mobile/app/template-preview.tsx");
const heroSource = read("apps/mobile/components/home/HeroSection.tsx");

describe("modified discovery controls accessibility", () => {
  it("labels catalog retry and every preview recovery control", () => {
    expect(templatesSource).toContain('accessibilityLabel="최신 디자인 다시 시도"');
    for (const label of [
      "초안 작업 다시 시도",
      "초안 작업 중단하고 목록으로 돌아가기",
      "디자인 목록에서 다시 선택",
      "손상된 초안 저장소 복구",
      "기존 초안 다시 확인",
      "초안 확인 중단하고 목록으로 돌아가기"
    ]) {
      expect(previewSource).toContain(`accessibilityLabel="${label}"`);
    }
  });

  it("describes both category navigation controls", () => {
    expect(heroSource.match(/accessibilityHint="선택한 종류의 전체 디자인 목록을 엽니다\."/g)).toHaveLength(2);
  });
});
