import { defaultInvitationDraft, type InvitationDraftPayload } from "@/lib/invitation-payload";

export type CategoryPresentation = {
  categoryBadge: string;
  detailSectionTitle: string;
  contactsSectionTitle: string;
  primaryNameLabel: string;
  secondaryNameLabel: string;
  primaryContactLabel: string;
  secondaryContactLabel: string;
  primaryAccountLabel: string;
  secondaryAccountLabel: string;
  pairNames: boolean;
};

const defaultPresentation: CategoryPresentation = {
  categoryBadge: "SPECIAL INVITATION",
  detailSectionTitle: "주인공 · 안내 정보",
  contactsSectionTitle: "안내 연락처",
  primaryNameLabel: "대표 이름",
  secondaryNameLabel: "함께 적을 이름",
  primaryContactLabel: "대표 연락처",
  secondaryContactLabel: "추가 연락처",
  primaryAccountLabel: "대표 계좌",
  secondaryAccountLabel: "추가 계좌",
  pairNames: false
};

const categoryPresentations: Record<string, CategoryPresentation> = {
  wedding: {
    categoryBadge: "WEDDING INVITATION",
    detailSectionTitle: "혼주 정보",
    contactsSectionTitle: "연락처",
    primaryNameLabel: "신랑 성함",
    secondaryNameLabel: "신부 성함",
    primaryContactLabel: "신랑 연락처",
    secondaryContactLabel: "신부 연락처",
    primaryAccountLabel: "신랑측 계좌",
    secondaryAccountLabel: "신부측 계좌",
    pairNames: true
  },
  dol: {
    categoryBadge: "FIRST BIRTHDAY INVITATION",
    detailSectionTitle: "아이 · 가족 정보",
    contactsSectionTitle: "보호자 연락처",
    primaryNameLabel: "아이 이름",
    secondaryNameLabel: "보호자 이름",
    primaryContactLabel: "주 보호자 연락처",
    secondaryContactLabel: "보조 연락처",
    primaryAccountLabel: "가족 계좌",
    secondaryAccountLabel: "추가 계좌",
    pairNames: false
  },
  baby: {
    categoryBadge: "BABY CELEBRATION",
    detailSectionTitle: "아이 · 가족 정보",
    contactsSectionTitle: "보호자 연락처",
    primaryNameLabel: "아이 이름",
    secondaryNameLabel: "보호자 이름",
    primaryContactLabel: "주 보호자 연락처",
    secondaryContactLabel: "보조 연락처",
    primaryAccountLabel: "가족 계좌",
    secondaryAccountLabel: "추가 계좌",
    pairNames: false
  },
  hwangap: {
    categoryBadge: "60TH BIRTHDAY INVITATION",
    detailSectionTitle: "주인공 · 가족 정보",
    contactsSectionTitle: "가족 연락처",
    primaryNameLabel: "주인공 이름",
    secondaryNameLabel: "가족 대표",
    primaryContactLabel: "대표 연락처",
    secondaryContactLabel: "가족 연락처",
    primaryAccountLabel: "대표 계좌",
    secondaryAccountLabel: "가족 계좌",
    pairNames: false
  },
  chilsun: {
    categoryBadge: "70TH BIRTHDAY INVITATION",
    detailSectionTitle: "주인공 · 가족 정보",
    contactsSectionTitle: "가족 연락처",
    primaryNameLabel: "주인공 이름",
    secondaryNameLabel: "가족 대표",
    primaryContactLabel: "대표 연락처",
    secondaryContactLabel: "가족 연락처",
    primaryAccountLabel: "대표 계좌",
    secondaryAccountLabel: "가족 계좌",
    pairNames: false
  },
  palsun: {
    categoryBadge: "80TH BIRTHDAY INVITATION",
    detailSectionTitle: "주인공 · 가족 정보",
    contactsSectionTitle: "가족 연락처",
    primaryNameLabel: "주인공 이름",
    secondaryNameLabel: "가족 대표",
    primaryContactLabel: "대표 연락처",
    secondaryContactLabel: "가족 연락처",
    primaryAccountLabel: "대표 계좌",
    secondaryAccountLabel: "가족 계좌",
    pairNames: false
  },
  bridal: {
    categoryBadge: "BRIDAL SHOWER",
    detailSectionTitle: "호스트 정보",
    contactsSectionTitle: "호스트 연락처",
    primaryNameLabel: "주인공 이름",
    secondaryNameLabel: "호스트 이름",
    primaryContactLabel: "대표 연락처",
    secondaryContactLabel: "호스트 연락처",
    primaryAccountLabel: "대표 계좌",
    secondaryAccountLabel: "호스트 계좌",
    pairNames: false
  },
  business: {
    categoryBadge: "BUSINESS INVITATION",
    detailSectionTitle: "주최 정보",
    contactsSectionTitle: "담당자 연락처",
    primaryNameLabel: "담당자 이름",
    secondaryNameLabel: "보조 담당자",
    primaryContactLabel: "대표 연락처",
    secondaryContactLabel: "보조 연락처",
    primaryAccountLabel: "대표 계좌",
    secondaryAccountLabel: "보조 계좌",
    pairNames: false
  }
};

