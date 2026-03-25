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
