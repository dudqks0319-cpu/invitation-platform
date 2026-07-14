import {
  BUILDER_STEPS,
  clampBuilderStep,
  getBuilderStep
} from "@/components/builder/builder-steps";

describe("builder steps", () => {
  it("defines the six release builder steps in the requested order", () => {
    expect(BUILDER_STEPS.map((step) => step.id)).toEqual([
      "basic",
      "people",
      "photos",
      "accounts",
      "location",
      "review"
    ]);
    expect(BUILDER_STEPS.map((step) => step.title)).toEqual([
      "기본 내용",
      "주인공 정보",
      "사진",
      "마음 전하실 곳",
      "오시는 길",
      "마지막 확인"
    ]);
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