type AccountEntry = {
  label: string;
  copyLabel: string;
  value: string;
  copyValue: string;
};

const categoryDraftSeeds: Record<string, Partial<InvitationDraftPayload>> = {
  wedding: {
    title: "결혼식 초대장",
    message: "저희 두 사람이 하나가 되는 자리에 함께해 주세요.",
    groomName: "김민준",
    brideName: "이서연",
    venueName: "라비에벨 가든홀",
    venueAddress: "서울 강남구 테헤란로 128",
    mapAddress: "서울 강남구 테헤란로 128"
  },
  dol: {
    title: "첫돌 초대장",
    message: "우리 아이의 첫 번째 생일을 함께 축하해 주세요.",
    groomName: "김하늘",
    brideName: "부모님",
    venueName: "서울 패밀리 가든",
    venueAddress: "서울 성동구 성수이로 88",
    mapAddress: "서울 성동구 성수이로 88"
  },
  baby: {
    title: "베이비샤워 초대장",
    message: "새로운 가족을 맞이하는 따뜻한 시간에 함께해 주세요.",
    groomName: "아기 이름",
    brideName: "가족 대표",
    venueName: "서울 베이비 파티룸",
    venueAddress: "서울 송파구 올림픽로 240",
    mapAddress: "서울 송파구 올림픽로 240"
  },
  hwangap: {
    title: "환갑잔치 초대장",
    message: "소중한 분의 특별한 날을 함께 축하해 주세요.",
    groomName: "박영수",
    brideName: "가족 대표",
    venueName: "서울 전통연회장",
    venueAddress: "서울 종로구 율곡로 12",
    mapAddress: "서울 종로구 율곡로 12"
  },
  chilsun: {
    title: "칠순잔치 초대장",
    message: "소중한 분의 칠순을 함께 축하해 주세요.",
    groomName: "정순자",
    brideName: "가족 대표",
    venueName: "라비에벨 연회홀",
    venueAddress: "서울 강남구 테헤란로 128",
    mapAddress: "서울 강남구 테헤란로 128"
  },
  palsun: {
    title: "팔순잔치 초대장",
    message: "감사한 마음을 담아 팔순 잔치에 초대합니다.",
    groomName: "김덕수",
    brideName: "가족 대표",
    venueName: "오삼오삼 가든홀",
    venueAddress: "서울 중구 세종대로 110",
    mapAddress: "서울 중구 세종대로 110"
  },
  bridal: {
    title: "브라이덜샤워 초대장",
    message: "결혼을 앞둔 설레는 시간을 함께 축하해 주세요.",
    groomName: "주인공",
    brideName: "호스트",
    venueName: "서울 가든 파티룸",
    venueAddress: "서울 강남구 도산대로 45",
    mapAddress: "서울 강남구 도산대로 45"
  },
  birthday: {
    title: "생일파티 초대장",
    message: "기쁜 생일 파티에 함께해 주세요.",
    groomName: "주인공",
    brideName: "함께하는 사람",
    venueName: "서울 파티 라운지",
    venueAddress: "서울 마포구 양화로 120",
    mapAddress: "서울 마포구 양화로 120"
  },
  housewarming: {
    title: "집들이 초대장",
    message: "새로운 공간에서 반가운 분들을 초대합니다.",
    groomName: "초대인",
    brideName: "함께 초대하는 분",
    venueName: "우리 집",
    venueAddress: "서울 용산구 한강대로 77",
    mapAddress: "서울 용산구 한강대로 77"
  },
  graduation: {
    title: "졸업파티 초대장",
    message: "새로운 시작을 함께 축하해 주세요.",
    groomName: "주인공",
    brideName: "함께 축하하는 사람",
    venueName: "서울 셀러브레이션홀",
    venueAddress: "서울 서대문구 연세로 50",
    mapAddress: "서울 서대문구 연세로 50"
  },
  business: {
    title: "행사 초대장",
    message: "행사 일정과 장소를 안내드립니다. 참석 부탁드립니다.",
    groomName: "담당자",
    brideName: "보조 담당자",
    venueName: "서울 컨퍼런스 홀",
    venueAddress: "서울 강남구 영동대로 513",
    mapAddress: "서울 강남구 영동대로 513"
  }
};

