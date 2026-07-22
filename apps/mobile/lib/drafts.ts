import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEmptyInvitationDraft,
  getDefaultInvitationSample,
  type InvitationDraft,
  type PendingPhotoUpload
} from "./invitation-shared";
import { isValidTemplatePreviewIntentKey } from "./template-discovery-navigation";

export type MobileInvitationDraft = InvitationDraft & {
  sourcePayload?: Record<string, unknown>;
};

const DRAFT_STORAGE_KEY = "invitehub:mobile:drafts";
const CORRUPT_DRAFT_STORAGE_PREFIX = `${DRAFT_STORAGE_KEY}:corrupt`;
const PREVIEW_OWNER_ID = "local-preview-owner";

type DraftMap = Record<string, MobileInvitationDraft>;
const previewDraftInFlight = new Map<string, Promise<MobileInvitationDraft>>();

function isDraftMap(value: unknown): value is DraftMap {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isInspectableDraft(value: unknown): value is MobileInvitationDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Partial<MobileInvitationDraft>;
  const payload = draft.payload as Partial<MobileInvitationDraft["payload"]> | undefined;
  return Boolean(
    typeof draft.localId === "string" &&
    typeof draft.localUpdatedAt === "string" &&
    payload &&
    typeof payload.ownerId === "string" &&
    typeof payload.templateId === "string" &&
    typeof payload.isPublished === "boolean"
  );
}

async function readDraftMapForPreview(): Promise<DraftMap> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    throw new Error("초안 저장소를 확인하지 못했어요.");
  }
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      isDraftMap(parsed) &&
      Object.entries(parsed).every(([key, draft]) => isInspectableDraft(draft) && draft.localId === key)
    ) {
      return parsed;
    }
  } catch {
    // Preview inspection is strictly read-only and never quarantines corrupt data.
  }
  throw new Error("초안 저장소를 확인하지 못했어요.");
}

async function readDraftMap(): Promise<DraftMap> {
  const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isDraftMap(parsed)) {
      return parsed;
    }
  } catch {
    // A corrupted local draft cache must not prevent the app from launching.
  }

  try {
    await AsyncStorage.setItem(`${CORRUPT_DRAFT_STORAGE_PREFIX}:${Date.now()}`, raw);
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY).catch(() => undefined);
  }

  return {};
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

export async function inspectDraftsForTemplatePreview(ownerId: string) {
  const drafts = await readDraftMapForPreview();
  return Object.values(drafts)
    .filter((draft) => draft.payload.ownerId === ownerId && !draft.payload.isPublished)
    .sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt));
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

type TemplatePreviewDraftInput = {
  eventType: string;
  templateId: string;
  title: string;
  previewIntentKey: string;
};

function assertTemplatePreviewDraftInput(ownerId: string, input: TemplatePreviewDraftInput) {
  if (!ownerId || ownerId.length > 128 || /[\u0000-\u001f]/.test(ownerId)) {
    throw new Error("초안 소유자를 확인할 수 없어요.");
  }
  if (!/^[a-z0-9-]{2,80}$/.test(input.templateId) || !isValidTemplatePreviewIntentKey(input.previewIntentKey)) {
    throw new Error("미리보기 시작 정보를 확인할 수 없어요.");
  }
}

async function createOrReuseTemplatePreviewDraftInner(ownerId: string, input: TemplatePreviewDraftInput) {
  const drafts = await readDraftMapForPreview();
  const existing = Object.values(drafts).find((draft) => (
    draft.payload.ownerId === ownerId &&
    draft.payload.templateId === input.templateId &&
    draft.sourcePayload?.templatePreviewIntentKey === input.previewIntentKey
  ));
  if (existing) return existing;

  const created = createSampleDraft(ownerId, undefined, input.eventType);
  created.payload.templateId = input.templateId;
  created.payload.eventType = input.eventType;
  created.payload.eventData.type = input.eventType;
  created.sourcePayload = { templatePreviewIntentKey: input.previewIntentKey };
  drafts[created.localId] = created;
  await writeDraftMap(drafts);
  return created;
}

export function createOrReuseTemplatePreviewDraft(ownerId: string, input: TemplatePreviewDraftInput) {
  assertTemplatePreviewDraftInput(ownerId, input);
  const lockKey = `${ownerId}\u0000${input.templateId}\u0000${input.previewIntentKey}`;
  const active = previewDraftInFlight.get(lockKey);
  if (active) return active;

  const operation = createOrReuseTemplatePreviewDraftInner(ownerId, input).finally(() => {
    if (previewDraftInFlight.get(lockKey) === operation) previewDraftInFlight.delete(lockKey);
  });
  previewDraftInFlight.set(lockKey, operation);
  return operation;
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
