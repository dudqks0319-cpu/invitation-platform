import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEmptyInvitationDraft,
  type InvitationDraft,
  type PendingPhotoUpload
} from "@invitehub/shared";

export type MobileInvitationDraft = InvitationDraft & {
  sourcePayload?: Record<string, unknown>;
};

const DRAFT_STORAGE_KEY = "invitehub:mobile:drafts";

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
    return latest;
  }

  const created = createLocalDraft(ownerId);
  drafts[created.localId] = created;
  await writeDraftMap(drafts);
  return created;
}

export async function createAndPersistDraft(ownerId: string) {
  const drafts = await readDraftMap();
  const created = createLocalDraft(ownerId);
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
