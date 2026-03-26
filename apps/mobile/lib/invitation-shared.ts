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