type SeededField = keyof Pick<
  InvitationDraftPayload,
  "title" | "message" | "groomName" | "brideName" | "venueName" | "venueAddress" | "mapAddress"
>;

const seededFields: SeededField[] = [
  "title",
  "message",
  "groomName",
  "brideName",
  "venueName",
  "venueAddress",
  "mapAddress"
];

export function getCategoryPresentation(category: string) {
  return categoryPresentations[category] ?? defaultPresentation;
}

export function getCategoryDraftSeed(category: string) {
  return categoryDraftSeeds[category] ?? categoryDraftSeeds.wedding;
}

export function applyCategoryTemplateDefaults(
  current: InvitationDraftPayload,
  nextCategory: string,
  nextTemplateId: string
) {
  const currentSeed = getCategoryDraftSeed(current.category);
  const nextSeed = getCategoryDraftSeed(nextCategory);
  const nextDraft: InvitationDraftPayload = {
    ...current,
    category: nextCategory,
    templateId: nextTemplateId
  };
  const mutableDraft = nextDraft as InvitationDraftPayload & Record<SeededField, string>;

  for (const field of seededFields) {
    const currentValue = current[field];
    const currentSeedValue = currentSeed[field];
    const defaultValue = defaultInvitationDraft[field];

    if (
      currentValue === currentSeedValue ||
      currentValue === defaultValue ||
      currentValue === "" ||
      currentValue === undefined
    ) {
      const replacement = nextSeed[field];
      if (typeof replacement === "string") {
        mutableDraft[field] = replacement;
      }
    }
  }

  return nextDraft;
}

export function buildAbsoluteShareUrl(pathOrUrl: string, origin: string) {
  if (!pathOrUrl) {
    return origin;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, origin).toString();
}

export function getInvitationHeroTitle(payload: InvitationDraftPayload) {
  const presentation = getCategoryPresentation(payload.category);

  if (presentation.pairNames) {
    return [payload.groomName || "신랑", payload.brideName || "신부"].join(" ♡ ");
  }

  return payload.groomName || payload.title || payload.brideName || "초대합니다";
}

export function getInvitationHeroSubtitle(payload: InvitationDraftPayload) {
  const presentation = getCategoryPresentation(payload.category);

  if (presentation.pairNames) {
    return "";
  }

  return [payload.groomName, payload.brideName].filter(Boolean).join(" · ");
}

