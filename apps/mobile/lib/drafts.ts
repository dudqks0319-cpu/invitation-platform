import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEmptyInvitationDraft,
  getDefaultInvitationSample,
  type InvitationDraft,
  type PendingPhotoUpload
} from "@/lib/invitation-shared";

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

function createSampleDraft(ownerId: string, localId?: string, eventType?: string): MobileInvitationDraft {
  const draft = createEmptyInvitationDraft(ownerId);
  const sample = getDefaultInvitationSample(eventType);
  return {
    ...draft,
    localId: localId ?? draft.localId,
    payload: {
      ...draft.payload,
      eventType: eventType ?? draft.payload.eventType,
      title: sample.title,
      eventDateTime: sample.eventDateTime,
      venueName: sample.venueName,
      venueAddress: sample.venueAddress,
      message: sample.message,
      eventData: {
        ...draft.payload.eventData,
        type: eventType ?? draft.payload.eventData.type,
        groom: {
          ...draft.payload.eventData.groom,
          name: sample.groomName
        },
        bride: {
          ...draft.payload.eventData.bride,
          name: sample.brideName
        }
      }
    },
    isDirty: false
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
  return Object.values(drafts).sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt));
}

export async function loadDraft(localId: string) {
  const drafts = await readDraftMap();
  return drafts[localId] ?? null;
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
    if (ownerId === PREVIEW_OWNER_ID && needsPreviewSampleReset(latest)) {
      const sample = createSampleDraft(ownerId, latest.localId, latest.payload.eventType);
      drafts[sample.localId] = sample;
      await writeDraftMap(drafts);
      return sample;
    }

    return latest;
  }

  const created = ownerId === PREVIEW_OWNER_ID ? createSampleDraft(ownerId) : createLocalDraft(ownerId);
  drafts[created.localId] = created;
  await writeDraftMap(drafts);
  return created;
}

export async function createAndPersistDraft(
  ownerId: string,
  options?: { eventType?: string; templateId?: string; title?: string }
) {
  const drafts = await readDraftMap();
  const shouldSeedSample = Boolean(options?.templateId || options?.eventType);
  const created = shouldSeedSample ? createSampleDraft(ownerId, undefined, options?.eventType) : createLocalDraft(ownerId);
  if (options?.templateId) {
    created.payload.templateId = options.templateId;
  }
  if (options?.eventType) {
    created.payload.eventType = options.eventType;
    created.payload.eventData.type = options.eventType;
  }
  if (options?.title && !shouldSeedSample) {
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
