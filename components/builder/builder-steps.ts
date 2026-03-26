export const BUILDER_STEPS = [
  { id: "basic", index: 0, title: "기본 정보", shortLabel: "기본" },
  { id: "people", index: 1, title: "신랑 · 신부 / 혼주 정보", shortLabel: "인물" },
  { id: "photos", index: 2, title: "사진 설정", shortLabel: "사진" },
  { id: "accounts", index: 3, title: "계좌 · 카카오페이", shortLabel: "결제" },
  { id: "location", index: 4, title: "오시는 길", shortLabel: "위치" }
] as const;

export type BuilderStep = (typeof BUILDER_STEPS)[number];

export function clampBuilderStep(index: number) {
  return Math.min(Math.max(index, 0), BUILDER_STEPS.length - 1);
}

export function getBuilderStep(index: number): BuilderStep {
  return BUILDER_STEPS[clampBuilderStep(index)];
}
