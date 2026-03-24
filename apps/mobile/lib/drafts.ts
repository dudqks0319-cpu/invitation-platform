import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultInvitationDraft,
  type InvitationDraftPayload
} from "../../../lib/invitation-payload";

export type DraftSyncStatus = "synced" | "pending" | "offline" | "conflict";

export type MobileInvitationDraft = {
  localId: string;
  payload: InvitationDraftPayload;
  localUpdatedAt: string;
  serverId?: string;
  serverRevision?: number;
  syncStatus: DraftSyncStatus;
};

const DRAFT_STORAGE_KEY = "invitehub:mobile:draft";

export function createLocalDraft(ownerId: string): MobileInvitationDraft {
  return {
    localId: `draft-${Date.now()}`,
    payload: defaultInvitationDraft,
    localUpdatedAt: new Date().toISOString(),
    syncStatus: "offline"
  };
}

export async function loadDraft() {
  const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as MobileInvitationDraft) : null;
}

export async function saveDraft(draft: MobileInvitationDraft) {
  await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export async function ensureDraft(ownerId: string) {
  const existing = await loadDraft();

  if (existing) {
    return existing;
  }

  const created = createLocalDraft(ownerId);
  await saveDraft(created);
  return created;
}
