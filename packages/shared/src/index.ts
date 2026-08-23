import {
  DEFAULT_EVENT_TYPE,
  INVITATION_SCHEMA_VERSION
} from "./constants/index";

export type {
  InvitationDraft,
  InvitationGalleryItem,
  InvitationParents,
  InvitationParty,
  InvitationPayload,
  PendingPhotoUpload
} from "./types/invitation";

export {
  isTemplateTextSafeArea,
  resolveTemplateTextSafeArea
} from "./template-text-safe-area";
export type {
  TemplateTextPlacement,
  TemplateTextSafeArea
} from "./template-text-safe-area";

import type {
  InvitationDraft,
  InvitationPayload
} from "./types/invitation";

export const SUPPORTED_V1_EVENT_TYPES = [DEFAULT_EVENT_TYPE] as const;

function createLocalId() {
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
}

export function isSupportedV1EventType(value: string) {
  return value === DEFAULT_EVENT_TYPE;
}

export function createEmptyInvitationPayload(ownerId: string): InvitationPayload {
  return {
    schemaVersion: INVITATION_SCHEMA_VERSION,
    eventType: DEFAULT_EVENT_TYPE,
    templateId: "wedding-classic",
    title: "",
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
  };
}

export function createEmptyInvitationDraft(
  ownerId: string,
  options?: {
    localId?: string;
    now?: string;
  }
): InvitationDraft {
  const payload = {
    ...createEmptyInvitationPayload(ownerId),
    title: "결혼식 초대장"
  };

  return {
    localId: options?.localId ?? createLocalId(),
    payload,
    pendingPhotos: [],
    syncStatus: "pending",
    localUpdatedAt: options?.now ?? new Date().toISOString(),
    isDirty: true
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
