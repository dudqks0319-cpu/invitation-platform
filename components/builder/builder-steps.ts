export const BUILDER_STEPS = [
  { id: "basic", index: 0, title: "기본 내용", shortLabel: "기본" },
  { id: "people", index: 1, title: "주인공 정보", shortLabel: "주인공" },
  { id: "photos", index: 2, title: "사진", shortLabel: "사진" },
  { id: "accounts", index: 3, title: "마음 전하실 곳", shortLabel: "마음" },
  { id: "location", index: 4, title: "오시는 길", shortLabel: "길찾기" },
  { id: "review", index: 5, title: "마지막 확인", shortLabel: "확인" }
] as const;

export type BuilderStep = (typeof BUILDER_STEPS)[number];

export function clampBuilderStep(index: number) {
  return Math.min(Math.max(index, 0), BUILDER_STEPS.length - 1);
}

export function getBuilderStep(index: number): BuilderStep {
  return BUILDER_STEPS[clampBuilderStep(index)];
}
