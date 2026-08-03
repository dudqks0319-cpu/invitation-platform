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

export class DraftStorageInspectionError extends Error {
  readonly reason: "corrupt" | "unavailable";

  constructor(reason: "corrupt" | "unavailable") {
    super(reason === "corrupt"
      ? "저장된 초안 데이터가 손상되어 안전하게 열 수 없어요."
      : "초안 저장소를 확인하지 못했어요.");
    this.name = "DraftStorageInspectionError";
    this.reason = reason;
  }
}

export function isCorruptDraftStorageError(error: unknown): error is DraftStorageInspectionError {
  return error instanceof DraftStorageInspectionError && error.reason === "corrupt";
}

type DraftMap = Record<string, MobileInvitationDraft>;
const previewDraftInFlight = new Map<string, Promise<MobileInvitationDraft>>();

function isDraftMap(value: unknown): value is DraftMap {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isInvitationParty(value: unknown) {
  return isRecord(value) && typeof value.name === "string" && isOptionalString(value.phone);
}

function isInvitationParents(value: unknown) {
  return isRecord(value) &&
    (value.father === undefined || isInvitationParty(value.father)) &&
    (value.mother === undefined || isInvitationParty(value.mother));
}

function isBankAccount(value: unknown) {
  return isRecord(value) &&
    typeof value.bank === "string" &&
    typeof value.holder === "string" &&
    typeof value.account === "string";
}

function isInvitationPayload(value: unknown) {
  if (!isRecord(value)) return false;
  const eventData = value.eventData;
  const photos = value.photos;
  const accounts = value.accounts;
  const location = value.location;
  const share = value.share;

  return (
    typeof value.schemaVersion === "number" && Number.isInteger(value.schemaVersion) && value.schemaVersion > 0 &&
    typeof value.eventType === "string" &&
    typeof value.templateId === "string" &&
    typeof value.title === "string" &&
    typeof value.eventDateTime === "string" &&
    typeof value.venueName === "string" &&
    typeof value.venueAddress === "string" &&
    typeof value.message === "string" &&
    isRecord(eventData) &&
    typeof eventData.type === "string" &&
    isInvitationParty(eventData.groom) &&
    isInvitationParty(eventData.bride) &&
    isInvitationParents(eventData.groomParents) &&
    isInvitationParents(eventData.brideParents) &&
    isRecord(photos) &&
    typeof photos.mainUri === "string" &&
    typeof photos.backgroundUri === "string" &&
    Array.isArray(photos.gallery) &&
    photos.gallery.every((item) => (
      isRecord(item) &&
      typeof item.uri === "string" &&
      Number.isInteger(item.order) &&
      Number(item.order) >= 0
    )) &&
    isRecord(accounts) &&
    (accounts.primary === undefined || isBankAccount(accounts.primary)) &&
    (accounts.secondary === undefined || isBankAccount(accounts.secondary)) &&
    typeof accounts.kakaoPayLink === "string" &&
    isRecord(location) &&
    typeof location.naverMapUrl === "string" &&
    isOptionalString(location.kakaoMapUrl) &&
    typeof location.transportNote === "string" &&
    isRecord(share) &&
    typeof share.slug === "string" &&
    typeof value.ownerId === "string" &&
    (value.planTier === "free" || value.planTier === "premium") &&
    typeof value.isPublished === "boolean"
  );
}

function isPendingPhoto(value: unknown) {
  if (!isRecord(value)) return false;
  const validSlot = value.slot === "main" || value.slot === "background" || value.slot === "gallery";
  return typeof value.localUri === "string" &&
    validSlot &&
    (value.order === undefined || (Number.isInteger(value.order) && Number(value.order) >= 0)) &&
    Number.isInteger(value.retryCount) && Number(value.retryCount) >= 0;
}

function isInspectableDraft(value: unknown): value is MobileInvitationDraft {
  if (!isRecord(value)) return false;
  return typeof value.localId === "string" && value.localId.length > 0 &&
    isOptionalString(value.serverId) &&
    isInvitationPayload(value.payload) &&
    Array.isArray(value.pendingPhotos) && value.pendingPhotos.every(isPendingPhoto) &&
    (value.syncStatus === "pending" || value.syncStatus === "synced" || value.syncStatus === "failed") &&
    typeof value.localUpdatedAt === "string" && value.localUpdatedAt.length > 0 &&
    typeof value.isDirty === "boolean" &&
    (value.sourcePayload === undefined || isRecord(value.sourcePayload));
}

function parseInspectableDraftMap(raw: string): DraftMap | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      isDraftMap(parsed) &&
      Object.entries(parsed).every(([key, draft]) => isInspectableDraft(draft) && draft.localId === key)
    ) {
      return parsed;
    }
  } catch {
    // Invalid JSON is handled as corrupt storage by the caller.
  }
  return null;
}

async function readDraftMapForPreview(): Promise<DraftMap> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    throw new DraftStorageInspectionError("unavailable");
  }
  if (!raw) return {};

  const drafts = parseInspectableDraftMap(raw);
  if (drafts) return drafts;
  throw new DraftStorageInspectionError("corrupt");
}

async function readDraftMap(): Promise<DraftMap> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    throw new DraftStorageInspectionError("unavailable");
  }
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isDraftMap(parsed)) {
      return parsed;
    }
  } catch {
    // Reads are intentionally non-mutating; recovery requires explicit consent.
  }
  throw new DraftStorageInspectionError("corrupt");
}

export async function quarantineAndResetCorruptDraftStorage() {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    throw new DraftStorageInspectionError("unavailable");
  }

  if (!raw) {
    throw new Error("초기화할 손상된 초안 데이터가 없어요.");
  }

  if (parseInspectableDraftMap(raw)) {
    throw new Error("초안 저장소가 정상이라 초기화하지 않았어요.");
  }

  const quarantineKey = `${CORRUPT_DRAFT_STORAGE_PREFIX}:${Date.now()}`;
  try {
    await AsyncStorage.setItem(quarantineKey, raw);
  } catch {
    throw new Error("손상된 초안 원본을 백업하지 못해 초기화하지 않았어요.");
  }

  try {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    throw new Error("손상된 초안 원본은 백업했지만 저장소를 초기화하지 못했어요.");
  }

  return { quarantineKey };
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

export async function listDrafts(ownerId: string) {
  const drafts = await readDraftMap();
  return Object.values(drafts)
    .filter((draft) => draft.payload.ownerId === ownerId)
    .sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt));
}

export async function inspectDraftsForTemplatePreview(ownerId: string) {
  const drafts = await readDraftMapForPreview();
  return Object.values(drafts)
    .filter((draft) => draft.payload.ownerId === ownerId && !draft.payload.isPublished)
    .sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt));
}

export async function loadDraft(localId: string, ownerId: string) {
  const drafts = await readDraftMap();
  const draft = drafts[localId];
  return draft?.payload.ownerId === ownerId ? draft : null;
}

export async function saveDraft(draft: MobileInvitationDraft) {
  const drafts = await readDraftMap();
  drafts[draft.localId] = draft;
  await writeDraftMap(drafts);
}

export async function ensureDraft(ownerId: string, localId?: string) {
  const drafts = await readDraftMap();

  if (localId && drafts[localId]?.payload.ownerId === ownerId) {
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

export async function deleteDraft(localId: string, ownerId: string) {
  const drafts = await readDraftMap();
  const draft = drafts[localId];
  if (!draft) {
    return;
  }
  if (draft.payload.ownerId !== ownerId) {
    throw new Error("본인 소유의 초안만 삭제할 수 있어요.");
  }
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
