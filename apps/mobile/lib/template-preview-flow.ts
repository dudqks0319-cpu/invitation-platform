import { createEmptyInvitationDraft, type InvitationPayload } from "./invitation-shared";

export const TEMPLATE_PREVIEW_OWNER_ID = "local-preview-owner";

export type TemplatePreviewExample = {
  isExample: true;
  title: string;
  dateTime: string;
  venueName: string;
  venueAddress: string;
  message: string;
  primaryName: string;
  secondaryName: string;
};

export const templatePreviewExamples: Record<string, TemplatePreviewExample> = {
  wedding: {
    isExample: true,
    title: "별빛 아래 시작하는 우리의 긴 계절",
    dateTime: "2026-09-20T12:30",
    venueName: "예시 라비에별 가든홀 그랜드룸",
    venueAddress: "예시 주소 · 서울 별빛구 초대길 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 결혼식 예시입니다. 두 사람의 새로운 시작을 함께 축복해 주세요.",
    primaryName: "이도담",
    secondaryName: "김해온"
  },
  dol: {
    isExample: true,
    title: "하람이의 반짝이는 첫 번째 생일",
    dateTime: "2026-10-11T12:00",
    venueName: "예시 구름정원 패밀리홀",
    venueAddress: "예시 주소 · 서울 새봄구 첫돌로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 돌잔치 예시입니다. 첫 번째 생일을 따뜻하게 축하해 주세요.",
    primaryName: "하람",
    secondaryName: "가족"
  },
  hwangap: {
    isExample: true,
    title: "아버지의 빛나는 예순 번째 봄날",
    dateTime: "2026-11-21T18:00",
    venueName: "예시 다온정 한정식 장수실",
    venueAddress: "예시 주소 · 서울 온기구 감사로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 환갑연 예시입니다. 감사의 자리를 함께 빛내 주세요.",
    primaryName: "정다온",
    secondaryName: "가족"
  },
  bridal: {
    isExample: true,
    title: "은채의 꽃처럼 화사한 브라이덜샤워",
    dateTime: "2026-08-29T14:00",
    venueName: "예시 라일락 가든 스튜디오",
    venueAddress: "예시 주소 · 서울 꽃비구 리본길 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 브라이덜샤워 예시입니다. 설레는 오후를 함께해 주세요.",
    primaryName: "윤은채",
    secondaryName: "친구들"
  },
  birthday: {
    isExample: true,
    title: "서윤이의 신나는 열 번째 생일 파티",
    dateTime: "2026-09-12T17:00",
    venueName: "예시 무지개 루프탑 파티룸",
    venueAddress: "예시 주소 · 서울 웃음구 풍선로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 생일파티 예시입니다. 즐거운 축하 시간을 함께해 주세요.",
    primaryName: "한서윤",
    secondaryName: "친구들"
  },
  housewarming: {
    isExample: true,
    title: "햇살 가득한 우리의 새 보금자리 집들이",
    dateTime: "2026-09-05T18:00",
    venueName: "예시 초록문이 있는 우리 집",
    venueAddress: "예시 주소 · 서울 포근구 새집로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 집들이 예시입니다. 편안한 저녁 식사에 함께해 주세요.",
    primaryName: "도담",
    secondaryName: "해온"
  },
  baby: {
    isExample: true,
    title: "작은 별을 기다리는 포근한 베이비샤워",
    dateTime: "2026-10-03T13:00",
    venueName: "예시 클라우드 베이비 스튜디오",
    venueAddress: "예시 주소 · 서울 별꿈구 구름길 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 베이비샤워 예시입니다. 따뜻한 마음으로 함께해 주세요.",
    primaryName: "별이",
    secondaryName: "가족"
  },
  graduation: {
    isExample: true,
    title: "새로운 길을 여는 한빛대학교 졸업 축하연",
    dateTime: "2027-02-19T11:00",
    venueName: "예시 한빛대학교 미래관 큰강당",
    venueAddress: "예시 주소 · 서울 배움구 새길로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 졸업파티 예시입니다. 새로운 출발을 함께 응원해 주세요.",
    primaryName: "최한빛",
    secondaryName: "가족"
  },
  business: {
    isExample: true,
    title: "오삼오삼 크리에이터 라운지 오프닝 데이",
    dateTime: "2026-09-25T18:30",
    venueName: "예시 오삼오삼 크리에이터 라운지",
    venueAddress: "예시 주소 · 서울 이음구 만남로 53",
    message: "이 문구는 디자인을 살펴보기 위한 가상의 비즈니스 행사 예시입니다. 새로운 시작과 교류의 자리에 함께해 주세요.",
    primaryName: "예시 담당자",
    secondaryName: "예시 운영팀"
  }
};

export function getTemplatePreviewExample(category: string) {
  return templatePreviewExamples[category] ?? null;
}

export function createTemplatePreviewPayload(category: string, templateId: string): InvitationPayload | null {
  const example = getTemplatePreviewExample(category);
  if (!example) return null;
  const payload = createEmptyInvitationDraft(TEMPLATE_PREVIEW_OWNER_ID).payload;
  return {
    ...payload,
    eventType: category,
    templateId,
    title: example.title,
    eventDateTime: example.dateTime,
    venueName: example.venueName,
    venueAddress: example.venueAddress,
    message: example.message,
    eventData: {
      ...payload.eventData,
      type: category,
      groom: { ...payload.eventData.groom, name: example.primaryName },
      bride: { ...payload.eventData.bride, name: example.secondaryName }
    }
  };
}

type SelectableTemplate = { id: string; category: string; badge: string };
type CreationState = { status: "idle" | "creating" | "failed" | "success"; error: string | null };

export function createTemplatePreviewDraftController({
  createDraft,
  navigate
}: {
  createDraft: (template: SelectableTemplate) => Promise<{ localId: string }>;
  navigate: (localId: string) => void;
}) {
  let state: CreationState = { status: "idle", error: null };
  let selection: SelectableTemplate | null = null;
  let inFlight: Promise<void> | null = null;
  let persistedDraftId: string | null = null;

  const start = (template: SelectableTemplate): Promise<void> => {
    if (inFlight) return inFlight;
    if (state.status === "success") return Promise.resolve();
    selection = template;
    state = { status: "creating", error: null };
    const creation = persistedDraftId
      ? Promise.resolve({ localId: persistedDraftId })
      : createDraft(template);
    inFlight = creation
      .then((draft) => {
        persistedDraftId = draft.localId;
        navigate(draft.localId);
        state = { status: "success", error: null };
      })
      .catch((error: unknown) => {
        state = { status: "failed", error: "초대장을 만들지 못했어요. 선택한 디자인으로 다시 시도해 주세요." };
        throw error;
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  return {
    start,
    retry() {
      if (!selection || state.status !== "failed") return Promise.resolve();
      return start(selection);
    },
    resume(localId: string) {
      if (state.status !== "idle") return;
      state = { status: "success", error: null };
      navigate(localId);
    },
    getState: () => state,
    getSelection: () => selection
  };
}

type RecoverableDraft = {
  localId: string;
  localUpdatedAt: string;
  payload: { ownerId: string; templateId: string; isPublished: boolean };
};

export function findRecoverableTemplateDraft<T extends RecoverableDraft>(drafts: T[], ownerId: string): T | null {
  return drafts
    .filter((draft) => draft.payload.ownerId === ownerId && !draft.payload.isPublished)
    .sort((left, right) => right.localUpdatedAt.localeCompare(left.localUpdatedAt))[0] ?? null;
}
