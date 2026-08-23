import { describe, expect, it } from "vitest";
import type { MobileTemplateGalleryItem } from "./template-gallery";
import {
  clampUiuxPreviewStep,
  getUiuxEventTemplates,
  uiuxEventOptions,
  uiuxPreviewSteps
} from "./uiux-preview-flow";

const templates: MobileTemplateGalleryItem[] = [
  { id: "dol-1", category: "dol", name: "첫돌", badge: "돌잔치", desc: "", tags: [] },
  { id: "dol-2", category: "dol", name: "첫돌 둘", badge: "돌잔치", desc: "", tags: [] },
  { id: "hwangap-1", category: "hwangap", name: "환갑", badge: "환갑", desc: "", tags: [] },
  { id: "house-1", category: "housewarming", name: "집들이", badge: "집들이", desc: "", tags: [] }
];

describe("오삼오삼 UI/UX 미리보기 흐름", () => {
  it("계획서의 8개 화면을 순서대로 고정한다", () => {
    expect(uiuxPreviewSteps.map((step) => step.id)).toEqual([
      "event",
      "templates",
      "builder",
      "preview",
      "safety",
      "share",
      "manage",
      "guest"
    ]);
  });

  it("홈과 과정 화면에 같은 네 종류 행사를 중복 없이 제공한다", () => {
    expect(uiuxEventOptions.map((event) => event.key)).toEqual(["wedding", "dol", "hwangap", "housewarming"]);
    expect(new Set(uiuxEventOptions.map((event) => event.key)).size).toBe(uiuxEventOptions.length);
  });

  it("카탈로그 객체를 바꾸지 않고 선택 행사 템플릿만 가져온다", () => {
    const before = structuredClone(templates);
    const result = getUiuxEventTemplates(templates, "dol", 1);

    expect(result).toEqual([templates[0]]);
    expect(templates).toEqual(before);
  });

  it("미리보기 이동 범위를 첫 화면과 마지막 화면 사이로 제한한다", () => {
    expect(clampUiuxPreviewStep(-10)).toBe(0);
    expect(clampUiuxPreviewStep(3.8)).toBe(3);
    expect(clampUiuxPreviewStep(99)).toBe(7);
  });
});
