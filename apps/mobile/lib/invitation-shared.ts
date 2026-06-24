export type InvitationParty = {
  name: string;
  phone?: string;
};

export type InvitationParents = {
  father?: InvitationParty;
  mother?: InvitationParty;
};

export type InvitationGalleryItem = {
  uri: string;
  order: number;
};

export type InvitationPhotoSlot = "main" | "background" | "gallery";

export const MAX_GALLERY_PHOTOS = 10;

export type PendingPhotoUpload = {
  localUri: string;
  slot: InvitationPhotoSlot;
  order?: number;
  retryCount: number;
};

export type InvitationPayload = {
  schemaVersion: number;
  eventType: string;
  templateId: string;
  title: string;
  eventDateTime: string;
  venueName: string;
  venueAddress: string;
  message: string;
  eventData: {
    type: string;
    groom: InvitationParty;
    bride: InvitationParty;
    groomParents: InvitationParents;
    brideParents: InvitationParents;
  };
  photos: {
    mainUri: string;
    backgroundUri: string;
    gallery: InvitationGalleryItem[];
  };
  accounts: {
    primary?: {
      bank: string;
      holder: string;
      account: string;
    };
    secondary?: {
      bank: string;
      holder: string;
      account: string;
    };
    kakaoPayLink: string;
  };
  location: {
    naverMapUrl: string;
    kakaoMapUrl?: string;
    transportNote: string;
  };
  share: {
    slug: string;
  };
  ownerId: string;
  planTier: "free" | "premium";
  isPublished: boolean;
};

export type InvitationDraft = {
  localId: string;
  serverId?: string;
  payload: InvitationPayload;
  pendingPhotos: PendingPhotoUpload[];
  syncStatus: "pending" | "synced" | "failed";
  localUpdatedAt: string;
  isDirty: boolean;
};

const INVITATION_SCHEMA_VERSION = 2;
const DEFAULT_EVENT_TYPE = "wedding";
export const DEFAULT_WEDDING_SAMPLE = {
  title: "우리 결혼합니다",
  eventDateTime: "2026-09-20T12:30",
  venueName: "라비에벨 가든홀",
  venueAddress: "서울 강남구 테헤란로 123",
  message: "서로의 계절이 되어 걸어온 두 사람이 이제 하나의 길을 함께 걸으려 합니다. 소중한 날, 귀한 발걸음으로 축복해 주세요.",
  groomName: "이준서",
  brideName: "김은재"
} as const;

export const DEFAULT_INVITATION_SAMPLE_BY_EVENT_TYPE = {
  wedding: DEFAULT_WEDDING_SAMPLE,
  dol: {
    title: "첫돌에 초대합니다",
    eventDateTime: "2026-07-12T12:00",
    venueName: "라움 패밀리홀",
    venueAddress: "서울 성동구 성수이로 88",
    message: "우리 아이가 맞이하는 첫 번째 생일을 가까운 분들과 함께 나누고 싶습니다. 따뜻한 축하로 자리를 빛내 주세요.",
    groomName: "서하",
    brideName: "가족"
  },
  hwangap: {
    title: "환갑연에 초대합니다",
    eventDateTime: "2026-11-21T18:00",
    venueName: "다온 한정식",
    venueAddress: "서울 종로구 율곡로 12",
    message: "한결같은 사랑과 응원으로 함께해 주신 분들을 모시고 감사의 자리를 마련했습니다. 귀한 걸음 부탁드립니다.",
    groomName: "정한결",
    brideName: "가족"
  },
  bridal: {
    title: "브라이덜 샤워에 초대합니다",
    eventDateTime: "2026-06-07T14:00",
    venueName: "라포레 가든룸",
    venueAddress: "서울 강남구 도산대로 45",
    message: "결혼을 앞둔 설레는 시간을 사랑하는 친구들과 함께 나누고 싶습니다. 편안한 마음으로 함께해 주세요.",
    groomName: "윤정",
    brideName: "친구들"
  },
  birthday: {
    title: "생일 파티에 초대합니다",
    eventDateTime: "2026-06-28T17:00",
    venueName: "모먼트 파티룸",
    venueAddress: "서울 마포구 양화로 120",
    message: "소중한 사람들과 즐거운 생일 저녁을 보내고 싶습니다. 함께 웃고 축하하는 시간으로 채워 주세요.",
    groomName: "주인공",
    brideName: "친구들"
  },
  housewarming: {
    title: "집들이에 초대합니다",
    eventDateTime: "2026-06-13T18:30",
    venueName: "우리 집",
    venueAddress: "서울 용산구 한강대로 77",
    message: "새로운 공간에서 반가운 분들을 모시고 따뜻한 식사를 함께하려 합니다. 편하게 들러 주세요.",
    groomName: "초대인",
    brideName: "함께하는 사람"
  },
  baby: {
    title: "베이비 샤워에 초대합니다",
    eventDateTime: "2026-08-16T15:00",
    venueName: "베베 라운지",
    venueAddress: "서울 송파구 올림픽로 240",
    message: "새로운 가족을 기다리는 기쁜 마음을 함께 나누고 싶습니다. 따뜻한 축하로 함께해 주세요.",
    groomName: "아기",
    brideName: "가족"
  },
  graduation: {
    title: "졸업식에 초대합니다",
    eventDateTime: "2026-08-22T13:00",
    venueName: "연세 기념관",
    venueAddress: "서울 서대문구 연세로 50",
    message: "새로운 시작을 앞둔 뜻깊은 자리에 함께해 주세요. 응원해 주신 마음을 오래 기억하겠습니다.",
    groomName: "주인공",
    brideName: "가족"
  },
  business: {
    title: "행사에 초대합니다",
    eventDateTime: "2026-09-10T15:00",
    venueName: "코엑스 컨퍼런스룸",
    venueAddress: "서울 강남구 영동대로 513",
    message: "행사 일정과 장소를 안내드립니다. 참석하시어 의미 있는 시간을 함께해 주시면 감사하겠습니다.",
    groomName: "담당자",
    brideName: "운영팀"
  }
} as const;

