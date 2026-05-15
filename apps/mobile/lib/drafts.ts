import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEmptyInvitationDraft,
  getDefaultInvitationSample,
  type InvitationDraft,
  type PendingPhotoUpload
} from "./invitation-shared";

export type MobileInvitationDraft = InvitationDraft & {
  sourcePayload?: Record<string, unknown>;
};

const DRAFT_STORAGE_KEY = "invitehub:mobile:drafts";
const PREVIEW_OWNER_ID = "local-preview-owner";

type DraftMap = Record<string, MobileInvitationDraft>;

async function readDraftMap(): Promise<DraftMap> {
  const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DraftMap) : {};
}

async function writeDraftMap(drafts: DraftMap) {
  await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

export function createLocalDraft(ownerId: string): MobileInvitationDraft {
  return createEmptyInvitationDraft(ownerId);
}

function clearSeededSampleValues(draft: MobileInvitationDraft): MobileInvitationDraft {
  if (draft.isDirty) {
    return draft;
  }

  const sample = getDefaultInvitationSample(draft.payload.eventType);
  const isSeededSample =
    draft.payload.title === sample.title &&
    draft.payload.eventDateTime === sample.eventDateTime &&
    draft.payload.venueName === sample.venueName &&
    draft.payload.venueAddress === sample.venueAddress &&
    draft.payload.message === sample.message &&
    draft.payload.eventData.groom.name === sample.groomName &&
    draft.payload.eventData.bride.name === sample.brideName;

  if (!isSeededSample) {
    return draft;
  }

  return {
    ...draft,
    payload: {
      ...draft.payload,
      title: "",
      eventDateTime: "",
      venueName: "",
      venueAddress: "",
      message: "",
      eventData: {
        ...draft.payload.eventData,
        groom: {
          ...draft.payload.eventData.groom,
          name: ""
        },
        bride: {
          ...draft.payload.eventData.bride,
          name: ""
        }
      }
    }
  };
}

function needsPreviewSampleReset(draft: MobileInvitationDraft) {
  const searchable = [
    draft.payload.title,
    draft.payload.eventDateTime,
    draft.payload.venueName,
    draft.payload.venueAddress,
    draft.payload.message,
    draft.payload.eventData.groom.name,
    draft.payload.eventData.bride.name
  ].join(" ");

  return (
    !draft.payload.eventData.groom.name.trim() ||
    !draft.payload.eventData.bride.name.trim() ||
    /ㅇ|ㄹ|2026-04-24T|로즈 프레임/.test(searchable)
  );
}

export async function listDrafts() {
  const drafts = await readDraftMap();
  return Object.values(drafts)
    .map(clearSeededSampleValues)
    .sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt));
}

export async function loadDraft(localId: string) {
  const drafts = await readDraftMap();
  const draft = drafts[localId] ?? null;
  if (!draft) {
    return null;
  }

  const sanitized = clearSeededSampleValues(draft);
  if (sanitized !== draft) {
    drafts[sanitized.localId] = sanitized;
    await writeDraftMap(drafts);
  }

  return sanitized;
}

export async function saveDraft(draft: MobileInvitationDraft) {
  const drafts = await readDraftMap();
  drafts[draft.localId] = draft;
  await writeDraftMap(drafts);
}

export async function ensureDraft(ownerId: string, localId?: string) {
  const drafts = await readDraftMap();

  if (localId && drafts[localId]) {
    return drafts[localId];
  }

  const latest = Object.values(drafts)
    .filter((draft) => draft.payload.ownerId === ownerId)
    .sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt))[0];

  if (latest) {
    const sanitized = clearSeededSampleValues(latest);
    if (sanitized !== latest) {
      drafts[sanitized.localId] = sanitized;
      await writeDraftMap(drafts);
      return sanitized;
    }

    if (ownerId === PREVIEW_OWNER_ID && needsPreviewSampleReset(latest)) {
      const resetDraft = createLocalDraft(ownerId);
      resetDraft.localId = latest.localId;
      resetDraft.payload.eventType = latest.payload.eventType;
      resetDraft.payload.eventData.type = latest.payload.eventType;
      resetDraft.payload.templateId = latest.payload.templateId;
      drafts[resetDraft.localId] = resetDraft;
      await writeDraftMap(drafts);
      return resetDraft;
    }

    return latest;
  }

  const created = createLocalDraft(ownerId);
  drafts[created.localId] = created;
  await writeDraftMap(drafts);
  return created;
}

export async function createAndPersistDraft(
  ownerId: string,
  options?: { eventType?: string; templateId?: string; title?: string }
) {
  const drafts = await readDraftMap();
  const created = createLocalDraft(ownerId);
  if (options?.templateId) {
    created.payload.templateId = options.templateId;
  }
  if (options?.eventType) {
    created.payload.eventType = options.eventType;
    created.payload.eventData.type = options.eventType;
  }
  if (options?.title) {
    created.payload.title = options.title;
  }
  drafts[created.localId] = created;
  await writeDraftMap(drafts);
  return created;
}

export async function deleteDraft(localId: string) {
  const drafts = await readDraftMap();
  delete drafts[localId];
  await writeDraftMap(drafts);
}

export function upsertPendingPhoto(
  pendingPhotos: PendingPhotoUpload[],
  nextPhoto: PendingPhotoUpload
) {
  const remaining = pendingPhotos.filter((photo) => {
    if (photo.slot !== nextPhoto.slot) {
      return true;
    }

    if (nextPhoto.slot !== "gallery") {
      return false;
    }

    return photo.order !== nextPhoto.order;
  });

  return [...remaining, nextPhoto];
}
