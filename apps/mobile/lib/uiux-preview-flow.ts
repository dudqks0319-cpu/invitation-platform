import type { MobileTemplateGalleryItem } from "./template-gallery";

export const uiuxPreviewSteps = [
  { id: "event", title: "행사 맞춤 시작" },
  { id: "templates", title: "행사별 디자인" },
  { id: "builder", title: "쉬운 단계별 제작" },
  { id: "preview", title: "실시간 미리보기" },
  { id: "safety", title: "게시 전 안심 점검" },
  { id: "share", title: "게시 완료·공유" },
  { id: "manage", title: "초대장 관리" },
  { id: "guest", title: "무가입 게스트 RSVP" }
] as const;

export type UiuxPreviewStepId = (typeof uiuxPreviewSteps)[number]["id"];

export const uiuxEventOptions = [
  {
    key: "dol",
    label: "돌잔치",
    description: "아이 사진과 첫돌 문구에 맞는 디자인"
  },
  {
    key: "hwangap",
    label: "환갑·칠순",
    description: "가족 호칭과 큰 글자가 편안한 디자인"
  },
  {
    key: "housewarming",
    label: "집들이",
    description: "주소와 일정이 또렷한 따뜻한 디자인"
  }
] as const;

export type UiuxEventKey = (typeof uiuxEventOptions)[number]["key"];

export function getUiuxEventTemplates(
  templates: MobileTemplateGalleryItem[],
  category: UiuxEventKey,
  limit = 2
) {
  return templates.filter((template) => template.category === category).slice(0, limit);
}

export function clampUiuxPreviewStep(index: number) {
  return Math.min(Math.max(Math.trunc(index), 0), uiuxPreviewSteps.length - 1);
}
