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
      "템플릿 · 일정",
      "호스트 · 초대문",
      "사진 · 갤러리",
      "축의금 · 마음",
      "지도 · 공유"
    ]);
    expect(BUILDER_STEPS.map((step) => step.shortLabel)).toEqual([
      "일정",
      "초대",
      "사진",
      "마음",
      "공유"
    ]);
    expect(BUILDER_STEPS.map((step) => step.helper)).toEqual([
      "템플릿을 고르고 행사 제목, 일시, 장소, 초대 문구를 입력합니다.",
      "신랑·신부와 혼주 이름, 연락처를 입력해 초대장 인물 정보를 완성합니다.",
      "메인 사진, 배경, 갤러리를 선택하고 저장 전 미리보기를 확인합니다.",
      "축의금 계좌와 카카오페이 링크를 입력해 마음 전하기 영역을 준비합니다.",
      "지도 주소와 공유 정보를 입력하고 발행 후 하객 응답 동선을 확인합니다."
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