export function formatDetailSummary(payload: InvitationDraftPayload) {
  const presentation = getCategoryPresentation(payload.category);

  if (presentation.pairNames) {
    const groomSide = [payload.groomFatherName, payload.groomMotherName].filter(Boolean).join(" / ");
    const brideSide = [payload.brideFatherName, payload.brideMotherName].filter(Boolean).join(" / ");
    const lines = [];

    if (groomSide) {
      lines.push(`신랑측 · ${groomSide}`);
    }

    if (brideSide) {
      lines.push(`신부측 · ${brideSide}`);
    }

    return lines.length ? lines.join("\n") : "양가 부모님 정보를 입력해 주세요.";
  }

  const lines = [
    payload.groomName ? `${presentation.primaryNameLabel} · ${payload.groomName}` : "",
    payload.brideName ? `${presentation.secondaryNameLabel} · ${payload.brideName}` : "",
    [payload.groomFatherName, payload.groomMotherName, payload.brideFatherName, payload.brideMotherName]
      .filter(Boolean)
      .join(" · ")
      ? `가족/팀 정보 · ${[payload.groomFatherName, payload.groomMotherName, payload.brideFatherName, payload.brideMotherName]
          .filter(Boolean)
          .join(" · ")}`
      : ""
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : "대표 정보를 입력해 주세요.";
}

export function formatCategoryContacts(payload: InvitationDraftPayload) {
  const presentation = getCategoryPresentation(payload.category);

  return [
    payload.groomPhone ? `${presentation.primaryContactLabel} · ${payload.groomPhone}` : "",
    payload.bridePhone ? `${presentation.secondaryContactLabel} · ${payload.bridePhone}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function getInvitationCategoryMeta(payload: Pick<InvitationDraftPayload, "category"> | string) {
  const category = typeof payload === "string" ? payload : payload.category;
  const presentation = getCategoryPresentation(category);

  return {
    badgeText: presentation.categoryBadge,
    personSectionTitle: presentation.detailSectionTitle,
    contactTitle: presentation.contactsSectionTitle,
    accountTitle: "마음 전하실 곳",
    primaryNameLabel: presentation.primaryNameLabel,
    secondaryNameLabel: presentation.secondaryNameLabel,
    primaryPhoneLabel: presentation.primaryContactLabel,
    secondaryPhoneLabel: presentation.secondaryContactLabel,
    primaryAccountPrefix: presentation.primaryAccountLabel,
    secondaryAccountPrefix: presentation.secondaryAccountLabel,
    primaryCopyLabel: `${presentation.primaryAccountLabel} 복사`,
    secondaryCopyLabel: `${presentation.secondaryAccountLabel} 복사`,
    guardianLabels: presentation.pairNames
      ? ["신랑 아버지", "신랑 어머니", "신부 아버지", "신부 어머니"]
      : category === "dol" || category === "baby"
        ? ["아빠 성함", "엄마 성함", "추가 보호자 1", "추가 보호자 2"]
        : ["추가 안내 1", "추가 안내 2", "추가 안내 3", "추가 안내 4"],
    pairNames: presentation.pairNames
  };
}

export function getInvitationPersonLines(payload: InvitationDraftPayload) {
  return formatDetailSummary(payload)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getInvitationContactLines(payload: InvitationDraftPayload) {
  return formatCategoryContacts(payload)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getInvitationAccountEntries(payload: InvitationDraftPayload): AccountEntry[] {
  const meta = getInvitationCategoryMeta(payload);
  const entries: AccountEntry[] = [];

  if (payload.groomBank || payload.groomBankHolder || payload.groomBankAccount) {
    entries.push({
      label: meta.primaryAccountPrefix,
      copyLabel: meta.primaryCopyLabel,
      value: [meta.primaryAccountPrefix, payload.groomBank, payload.groomBankHolder, payload.groomBankAccount]
        .filter(Boolean)
        .join(" · "),
      copyValue: payload.groomBankAccount
    });
  }

  if (payload.brideBank || payload.brideBankHolder || payload.brideBankAccount) {
    entries.push({
      label: meta.secondaryAccountPrefix,
      copyLabel: meta.secondaryCopyLabel,
      value: [meta.secondaryAccountPrefix, payload.brideBank, payload.brideBankHolder, payload.brideBankAccount]
        .filter(Boolean)
        .join(" · "),
      copyValue: payload.brideBankAccount
    });
  }

  return entries;
}

export function getPublicShareUrl(pathOrUrl: string, origin?: string | null) {
  return buildAbsoluteShareUrl(pathOrUrl, origin || "http://localhost:3000");
}
