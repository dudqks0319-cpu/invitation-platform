export const BUILDER_STEPS = [
  {
    id: "basic",
    index: 0,
    title: "템플릿 · 일정",
    shortLabel: "일정",
    helper: "템플릿을 고르고 행사 제목, 일시, 장소, 초대 문구를 입력합니다."
  },
  {
    id: "people",
    index: 1,
    title: "호스트 · 초대문",
    shortLabel: "초대",
    helper: "신랑·신부와 혼주 이름, 연락처를 입력해 초대장 인물 정보를 완성합니다."
  },
  {
    id: "photos",
    index: 2,
    title: "사진 · 갤러리",
    shortLabel: "사진",
    helper: "메인 사진, 배경, 갤러리를 선택하고 저장 전 미리보기를 확인합니다."
  },
  {
    id: "accounts",
    index: 3,
    title: "축의금 · 마음",
    shortLabel: "마음",
    helper: "축의금 계좌와 카카오페이 링크를 입력해 마음 전하기 영역을 준비합니다."
  },
  {
    id: "location",
    index: 4,
    title: "지도 · 공유",
    shortLabel: "공유",
    helper: "지도 주소와 공유 정보를 입력하고 발행 후 하객 응답 동선을 확인합니다."
  }
] as const;

export type BuilderStep = (typeof BUILDER_STEPS)[number];

export function clampBuilderStep(index: number) {
  return Math.min(Math.max(index, 0), BUILDER_STEPS.length - 1);
}

export function getBuilderStep(index: number): BuilderStep {
  return BUILDER_STEPS[clampBuilderStep(index)];
}
