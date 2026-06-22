import {
  BUILDER_STEPS,
  clampBuilderStep,
  getBuilderStep
} from "@/components/builder/builder-steps";

describe("builder steps", () => {
  it("defines the five web builder steps in mobile-aligned order", () => {
    expect(BUILDER_STEPS.map((step) => step.id)).toEqual([
      "basic",
      "people",
      "photos",
      "accounts",
      "location"
    ]);
    expect(BUILDER_STEPS.map((step) => step.title)).toEqual([
      "기본 정보",
      "신랑 · 신부 / 혼주 정보",
      "사진 설정",
      "계좌 · 카카오페이",
      "오시는 길"
    ]);
    expect(BUILDER_STEPS.map((step) => step.shortLabel)).not.toContain("결제");
  });

  it("clamps step indexes and returns the matching step metadata", () => {
    expect(clampBuilderStep(-5)).toBe(0);
    expect(clampBuilderStep(99)).toBe(BUILDER_STEPS.length - 1);
    expect(getBuilderStep(2)).toMatchObject({
      id: "photos",
      index: 2
    });
  });
});