export function getDefaultInvitationSample(eventType?: string) {
  return DEFAULT_INVITATION_SAMPLE_BY_EVENT_TYPE[
    (eventType ?? DEFAULT_EVENT_TYPE) as keyof typeof DEFAULT_INVITATION_SAMPLE_BY_EVENT_TYPE
  ] ?? DEFAULT_WEDDING_SAMPLE;
}

function createLocalId() {
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyInvitationDraft(ownerId: string): InvitationDraft {
  return {
    localId: createLocalId(),
    payload: {
      schemaVersion: INVITATION_SCHEMA_VERSION,
      eventType: DEFAULT_EVENT_TYPE,
      templateId: "wedding-classic",
      title: "결혼식 초대장",
      eventDateTime: "",
      venueName: "",
      venueAddress: "",
      message: "",
      eventData: {
        type: DEFAULT_EVENT_TYPE,
        groom: {
          name: "",
          phone: ""
        },
        bride: {
          name: "",
          phone: ""
        },
        groomParents: {},
        brideParents: {}
      },
      photos: {
        mainUri: "",
        backgroundUri: "",
        gallery: []
      },
      accounts: {
        primary: {
          bank: "",
          holder: "",
          account: ""
        },
        secondary: {
          bank: "",
          holder: "",
          account: ""
        },
        kakaoPayLink: ""
      },
      location: {
        naverMapUrl: "",
        kakaoMapUrl: "",
        transportNote: ""
      },
      share: {
        slug: ""
      },
      ownerId,
      planTier: "free",
      isPublished: false
    },
    pendingPhotos: [],
    syncStatus: "pending",
    localUpdatedAt: new Date().toISOString(),
    isDirty: false
  };
}

export function updateInvitationBasics(
  payload: InvitationPayload,
  patch: Partial<Pick<InvitationPayload, "title" | "eventDateTime" | "venueName" | "venueAddress" | "message">>
) {
  return {
    ...payload,
    ...patch
  };
}

export function updateWeddingNames(
  payload: InvitationPayload,
  patch: {
    groomName?: string;
    brideName?: string;
  }
) {
  return {
    ...payload,
    eventData: {
      ...payload.eventData,
      groom: {
        ...payload.eventData.groom,
        name: patch.groomName ?? payload.eventData.groom.name
      },
      bride: {
        ...payload.eventData.bride,
        name: patch.brideName ?? payload.eventData.bride.name
      }
    }
  };
}

export function updateWeddingFamily(
  payload: InvitationPayload,
  patch: {
    groomFatherName?: string;
    groomMotherName?: string;
    brideFatherName?: string;
    brideMotherName?: string;
  }
) {
  return {
    ...payload,
    eventData: {
      ...payload.eventData,
      groomParents: {
        father:
          patch.groomFatherName !== undefined || payload.eventData.groomParents.father
            ? {
                name: patch.groomFatherName ?? payload.eventData.groomParents.father?.name ?? "",
                phone: payload.eventData.groomParents.father?.phone ?? ""
              }
            : undefined,
        mother:
          patch.groomMotherName !== undefined || payload.eventData.groomParents.mother
            ? {
                name: patch.groomMotherName ?? payload.eventData.groomParents.mother?.name ?? "",
                phone: payload.eventData.groomParents.mother?.phone ?? ""
              }
            : undefined
      },
      brideParents: {
        father:
          patch.brideFatherName !== undefined || payload.eventData.brideParents.father
            ? {
                name: patch.brideFatherName ?? payload.eventData.brideParents.father?.name ?? "",
                phone: payload.eventData.brideParents.father?.phone ?? ""
              }
            : undefined,
        mother:
          patch.brideMotherName !== undefined || payload.eventData.brideParents.mother
            ? {
                name: patch.brideMotherName ?? payload.eventData.brideParents.mother?.name ?? "",
                phone: payload.eventData.brideParents.mother?.phone ?? ""
              }
            : undefined
      }
    }
  };
}
